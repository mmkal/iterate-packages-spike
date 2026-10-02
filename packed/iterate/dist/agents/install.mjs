//#region src/agents/install.ts
/** One of the app's facets: `className` from `agents.ts` of the project's published config. */
function agentsFacetSpec(className) {
	return {
		className,
		mainModule: "agents.ts",
		source: [
			"itx",
			["cd", "/"],
			"config"
		]
	};
}
/** Idempotent: enabling the row again appends nothing, and the rule is written back if removed. */
async function installAgents(itx) {
	const spec = agentsFacetSpec("AgentCollectionDurableObject");
	await itx.processors.enable("agents", {
		...spec,
		consumes: ["events.iterate.com/agent/created", "events.iterate.com/agent/deleted"]
	});
	await itx.append({
		type: "events.iterate.com/itx/rewrite-rule-configured",
		payload: {
			match: "itx.agents",
			target: [
				"itx",
				"facets",
				[
					"get",
					"agents",
					spec
				]
			],
			description: "The project's installed agents app: list(), create(path), get(path).message(text), delete(path)"
		}
	});
}
//#endregion
export { agentsFacetSpec, installAgents };

//# sourceMappingURL=install.mjs.map