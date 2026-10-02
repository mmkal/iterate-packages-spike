import { n as Principal } from "./principal-Blyp_-YV.mjs";
import { z } from "zod";
import { SqlStorageValue } from "@cloudflare/workers-types";
//#region src/stream/processor.d.ts
/** The stream a processor reduces. `read` answers durable rows plus the proof: `scannedThroughOffset`
 *  is how far the read is CONTIGUOUSLY known (never past the durable mark — stream.ts), and `atHead`
 *  says whether the page was cut; its length says nothing (a budget cut is short of `limit`). */
type ProcessorStream = {
  append(...events: StreamEventInput[]): Promise<StreamEvent[]> | StreamEvent[];
  read(afterOffset?: number, limit?: number): Promise<{
    events: StreamEvent[];
    scannedThroughOffset: number;
    atHead: boolean;
  }>;
  /** This processor's claim on its context's alarm: "come back by `at`" (the context's alarm pass
   *  then calls `revive()`), or `null` to release it. Durable on the context, never a log event. */
  claim(at: number | null): Promise<unknown>;
};
/** How long after an attempt starts a dead host is revived: the recovery bound. A revive that finds
 *  the attempt still in flight claims again with the delay doubled, up to `REVIVE_AFTER_MAX_MS`. */
declare const REVIVE_AFTER_MS = 20000;
declare const REVIVE_AFTER_MAX_MS: number;
/** What the engine keeps of its own beside the checkpoint: a Durable Object's `ctx.storage.kv`
 *  (spelled here: the CLI compiles the engine without Cloudflare's types). */
type EngineKv = {
  get<T>(key: string): T | undefined;
  put(key: string, value: unknown): void;
  delete(key: string): unknown;
};
/** The contiguity proof a delivery carries: the half-open offset window `(after, through]`. A chain
 *  of these (each `after` === the previous `through`) is how a subscriber proves it missed nothing. */
type ScannedRange = {
  after: number;
  through: number;
};
type ReduceArgs<State, Event = StreamEvent> = {
  event: Event;
  state: State;
};
type ProcessEventArgs<State, Event = StreamEvent,
/** What `append` takes: `EmittedEventInput<typeof Contract>` for a processor that declares one —
 *  each type the contract `emits`, its payload as the catalog spells it. */
Emitted extends StreamEventInput = StreamEventInput> = {
  /** The consumed event — or `null` for the eventless at-head pass. */
  event: Event | null;
  state: State;
  previousState: State;
  /** Emit (validated against `emits`, provenance-stamped) onto this processor's own stream. Declared
   *  as METHODS (not arrow-typed properties) on purpose: a subclass that narrows `Emitted` must stay
   *  assignable to `StreamProcessor<State>` (the host's field), and only method parameters are
   *  compared bivariantly. */
  append(...events: Emitted[]): Promise<StreamEvent[]>;
  /** Hold the cursor until `work` settles; FIFO with other blockers of the SAME event. */
  blockProcessorWhile: (work: () => Promise<unknown>) => void;
  /** Fire-and-forget attempt; may overtake later events; outcome must be state-recoverable. */
  runInBackground: (work: () => Promise<unknown>) => void;
  delivery: {
    caughtUp: boolean;
  };
};
/** THE ONE consumes rule — the processor engine, the subscription delivery loop, and the inline
 *  reduces all call this; there is no second copy to drift. `consumes` undefined = every durable event
 *  (a subscriber's default). "*" = every durable event. A NAMED type opts that type in, INCLUDING
 *  ephemerals ("*" NEVER sweeps ephemerals) — so a live-state watcher spells
 *  `consumes: ["events.iterate.com/itx/live-state-changed"]` and filters `payload.key` itself. The wake
 *  record (`itx/woken`) is a durable event like any other: a "*" row receives every incarnation's. */
declare function consumesEvent(consumes: readonly string[] | undefined, event: {
  type: string;
  ephemeral?: boolean;
}): boolean;
/** THE AUTHOR CLASS: a contract, three hooks and one helper. Deps an effect needs arrive through
 *  the subclass's own constructor, as for any class. One instance lives as long as its host; a field
 *  on it is RUNTIME state (gone with the host), which `projectLiveState` may reduce into the live view. */
declare abstract class StreamProcessor<State, Event extends StreamEvent = StreamEvent> {
  abstract readonly contract: ProcessorContract<State>;
  /** Pure reduce. Return the NEXT state (a new object) — or null/undefined to keep the current. The
   *  `Event` type param — a discriminated union of the events the contract consumes — narrows
   *  `event.payload` per `event.type` inside the body, so no cast is needed; it defaults to the
   *  untyped `StreamEvent` for processors that don't declare one. */
  reduce(_args: ReduceArgs<State, Event>): State | null | undefined;
  /** Side-effect hook. Synchronous by design: register async work via the two helpers on args.
   *  `append` takes what THIS class's `contract` emits (`EmittedEventInput<this["contract"]>`:
   *  a subclass whose `contract` is a defined one gets each emitted type's payload as its catalog
   *  spells it; the base `ProcessorContract` takes any input). */
  processEvent(_args: ProcessEventArgs<State, Event, EmittedEventInput<this["contract"]>>): undefined;
  /** The live-state PROJECTION — the shape clients see and the diffs are computed over. DEFAULT: the
   *  reduced state verbatim, so every processor is live out of the box; that is deliberate — the
   *  delta is an EPHEMERAL event, so "always live" costs an offset and a cheap diff, nothing durable.
   *  Override to redact, or to REDUCE IN RUNTIME FIELDS (`return { ...state, lastSeenMs: this.lastSeenMs }`);
   *  the engine re-projects after EVERY batch, and a field changed outside a batch needs the host's
   *  `publishLiveState()`. */
  projectLiveState(state: State): unknown;
  /** Stable idempotency key namespaced by slug; pass the event being processed for a per-event key. */
  idempotencyKey(key: string, event?: StreamEvent): string;
}
/** THE ENGINE: everything below the author's three hooks — the serial chain, the checkpoint, gap
 *  repair, the at-head pass, version re-reduces, live-state publishing. Constructed by the host
 *  (`StreamProcessorDurableObject`; a test with the stand-ins in test-support.ts). */
declare class ProcessorEngine<State> {
  #private;
  readonly processor: StreamProcessor<State>;
  constructor(processor: StreamProcessor<State>, deps: {
    stream: ProcessorStream;
    storage: ReduceCheckpointTable;
    /** The host's word that a subscription row pushes this processor every commit it consumes
     *  (`processEventBatch`). The read verbs then trust the head a catch-up read until a push shows
     *  a later one; absent, only a push's head is trusted, so an unpushed processor reads each time. */
    fedByPushes?: boolean;
    /** The host's durable key-value storage, where work in flight keeps its started marker and
     *  its deaths (rule 3). Absent (a unit test): no death is counted. */
    kv?: EngineKv;
    /** The code the host runs, as its parent names it (iterate/sdk FacetProps): work that died
     *  with a host restarted onto other code died of no fault of its own, and is no death. */
    codeId?: string;
  });
  /** THE SEED READ for live-state clients (LiveState.snapshot), caught up first. */
  liveSnapshot(): Promise<{
    rev: number;
    state: unknown;
  }>;
  /** Emit a delta for the CURRENT projection (reduced + any runtime fields) if it changed. The engine
   *  calls this after every batch; the host calls it after a runtime field moved outside a batch. A
   *  throwing projection loses only its notification (the client re-seeds on the chain gap). */
  publishLiveState(): void;
  /** THE push method: contiguous → reduce it directly (no read); anything else → gap repair from the
   *  own cursor first. Fire-and-forget safe: enqueues on the serial chain. */
  processEventBatch(events: StreamEvent[], range: ScannedRange): Promise<void>;
  /** Catch up from the own checkpoint (a cold boot, the read verbs, the barrier), page by page — a
   *  failed batch, a missed push, or a fresh incarnation can never skip a durable event. */
  catchUpFromLog(): Promise<void>;
  /** Reduce-and-effects caught up through the log, then `{ offset, state }`. */
  snapshot(): Promise<{
    offset: number;
    state: State;
  }>;
  /** THE barrier verb (read-your-writes): resolves once processed AT LEAST through `offset`. An
   *  offset ABOVE the durable mark (an ephemeral's) is reached only if this processor was pushed it —
   *  the log cannot prove past the mark, so a wake alone never advances there. */
  waitUntilProcessed(input: {
    offset: number;
    timeoutMs?: number;
  }): Promise<void>;
  /** THE REVIVE — the context's alarm pass calls this for a due claim (spent by then): catch up
   *  from the log and run the at-head pass, so a processor restarts what state says is still owed
   *  (rule 3). A fresh incarnation finds nothing in flight and starts it; an attempt still in flight
   *  here claims again, later each time (20 s, 40 s, … `REVIVE_AFTER_MAX_MS`). */
  revive(): Promise<void>;
}
/** Why an event happened (`source.cause`): its chain, its depth, and the event whose handling wrote
 *  it (`<path>@<offset>`), if any. */
type EventCause = {
  chain: string;
  depth: number;
  parent?: string;
};
/** What `append` accepts: the event body, before the stream assigns its committed identity. The
 *  append method checks ONE rule by hand: `type` is a non-empty string. */
type StreamEventInput = {
  /** `events.iterate.com/<namespace>/<event>` for the platform's types, named by the rules in
   *  core/lib/README.md#event-types; any other string is the appender's own. */
  type: string;
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  /** PROVENANCE, stamped by the platform as the event commits (core/os caller.ts `stampCaller`): a
   *  writer's own `source` is dropped but for `processor`, the engine's label. */
  source?: {
    /** WHERE IT CAME FROM: the context whose code or session wrote it — the context a call started
     *  at, whichever context it was appended to. Every committed event carries it (`StreamEvent`):
     *  the platform's own records of a context (its birth, a wake, a run's settlement) carry the
     *  context's own path. */
    origin?: string;
    /** WHY IT HAPPENED, stamped by the platform (a writer's own is dropped): the chain of reactions
     *  it belongs to — when and where that began — how many hand-offs deep in it, and the event
     *  whose handling wrote it. Past 8, code reacting to code may read but not act, and the
     *  `itx/loop-limit` fact says where it stopped. */
    cause?: EventCause;
    /** The durable schedule definition responsible for this occurrence. */
    schedule?: {
      key: string;
      scheduledAtOffset: number;
      at: string;
      /** Attribution of the definition, distinct from the platform writing the occurrence. */
      definedBy?: Omit<NonNullable<StreamEventInput["source"]>, "schedule">;
    };
    /** Which processor wrote it, while processing what — the engine's own label (below), the one
     *  field a writer keeps: its word, under the platform's `origin`. */
    processor?: {
      slug: string;
      version: string;
      whileProcessing?: {
        offset: number;
        type: string;
      };
    };
    principal?: Principal;
    /** THE CONNECTION the principal acted through: the OAuth grant's id — one per
     *  connected client (a Claude Code install, a dash sign-in, a personal token). Stamped beside
     *  `principal` by the platform when it appends; absent for the admin secret and the kernel. */
    grant?: string;
    /** WHO A SCRIPT WROTE THIS FOR: the person who asked for the run (`itx.run`, MCP's `run`), the
     *  grant they asked through, and the request (`<path>@<offset>`). Attribution, never authority:
     *  gate on `principal`, not this. Stamped by the platform; a writer's own is dropped. Why and
     *  how: core/os/src/on-behalf-of.ts. */
    onBehalfOf?: {
      principal: Principal;
      grant?: string;
      run: string;
    };
    /** THE PLATFORM WROTE THIS FACT, on the principal's behalf:
     *  what a processor folding an account's or an organization's facts requires — a client can
     *  append any type to a context it holds, never this. */
    platform?: true;
  };
  /** Same key + same body = dedupe (the existing event is returned); different body = loud error. */
  idempotencyKey?: string;
  /** OPTIONAL PRECONDITION: land at exactly this offset or refuse the whole batch with
   *  OFFSET_CONFLICT — "nothing has happened since I last looked". Never stored in the body. */
  offset?: number;
  /** An EPHEMERAL event rides the stream to live subscribers but is NEVER persisted: it consumes an
   *  offset, triggers zero writes, and its body is gone the moment the incarnation ends — nobody can
   *  redeliver it (stream.ts, the zero-write contract). A durable OMITS the field. */
  ephemeral?: true;
};
/** A committed event: the input plus the identity the stream assigned at its commit point, and the
 *  platform's `source`, whose `origin` every commit carries (core/os stream.ts). */
type StreamEvent = Omit<StreamEventInput, "offset" | "source"> & {
  offset: number;
  createdAt: string;
  path: string;
  source: NonNullable<StreamEventInput["source"]> & {
    origin: string;
  };
};
declare function idempotencyConflictMessage(idempotencyKey: string, existingOffset: number): string;
/** Structural equality of the parts an idempotent retry must not change. */
declare function sameIdempotentEvent(existingEvent: StreamEventInput, requestedEvent: StreamEventInput): boolean;
/** Sync SQLite as the platform hands it over (`ctx.storage.sql`): a query is a LAZY cursor —
 *  iterate it, or `toArray()`. Spelled structurally so a node:sqlite stand-in satisfies it. */
type SqlStorageHandle = {
  exec<T extends Record<string, SqlStorageValue>>(query: string, ...bindings: unknown[]): Iterable<T> & {
    toArray(): T[];
  };
};
/** A persisted checkpoint as read back: the version it was reduced under (the caller gates on it),
 *  the offset reduced through, and the state — `undefined` when the reduce never changed it. */
type ReduceCheckpoint<State> = {
  reducerVersion: string;
  reducedThroughOffset: number;
  state: State | undefined;
};
/** What BOTH hosts read and write their checkpoints through — the stream's storage and a facet's
 *  own (the Node unit tests drive it over node:sqlite, stream/test-support.ts). */
declare class ReduceCheckpointTable {
  #private;
  /** `createTable: false` when the caller knows the table exists (the stream's storage skips every
   *  CREATE on a re-wake); a facet host constructs one per incarnation and lets it create. */
  constructor(sql: SqlStorageHandle, options?: {
    createTable: boolean;
  });
  static createTable(sql: SqlStorageHandle): void;
  read<State>(slug: string): ReduceCheckpoint<State> | undefined;
  /** ALWAYS the cursor; the state ONLY when `stateChanged` — one write either way. */
  write<State>(slug: string, cursor: {
    reducerVersion: string;
    reducedThroughOffset: number;
  }, state: State, stateChanged: boolean): void;
}
/** The only thing a LiveState needs from its host: somewhere to append the delta. A
 *  `ProcessorStream` satisfies it; a facet that is no processor passes one scope per delta,
 *  `{ append: async (e) => { using itx = this.getItx(); await itx.append(e); } }`, never a scope it
 *  holds. A field initializer cannot await, so a facet builds its LiveState that way and
 *  serves `snapshot()` as the client's seed read. */
type LiveStateSink = {
  append(event: {
    type: string;
    ephemeral?: true;
    payload?: Record<string, unknown>;
  }): unknown;
};
declare class LiveState<S> {
  #private;
  constructor(sink: LiveStateSink, key: string, initial: S);
  /** The current value (reflects every `set`). */
  get(): S;
  /** THE seed read: `{rev, state}` read together (single-threaded ⇒ atomically), which is what lets
   *  a client chain patches exactly instead of guessing which changes its snapshot already contains. */
  snapshot(): {
    rev: number;
    state: S;
  };
  /** Replace the value: diff the last serialized base → next; on a real change bump the revision
   *  and append the delta. Build a NEW value (don't mutate `next` in place) — the diff is over JSON.
   *  A diff/append failure degrades to a LOST notification (the client re-seeds on the chain gap),
   *  never a throw the caller sees. */
  set(next: S): void;
}
//#endregion
//#region src/stream/contract.d.ts
/** What a processor declares: its checkpoint slug and reducer version, what it consumes and emits,
 *  and its initial state. `defineProcessorContract` below is the one way to build one. */
type ProcessorContract<State = unknown> = {
  slug: string;
  /** Bumping this re-reduces state from offset 0 (reduce only — side effects never re-run). */
  version: string;
  description?: string;
  /** What it reacts to: type strings, or "*" for every DURABLE event. Ephemeral events are
   *  delivered ONLY when their type is named here — `"*"` never sweeps them. */
  consumes: readonly string[];
  /** What its `append` is allowed to emit. */
  emits: readonly string[];
  /** The schema-initial state ("{} with every field defaulted" for zod contracts). */
  initialState: () => State;
  /** The zod payload schema for a consumed event type (owned or a dep's), or undefined if the type
   *  is unknown or the contract declares no `events` catalog. The engine validates a consumed event's
   *  payload against it before reducing (a malformed payload for a KNOWN event is skipped, never
   *  folded). */
  payloadSchemaFor: (type: string) => z.ZodType | undefined;
};
/** One owned event: its description and the zod schema for its payload. `ephemeral: true` marks a
 *  non-durable event (delivered only when its type is named in `consumes`). */
type EventDefinition = {
  description: string;
  payloadSchema: z.ZodType;
  ephemeral?: true;
};
/** A durable event type string → its definition. */
type EventCatalog = Record<string, EventDefinition>;
/** A `processorDeps` entry's own event catalog. */
type DepCatalog<Dep> = Dep extends {
  events: infer Events extends EventCatalog;
} ? Events : never;
/** The definition owning `Type` — local events win, then each dep. */
type DefinitionForType<Events extends EventCatalog, Deps extends readonly unknown[], Type extends string> = Type extends keyof Events ? Events[Type] : Deps[number] extends (infer Dep) ? Dep extends unknown ? Type extends keyof DepCatalog<Dep> ? DepCatalog<Dep>[Type] : never : never : never;
/** The committed event for one resolved type: `StreamEvent` narrowed to its `{ type, payload }`. */
type EventForType<Events extends EventCatalog, Deps extends readonly unknown[], Type extends string> = Type extends unknown ? DefinitionForType<Events, Deps, Type> extends {
  payloadSchema: infer Schema extends z.ZodType;
} ? StreamEvent & {
  type: Type;
  payload: z.output<Schema>;
} : never : never;
/** The reduce union for a `consumes` tuple — `"*"` alone means any `StreamEvent`. */
type EventForTypes<Events extends EventCatalog, Deps extends readonly unknown[], Types extends readonly string[]> = "*" extends Types[number] ? StreamEvent : EventForType<Events, Deps, Types[number]>;
/** A contract's `processorDeps` tuple, defaulting to empty. */
type DepsOf<Contract> = Contract extends {
  processorDeps: infer Deps extends readonly unknown[];
} ? Deps : readonly [];
/** A contract's reduced-state type, inferred from its `stateSchema`. */
type ProcessorState<Contract> = Contract extends {
  stateSchema: infer Schema extends z.ZodType;
} ? z.output<Schema> : never;
/** The committed-event union a contract's `consumes` list can deliver to `reduce`/`processEvent`. */
type ConsumedEvent<Contract> = Contract extends {
  events: infer Events extends EventCatalog;
  consumes: infer Consumes extends readonly string[];
} ? EventForTypes<Events, DepsOf<Contract>, Consumes> : never;
/** The input for ONE event type as a catalog spells it (`EventInput`'s row) — or, for a type no
 *  catalog defines (a core control event a processor emits, `itx/ingress-configured`), the plain
 *  input: it widens the whole union, so a contract that emits one undefined type appends untyped
 *  until that type is in a catalog it depends on. */
type EventInputForType<Events extends EventCatalog, Deps extends readonly unknown[], Type extends string> = Type extends unknown ? [DefinitionForType<Events, Deps, Type>] extends [never] ? StreamEventInput : DefinitionForType<Events, Deps, Type> extends {
  payloadSchema: infer Schema extends z.ZodType;
} ? {
  type: Type;
  payload: z.input<Schema>;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
} & (DefinitionForType<Events, Deps, Type> extends {
  ephemeral: true;
} ? {
  ephemeral: true;
} : {
  ephemeral?: never;
}) : never : never;
/** What a processor's `append` takes: one input per type the contract `emits` — its own
 *  events and its deps' as their catalogs spell them (`z.input`), a type no catalog defines as the
 *  plain input under that name. A contract whose `emits` is not a literal tuple gets every input. */
type EmittedEventInput<Contract> = Contract extends {
  events: infer Events extends EventCatalog;
  emits: infer Emits extends readonly string[];
} ? string[] extends Emits ? StreamEventInput : Emits extends readonly [] ? StreamEventInput : EventInputForType<Events, DepsOf<Contract>, Emits[number]> : StreamEventInput;
/** What a caller APPENDS for one of a contract's OWNED events — the typed write on an entity
 *  (`itx.repos.get(path).append(…)`, library.ts): the type string, the payload as its schema takes
 *  it (`z.input`), a key and metadata; `ephemeral` only where the definition says so. Derived from
 *  the catalog, so a payload field renamed in the contract is a type error at every call site. */
type EventInput<Contract> = Contract extends {
  events: infer Events extends EventCatalog;
} ? { [Type in keyof Events & string]: {
  type: Type;
  payload: z.input<Events[Type]["payloadSchema"]>;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
} & (Events[Type] extends {
  ephemeral: true;
} ? {
  ephemeral: true;
} : {
  ephemeral?: never;
}); }[keyof Events & string] : never;
/** What `defineProcessorContract` returns: the base the engine reads, plus the events catalog and the
 *  resolved deps. (Events are written LITERALLY at the call site — `itx.append({ type, payload })` —
 *  so there is no event-builder here; the engine validates the payload against `payloadSchemaFor` at
 *  reduce, and `ConsumedEvent`/`ProcessorState` give the reduce its types.) */
type DefinedProcessorContract<StateSchema extends z.ZodType, Events extends EventCatalog, Consumes extends readonly string[], Deps extends readonly unknown[], Emits extends readonly string[] = readonly string[]> = ProcessorContract<z.output<StateSchema>> & {
  stateSchema: StateSchema;
  events: Events;
  consumes: Consumes;
  emits: Emits;
  processorDeps: Deps;
};
declare function defineProcessorContract<const StateSchema extends z.ZodType, const Events extends EventCatalog = Record<string, never>, const Consumes extends readonly string[] = readonly string[], const Deps extends readonly {
  events: EventCatalog;
}[] = readonly [], const Emits extends readonly string[] = readonly string[]>(contract: {
  slug: string;
  version: string;
  description: string;
  /** Must parse `{}` — the initial state is `stateSchema.parse({})` (all fields defaulted). */
  stateSchema: StateSchema;
  /** The events this contract OWNS, keyed by durable type string. Omit for a kernel-generic
   *  processor that types its own reduce through the `Event` param instead of an events catalog. */
  events?: Events;
  /** Other processors' contracts whose events this one may `consumes`/`emits` without owning. */
  processorDeps?: Deps;
  consumes: Consumes;
  emits: Emits;
}): DefinedProcessorContract<StateSchema, Events, Consumes, Deps, Emits>;
//#endregion
export { StreamEvent as C, idempotencyConflictMessage as D, consumesEvent as E, sameIdempotentEvent as O, SqlStorageHandle as S, StreamProcessor as T, REVIVE_AFTER_MS as _, EventDefinition as a, ReduceCheckpointTable as b, ProcessorState as c, LiveState as d, LiveStateSink as f, REVIVE_AFTER_MAX_MS as g, ProcessorStream as h, EventCatalog as i, defineProcessorContract as l, ProcessorEngine as m, DefinedProcessorContract as n, EventInput as o, ProcessEventArgs as p, EmittedEventInput as r, ProcessorContract as s, ConsumedEvent as t, EngineKv as u, ReduceArgs as v, StreamEventInput as w, ScannedRange as x, ReduceCheckpoint as y };
//# sourceMappingURL=contract-D1J6d08G.d.mts.map