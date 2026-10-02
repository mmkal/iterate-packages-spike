import "zod";
//#region src/stream/contract.ts
function defineProcessorContract(contract) {
	if (!contract.stateSchema.safeParse({}).success) throw new Error(`contract "${contract.slug}": stateSchema must parse {} (default every field)`);
	const events = contract.events ?? {};
	const processorDeps = contract.processorDeps ?? [];
	const depEventTypes = /* @__PURE__ */ new Set();
	for (const dep of processorDeps) for (const type of Object.keys(dep.events)) {
		if (type in events) throw new Error(`contract "${contract.slug}": event "${type}" is already owned by a dep`);
		if (depEventTypes.has(type)) throw new Error(`contract "${contract.slug}": event "${type}" is declared by two deps`);
		depEventTypes.add(type);
	}
	return {
		slug: contract.slug,
		version: contract.version,
		description: contract.description,
		consumes: contract.consumes,
		emits: contract.emits,
		stateSchema: contract.stateSchema,
		events,
		processorDeps,
		initialState: () => contract.stateSchema.parse({}),
		payloadSchemaFor: (type) => (events[type] ?? processorDeps.map((dep) => dep.events[type]).find(Boolean))?.payloadSchema
	};
}
//#endregion
export { defineProcessorContract };

//# sourceMappingURL=contract.mjs.map