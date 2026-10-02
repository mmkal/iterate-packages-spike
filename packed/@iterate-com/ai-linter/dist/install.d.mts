import { IterateContextApi } from "iterate/api";
//#region src/install.d.ts
/** The source a project installs the linter from, by file: `version` is what package.json pins (a
 *  pkg.pr.new URL, or an npm range once the package is on npm). */
export declare function aiLinterFolder(version: string): Record<string, string>;
/** Mount the linter from its source (`aiLinterFolder`, as `repo.modules({ dir })` answers it) for the
 *  pull requests of `repository` (`owner/name`), against its `rules` folder (default `rules`), the
 *  LLM being `model` (default run.ts's), through `connection`: by default the project's one GitHub
 *  connection to the repository's owner. Each install appends its choices as the latest
 *  `ai-linter/installed`; the same source again changes nothing else, and a new source is an
 *  upgrade. */
export declare function installAiLinter(itx: Pick<IterateContextApi, "whoami" | "cd" | "facets">, source: Record<string, string>, options: {
  repository: string;
  rules?: string;
  model?: string;
  connection?: string;
}): Promise<{
  repository: string;
  connection: string;
}>;
//#endregion