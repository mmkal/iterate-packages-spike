import { a as StreamEvent, i as SqlStorageHandle, n as ProcessorStream, o as StreamEventInput, r as ReduceCheckpointTable, s as ProcessorContract, t as ProcessorEngine } from "../processor-C6GRhCwZ.mjs";
//#region src/stream/test-support.d.ts
/** A committed event at `offset` on the root path, from the root, stamped `offset` seconds past the
 *  epoch: what a test hands a reduce, an engine or a fake log without a stream. A field it does not
 *  set (another `source`, another `path`, `ephemeral`) is spread over it. */
export declare function committedEvent(offset: number, type: string, payload?: StreamEvent["payload"]): StreamEvent;
/** THE PROCESSOR HARNESS: fold `inputs` through a processor's pure `reduce`, exactly as the engine
 *  does — start from the contract's initial state, validate each payload against the contract (a
 *  malformed KNOWN payload is SKIPPED, never reduced), reduce, thread the state — for a declarative
 *  `{ events → state }` processor spec with no engine, storage, or effects. Construct the
 *  processor with `new` and hand it the events; the offsets are the input order. An input with no
 *  `source.origin` came from the context it is on, as the stream stamps it. Ephemeral inputs are
 *  reduced like any other — the reduce decides what it folds (presence's `poke` returns undefined). */
export declare function reduceProcessor<State>(processor: {
  contract: ProcessorContract<State>;
  reduce(args: {
    event: StreamEvent;
    state: State;
  }): State | null | undefined;
}, inputs: readonly {
  type: string;
  payload?: unknown;
  source?: StreamEventInput["source"];
  /** The context it is on; `/` by default. */
  path?: string;
}[]): State;
export declare function memoryStream(path?: string): {
  stream: ProcessorStream;
  events: StreamEvent[];
  pushedEvents: StreamEvent[];
  engines: ProcessorEngine<any>[];
  claims: (number | null)[];
  readonly reads: number;
};
/** A facet's checkpoint table (processor.ts `ReduceCheckpointTable`) over an in-memory
 *  node:sqlite database — the real table, so the unit tests checkpoint exactly as a facet does —
 *  with `writes` counting every write: rule 4 ("one durable commit per batch") and the ephemeral
 *  zero-write rule are pinned by counting it. */
declare class WriteCountingReduceCheckpointTable extends ReduceCheckpointTable {
  writes: number;
  write<State>(slug: string, cursor: {
    reducerVersion: string;
    reducedThroughOffset: number;
  }, state: State, stateChanged: boolean): void;
}
export declare function memoryStorage(): WriteCountingReduceCheckpointTable;
/** Wait `ms` on a timer — long enough, by default, for fire-and-forget pushes to land. */
export declare const settle: (ms?: number) => Promise<unknown>;
export declare function nodeSqliteDurableObjectStorage(): {
  sql: SqlStorageHandle;
  transactionSync<T>(closure: () => T): T;
};
//#endregion
//# sourceMappingURL=test-support.d.mts.map