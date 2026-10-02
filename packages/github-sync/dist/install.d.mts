import { IterateContextApi } from "iterate/api";
//#region src/install.d.ts
/** The source a project installs the sync from, by file: `version` is what package.json pins (a
 *  pkg.pr.new URL, or an npm range once the package is on npm). */
export declare function githubSyncFolder(version: string): Record<string, string>;
/** Mount the sync from its source (`githubSyncFolder`, as `repo.modules({ dir })` answers it) for
 *  `repo` (default `/repos/config`), whose origin must be its GitHub repository (the Dash's Config
 *  repo links it), through `connection`: by default the project's one GitHub connection to the
 *  repository's owner. Installing the same source again changes nothing but a new marker; a new
 *  source is an upgrade. */
export declare function installGithubSync(itx: Pick<IterateContextApi, "whoami" | "append" | "cd" | "facets" | "repos" | "processors">, source: Record<string, string>, options?: {
  repo?: string;
  connection?: string;
}): Promise<{
  repo: string;
  repository: string;
  connection: string;
}>;
//#endregion