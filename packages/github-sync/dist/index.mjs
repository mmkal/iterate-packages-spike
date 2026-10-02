import { t as githubRepositoryOf } from "./github-repository-aAAfWiEf.mjs";
import { StreamProcessorDurableObject } from "iterate/sdk";
import { z } from "zod";
import { StreamProcessor, defineProcessorContract } from "iterate/stream/processor";
//#region src/contract.ts
const GithubSyncContract = defineProcessorContract({
	slug: "github-sync",
	version: "3",
	description: "Pulls origin's pushes into the installed repo and pushes the repo's commits to origin.",
	stateSchema: z.object({ repo: z.string().nullable().default(null) }),
	consumes: [
		"events.iterate.com/github/webhook-received",
		"events.iterate.com/repo/commit-completed",
		"github-sync/installed"
	],
	emits: ["github-sync/synced"]
});
//#endregion
//#region \0@oxc-project+runtime@0.151.0/helpers/esm/usingCtx.js
function _usingCtx() {
	var r = "function" == typeof SuppressedError ? SuppressedError : function(r, e) {
		var n = Error();
		return n.name = "SuppressedError", n.error = r, n.suppressed = e, n;
	}, e = {}, n = [];
	function using(r, e) {
		if (null != e) {
			if (Object(e) !== e) throw new TypeError("using declarations can only be used with objects, functions, null, or undefined.");
			if (r) var o = e[Symbol.asyncDispose || Symbol["for"]("Symbol.asyncDispose")];
			if (void 0 === o && (o = e[Symbol.dispose || Symbol["for"]("Symbol.dispose")], r)) var t = o;
			if ("function" != typeof o) throw new TypeError("Object is not disposable.");
			t && (o = function o() {
				try {
					t.call(e);
				} catch (r) {
					return Promise.reject(r);
				}
			}), n.push({
				v: e,
				d: o,
				a: r
			});
		} else r && n.push({
			d: e,
			a: r
		});
		return e;
	}
	return {
		e,
		u: using.bind(null, !1),
		a: using.bind(null, !0),
		d: function d() {
			var o, t = this.e, s = 0;
			function next() {
				for (; o = n.pop();) try {
					if (!o.a && 1 === s) return s = 0, n.push(o), Promise.resolve().then(next);
					if (o.d) {
						var r = o.d.call(o.v);
						if (o.a) return s |= 2, Promise.resolve(r).then(next, err);
					} else s |= 1;
				} catch (r) {
					return err(r);
				}
				if (1 === s) return t !== e ? Promise.reject(t) : Promise.resolve();
				if (t !== e) throw t;
			}
			function err(n) {
				return t = t !== e ? new r(n, t) : n, next();
			}
			return next();
		}
	};
}
//#endregion
//#region src/processor.ts
const PushWebhook = z.object({
	delivery: z.object({ name: z.literal("push") }),
	body: z.object({
		ref: z.literal("refs/heads/main"),
		repository: z.object({ full_name: z.string() })
	})
});
const CommitCompleted = z.object({ path: z.string() });
const GithubSyncInstalled = z.object({ repo: z.string().startsWith("/repos/") });
var GithubSyncProcessor = class extends StreamProcessor {
	contract = GithubSyncContract;
	#getItx;
	constructor(getItx) {
		super();
		this.#getItx = getItx;
	}
	reduce({ event }) {
		if (event.type !== "github-sync/installed") return;
		const installed = GithubSyncInstalled.safeParse(event.payload);
		if (installed.success) return { repo: installed.data.repo };
	}
	processEvent({ event, state, append, blockProcessorWhile }) {
		const { repo } = state;
		if (!event || !repo) return;
		const push = event.type === "events.iterate.com/github/webhook-received" ? PushWebhook.safeParse(event.payload) : null;
		const pushedRepository = push?.success ? push.data.body.repository.full_name : null;
		const committed = event.type === "events.iterate.com/repo/commit-completed" && CommitCompleted.safeParse(event.payload).data?.path === repo;
		if (!pushedRepository && !committed) return;
		blockProcessorWhile(async () => {
			let outcome;
			try {
				var _usingCtx$1 = _usingCtx();
				const handle = _usingCtx$1.u(this.#getItx()).repos.get(repo);
				const origin = await handle.origin();
				if (!origin) return;
				if (pushedRepository && githubRepositoryOf(origin) !== pushedRepository) return;
				try {
					outcome = pushedRepository ? { pull: await handle.pull() } : { push: await handle.push() };
				} catch (error) {
					const { code, message } = error;
					outcome = {
						[pushedRepository ? "pull" : "push"]: code === "NOT_FAST_FORWARD" ? "not-fast-forward" : "failed",
						error: String(message)
					};
				}
			} catch (_) {
				_usingCtx$1.e = _;
			} finally {
				_usingCtx$1.d();
			}
			await append({
				type: "github-sync/synced",
				payload: {
					repo,
					trigger: event.offset,
					...outcome
				},
				idempotencyKey: this.idempotencyKey("synced", event)
			});
		});
	}
};
//#endregion
//#region src/durable-object.ts
var GithubSyncDurableObject = class extends StreamProcessorDurableObject {
	processor = new GithubSyncProcessor(() => this.getItx());
};
//#endregion
export { GithubSyncDurableObject };
