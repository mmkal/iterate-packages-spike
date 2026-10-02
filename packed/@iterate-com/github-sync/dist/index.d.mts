import { StreamProcessorDurableObject } from "iterate/sdk";
import { z } from "zod";
import { ProcessEventArgs, ProcessorState, ReduceArgs, StreamProcessor } from "iterate/stream/processor";
import { IterateContextApi } from "iterate/api";
//#region src/contract.d.ts
declare const GithubSyncContract: import("iterate/stream/contract").DefinedProcessorContract<z.ZodObject<{
  repo: z.ZodDefault<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>, Record<string, never>, readonly ["events.iterate.com/github/webhook-received", "events.iterate.com/repo/commit-completed", "github-sync/installed"], readonly [], readonly ["github-sync/synced"]>;
//#endregion
//#region src/processor.d.ts
type GithubSyncState = ProcessorState<typeof GithubSyncContract>;
declare class GithubSyncProcessor extends StreamProcessor<GithubSyncState> {
  #private;
  contract: import("iterate/stream/contract").DefinedProcessorContract<z.ZodObject<{
    repo: z.ZodDefault<z.ZodNullable<z.ZodString>>;
  }, z.core.$strip>, Record<string, never>, readonly ["events.iterate.com/github/webhook-received", "events.iterate.com/repo/commit-completed", "github-sync/installed"], readonly [], readonly ["github-sync/synced"]>;
  constructor(getItx: () => IterateContextApi & Disposable);
  reduce({ event }: ReduceArgs<GithubSyncState>): GithubSyncState | undefined;
  processEvent({ event, state, append, blockProcessorWhile }: ProcessEventArgs<GithubSyncState>): undefined;
}
//#endregion
//#region src/durable-object.d.ts
export declare class GithubSyncDurableObject extends StreamProcessorDurableObject<ProcessorState<typeof GithubSyncContract>> {
  processor: GithubSyncProcessor;
}
//#endregion