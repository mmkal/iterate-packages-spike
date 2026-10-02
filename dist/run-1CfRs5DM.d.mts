import { z } from "zod";
//#region src/stream/run.d.ts
/** `events.iterate.com/itx/run-requested`: the whole script — the text of `async (itx) => …`.
 *  The event's own OFFSET is the run's identity: the settlement names it back. A caller's request
 *  starts at its commit; a processor's (the engine stamps `source.processor`) in the context's next
 *  alarm pass, a fresh invocation, so a processor's turns never pile up call depth. */
declare const RunRequested: z.ZodObject<{
  code: z.ZodString;
}, z.core.$strip>;
type RunRequested = z.infer<typeof RunRequested>;
/** `events.iterate.com/itx/run-settled`: `requestOffset` names the request; `settlement` is
 *  what the script returned (JSON — a round trip drops what JSON cannot carry) or how it failed —
 *  `runtime` (the script threw, or returned what the log refuses), `deadline` (it had not finished
 *  when its time ran out; it may have partly run) or `interrupted` (the context restarted, or
 *  Cloudflare replaced its instance, before the run's settlement was written — it may have partly
 *  run — or before a processor's request started). A failed run is never run again. */
declare const RunSettled: z.ZodObject<{
  requestOffset: z.ZodNumber;
  settlement: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"succeeded">;
    result: z.ZodOptional<z.ZodUnknown>;
  }, z.core.$strip>, z.ZodObject<{
    status: z.ZodLiteral<"failed">;
    error: z.ZodString;
    failureKind: z.ZodEnum<{
      deadline: "deadline";
      interrupted: "interrupted";
      runtime: "runtime";
    }>;
  }, z.core.$strip>], "status">;
}, z.core.$strip>;
/** A failed run's error as its caller meets it: the settlement's `error` as the message, its
 *  `failureKind` on the error. */
declare const RunFailure: z.ZodObject<{
  failureKind: z.ZodEnum<{
    deadline: "deadline";
    interrupted: "interrupted";
    runtime: "runtime";
  }>;
}, z.core.$strip>;
type RunSettled = z.infer<typeof RunSettled>;
type RunSettlement = RunSettled["settlement"];
/** THE RUN DEADLINE: ten minutes from the moment the context's runner starts a script. A run still
 *  going then is settled `failed` / `deadline` (core/os/src/library.ts), so a reader of the log
 *  counts a running script down to its request's time plus this. Ten minutes is what an agent's
 *  turn already allows: its model request expires after ten. */
declare const RUN_DEADLINE_MS: number;
/** The run events' catalog. The core owns them (core/os core-processor.ts); a processor that
 *  consumes them names this catalog in its `processorDeps`. */
declare const RunEventCatalog: {
  events: {
    "events.iterate.com/itx/run-requested": {
      description: string;
      payloadSchema: z.ZodObject<{
        code: z.ZodString;
      }, z.core.$strip>;
    };
    "events.iterate.com/itx/run-settled": {
      description: string;
      payloadSchema: z.ZodObject<{
        requestOffset: z.ZodNumber;
        settlement: z.ZodDiscriminatedUnion<[z.ZodObject<{
          status: z.ZodLiteral<"succeeded">;
          result: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>, z.ZodObject<{
          status: z.ZodLiteral<"failed">;
          error: z.ZodString;
          failureKind: z.ZodEnum<{
            deadline: "deadline";
            interrupted: "interrupted";
            runtime: "runtime";
          }>;
        }, z.core.$strip>], "status">;
      }, z.core.$strip>;
    };
  };
};
//#endregion
export { RunSettled as a, RunRequested as i, RunEventCatalog as n, RunSettlement as o, RunFailure as r, RUN_DEADLINE_MS as t };
//# sourceMappingURL=run-1CfRs5DM.d.mts.map