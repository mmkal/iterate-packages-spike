import { i as loopLimitOf, n as codedError, r as jsonEqual, t as ITERATE_CAUSE_HEADER } from "../lib-CUg6cRWv.mjs";
import { DatabaseSync } from "node:sqlite";
import { AsyncLocalStorage } from "node:async_hooks";
import "zod";
globalThis[Symbol.for("iterate.cause")] ??= newCarrier();
function newCarrier() {
	const running = new AsyncLocalStorage();
	/** Set in a loaded isolate (`carryOnFetch`): only there is the newest cause kept. */
	let loaded = false;
	let newest;
	const current = () => {
		const store = running.getStore();
		return store ? store.cause : newest;
	};
	return {
		run(cause, code) {
			const { chain, depth, parent } = cause ?? {};
			if (loaded) newest = chain === void 0 ? void 0 : {
				chain,
				depth,
				parent
			};
			return running.run({ cause }, code);
		},
		current,
		carryOnFetch() {
			if (loaded) return;
			loaded = true;
			const outbound = globalThis.fetch;
			globalThis.fetch = async (input, init) => {
				const cause = current();
				const request = new Request(input, init);
				if (cause) {
					const { chain, depth, hops, parent } = cause;
					const ascii = typeof parent === "string" && /^[\x20-\x7e]*$/.test(parent);
					request.headers.set(ITERATE_CAUSE_HEADER, JSON.stringify({
						chain,
						depth,
						hops,
						...ascii && { parent }
					}));
				}
				const answer = await outbound(request);
				const refused = await loopLimitOf(answer);
				if (refused) throw refused;
				return answer;
			};
		}
	};
}
//#endregion
//#region src/stream/processor.ts
function idempotencyConflictMessage(idempotencyKey, existingOffset) {
	return `idempotency key "${idempotencyKey}" already names a different event at offset ${existingOffset}`;
}
/** Structural equality of the parts an idempotent retry must not change. */
function sameIdempotentEvent(existingEvent, requestedEvent) {
	return existingEvent.type === requestedEvent.type && jsonEqual(existingEvent.payload, requestedEvent.payload) && jsonEqual(existingEvent.metadata, requestedEvent.metadata);
}
/** Under the 2 MB cell, with room for the row's other columns. */
const REDUCE_CHECKPOINT_STATE_MAX_CHARS = 2093056;
/** What BOTH hosts read and write their checkpoints through — the stream's storage and a facet's
*  own (the Node unit tests drive it over node:sqlite, stream/test-support.ts). */
var ReduceCheckpointTable = class ReduceCheckpointTable {
	#sql;
	/** `createTable: false` when the caller knows the table exists (the stream's storage skips every
	*  CREATE on a re-wake); a facet host constructs one per incarnation and lets it create. */
	constructor(sql, options = { createTable: true }) {
		this.#sql = sql;
		if (options.createTable) ReduceCheckpointTable.createTable(sql);
	}
	static createTable(sql) {
		sql.exec(`CREATE TABLE IF NOT EXISTS reduce_checkpoints (
         slug TEXT PRIMARY KEY,
         reducer_version TEXT NOT NULL,
         reduced_through_offset INTEGER NOT NULL,
         state TEXT
       )`);
	}
	read(slug) {
		const row = this.#sql.exec("SELECT reducer_version, reduced_through_offset, state FROM reduce_checkpoints WHERE slug = ?", slug).toArray()[0];
		if (!row) return void 0;
		return {
			reducerVersion: String(row.reducer_version),
			reducedThroughOffset: Number(row.reduced_through_offset),
			state: row.state ? JSON.parse(String(row.state)) : void 0
		};
	}
	/** ALWAYS the cursor; the state ONLY when `stateChanged` — one write either way. */
	write(slug, cursor, state, stateChanged) {
		const serializedState = stateChanged ? JSON.stringify(state) ?? null : null;
		if (serializedState && serializedState.length > REDUCE_CHECKPOINT_STATE_MAX_CHARS) throw codedError("REDUCE_CHECKPOINT_TOO_LARGE", `checkpoint "${slug}": the reduced state serializes to ${serializedState.length} chars, over the ${REDUCE_CHECKPOINT_STATE_MAX_CHARS}-char ceiling of one storage cell (2 MB) — a reduce must keep a summary, not the events; nothing was written`, {
			slug,
			chars: serializedState.length,
			maxChars: REDUCE_CHECKPOINT_STATE_MAX_CHARS
		});
		this.#sql.exec(`INSERT INTO reduce_checkpoints (slug, reducer_version, reduced_through_offset, state)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(slug) DO UPDATE SET
           reducer_version = excluded.reducer_version,
           reduced_through_offset = excluded.reduced_through_offset,
           state = COALESCE(excluded.state, reduce_checkpoints.state)`, slug, cursor.reducerVersion, cursor.reducedThroughOffset, serializedState);
	}
};
//#endregion
//#region src/stream/test-support.ts
/** A committed event at `offset` on the root path, from the root, stamped `offset` seconds past the
*  epoch: what a test hands a reduce, an engine or a fake log without a stream. A field it does not
*  set (another `source`, another `path`, `ephemeral`) is spread over it. */
function committedEvent(offset, type, payload) {
	return {
		type,
		payload,
		offset,
		createdAt: (/* @__PURE__ */ new Date(offset * 1e3)).toISOString(),
		path: "/",
		source: { origin: "/" }
	};
}
/** THE PROCESSOR HARNESS: fold `inputs` through a processor's pure `reduce`, exactly as the engine
*  does — start from the contract's initial state, validate each payload against the contract (a
*  malformed KNOWN payload is SKIPPED, never reduced), reduce, thread the state — for a declarative
*  `{ events → state }` processor spec with no engine, storage, or effects. Construct the
*  processor with `new` and hand it the events; the offsets are the input order. An input with no
*  `source.origin` came from the context it is on, as the stream stamps it. Ephemeral inputs are
*  reduced like any other — the reduce decides what it folds (presence's `poke` returns undefined). */
function reduceProcessor(processor, inputs) {
	let state = processor.contract.initialState();
	inputs.forEach((input, index) => {
		const parsed = processor.contract.payloadSchemaFor(input.type)?.safeParse(input.payload ?? {});
		if (parsed && !parsed.success) return;
		const path = input.path || "/";
		const event = {
			...committedEvent(index + 1, input.type),
			payload: parsed?.success ? parsed.data : input.payload,
			source: {
				...input.source,
				origin: input.source?.origin || path
			},
			path
		};
		state = processor.reduce({
			event,
			state
		}) ?? state;
	});
	return state;
}
function memoryStream(path = "/") {
	const durableEvents = [];
	const pushedEvents = [];
	const eventsByIdempotencyKey = /* @__PURE__ */ new Map();
	const engines = [];
	const claims = [];
	let maxAssigned = 0;
	let reads = 0;
	return {
		stream: {
			claim: (at) => {
				claims.push(at);
				return Promise.resolve();
			},
			append: (...events) => {
				const scannedAfterOffset = maxAssigned;
				const committedEvents = events.map((event) => {
					if (event.idempotencyKey) {
						const existingEvent = eventsByIdempotencyKey.get(event.idempotencyKey);
						if (existingEvent) {
							if (sameIdempotentEvent(existingEvent, event)) return existingEvent;
							throw codedError("IDEMPOTENCY_CONFLICT", idempotencyConflictMessage(event.idempotencyKey, existingEvent.offset), { existingOffset: existingEvent.offset });
						}
					}
					maxAssigned += 1;
					const committedEvent = {
						...event,
						offset: maxAssigned,
						createdAt: (/* @__PURE__ */ new Date(0)).toISOString(),
						path,
						source: {
							...event.source,
							origin: event.source?.origin || path
						}
					};
					if (!event.ephemeral) {
						durableEvents.push(committedEvent);
						if (event.idempotencyKey) eventsByIdempotencyKey.set(event.idempotencyKey, committedEvent);
					}
					return committedEvent;
				});
				pushedEvents.push(...committedEvents);
				if (maxAssigned > scannedAfterOffset) {
					const scannedOffsetRange = {
						after: scannedAfterOffset,
						through: maxAssigned
					};
					for (const engine of engines) engine.processEventBatch(committedEvents, scannedOffsetRange).catch(() => {});
				}
				return committedEvents;
			},
			read: (afterOffset = 0, limit = 500) => {
				reads += 1;
				const page = durableEvents.filter((event) => event.offset > afterOffset).slice(0, limit);
				return Promise.resolve({
					events: page,
					scannedThroughOffset: page.length === limit ? page[page.length - 1].offset : Math.max(afterOffset, maxAssigned),
					atHead: page.length < limit || page[page.length - 1].offset === durableEvents[durableEvents.length - 1].offset
				});
			}
		},
		events: durableEvents,
		pushedEvents,
		engines,
		claims,
		get reads() {
			return reads;
		}
	};
}
/** A facet's checkpoint table (processor.ts `ReduceCheckpointTable`) over an in-memory
*  node:sqlite database — the real table, so the unit tests checkpoint exactly as a facet does —
*  with `writes` counting every write: rule 4 ("one durable commit per batch") and the ephemeral
*  zero-write rule are pinned by counting it. */
var WriteCountingReduceCheckpointTable = class extends ReduceCheckpointTable {
	writes = 0;
	write(slug, cursor, state, stateChanged) {
		this.writes++;
		super.write(slug, cursor, state, stateChanged);
	}
};
function memoryStorage() {
	return new WriteCountingReduceCheckpointTable(nodeSqliteDurableObjectStorage().sql);
}
/** Wait `ms` on a timer — long enough, by default, for fire-and-forget pushes to land. */
const settle = (ms = 25) => new Promise((r) => setTimeout(r, ms));
function nodeSqliteDurableObjectStorage() {
	const db = new DatabaseSync(":memory:");
	return {
		sql: { exec(query, ...bindings) {
			const statement = db.prepare(query);
			const bound = bindings;
			if (statement.columns().length === 0) {
				statement.run(...bound);
				return Object.assign([], { toArray: () => [] });
			}
			const rows = statement.iterate(...bound);
			return Object.assign(rows, { toArray: () => [...rows] });
		} },
		transactionSync: (closure) => {
			db.exec("BEGIN");
			try {
				const result = closure();
				db.exec("COMMIT");
				return result;
			} catch (error) {
				db.exec("ROLLBACK");
				throw error;
			}
		}
	};
}
//#endregion
export { committedEvent, memoryStorage, memoryStream, nodeSqliteDurableObjectStorage, reduceProcessor, settle };

//# sourceMappingURL=test-support.mjs.map