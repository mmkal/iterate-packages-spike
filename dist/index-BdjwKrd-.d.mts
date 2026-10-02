import { C as StreamEvent, T as StreamProcessor, w as StreamEventInput, x as ScannedRange } from "./contract-D1J6d08G.mjs";
import { D as InstalledAppRoots, M as IterateContextApiWith, j as IterateContextApi } from "./api-DYAY3SD8.mjs";
import { DurableObject, WorkerEntrypoint } from "cloudflare:workers";
import { newHttpBatchRpcSession as newHttpBatchRpcSession$1, newWebSocketRpcSession as newWebSocketRpcSession$1, newWorkersRpcResponse } from "capnweb";
//#region src/sdk/call-with-cause.d.ts
/** A step of `callWithCause`'s walk, which reaches no further than Workers RPC would: on this facet
 *  or an RpcTarget, a member its class declares (never a field of its own); anything on a stub; on
 *  plain data, its own members (never a method of data the facet holds live). */
/** An expression's steps past a host: a property, or a method and its arguments. */
type RpcSteps = (string | [string, ...unknown[]])[];
//#endregion
//#region src/sdk/index.d.ts
/** What the parent mints a facet's class with — the whole identity, and one fact about its feed. */
type FacetProps = {
  iterateContextName: string;
  name: string;
  /** Set when, as this facet started, a subscription row of its context pushed it every commit it
   *  consumes (`processEventBatch`, the delivery loop's push): a processor's engine then trusts the
   *  head a catch-up read until the next push (stream/processor.ts, the read verbs). Absent, only a
   *  push is proof, so a processor no row pushes reads its log on every read. */
  fedByPushes?: true;
  /** The code it was started on, as the parent names it (its loaded identity, or the deploy): work
   *  in flight that died with a restart onto other code is no death of that work (stream/processor.ts). */
  codeId?: string;
};
/** THE FACET SHELL: a `DurableObject` a context hosts as a facet — `itx.facets.get(name, { source,
 *  className })`, a rule naming it, or a processor's row. A caller reaches a facet by itx expression
 *  (`itx.facets.get(name).<method>(…)`) only through what its class lists in `publicMethods`: the
 *  context refuses any other first step FORBIDDEN before the call reaches the facet
 *  (core/os context/facet-public-methods.ts). The platform's own calls — the delivery loop's push
 *  and catch-up, the alarm's revive — never go through the list. A loaded class that does not
 *  extend this shell lists nothing, so no caller reaches it by expression. */
declare abstract class FacetDurableObject<Env extends {
  ITX?: ItxEntrypointService;
} = {
  ITX: ItxEntrypointService;
}, Scope = IterateContextApi> extends DurableObject<Env, FacetProps> {
  #private;
  /** What a caller may reach by itx expression: the FIRST step of `itx.facets.get(name).<step>…`, a
   *  method or a property of this class. A subclass lists its own on top of its parent's:
   *  `static override publicMethods = [...super.publicMethods, "send"]`. */
  static publicMethods: readonly string[];
  constructor(ctx: DurableObjectState, env: Env);
  /** THE CALL UNDER A CAUSE (`walkUnderCause`): a caller's `itx.facets.get(name).<steps>`, the
   *  alarm's revive. On no list: only the platform calls it (core/os context/facet-host.ts). */
  callWithCause(cause: unknown, steps: RpcSteps): Promise<unknown>;
  /** This class's `publicMethods`, for the context that loaded it — a static does not cross the
   *  isolate. On no list: only the context asks it. */
  listPublicMethods(): readonly string[];
  /** `using itx = this.getItx()`: this facet's context's scope, released with every call made
   *  through it when the block ends (itx-scope.ts). Keep no RPC values past the block; see
   *  test/vitest/os/context-residency.e2e.test.ts, "A FACET DOES NOT OUTLIVE ITS CONTEXT", for why.
   *  A field, not a method: Workers RPC reaches a class's methods, and no caller may get the scope. */
  protected readonly getItx: () => Scope & Disposable;
}
/** What hands the itx scope over — a loaded worker's `env.ITX`, or the loopback a class of the
 *  platform's own worker mints from `ctx.exports`: `get()` its scope (a context's declared API,
 *  api.ts, which a capnweb stub of core/os's `IterateContextRpcTarget` satisfies), or `fetch` a
 *  request through the context's dispatch (a fetch route's target, the `x-itx-expression` header). */
type ItxEntrypointService = {
  get(): IterateContextApi;
  fetch(request: Request): Promise<Response>;
};
/** The least a host needs of its scope: the fixed-point log calls the engine makes. The platform's own
 *  facets pass the Workers-RPC STUB of a context (every dotted step pipelined; a property there is a
 *  promise), which no plain-promise interface can name — so the constraint is this, not
 *  `IterateContextApi`. */
type ProcessorScope = {
  append(...events: StreamEventInput[]): Promise<unknown>;
  readEvents(afterOffset?: number, limit?: number): Promise<unknown>;
  /** The engine's claim on the context's alarm (processor.ts rule 3): "come back by `at`", or null. */
  processors: {
    claim(name: string, at: number | null): Promise<unknown>;
  };
  /** Another context of the project by its dotted surface (`.append`), which the platform's handle
   *  and a loaded worker's alike answer — how an entity's processor cross-posts its certificate to
   *  `/` (`itx.cd("/").append(certificate)`). Through the table like every other
   *  word here: anyone's `cd(path).append` reaches any context of the project, stamped with where
   *  it came from; a jail's bare null refuses it. */
  cd(path: string): {
    append(...events: StreamEventInput[]): Promise<unknown>;
  };
};
declare abstract class StreamProcessorDurableObject<State = unknown, Env extends {
  ITX?: ItxEntrypointService;
} = {
  ITX: ItxEntrypointService;
}, Scope extends ProcessorScope = IterateContextApi> extends FacetDurableObject<Env, Scope> {
  #private;
  /** The reads a caller reaches on every processor: `fetch`, and the state caught up through the log
   *  (`snapshot`, `liveSnapshot`) or awaited (`waitUntilProcessed`). What feeds the processor —
   *  `processEventBatch`, `catchUpFromLog`, `revive` — is the platform's, never a caller's. */
  static publicMethods: string[];
  /** The processor this object hosts — `processor = new PresenceProcessor()` at the top of the subclass. */
  abstract readonly processor: StreamProcessor<State>;
  /** After a runtime field on the processor moved OUTSIDE a batch (an RPC method on this object);
   *  inside `processEvent` the engine re-projects on its own. */
  protected publishLiveState(): void;
  /** THE push: the context hands over each committed batch with its scanned-range proof. */
  processEventBatch(events: StreamEvent[], range: ScannedRange): Promise<void>;
  /** Catch up from the log (the delivery loop's, when a row is configured or resumed). */
  catchUpFromLog(): Promise<void>;
  /** THE REVIVE: the context's alarm pass calls it for a due claim — catch up, then run the
   *  at-head pass, so an attempt the last incarnation was running is started again from state. */
  revive(): Promise<void>;
  /** Caught up through the log, then `{ offset, state }`. */
  snapshot(): Promise<{
    offset: number;
    state: State;
  }>;
  /** The live-state seed read: `{ rev, state: projectLiveState(reduced) }`. */
  liveSnapshot(): Promise<{
    rev: number;
    state: unknown;
  }>;
  /** The barrier: resolves once processed at least through `offset` (default timeout 10s). */
  waitUntilProcessed(input: {
    offset: number;
    timeoutMs?: number;
  }): Promise<void>;
}
/** What `processEvent` is handed: one event, and the project's root, typed with the installed apps
 *  the config repo's init case gives it (`IterateConfigProcessEventArgs<"agents">`). */
type IterateConfigProcessEventArgs<App extends keyof InstalledAppRoots = never> = {
  event: StreamEvent;
  itx: IterateContextApiWith<App>;
};
/** Stateless config entrypoint, the default export of a project's config repo; its init handles
 *  `events.iterate.com/project/worker-updated` (core/configs/default/worker.ts). */
declare abstract class IterateConfigEntrypoint<Env extends {
  ITX: ItxEntrypointService;
} = {
  ITX: ItxEntrypointService;
}> extends WorkerEntrypoint<Env> {
  /** At fetch entry: `const denied = this.auth.require(request); if (denied) return denied;`
   *  `x-itx-principal` is on a request only when a project member (or the operator) sent it, safe
   *  to act on. A private route written by hand answers the platform's sign-in challenge, which
   *  the edge turns into the sign-in for a page load (`auth.require` does the same):
   *
   *  ```js
   *  if (!request.headers.get("x-itx-principal"))
   *    return new Response("Sign in\n", { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="iterate"' } });
   *  ``` */
  protected readonly auth: {
    require(request: Request): Response | null;
  };
  constructor(ctx: ExecutionContext, env: Env);
  /** The platform's delivery of one event (the dispatch boundary refuses any other caller),
   *  through `callWithCause`: `processEvent` under ONE scope, released when it settles. */
  deliverEvent(event: StreamEvent): Promise<void>;
  /** THE CALL UNDER A CAUSE (`walkUnderCause`) every method but `fetch` is called through. On no
   *  list: only the platform calls it (core/os context/built-ins.ts `workers`). */
  callWithCause(cause: unknown, steps: RpcSteps): Promise<unknown>;
  /** `using itx = this.getItx()`: the project root's scope, released with every call made through
   *  it when the block ends (`FacetDurableObject.getItx` says why nothing is kept past it). A field,
   *  not a method: Workers RPC reaches an entrypoint's methods, and a caller must never get the
   *  scope (sdk/index.test.ts). */
  protected readonly getItx: () => IterateContextApi & Disposable;
  /** THE AUTHOR HOOK: every durable event of every context of the project from its first
   *  publication on (what was committed while no config was published may be passed over), one per
   *  call, unordered and at least once; a throw fails that event alone, which the platform retries.
   *  `itx` is the project's root, `itx.cd(event.path)` the event's own context. Make each reaction
   *  idempotent (an append keyed by `event.path` and `event.offset`) and keep no state here.
   *  Default: ignore it. */
  processEvent(_args: IterateConfigProcessEventArgs): void | Promise<void>;
  /** THE WEB ROOT — every Request on a host of the project that no fetch route takes (the platform
   *  serves those first: `itx.fetchRoutes`). The host's routing slug is in `x-iterate-routing-slug`
   *  (`notes` for `notes--<project>.<hostname>`; absent on the apex), written only by the platform:
   *  route on it in plain code, answering here (reaching the project through `this.getItx()`) or
   *  forwarding the Request. Default: not found. */
  fetch(_request: Request): Response | Promise<Response>;
}
//#endregion
export { ItxEntrypointService as a, newHttpBatchRpcSession$1 as c, IterateConfigProcessEventArgs as i, newWebSocketRpcSession$1 as l, FacetProps as n, ProcessorScope as o, IterateConfigEntrypoint as r, StreamProcessorDurableObject as s, FacetDurableObject as t, newWorkersRpcResponse as u };
//# sourceMappingURL=index-BdjwKrd-.d.mts.map