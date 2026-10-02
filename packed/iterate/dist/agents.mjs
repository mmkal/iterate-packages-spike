import { codedError, errorCode, resolveContextPath } from "./lib.mjs";
import { o as StreamProcessor } from "./processor-BBMTE8Jy.mjs";
import { defineProcessorContract } from "./stream/contract.mjs";
import { r as StreamProcessorDurableObject } from "./sdk-Bc130E2p.mjs";
import { t as _usingCtx } from "./usingCtx-5QB_oFRV.mjs";
import { AgentContract } from "./agents/contract.mjs";
import { agentsFacetSpec } from "./agents/install.mjs";
import { t as AgentProcessor } from "./processor-CHj0Ui4P.mjs";
import { RpcTarget } from "cloudflare:workers";
import { z } from "zod";
//#region src/agents/collection.ts
/** How long `create` and `delete` wait for the agent's certificate in all. */
const CERTIFICATE_WAIT_MS = 3e4;
/** How long ONE call on the agent's context waits before it is asked again on a fresh call, so an
*  instance Cloudflare replaces under the wait costs one slice (core/os project/collection.ts
*  `TERMINAL_WAIT_SLICE_MS` says why). */
const CERTIFICATE_WAIT_SLICE_MS = 5e3;
/** `itx.agents` (api.ts `AgentsApi`) over one base: the root's at `/`, an agent's own at its
*  path (`at(base)`, catalog.ts). */
var AgentCollectionRpcTarget = class extends RpcTarget {
	getItx;
	catalog;
	base;
	constructor(getItx, catalog, base = "/") {
		super();
		this.getItx = getItx;
		this.catalog = catalog;
		this.base = base;
	}
	get(path) {
		path = resolveContextPath(this.base, path);
		if (path === "/") throw new Error("An agent needs its own context path");
		return new AgentReference(this.getItx, path, this.catalog, this.base);
	}
	/** Every agent born under the project, by path — the certificates cross-posted to `/`, folded. */
	async list() {
		return Object.entries((await this.catalog()).agents).map(([path, row]) => ({
			path,
			...row
		}));
	}
	/** Bring the agent at `path` into being: the `agent` processor row on that path, then
	*  `agent/create-requested`, then the terminal fact — `agent/created` (in the catalog by then), or
	*  `agent/create-failed`, thrown; a later call is a new attempt. Idempotent: a created agent answers
	*  at once, and a creation already open is WAITED ON, never requested again — the terminal is
	*  sought after the request that opened it, so a certificate landing between the read and the
	*  wait is seen, not missed. A deleted agent is not re-creatable: thrown. Data back, never the
	*  handle: `itx.agents.get(path)` addresses it. */
	async create(path) {
		try {
			var _usingCtx$2 = _usingCtx();
			const itx = _usingCtx$2.u(this.getItx());
			path = resolveContextPath(this.base, path);
			if (path === "/") throw new Error("An agent needs its own context path");
			const creator = resolveContextPath("/", this.base);
			if (creator.startsWith(`${path}/`)) throw codedError("FORBIDDEN", "An agent cannot create its own ancestor");
			const dead = /* @__PURE__ */ new Error(`agent ${path}: deleted — not re-creatable`);
			if ((await this.catalog()).deleted[path]) throw dead;
			const context = itx.cd(path);
			const spec = agentsFacetSpec("AgentDurableObject");
			const snapshot = async (facet) => await context.invoke([
				"itx",
				"facets",
				facet,
				["snapshot"]
			]);
			let state;
			try {
				({state} = await snapshot(["get", "agent"]));
			} catch (error) {
				if (errorCode(error) !== "NO_FACET") throw error;
				if ((await this.catalog()).deleted[path]) throw dead;
				({state} = await snapshot([
					"get",
					"agent",
					spec
				]));
			}
			if (state.deletion) throw dead;
			await context.processors.enable("agent", spec);
			if (state.creation?.status === "created") return { path };
			let requestedAtOffset;
			if (state.creation?.status === "requested") requestedAtOffset = state.creation.offset;
			else {
				const rule = (match, target, key) => ({
					type: "events.iterate.com/itx/rewrite-rule-configured",
					idempotencyKey: key,
					payload: {
						match,
						target
					}
				});
				await context.append(rule("itx", `itx.cd(${JSON.stringify(creator)})`, `agent-parent:${path}`), rule("itx.agents", `itx.cd('/').agents.at(${JSON.stringify(path)})`, `agent-collection:${path}`));
				const [requested] = await context.append({
					type: "events.iterate.com/agent/create-requested",
					payload: {}
				});
				requestedAtOffset = requested.offset;
			}
			const settled = await agentCertificate(context, path, ["events.iterate.com/agent/created", "events.iterate.com/agent/create-failed"], requestedAtOffset);
			if (settled.type === "events.iterate.com/agent/create-failed") throw new Error(`agent ${path}: creation failed — ${String(settled.payload?.error)}`);
			return { path };
		} catch (_) {
			_usingCtx$2.e = _;
		} finally {
			_usingCtx$2.d();
		}
	}
	/** Take the agent at `path` out of being: `agent/delete-requested` on that path, then the death
	*  certificate — `agent/deleted` (gone from the catalog by then; the loop runs no more turns) —
	*  then the `agent` processor row goes, and the facet with it, storage included. Idempotent: a
	*  deleted agent answers at once, and a deletion already open is WAITED ON, never requested again
	*  — the certificate is sought after the request that opened it, so one landing between the read
	*  and the wait is seen, not missed. An agent never created has nothing to delete: thrown.
	*  Terminal: a deleted agent is not re-creatable. */
	async delete(path) {
		try {
			var _usingCtx3 = _usingCtx();
			const itx = _usingCtx3.u(this.getItx());
			path = resolveContextPath(this.base, path);
			if (path === "/") throw new Error("An agent needs its own context path");
			const context = itx.cd(path);
			const catalog = await this.catalog();
			if (!catalog.deleted[path] && !catalog.agents[path]) throw new Error(`agent ${path}: not created — nothing to delete`);
			const rows = async () => await context.processors.list();
			if (catalog.deleted[path] && !(await rows()).some((row) => row.name === "agent")) return { path };
			let state;
			try {
				({state} = await context.invoke([
					"itx",
					"facets",
					["get", "agent"],
					["snapshot"]
				]));
			} catch (error) {
				if (errorCode(error) !== "NO_FACET") throw error;
				if (catalog.deleted[path] || (await this.catalog()).deleted[path]) return { path };
				throw new Error(`agent ${path}: its context has no \`agent\` processor — itx.agents.create(${JSON.stringify(path)}) binds it again`);
			}
			if (state.deletion?.status !== "deleted") {
				if (state.creation?.status !== "created") throw new Error(`agent ${path}: not created — nothing to delete`);
				let requestedAtOffset;
				if (state.deletion?.status === "requested") requestedAtOffset = state.deletion.offset;
				else {
					const [requested] = await context.append({
						type: "events.iterate.com/agent/delete-requested",
						payload: {}
					});
					requestedAtOffset = requested.offset;
				}
				await agentCertificate(context, path, ["events.iterate.com/agent/deleted"], requestedAtOffset);
			}
			if ((await rows()).some((row) => row.name === "agent")) await context.processors.disable("agent");
			return { path };
		} catch (_) {
			_usingCtx3.e = _;
		} finally {
			_usingCtx3.d();
		}
	}
};
/** The first of `types` on the agent's log after `afterOffset`, waited for CERTIFICATE_WAIT_MS in
*  slices of CERTIFICATE_WAIT_SLICE_MS, each a fresh call: core/os project/collection.ts
*  `#terminalFact`'s wait, whose doc says why the wake record rides along. */
async function agentCertificate(context, path, types, afterOffset) {
	const started = Date.now();
	let after = afterOffset;
	let slicesTimedOut = 0;
	for (;;) {
		const remainingMs = started + CERTIFICATE_WAIT_MS - Date.now();
		if (remainingMs <= 0) throw codedError("WAIT_TIMEOUT", `agent ${path}: no ${types.join(" or ")} after offset ${afterOffset} within ${CERTIFICATE_WAIT_MS}ms`);
		let event;
		try {
			event = await context.waitForEvent({
				type: [...types, "events.iterate.com/itx/woken"],
				afterOffset: after,
				timeoutMs: Math.min(CERTIFICATE_WAIT_SLICE_MS, remainingMs)
			});
		} catch (error) {
			if (errorCode(error) !== "WAIT_TIMEOUT") throw error;
			slicesTimedOut += 1;
			continue;
		}
		if (event.type !== "events.iterate.com/itx/woken") return event;
		if (slicesTimedOut > 0) console.warn({
			event: "agent-collection.platform-failure-wait-moved",
			message: "the agent's context was reborn under a wait that never saw it: waited again on the active instance",
			path,
			types: types.join(","),
			waitedMs: Date.now() - started,
			slicesTimedOut
		});
		after = event.offset;
	}
}
/** `itx.agents.get(path)` (api.ts `AgentHandleApi`): the agent at one path, reached from the
*  collection's base. */
var AgentReference = class extends RpcTarget {
	getItx;
	path;
	catalog;
	base;
	constructor(getItx, path, catalog, base) {
		super();
		this.getItx = getItx;
		this.path = path;
		this.catalog = catalog;
		this.base = base;
	}
	/** A person's words: a dead agent refuses from the catalog (the header: its facet is never hosted
	*  again); a live one's words go to the facet its context's `agent` row hosts, by NAME — never by
	*  spec, so no facet is hosted for an agent that has none. NO_FACET is then a context without an
	*  `agent` row: never born, dead since, or a live agent without its row, which only `create` binds
	*  again — each refused. The facet appends them, so they are stamped with the agent's own path;
	*  the sender rides beside them as the base, which the sender's own `itx.agents` row pins
	*  (`itx.cd('/').agents.at(<sender>)`, written by `create`) — `/` for every context that reaches
	*  the root's collection, which the fold reads as a person (processor.ts). */
	async message(input) {
		const path = this.path;
		const dead = /* @__PURE__ */ new Error(`agent ${path}: deleted`);
		if ((await this.catalog()).deleted[path]) throw dead;
		try {
			try {
				var _usingCtx4 = _usingCtx();
				return await _usingCtx4.u(this.getItx()).cd(path).invoke([
					"itx",
					"facets",
					["get", "agent"],
					[
						"message",
						input,
						this.base
					]
				]);
			} catch (_) {
				_usingCtx4.e = _;
			} finally {
				_usingCtx4.d();
			}
		} catch (error) {
			if (errorCode(error) !== "NO_FACET") throw error;
		}
		const catalog = await this.catalog();
		if (catalog.deleted[path]) throw dead;
		if (!catalog.agents[path]) throw new Error(`agent ${path}: not created — itx.agents.create(${JSON.stringify(path)}) first`);
		throw new Error(`agent ${path}: its context has no \`agent\` processor — itx.agents.create(${JSON.stringify(path)}) binds it again`);
	}
};
//#endregion
//#region src/agents/catalog.ts
const AgentCatalogContract = defineProcessorContract({
	slug: "agents",
	version: "3",
	description: "The agents installed in this project by the userspace agents app.",
	stateSchema: z.object({
		agents: z.record(z.string(), z.object({ createdAt: z.string() })).default({}),
		/** Every agent that died, by path: its death certificate. Terminal — a deleted agent is not
		*  re-creatable — so a verb on one answers from this row and never hosts the agent's facet on
		*  its context again (collection.ts says why that matters). */
		deleted: z.record(z.string(), z.object({ deletedAt: z.string() })).default({})
	}),
	events: {},
	processorDeps: [AgentContract],
	consumes: ["events.iterate.com/agent/created", "events.iterate.com/agent/deleted"],
	emits: []
});
var AgentCatalogProcessor = class extends StreamProcessor {
	contract = AgentCatalogContract;
	/** A certificate counts only from the agent it names: each agent writes its own on `/`
	*  (processor.ts), and the platform stamps where it came from (core/os caller.ts `stampCaller`),
	*  so one any other context appends is ignored — anyone may append anywhere, and a forged death
	*  would refuse the agent's every message for good. */
	reduce({ state, event }) {
		const path = event.payload.path;
		if (event.source.origin !== path) return;
		if (event.type === "events.iterate.com/agent/created") {
			if (state.agents[path] || state.deleted[path]) return;
			return {
				...state,
				agents: {
					...state.agents,
					[path]: { createdAt: event.createdAt }
				}
			};
		}
		if (state.deleted[path]) return;
		const { [path]: _deleted, ...agents } = state.agents;
		return {
			...state,
			agents,
			deleted: {
				...state.deleted,
				[path]: { deletedAt: event.createdAt }
			}
		};
	}
};
/** The agents app's collection facet — what the `itx.agents` rule names (install.ts): the
*  published `AgentsApi` (api.ts) at the project's root, plus `at(base)`, the collection an agent's
*  own `itx.agents` rule reaches. */
var AgentCollectionDurableObject = class extends StreamProcessorDurableObject {
	/** The processor's reads, and `itx.agents`: the collection's verbs and `at(base)` (collection.ts). */
	static publicMethods = [
		...super.publicMethods,
		"list",
		"get",
		"create",
		"delete",
		"at"
	];
	processor = new AgentCatalogProcessor();
	at(base) {
		return new AgentCollectionRpcTarget(() => this.getItx(), async () => {
			await this.catchUpFromLog();
			return (await this.snapshot()).state;
		}, base);
	}
	#collection = this.at("/");
	list() {
		return this.#collection.list();
	}
	get(path) {
		return this.#collection.get(path);
	}
	create(path) {
		return this.#collection.create(path);
	}
	delete(path) {
		return this.#collection.delete(path);
	}
};
//#endregion
//#region src/agents/durable-object.ts
var AgentDurableObject = class extends StreamProcessorDurableObject {
	/** The processor's reads, and a person's words (`message`) — `itx.agents.get(path).message(…)`
	*  reaches it through the collection (collection.ts). */
	static publicMethods = [...super.publicMethods, "message"];
	processor = new AgentProcessor({ getItx: () => this.getItx() });
	/** The context this facet is hosted on IS the agent: its path is the one name it goes by, here
	*  and under `itx.files` (attachments are stored beneath it). Read once per incarnation. */
	#pathRead;
	async #path() {
		try {
			var _usingCtx$1 = _usingCtx();
			if (this.#pathRead) return this.#pathRead;
			const { path } = await _usingCtx$1.u(this.getItx()).whoami();
			return this.#pathRead = path;
		} catch (_) {
			_usingCtx$1.e = _;
		} finally {
			_usingCtx$1.d();
		}
	}
	/** A person's words: ONE `context-added`, the trigger of the next turn — with their attachments,
	*  each stored first under this agent's path (`itx.files`, `<path>/<8 of a uuid>-<name>`)
	*  and named on the event; an image among them is what the model will see. `from` is the
	*  collection's base, which it relays as the sender (collection.ts `AgentReference.message`). The
	*  event is answered so a caller can wait for what follows it. */
	async message(input, from) {
		try {
			var _usingCtx3 = _usingCtx();
			const path = await this.#created();
			const { message, files = [] } = typeof input === "string" ? { message: input } : input;
			const attachments = [];
			for (const file of files) try {
				var _usingCtx4 = _usingCtx();
				const filename = file.filename.replace(/[^A-Za-z0-9._-]+/g, "-");
				const storedAt = `${path}/${crypto.randomUUID().slice(0, 8)}-${filename}`;
				const stored = await _usingCtx4.u(this.getItx()).files.get(storedAt).put({
					contentType: file.contentType,
					data: file.data
				});
				attachments.push({
					contentType: stored.contentType,
					filename: file.filename,
					path: stored.path,
					size: stored.size
				});
			} catch (_) {
				_usingCtx4.e = _;
			} finally {
				_usingCtx4.d();
			}
			return (await _usingCtx3.u(this.getItx()).append({
				type: "events.iterate.com/agent/context-added",
				payload: {
					role: "user",
					content: message,
					actor: { type: "user" },
					...attachments.length > 0 && { files: attachments },
					from
				}
			}))[0];
		} catch (_) {
			_usingCtx3.e = _;
		} finally {
			_usingCtx3.d();
		}
	}
	/** Every verb starts here: an agent whose certificate has not landed refuses, and so does one
	*  whose deletion has been asked for. Deletion can land at any moment, so the state is read on
	*  every call (in memory once the facet is caught up). */
	async #created() {
		const path = await this.#path();
		const { state } = await this.snapshot();
		if (state.deletion) throw new Error(`agent ${path}: deleted`);
		if (state.creation?.status !== "created") throw new Error(`agent ${path}: not created — itx.agents.create(${JSON.stringify(path)}) first`);
		return path;
	}
};
//#endregion
export { AgentCollectionDurableObject, AgentDurableObject };

//# sourceMappingURL=agents.mjs.map