// PROTOTYPE of esm.iterate.com: serves packages from GitHub repos (iterate's own builds, committed in
// iterate/packages' `packed/<name>/`) as ES modules and npm tarballs, at addresses that are pnpm
// dependency specifiers (specifier.ts has the grammar and its tests):
//
//   GET /<name>@<encodeURIComponent(specifier)>[/<subpath>][?external=a,b]
//
// e.g. /@iterate-com/ui@github%3Aiterate%2Fpackages%23main%26path%3Apacked%2F%40iterate-com%2Fui/page
//      (github:iterate/packages#main&path:packed/@iterate-com/ui, its `./page` export)
//
// Who asks decides what comes back: npm, pnpm, yarn and bun (by User-Agent) asking for a package
// (no subpath) get its npm tarball, anything else the ES module. So one URL in a config's
// package.json is what `npm install` fetches and what the loader imports.
//
// A github: specifier is served from the repo at a commit: a branch or tag redirects to its commit,
// another spelling to the canonical one (formatAddress), so every module has one URL. A module's
// imports are rewritten to canonical URLs: relative imports and the package's own subpaths at the
// same commit, a package built beside it (`packed/<other>`) at the same commit, an npm dependency
// to esm.sh at the version package.json lists, and `external` packages left bare. An npm specifier
// redirects to esm.sh. Worker-shaped: web APIs only. `trace` reports each step, for the explainer.
import { init, parse } from "es-module-lexer";
import { formatAddress, formatSpecifier, parseAddress, type Address } from "./specifier.ts";

const ESM_SH = "https://esm.sh";
/** Whose repos it serves (Misha, 2026-10-02: `iterate/<anything>`, maybe loosened one day). */
const OWNERS = new Set(["iterate", "mmkal" /* SPIKE: the throwaway repo */]);
/** Package managers, by the User-Agent each sends with a tarball request. */
const PACKAGE_MANAGER = /^(npm|pnpm|yarn|bun)\//i;

export type Trace = (step: string, detail: Record<string, unknown>) => void;

export default {
  fetch: (request: Request) => handle(request, globalThis.fetch, () => {}),
};

export async function handle(
  request: Request,
  fetchFn: typeof fetch,
  trace: Trace,
): Promise<Response> {
  await init;
  const url = new URL(request.url);
  const address = parseAddress(url.pathname, url.search);
  if ("error" in address) return text(address.error.startsWith("not found") ? 404 : 400, address.error);
  const { name, specifier, subpath, external } = address;
  const tarball = !subpath && PACKAGE_MANAGER.test(request.headers.get("user-agent") || "");
  trace("request", {
    name,
    specifier: formatSpecifier(specifier),
    subpath: subpath || ".",
    external,
    answer: tarball ? "tarball (a package manager asked)" : "module",
  });

  if (specifier.kind === "npm") {
    if (tarball)
      return text(400, `${name}: list ${formatSpecifier(specifier)} in package.json itself; npm serves it`);
    const at = `${ESM_SH}/${specifier.package || name}@${specifier.range}${subpath ? `/${subpath}` : ""}${external ? `?external=${external}` : ""}`;
    trace("redirect", { to: at, why: "an npm specifier: esm.sh builds it" });
    return new Response(null, { status: 302, headers: { location: at, "access-control-allow-origin": "*" } });
  }

  const { owner, repo, ref, path: folder = "" } = specifier;
  if (!OWNERS.has(owner)) return text(403, `serves iterate's repos only, not ${owner}/${repo}`);
  const gh = new GitHub(owner, repo, fetchFn, trace);
  const sha = ref && /^[0-9a-f]{40}$/.test(ref) ? ref : await gh.resolveRef(ref || "HEAD");
  if (!sha) return text(404, `${owner}/${repo} has no branch or tag ${ref || "HEAD"}`);
  const headers = {
    "access-control-allow-origin": "*",
    "x-commit-key": `${owner}:${repo}:${sha}`,
    vary: "user-agent",
  };
  const pinned = ref === sha;

  if (tarball) {
    const body = await gh.packTarball(sha, folder);
    if (!body) return text(404, `${owner}/${repo}@${sha} has no package.json in ${folder || "its root"}`);
    return new Response(body, {
      headers: { ...headers, "content-type": "application/gzip", "cache-control": cacheFor(pinned) },
    });
  }
  // a module always lives at one URL: a moving ref or another spelling redirects to it
  const at = formatAddress({ ...address, specifier: { ...specifier, ref: sha } });
  if (`${url.pathname}${url.search}` !== at) {
    trace("redirect", {
      to: at,
      why: pinned ? "the canonical spelling" : `${ref || "the default branch"} is ${sha.slice(0, 7)} today`,
    });
    return new Response(null, {
      status: 302,
      headers: { ...headers, location: at, "cache-control": cacheFor(pinned) },
    });
  }
  try {
    const served = await new Package(gh, sha, folder, address, trace).serve(subpath);
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
const cacheFor = (pinned: boolean) =>
  pinned ? "public, max-age=31536000, immutable" : "public, max-age=60";
const packageName = (specifier: string) =>
  specifier
    .split("/")
    .slice(0, specifier.startsWith("@") ? 2 : 1)
    .join("/");

type Manifest = {
  name?: string;
  exports?: Record<string, string | Record<string, string>>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

/** One package at one commit: the folder `path:` names (the repo's root without one). */
class Package {
  private gh: GitHub;
  private sha: string;
  private folder: string;
  private address: Address;
  private trace: Trace;
  private manifestPromise?: Promise<Manifest>;
  constructor(gh: GitHub, sha: string, folder: string, address: Address, trace: Trace) {
    this.gh = gh;
    this.sha = sha;
    this.folder = folder;
    this.address = address;
    this.trace = trace;
  }

  /** The canonical URL of `subpath` of this package, or of the package `name` built beside it. */
  private url(subpath: string, name = this.address.name, folder = this.folder) {
    const { owner, repo } = this.gh;
    return formatAddress({
      name,
      specifier: { kind: "github", owner, repo, ref: this.sha, ...(folder ? { path: folder } : {}) },
      subpath,
      external: this.address.external,
    });
  }
  private externals = () => new Set((this.address.external || "").split(",").filter(Boolean));
  private inFolder = (file: string) => (this.folder ? `${this.folder}/${file}` : file);

  private manifest() {
    return (this.manifestPromise ??= this.gh.file(this.sha, this.inFolder("package.json")).then((text) => {
      const where = `${this.gh.owner}/${this.gh.repo}@${this.sha.slice(0, 7)} ${this.folder || "(root)"}`;
      if (text === undefined) throw new NotFound(`${where} has no package.json`);
      const manifest = JSON.parse(text) as Manifest;
      if (manifest.name !== this.address.name)
        throw new NotFound(`${where} is ${manifest.name}, not ${this.address.name}`);
      return manifest;
    }));
  }

  /** `subpath` as served: an export of a module is a stub re-exporting its file's URL (one module
   *  per file, whichever entry reaches it), a module file is its code with every import rewritten,
   *  and anything else (a stylesheet) is the file as built. */
  async serve(subpath: string): Promise<{ body: string; type: string }> {
    const js = "application/javascript; charset=utf-8";
    const key = subpath ? `./${subpath}` : ".";
    const exported = (await this.manifest()).exports?.[key];
    if (exported !== undefined) {
      const target = typeof exported === "string" ? exported : exported.import || exported.default;
      if (!target) throw new NotFound(`${this.address.name}'s export ${key} names no file`);
      const file = target.replace(/^\.\//, "");
      this.trace("export", { path: key, file });
      if (!/\.m?js$/.test(file)) return this.asset(file);
      const at = JSON.stringify(this.url(file));
      const hasDefault = parse(await this.file(file))[1].some((e) => e.n === "default");
      return { body: `export * from ${at};${hasDefault ? ` export { default } from ${at};` : ""}\n`, type: js };
    }
    if (/\.m?js$/.test(subpath)) return { body: await this.rewrite(subpath, await this.file(subpath)), type: js };
    if (subpath.endsWith(".css")) return this.asset(subpath);
    throw new NotFound(`${this.address.name} has no export ${key} or file ${subpath}`);
  }

  private async asset(file: string) {
    return { body: await this.file(file), type: "text/css; charset=utf-8" };
  }

  private async file(file: string) {
    const code = await this.gh.file(this.sha, this.inFolder(file));
    if (code === undefined) throw new NotFound(`${this.address.name}@${this.sha.slice(0, 7)} has no ${file}`);
    return code;
  }

  private async rewrite(file: string, code: string) {
    const edits: { start: number; end: number; dynamic: boolean; from: string; to: string }[] = [];
    for (const imp of parse(code)[0]) {
      if (imp.d === -2 || !imp.n) continue;
      const to = await this.target(file, imp.n);
      edits.push({ start: imp.s, end: imp.e, dynamic: imp.d > -1, from: imp.n, to });
    }
    this.trace("rewrite", {
      file,
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
      return this.url(new URL(specifier, `file:///${from}`).pathname.slice(1));
    const dependency = packageName(specifier);
    const sub = specifier.slice(dependency.length + 1);
    if (this.externals().has(dependency) || this.externals().has(specifier)) return specifier;
    if (dependency === this.address.name) return this.url(sub);
    const manifest = await this.manifest();
    const version = manifest.dependencies?.[dependency] || manifest.peerDependencies?.[dependency];
    if (!version)
      throw new Error(`${this.address.name}/${from} imports ${specifier}, which package.json doesn't list`);
    // a package built beside this one (`packed/<name>` next to `packed/<other>`) is the same commit's
    const { name } = this.address;
    if (this.folder.endsWith(name)) {
      const beside = `${this.folder.slice(0, -name.length)}${dependency}`;
      if (await this.gh.file(this.sha, `${beside}/package.json`)) return this.url(sub, dependency, beside);
    }
    const esm = new URLSearchParams({ target: "es2022" });
    if (this.address.external) esm.set("external", this.address.external);
    return `${ESM_SH}/${dependency}@${version}${sub ? `/${sub}` : ""}?${esm}`;
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
    const names = ref === "HEAD" ? ["HEAD"] : [`refs/heads/${ref}`, `refs/tags/${ref}^{}`, `refs/tags/${ref}`];
    for (const name of names) {
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
      const prefix = folder ? `${folder}/` : "";
      if (entry.type === "file" && path.startsWith(prefix))
        files.push({ path: `package/${path.slice(prefix.length)}`, data: entry.data });
    }
    this.trace("github", {
      read: `the commit's tarball: ${files.length} files under ${folder || "the root"}/`,
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
