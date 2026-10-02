import { applyPatch } from "./lib.mjs";
import { z } from "zod";
//#region src/client/live-state.ts
/** The delta as it arrives over the wire — PARSED, never cast: `from`/`to` MUST be real numbers (a
*  non-numeric rev would poison the held revision and silently wedge every later frame), and each
*  patch op is a known RFC-6902-subset shape. A frame that fails this heals by re-reading the seed
*  rather than being applied — the same recovery the store already runs on a revision gap. */
const LiveStateDeltaMessage = z.object({
	key: z.string(),
	from: z.number(),
	to: z.number(),
	patch: z.array(z.union([
		z.object({
			op: z.literal("add"),
			path: z.string(),
			value: z.unknown()
		}),
		z.object({
			op: z.literal("replace"),
			path: z.string(),
			value: z.unknown()
		}),
		z.object({
			op: z.literal("remove"),
			path: z.string()
		})
	])).nullable()
});
function createLiveStateStore() {
	let held = {
		rev: null,
		state: void 0
	};
	const listeners = /* @__PURE__ */ new Set();
	const notify = () => listeners.forEach((l) => l());
	return {
		get: () => held.state,
		rev: () => held.rev,
		subscribe: (listener) => {
			listeners.add(listener);
			return () => void listeners.delete(listener);
		},
		seed: (seed) => {
			if (held.rev !== null && seed.rev < held.rev) return;
			held = {
				rev: seed.rev,
				state: seed.state
			};
			notify();
		},
		apply: (delta, resync) => {
			if (held.rev !== null && delta.to <= held.rev) return;
			if (delta.from !== held.rev || !delta.patch) {
				resync();
				return;
			}
			held = {
				rev: delta.to,
				state: applyPatch(held.state, delta.patch)
			};
			notify();
		}
	};
}
/** Subscribe to a producer's live state and reduce it into a store. `readSeed` reads the seed
*  (`itx.invoke("itx.facets.get('slug').liveSnapshot()")` for a processor, or a mini-app's
*  own `state()` method). Subscribe happens BEFORE the first seed, so a delta racing the seed just
*  triggers one seed re-read — never a lost update. Gap heals are SINGLE-FLIGHT (a burst of gapped
*  frames triggers one seed read, not one per frame); a failed heal is reported through `onResync`
*  and retried by the next delivered delta (its `from` still mismatches, so it re-triggers). */
async function connectLiveState(itx, opts) {
	const store = createLiveStateStore();
	let healing = false;
	let healWantedAgain = false;
	let disposed = false;
	const reseed = () => {
		if (disposed) return;
		if (healing) {
			healWantedAgain = true;
			return;
		}
		healing = true;
		const settled = () => {
			healing = false;
			if (disposed || !healWantedAgain) return;
			healWantedAgain = false;
			reseed();
		};
		opts.readSeed().then((s) => {
			if (!disposed) {
				store.seed(s);
				opts.onResync?.("healed");
			}
			settled();
		}, (e) => {
			if (!disposed) opts.onResync?.(e instanceof Error ? e : new Error(String(e)));
			settled();
		});
	};
	const subscription = await itx.subscribe({
		name: opts.name,
		consumes: ["events.iterate.com/itx/live-state-changed"],
		target: (events) => {
			if (disposed) return;
			for (const e of events) {
				let parsed;
				try {
					parsed = LiveStateDeltaMessage.safeParse(JSON.parse(JSON.stringify(e.payload)));
				} catch {
					parsed = void 0;
				}
				if (!parsed?.success) {
					reseed();
					continue;
				}
				if (parsed.data.key !== opts.key) continue;
				try {
					store.apply(parsed.data, reseed);
				} catch {
					reseed();
				}
			}
		}
	});
	try {
		const seed = opts.readSeed();
		const { signal } = opts;
		const aborted = signal && new Promise((_, reject) => {
			const abort = () => reject(signal.reason ?? /* @__PURE__ */ new Error("connectLiveState: aborted while the first seed was pending"));
			if (signal.aborted) abort();
			else signal.addEventListener("abort", abort, { once: true });
		});
		if (aborted) seed.catch(() => void 0);
		store.seed(await (aborted ? Promise.race([seed, aborted]) : seed));
	} catch (error) {
		disposed = true;
		try {
			subscription[Symbol.dispose]();
		} catch {}
		throw error;
	}
	return {
		store,
		async dispose() {
			if (disposed) return;
			disposed = true;
			try {
				subscription[Symbol.dispose]();
			} catch {}
		}
	};
}
//#endregion
export { connectLiveState, createLiveStateStore };

//# sourceMappingURL=client.mjs.map