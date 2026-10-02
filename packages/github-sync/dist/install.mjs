import { t as githubRepositoryOf } from "./github-repository-aAAfWiEf.mjs";
//#region src/install.ts
/** The source a project installs the sync from, by file: `version` is what package.json pins (a
*  pkg.pr.new URL, or an npm range once the package is on npm). */
function githubSyncFolder(version) {
	return {
		"package.json": `${JSON.stringify({
			main: "index.ts",
			dependencies: { "@iterate-com/github-sync": version }
		}, null, 2)}\n`,
		"index.ts": "export { GithubSyncDurableObject } from \"@iterate-com/github-sync\";\n"
	};
}
/** Mount the sync from its source (`githubSyncFolder`, as `repo.modules({ dir })` answers it) for
*  `repo` (default `/repos/config`), whose origin must be its GitHub repository (the Dash's Config
*  repo links it), through `connection`: by default the project's one GitHub connection to the
*  repository's owner. Installing the same source again changes nothing but a new marker; a new
*  source is an upgrade. */
async function installGithubSync(itx, source, options = {}) {
	const { path } = await itx.whoami();
	if (path !== "/") throw new Error("Install the GitHub sync at the project root");
	const repo = options.repo || "/repos/config";
	const repository = githubRepositoryOf(await itx.repos.get(repo).origin());
	if (!repository) throw new Error(`${repo} has no GitHub origin: link it to its repository first (the Dash's Config repo)`);
	const owner = repository.split("/")[0];
	const connection = options.connection || await githubConnectionTo(itx, owner);
	const log = itx.cd(`/integrations/github/${connection}`);
	for (const root of ["repos", "fetch"]) {
		const match = `itx.${root}`;
		const target = `itx.builtins.cd('/').${root}`;
		if ((await log.rewriteRules.get(match))?.target !== target) await log.append({
			type: "events.iterate.com/itx/rewrite-rule-configured",
			payload: {
				match,
				target
			}
		});
	}
	const spec = {
		source,
		className: "GithubSyncDurableObject"
	};
	await log.processors.enable("github-sync", {
		...spec,
		consumes: ["events.iterate.com/github/webhook-received", "github-sync/installed"]
	});
	await itx.processors.enable("github-sync", {
		...spec,
		consumes: ["events.iterate.com/repo/commit-completed", "github-sync/installed"]
	});
	const installed = {
		type: "github-sync/installed",
		payload: { repo }
	};
	await Promise.all([log.append(installed), itx.append(installed)]);
	return {
		repo,
		repository,
		connection
	};
}
/** The project's one GitHub connection to `owner` (a login's case does not matter to GitHub). */
async function githubConnectionTo(itx, owner) {
	const { state } = await itx.facets.get("project").snapshot();
	const rows = Object.values(state.integrations).filter((row) => row.provider === "github" && row.account.toLowerCase() === owner.toLowerCase());
	if (rows.length !== 1) throw new Error(`expected one GitHub connection to ${owner}, found ${rows.length}: name one with { connection }`);
	return rows[0].connection;
}
//#endregion
export { githubSyncFolder, installGithubSync };
