// specifier.ts — esm.iterate.com's URL grammar, and the pnpm dependency specifiers it accepts. Pure:
// no I/O, so every rule is a table test (specifier.test.ts).
//
//   /<name>@<encodeURIComponent(specifier)>[/<subpath>][?external=a,b]
//
// A URL is one package.json dependency (`"<name>": "<specifier>"`) plus the module wanted from it:
//   name       a package name: one segment, or two when scoped (`@iterate-com/ui`)
//   specifier  pnpm's own syntax (https://pnpm.io/cli/add), written as ONE path segment by
//              encodeURIComponent, so its `/`, `#`, `?` and `%` can't be read as the URL's own
//   subpath    a key of the package's `exports` (`components/context-view` is
//              `./components/context-view`), or a file in the package; none is the `.` export
//   external   packages to leave as bare imports (the platform's loader passes iterate,zod,…)
//
// The specifiers accepted, a subset of pnpm's; anything else is refused by name:
//   1.2.3, ^1.2.3, ~1.2.3, latest      npm: a version, a range or a dist-tag
//   npm:react@19.3.0                   npm: an alias of another package
//   github:<owner>/<repo>              a GitHub repo's default branch, at its root
//   github:<owner>/<repo>#<ref>        at a commit, branch or tag
//   github:<owner>/<repo>#<ref>&path:<folder>   the package in a folder of the repo

export type Specifier =
  | { kind: "npm"; package?: string; range: string }
  | { kind: "github"; owner: string; repo: string; ref?: string; path?: string };

export type Address = {
  name: string;
  specifier: Specifier;
  /** The export or file wanted, `""` for the package's `.` export. */
  subpath: string;
  external?: string;
};

type Refused = { error: string };

const NAME = /^(?:@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*$/i;
/** GitHub's own rules for owner and repository names. */
const GITHUB_OWNER = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
const GITHUB_REPO = /^[\w.-]+$/;

/** A pnpm dependency specifier, parsed; refused when it is outside the supported subset. */
export function parseSpecifier(text: string): Specifier | Refused {
  if (text === "" || text === "." || text === "..")
    return { error: `${JSON.stringify(text)} is not a specifier` };
  if (text.startsWith("npm:")) {
    const alias = text.slice(4).match(/^((?:@[^/@]+\/)?[^/@]+)(?:@(.+))?$/);
    if (!alias || !NAME.test(alias[1]!))
      return { error: `${text}: an alias is npm:<package>@<version>` };
    return { kind: "npm", package: alias[1], range: alias[2] || "latest" };
  }
  if (text.startsWith("github:")) {
    const [repository, fragment] = splitOnce(text.slice(7), "#");
    const [owner, repo, ...extra] = repository.split("/");
    if (!owner || !repo || extra.length || !GITHUB_OWNER.test(owner) || !GITHUB_REPO.test(repo))
      return { error: `${text}: a GitHub specifier is github:<owner>/<repo>` };
    const specifier: Specifier = { kind: "github", owner, repo };
    // pnpm's fragment: `&`-separated parts, a commit-ish and `path:<folder>` (and `semver:<range>`)
    for (const part of fragment === undefined ? [] : fragment.split("&")) {
      if (part.startsWith("path:")) {
        const path = part.slice(5).replace(/^\/+|\/+$/g, "");
        if (!path || path.split("/").some((segment) => segment === "" || segment === "." || segment === ".."))
          return { error: `${text}: path:${part.slice(5)} is not a folder of the repo` };
        specifier.path = path;
      } else if (part.startsWith("semver:")) {
        return { error: `${text}: semver: ranges of tags aren't supported; name the tag or commit` };
      } else if (part) {
        if (specifier.ref) return { error: `${text}: names two refs` };
        specifier.ref = part;
      }
    }
    return specifier;
  }
  if (/^[a-z][\w+.-]*:/i.test(text))
    return { error: `${text}: ${text.split(":")[0]}: specifiers aren't supported (npm versions, npm:, github: are)` };
  if (text.includes("/"))
    return { error: `${text}: write a GitHub repo as github:<owner>/<repo>` };
  return { kind: "npm", range: text };
}

/** A specifier as pnpm writes it, in one fixed form: the ref before the path. */
export function formatSpecifier(specifier: Specifier): string {
  if (specifier.kind === "npm")
    return specifier.package ? `npm:${specifier.package}@${specifier.range}` : specifier.range;
  const parts = [specifier.ref, specifier.path && `path:${specifier.path}`].filter(Boolean);
  return `github:${specifier.owner}/${specifier.repo}${parts.length ? `#${parts.join("&")}` : ""}`;
}

/** A request's path and query as an address, or why not. The specifier segment is decoded once. */
export function parseAddress(pathname: string, search: string): Address | Refused {
  const match = pathname.match(/^\/((?:@[^/@]+\/)?[^/@]+)@([^/]+)(?:\/(.*))?$/);
  if (!match) return { error: "not found: /<name>@<encodeURIComponent(specifier)>[/<subpath>]" };
  const [, name, segment, rest = ""] = match;
  if (!NAME.test(name!)) return { error: `${name} is not a package name` };
  let text: string;
  let subpath: string;
  try {
    text = decodeURIComponent(segment!);
    subpath = rest.split("/").map(decodeURIComponent).join("/").replace(/\/+$/, "");
  } catch {
    return { error: `${pathname}: a % that doesn't decode` };
  }
  if (subpath.split("/").some((part) => part === "." || part === ".."))
    return { error: `${subpath} is not a subpath` };
  const specifier = parseSpecifier(text);
  if ("error" in specifier) return specifier;
  const external = new URLSearchParams(search).get("external") || undefined;
  return { name: name!, specifier, subpath, external };
}

/** An address's one URL path and query: what the service emits and redirects every other spelling
 *  to, so a module always has the same URL (a browser runs one module per URL). */
export function formatAddress(address: Address): string {
  const subpath = address.subpath
    ? `/${address.subpath.split("/").map(encodeURIComponent).join("/")}`
    : "";
  const external = address.external ? `?external=${address.external}` : "";
  return `/${address.name}@${encodeURIComponent(formatSpecifier(address.specifier))}${subpath}${external}`;
}

function splitOnce(text: string, separator: string): [string, string | undefined] {
  const at = text.indexOf(separator);
  return at < 0 ? [text, undefined] : [text.slice(0, at), text.slice(at + 1)];
}
