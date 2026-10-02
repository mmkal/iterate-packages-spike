import { StreamProcessorDurableObject } from "iterate/sdk";
import { z } from "zod";
import { ProcessEventArgs, ProcessorState, ReduceArgs, StreamProcessor } from "iterate/stream/processor";
import { IterateContextApi } from "iterate/api";
//#region src/contract.d.ts
declare const AiLinterContract: import("iterate/stream/contract").DefinedProcessorContract<z.ZodObject<{
  repository: z.ZodDefault<z.ZodNullable<z.ZodString>>;
  rules: z.ZodOptional<z.ZodString>;
  model: z.ZodOptional<z.ZodString>;
  queue: z.ZodDefault<z.ZodArray<z.ZodObject<{
    key: z.ZodString;
    offset: z.ZodNumber;
    connection: z.ZodString;
    repository: z.ZodString;
    number: z.ZodNumber;
    headSha: z.ZodString;
    baseSha: z.ZodString;
  }, z.core.$strip>>>;
}, z.core.$strip>, Record<string, never>, readonly ["events.iterate.com/github/webhook-received", "ai-linter/installed", "ai-linter/linted"], readonly [], readonly ["ai-linter/linted"]>;
//#endregion
//#region src/processor.d.ts
type AiLinterState = ProcessorState<typeof AiLinterContract>;
/** Where a lint keeps what it must not lose to a restart: the host's own storage (a Durable Object's
 *  `ctx.storage`), which outlives an incarnation. */
type LintStorage = Pick<DurableObjectStorage, "get" | "put" | "list" | "delete">;
declare class AiLinterProcessor extends StreamProcessor<AiLinterState> {
  #private;
  contract: import("iterate/stream/contract").DefinedProcessorContract<z.ZodObject<{
    repository: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    rules: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    queue: z.ZodDefault<z.ZodArray<z.ZodObject<{
      key: z.ZodString;
      offset: z.ZodNumber;
      connection: z.ZodString;
      repository: z.ZodString;
      number: z.ZodNumber;
      headSha: z.ZodString;
      baseSha: z.ZodString;
    }, z.core.$strip>>>;
  }, z.core.$strip>, Record<string, never>, readonly ["events.iterate.com/github/webhook-received", "ai-linter/installed", "ai-linter/linted"], readonly [], readonly ["ai-linter/linted"]>;
  constructor(getItx: () => IterateContextApi & Disposable, storage: LintStorage);
  reduce({ event, state }: ReduceArgs<AiLinterState>): AiLinterState | undefined;
  processEvent({ state, delivery, append, runInBackground }: ProcessEventArgs<AiLinterState>): undefined;
}
//#endregion
//#region src/durable-object.d.ts
export declare class AiLinterDurableObject extends StreamProcessorDurableObject<AiLinterState> {
  processor: AiLinterProcessor;
}
//#endregion