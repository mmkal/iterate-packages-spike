// PROTOTYPE of esm.iterate.com: serves packages built into a public GitHub repo's `packed/<name>/`
// folder (what `pnpm pack` makes, minus scripts and devDependencies), for three consumers:
//
//   GET /<owner>/<repo>/<name>@<ref>                  to npm, pnpm, yarn or bun: the npm tarball, as
//                                                     pkg.pr.new serves the same path
//   GET /<owner>/<repo>/<name>@<ref>[/<subpath>]?…    to anything else: an ES module (browsers, the
//                                                     loader), as esm.sh serves a /pr/ path
//
// so one URL, written once in a config's package.json, is what `npm install` fetches and what the
// loader (and a page) imports.
//
// A module's imports are rewritten as esm.sh rewrites them: relative ones and the package's own
// subpaths to this service at the same commit, a package from the same repo at the same commit, an
// npm dependency to esm.sh at the version package.json lists, and the `external` packages left bare
// (the platform's loader binds `iterate` and `zod` itself). A branch or tag redirects to its commit,
// so every module URL names one build forever. Worker-shaped: web APIs only.
import { init, parse } from "es-module-lexer";

const ESM_SH = "https://esm.sh";
const PACKED = "packed";
/** Whose repos it serves (Misha, 2026-10-02: `iterate/<anything>`, maybe loosened one day). */
const OWNERS = new Set(["iterate", "mmkal" /* SPIKE: the throwaway repo */]);

export default {
  fetch: (request: Request) => handle(request, globalThis.fetch),
};

const route = /^\/([\w.-]+)\/([\w.-]+)\/((?:@[\w.-]+\/)?[\w.-]+)@([\w.-]+)(?:\/([^?]*))?$/;
/** Package managers, by the User-Agent each sends with a tarball request. */
const packageManager = /^(npm|pnpm|yarn|bun)\//i;

export async function handle(request: Request, fetchFn: typeof fetch): Promise<Response> {
  await init;
  const url = new URL(request.url);
  const match = url.pathname.match(route);
  if (!match) return text(404, "not found: /<owner>/<repo>/<name>@<ref>[/<subpath>]");
  const [, owner, repo, name, ref, subpath = ""] = match as unknown as string[];
  const tgz = !subpath && packageManager.test(request.headers.get("user-agent") || "");
  if (!OWNERS.has(owner!)) return text(403, `serves iterate's repos only, not ${owner}/${repo}`);
  const gh = new GitHub(owner!, repo!, fetchFn);
  const sha = /^[0-9a-f]{40}$/.test(ref!) ? ref! : await gh.resolveRef(ref!);
  if (!sha) return text(404, `${owner}/${repo} has no branch or tag ${ref}`);
  const headers = {
    "access-control-allow-origin": "*",
    "x-commit-key": `${owner}:${repo}:${sha}`,
    vary: "user-agent",
  };
  if (tgz) {
    const tarball = await gh.packTarball(sha, `${PACKED}/${name}`);
    if (!tarball) return text(404, `${owner}/${repo}@${sha} has no ${PACKED}/${name}`);
    return new Response(tarball, {
      headers: { ...headers, "content-type": "application/gzip", "cache-control": cacheFor(ref!) },
    });
  }
  if (sha !== ref) {
    // modules always live at a commit: a moving ref redirects, briefly cached
    const to = new URL(url);
    to.pathname = url.pathname.replace(`${name}@${ref}`, `${name}@${sha}`);
    return new Response(null, {
      status: 302,
      headers: { ...headers, location: to.href, "cache-control": "public, max-age=60" },
    });
  }
  const pkg = new Package(gh, sha, name!, url.searchParams);
  try {
    const served = await pkg.serve(subpath);
    return new Response(served.body, {
      headers: {
        ...headers,
        "content-type": served.type,
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return text(error instanceof NotFound ? 404 : 500, String((error as Error).message));
  }
}

class NotFound extends Error {}

const text = (status: number, body: string) =>
  new Response(body + "\n", {
    status,
    headers: { "content-type": "text/plain", "access-control-allow-origin": "*" },
  });
const cacheFor = (ref: string) =>
  /^[0-9a-f]{40}$/.test(ref) ? "public, max-age=31536000, immutable" : "public, max-age=60";

const packageName = (specifier: string) =>
  specifier
    .split("/")
    .slice(0, specifier.startsWith("@") ? 2 : 1)
    .join("/");

/** One package at one commit: `packed/<name>/` of the repo. */
class Package {
  private gh: GitHub;
  private sha: string;
  private name: string;
  private query: URLSearchParams;
  constructor(gh: GitHub, sha: string, name: string, query: URLSearchParams) {
    this.gh = gh;
    this.sha = sha;
    this.name = name;
    this.query = query;
  }

  private base = (name = this.name) => `/${this.gh.owner}/${this.gh.repo}/${name}@${this.sha}`;
  private suffix = () => (this.query.size ? `?${this.query}` : "");
  private externals = () => new Set((this.query.get("external") || "").split(",").filter(Boolean));

  private manifest = once(async () => {
    const text = await this.gh.file(this.sha, `${PACKED}/${this.name}/package.json`);
    if (text === undefined)
      throw new NotFound(`${this.gh.owner}/${this.gh.repo}@${this.sha} has no ${PACKED}/${this.name}`);
    return JSON.parse(text) as {
      exports?: Record<string, string | Record<string, string>>;
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };
  });

  /** An export's file (`./install` → `dist/install.mjs`), or undefined when it isn't an export. */
  private async exportFile(subpath: string) {
    const target = (await this.manifest()).exports?.[subpath ? `./${subpath}` : "."];
    const file = typeof target === "string" ? target : target?.import || target?.default;
    return file?.replace(/^\.\//, "");
  }

  /** `subpath` as served: an export of a module is a stub re-exporting its file's URL (one module
   *  per file, whichever entry reaches it), a module file is its code with every import rewritten,
   *  and anything else (a stylesheet) is the file as built. */
  async serve(subpath: string): Promise<{ body: string; type: string }> {
    const entry = await this.exportFile(subpath);
    const file = entry || subpath;
    if (/\.css$/.test(file)) return { body: await this.file(file), type: "text/css; charset=utf-8" };
    const js = "application/javascript; charset=utf-8";
    return { body: await this.module(subpath, entry), type: js };
  }

  private async module(subpath: string, entry: string | undefined): Promise<string> {
    if (entry !== undefined || subpath === "") {
      if (!entry) throw new NotFound(`${this.name} has no "." export`);
      const target = JSON.stringify(`${this.base()}/${entry}${this.suffix()}`);
      const code = await this.file(entry);
      const hasDefault = parse(code)[1].some((e) => e.n === "default");
      return `export * from ${target};${hasDefault ? ` export { default } from ${target};` : ""}\n`;
    }
    if (!/\.m?js$/.test(subpath)) throw new NotFound(`${this.name} has no export ./${subpath}`);
    return this.rewrite(subpath, await this.file(subpath));
  }

  private async file(path: string) {
    const code = await this.gh.file(this.sha, `${PACKED}/${this.name}/${path}`);
    if (code === undefined) throw new NotFound(`${this.name}@${this.sha} has no ${path}`);
    return code;
  }

  private async rewrite(path: string, code: string) {
    const edits: { start: number; end: number; dynamic: boolean; to: string }[] = [];
    for (const imp of parse(code)[0]) {
      if (imp.d === -2 || !imp.n) continue;
      edits.push({ start: imp.s, end: imp.e, dynamic: imp.d > -1, to: await this.target(path, imp.n) });
    }
    let out = code;
    for (const edit of edits.sort((a, b) => b.start - a.start))
      out =
        out.slice(0, edit.start) +
        (edit.dynamic ? JSON.stringify(edit.to) : edit.to) +
        out.slice(edit.end);
    return out;
  }

  /** Where `specifier`, imported by `from`, loads from. */
  private async target(from: string, specifier: string): Promise<string> {
    if (/^(cloudflare|node):/.test(specifier)) return specifier;
    if (specifier.startsWith("./") || specifier.startsWith("../")) {
      const path = new URL(specifier, `file:///${from}`).pathname.slice(1);
      return `${this.base()}/${path}${this.suffix()}`;
    }
    const dependency = packageName(specifier);
    const sub = specifier.slice(dependency.length);
    if (this.externals().has(dependency) || this.externals().has(specifier)) return specifier;
    if (dependency === this.name) return `${this.base()}${sub}${this.suffix()}`;
    const manifest = await this.manifest();
    const version = manifest.dependencies?.[dependency] || manifest.peerDependencies?.[dependency];
    if (!version) throw new Error(`${this.name}/${from} imports ${specifier}, which package.json doesn't list`);
    // a package built into the same repo comes from the same commit
    if (await this.gh.file(this.sha, `${PACKED}/${dependency}/package.json`))
      return `${this.base(dependency)}${sub}${this.suffix()}`;
    const esm = new URLSearchParams({ target: this.query.get("target") || "es2022" });
    // the package's other dependencies at the exact versions it was built with, so esm.sh builds
    // every package in the graph against the same React, the same @codemirror/state, …
    // (one `deps` for every URL: esm.sh writes it into each build's path, so a package reached
    // through two different lists would be two modules — two Reacts)
    const pinned = Object.entries(manifest.dependencies || {}).filter(([, v]) =>
      /^\d+\.\d+\.\d+(-[\w.]+)?$/.test(v),
    );
    if (pinned.length) esm.set("deps", pinned.map(([name, v]) => `${name}@${v}`).join(","));
    if (this.externals().size) esm.set("external", [...this.externals()].join(","));
    return `${ESM_SH}/${dependency}@${version}${sub}?${esm}`;
  }
}

/** A public GitHub repository, read anonymously: refs over git's smart HTTP (no API rate limit),
 *  files from raw.githubusercontent.com, whole commits from codeload. The real service would keep
 *  what it reads at a commit (immutable) in R2 or the Cache API; this keeps it in memory. */
class GitHub {
  owner: string;
  repo: string;
  private fetchFn: typeof fetch;
  constructor(owner: string, repo: string, fetchFn: typeof fetch) {
    this.owner = owner;
    this.repo = repo;
    this.fetchFn = fetchFn;
  }
  private static files = new Map<string, Promise<string | undefined>>();

  async resolveRef(ref: string): Promise<string | undefined> {
    const response = await this.fetchFn(
      `https://github.com/${this.owner}/${this.repo}.git/info/refs?service=git-upload-pack`,
    );
    if (!response.ok) return undefined;
    const refs = await response.text();
    // pkt-lines: `<4 hex length><40 hex sha> <ref>`, the first with `\0<capabilities>` after it
    for (const name of [`refs/heads/${ref}`, `refs/tags/${ref}^{}`, `refs/tags/${ref}`]) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const sha = refs.match(new RegExp(`([0-9a-f]{40}) ${escaped}(?:\0|\n|$)`))?.[1];
      if (sha) return sha;
    }
    return undefined;
  }

  file(sha: string, path: string) {
    const key = `${this.owner}/${this.repo}/${sha}/${path}`;
    if (!GitHub.files.has(key))
      GitHub.files.set(
        key,
        this.fetchFn(`https://raw.githubusercontent.com/${key}`).then(async (r) => {
          if (r.status === 404) return undefined;
          if (!r.ok) throw new Error(`raw.githubusercontent.com answered ${r.status} for ${key}`);
          return r.text();
        }),
      );
    return GitHub.files.get(key)!;
  }

  /** `folder` of the repo at `sha` as an npm tarball: codeload's tarball of the commit, cut down to
   *  that folder and re-rooted at `package/`, as npm packs one. */
  async packTarball(sha: string, folder: string) {
    const response = await this.fetchFn(
      `https://codeload.github.com/${this.owner}/${this.repo}/tar.gz/${sha}`,
    );
    if (!response.ok) throw new Error(`codeload answered ${response.status}`);
    const tar = new Uint8Array(
      await new Response(response.body!.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer(),
    );
    const files: { path: string; data: Uint8Array }[] = [];
    for (const entry of readTar(tar)) {
      // codeload's paths start `<repo>-<sha>/`
      const path = entry.path.slice(entry.path.indexOf("/") + 1);
      if (entry.type === "file" && path.startsWith(`${folder}/`))
        files.push({ path: `package/${path.slice(folder.length + 1)}`, data: entry.data });
    }
    if (!files.some((f) => f.path === "package/package.json")) return undefined;
    return new Response(writeTar(files)).body!.pipeThrough(new CompressionStream("gzip"));
  }
}

function once<T>(make: () => Promise<T>) {
  let value: Promise<T> | undefined;
  return () => (value ??= make());
}

const decoder = new TextDecoder();
const field = (block: Uint8Array, start: number, length: number) =>
  decoder.decode(block.subarray(start, start + length)).replace(/\0.*$/s, "");

function* readTar(tar: Uint8Array) {
  let offset = 0;
  let longPath: string | undefined;
  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((b) => b === 0)) break;
    const size = parseInt(field(header, 124, 12).trim() || "0", 8);
    const type = String.fromCharCode(header[156]!);
    const data = tar.subarray(offset + 512, offset + 512 + size);
    offset += 512 + Math.ceil(size / 512) * 512;
    if (type === "x") {
      longPath = decoder.decode(data).match(/\d+ path=([^\n]*)\n/)?.[1];
      continue;
    }
    if (type === "g") continue;
    const prefix = field(header, 345, 155);
    const path = longPath || (prefix ? `${prefix}/` : "") + field(header, 0, 100);
    longPath = undefined;
    yield { path, type: type === "0" || type === "\0" ? ("file" as const) : ("other" as const), data };
  }
}

function writeTar(files: { path: string; data: Uint8Array }[]) {
  const encoder = new TextEncoder();
  const blocks: Uint8Array[] = [];
  for (const file of files) {
    const header = new Uint8Array(512);
    const put = (start: number, value: string) => header.set(encoder.encode(value), start);
    let name = file.path;
    let prefix = "";
    if (name.length > 100) {
      const cut = name.lastIndexOf("/", 155);
      prefix = name.slice(0, cut);
      name = name.slice(cut + 1);
    }
    put(0, name);
    put(100, "0000644\0");
    put(108, "0000000\0");
    put(116, "0000000\0");
    put(124, file.data.length.toString(8).padStart(11, "0") + "\0");
    put(136, "00000000000\0");
    put(148, "        ");
    put(156, "0");
    put(257, "ustar\0");
    put(263, "00");
    put(345, prefix);
    const checksum = header.reduce((sum, b) => sum + b, 0);
    put(148, checksum.toString(8).padStart(6, "0") + "\0 ");
    blocks.push(header, file.data, new Uint8Array((512 - (file.data.length % 512)) % 512));
  }
  blocks.push(new Uint8Array(1024));
  const out = new Uint8Array(blocks.reduce((n, b) => n + b.length, 0));
  let offset = 0;
  for (const block of blocks) out.set(block, (offset += block.length) - block.length);
  return out;
}
