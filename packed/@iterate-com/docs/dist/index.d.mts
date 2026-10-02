import { s as DocLiveState } from "./frames-dfRBTV3e.mjs";
import { StreamProcessorDurableObject } from "iterate/sdk";
import { ProcessEventArgs, ProcessorState, ReduceArgs, StreamProcessor } from "iterate/stream/processor";
import { z } from "zod";
import { IterateContextApi } from "iterate/api";
//#region src/contract.d.ts
declare const DocContract: import("iterate/stream/contract").DefinedProcessorContract<z.ZodObject<{
  threads: z.ZodDefault<z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    quote: z.ZodNullable<z.ZodObject<{
      exact: z.ZodString;
      prefix: z.ZodString;
      suffix: z.ZodString;
    }, z.core.$strip>>;
    detached: z.ZodBoolean;
    resolved: z.ZodNullable<z.ZodObject<{
      by: z.ZodString;
      at: z.ZodString;
    }, z.core.$strip>>;
    comments: z.ZodArray<z.ZodObject<{
      id: z.ZodString;
      author: z.ZodString;
      via: z.ZodDefault<z.ZodNullable<z.ZodString>>;
      body: z.ZodString;
      at: z.ZodString;
      edited: z.ZodBoolean;
    }, z.core.$strip>>;
  }, z.core.$strip>>>;
}, z.core.$strip>, Record<string, never>, readonly ["docs/edit-frame", "docs/commit-noticed", "docs/left", ...string[]], readonly [], readonly ["docs/edit-frame", "docs/comment-reanchored"]>;
declare const DocsContract: import("iterate/stream/contract").DefinedProcessorContract<z.ZodObject<{
  opened: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>, Record<string, never>, readonly ["events.iterate.com/repo/commit-completed", "docs/opened"], readonly [], readonly ["docs/commit-noticed"]>;
//#endregion
//#region src/processor.d.ts
type DocState = ProcessorState<typeof DocContract>;
type DocDeps = {
  sql: SqlStorage;
  /** The doc's context, `/docs/<repo name>/<path>` (its `whoami()` names the doc). The repos
   *  are the root's (`itx.cd("/").repos`), which loaded code reaches from anywhere in its project. */
  getItx: () => IterateContextApi & Disposable;
  /** Re-project the live state after a change outside a batch (the host's `publishLiveState`). */
  publishLiveState: () => void;
  /** When to save: `idleMs` after the last edit, and at most `maxMs` after the first unsaved one. */
  autosave: {
    idleMs: number;
    maxMs: number;
  };
};
declare class DocProcessor extends StreamProcessor<DocState> {
  #private;
  contract: import("iterate/stream/contract").DefinedProcessorContract<import("zod").ZodObject<{
    threads: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodObject<{
      id: import("zod").ZodString;
      quote: import("zod").ZodNullable<import("zod").ZodObject<{
        exact: import("zod").ZodString;
        prefix: import("zod").ZodString;
        suffix: import("zod").ZodString;
      }, import("zod/v4/core").$strip>>;
      detached: import("zod").ZodBoolean;
      resolved: import("zod").ZodNullable<import("zod").ZodObject<{
        by: import("zod").ZodString;
        at: import("zod").ZodString;
      }, import("zod/v4/core").$strip>>;
      comments: import("zod").ZodArray<import("zod").ZodObject<{
        id: import("zod").ZodString;
        author: import("zod").ZodString;
        via: import("zod").ZodDefault<import("zod").ZodNullable<import("zod").ZodString>>;
        body: import("zod").ZodString;
        at: import("zod").ZodString;
        edited: import("zod").ZodBoolean;
      }, import("zod/v4/core").$strip>>;
    }, import("zod/v4/core").$strip>>>;
  }, import("zod/v4/core").$strip>, Record<string, never>, readonly ["docs/edit-frame", "docs/commit-noticed", "docs/left", ...string[]], readonly [], readonly ["docs/edit-frame", "docs/comment-reanchored"]>;
  constructor(deps: DocDeps);
  reduce({ event, state }: ReduceArgs<DocState>): DocState | undefined;
  projectLiveState(state: DocState): DocLiveState;
  processEvent({ event, state, delivery, blockProcessorWhile, runInBackground }: ProcessEventArgs<DocState>): undefined;
  /** A browser joining, or syncing again: `client` (its Yjs client id) is here until it sends
   *  `docs/left`. Answers the processor's state past `stateVector` (base64), after taking in any
   *  commit made since the last sync, and its own state vector, for the browser to send back what
   *  the processor lacks. */
  sync(stateVector: string, client: number): Promise<{
    update: string;
    stateVector: string;
    commitOid: string;
  }>;
}
//#endregion
//#region src/root.d.ts
type DocsState = ProcessorState<typeof DocsContract>;
declare class DocsProcessor extends StreamProcessor<DocsState> {
  #private;
  contract: import("iterate/stream/contract").DefinedProcessorContract<z.ZodObject<{
    opened: z.ZodDefault<z.ZodArray<z.ZodString>>;
  }, z.core.$strip>, Record<string, never>, readonly ["events.iterate.com/repo/commit-completed", "docs/opened"], readonly [], readonly ["docs/commit-noticed"]>;
  constructor(getItx: () => IterateContextApi & Disposable);
  reduce({ event, state }: ReduceArgs<DocsState>): DocsState | undefined;
  processEvent({ event, state, blockProcessorWhile }: ProcessEventArgs<DocsState>): undefined;
}
//#endregion
//#region src/durable-object.d.ts
export declare class DocDurableObject extends StreamProcessorDurableObject<ProcessorState<typeof DocContract>> {
  static publicMethods: string[];
  processor: DocProcessor;
  sync(stateVector: string, client: number): Promise<{
    update: string;
    stateVector: string;
    commitOid: string;
  }>;
}
export declare class DocsDurableObject extends StreamProcessorDurableObject<ProcessorState<typeof DocsContract>> {
  processor: DocsProcessor;
}
//#endregion