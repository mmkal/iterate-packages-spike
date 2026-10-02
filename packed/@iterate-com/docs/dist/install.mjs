import { commentEvents } from "./comments.mjs";
import { COMMIT_NOTICED, DOC_LEFT, DOC_OPENED, EDIT_FRAME, docContextPath } from "./frames.mjs";
import { z } from "zod";
//#region src/install.ts
/** The config module that exports the processors' classes. */
const docsModule = {
	path: "docs.ts",
	content: "export { DocDurableObject, DocsDurableObject } from \"@iterate-com/docs\";\n"
};
const RootManifest = z.object({ dependencies: z.record(z.string(), z.string()).optional() });
/** The guide an agent follows to work on docs (this package's AGENTS.md), on main of the public
*  copy of this repository's packages, which keeps their paths. */
const docsAgentGuide = "https://raw.githubusercontent.com/iterate/packages/main/packages/docs/AGENTS.md";
/** What `installDocs` adds to the config's AGENTS.md, which an agent on the platform's MCP server
*  is told to read first: where the guide is. */
const docsAgentsSection = `## Docs

Docs (\`docs.ts\`, @iterate-com/docs) co-edits this project's files in the browser. An agent edits a
doc by committing it, and comments on one with events on its context, \`/docs/<repo name>/<path>\`,
as ${docsAgentGuide} says.
`;
/** Install Docs in a project's config at `version` (a pkg.pr.new build at its commit, or an npm
*  version): `docs.ts` and the root package.json's pin, one commit, then the config's publication
*  of it. Resolves once the project runs it; throws with the platform's reason when it refused the
*  commit. `upgradeVoice` (@iterate-com/voice/install) does the same for voice. */
async function installDocs(project, version) {
	const repo = project.repos.get("/repos/config");
	const tip = await repo.tip();
	const manifest = JSON.parse(await repo.readFile("package.json") || "{}");
	const { dependencies } = RootManifest.parse(manifest);
	manifest.dependencies = {
		...dependencies,
		"@iterate-com/docs": version
	};
	const agents = await repo.readFile("AGENTS.md") || "";
	const { commitOid } = await repo.commitFiles({
		message: `Install @iterate-com/docs at ${version}`,
		parent: tip,
		changes: [
			docsModule,
			{
				path: "package.json",
				content: `${JSON.stringify(manifest, null, 2)}\n`
			},
			...agents.includes("https://raw.githubusercontent.com/iterate/packages/main/packages/docs/AGENTS.md") ? [] : [{
				path: "AGENTS.md",
				content: agents ? `${agents.trimEnd()}\n\n${docsAgentsSection}` : docsAgentsSection
			}]
		]
	});
	const deadline = Date.now() + 12e4;
	for (let afterOffset = 0;;) {
		const outcome = await project.waitForEvent({
			type: ["events.iterate.com/project/worker-updated", "events.iterate.com/project/worker-update-failed"],
			payload: { commitOid },
			afterOffset,
			timeoutMs: Math.max(1, deadline - Date.now())
		});
		if (outcome.type === "events.iterate.com/project/worker-updated") return commitOid;
		if (!outcome.payload?.unavailable) throw new Error(`Docs was not installed: ${String(outcome.payload?.error)}`);
		afterOffset = outcome.offset;
	}
}
/** One of the processors: `className` from `docs.ts` of the project's published config. */
function docsFacetSpec(className) {
	return {
		className,
		mainModule: docsModule.path,
		source: [
			"itx",
			["cd", "/"],
			"config"
		]
	};
}
/** The context co-editing `doc` (a repo and a path in it), set up: the root's docs processor
*  (root.ts), the doc marked opened, and the doc's processor (processor.ts), which reaches the
*  doc's repo from its own context (loaded code reaches its whole project). Idempotent: enabling a
*  row again appends nothing. */
async function ensureDoc(project, doc) {
	await project.processors.enable("docs", {
		...docsFacetSpec("DocsDurableObject"),
		consumes: ["events.iterate.com/repo/commit-completed", DOC_OPENED]
	});
	const contextPath = docContextPath(doc);
	await project.append({
		type: DOC_OPENED,
		payload: {
			repo: doc.repo,
			path: doc.path
		},
		idempotencyKey: `${DOC_OPENED}:${contextPath}`
	});
	const context = project.cd(contextPath);
	await context.processors.enable("doc", {
		...docsFacetSpec("DocDurableObject"),
		consumes: [
			EDIT_FRAME,
			COMMIT_NOTICED,
			DOC_LEFT,
			...commentEvents
		]
	});
	return context;
}
//#endregion
export { docsAgentGuide, docsAgentsSection, docsFacetSpec, docsModule, ensureDoc, installDocs };
