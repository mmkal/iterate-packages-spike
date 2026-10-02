import { ITERATE_CAUSE_HEADER, codedError, diff, errorCode, jsonEqual, loopLimitOf, reportIssue } from "./lib.mjs";
import "./stream/contract.mjs";
import { AsyncLocalStorage } from "node:async_hooks";
//#region src/cause.ts
const carrier = globalThis[Symbol.for("iterate.cause")] ??= newCarrier();
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
/** Run `code` under `cause` — the platform's word for why, or none (the platform then begins a
*  chain for what it does). */
const runCausedBy = (cause, code) => carrier.run(cause, code);
/** The cause the running code runs under, for the platform. */
const currentCause = () => carrier.current();
/** The cause a Request carries, or none. */
function causeOfRequest(request) {
	try {
		return JSON.parse(request.headers.get("X-Iterate-Cause") ?? "null") ?? void 0;
	} catch {
		return;
	}
}
//#endregion
//#region src/stream/processor.ts
/** How long after an attempt starts a dead host is revived: the recovery bound. A revive that finds
*  the attempt still in flight claims again with the delay doubled, up to `REVIVE_AFTER_MAX_MS`. */
const REVIVE_AFTER_MS = 2e4;
const REVIVE_AFTER_MAX_MS = 18e5;
/** How many times work in flight may die with its host before a revive no longer starts it again. */
const MAX_DEATHS = 5;
/** The started marker's key and value (rule 3): work is in flight, how often it died so far, and
*  on what code. */
const STARTED = "processor-work-started";
/** THE ONE consumes rule — the processor engine, the subscription delivery loop, and the inline
*  reduces all call this; there is no second copy to drift. `consumes` undefined = every durable event
*  (a subscriber's default). "*" = every durable event. A NAMED type opts that type in, INCLUDING
*  ephemerals ("*" NEVER sweeps ephemerals) — so a live-state watcher spells
*  `consumes: ["events.iterate.com/itx/live-state-changed"]` and filters `payload.key` itself. The wake
*  record (`itx/woken`) is a durable event like any other: a "*" row receives every incarnation's. */
function consumesEvent(consumes, event) {
	if (event.ephemeral) return consumes?.includes(event.type) ?? false;
	return !consumes || consumes.includes("*") || consumes.includes(event.type);
}
/** A failure that is a LOOP_LIMIT refusal the platform recorded (core/os src/cause.ts
*  `recordRefusal`) settles as done: the loop ends there, with its one fact, and nothing is retried
*  or reported. Any other — an unrecorded one too — is rethrown. */
const unlessLoopLimit = (error) => {
	const recorded = error?.data?.recorded;
	if (errorCode(error) !== "LOOP_LIMIT" || !recorded) throw error;
};
/** What the ENGINE reduces: the contract's consumes, minus the one type no processor may ever reduce or
*  react to — a live-state delta. Deltas are notifications ABOUT state; letting one feed a reduce is
*  the feedback-loop class, made unspellable here rather than discouraged. */
const reducesEvent = (consumes, event) => event.type !== "events.iterate.com/itx/live-state-changed" && consumesEvent(consumes, event);
/** THE AUTHOR CLASS: a contract, three hooks and one helper. Deps an effect needs arrive through
*  the subclass's own constructor, as for any class. One instance lives as long as its host; a field
*  on it is RUNTIME state (gone with the host), which `projectLiveState` may reduce into the live view. */
var StreamProcessor = class {
	/** Pure reduce. Return the NEXT state (a new object) — or null/undefined to keep the current. The
	*  `Event` type param — a discriminated union of the events the contract consumes — narrows
	*  `event.payload` per `event.type` inside the body, so no cast is needed; it defaults to the
	*  untyped `StreamEvent` for processors that don't declare one. */
	reduce(_args) {}
	/** Side-effect hook. Synchronous by design: register async work via the two helpers on args.
	*  `append` takes what THIS class's `contract` emits (`EmittedEventInput<this["contract"]>`:
	*  a subclass whose `contract` is a defined one gets each emitted type's payload as its catalog
	*  spells it; the base `ProcessorContract` takes any input). */
	processEvent(_args) {}
	/** The live-state PROJECTION — the shape clients see and the diffs are computed over. DEFAULT: the
	*  reduced state verbatim, so every processor is live out of the box; that is deliberate — the
	*  delta is an EPHEMERAL event, so "always live" costs an offset and a cheap diff, nothing durable.
	*  Override to redact, or to REDUCE IN RUNTIME FIELDS (`return { ...state, lastSeenMs: this.lastSeenMs }`);
	*  the engine re-projects after EVERY batch, and a field changed outside a batch needs the host's
	*  `publishLiveState()`. */
	projectLiveState(state) {
		return state;
	}
	/** Stable idempotency key namespaced by slug; pass the event being processed for a per-event key. */
	idempotencyKey(key, event) {
		return event ? `${this.contract.slug}/${key}@${event.offset}` : `${this.contract.slug}/${key}`;
	}
};
/** THE ENGINE: everything below the author's three hooks — the serial chain, the checkpoint, gap
*  repair, the at-head pass, version re-reduces, live-state publishing. Constructed by the host
*  (`StreamProcessorDurableObject`; a test with the stand-ins in test-support.ts). */
var ProcessorEngine = class {
	processor;
	#contract;
	#stream;
	#storage;
	/** Rule 1: every batch runs on this chain, one after another. */
	#serialBatchChain = Promise.resolve();
	/** The reduced state and the durable offset it was reduced through — checkpointed on the batches
	*  that carried a durable. */
	#reducedState;
	#reducedThroughOffset;
	/** A checkpoint found under ANOTHER contract version: the input to the one re-reduce the chain
	*  runs before anything else; cleared once it ran. */
	#staleCheckpoint;
	/** The highest `range.through` ever SHOWN to this processor (see processEventBatch). */
	#pushedThroughOffset;
	/** The host's word that a row pushes this processor every commit it consumes (the constructor's
	*  `fedByPushes`) — what lets a head read from the log count as shown. */
	#fedByPushes;
	/** The highest head a catch-up of a processor FED BY PUSHES reduced through (`#showHeadReadFromLog`):
	*  every commit past it that the processor consumes reaches it as a push, so the read verbs trust it
	*  as a push's head. In memory only — a fresh incarnation catches up once before it trusts any. */
	#headReadFromLogOffset;
	/** A refusal that can only repeat — the checkpoint over its cell (REDUCE_CHECKPOINT_TOO_LARGE):
	*  LATCHED for this incarnation, so every later batch, catch-up and read verb rejects with it at
	*  once instead of re-reducing into the same wall on every push and wake. A fresh incarnation
	*  tries once more. */
	#latchedRefusal;
	/** waitUntilProcessed's waiting callers, resolved as the cursor advances. */
	#waitUntilProcessedWaiters = [];
	/** Born with the engine, so its epoch is minted once per incarnation. */
	#liveState;
	/** Rule 3's claim: attempts in flight, and how many revives found one still in flight (the
	*  backoff of the next claim; reset when the last attempt settles). The claim calls ride ONE
	*  chain, so a release never overtakes the claim of the attempt that followed it. */
	#backgroundWorkInFlight = 0;
	#revivesWhileBusy = 0;
	#claimChain = Promise.resolve();
	/** Whether the last batch this engine ran carried the at-head pass (rule 5) — what `revive()`
	*  reads to know if its catch-up already ran one. */
	#lastBatchAtHead = false;
	#kv;
	#codeId;
	/** The cause of the newest event this engine processed: what an eventless at-head pass runs under. */
	#headCause;
	constructor(processor, deps) {
		this.processor = processor;
		this.#contract = processor.contract;
		this.#stream = deps.stream;
		this.#storage = deps.storage;
		this.#fedByPushes = deps.fedByPushes === true;
		this.#kv = deps.kv;
		this.#codeId = deps.codeId;
		const { slug, version } = this.#contract;
		const checkpoint = this.#storage.read(slug);
		if (checkpoint?.reducerVersion === version) {
			this.#reducedState = checkpoint.state ?? this.#contract.initialState();
			this.#reducedThroughOffset = checkpoint.reducedThroughOffset;
		} else {
			this.#reducedState = this.#contract.initialState();
			this.#reducedThroughOffset = 0;
			if (checkpoint) this.#staleCheckpoint = {
				reducedThroughOffset: checkpoint.reducedThroughOffset,
				state: checkpoint.state ?? this.#reducedState
			};
		}
		let seed;
		try {
			seed = processor.projectLiveState(this.#staleCheckpoint ? this.#staleCheckpoint.state : this.#reducedState);
		} catch (error) {
			reportIssue("processor.live-state", error, { slug });
			seed = void 0;
		}
		this.#liveState = new LiveState(this.#stream, slug, seed);
	}
	/** THE SEED READ for live-state clients (LiveState.snapshot), caught up first. */
	async liveSnapshot() {
		if (!this.#reducedThroughPushedHead()) await this.catchUpFromLog();
		return this.#liveState.snapshot();
	}
	/** Emit a delta for the CURRENT projection (reduced + any runtime fields) if it changed. The engine
	*  calls this after every batch; the host calls it after a runtime field moved outside a batch. A
	*  throwing projection loses only its notification (the client re-seeds on the chain gap). */
	publishLiveState() {
		let projection;
		try {
			projection = this.processor.projectLiveState(this.#reducedState);
		} catch (error) {
			reportIssue("processor.live-state", error, { slug: this.#contract.slug });
			return;
		}
		this.#liveState.set(projection);
	}
	/** THE push method: contiguous → reduce it directly (no read); anything else → gap repair from the
	*  own cursor first. Fire-and-forget safe: enqueues on the serial chain. */
	processEventBatch(events, range) {
		this.#pushedThroughOffset = Math.max(this.#pushedThroughOffset ?? 0, range.through);
		return this.#runOnSerialChain(async () => {
			await this.#rereduceIfVersionChanged();
			while (this.#reducedThroughOffset < range.after) {
				const after = this.#reducedThroughOffset;
				const page = await this.#stream.read(after, 500);
				if (page.scannedThroughOffset <= after) break;
				await this.#reduceAndCommitEventBatch(page.events.filter((event) => event.offset <= range.after), {
					after,
					through: Math.min(page.scannedThroughOffset, range.after)
				}, false);
			}
			await this.#reduceAndCommitEventBatch(events, range, range.through >= this.#pushedThroughOffset);
		});
	}
	/** Catch up from the own checkpoint (a cold boot, the read verbs, the barrier), page by page — a
	*  failed batch, a missed push, or a fresh incarnation can never skip a durable event. */
	catchUpFromLog() {
		return this.#runOnSerialChain(async () => {
			await this.#rereduceIfVersionChanged();
			for (;;) {
				const after = this.#reducedThroughOffset;
				const page = await this.#stream.read(after, 500);
				if (page.scannedThroughOffset <= after) {
					if (page.atHead) this.#showHeadReadFromLog(after);
					return;
				}
				await this.#reduceAndCommitEventBatch(page.events, {
					after,
					through: page.scannedThroughOffset
				}, page.atHead);
				if (page.atHead) {
					this.#showHeadReadFromLog(page.scannedThroughOffset);
					return;
				}
			}
		});
	}
	/** A catch-up reduced through `reducedThroughOffset`, the head its last page reached: for a
	*  processor FED BY PUSHES, the head is SHOWN. Every later commit it consumes reaches it as a push,
	*  whose `range.through` is recorded the moment the push arrives, so a read that follows the push
	*  catches up again; the host holds a read back until the pushes it owes have arrived (the header's
	*  read verbs), so while none arrives, nothing it consumes has landed and its reads stop re-reading
	*  the log. A processor nothing pushes records nothing: it learns of a new event only by reading. */
	#showHeadReadFromLog(reducedThroughOffset) {
		if (!this.#fedByPushes) return;
		this.#headReadFromLogOffset = Math.max(this.#headReadFromLogOffset ?? 0, reducedThroughOffset);
	}
	/** Reduce-and-effects caught up through the log, then `{ offset, state }`. */
	async snapshot() {
		if (!this.#reducedThroughPushedHead()) await this.catchUpFromLog();
		return {
			offset: this.#reducedThroughOffset,
			state: this.#reducedState
		};
	}
	/** Provably reduced through the head SHOWN so far — the highest a push showed or, fed by pushes, a
	*  catch-up read — → the read verbs skip their catch-up read. Nothing shown yet (a fresh
	*  incarnation, or an unpushed processor) → they read. Whether a PUSH reaches the head (rule 5)
	*  is still judged against pushes alone (processEventBatch). */
	#reducedThroughPushedHead() {
		const shownHeadOffset = this.#headReadFromLogOffset === void 0 ? this.#pushedThroughOffset : Math.max(this.#pushedThroughOffset ?? 0, this.#headReadFromLogOffset);
		return shownHeadOffset !== void 0 && this.#reducedThroughOffset >= shownHeadOffset;
	}
	/** THE barrier verb (read-your-writes): resolves once processed AT LEAST through `offset`. An
	*  offset ABOVE the durable mark (an ephemeral's) is reached only if this processor was pushed it —
	*  the log cannot prove past the mark, so a wake alone never advances there. */
	waitUntilProcessed(input) {
		const { offset, timeoutMs = 1e4 } = input;
		return new Promise((resolve, reject) => {
			if (this.#reducedThroughOffset >= offset) return resolve();
			const waiter = {
				offset,
				resolve: () => {
					clearTimeout(timer);
					resolve();
				}
			};
			const timer = setTimeout(() => {
				this.#waitUntilProcessedWaiters.splice(this.#waitUntilProcessedWaiters.indexOf(waiter), 1);
				reject(/* @__PURE__ */ new Error(`processor "${this.#contract.slug}" did not reach offset ${offset} in ${timeoutMs}ms`));
			}, timeoutMs);
			this.#waitUntilProcessedWaiters.push(waiter);
			this.catchUpFromLog().catch((error) => {
				const i = this.#waitUntilProcessedWaiters.indexOf(waiter);
				if (i === -1) return;
				this.#waitUntilProcessedWaiters.splice(i, 1);
				clearTimeout(timer);
				reject(error instanceof Error ? error : new Error(String(error)));
			});
		});
	}
	/** Serialize on the chain. THE RULE: never await your own chain from inside a batch — a
	*  processor that appends during its batch would deadlock, which is why every append→drive
	*  caller is fire-and-forget. */
	#runOnSerialChain(work) {
		const run = this.#serialBatchChain.then(() => {
			if (this.#latchedRefusal) throw this.#latchedRefusal;
			return work();
		});
		this.#serialBatchChain = run.catch(() => {});
		return run;
	}
	/** The one-time cost of a contract version bump: re-reduce the durable log from offset 0 through
	*  the OLD cursor (`reduce` only — those effects already ran) and checkpoint under the new
	*  version. Never past the old cursor: re-reducing to the head instead would judge an
	*  already-queued in-flight push stale and swallow its effects. */
	async #rereduceIfVersionChanged() {
		if (!this.#staleCheckpoint) return;
		const target = this.#staleCheckpoint.reducedThroughOffset;
		let state = this.#contract.initialState();
		let reducedThroughOffset = 0;
		while (reducedThroughOffset < target) {
			const page = await this.#stream.read(reducedThroughOffset, 500);
			for (const event of page.events) if (event.offset <= target && reducesEvent(this.#contract.consumes, event)) state = this.#validateNormalizeAndReduce(event, state).state;
			if (page.scannedThroughOffset <= reducedThroughOffset) break;
			reducedThroughOffset = Math.min(page.scannedThroughOffset, target);
		}
		this.#writeCheckpointOrLatch(this.#contract.slug, {
			reducerVersion: this.#contract.version,
			reducedThroughOffset: target
		}, state, true);
		this.#reducedState = state;
		this.#reducedThroughOffset = target;
		this.#staleCheckpoint = void 0;
		this.publishLiveState();
		this.#resolveWaitUntilProcessedWaiters(target);
	}
	/** Rules 2–5 over one range (the caller has healed any durable prefix gap first). DURABLES reduce
	*  at-most-once (`offset > cursor`); EPHEMERALS ALWAYS deliver — each rides exactly one push and
	*  can never be a redelivery, so a durable-only wake that clamped the cursor PAST an ephemeral
	*  offset must not suppress it. The cursor is a DURABLE-reduce watermark and never regresses. */
	async #reduceAndCommitEventBatch(events, range, atHead) {
		const reducedThroughOffsetBefore = this.#reducedThroughOffset;
		const stateBefore = this.#reducedState;
		let state = stateBefore;
		const consumableEvents = events.filter((event) => reducesEvent(this.#contract.consumes, event) && (event.ephemeral || event.offset > reducedThroughOffsetBefore));
		let caughtUpDelivered = false;
		for (let i = 0; i < consumableEvents.length; i++) {
			const last = i === consumableEvents.length - 1;
			const r = await this.#reduceAndProcessEvent(consumableEvents[i], state, atHead && last);
			state = r.state;
			if (atHead && last && r.processed) caughtUpDelivered = true;
		}
		if (atHead && !caughtUpDelivered) state = (await this.#reduceAndProcessEvent(null, state, true)).state;
		const reducedThroughOffset = Math.max(reducedThroughOffsetBefore, range.through);
		const advanced = reducedThroughOffset > reducedThroughOffsetBefore;
		if (events.some((event) => !event.ephemeral) && advanced) this.#writeCheckpointOrLatch(this.#contract.slug, {
			reducerVersion: this.#contract.version,
			reducedThroughOffset
		}, state, state !== stateBefore);
		this.#reducedState = state;
		this.#reducedThroughOffset = reducedThroughOffset;
		this.#lastBatchAtHead = atHead;
		this.#resolveWaitUntilProcessedWaiters(reducedThroughOffset);
		this.publishLiveState();
	}
	/** Start an attempt: the first in flight claims the alarm (not awaited — a claim that has not
	*  landed when the host dies revives nothing either way, and the attempt must not wait on it);
	*  the last to settle releases the claim. */
	#runInBackground(work) {
		this.#backgroundWorkInFlight += 1;
		if (this.#backgroundWorkInFlight === 1) {
			this.#kv?.put(STARTED, {
				deaths: this.#kv.get(STARTED)?.deaths ?? 0,
				codeId: this.#codeId
			});
			this.#claim(REVIVE_AFTER_MS);
		}
		work().catch(unlessLoopLimit).catch((error) => reportIssue("processor.background", error, { slug: this.#contract.slug })).finally(() => {
			this.#backgroundWorkInFlight -= 1;
			if (this.#backgroundWorkInFlight === 0) {
				this.#revivesWhileBusy = 0;
				this.#kv?.delete(STARTED);
				this.#claim(null);
			}
		});
	}
	#claim(afterMs) {
		const at = afterMs === null ? null : Date.now() + afterMs;
		this.#claimChain = this.#claimChain.then(() => this.#stream.claim(at)).catch((error) => reportIssue("processor.claim", error, { slug: this.#contract.slug }));
	}
	/** THE REVIVE — the context's alarm pass calls this for a due claim (spent by then): catch up
	*  from the log and run the at-head pass, so a processor restarts what state says is still owed
	*  (rule 3). A fresh incarnation finds nothing in flight and starts it; an attempt still in flight
	*  here claims again, later each time (20 s, 40 s, … `REVIVE_AFTER_MAX_MS`). */
	async revive() {
		const started = this.#kv?.get(STARTED);
		if (started && this.#backgroundWorkInFlight === 0) {
			const deaths = started.codeId === this.#codeId ? started.deaths + 1 : 0;
			this.#kv.put(STARTED, {
				deaths,
				codeId: this.#codeId
			});
			if (deaths >= MAX_DEATHS) throw codedError("PERMANENT_FAILURE", `processor "${this.#contract.slug}": its work in flight died with its host ${deaths} times, so it is not started again until the processor receives an event`);
		}
		this.#lastBatchAtHead = false;
		await this.catchUpFromLog();
		if (!this.#lastBatchAtHead) await this.#runOnSerialChain(async () => {
			this.#reducedState = (await this.#reduceAndProcessEvent(null, this.#reducedState, true)).state;
			this.publishLiveState();
		});
		if (this.#backgroundWorkInFlight === 0) return;
		this.#revivesWhileBusy += 1;
		this.#claim(Math.min(REVIVE_AFTER_MS * 2 ** this.#revivesWhileBusy, REVIVE_AFTER_MAX_MS));
		await this.#claimChain;
	}
	/** THE GUARDED REDUCE, shared by the live flow and the version replay. A reducer that throws on an
	*  event (malformed, or one an OLDER version accepted) must never wedge the processor: on a version
	*  replay it would fail the catch-up before the new checkpoint is written, every incarnation. */
	#reduceOrKeep(event, state) {
		try {
			return this.processor.reduce({
				event,
				state
			}) ?? state;
		} catch (error) {
			reportIssue("processor.reduce", error, {
				slug: this.#contract.slug,
				offset: event.offset
			});
			return state;
		}
	}
	/** Validate a consumed event's payload against the contract's declared schema, then reduce it — or,
	*  for a malformed payload, skip the fold and report (it must never corrupt reduced state, the
	*  exported view a live client parses). Returns the next state AND the event to carry onward,
	*  NORMALIZED to the schema's `z.output` (coercions/defaults applied) when it validated — so the
	*  reducer, the effect hook, and the version replay all see exactly what `ConsumedEvent<Contract>`
	*  promises. SHARED by the live flow and `#rereduceIfVersionChanged`, so the two can never diverge
	*  (a coercion applied live but not on replay would make a version bump rewrite state). A payload-less
	*  event validates as `{}` (the "empty defaults" convention the contract requires of its stateSchema);
	*  a contract with no `events` catalog (the kernel-generic processors) folds unvalidated. */
	#validateNormalizeAndReduce(event, state) {
		const parsed = this.#contract.payloadSchemaFor(event.type)?.safeParse(event.payload ?? {});
		if (parsed && !parsed.success) {
			reportIssue("processor.reduce.payload", parsed.error, {
				slug: this.#contract.slug,
				offset: event.offset,
				type: event.type
			});
			return {
				state,
				event,
				valid: false
			};
		}
		const normalized = parsed ? {
			...event,
			payload: parsed.data
		} : event;
		return {
			state: this.#reduceOrKeep(normalized, state),
			event: normalized,
			valid: true
		};
	}
	/** THE per-event primitive (rules 2–3) — the batch loop and the eventless at-head pass both come
	*  here: a GUARDED reduce, then `processEvent` with a FIFO blocker chain drained to a FIXED POINT.
	*  Returns the next state and whether the effect ran — a malformed payload for a KNOWN event is
	*  SKIPPED for BOTH reduce and effect (the effect hook is typed against `ConsumedEvent`'s `z.output`,
	*  so handing it garbage would throw and wedge the batch — checkpoints never advance, catch-up
	*  refails the same row); `processed: false` lets the batch fall back to the eventless caught-up pass.
	*  Owns NO cursor / persist / waiter — the caller does. */
	async #reduceAndProcessEvent(event, state, caughtUp) {
		const { slug, version, emits } = this.#contract;
		const previousState = state;
		if (event) {
			const reduced = this.#validateNormalizeAndReduce(event, state);
			if (!reduced.valid) return {
				state: reduced.state,
				processed: false
			};
			state = reduced.state;
			event = reduced.event;
		}
		let blockers = Promise.resolve();
		const stamped = (emittedEvents) => {
			for (const emitted of emittedEvents) {
				if (!emits.includes(emitted.type)) throw new Error(`processor "${slug}" emits ${JSON.stringify(emitted.type)} without declaring it`);
				emitted.source = { processor: {
					slug,
					version,
					...event && { whileProcessing: {
						offset: event.offset,
						type: event.type
					} }
				} };
			}
			return emittedEvents;
		};
		if (event?.source?.cause) this.#headCause = {
			...event.source.cause,
			parent: `${event.path}@${event.offset}`
		};
		const own = this.#headCause;
		const beyond = own && {
			...own,
			depth: own.depth + 1
		};
		const under = (cause, work) => runCausedBy(cause, work);
		under(beyond, () => this.processor.processEvent({
			event,
			state,
			previousState,
			append: async (...emittedEvents) => await under(own, () => this.#stream.append(...stamped(emittedEvents))),
			blockProcessorWhile: (work) => {
				blockers = blockers.then(() => under(beyond, work)).catch(unlessLoopLimit);
			},
			runInBackground: (work) => this.#runInBackground(() => under(beyond, work)),
			delivery: { caughtUp }
		}));
		for (let awaited; awaited !== blockers;) {
			awaited = blockers;
			await awaited;
		}
		return {
			state,
			processed: true
		};
	}
	/** The checkpoint write, with the latch: REDUCE_CHECKPOINT_TOO_LARGE can only repeat. */
	#writeCheckpointOrLatch(slug, cursor, state, stateChanged) {
		try {
			this.#storage.write(slug, cursor, state, stateChanged);
		} catch (error) {
			if (errorCode(error) === "REDUCE_CHECKPOINT_TOO_LARGE") this.#latchedRefusal = error instanceof Error ? error : new Error(String(error));
			throw error;
		}
	}
	/** Resolve the waiters a cursor advance satisfies; keep the rest. */
	#resolveWaitUntilProcessedWaiters(reducedThroughOffset) {
		for (const w of this.#waitUntilProcessedWaiters.splice(0)) if (reducedThroughOffset >= w.offset) w.resolve();
		else this.#waitUntilProcessedWaiters.push(w);
	}
};
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
/** A delta whose patch is over this many chars is not sent: a whole-array replace of a large
*  projection would cost every watcher the projection per set, and past the event ceiling the append
*  would refuse it outright. The delta rides with `patch: null` instead — the rev moved, re-seed. */
const LIVE_STATE_PATCH_MAX_CHARS = 1048576;
var LiveState = class {
	#liveStateSink;
	#liveStateKey;
	#state;
	/** The DIFF BASE: the last value that serialized — what a client that applied every delta holds.
	*  Kept apart from `#state` so a value the wire cannot carry, adopted without an emit, never
	*  becomes the base every later diff would throw against. */
	#lastSerializedState;
	#liveStateRev;
	/** THE DELTA APPEND CHAIN — at most one delta append in flight, so commit order = mint order for a
	*  CROSS-HOP sink: its `getItx()` mints a FRESH scope per call, so two deltas
	*  issued in different turns race across the hop and the second can commit first — ~14% of rapid
	*  pairs on the deployed edge (never locally, the hop is sub-ms). Nothing is dropped by a reorder,
	*  but it costs every watcher the full seed re-read the deltas exist to avoid. Every delta rides
	*  this ONE chain and is emitted only after the previous append settles (see set()). Nobody waits
	*  on this. */
	#liveStateDeltaAppendChain = Promise.resolve();
	constructor(sink, key, initial) {
		this.#liveStateSink = sink;
		this.#liveStateKey = key;
		this.#state = initial;
		this.#lastSerializedState = initial;
		this.#liveStateRev = Date.now() * 4096 + Math.floor(Math.random() * 4096);
	}
	/** The current value (reflects every `set`). */
	get() {
		return this.#state;
	}
	/** THE seed read: `{rev, state}` read together (single-threaded ⇒ atomically), which is what lets
	*  a client chain patches exactly instead of guessing which changes its snapshot already contains. */
	snapshot() {
		return {
			rev: this.#liveStateRev,
			state: this.#state
		};
	}
	/** Replace the value: diff the last serialized base → next; on a real change bump the revision
	*  and append the delta. Build a NEW value (don't mutate `next` in place) — the diff is over JSON.
	*  A diff/append failure degrades to a LOST notification (the client re-seeds on the chain gap),
	*  never a throw the caller sees. */
	set(next) {
		if (next === this.#lastSerializedState) return;
		let patch;
		try {
			patch = diff(this.#lastSerializedState, next);
		} catch {
			this.#state = next;
			this.#liveStateRev += 1;
			return;
		}
		this.#state = next;
		this.#lastSerializedState = next;
		if (!patch) return;
		const from = this.#liveStateRev;
		const to = from + 1;
		this.#liveStateRev = to;
		const wirePatch = JSON.stringify(patch).length > LIVE_STATE_PATCH_MAX_CHARS ? null : patch;
		const emitDelta = () => this.#liveStateSink.append({
			type: "events.iterate.com/itx/live-state-changed",
			ephemeral: true,
			payload: {
				key: this.#liveStateKey,
				from,
				to,
				patch: wirePatch
			}
		});
		this.#liveStateDeltaAppendChain = this.#liveStateDeltaAppendChain.then(emitDelta).catch(() => {});
	}
};
//#endregion
export { ReduceCheckpointTable as a, idempotencyConflictMessage as c, currentCause as d, runCausedBy as f, REVIVE_AFTER_MS as i, sameIdempotentEvent as l, ProcessorEngine as n, StreamProcessor as o, REVIVE_AFTER_MAX_MS as r, consumesEvent as s, LiveState as t, causeOfRequest as u };

//# sourceMappingURL=processor-BBMTE8Jy.mjs.map