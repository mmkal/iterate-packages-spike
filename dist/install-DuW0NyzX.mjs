import { errorCode } from "iterate/lib";
import { canonicalItxExpressionPrefix } from "iterate/expression";
import { z } from "zod";
const SCREEN_FONT_CSS = `@font-face {
  font-family: "Iterate Pixel";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url("data:font/woff2;base64,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") format("woff2");
}
`;
//#endregion
//#region src/install.ts
/** Where voice's code is: `voice.ts` of the project's published config, with no cache key, so what
*  runs changes only when that module's bundle does (a new pin of this package). */
const PUBLISHED = {
	mainModule: "voice.ts",
	source: [
		"itx",
		["cd", "/"],
		"config"
	]
};
/** The relay facet each press puts beside its call's agent (worker.ts `setupVoiceAgent`). */
const voiceAgentFacetSpec = {
	className: "VoiceAgentDurableObject",
	...PUBLISHED
};
/** Idempotent: the screen font a screen script embeds (screen-context.md), and the `itx.voice` rule
*  to `voice.ts`'s default export. Voice runs on the agents app, every call an agent, which the same
*  init case installs (`installAgents`). */
async function installVoice(itx) {
	await itx.kv.put("voice/screen-font.css", SCREEN_FONT_CSS);
	await itx.append({
		type: "events.iterate.com/itx/rewrite-rule-configured",
		payload: {
			match: "itx.voice",
			target: [
				"itx",
				"workers",
				["get", PUBLISHED]
			],
			description: "The project's installed voice service: setupVoiceAgent({ streamPath, activation, screen? }), setImage({ device, image }), health()"
		}
	});
}
const VoiceHealth = z.object({ ok: z.literal(true) });
/** What Kit's Prepare and the voice app run for a project: the OpenAI key (the live model's) stored
*  when the project has none — `needs-openai-key` without one — then `itx.voice`, which the
*  project's init case installs (`installVoice`), waited for (`voiceInstalled`), and asked for
*  `health()`. A project whose config repo neither has `itx.voice` nor pins this package at its tip
*  never gets one: refused at once, before a key is stored. */
async function ensureVoiceAgent(project, openaiKey) {
	const repo = project.repos.get("/repos/config");
	const [secrets, rule, config] = await Promise.all([
		project.secrets.list(),
		project.rewriteRules.get("itx.voice"),
		repo.tip().then((tip) => ({ tip }), (error) => {
			if (/: not created —/.test(String(error))) return void 0;
			throw error;
		})
	]);
	const tip = config?.tip;
	if (!rule?.target && tip && !voicePinIn(await repo.readFile("package.json", { commitOid: tip }))) throw new Error(`This project's config repo does not install voice: its package.json lists no @iterate-com/voice, and its init case calls no installVoice(itx) (@iterate-com/voice/install), as configs/voice does`);
	if (!secrets.some((secret) => secret.path === "/secrets/openai")) {
		if (!openaiKey?.trim()) return "needs-openai-key";
		await project.secrets.set("/secrets/openai", openaiKey.trim(), { urls: ["https://api.openai.com"] });
	}
	if (!rule?.target) await voiceInstalled(project, tip);
	const installed = project;
	VoiceHealth.parse(await installed.voice.health());
	return "ready";
}
/** The project's `itx.voice` rule, as the root stores its match (parsed), waited for until one
*  minute from now: a project created a moment ago gets it from its config repo's first init case.
*  A failed creation, or the refused publication of `tip`, the commit that pins voice (none while
*  the repo is not created yet), refuses at once, saying why. */
async function voiceInstalled(project, tip) {
	const deadline = Date.now() + 6e4;
	for (let afterOffset = 0; Date.now() < deadline;) {
		const event = await project.waitForEvent({
			type: [
				"events.iterate.com/itx/rewrite-rule-configured",
				"events.iterate.com/project/create-failed",
				"events.iterate.com/project/worker-update-failed"
			],
			afterOffset,
			timeoutMs: deadline - Date.now()
		}).catch((error) => {
			if (errorCode(error) !== "WAIT_TIMEOUT") throw error;
		});
		if (!event) break;
		const { payload } = event;
		if (event.type === "events.iterate.com/project/create-failed") throw new Error(`The project's creation failed, so its config repo installs no voice: ${String(payload?.error)}`);
		if (event.type === "events.iterate.com/project/worker-update-failed" && tip && payload?.commitOid === tip) throw new Error(`The project's config (commit ${tip.slice(0, 7)}) was not published, so it installs no voice: ${String(payload.error)}`);
		if (event.type === "events.iterate.com/itx/rewrite-rule-configured" && payload?.target && canonicalItxExpressionPrefix(payload.match) === "itx.voice" && (await project.rewriteRules.get("itx.voice"))?.target) return;
		afterOffset = event.offset;
	}
	throw new Error("Voice was not installed within a minute: the project's config repo pins @iterate-com/voice, and installs it with installVoice(itx) (@iterate-com/voice/install) in its init case, as configs/voice does");
}
/** The part of a config repo's root package.json an upgrade reads and rewrites; every other field
*  is carried through untouched. */
const RootManifest = z.object({ dependencies: z.record(z.string(), z.string()).optional() });
/** The `@iterate-com/voice` a root package.json's `text` lists among its dependencies: undefined for
*  none, no file, or one that is not a package.json. */
function voicePinIn(text) {
	try {
		return RootManifest.parse(JSON.parse(text || "{}")).dependencies?.["@iterate-com/voice"];
	} catch {
		return;
	}
}
/** The build of voice the project RUNS: what the root package.json pins at the commit of
*  `/repos/config` the platform last published (the `project` facet's `publishedCommit`), which
*  the tip is not while an upgrade's publication is owed or after it was refused. Undefined before
*  the first publication, or when that commit pins no such package. */
async function voiceVersion(project) {
	const { state } = await project.facets.get("project").snapshot();
	if (!state.publishedCommit) return void 0;
	return voicePinIn(await project.repos.get("/repos/config").readFile("package.json", { commitOid: state.publishedCommit }));
}
/**
* AN UPGRADE of the project's voice to `version`: the root package.json's pin, committed on the tip
* it read (refused if main moved meanwhile; a file already so commits nothing, and the tip's outcome
* answers), then that commit's outcome on `/`, past any give-up for now (`unavailable`), which
* leaves it owed. Published, a press from 5 s on loads the new build (`voiceAgentFacetSpec`);
* refused, main moving on included, it throws why and the person upgrades again. Answers the
* commit. The agents app is the platform's own (iterate/agents) and upgrades with it.
*/
async function upgradeVoice(project, version) {
	const repo = project.repos.get("/repos/config");
	const tip = await repo.tip();
	const manifest = JSON.parse(await repo.readFile("package.json") || "{}");
	const { dependencies } = RootManifest.parse(manifest);
	manifest.dependencies = {
		...dependencies,
		"@iterate-com/voice": version
	};
	const { commitOid } = await repo.commitFiles({
		message: `Upgrade @iterate-com/voice to ${version}`,
		parent: tip,
		changes: [{
			path: "package.json",
			content: `${JSON.stringify(manifest, null, 2)}\n`
		}]
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
		if (!outcome.payload?.unavailable) throw new Error(`The upgrade was not published: ${String(outcome.payload?.error)}`);
		afterOffset = outcome.offset;
	}
}
//#endregion
export { voiceVersion as a, voiceAgentFacetSpec as i, installVoice as n, upgradeVoice as r, ensureVoiceAgent as t };
