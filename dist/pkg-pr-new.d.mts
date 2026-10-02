//#region src/pkg-pr-new.d.ts
/** A pkg.pr.new build as its URL names it, in parts, or undefined for any other version and for a
 *  pkg.pr.new URL of another shape. A package.json may list it under another name: an alias, as npm
 *  installs a tarball URL under the name it is listed by. */
export declare function pkgPrNewBuildOf(version: string): {
  owner: string;
  repo: string;
  name: string;
  ref: string;
} | undefined;
/** A pkg.pr.new version of package `name`, in parts, or undefined for any other version: an npm
 *  range, an exact version or a dist-tag, and a pkg.pr.new URL of another shape or package. */
export declare function pkgPrNewVersionOf(name: string, version: string): {
  owner: string;
  repo: string;
  name: string;
  ref: string;
} | undefined;
/** Whether a pkg.pr.new ref names one build: all 40 hex digits of a commit. A branch or a PR number
 *  names whatever was published for it last. A short sha is refused too: it reads like a branch
 *  name, and pkg.pr.new's `x-commit-key` echoes it rather than naming the commit. */
export declare const isPkgPrNewCommit: (ref: string) => boolean;
/** The repository whose pkg.pr.new workflow (.github/workflows/pkg-pr-new.yml) publishes this
 *  repository's packages, as pkg.pr.new's URLs name it. It moves to iterate/private, which starts
 *  with fresh history (tasks/package-urls-survive-repo-move.md). */
export declare const pkgPrNewRepository = "iterate/iterate";
/** A build of one of this repository's packages (`iterate`, `@iterate-com/voice`, …): the
 *  pkg.pr.new workflow publishes every package together, for every main commit and for the head of
 *  a PR that changes one. */
export declare const pkgPrNewVersion: (name: string, ref: string) => string;
/**
 * `version` of package `name` as a writer writes it: a pkg.pr.new branch or PR at the commit
 * pkg.pr.new serves for it now, and any other version as it is. The commit is the HEAD's
 * `x-commit-key` (`<owner>:<repo>:<commit>`), trusted only as 40 hex digits: a 404 echoes there the
 * ref it was asked for. The HEAD is sent once more a second later when pkg.pr.new fails it
 * (UPSTREAM_ONCE), each attempt within 10 s. A ref it cannot pin throws, so nothing is written with
 * a ref that moves.
 */
export declare function pinPkgPrNewVersion(name: string, version: string, fetchFn?: typeof fetch): Promise<string>;
/** Where a project's installed build of one of this repository's packages stands against the newest
 *  build main has published, by commit (`buildStanding`). */
export type BuildStanding =
/** `installed`, the version as its package.json pins it, is not this repository's build at a
 *  commit (an npm version, a fork's build): the project's own, which it upgrades itself */
{
  kind: "own";
  installed: string;
} |
/** the installed build is main's newest */
{
  kind: "newest";
  installed: string;
} |
/** main published `newest` after `installed`, or pkg.pr.new no longer serves `installed`: an
 *  upgrade, to `version` (`newest` as package.json pins it) */
{
  kind: "behind";
  installed: string;
  newest: string;
  version: string;
} |
/** `installed` was published after main's newest: a pull request's build */
{
  kind: "ahead";
  installed: string;
  newest: string;
};
/**
 * WHETHER MAIN HAS A NEWER BUILD of package `name` than `installed`, the version a project's source
 * pins: main's newest is `…@main` at the commit pkg.pr.new serves for it now, and newer is later
 * published, by pkg.pr.new's `last-modified` (every main commit publishes a build, so a new commit
 * is a new build). The two HEADs go at once, each bounded as `pinPkgPrNewVersion` says. A build
 * answered without its commit or publish time throws, as does one pkg.pr.new keeps failing, so a
 * standing is never guessed. An app's Worker asks (a server function): a page cannot read these
 * headers.
 */
export declare function buildStanding(name: string, installed: string, fetchFn?: typeof fetch): Promise<BuildStanding>;
/**
 * A source's files with every package.json's pkg.pr.new `dependencies` pinned
 * (`pinPkgPrNewVersion`), one HEAD per distinct version: what the platform commits when it seeds a
 * config repo from a template, whose `…@main` means main's newest build. A manifest with nothing to
 * pin keeps its bytes; one that changes is written back as JSON with two-space indents, its keys in
 * their order. `devDependencies` stay as written: the loader never reads them, and the tooling that
 * does (`npm install` for `tsc`) locks them itself, so a template's types can follow main.
 */
export declare function pinPkgPrNewDependencies(files: {
  path: string;
  content: string;
}[], fetchFn?: typeof fetch): Promise<{
  path: string;
  content: string;
}[]>;
//#endregion
//# sourceMappingURL=pkg-pr-new.d.mts.map