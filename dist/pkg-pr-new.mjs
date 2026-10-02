import { UPSTREAM_ONCE, fetchRetryingPlatformFailures } from "./platform-retry.mjs";
import { z } from "zod";
//#region src/pkg-pr-new.ts
/** A pkg.pr.new build as its URL names it, in parts, or undefined for any other version and for a
*  pkg.pr.new URL of another shape. A package.json may list it under another name: an alias, as npm
*  installs a tarball URL under the name it is listed by. */
function pkgPrNewBuildOf(version) {
	if (!version.startsWith("https://pkg.pr.new/")) return void 0;
	const [owner, repo, ...rest] = new URL(version).pathname.slice(1).split("/");
	const listed = rest.join("/");
	const at = listed.indexOf("@", 1);
	if (!owner || !repo || at < 0 || at === listed.length - 1) return void 0;
	return {
		owner,
		repo,
		name: listed.slice(0, at),
		ref: listed.slice(at + 1)
	};
}
/** A pkg.pr.new version of package `name`, in parts, or undefined for any other version: an npm
*  range, an exact version or a dist-tag, and a pkg.pr.new URL of another shape or package. */
function pkgPrNewVersionOf(name, version) {
	const build = pkgPrNewBuildOf(version);
	return build?.name === name ? build : void 0;
}
/** Whether a pkg.pr.new ref names one build: all 40 hex digits of a commit. A branch or a PR number
*  names whatever was published for it last. A short sha is refused too: it reads like a branch
*  name, and pkg.pr.new's `x-commit-key` echoes it rather than naming the commit. */
const isPkgPrNewCommit = (ref) => /^[0-9a-f]{40}$/.test(ref);
/** The repository whose pkg.pr.new workflow (.github/workflows/pkg-pr-new.yml) publishes this
*  repository's packages, as pkg.pr.new's URLs name it. It moves to iterate/private, which starts
*  with fresh history (tasks/package-urls-survive-repo-move.md). */
const pkgPrNewRepository = "iterate/iterate";
/** A build of one of this repository's packages (`iterate`, `@iterate-com/voice`, …): the
*  pkg.pr.new workflow publishes every package together, for every main commit and for the head of
*  a PR that changes one. */
const pkgPrNewVersion = (name, ref) => `https://pkg.pr.new/${pkgPrNewRepository}/${name}@${ref}`;
/**
* `version` of package `name` as a writer writes it: a pkg.pr.new branch or PR at the commit
* pkg.pr.new serves for it now, and any other version as it is. The commit is the HEAD's
* `x-commit-key` (`<owner>:<repo>:<commit>`), trusted only as 40 hex digits: a 404 echoes there the
* ref it was asked for. The HEAD is sent once more a second later when pkg.pr.new fails it
* (UPSTREAM_ONCE), each attempt within 10 s. A ref it cannot pin throws, so nothing is written with
* a ref that moves.
*/
async function pinPkgPrNewVersion(name, version, fetchFn = globalThis.fetch) {
	const parts = pkgPrNewVersionOf(name, version);
	if (!parts || isPkgPrNewCommit(parts.ref)) return version;
	const served = await servedBuild(version, fetchFn);
	if (!served.commit) throw new Error(`${version} answered ${served.status} without naming the commit it serves, so it cannot be pinned`);
	return `https://pkg.pr.new/${parts.owner}/${parts.repo}/${name}@${served.commit}`;
}
/**
* WHETHER MAIN HAS A NEWER BUILD of package `name` than `installed`, the version a project's source
* pins: main's newest is `…@main` at the commit pkg.pr.new serves for it now, and newer is later
* published, by pkg.pr.new's `last-modified` (every main commit publishes a build, so a new commit
* is a new build). The two HEADs go at once, each bounded as `pinPkgPrNewVersion` says. A build
* answered without its commit or publish time throws, as does one pkg.pr.new keeps failing, so a
* standing is never guessed. An app's Worker asks (a server function): a page cannot read these
* headers.
*/
async function buildStanding(name, installed, fetchFn = globalThis.fetch) {
	const commit = pkgPrNewVersionOf(name, installed)?.ref ?? "";
	if (!isPkgPrNewCommit(commit) || installed !== pkgPrNewVersion(name, commit)) return {
		kind: "own",
		installed
	};
	const main = pkgPrNewVersion(name, "main");
	const [newest, current] = await Promise.all([servedBuild(main, fetchFn), servedBuild(installed, fetchFn)]);
	if (!newest.commit || !newest.publishedAt) throw new Error(`${main} answered ${newest.status} without naming the commit it serves and when it was published`);
	if (current.status !== 404 && !current.publishedAt) throw new Error(`${installed} answered ${current.status} without saying when it was published`);
	if (newest.commit === commit) return {
		kind: "newest",
		installed: commit
	};
	if (current.publishedAt && current.publishedAt > newest.publishedAt) return {
		kind: "ahead",
		installed: commit,
		newest: newest.commit
	};
	return {
		kind: "behind",
		installed: commit,
		newest: newest.commit,
		version: pkgPrNewVersion(name, newest.commit)
	};
}
/**
* A source's files with every package.json's pkg.pr.new `dependencies` pinned
* (`pinPkgPrNewVersion`), one HEAD per distinct version: what the platform commits when it seeds a
* config repo from a template, whose `…@main` means main's newest build. A manifest with nothing to
* pin keeps its bytes; one that changes is written back as JSON with two-space indents, its keys in
* their order. `devDependencies` stay as written: the loader never reads them, and the tooling that
* does (`npm install` for `tsc`) locks them itself, so a template's types can follow main.
*/
async function pinPkgPrNewDependencies(files, fetchFn = globalThis.fetch) {
	const pins = /* @__PURE__ */ new Map();
	const pin = (name, version) => {
		const key = `${name} ${version}`;
		if (!pins.has(key)) pins.set(key, pinPkgPrNewVersion(name, version, fetchFn));
		return pins.get(key);
	};
	return Promise.all(files.map(async (file) => {
		if (file.path !== "package.json" && !file.path.endsWith("/package.json")) return file;
		let parsed;
		try {
			parsed = JSON.parse(file.content);
		} catch {
			return file;
		}
		const manifest = z.record(z.string(), z.unknown()).safeParse(parsed);
		const dependencies = z.record(z.string(), z.string()).safeParse(manifest.data?.dependencies);
		if (!manifest.success || !dependencies.success) return file;
		const pinned = Object.fromEntries(await Promise.all(Object.entries(dependencies.data).map(async ([name, version]) => [name, await pin(name, version)])));
		if (Object.entries(pinned).every(([name, version]) => dependencies.data[name] === version)) return file;
		const content = `${JSON.stringify({
			...manifest.data,
			dependencies: pinned
		}, null, 2)}\n`;
		return {
			...file,
			content
		};
	}));
}
/** What pkg.pr.new serves at `version`, from one HEAD (`headPkgPrNew`): the answer's status, the
*  commit it names in `x-commit-key` (`<owner>:<repo>:<commit>`, trusted only as 40 hex digits of a
*  200: a 404 echoes there the ref it was asked for), and when that build was published
*  (`last-modified`, epoch milliseconds). */
async function servedBuild(version, fetchFn) {
	const answer = await headPkgPrNew(version, fetchFn);
	const key = answer.headers.get("x-commit-key")?.split(":").at(-1) ?? "";
	const publishedAt = Date.parse(answer.headers.get("last-modified") ?? "");
	return {
		status: answer.status,
		commit: answer.ok && isPkgPrNewCommit(key) ? key : void 0,
		publishedAt: answer.ok && Number.isFinite(publishedAt) ? publishedAt : void 0
	};
}
/** One HEAD of a pkg.pr.new version, bounded as `pinPkgPrNewVersion` says; a 404 is an answer. */
function headPkgPrNew(version, fetchFn) {
	return fetchRetryingPlatformFailures(`HEAD ${version}`, (signal) => fetchFn(version, {
		method: "HEAD",
		signal
	}), {
		area: "pkg-pr-new",
		idempotent: true,
		schedule: UPSTREAM_ONCE,
		timeoutMs: 1e4
	});
}
//#endregion
export { buildStanding, isPkgPrNewCommit, pinPkgPrNewDependencies, pinPkgPrNewVersion, pkgPrNewBuildOf, pkgPrNewRepository, pkgPrNewVersion, pkgPrNewVersionOf };

//# sourceMappingURL=pkg-pr-new.mjs.map