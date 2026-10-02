//#region src/lib.d.ts
/** The stable machine-readable codes — SCREAMING_SNAKE, defined once, both ends import this. */
type ErrorCode = "SCHEDULE_LIMIT" | "INVALID_INPUT" | "IDENTITY_CONFLICT" | "GRANT_NOT_FOUND" | "SECRET_NOT_SET" | "NO_ITX_EXPRESSION_MATCH" | "IDEMPOTENCY_CONFLICT" | "OFFSET_CONFLICT" | "EVENT_TOO_LARGE" | "REDUCE_CHECKPOINT_TOO_LARGE" | "EVENT_UNREADABLE" | "STREAM_PAUSED" | "INVALID_CONTEXT" | "EXPRESSION_TOO_LONG" | "FACET_SOURCE_TOO_LARGE" | "INVALID_CREDENTIALS" | "UNAUTHENTICATED" | "FORBIDDEN" | "PROJECT_NAME_TAKEN" | "RPC_STUB_OFFLINE" | "NOT_A_METHOD" | "NO_FACET" | "FACET_ABORTED" | "FACET_RESTARTED" | "FACET_NO_UPGRADE" | "WAIT_TIMEOUT" | "NOT_FAST_FORWARD" | "TIMEOUT" | "GONE" | "LOOP_LIMIT" | "UNAVAILABLE" | "PERMANENT_FAILURE";
/** A plain Error carrying `code` (+ optional `data`) as own enumerable properties. */
declare function codedError(code: ErrorCode, message: string, data?: unknown): Error;
/** The code of an error that crossed any number of hops — undefined for uncoded errors. */
declare function errorCode(error: unknown): ErrorCode | undefined;
/** OUR MARK (core/os cause.ts): what the platform sends — a request, a mail — carries the cause of
 *  the code that sent it here, as JSON; a request that comes back with it resumes its chain. */
declare const ITERATE_CAUSE_HEADER = "X-Iterate-Cause";
/** What marks a 508 as an act refused past the loop limit (core/os unavailable.ts). */
declare const LOOP_LIMIT_HEADER = "iterate-loop-limit";
/** An answer refused past the loop limit — a 508 marked so — as the LOOP_LIMIT refusal it is,
 *  already recorded where it was met; none for any other answer. */
declare function loopLimitOf(answer: Response): Promise<Error | undefined>;
type Scalar = string | number | boolean | null;
/** One reported issue as `reportIssue` prints it, and the value that was caught. */
type Issue = {
  failureSite: string;
  caught: unknown;
  attributes: Record<string, Scalar>;
};
/** Also hand every issue to `forward` (one per isolate; the last call wins). It runs inside
 *  `reportIssue`'s armor: a throw is swallowed. */
declare function forwardIssues(forward: (issue: Issue) => void): void;
/** Print ONE bounded console.error line for an unexpected failure; never throws. */
declare function reportIssue(failureSite: string, caught: unknown, attributes?: Record<string, Scalar | undefined>): void;
/** Release each of `rpcSessions`, the last first. The answer they served is already in, so a release
 *  that throws is reported, never made the call's failure. */
declare function releaseRpcSessions(rpcSessions: readonly unknown[]): void;
type PatchOp = {
  op: "add";
  path: string;
  value: unknown;
} | {
  op: "replace";
  path: string;
  value: unknown;
} | {
  op: "remove";
  path: string;
};
/** Structural deep-equal over plain JSON values — order-insensitive, unbudgeted (JSON is acyclic).
 *  THE one deep-equal: the live-state diff's "don't emit" test AND the idempotency-body compare
 *  (re-exported through stream/processor.ts). The `Object.hasOwn(b, k)` guard is load-bearing — without
 *  it, two objects with the same key COUNT but different key SETS compare equal. */
declare function jsonEqual(a: unknown, b: unknown): boolean;
/** Structural diff `a → b`, or undefined when deep-equal (the producer's "don't emit" signal).
 *  Objects recurse per key; arrays get the chat-log fast paths (pure append → `add …/-` ops,
 *  pure tail-truncate → `remove` ops) and are replaced wholesale on any middle divergence —
 *  the LiveView trade: optimize the growing log, full-render the rewrite.
 *  Both sides are JSON-normalized first — the wire is JSON, so the diff must see exactly what
 *  the wire will carry: undefined-valued keys vanish, Dates become their ISO strings, array
 *  holes become null. Diffing what you didn't normalize is how a Date change goes silent. */
declare function diff(a: unknown, b: unknown): PatchOp[] | undefined;
/** Apply a patch non-mutatingly (clone-then-mutate). The client half of `diff` — exported
 *  through the SDK so subscribers need no third-party json-patch dependency. */
declare function applyPatch<T>(doc: T, ops: PatchOp[]): T;
declare function withTimeout<T>(promise: Promise<T>, ms: number, what: string | (() => string)): Promise<T>;
/** Bytes to base64, chunked so a long buffer cannot overflow the call stack's argument list. */
declare function bytesToBase64(bytes: Uint8Array): string;
/** Whether `request` may spend the cookies it carries: its `Origin` header is this origin, or absent
 *  (a non-browser client — curl, a script). A browser stamps the page's origin on every WebSocket
 *  handshake, every cross-site fetch and every form POST, so a foreign origin means a foreign site
 *  drove the request with the visitor's cookie riding along. A malformed `Origin` (the literal
 *  `null` of a sandboxed document included) is foreign. */
declare function isSameOriginBrowserRequest(request: Pick<Request, "url" | "headers">): boolean;
/** The value of the cookie `name` in a `Cookie` header, or null. */
declare function cookieValueOf(cookieHeader: string | null, name: string): string | null;
/** `next` as a path on `origin`, else "/" — a redirect never leaves the host: `//evil.example`,
 *  `/\evil.example` and an absolute URL all resolve to a foreign origin and fall back to "/". The
 *  issuer's login redirect uses it too (core/os issuer-pages.ts). */
declare function sameOriginPath(next: string, origin: string): string;
/** Only plain HTTP loopback origins use development login and client registration. */
declare function isLocalOrigin(origin: string): boolean;
/** Resolve a `cd` target against a context's own path — the one resolver every `cd` (the edge
 *  method, the built-in root, the library's relative handles) shares. Absolute ("/agents/x") stands alone; relative
 *  ("agents/x", "../inbox", ".") joins onto `base`. `.` and `..` resolve; the root cannot be
 *  escaped ("/.." is "/"). The result is canonical: leading slash, no trailing slash but for "/". */
declare function resolveContextPath(basePath: string, contextPath: string): string;
/**
 * Which deployment a page is on, told apart in the browser tab: a per-PR preview gets a purple icon
 * with its PR number and a `[pr<N>]` title prefix, local dev a teal icon and `[dev]`, and
 * production keeps the app's own plain logo and its titles untouched, in every client.
 *
 * Read from the page's own hostname, the one fact the Worker, the server render and the browser
 * all agree on, so no env var or config carries it (envs.ts names the hosts):
 * - `pr<N>-<sha7>-<app>.<subdomain>.workers.dev`: a PR's per-commit deployment (scripts/os/preview.ts)
 * - `localhost`, `*.localhost`, `127.0.0.1`: `pnpm dev`
 * - anything else: production (os.iterate.com, dash.iterate.com, agents.iterate.com, …)
 *
 * Rendered by environment-head-content.tsx in every client's root (packages/ui's, and core/os's own
 * copy), and by the OS's `/favicon.svg` (core/os/src/issuer-pages.ts), which the SDK's gate pages
 * link.
 */
declare function deploymentEnvironment(hostname: string): {
  kind: "preview";
  pr: number;
  deployment: string;
} | {
  pr?: undefined;
  deployment?: undefined;
  kind: "dev";
} | {
  pr?: undefined;
  deployment?: undefined;
  kind: "production";
};
type DeploymentEnvironment = ReturnType<typeof deploymentEnvironment>;
/** `Dash` → `[pr2990] Dash` on a preview, `[dev] Dash` locally, `Dash` in production. */
declare function environmentTitle(environment: DeploymentEnvironment, title: string): string;
/** Production's icon is the app's own file (`productionHref`), byte for byte; preview and dev get
 *  an inline SVG, so no app ships or routes a second file. */
declare function environmentFaviconHref(environment: DeploymentEnvironment, productionHref: string): string;
/**
 * Preview: purple, the PR number in white as large as the square allows (PR numbers run to four
 * digits and more, too many for the corner badge iterate/iterate#2197 drew for single-digit preview slots).
 * Dev: teal, the white iterate mark (core/os/public/iterate-logo.svg's paths).
 */
declare function environmentFaviconSvg(environment: Exclude<DeploymentEnvironment, {
  kind: "production";
}>): string;
//#endregion
export { resolveContextPath as C, reportIssue as S, withTimeout as T, isLocalOrigin as _, PatchOp as a, loopLimitOf as b, codedError as c, diff as d, environmentFaviconHref as f, forwardIssues as g, errorCode as h, LOOP_LIMIT_HEADER as i, cookieValueOf as l, environmentTitle as m, ITERATE_CAUSE_HEADER as n, applyPatch as o, environmentFaviconSvg as p, Issue as r, bytesToBase64 as s, DeploymentEnvironment as t, deploymentEnvironment as u, isSameOriginBrowserRequest as v, sameOriginPath as w, releaseRpcSessions as x, jsonEqual as y };
//# sourceMappingURL=lib-BIINxNnh.d.mts.map