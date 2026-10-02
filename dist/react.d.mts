import { C as StreamEvent } from "./contract-D1J6d08G.mjs";
import { mt as SubscriptionListEntry } from "./api-DYAY3SD8.mjs";
import { LiveStateItx, LiveStateSeed } from "./client.mjs";
import { DependencyList } from "react";
//#region src/client/event-log.d.ts
/** How much of the log to read: the newest page, older ones on request — or all of it. */
type EventLogHistory = "tail" | "all";
/** One presence: who acted on the context and when last, from the log's stamps. */
type IterateContextPresence = {
  actor: string;
  email?: string;
  grant?: string;
  lastSeenAt: string;
};
//#endregion
//#region src/client/react.d.ts
export type LiveStateStatus = "connecting" | "live" | "error";
/** One live state as a component reads it: the latest value (undefined until the first seed lands),
 *  the revision it is at, whether its subscription is connecting, live or failed, and the failure. */
export type LiveStateResult<S = unknown> = {
  value: S | undefined;
  rev: number | null;
  status: LiveStateStatus;
  error?: string;
};
/** Subscribe to a producer's live state and render its latest value. Pass a ready `itx` (a capnweb
 *  `api.authenticate(credentials).user` or `.projects.get(id)`), the producer's `key`, and a `readSeed`
 *  thunk that reads `{rev, state}` (`() => itx.invoke("itx.facets.get('slug').liveSnapshot()")`).
 *  Re-subscribes when the session, `key`, or `name` changes; unmount (and every re-subscribe)
 *  disposes the previous server-side subscription. */
export declare function useLiveState<S>(itx: LiveStateItx | undefined, opts: {
  key: string;
  name?: string;
  readSeed: () => Promise<LiveStateSeed<S>>;
}): LiveStateResult<S>;
/** The live state of a facet hosted on a held context — `useLiveState` seeded by the facet's own
 *  `liveSnapshot()` (`{ rev, state }`). The value is unparsed: deltas arrive unvalidated, so a
 *  caller parses what it reads (`Schema.safeParse(live.value)`). */
export declare function useFacetLiveState(itx: (LiveStateItx & {
  invoke(call: string): Promise<unknown>;
}) | undefined, facet: string): LiveStateResult<unknown>;
type ContextStubState<S> = {
  stub?: S;
  error?: string;
  pending: boolean;
};
/** Hold a capnweb context stub for as long as the component wants it: `open()` —
 *  `() => api.projects.get(id)`, `() => root.cd(path)` — runs when `deps` change, and the stub is
 *  disposed on unmount, on every re-open, and when it arrives after the component moved on (every
 *  open stub is a subscription row and a pinned Durable Object on the platform). `open` null opens
 *  nothing; `pending` while an open is in flight; `error` the refusal. */
export declare function useContextStub<S extends Disposable>(open: (() => PromiseLike<S>) | null, deps: DependencyList): ContextStubState<S>;
/** The slice of a context handle `useIterateContext` reads — a capnweb `IterateContextApi` stub
 *  satisfies it structurally. `invoke` seeds a named facet's live state
 *  (`itx.facets.get('<name>').liveSnapshot()`, as an expression). */
export type IterateContextHandle = LiveStateItx & {
  readEvents(afterOffset?: number, limit?: number): Promise<{
    events: unknown[];
    atHead: boolean;
    scannedThroughOffset: number;
  }>;
  subscriptions: {
    list(): Promise<SubscriptionListEntry[]> | SubscriptionListEntry[];
  };
  rpcStubs: {
    list(): Promise<string[]> | string[];
  };
  invoke(call: string): Promise<unknown>;
};
/** THE ITERATE CONTEXT, live — one hook, one stream subscription. THE LOG (client/event-log.ts):
 *  subscribe to every committed event (or `consumes`) BEFORE the catch-up read, so nothing lands
 *  between the two; pushes and pages both dedupe by offset into one sorted array, published at most
 *  once a frame; `caughtUp` once the read reached the head; `error` when the connect failed.
 *  `history: "tail"` (the default) reads the newest page only — a context of 100,000 events opens
 *  as fast as one of 10 — and `older.loadOlder()` reads the page below what is held; `"all"` reads
 *  every page from the first, for a consumer that folds the whole log (the agents chat). `head` is
 *  the newest offset known, so a view can say how much of the log it holds. Off that same log, THE SUBSCRIPTIONS TABLE (`itx.subscriptions.list()`:
 *  every subscriber — a row that hosts a facet is a processor — with its delivery cursor), re-read
 *  whenever the log grows a row-changing event (a subscription configured, halted or resumed — the
 *  table is core state, one call away, no push of its own) and as the head moves (at most once a
 *  second, so a cursor's confirmed offset follows its deliveries), and WHO IS HERE: the rpc stubs lent right now
 *  (`itx.rpcStubs.list()` — physical, re-read at every new head, since presence changes are
 *  ephemeral facts) and, from the log, every principal that acted, newest first. And named facets'
 *  LIVE STATE, each seeded through `itx.facets.get('<name>').liveSnapshot()` — one entry per name,
 *  always; `core`, the core reduce, has no live state and is its `snapshot()` re-read at each new
 *  head (its `rev` the snapshot's offset). `liveState` OMITTED opens `core` plus every
 *  hosted facet in the processors table the hook holds, following the table as it loads and changes;
 *  `liveState` GIVEN is exactly the names to open, no implicit `core`. Re-connects when `itx`
 *  changes; unmount disposes every server-side subscription. */
export declare function useIterateContext(itx: IterateContextHandle | undefined, opts?: {
  consumes?: string[];
  liveState?: string[];
  history?: EventLogHistory;
}): {
  events: StreamEvent[];
  caughtUp: boolean;
  error?: string;
  head: number;
  older: {
    loadOlder(): void;
    loading: boolean;
    exhausted: boolean;
  };
  processors: {
    rows: SubscriptionListEntry[];
    loaded: boolean;
    error?: string;
  };
  presence: {
    actors: IterateContextPresence[];
    rpcStubs: string[];
  };
  liveState: Record<string, LiveStateResult>;
};
//#endregion
export type { IterateContextPresence };
//# sourceMappingURL=react.d.mts.map