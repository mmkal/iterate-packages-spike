//#region src/platform-retry.d.ts
/** The five kinds of failure (docs/engineering-invariants.md#failures-and-retries): an expected
 *  outcome, coded (`refused`); a deploy's reset of a Durable Object or of D1 (`deploy-reset`);
 *  capnp's DISCONNECTED, "re-establish connections and try again" (`disconnected`); capnp's
 *  OVERLOADED, "should NOT be repeated immediately as this may simply exacerbate the problem"
 *  (`overloaded`; both kj/exception.h); anything else, our own defects included (`failed`). The hop
 *  that first sees a failure decides its kind, and the kind rides on as code UNAVAILABLE's
 *  `data.kind`, which Workers RPC and capnweb both keep. */
export type FailureKind = "refused" | PlatformFailureKind | "failed";
/** A failure of the platform's own: the kinds code UNAVAILABLE carries. */
export type PlatformFailureKind = "deploy-reset" | "disconnected" | "overloaded";
/** How long a caller waits before asking again after each platform failure: the `retryAfterMs` of
 *  code UNAVAILABLE and an edge answer's `Retry-After`. A deploy's reset and a lost connection are
 *  over by the time a person asks again. An overload is not: 10 s lets a burst drain before its
 *  callers come back ("scheduling to retry the operation much later", capnp rpc.capnp). */
export declare const RETRY_AFTER_MS: Record<PlatformFailureKind, number>;
/** A failure's kind, read off what workerd and our own code stamp on it, then off the messages
 *  Cloudflare documents for failures that arrive without the stamp. */
export declare function failureKind(error: unknown): FailureKind;
/** Whether `error`, or a cause it wraps, is workerd's opaque "internal error; reference = …"
 *  (jsg/util.c++ `renderInternalError`): a failure hidden from JavaScript, whether the runtime's own
 *  or a defect of the code it ran (a facet whose class is not exported fails the same way), so
 *  `failureKind` reads it as `failed`. Only a caller whose callee runs no code of ours or a
 *  project's can read it as the runtime's own (control-plane/edge.ts, over D1). */
export declare const isOpaqueInternalError: (error: unknown) => boolean;
export declare const isPlatformFailureKind: (kind: unknown) => kind is PlatformFailureKind;
/** An HTTP answer that is not a success: its status is what `httpFailureKind` reads, and its
 *  `Retry-After` how long the far side asked to be left alone, which `retryPlatformFailures`
 *  honors. */
export declare class HttpAnswerError extends Error {
  readonly status: number;
  readonly retryAfterMs: number | undefined;
  constructor(message: string, answer: Pick<Response, "status" | "headers">);
}
/** A failed HTTP call's kind: a 429 or 408 is the far side asking for a slower pace (overloaded), a
 *  5xx or a connection that failed before any answer (`fetch` rejects with a TypeError) is the far
 *  side's failure (disconnected), any other status an answer about the request (refused). Anything
 *  else is read as `failureKind` reads it: a timeout or an abort of the caller's own is `failed`. */
export declare function httpFailureKind(answer: unknown): FailureKind;
/**
 * Whether an answer is CLOUDFLARE'S OWN NOT-FOUND FOR A workers.dev HOSTNAME THE SERVER DOES NOT
 * ROUTE YET: a failure of kind `disconnected`, since the request never reached a Worker, which makes
 * it safe to send again whatever its method. A brand-new Worker's hostname reaches Cloudflare's
 * servers one by one, and a connection that lands on one that has not learned it yet gets one of
 * three answers only Cloudflare gives. The first is a 404 with `x-preview-user-error: true`, the
 * "There is nothing here yet" page, when the hostname also reads as `<alias>-<worker>`, a preview URL
 * of an existing Worker with preview URLs on (every per-commit deployment's does:
 * `<prefix>-<sha7>-os` of `os`). The others are a 404 whose body is `error code: 1042` and a 500 whose
 * body is `error code: 1104`. The page decides by its header, so `body` is read only for a small
 * plain answer; a Worker's own 404 or 500 is never one of these.
 */
export declare function isNotRoutedYet(answer: {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  body?: string;
}): boolean;
/** What a script's log line says about a failed HTTP call: its status (`network` when no answer
 *  came) and its message. */
export declare function httpFailureFields(error: unknown): {
  status: string | number;
  message: string;
};
/**
 * When a call the platform failed is made again: the wait before each repeat, and whether an
 * overloaded failure is repeated too. Each wait is jittered down to between half and all of itself
 * ("equal jitter", https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/), so a
 * burst's repeats spread out. A `Retry-After` longer than a wait replaces it, up to the schedule's
 * longest wait, so no wait runs past that.
 */
export type Schedule = {
  delaysMs: readonly number[];
  repeatsOverload: boolean;
};
/** One repeat, now: capnp's answer to DISCONNECTED, "disconnect and start over" (rpc.capnp): on a
 *  fresh Durable Object stub, since "many exceptions leave the DurableObjectStub in a broken state"
 *  (https://developers.cloudflare.com/durable-objects/best-practices/error-handling/). A second
 *  failure is capnp's OVERLOADED, and the caller's. */
export declare const ONCE_NOW: Schedule;
/** One repeat a second later: an upstream service's passing internal error (Artifacts' 10400,
 *  Browser Run's 6002 on inline HTML, a git remote's 5xx), fine a moment later. */
export declare const UPSTREAM_ONCE: Schedule;
/** A relay's lend, whose connection to the Durable Object a burst of lends can drop: once now, then
 *  twice more within the four seconds the object's 10 s page timeout leaves room for. */
export declare const RELAY_BURST: Schedule;
/** A CI script's call on another service's API: about 17 s in all. A 429 is repeated too: the
 *  script is the caller waiting it out. */
export declare const CI_HTTP: Schedule;
/** A deploy's or a preview's call on Cloudflare's API, a wrangler command's included: two to four
 *  minutes in all. The API allows 1,200 requests per five minutes per user
 *  (https://developers.cloudflare.com/fundamentals/api/reference/limits/), which parallel preview
 *  deploys share, so a rate-limited window lasts minutes: Cloudflare has answered
 *  `Retry-After: 120`. The last wait is that long, so a direct call waits out the whole window it
 *  was asked to, and a wrangler command, which cannot see the header, runs a last time after it. */
export declare const CLOUDFLARE_API: Schedule;
/** THE DURABLE LADDER's wait before attempt `attempt` (1-based) of a delivery that failed: 1 s·2ⁿ,
 *  capped at `capMs` (30 minutes, unless a longer ladder names its own), ±20% jitter. Durable: the
 *  rung is written down and an alarm fires it, so an overloaded failure is repeated here and never
 *  in the call. */
export declare const durableLadderDelayMs: (attempt: number, capMs?: number) => number;
/**
 * `attempt`, made again after each of the schedule's waits while it fails with a platform failure
 * and running it twice is running it once (`idempotent`). An overloaded failure is repeated only by
 * a schedule that `repeatsOverload`; every other kind (a refusal, our own defect) is thrown at once.
 * `idempotent` may read the failure: a request the far side refused unrun is safe to send again.
 * Recovery is bounded: the last failure is thrown, and once the caller's `signal` aborts no repeat
 * starts and no wait runs on.
 *
 * Each repeat logs one line, and so does giving up on an idempotent call the platform still fails
 * (`logPlatformFailure`): `<area>.deploy-reset-retry` at info, `<area>.platform-failure-retry` at
 * warn, then `<area>.…-gave-up`. `describe` says what else a line carries: the call's `name`, which
 * the prd fault alarm groups by, and what it named.
 */
export declare function retryPlatformFailures<T>(attempt: () => Promise<T>, options: {
  area: string;
  schedule: Schedule;
  idempotent: boolean | ((error: unknown) => boolean);
  kind: (error: unknown) => FailureKind;
  describe: (error: unknown) => Record<string, unknown>;
  signal?: AbortSignal;
}): Promise<T>;
/** A schedule's wait, jittered down to between half and all of itself (`Schedule`). */
export declare const jitteredMs: (delayMs: number) => number;
/**
 * A script's HTTP request on another service's API, sent again as `retryPlatformFailures` makes a
 * call again, on `schedule` (CI_HTTP unless named): the first answer that is not the far side's
 * failure (a success, or an answer about the request, which is the caller's). A 5xx, a 429 or 408,
 * a connection that failed and an attempt that got no answer within `timeoutMs` (our own deadline,
 * an overload) are the far side's; the last of them is thrown, an answer's as an HttpAnswerError
 * that quotes it. Anything else `send` throws is our own, thrown at once. Only an `idempotent`
 * request is sent again, except after a 429, which the far side refused unrun (RFC 6585 §4). Each
 * retry is a `<area>.platform-failure-retry` warn naming the request (`what`). The caller's
 * `signal` aborts the attempt in flight and ends the schedule.
 */
export declare function fetchRetryingPlatformFailures(what: string, send: (signal: AbortSignal) => Promise<Response>, options: {
  area: string;
  idempotent: boolean;
  schedule?: Schedule;
  timeoutMs?: number;
  signal?: AbortSignal;
}): Promise<Response>;
/** One line about a platform failure, named `<area>.<outcome>` by the one rule: a deploy's reset
 *  is expected, `<area>.deploy-reset-<action>` at info; any other is the platform's failure,
 *  `<area>.platform-failure-<action>` at warn, which the prd fault alarm counts
 *  (scripts/ci/prd-fault-alarm.ts). */
export declare function logPlatformFailure(area: string, action: string, kind: PlatformFailureKind, fields: Record<string, unknown>): void;
//#endregion
//# sourceMappingURL=platform-retry.d.mts.map