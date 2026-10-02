import { codedError, isSameOriginBrowserRequest, releaseRpcSessions } from "./lib.mjs";
import { a as ReduceCheckpointTable, d as currentCause, f as runCausedBy, n as ProcessorEngine, u as causeOfRequest } from "./processor-BBMTE8Jy.mjs";
import { ITX_PRINCIPAL_HEADER } from "./principal.mjs";
import { t as _usingCtx } from "./usingCtx-5QB_oFRV.mjs";
import { DurableObject, RpcStub, RpcTarget, WorkerEntrypoint } from "cloudflare:workers";
import { z } from "zod";
import { newHttpBatchRpcSession as newHttpBatchRpcSession$1, newWebSocketRpcSession as newWebSocketRpcSession$1, newWorkersRpcResponse } from "capnweb";
//#region src/sdk/auth.ts
const Principal = z.object({
	actor: z.string().min(1),
	email: z.string().optional()
});
/** Project ingress strips public identity headers and stamps `x-itx-principal` for a project member
*  only: a visitor signed out, signed in without this project, or riding a session cookie on a
*  cross-site write arrives without one. This guard runs in the config worker, before it proxies an
*  app.
*
*  Signed out, every request gets `401` with `WWW-Authenticate: Bearer realm="iterate"`: the
*  platform's edge turns that answer into the sign-in for a page load (or into "sign in again with
*  this project" for someone signed in without it), whatever path the app is served under, and hands
*  a fetch, a write or a WebSocket upgrade the 401 itself. Any app can ask for a signed-in visitor
*  the same way:
*
*  ```js
*  if (!request.headers.get("x-itx-principal"))
*    return new Response("Sign in\n", { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="iterate"' } });
*  ```
*
*  A write or a WebSocket upgrade must also come from this origin (or carry no Origin, a non-browser
*  client), else 403. The edge already sends such a cookie request on anonymous; this repeats the
*  check where the app runs. The handshake is a GET, but it opens a two-way channel, and the app
*  session cookie is `SameSite=Lax`: every `<routingSlug>--<project>.iterate.app` host is same-site with
*  every other, so a page on another project's host could otherwise open a socket to this app with
*  the visitor's cookie. */
const auth = { require(request) {
	const isWebSocketUpgrade = request.headers.get("upgrade")?.toLowerCase() === "websocket";
	if (!([
		"GET",
		"HEAD",
		"OPTIONS"
	].includes(request.method) && !isWebSocketUpgrade) && !isSameOriginBrowserRequest(request)) return new Response("Cross-site request refused", { status: 403 });
	const principal = request.headers.get(ITX_PRINCIPAL_HEADER);
	if (principal) {
		Principal.parse(JSON.parse(principal));
		return null;
	}
	return new Response("Sign in\n", {
		status: 401,
		headers: {
			"WWW-Authenticate": "Bearer realm=\"iterate\"",
			"Cache-Control": "no-store"
		}
	});
} };
//#endregion
//#region src/sdk/call-with-cause.ts
/** `callWithCause` (../cause.ts): the platform's way to walk `steps` on `host` under the cause of
*  the call that made it — only as far as Workers RPC would reach, and never into `callWithCause`
*  itself or `getItx`, which Workers RPC reaches on every loaded entrypoint (loaded-worker.ts). */
function walkUnderCause(host, cause, steps) {
	return runCausedBy(cause, async () => {
		let value = host;
		for (const step of steps) {
			const [name, ...args] = typeof step === "string" ? [step] : step;
			if (name === "callWithCause") throw codedError("NOT_A_METHOD", "callWithCause is the platform's alone");
			if (name === "getItx") throw codedError("NOT_A_METHOD", "getItx is the code's own");
			const member = memberRpcReaches(value, name);
			value = typeof step === "string" ? await member : await Reflect.apply(member, value, args);
		}
		return value;
	});
}
function memberRpcReaches(value, name) {
	if (value instanceof RpcStub) return value[name];
	const prototype = typeof value === "object" && value ? Object.getPrototypeOf(value) : void 0;
	if (!(value instanceof RpcTarget || value instanceof DurableObject || value instanceof WorkerEntrypoint ? name in value && !Object.hasOwn(value, name) && !(name in Object.prototype) : (prototype === Object.prototype || prototype === Array.prototype || prototype === null) && Object.hasOwn(value, name))) throw codedError("NOT_A_METHOD", `${name} is no method Workers RPC would reach`);
	return value[name];
}
//#endregion
//#region src/sdk/itx-scope.ts
/** ONE get on `entrypoint`, under the running cause, for a `using` declaration: its
*  `[Symbol.dispose]` releases the scope and every call made through it or through a handle it
*  awaited, the last first. A release that throws is reported and the rest still run (lib.ts
*  `releaseRpcSessions`), so an answer already awaited stands. Data stays usable after the block;
*  a stub or handle is released with the rest, so a block hands out data. Await every call before
*  the block ends: `return await itx.whoami()`, never `return itx.whoami()`.
*
*    using itx = this.getItx();
*    const { projectSlug } = await itx.whoami();
*/
function itxScope(entrypoint) {
	const steps = [];
	const itx = entrypoint.get(currentCause());
	return recordPipelinedSteps(itx, steps, () => releaseRpcSessions([itx, ...steps]));
}
/** `stub` as the caller sees it, except that every CALL made through it — at any depth, on the stub,
*  on a call's result, or on the handle a call's result resolves to once awaited — is pushed onto
*  `steps`, so the caller can dispose each one: a Workers-RPC call's result is a stub-bearing promise
*  that keeps its session open until disposed, awaited or not. Awaiting hands back a handle (a stub
*  is callable, in workerd and capnweb alike) recorded and pushed too, and plain data untouched, so
*  data still copies across RPC. `catch`/`finally` and symbol members (`Symbol.dispose`) are the
*  value's own, bound to it, so disposing behaves exactly as on the bare stub — but for `stub`'s own
*  `[Symbol.dispose]`, which is `release` when one is given (`itxScope`); an argument that is
*  itself a recorded value crosses the wire as the stub it wraps. */
function recordPipelinedSteps(stub, steps, release) {
	const wrapped = /* @__PURE__ */ new WeakMap();
	const record = (value, receiver) => {
		if (!value || typeof value !== "object" && typeof value !== "function") return value;
		const proxy = new Proxy(value, {
			get(target, key) {
				if (release && key === Symbol.dispose && target === stub) return release;
				const member = Reflect.get(target, key);
				if (key === "then" && typeof member === "function") return (onFulfilled, onRejected) => Reflect.apply(member, target, [typeof onFulfilled === "function" ? (answer) => {
					if (typeof answer !== "function") return onFulfilled(answer);
					steps.push(answer);
					return onFulfilled(record(answer, void 0));
				} : onFulfilled, onRejected]);
				if (typeof key === "symbol" || key === "then" || key === "catch" || key === "finally") return typeof member === "function" ? member.bind(target) : member;
				return record(member, target);
			},
			apply(target, _proxyReceiver, args) {
				const result = Reflect.apply(target, receiver, args.map((arg) => wrapped.get(Object(arg)) ?? arg));
				steps.push(result);
				return record(result, void 0);
			}
		});
		wrapped.set(proxy, value);
		return proxy;
	};
	return record(stub, void 0);
}
//#endregion
//#region src/sdk/index.ts
/** THE FACET SHELL: a `DurableObject` a context hosts as a facet — `itx.facets.get(name, { source,
*  className })`, a rule naming it, or a processor's row. A caller reaches a facet by itx expression
*  (`itx.facets.get(name).<method>(…)`) only through what its class lists in `publicMethods`: the
*  context refuses any other first step FORBIDDEN before the call reaches the facet
*  (core/os context/facet-public-methods.ts). The platform's own calls — the delivery loop's push
*  and catch-up, the alarm's revive — never go through the list. A loaded class that does not
*  extend this shell lists nothing, so no caller reaches it by expression. */
var FacetDurableObject = class extends DurableObject {
	/** What a caller may reach by itx expression: the FIRST step of `itx.facets.get(name).<step>…`, a
	*  method or a property of this class. A subclass lists its own on top of its parent's:
	*  `static override publicMethods = [...super.publicMethods, "send"]`. */
	static publicMethods = ["fetch"];
	constructor(ctx, env) {
		super(ctx, env);
		const serve = this.fetch;
		if (serve) this.fetch = (request) => runCausedBy(causeOfRequest(request), () => serve.call(this, request));
	}
	/** THE CALL UNDER A CAUSE (`walkUnderCause`): a caller's `itx.facets.get(name).<steps>`, the
	*  alarm's revive. On no list: only the platform calls it (core/os context/facet-host.ts). */
	callWithCause(cause, steps) {
		return walkUnderCause(this, cause, steps);
	}
	/** This class's `publicMethods`, for the context that loaded it — a static does not cross the
	*  isolate. On no list: only the context asks it. */
	listPublicMethods() {
		return this.constructor.publicMethods;
	}
	/** `using itx = this.getItx()`: this facet's context's scope, released with every call made
	*  through it when the block ends (itx-scope.ts). Keep no RPC values past the block; see
	*  test/vitest/os/context-residency.e2e.test.ts, "A FACET DOES NOT OUTLIVE ITS CONTEXT", for why.
	*  A field, not a method: Workers RPC reaches a class's methods, and no caller may get the scope. */
	getItx = () => itxScope(this.#itxEntrypoint());
	/** The loopback to this facet's context: a LOADED class gets it as `env.ITX` (the loader bakes the
	*  stub in, worker-loader.ts); a class of THIS worker hosted through `ctx.exports` has the
	*  worker's real env and mints the same stub itself from its props — `ctx.exports` is populated
	*  inside a facet (test/vitest/os-workers/facets.test.ts). The casts name what workers-types cannot:
	*  this worker's own `ItxEntrypoint` export, and the scope its `get` answers, which `Scope` is. */
	#itxEntrypoint() {
		return this.env.ITX ?? this.ctx.exports.ItxEntrypoint({ props: {
			iterateContextName: this.ctx.props.iterateContextName,
			platform: true
		} });
	}
};
var StreamProcessorDurableObject = class extends FacetDurableObject {
	/** The reads a caller reaches on every processor: `fetch`, and the state caught up through the log
	*  (`snapshot`, `liveSnapshot`) or awaited (`waitUntilProcessed`). What feeds the processor —
	*  `processEventBatch`, `catchUpFromLog`, `revive` — is the platform's, never a caller's. */
	static publicMethods = [
		...super.publicMethods,
		"snapshot",
		"liveSnapshot",
		"waitUntilProcessed"
	];
	/** After a runtime field on the processor moved OUTSIDE a batch (an RPC method on this object);
	*  inside `processEvent` the engine re-projects on its own. */
	publishLiveState() {
		this.#engine.publishLiveState();
	}
	/** THE push: the context hands over each committed batch with its scanned-range proof. */
	processEventBatch(events, range) {
		return this.#engine.processEventBatch(events, range);
	}
	/** Catch up from the log (the delivery loop's, when a row is configured or resumed). */
	catchUpFromLog() {
		return this.#engine.catchUpFromLog();
	}
	/** THE REVIVE: the context's alarm pass calls it for a due claim — catch up, then run the
	*  at-head pass, so an attempt the last incarnation was running is started again from state. */
	revive() {
		return this.#engine.revive();
	}
	/** Caught up through the log, then `{ offset, state }`. */
	snapshot() {
		return this.#engine.snapshot();
	}
	/** The live-state seed read: `{ rev, state: projectLiveState(reduced) }`. */
	liveSnapshot() {
		return this.#engine.liveSnapshot();
	}
	/** The barrier: resolves once processed at least through `offset` (default timeout 10s). */
	waitUntilProcessed(input) {
		return this.#engine.waitUntilProcessed(input);
	}
	#engineBuiltOnFirstUse;
	get #engine() {
		return this.#engineBuiltOnFirstUse ??= new ProcessorEngine(this.processor, {
			stream: {
				append: async (...events) => {
					try {
						var _usingCtx$1 = _usingCtx();
						return await _usingCtx$1.u(this.getItx()).append(...events);
					} catch (_) {
						_usingCtx$1.e = _;
					} finally {
						_usingCtx$1.d();
					}
				},
				read: async (after, limit) => {
					try {
						var _usingCtx3 = _usingCtx();
						return await _usingCtx3.u(this.getItx()).readEvents(after, limit);
					} catch (_) {
						_usingCtx3.e = _;
					} finally {
						_usingCtx3.d();
					}
				},
				claim: async (at) => {
					try {
						var _usingCtx4 = _usingCtx();
						return await _usingCtx4.u(this.getItx()).processors.claim(this.ctx.props.name, at);
					} catch (_) {
						_usingCtx4.e = _;
					} finally {
						_usingCtx4.d();
					}
				}
			},
			storage: new ReduceCheckpointTable(this.ctx.storage.sql),
			fedByPushes: this.ctx.props.fedByPushes === true,
			kv: this.ctx.storage.kv,
			codeId: this.ctx.props.codeId
		});
	}
};
/** Stateless config entrypoint, the default export of a project's config repo; its init handles
*  `events.iterate.com/project/worker-updated` (core/configs/default/worker.ts). */
var IterateConfigEntrypoint = class extends WorkerEntrypoint {
	/** At fetch entry: `const denied = this.auth.require(request); if (denied) return denied;`
	*  `x-itx-principal` is on a request only when a project member (or the operator) sent it, safe
	*  to act on. A private route written by hand answers the platform's sign-in challenge, which
	*  the edge turns into the sign-in for a page load (`auth.require` does the same):
	*
	*  ```js
	*  if (!request.headers.get("x-itx-principal"))
	*    return new Response("Sign in\n", { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="iterate"' } });
	*  ``` */
	auth = auth;
	constructor(ctx, env) {
		super(ctx, env);
		const serve = this.fetch;
		this.fetch = (request) => runCausedBy(causeOfRequest(request), () => serve.call(this, request));
	}
	/** The platform's delivery of one event (the dispatch boundary refuses any other caller),
	*  through `callWithCause`: `processEvent` under ONE scope, released when it settles. */
	async deliverEvent(event) {
		try {
			var _usingCtx5 = _usingCtx();
			const itx = _usingCtx5.u(this.getItx());
			await this.processEvent({
				event,
				itx
			});
		} catch (_) {
			_usingCtx5.e = _;
		} finally {
			_usingCtx5.d();
		}
	}
	/** THE CALL UNDER A CAUSE (`walkUnderCause`) every method but `fetch` is called through. On no
	*  list: only the platform calls it (core/os context/built-ins.ts `workers`). */
	callWithCause(cause, steps) {
		return walkUnderCause(this, cause, steps);
	}
	/** `using itx = this.getItx()`: the project root's scope, released with every call made through
	*  it when the block ends (`FacetDurableObject.getItx` says why nothing is kept past it). A field,
	*  not a method: Workers RPC reaches an entrypoint's methods, and a caller must never get the
	*  scope (sdk/index.test.ts). */
	getItx = () => itxScope(this.env.ITX);
	/** THE AUTHOR HOOK: every durable event of every context of the project from its first
	*  publication on (what was committed while no config was published may be passed over), one per
	*  call, unordered and at least once; a throw fails that event alone, which the platform retries.
	*  `itx` is the project's root, `itx.cd(event.path)` the event's own context. Make each reaction
	*  idempotent (an append keyed by `event.path` and `event.offset`) and keep no state here.
	*  Default: ignore it. */
	processEvent(_args) {}
	/** THE WEB ROOT — every Request on a host of the project that no fetch route takes (the platform
	*  serves those first: `itx.fetchRoutes`). The host's routing slug is in `x-iterate-routing-slug`
	*  (`notes` for `notes--<project>.<hostname>`; absent on the apex), written only by the platform:
	*  route on it in plain code, answering here (reaching the project through `this.getItx()`) or
	*  forwarding the Request. Default: not found. */
	fetch(_request) {
		return new Response("Not found\n", { status: 404 });
	}
};
//#endregion
export { newWebSocketRpcSession$1 as a, newHttpBatchRpcSession$1 as i, IterateConfigEntrypoint as n, newWorkersRpcResponse as o, StreamProcessorDurableObject as r, FacetDurableObject as t };

//# sourceMappingURL=sdk-Bc130E2p.mjs.map