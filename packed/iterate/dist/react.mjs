import { connectLiveState } from "./client.mjs";
import { z } from "zod";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
//#region src/client/event-log.ts
const EMPTY_EVENT_LOG = {
	events: [],
	caughtUp: false,
	head: 0,
	older: {
		loading: false,
		exhausted: false
	},
	actors: [],
	tableVersion: 0
};
/** Offsets per read: the platform's page cap (core/os `stream.ts` READ_PAGE_MAX_EVENTS). */
const PAGE = 1e3;
/** Subscribe to a context's log and read it — the newest page (`"tail"`) or all of it (`"all"`). */
function connectEventLog(itx, opts) {
	let disposed = false;
	let subscription;
	const listeners = /* @__PURE__ */ new Set();
	let snapshot = EMPTY_EVENT_LOG;
	const seen = /* @__PURE__ */ new Set();
	let events = [];
	let pending = [];
	let caughtUp = false;
	let error;
	let head = 0;
	/** Every durable event after this offset is held (or pending); 0 = the log from its first. */
	let floor = 0;
	let loadingOlder = false;
	let tableVersion = 0;
	const byActor = /* @__PURE__ */ new Map();
	let actors = [];
	let scheduled = false;
	const schedule = () => {
		if (scheduled || disposed) return;
		scheduled = true;
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(flush);
		else setTimeout(flush, 16);
	};
	const flush = () => {
		scheduled = false;
		if (disposed) return;
		const fresh = [];
		let actorsChanged = false;
		for (const event of pending) {
			if (seen.has(event.offset)) continue;
			seen.add(event.offset);
			fresh.push(event);
			if (event.offset > head) head = event.offset;
			if (event.type.startsWith("events.iterate.com/itx/subscription-")) tableVersion = Math.max(tableVersion, event.offset);
			const principal = event.source?.principal;
			const held = principal && byActor.get(principal.actor);
			if (principal && (!held || held.offset < event.offset)) {
				byActor.set(principal.actor, {
					actor: principal.actor,
					email: principal.email,
					grant: event.source?.grant,
					lastSeenAt: event.createdAt,
					offset: event.offset
				});
				actorsChanged = true;
			}
		}
		pending = [];
		if (fresh.length > 0) {
			fresh.sort((a, b) => a.offset - b.offset);
			if (events.length === 0 || fresh[0].offset > events.at(-1).offset) events = events.concat(fresh);
			else if (fresh.at(-1).offset < events[0].offset) events = fresh.concat(events);
			else events = events.concat(fresh).sort((a, b) => a.offset - b.offset);
		}
		if (actorsChanged) actors = [...byActor.values()].map(({ offset: _, ...presence }) => presence).sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
		snapshot = {
			events,
			caughtUp,
			error,
			head,
			older: {
				loading: loadingOlder || !caughtUp && !error,
				exhausted: caughtUp && floor === 0
			},
			actors,
			tableVersion
		};
		for (const listener of listeners) listener();
	};
	const take = (events) => {
		for (const event of events) pending.push(event);
		schedule();
	};
	const fail = (caught) => {
		if (disposed) return;
		error = caught instanceof Error ? caught.message : String(caught);
		schedule();
	};
	/** Read every durable event in (after, through] — pages are cut by count AND bytes, and a log's
	*  offsets have gaps (ephemerals take offsets the log never stores), so read on until the scan
	*  reaches `through` (or the head). A page holds `limit` EVENTS, so under a gap it runs past
	*  `through`: what it holds above is already held. Returns how many events were in the window. */
	const readThrough = async (after, through) => {
		let taken = 0;
		for (;;) {
			const page = await itx.readEvents(after, Math.min(PAGE, through - after));
			if (disposed) return taken;
			const inWindow = toStreamEvents(page.events).filter((event) => event.offset <= through);
			take(inWindow);
			taken += inWindow.length;
			if (page.atHead || page.scannedThroughOffset >= through || page.scannedThroughOffset <= after) return taken;
			after = page.scannedThroughOffset;
		}
	};
	(async () => {
		const handle = await itx.subscribe({
			consumes: opts.consumes,
			target: (batch) => !disposed && take(toStreamEvents(batch))
		});
		if (disposed) {
			handle[Symbol.dispose]();
			return;
		}
		subscription = handle;
		if (opts.history === "tail") {
			const probe = await itx.readEvents(Number.MAX_SAFE_INTEGER, 1);
			if (disposed) return;
			head = Math.max(head, probe.scannedThroughOffset);
			floor = Math.max(0, probe.scannedThroughOffset - PAGE);
		}
		await readThrough(floor, Infinity);
		caughtUp = true;
		schedule();
	})().catch(fail);
	return {
		get: () => snapshot,
		subscribe(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		loadOlder() {
			if (disposed || !caughtUp || loadingOlder || floor === 0) return;
			loadingOlder = true;
			schedule();
			(async () => {
				let window = PAGE;
				let taken = 0;
				while (floor > 0 && taken < PAGE / 4) {
					const from = Math.max(0, floor - window);
					taken += await readThrough(from, floor);
					if (disposed) return;
					floor = from;
					window = Math.min(window * 2, 16 * PAGE);
				}
			})().catch(fail).finally(() => {
				loadingOlder = false;
				schedule();
			});
		},
		dispose() {
			disposed = true;
			listeners.clear();
			subscription?.[Symbol.dispose]();
		}
	};
}
/** A wire batch (capnweb proxy values or plain objects) as `StreamEvent`s — one clone per batch,
*  not per event — without the rows the view cannot place (no offset, type or time). Structural,
*  not a schema: the transport validated them; the three fields checked are all the log indexes by. */
function toStreamEvents(batch) {
	return JSON.parse(JSON.stringify(batch)).filter((value) => value && typeof value.offset === "number" && typeof value.type === "string" && typeof value.createdAt === "string");
}
//#endregion
//#region src/client/react.tsx
/** @jsxImportSource react */
/** Subscribe to a producer's live state and render its latest value. Pass a ready `itx` (a capnweb
*  `api.authenticate(credentials).user` or `.projects.get(id)`), the producer's `key`, and a `readSeed`
*  thunk that reads `{rev, state}` (`() => itx.invoke("itx.facets.get('slug').liveSnapshot()")`).
*  Re-subscribes when the session, `key`, or `name` changes; unmount (and every re-subscribe)
*  disposes the previous server-side subscription. */
function useLiveState(itx, opts) {
	const [store, setStore] = useState();
	const [status, setStatus] = useState("connecting");
	const [error, setError] = useState();
	const readSeedRef = useRef(opts.readSeed);
	readSeedRef.current = opts.readSeed;
	useEffect(() => {
		setStore(void 0);
		setStatus("connecting");
		setError(void 0);
		if (!itx) return;
		const readSeed = readSeedRef.current;
		let disposed = false;
		let dispose;
		const unmounted = new AbortController();
		connectLiveState(itx, {
			key: opts.key,
			name: opts.name,
			readSeed,
			signal: unmounted.signal,
			onResync: (r) => {
				if (disposed) return;
				if (r === "healed") {
					setStatus("live");
					setError(void 0);
				} else {
					setStatus("error");
					setError(r.message);
				}
			}
		}).then((conn) => {
			dispose = conn.dispose;
			if (disposed) {
				conn.dispose();
				return;
			}
			setStore(conn.store);
			setStatus("live");
		}, (e) => {
			if (disposed) return;
			setError(e instanceof Error ? e.message : String(e));
			setStatus("error");
		});
		return () => {
			disposed = true;
			unmounted.abort();
			dispose?.();
		};
	}, [
		itx,
		opts.key,
		opts.name
	]);
	const subscribe = useCallback((cb) => store ? store.subscribe(cb) : () => {}, [store]);
	return {
		value: useSyncExternalStore(subscribe, () => store?.get(), () => void 0),
		rev: store?.rev() ?? null,
		status,
		error
	};
}
/** The live state of a facet hosted on a held context — `useLiveState` seeded by the facet's own
*  `liveSnapshot()` (`{ rev, state }`). The value is unparsed: deltas arrive unvalidated, so a
*  caller parses what it reads (`Schema.safeParse(live.value)`). */
function useFacetLiveState(itx, facet) {
	return useLiveState(itx, {
		key: facet,
		readSeed: async () => FacetLiveSnapshot.parse(await itx.invoke(`itx.facets.get('${facet}').liveSnapshot()`))
	});
}
/** What a facet's `liveSnapshot()` answers. */
const FacetLiveSnapshot = z.object({
	rev: z.number(),
	state: z.unknown()
});
/** Hold a capnweb context stub for as long as the component wants it: `open()` —
*  `() => api.projects.get(id)`, `() => root.cd(path)` — runs when `deps` change, and the stub is
*  disposed on unmount, on every re-open, and when it arrives after the component moved on (every
*  open stub is a subscription row and a pinned Durable Object on the platform). `open` null opens
*  nothing; `pending` while an open is in flight; `error` the refusal. */
function useContextStub(open, deps) {
	const [state, setState] = useState(() => ({ pending: Boolean(open) }));
	useEffect(() => {
		if (!open) {
			setState({ pending: false });
			return;
		}
		setState((previous) => previous.pending && !previous.stub ? previous : { pending: true });
		let disposed = false;
		let held;
		open().then((stub) => {
			if (disposed) return stub[Symbol.dispose]();
			held = stub;
			setState({
				stub,
				pending: false
			});
		}, (caught) => !disposed && setState({
			error: caught instanceof Error ? caught.message : String(caught),
			pending: false
		}));
		return () => {
			disposed = true;
			held?.[Symbol.dispose]();
		};
	}, deps);
	return state;
}
/** A named live state before its first seed lands — and before the effect that opens it has run. */
const LIVE_STATE_CONNECTING = {
	value: void 0,
	rev: null,
	status: "connecting"
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
function useIterateContext(itx, opts = {}) {
	const [log, setLog] = useState();
	const consumesKey = JSON.stringify(opts.consumes || ["*"]);
	const history = opts.history || "tail";
	useEffect(() => {
		setLog(void 0);
		if (!itx) return;
		const connection = connectEventLog(itx, {
			consumes: JSON.parse(consumesKey),
			history
		});
		setLog({
			itx,
			connection
		});
		return () => connection.dispose();
	}, [
		itx,
		consumesKey,
		history
	]);
	const connection = itx && log?.itx === itx ? log.connection : void 0;
	const subscribeLog = useCallback((listener) => connection ? connection.subscribe(listener) : () => {}, [connection]);
	const held = useSyncExternalStore(subscribeLog, () => connection?.get() ?? EMPTY_EVENT_LOG, () => EMPTY_EVENT_LOG);
	const { events: sorted, caughtUp, head, tableVersion } = held;
	const loadOlder = useCallback(() => connection?.loadOlder(), [connection]);
	const older = useMemo(() => ({
		loadOlder,
		loading: held.older.loading,
		exhausted: held.older.exhausted
	}), [loadOlder, held.older]);
	const headForReads = useThrottled(head, 1e3);
	const [table, setTable] = useState();
	const [failure, setFailure] = useState();
	useEffect(() => {
		if (!itx) return;
		let disposed = false;
		Promise.resolve(itx.subscriptions.list()).then((list) => {
			if (disposed) return;
			setTable({
				itx,
				rows: list
			});
			setFailure(void 0);
		}, (e) => !disposed && setFailure({
			itx,
			message: e instanceof Error ? e.message : String(e)
		}));
		return () => {
			disposed = true;
		};
	}, [
		itx,
		tableVersion,
		headForReads
	]);
	const currentTable = itx && table?.itx === itx ? table : void 0;
	const [census, setCensus] = useState();
	useEffect(() => {
		if (!itx) return;
		let disposed = false;
		Promise.resolve(itx.rpcStubs.list()).then((list) => !disposed && setCensus({
			itx,
			rpcStubs: list
		}), () => void 0);
		return () => {
			disposed = true;
		};
	}, [itx, headForReads]);
	const rpcStubs = itx && census?.itx === itx ? census.rpcStubs : [];
	const liveStateKey = JSON.stringify(opts.liveState || ["core", ...(currentTable?.rows || []).flatMap((row) => row.hostedFacet ? [row.hostedFacet.name] : [])]);
	const [liveStates, setLiveStates] = useState();
	useEffect(() => {
		if (!itx) return;
		const names = JSON.parse(liveStateKey);
		if (names.length === 0) return;
		let disposed = false;
		const unmounted = new AbortController();
		const disposers = [];
		const patch = (name, change) => setLiveStates((held) => held && held.itx === itx && held.key === liveStateKey ? {
			...held,
			entries: {
				...held.entries,
				[name]: {
					...held.entries[name],
					...change
				}
			}
		} : held);
		setLiveStates({
			itx,
			key: liveStateKey,
			entries: Object.fromEntries(names.map((name) => [name, LIVE_STATE_CONNECTING]))
		});
		for (const name of names) {
			if (name === "core") continue;
			connectLiveState(itx, {
				key: name,
				readSeed: async () => await itx.invoke(`itx.facets.get('${name}').liveSnapshot()`),
				signal: unmounted.signal,
				onResync: (result) => {
					if (disposed) return;
					if (result === "healed") patch(name, {
						status: "live",
						error: void 0
					});
					else patch(name, {
						status: "error",
						error: result.message
					});
				}
			}).then((connection) => {
				if (disposed) {
					connection.dispose();
					return;
				}
				disposers.push(connection.dispose);
				disposers.push(connection.store.subscribe(() => patch(name, {
					value: connection.store.get(),
					rev: connection.store.rev()
				})));
				patch(name, {
					value: connection.store.get(),
					rev: connection.store.rev(),
					status: "live"
				});
			}, (e) => {
				if (disposed) return;
				patch(name, {
					status: "error",
					error: e instanceof Error ? e.message : String(e)
				});
			});
		}
		return () => {
			disposed = true;
			unmounted.abort();
			for (const dispose of disposers) dispose();
		};
	}, [itx, liveStateKey]);
	const wantsCore = JSON.parse(liveStateKey).includes("core");
	const [core, setCore] = useState();
	const coreReads = useRef({
		inFlight: false,
		again: false
	});
	useEffect(() => {
		if (!itx || !wantsCore || !caughtUp) return;
		const reads = coreReads.current;
		if (reads.itx !== itx) Object.assign(reads, {
			itx,
			inFlight: false,
			again: false
		});
		if (reads.inFlight) {
			reads.again = true;
			return;
		}
		const read = () => {
			reads.inFlight = true;
			reads.again = false;
			itx.invoke("itx.facets.get('core').snapshot()").then((answer) => {
				const snapshot = answer;
				if (reads.itx !== itx) return;
				setCore({
					itx,
					result: {
						value: snapshot.state,
						rev: snapshot.offset,
						status: "live"
					}
				});
			}, (e) => reads.itx === itx && setCore({
				itx,
				result: {
					value: void 0,
					rev: null,
					status: "error",
					error: e instanceof Error ? e.message : String(e)
				}
			})).finally(() => {
				if (reads.itx !== itx) return;
				reads.inFlight = false;
				if (reads.again) read();
			});
		};
		read();
	}, [
		itx,
		wantsCore,
		caughtUp,
		headForReads
	]);
	useEffect(() => () => {
		coreReads.current.itx = void 0;
	}, []);
	const liveState = useMemo(() => {
		const names = JSON.parse(liveStateKey);
		const held = { ...itx && liveStates?.itx === itx && liveStates.key === liveStateKey && liveStates.entries };
		if (itx && core?.itx === itx) held.core = core.result;
		else delete held.core;
		return Object.fromEntries(names.map((name) => [name, held[name] || LIVE_STATE_CONNECTING]));
	}, [
		itx,
		liveStateKey,
		liveStates,
		core
	]);
	return {
		events: sorted,
		caughtUp,
		error: held.error,
		head,
		older,
		processors: {
			rows: currentTable?.rows || [],
			loaded: Boolean(currentTable),
			error: itx && failure?.itx === itx ? failure.message : void 0
		},
		presence: {
			actors: held.actors,
			rpcStubs
		},
		liveState
	};
}
/** `value`, changing at most once per `ms`: the latest value lands `ms` after the last change let
*  through (at once when that is past), so a value that moves every frame is read once a period and
*  its last move is never lost. */
function useThrottled(value, ms) {
	const [held, setHeld] = useState(value);
	const lastLetThrough = useRef(0);
	useEffect(() => {
		if (Object.is(value, held)) return;
		const timer = setTimeout(() => {
			lastLetThrough.current = Date.now();
			setHeld(value);
		}, Math.max(0, lastLetThrough.current + ms - Date.now()));
		return () => clearTimeout(timer);
	}, [
		value,
		held,
		ms
	]);
	return held;
}
//#endregion
export { useContextStub, useFacetLiveState, useIterateContext, useLiveState };

//# sourceMappingURL=react.mjs.map