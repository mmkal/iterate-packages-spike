import { c as DocRef } from "./frames-dfRBTV3e.mjs";
import { FacetSpec, IterateContextApi, RepoHandle } from "iterate/api";
//#region src/install.d.ts
/** The config module that exports the processors' classes. */
export declare const docsModule: {
  path: string;
  content: string;
};
/** The guide an agent follows to work on docs (this package's AGENTS.md), on main of the public
 *  copy of this repository's packages, which keeps their paths. */
export declare const docsAgentGuide = "https://raw.githubusercontent.com/iterate/packages/main/packages/docs/AGENTS.md";
/** What `installDocs` adds to the config's AGENTS.md, which an agent on the platform's MCP server
 *  is told to read first: where the guide is. */
export declare const docsAgentsSection = "## Docs\n\nDocs (`docs.ts`, @iterate-com/docs) co-edits this project's files in the browser. An agent edits a\ndoc by committing it, and comments on one with events on its context, `/docs/<repo name>/<path>`,\nas https://raw.githubusercontent.com/iterate/packages/main/packages/docs/AGENTS.md says.\n";
/** Install Docs in a project's config at `version` (a pkg.pr.new build at its commit, or an npm
 *  version): `docs.ts` and the root package.json's pin, one commit, then the config's publication
 *  of it. Resolves once the project runs it; throws with the platform's reason when it refused the
 *  commit. `upgradeVoice` (@iterate-com/voice/install) does the same for voice. */
export declare function installDocs(project: Pick<IterateContextApi, "waitForEvent"> & {
  repos: {
    get(path: string): Pick<RepoHandle, "tip" | "readFile" | "commitFiles">;
  };
}, version: string): Promise<string | null>;
/** One of the processors: `className` from `docs.ts` of the project's published config. */
export declare function docsFacetSpec(className: "DocDurableObject" | "DocsDurableObject"): FacetSpec;
/** The context co-editing `doc` (a repo and a path in it), set up: the root's docs processor
 *  (root.ts), the doc marked opened, and the doc's processor (processor.ts), which reaches the
 *  doc's repo from its own context (loaded code reaches its whole project). Idempotent: enabling a
 *  row again appends nothing. */
export declare function ensureDoc(project: Pick<IterateContextApi, "cd" | "append" | "processors">, doc: DocRef): Promise<IterateContextApi>;
//#endregion