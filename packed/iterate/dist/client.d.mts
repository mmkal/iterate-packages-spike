import { a as PatchOp } from "./lib-BIINxNnh.mjs";
//#region src/client/live-state.d.ts
/** One live-state delta off the wire — the payload of an `events.iterate.com/itx/live-state-changed`
 *  ephemeral event, delivered raw to the subscriber. `patch: null` = the change was too large to
 *  send — the rev moved, re-read the seed. */
export type LiveStateDelta = {
  key: string;
  from: number;
  to: number;
  patch: PatchOp[] | null;
};
/** What the producer's seed read returns: the current revision paired with the current value. */
export type LiveStateSeed<S> = {
  rev: number;
  state: S;
};
export type LiveStateStore<S> = {
  /** The current value, or undefined until the first seed lands. */
  get(): S | undefined;
  /** The held revision, or null before the first seed. */
  rev(): number | null;
  /** Subscribe to changes (for React's useSyncExternalStore, or a test's await-loop). */
  subscribe(listener: () => void): () => void;
  /** Seed (or re-seed) from a seed read — the first paint, and the heal after a gap. */
  seed(seed: LiveStateSeed<S>): void;
  /** Reduce one delta in; on a revision gap call `resync` and hold the value until a fresh seed. */
  apply(delta: LiveStateDelta, resync: () => void): void;
};
export declare function createLiveStateStore<S>(): LiveStateStore<S>;
/** The slice of an itx session this needs — a capnweb `IterateContextRpcTarget` proxy satisfies it structurally:
 *  `subscribe` hands back a DISPOSABLE handle (disposing it removes the subscription server-side). */
export type LiveStateItx = {
  subscribe(input: {
    name?: string;
    consumes?: string[];
    target: (events: unknown[], range: unknown) => void;
  }): Promise<{
    [Symbol.dispose](): void;
  }>;
};
/** A connected live-state subscription: the store rendering it, and the dispose that removes the
 *  server-side subscription (the handle's disposer; the session's end does the same). */
export type LiveStateConnection<S> = {
  store: LiveStateStore<S>;
  /** Unsubscribe on the server and stop reducing deltas. Safe to call more than once. */
  dispose(): Promise<void>;
};
/** Subscribe to a producer's live state and reduce it into a store. `readSeed` reads the seed
 *  (`itx.invoke("itx.facets.get('slug').liveSnapshot()")` for a processor, or a mini-app's
 *  own `state()` method). Subscribe happens BEFORE the first seed, so a delta racing the seed just
 *  triggers one seed re-read — never a lost update. Gap heals are SINGLE-FLIGHT (a burst of gapped
 *  frames triggers one seed read, not one per frame); a failed heal is reported through `onResync`
 *  and retried by the next delivered delta (its `from` still mismatches, so it re-triggers). */
export declare function connectLiveState<S>(itx: LiveStateItx, opts: {
  key: string;
  name?: string;
  readSeed: () => Promise<LiveStateSeed<S>>;
  /** Called after each gap heal attempt: "healed" on a fresh seed, the error when the seed read
   *  failed (the store keeps its last value; the next delta retries). */
  onResync?: (result: "healed" | Error) => void;
  /** Abort while the FIRST seed is still pending (a component unmounting): the row just configured
   *  is recalled and the connect rejects — a seed read that never answers leaves nothing lent. */
  signal?: AbortSignal;
}): Promise<LiveStateConnection<S>>;
//#endregion
//# sourceMappingURL=client.d.mts.map