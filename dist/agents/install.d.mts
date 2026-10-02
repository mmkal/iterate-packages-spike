import { _ as FacetSpec, j as IterateContextApi } from "../api-DYAY3SD8.mjs";
//#region src/agents/install.d.ts
/** One of the app's facets: `className` from `agents.ts` of the project's published config. */
export declare function agentsFacetSpec(className: "AgentCollectionDurableObject" | "AgentDurableObject"): FacetSpec;
/** Idempotent: enabling the row again appends nothing, and the rule is written back if removed. */
export declare function installAgents(itx: Pick<IterateContextApi, "append"> & {
  processors: Pick<IterateContextApi["processors"], "enable">;
}): Promise<void>;
//#endregion
//# sourceMappingURL=install.d.mts.map