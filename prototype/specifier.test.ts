// node --test specifier.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { formatAddress, parseAddress, parseSpecifier } from "./specifier.ts";

test("specifiers, as pnpm writes them", () => {
  const rows: [string, unknown][] = [
    ["1.2.3", { kind: "npm", range: "1.2.3" }],
    ["^1.2.3", { kind: "npm", range: "^1.2.3" }],
    ["~1.2.3", { kind: "npm", range: "~1.2.3" }],
    [">=1 <2", { kind: "npm", range: ">=1 <2" }],
    ["latest", { kind: "npm", range: "latest" }],
    ["npm:react@19.3.0", { kind: "npm", package: "react", range: "19.3.0" }],
    ["npm:@iterate-com/ui", { kind: "npm", package: "@iterate-com/ui", range: "latest" }],
    ["github:mmkal/expect-type", { kind: "github", owner: "mmkal", repo: "expect-type" }],
    ["github:iterate/packages#main", { kind: "github", owner: "iterate", repo: "packages", ref: "main" }],
    [
      "github:iterate/packages#main&path:packed/@iterate-com/ui",
      { kind: "github", owner: "iterate", repo: "packages", ref: "main", path: "packed/@iterate-com/ui" },
    ],
    // pnpm's docs write the folder with a leading slash
    [
      "github:iterate/packages#path:/packed/iterate/",
      { kind: "github", owner: "iterate", repo: "packages", path: "packed/iterate" },
    ],
    // a branch name may hold a slash
    ["github:iterate/packages#feature/x", { kind: "github", owner: "iterate", repo: "packages", ref: "feature/x" }],
  ];
  for (const [text, parsed] of rows) assert.deepEqual(parseSpecifier(text), parsed, text);
});

test("specifiers outside the subset are refused by name", () => {
  for (const text of [
    "",
    "..",
    "file:../ui",
    "workspace:*",
    "catalog:",
    "link:../ui",
    "git+ssh://git@github.com/iterate/packages.git",
    "https://pkg.pr.new/iterate/private/iterate@main",
    "iterate/packages",
    "github:iterate",
    "github:iterate/packages/extra",
    "github:iterate/packages#main&path:../escape",
    "github:iterate/packages#semver:^1.0.0",
    "github:iterate/packages#main&dev",
  ])
    assert.ok("error" in (parseSpecifier(text) as object), JSON.stringify(text));
});

test("an address is <name>@<encodeURIComponent(specifier)>[/<subpath>], and round-trips", () => {
  const ui = "/@iterate-com/ui@github%3Aiterate%2Fpackages%23main%26path%3Apacked%2F%40iterate-com%2Fui";
  const rows: [string, string, unknown][] = [
    [
      `${ui}/components/context-view`,
      "",
      {
        name: "@iterate-com/ui",
        specifier: { kind: "github", owner: "iterate", repo: "packages", ref: "main", path: "packed/@iterate-com/ui" },
        subpath: "components/context-view",
        external: undefined,
      },
    ],
    [ui, "", { name: "@iterate-com/ui", subpath: "" }],
    [`${ui}/`, "", { name: "@iterate-com/ui", subpath: "" }],
    [
      "/react@19.3.0/jsx-runtime",
      "?external=react",
      { name: "react", specifier: { kind: "npm", range: "19.3.0" }, subpath: "jsx-runtime", external: "react" },
    ],
    ["/react@%5E19.3.0", "", { name: "react", specifier: { kind: "npm", range: "^19.3.0" }, subpath: "" }],
  ];
  for (const [pathname, search, expected] of rows) {
    const address = parseAddress(pathname, search);
    assert.partialDeepStrictEqual(address, expected, pathname);
    if ("error" in address) continue;
    // formatting what was parsed gives the one canonical spelling, which parses back the same
    assert.deepEqual(parseAddress(...splitUrl(formatAddress(address))), address, pathname);
  }
  assert.equal(
    formatAddress(parseAddress(`${ui}/page`, "") as never),
    `${ui}/page`,
    "the canonical spelling is encodeURIComponent's",
  );
  // another spelling of the same specifier (`:` and `@` left raw) has the same canonical URL
  assert.equal(
    formatAddress(parseAddress("/@iterate-com/ui@github:iterate%2Fpackages%23main%26path:packed%2F@iterate-com%2Fui/page", "") as never),
    `${ui}/page`,
  );
});

test("an import map's one line per package resolves every subpath", () => {
  // what the browser does with `"@iterate-com/ui/": "<address>/"` and `import … from "@iterate-com/ui/<subpath>"`:
  // URL-parse the rest against the address (https://html.spec.whatwg.org/#resolving-imports)
  const address = "https://esm.iterate.com/@iterate-com/ui@github%3Aiterate%2Fpackages%23main%26path%3Apacked%2F%40iterate-com%2Fui/";
  const resolved = new URL("components/context-view/context-view", address);
  assert.ok(resolved.href.startsWith(address), "no backtracking");
  assert.partialDeepStrictEqual(parseAddress(resolved.pathname, resolved.search), {
    name: "@iterate-com/ui",
    subpath: "components/context-view/context-view",
  });
});

test("malformed addresses are refused", () => {
  for (const pathname of ["/", "/react", "/@iterate-com@1.0.0", "/react@%E0%A4%A/x", "/react@1.0.0/../x"])
    assert.ok("error" in (parseAddress(pathname, "") as object), pathname);
});

function splitUrl(url: string): [string, string] {
  const at = url.indexOf("?");
  return at < 0 ? [url, ""] : [url.slice(0, at), url.slice(at)];
}
