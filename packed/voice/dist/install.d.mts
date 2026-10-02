import { FacetSpec, IterateContextApi, RepoHandle } from "iterate/api";
//#region src/install.d.ts
/** The relay facet each press puts beside its call's agent (worker.ts `setupVoiceAgent`). */
export declare const voiceAgentFacetSpec: FacetSpec;
/** Idempotent: the screen font a screen script embeds (screen-context.md), and the `itx.voice` rule
 *  to `voice.ts`'s default export. Voice runs on the agents app, every call an agent, which the same
 *  init case installs (`installAgents`). */
export declare function installVoice(itx: Pick<IterateContextApi, "append"> & {
  kv: Pick<IterateContextApi["kv"], "put">;
}): Promise<void>;
/** The config repo's part the voice checks read and the upgrade writes. */
type ConfigRepo = Pick<RepoHandle, "tip" | "readFile">;
/** What Kit's Prepare and the voice app run for a project: the OpenAI key (the live model's) stored
 *  when the project has none — `needs-openai-key` without one — then `itx.voice`, which the
 *  project's init case installs (`installVoice`), waited for (`voiceInstalled`), and asked for
 *  `health()`. A project whose config repo neither has `itx.voice` nor pins this package at its tip
 *  never gets one: refused at once, before a key is stored. */
export declare function ensureVoiceAgent(project: Pick<IterateContextApi, "waitForEvent"> & {
  secrets: Pick<IterateContextApi["secrets"], "list" | "set">;
  rewriteRules: Pick<IterateContextApi["rewriteRules"], "get">;
  repos: {
    get(path: string): ConfigRepo;
  };
}, openaiKey?: string): Promise<"ready" | "needs-openai-key">;
/** The build of voice the project RUNS: what the root package.json pins at the commit of
 *  `/repos/config` the platform last published (the `project` facet's `publishedCommit`), which
 *  the tip is not while an upgrade's publication is owed or after it was refused. Undefined before
 *  the first publication, or when that commit pins no such package. */
export declare function voiceVersion(project: {
  facets: {
    get(name: "project"): {
      snapshot(): Promise<{
        state: {
          publishedCommit: string | null;
        };
      }>;
    };
  };
  repos: {
    get(path: string): Pick<RepoHandle, "readFile">;
  };
}): Promise<string | undefined>;
/**
 * AN UPGRADE of the project's voice to `version`: the root package.json's pin, committed on the tip
 * it read (refused if main moved meanwhile; a file already so commits nothing, and the tip's outcome
 * answers), then that commit's outcome on `/`, past any give-up for now (`unavailable`), which
 * leaves it owed. Published, a press from 5 s on loads the new build (`voiceAgentFacetSpec`);
 * refused, main moving on included, it throws why and the person upgrades again. Answers the
 * commit. The agents app is the platform's own (iterate/agents) and upgrades with it.
 */
export declare function upgradeVoice(project: Pick<IterateContextApi, "waitForEvent"> & {
  repos: {
    get(path: string): ConfigRepo & Pick<RepoHandle, "commitFiles">;
  };
}, version: string): Promise<string | null>;
//#endregion