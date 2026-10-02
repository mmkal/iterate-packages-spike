//#region src/config-repo-template.d.ts
export type ConfigRepoTemplateReference = {
  owner: string;
  path?: string;
  ref?: string;
  repo: string;
};
/** The path invariant shared by the string parser and the GitHub template downloader. */
export declare function isSafeConfigRepoTemplatePath(path: string): boolean;
/**
 * Parse the public-GitHub subset of pnpm's Git dependency syntax. The result
 * is plain structured data safe to place in durable project/repo requests;
 * callers serialize it canonically before persisting the original string.
 */
export declare function parseConfigRepoTemplateReference(input: string): ConfigRepoTemplateReference;
export declare function formatConfigRepoTemplateReference(reference: ConfigRepoTemplateReference): string;
export declare function normalizeConfigRepoTemplateReference(input: string): string;
//#endregion
//# sourceMappingURL=config-repo-template.d.mts.map