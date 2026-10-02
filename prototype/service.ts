// PROTOTYPE of esm.iterate.com: serves the builds committed in an iterate GitHub repo's
// `packed/<name>/` folder (what `pnpm pack` makes, minus scripts and devDependencies).
//
//   GET /<name>?repository=<owner>/<repo>&ref=<ref>&path=<path>[&external=a,b]
//
// Every parameter but `external` is required (spelled out while the design settles; Misha,
// 2026-10-02):
//   repository  an iterate/* GitHub repo
//   ref         a commit, or a branch or tag (redirected to its commit)
//   path        `.` or `./<export>` (a key of package.json's `exports`), or `./<file>` in the package
//   external    packages to leave as bare imports (the platform's loader passes iterate,zod,…)
//
// Who asks decides what comes back: npm, pnpm, yarn and bun (by User-Agent) asking for `path=.`
// get the npm tarball, anything else the ES module. So one URL in a config's package.json is what
// `npm install` fetches and what the loader imports.
//
// A module's imports are rewritten to canonical URLs of this service: relative imports and the
// package's own subpaths at the same commit, a package also in `packed/` at the same commit, an npm
// dependency to esm.sh at the version package.json lists, and `external` packages left bare.
// Worker-shaped: web APIs only. `trace` reports each step, for the prototype's explainer.
import { init, parse } from "es-module-lexer";

const ESM_SH = "https://esm.sh";
const PACKED = "packed";
/** Whose repos it serves (Misha, 2026-10-02: `iterate/<anything>`, maybe loosened one day). */
const OWNERS = new Set(["iterate", "mmkal" /* SPIKE: the throwaway repo */]);
/** Package managers, by the User-Agent each sends with a tarball request. */
const PACKAGE_MANAGER = /^(npm|pnpm|yarn|bun)\//i;

export type Trace = (step: string, detail: Record<string, unknown>) => void;

export default {
  fetch: (request: Request) => handle(request, globalThis.fetch, () => {}),
};

/** The canonical URL of `name` at `params`: fixed parameter order, `/`, `@`, `,` and `:` unescaped,
 *  so the same module always has the same URL (a browser loads one module per URL). */
export function canonical(
  name: string,
  params: { repository: string; ref: string; path: string; external?: string },
) {
  const value = (v: string) =>
    encodeURIComponent(v)
      .replace(/%2F/g, "/")
      .replace(/%40/g, "@")
      .replace(/%2C/g, ",")
      .replace(/%3A/g, ":");
  const query = [
    `repository=${value(params.repository)}`,
    `ref=${value(params.ref)}`,
    `path=${value(params.path)}`,
  ];
  if (params.external) query.push(`external=${value(params.external)}`);
  return `/${name}?${query.join("&")}`;
}

export async function handle(
  request: Request,
  fetchFn: typeof fetch,
  trace: Trace,
): Promise<Response> {
  await init;
  const url = new URL(request.url);
  const name = decodeURIComponent(url.pathname.slice(1));
  if (!/^(@[\w.-]+\/)?[\w.-]+$/.test(name))
    return text(404, "not found: /<name>?repository=…&ref=…&path=…");
  const q = url.searchParams;
  const missing = ["repository", "ref", "path"].filter((key) => !q.get(key));
  if (missing.length)
    return text(
      400,
      `${name}: ${missing.join(", ")} required (/<name>?repository=<owner>/<repo>&ref=<ref>&path=<path>)`,
    );
  const [owner, repo] = q.get("repository")!.split("/");
  if (!owner || !repo) return text(400, "repository is <owner>/<repo>");
  if (!OWNERS.has(owner)) return text(403, `serves iterate's repos only, not ${owner}/${repo}`);
  const ref = q.get("ref")!;
  const path = q.get("path")!;
  if (!/^\.(\/[^?#]*)?$/.test(path)) return text(400, "path is `.`, `./<export>` or `./<file>`");
  const external = q.get("external") || undefined;
  const userAgent = request.headers.get("user-agent") || "";
  const tarball = path === "." && PACKAGE_MANAGER.test(userAgent);
  trace("request", {
    name,
    repository: `${owner}/${repo}`,
    ref,
    path,
    external,
    answer: tarball ? "tarball (a package manager asked)" : "module",
  });

  const gh = new GitHub(owner, repo, fetchFn, trace);
  const sha = /^[0-9a-f]{40}$/.test(ref) ? ref : await gh.resolveRef(ref);
  if (!sha) return text(404, `${owner}/${repo} has no branch or tag ${ref}`);
  const headers = {
    "access-control-allow-origin": "*",
    "x-commit-key": `${owner}:${repo}:${sha}`,
    vary: "user-agent",
  };

  if (tarball) {
    const body = await gh.packTarball(sha, `${PACKED}/${name}`);
    if (!body) return text(404, `${owner}/${repo}@${sha} has no ${PACKED}/${name}`);
    return new Response(body, {
      headers: { ...headers, "content-type": "application/gzip", "cache-control": cacheFor(ref) },
    });
  }
  // a module always lives at one URL: a moving ref or another spelling redirects to it
  const at = canonical(name, { repository: `${owner}/${repo}`, ref: sha, path, external });
  if (`${url.pathname}${url.search}` !== at) {
    trace("redirect", {
      to: at,
      why: sha !== ref ? `${ref} is ${sha.slice(0, 7)} today` : "the canonical spelling",
    });
    return new Response(null, {
      status: 302,
      headers: { ...headers, location: at, "cache-control": cacheFor(ref) },
    });
  }
  try {
    const served = await new Package(gh, sha, name, external, trace).serve(path);
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

type Manifest = {
  exports?: Record<string, string | Record<string, string>>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

/** One package at one commit: `packed/<name>/` of the repo. */
class Package {
  private gh: GitHub;
  private sha: string;
  private name: string;
  private external: string | undefined;
  private trace: Trace;
  private manifestPromise?: Promise<Manifest>;
  constructor(
    gh: GitHub,
    sha: string,
    name: string,
    external: string | undefined,
    trace: Trace,
  ) {
    this.gh = gh;
    this.sha = sha;
    this.name = name;
    this.external = external;
    this.trace = trace;
  }

  private url = (path: string, name = this.name) =>
    canonical(name, {
      repository: `${this.gh.owner}/${this.gh.repo}`,
      ref: this.sha,
      path,
      external: this.external,
    });
  private externals = () => new Set((this.external || "").split(",").filter(Boolean));

  private manifest() {
    return (this.manifestPromise ??= this.gh
      .file(this.sha, `${PACKED}/${this.name}/package.json`)
      .then((text) => {
        if (text === undefined)
          throw new NotFound(
            `${this.gh.owner}/${this.gh.repo}@${this.sha} has no ${PACKED}/${this.name}`,
          );
        return JSON.parse(text) as Manifest;
      }));
  }

  /** `path` as served: an export of a module is a stub re-exporting its file's URL (one module per
   *  file, whichever entry reaches it), a module file is its code with every import rewritten, and
   *  anything else (a stylesheet) is the file as built. */
  async serve(path: string): Promise<{ body: string; type: string }> {
    const js = "application/javascript; charset=utf-8";
    const exported = (await this.manifest()).exports?.[path];
    if (exported !== undefined) {
      const file = typeof exported === "string" ? exported : exported.import || exported.default;
      if (!file) throw new NotFound(`${this.name}'s export ${path} names no file`);
      this.trace("export", { path, file });
      if (!/\.m?js$/.test(file)) return this.asset(file);
      const target = JSON.stringify(this.url(file));
      const hasDefault = parse(await this.file(file))[1].some((e) => e.n === "default");
      const body = `export * from ${target};${hasDefault ? ` export { default } from ${target};` : ""}\n`;
      return { body, type: js };
    }
    if (/\.m?js$/.test(path)) return { body: await this.rewrite(path, await this.file(path)), type: js };
    if (path.endsWith(".css")) return this.asset(path);
    throw new NotFound(`${this.name} has no export or file ${path}`);
  }

  private async asset(path: string) {
    return { body: await this.file(path), type: "text/css; charset=utf-8" };
  }

  private async file(path: string) {
    const code = await this.gh.file(
      this.sha,
      `${PACKED}/${this.name}/${path.replace(/^\.\//, "")}`,
    );
    if (code === undefined) throw new NotFound(`${this.name}@${this.sha} has no ${path}`);
    return code;
  }

  private async rewrite(path: string, code: string) {
    const edits: { start: number; end: number; dynamic: boolean; from: string; to: string }[] = [];
    for (const imp of parse(code)[0]) {
      if (imp.d === -2 || !imp.n) continue;
      const to = await this.target(path, imp.n);
      edits.push({ start: imp.s, end: imp.e, dynamic: imp.d > -1, from: imp.n, to });
    }
    this.trace("rewrite", {
      file: path,
      imports: edits.map((e) => `${e.dynamic ? "import()" : "import"} ${e.from} → ${e.to}`),
    });
    let out = code;
    for (const edit of edits.sort((a, b) => b.start - a.start))
      out =
        out.slice(0, edit.start) +
        (edit.dynamic ? JSON.stringify(edit.to) : edit.to) +
        out.slice(edit.end);
    return out;
  }

  /** Where `specifier`, imported by the package's file `from`, loads from. */
  private async target(from: string, specifier: string): Promise<string> {
    if (/^(cloudflare|node):/.test(specifier)) return specifier;
    if (specifier.startsWith("./") || specifier.startsWith("../"))
      return this.url(`.${new URL(specifier, `file:///${from.replace(/^\.\//, "")}`).pathname}`);
    const dependency = packageName(specifier);
    const sub = specifier.slice(dependency.length);
    if (this.externals().has(dependency) || this.externals().has(specifier)) return specifier;
    if (dependency === this.name) return this.url(`.${sub}`);
    const manifest = await this.manifest();
    const version = manifest.dependencies?.[dependency] || manifest.peerDependencies?.[dependency];
    if (!version)
      throw new Error(`${this.name}/${from} imports ${specifier}, which package.json doesn't list`);
    // a package built into the same repo comes from the same commit
    if (await this.gh.file(this.sha, `${PACKED}/${dependency}/package.json`))
      return this.url(`.${sub}`, dependency);
    const esm = new URLSearchParams({ target: "es2022" });
    if (this.external) esm.set("external", this.external);
    return `${ESM_SH}/${dependency}@${version}${sub}?${esm}`;
  }
}

/** What has been read from GitHub, by `<owner>/<repo>/<sha>/<path>`: immutable, so kept. */
const files = new Map<string, Promise<string | undefined>>();
/** Forgets everything read (the prototype's "cold load"). */
export const forget = () => files.clear();

/** A public GitHub repository, read anonymously: refs over git's smart HTTP (no API rate limit),
 *  files from raw.githubusercontent.com, whole commits from codeload. The real service would keep
 *  what it reads at a commit (immutable) in R2 or the Cache API; this keeps it in memory. */
class GitHub {
  owner: string;
  repo: string;
  private fetchFn: typeof fetch;
  private trace: Trace;
  constructor(owner: string, repo: string, fetchFn: typeof fetch, trace: Trace) {
    this.owner = owner;
    this.repo = repo;
    this.fetchFn = fetchFn;
    this.trace = trace;
  }

  async resolveRef(ref: string): Promise<string | undefined> {
    const started = Date.now();
    const url = `https://github.com/${this.owner}/${this.repo}.git/info/refs?service=git-upload-pack`;
    const response = await this.fetchFn(url);
    if (!response.ok) return undefined;
    const refs = await response.text();
    // pkt-lines: `<4 hex length><40 hex sha> <ref>`, the first with `\0<capabilities>` after it
    for (const name of [`refs/heads/${ref}`, `refs/tags/${ref}^{}`, `refs/tags/${ref}`]) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const sha = refs.match(new RegExp(`([0-9a-f]{40}) ${escaped}(?:\0|\n|$)`))?.[1];
      if (sha) {
        this.trace("github", { read: `${name} is ${sha.slice(0, 7)}`, url, ms: Date.now() - started });
        return sha;
      }
    }
    return undefined;
  }

  file(sha: string, path: string) {
    const key = `${this.owner}/${this.repo}/${sha}/${path}`;
    const url = `https://raw.githubusercontent.com/${key}`;
    const cached = files.get(key);
    if (cached) {
      this.trace("github", { read: path, cache: "hit (read at this commit before)" });
      return cached;
    }
    const started = Date.now();
    const reading = this.fetchFn(url).then(async (r) => {
      this.trace("github", { read: path, url, status: r.status, ms: Date.now() - started });
      if (r.status === 404) return undefined;
      if (!r.ok) throw new Error(`raw.githubusercontent.com answered ${r.status} for ${key}`);
      return r.text();
    });
    files.set(key, reading);
    return reading;
  }

  /** `folder` of the repo at `sha` as an npm tarball: codeload's tarball of the commit, cut down to
   *  that folder and re-rooted at `package/`, as npm packs one. */
  async packTarball(sha: string, folder: string) {
    const started = Date.now();
    const url = `https://codeload.github.com/${this.owner}/${this.repo}/tar.gz/${sha}`;
    const response = await this.fetchFn(url);
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
    this.trace("github", {
      read: `the commit's tarball: ${files.length} files under ${folder}/`,
      url,
      ms: Date.now() - started,
    });
    if (!files.some((f) => f.path === "package/package.json")) return undefined;
    return new Response(writeTar(files)).body!.pipeThrough(new CompressionStream("gzip"));
  }
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
    const kind = type === "0" || type === "\0" ? ("file" as const) : ("other" as const);
    yield { path, type: kind, data };
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
