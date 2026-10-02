import { bytesToBase64, errorCode } from "./lib.mjs";
import { o as StreamProcessor } from "./processor-BBMTE8Jy.mjs";
import { t as _usingCtx } from "./usingCtx-5QB_oFRV.mjs";
import { AgentContract } from "./agents/contract.mjs";
import { parseCodemodeResponse } from "./agents/codemode-format.mjs";
import { z } from "zod";
//#region src/agents/system-prompt.ts
/** What the model is told at birth: the system item the creation saga lands beside the certificate
*  (processor.ts; an operator's instructions are their own `agent/context-added` after). The
*  capability surface is not here: processor.ts renders the agent's `rewriteRules.list()` every
*  turn. What stays is the website work's rules of the road, which no row's one line can carry. */
const DEFAULT_AGENT_SYSTEM_PROMPT = [
	"You are an agent on the iterate platform. This internal agent loop runs your scripts in the agent's own context. The CAPABILITY TREE message describes its current grants; use only those capabilities. The conversation and actions are recorded as events.",
	"HOW YOU ACT: respond with markdown, and embed AT MOST ONE `<codemode>` block when you want to run code:",
	"",
	"Good question! Let me look into it.",
	"",
	"<codemode status=\"Checking the files\">",
	"const files = await itx.repos.get(\"/repos/config\").listFiles()",
	"return { count: files.paths.length }",
	"</codemode>",
	"",
	"- Markdown OUTSIDE the tag is delivered to the person as your message — that is how you talk. Text inside the tag is JavaScript statements (top-level `await` and `return` allowed; no TypeScript annotations); the opening `<codemode ...>` and closing `</codemode>` must each sit alone on their own line.",
	"- The `status` attribute is a short present-tense label (\"Checking the files\", \"Writing the report\") shown while your code runs. Set it whenever you include a tag; update it each turn as the phase changes.",
	"- Whatever your code RETURNS (JSON-serializable) arrives as your next input, and you get another turn to act on it. A thrown error arrives the same way — read it and adapt. Do NOT wrap calls in try/catch just to survive: a raw error is more useful to you than a hand-built `{ error }` object.",
	"- Multi-step work is one tag per response: each result comes back to you, and you write the next step having seen it. A response with more than one `<codemode>` tag — or an unclosed one — is rejected with feedback and NOTHING runs; never queue future steps as extra tags.",
	"- To finish: write your final message with NO tag — prose alone ends your turn. Inside a tag, `return;` with no value (or falling off the end) also ends the loop; `return null` counts as a value and buys a pointless extra turn.",
	"- Treat each script as independent. Carry state between calls by returning it or writing it; do not rely on worker globals persisting. There is no typechecker and no type definitions: when unsure of a shape, return a small sample first and look at it.",
	"- Scripts have a live clock: use new Date() or Date.now() for the current time, and Intl.DateTimeFormat with the requested IANA timeZone for local time. Read the clock instead of guessing or claiming that live time is unavailable.",
	"- Images a person attaches are shown to you directly. Any other attachment is named in the message with its path — read it with `await itx.files.get(path).bytes()`.",
	"",
	"WORKING ON THE PROJECT'S WEBSITE (the surface itself is the CAPABILITY TREE message):",
	"Start website work with `await itx.whoami()` and use its `projectUrl`; never guess a hostname from the opaque projectId. Ingress means this project's website, not the Ingress game.",
	"WEBSITE INGRESS: every host of the project — the apex `<project-slug>.<ingress-base>` and `<routing-slug>--<project-slug>.<ingress-base>` — reaches the config worker's `fetch`, which routes on the `x-iterate-routing-slug` request header (absent on the apex) in plain code: `const routingSlug = request.headers.get(\"x-iterate-routing-slug\"); if (routingSlug === null) return homepage; if (routingSlug === \"blog\") return blog(request); return new Response(\"Not found\", { status: 404 });`. A project with no config worker yet returns 404.",
	"A COMMIT TO /repos/config IS THE PUBLICATION: the platform publishes each commit of main a few seconds after it lands, and the website and every context then run it. Every commit gets one outcome on the project's root: `await itx.cd(\"/\").waitForEvent({ type: [\"events.iterate.com/project/worker-updated\", \"events.iterate.com/project/worker-update-failed\"], payload: { commitOid }, afterOffset: 0, timeoutMs: 60000 })` answers it, and a `worker-update-failed` outcome's `payload.error` says why the commit is not live. For config-repo website updates, let the project processor configure ingress from the commit; no manual `itx/ingress-configured` event is needed. `commitFiles` and `writeFile` write to main.",
	"The whole repo is the worker; package.json names its main module in `\"main\"` (worker.ts). Files may be TypeScript (types are stripped, never checked) or JavaScript, and import each other by relative path (`import { page } from \"./site/page.ts\"`; the extension is optional). Import packages by name: `iterate/*` and `zod` come from the platform; list any other package in package.json `dependencies` and it is fetched from npm through esm.sh (a package that needs Node.js builtins is refused). Other file types (.md, .css, .json) are not modules — a worker that serves one exports its text from a module. The default export of the main module is a class that extends `IterateConfigEntrypoint` from `iterate/sdk`; a plain object or a plain `WorkerEntrypoint` is refused at publication. For a simple site use `import { IterateConfigEntrypoint } from \"iterate/sdk\"; export default class extends IterateConfigEntrypoint { fetch(request) { return new Response(\"Hello\"); } }`. A published commit whose fetch fails takes the site down until the next one, so PROBE THE CANDIDATE BEFORE COMMITTING: `await itx.workers.get({ source: { ...(await itx.repos.get(\"/repos/config\").modules()), \"worker.ts\": candidateSource } }).fetch(new Request(projectUrl))` runs the source as a worker without committing anything (the repo's files under their repo paths, your edits over them); commit only when its status and body are what you want.",
	"List files and read existing source before editing; repo paths are repo-relative.",
	"EDITING A FILE: `commitFiles` takes each changed file's whole new content (`{ path, content }`, or `{ path, delete: true }`); there is no patch operation. Edit inside your code instead: read the file at the tip, change its text with any JavaScript (`replace`, a regular expression, split and join), and commit, passing that tip as `parent` so the commit is refused if main moved meanwhile. The file never has to pass through your messages:",
	"",
	"<codemode status=\"Changing the homepage greeting\">",
	"const repo = itx.repos.get(\"/repos/config\")",
	"const tip = await repo.tip()",
	"const source = await repo.readFile(\"worker.ts\", { commitOid: tip })",
	"const next = source.replace(/Homepage of project /, \"Welcome to \")",
	"if (next === source) throw new Error(\"the homepage text is not in worker.ts\")",
	"const { commitOid } = await repo.commitFiles({ message: \"Change the homepage greeting\", parent: tip, changes: [{ path: \"worker.ts\", content: next }] })",
	"const outcome = await itx.cd(\"/\").waitForEvent({ type: [\"events.iterate.com/project/worker-updated\", \"events.iterate.com/project/worker-update-failed\"], payload: { commitOid }, afterOffset: 0, timeoutMs: 60000 })",
	"if (outcome.payload.error) throw new Error(outcome.payload.error)",
	"return commitOid",
	"</codemode>",
	"",
	"Once the commit's outcome is `worker-updated`, fetch the actual projectUrl with itx.fetch(new Request(projectUrl)) and inspect its HTTP status and response body. Report success only after the returned page contains the requested change. A commit receipt is not publication proof; a `worker-update-failed` outcome's error says why the commit is not live: fix that and commit again. A new verification request requires a new fetch, regardless of conversation history."
].join("\n");
//#endregion
//#region src/agents/processor.ts
/** THE AI GATEWAY the agent's model calls go through — `default`, the gateway Cloudflare creates on
*  an account's first authenticated request; unified billing pays the provider, no key anywhere. A
*  property of the code, not of a deployment. */
const AI_GATEWAY_ID = "default";
/** The failure backoff, folded into the debounce window: doubling from the policy's base per
*  consecutive failure, capped at its ceiling; nothing after a success. */
function retryBackoffMs(state) {
	const { backoffBaseMs, backoffMaxMs } = state.config.llmRequestRetryPolicy;
	if (state.consecutiveLlmFailures <= 0) return 0;
	return Math.min(2 ** (state.consecutiveLlmFailures - 1) * backoffBaseMs, backoffMaxMs);
}
/** The conversation as the model reads it. An item another context appended opens with
*  `[from <context>]`. An item's images become image parts (a data: URL of the bytes in `images`,
*  keyed by path — a vision model sees the pixels); any other attachment, or an image whose bytes
*  are gone, is a line naming it and how a script reads it (a hint line). The developer's notes
*  read as system instructions. */
function buildChatMessages(items, images, tree = []) {
	const messages = items.map((item) => {
		const role = item.role === "developer" ? "system" : item.role;
		const content = item.from ? `[from ${item.from}] ${item.content}` : item.content;
		if (!item.files?.length) return {
			role,
			content
		};
		const parts = [];
		const hints = [];
		for (const file of item.files) {
			const image = images.get(file.path);
			if (image) parts.push({
				type: "image_url",
				image_url: { url: `data:${image.contentType};base64,${image.base64}` }
			});
			else hints.push(fileHintLine(file));
		}
		const text = [content, ...hints].filter(Boolean).join("\n");
		if (parts.length === 0) return {
			role,
			content: text
		};
		return {
			role,
			content: [{
				type: "text",
				text
			}, ...parts]
		};
	});
	const rendered = renderCapabilityTree(tree);
	if (rendered) {
		const firstNonSystem = messages.findIndex((message) => message.role !== "system");
		messages.splice(firstNonSystem === -1 ? messages.length : firstNonSystem, 0, {
			role: "system",
			content: rendered
		});
	}
	return messages;
}
/** The agent's table as the model reads it: one line per name it can spell (`match — description`,
*  a row without a description shows its target), grouped by the context each row came from when
*  more than one; masks and the bare `itx` row are not names. Null when nothing is spellable (a jail
*  with no grants yet): then no tree message at all. */
function renderCapabilityTree(rows) {
	const visible = rows.filter((row) => row.target && row.match !== "itx");
	if (visible.length === 0) return null;
	return ["`itx` IS THIS CONTEXT'S CAPABILITY TREE (`await itx.rewriteRules.list()`) — every name below is one you can spell inside a tag; nothing else resolves:", ...[...new Set(visible.map((row) => row.context))].flatMap((context) => [`from ${context}:`, ...visible.filter((row) => row.context === context).map((row) => `${row.match} — ${row.description || `⇒ ${row.target}`}`)])].join("\n");
}
/** How a non-image (or gone) attachment is named to the model. */
function fileHintLine(file) {
	return `[Attached file: ${file.filename} (${file.contentType}, ${String(file.size)} bytes) — read it with \`await itx.files.get(${JSON.stringify(file.path)}).bytes()\`]`;
}
/** The coalescing window: how much streamed text rides one `llm-response-frame` append — ~7
*  repaints a second, and one commit per window instead of per token. */
const FRAME_WINDOW_MS = 150;
/** A window whose text grew past this lands early rather than as one oversized append. */
const FRAME_WINDOW_MAX_CHARS = 64e3;
/** The idle watchdog: a stream that carries nothing for this long fails the attempt, so a stalled
*  provider never wedges a turn until its expiry. */
const STREAM_IDLE_BUDGET_MS = 45e3;
/** The context windows of the models this loop names; a conservative floor for the rest. OpenAI's
*  figures are the operating window (where pricing doubles), not the documented one. */
function contextWindowTokens(model) {
	if (/^gpt-(6|5)/.test(model)) return 272e3;
	if (model.startsWith("@cf/meta/llama-4-scout")) return 131072;
	return 128e3;
}
/** The abort reason an interruption carries, so the runner tells it from a clock. */
var InterruptedError = class extends Error {
	constructor() {
		super("interrupted by the person's next words");
		this.name = "InterruptedError";
	}
};
/** An append that may LOSE to an earlier one under the same idempotency key with a different
*  body — the settle of a request an interruption already settled — and then appends nothing:
*  the first settlement stands, the later one was never a fact. */
async function appendUnlessLost(append, ...events) {
	try {
		await append(...events);
	} catch (error) {
		if (errorCode(error) !== "IDEMPOTENCY_CONFLICT") throw error;
	}
}
/** What Workers AI answers when it does not stream: `{ response }`, or the chat-completions shape. */
const ChatAnswer = z.union([z.object({ response: z.string() }), z.object({ choices: z.array(z.object({ message: z.object({ content: z.string() }) })).min(1) })]);
/** The usage a provider reports, both dialects: OpenAI Responses
*  (`input_tokens`/`output_tokens`) and chat completions (`prompt_tokens`/`completion_tokens`),
*  with the cached/reasoning breakdowns when present. Loose: vendors keep adding fields. */
const ProviderUsage = z.looseObject({
	prompt_tokens: z.number().int().nonnegative().optional(),
	completion_tokens: z.number().int().nonnegative().optional(),
	input_tokens: z.number().int().nonnegative().optional(),
	output_tokens: z.number().int().nonnegative().optional(),
	prompt_tokens_details: z.looseObject({ cached_tokens: z.number().int().nonnegative().optional() }).optional(),
	completion_tokens_details: z.looseObject({ reasoning_tokens: z.number().int().nonnegative().optional() }).optional(),
	input_tokens_details: z.looseObject({ cached_tokens: z.number().int().nonnegative().optional() }).optional(),
	output_tokens_details: z.looseObject({ reasoning_tokens: z.number().int().nonnegative().optional() }).optional()
});
function normalizeUsage(raw) {
	const parsed = ProviderUsage.safeParse(raw);
	if (!parsed.success) return void 0;
	const inputTokens = parsed.data.prompt_tokens ?? parsed.data.input_tokens;
	const outputTokens = parsed.data.completion_tokens ?? parsed.data.output_tokens;
	if (inputTokens === void 0 || outputTokens === void 0) return void 0;
	return {
		inputTokens,
		outputTokens,
		cachedInputTokens: parsed.data.prompt_tokens_details?.cached_tokens ?? parsed.data.input_tokens_details?.cached_tokens,
		reasoningOutputTokens: parsed.data.completion_tokens_details?.reasoning_tokens ?? parsed.data.output_tokens_details?.reasoning_tokens
	};
}
/** One OpenAI Responses API stream event — the loop reads the few types it knows and skips the
*  rest. */
const ResponsesEvent = z.looseObject({ type: z.string() });
/** Read an SSE body frame by frame, handing each `data:` JSON to `onEvent`; the reader is cancelled
*  when `signal` aborts, so nothing lands after the caller has settled. */
async function drainSse(body, signal, onEvent) {
	const reader = body.getReader();
	let completed = false;
	const cancel = () => void reader.cancel().catch(() => void 0);
	if (signal.aborted) cancel();
	signal.addEventListener("abort", cancel, { once: true });
	const decoder = new TextDecoder();
	let buffered = "";
	const frame = (text) => {
		const data = text.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
		if (data === "" || data === "[DONE]") return;
		let event;
		try {
			event = JSON.parse(data);
		} catch {
			event = data;
		}
		onEvent(event);
	};
	try {
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			buffered += decoder.decode(value, { stream: true });
			const frames = buffered.split(/\r?\n\r?\n/);
			buffered = frames.pop() || "";
			frames.forEach(frame);
		}
		buffered += decoder.decode();
		if (buffered.trim()) frame(buffered);
		completed = true;
	} finally {
		signal.removeEventListener("abort", cancel);
		if (!completed) reader.cancel().catch(() => void 0);
		reader.releaseLock();
	}
	if (signal.aborted) throw signal.reason instanceof Error ? signal.reason : /* @__PURE__ */ new Error("aborted");
}
/** Race an un-abortable dial against the caller's signal: the caller regains control the moment it
*  aborts (an interruption, the expiry, the idle watchdog). A Response or stream the orphaned dial
*  answers after that is cancelled, so the provider stops and no unread body holds the edge's
*  invocation open; a stream already open is cancelled by `drainSse` itself. */
function raceAbort(signal, work) {
	const cancelLateBody = () => void work.then((late) => {
		const body = late instanceof Response ? late.body : late;
		if (body instanceof ReadableStream) body.cancel(signal.reason).catch(() => void 0);
	}, () => void 0);
	if (signal.aborted) {
		cancelLateBody();
		return Promise.reject(signal.reason || /* @__PURE__ */ new Error("aborted"));
	}
	return new Promise((resolve, reject) => {
		const onAbort = () => {
			reject(signal.reason || /* @__PURE__ */ new Error("aborted"));
			cancelLateBody();
		};
		signal.addEventListener("abort", onAbort, { once: true });
		work.then((value) => {
			signal.removeEventListener("abort", onAbort);
			resolve(value);
		}, (error) => {
			signal.removeEventListener("abort", onAbort);
			reject(error);
		});
	});
}
/** The conversation as the Responses API takes it: `input` items with text and image parts. */
function responsesInput(messages) {
	return messages.map((message) => typeof message.content === "string" ? {
		role: message.role,
		content: message.content
	} : {
		role: message.role,
		content: message.content.map((part) => part.type === "text" ? {
			type: "input_text",
			text: part.text
		} : {
			type: "input_image",
			image_url: part.image_url.url,
			detail: "auto"
		})
	});
}
/** A settlement as the model reads it next — or null when the script returned nothing: the turn ends. */
function renderScriptSettlement(settlement) {
	if (settlement.status === "failed") return `Your script failed (${settlement.failureKind}):\n\`\`\`\n${settlement.error}\n\`\`\``;
	if (settlement.result === void 0) return null;
	return `Your script returned:\n\`\`\`json\n${JSON.stringify(settlement.result, null, 2)}\n\`\`\``;
}
var AgentProcessor = class extends StreamProcessor {
	contract = AgentContract;
	deps;
	#now;
	/** The debounce window's wait — a test makes it instant. */
	#sleep;
	constructor(deps) {
		super();
		this.deps = deps;
		this.#now = deps.now || (() => Date.now());
		this.#sleep = deps.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
	}
	/** This incarnation's birth attempt, so one at-head pass does not start a second; the durable
	*  ground is `state.creation`. */
	#creating = false;
	/** The same for this incarnation's death attempt; the durable ground is `state.deletion`. */
	#deleting = false;
	/** The requests THIS incarnation is running, so a later at-head pass over the same fold does
	*  not start a second attempt; the durable ground is the fold (`openRequest`). */
	#llmRequestsInFlight = /* @__PURE__ */ new Map();
	#identityRead;
	/** Which context this is — its project and path — read once. */
	async #identity() {
		try {
			var _usingCtx$1 = _usingCtx();
			if (this.#identityRead) return this.#identityRead;
			const itx = _usingCtx$1.u(this.deps.getItx());
			return this.#identityRead = await itx.whoami();
		} catch (_) {
			_usingCtx$1.e = _;
		} finally {
			_usingCtx$1.d();
		}
	}
	/** A certificate on `/`, where the catalog folds it (catalog.ts): stamped with this agent's path,
	*  which is all the catalog trusts. Unkeyed there: a key on `/` is anyone's to take first, and a
	*  same-body event under it would swallow this one; the catalog's fold is idempotent, so a retry
	*  that lands it twice changes nothing. */
	async #postToTheCatalog({ type, payload }) {
		try {
			var _usingCtx3 = _usingCtx();
			return await _usingCtx3.u(this.deps.getItx()).cd("/").append({
				type,
				payload
			});
		} catch (_) {
			_usingCtx3.e = _;
		} finally {
			_usingCtx3.d();
		}
	}
	/** Every change the facts make is stamped with the event's time: `lastActivityAt` moves exactly
	*  when the state does, so a harmless fact (a late intent, a repeated certificate) never reorders
	*  the sidebar. */
	reduce(args) {
		const next = this.#reduceFacts(args);
		return next && {
			...next,
			lastActivityAt: args.event.createdAt
		};
	}
	#reduceFacts({ state, event }) {
		switch (event.type) {
			case "events.iterate.com/agent/create-requested": return state.creation?.status === "created" ? void 0 : {
				...state,
				creation: {
					status: "requested",
					offset: event.offset
				}
			};
			case "events.iterate.com/agent/created": return {
				...state,
				creation: {
					status: "created",
					offset: event.offset
				}
			};
			case "events.iterate.com/agent/create-failed": return state.creation?.status === "created" ? void 0 : {
				...state,
				creation: {
					status: "failed",
					offset: event.offset
				}
			};
			case "events.iterate.com/agent/delete-requested": return state.deletion?.status === "deleted" ? void 0 : {
				...state,
				deletion: {
					status: "requested",
					offset: event.offset
				}
			};
			case "events.iterate.com/agent/deleted": return {
				...state,
				deletion: {
					status: "deleted",
					offset: event.offset
				}
			};
			case "events.iterate.com/agent/configured": {
				const patch = event.payload.config;
				return {
					...state,
					config: {
						llm: { model: patch.llm?.model || state.config.llm.model },
						maxAutonomousTurns: patch.maxAutonomousTurns ?? state.config.maxAutonomousTurns,
						llmRequestExpiryMs: patch.llmRequestExpiryMs ?? state.config.llmRequestExpiryMs,
						llmRequestDebounceMs: patch.llmRequestDebounceMs ?? state.config.llmRequestDebounceMs,
						llmRequestRetryPolicy: {
							maxAttempts: patch.llmRequestRetryPolicy?.maxAttempts ?? state.config.llmRequestRetryPolicy.maxAttempts,
							backoffBaseMs: patch.llmRequestRetryPolicy?.backoffBaseMs ?? state.config.llmRequestRetryPolicy.backoffBaseMs,
							backoffMaxMs: patch.llmRequestRetryPolicy?.backoffMaxMs ?? state.config.llmRequestRetryPolicy.backoffMaxMs
						}
					}
				};
			}
			case "events.iterate.com/agent/context-added": {
				const { role, content, actor, llmRequestPolicy, llmRequestOffset } = event.payload;
				const { origin } = event.source;
				const sender = origin !== event.path ? origin : event.payload.from;
				const next = {
					...state,
					contextItems: [...state.contextItems, {
						offset: event.offset,
						role,
						content,
						actor,
						llmRequestOffset,
						files: event.payload.files,
						from: sender === "/" ? void 0 : sender
					}]
				};
				if (!((role === "user" || role === "developer") && llmRequestPolicy?.behaviour !== "dont-trigger-request")) return next;
				const source = actor?.type === "script" || actor?.type === "agent" ? "agent-loop" : "external";
				return {
					...next,
					pendingLlmRequestTrigger: {
						offset: event.offset,
						atMs: Date.parse(event.createdAt),
						source
					},
					...source === "external" && { autonomousTurnCount: 0 }
				};
			}
			case "events.iterate.com/agent/llm-request-requested": {
				const trigger = state.pendingLlmRequestTrigger;
				if (!trigger || state.openRequest || trigger.offset !== event.payload.triggerOffset) return void 0;
				return {
					...state,
					pendingLlmRequestTrigger: null,
					openRequest: {
						requestedAtOffset: event.offset,
						expiresAt: event.payload.expiresAt,
						model: event.payload.model,
						triggerSource: trigger.source
					},
					autonomousTurnCount: trigger.source === "agent-loop" ? state.autonomousTurnCount + 1 : state.autonomousTurnCount
				};
			}
			case "events.iterate.com/agent/llm-request-settled": {
				const open = state.openRequest;
				if (!open || open.requestedAtOffset !== event.payload.requestOffset) return void 0;
				const { result } = event.payload;
				if (result.status === "succeeded") return {
					...state,
					openRequest: null,
					consecutiveLlmFailures: 0
				};
				if (result.status === "failed") return {
					...state,
					openRequest: null,
					consecutiveLlmFailures: state.consecutiveLlmFailures + 1,
					pendingLlmRequestTrigger: {
						offset: open.requestedAtOffset,
						atMs: Date.parse(event.createdAt),
						source: open.triggerSource
					}
				};
				return {
					...state,
					openRequest: null
				};
			}
			case "events.iterate.com/agent/paused": return state.paused ? void 0 : {
				...state,
				paused: {
					reason: event.payload.reason,
					atOffset: event.offset
				},
				pendingLlmRequestTrigger: null
			};
			case "events.iterate.com/agent/resumed": return state.paused ? {
				...state,
				paused: null,
				autonomousTurnCount: 0,
				consecutiveLlmFailures: 0
			} : void 0;
			default: return;
		}
	}
	processEvent(args) {
		const { event, state, append, blockProcessorWhile } = args;
		if (state.deletion) {
			this.#atHead(args);
			return;
		}
		if (event?.type === "events.iterate.com/agent/context-added" && event.payload.llmRequestPolicy?.behaviour === "interrupt-current-request" && (event.payload.role === "user" || event.payload.role === "developer") && state.openRequest) {
			const open = state.openRequest;
			const inFlight = this.#llmRequestsInFlight.get(open.requestedAtOffset);
			inFlight?.controller.abort(new InterruptedError());
			const partialText = inFlight?.partialText || void 0;
			blockProcessorWhile(() => appendUnlessLost(append, ...partialText ? [{
				type: "events.iterate.com/agent/context-added",
				idempotencyKey: this.idempotencyKey(`interrupted/${String(open.requestedAtOffset)}`),
				payload: {
					role: "assistant",
					content: `[Response interrupted by the user's next message; partial output follows]\n${partialText}`
				}
			}] : [], {
				type: "events.iterate.com/agent/llm-request-settled",
				idempotencyKey: this.idempotencyKey(`settle/${String(open.requestedAtOffset)}`),
				payload: {
					requestOffset: open.requestedAtOffset,
					result: {
						status: "cancelled",
						reason: "interrupted-by-user-input",
						partialText
					}
				}
			}));
			return;
		}
		if (event?.type === "events.iterate.com/agent/context-added" && event.payload.role === "assistant" && event.payload.llmRequestOffset !== void 0) {
			const { llmRequestOffset } = event.payload;
			const outcome = parseCodemodeResponse(event.payload.content);
			const consequences = [];
			if (outcome.kind === "malformed" || outcome.kind === "multiple") consequences.push({
				type: "events.iterate.com/agent/context-added",
				idempotencyKey: this.idempotencyKey("format-feedback", event),
				payload: {
					role: "developer",
					content: outcome.feedback,
					actor: { type: "agent" }
				}
			});
			if (outcome.kind === "script") {
				if (outcome.status) consequences.push({
					type: "events.iterate.com/agent/summary-updated",
					idempotencyKey: this.idempotencyKey("codemode-status", event),
					payload: { activity: outcome.status }
				});
				consequences.push({
					type: "events.iterate.com/itx/run-requested",
					idempotencyKey: this.idempotencyKey("run-requested", event),
					payload: { code: outcome.code }
				});
			}
			if ((outcome.kind === "script" || outcome.kind === "none") && outcome.prose) consequences.push({
				type: "events.iterate.com/agent/web-message-sent",
				idempotencyKey: this.idempotencyKey("codemode-prose", event),
				payload: {
					message: outcome.prose,
					llmRequestOffset,
					...outcome.kind === "script" && { besideScript: true }
				}
			});
			if (consequences.length > 0) blockProcessorWhile(() => append(...consequences));
		}
		if (event?.type === "events.iterate.com/itx/run-settled") {
			const rendered = renderScriptSettlement(event.payload.settlement);
			if (rendered) blockProcessorWhile(() => append({
				type: "events.iterate.com/agent/context-added",
				idempotencyKey: this.idempotencyKey("script-result", event),
				payload: {
					role: "developer",
					content: rendered,
					actor: {
						type: "script",
						requestOffset: event.payload.requestOffset
					}
				}
			}));
		}
		this.#atHead(args);
	}
	#atHead({ state, delivery, append, runInBackground }) {
		if (!delivery.caughtUp) return;
		if (state.creation?.status === "requested") {
			if (this.#creating) return;
			this.#creating = true;
			runInBackground(async () => {
				try {
					let whoami;
					try {
						var _usingCtx4 = _usingCtx();
						whoami = await _usingCtx4.u(this.deps.getItx()).whoami();
					} catch (_) {
						_usingCtx4.e = _;
					} finally {
						_usingCtx4.d();
					}
					const { path } = whoami;
					const certificate = {
						type: "events.iterate.com/agent/created",
						payload: { path },
						idempotencyKey: `agent/created:${path}`
					};
					await this.#postToTheCatalog(certificate);
					await append(certificate, {
						type: "events.iterate.com/agent/context-added",
						idempotencyKey: `agent/system-prompt:${path}`,
						payload: {
							role: "system",
							content: `${DEFAULT_AGENT_SYSTEM_PROMPT}\nCURRENT PROJECT: ${JSON.stringify(whoami)}`
						}
					});
				} catch (error) {
					await append({
						type: "events.iterate.com/agent/create-failed",
						payload: { error: error instanceof Error ? error.message : String(error) }
					});
				} finally {
					this.#creating = false;
				}
			});
			return;
		}
		if (state.creation?.status !== "created") return;
		if (state.deletion) {
			if (state.deletion.status !== "requested" || this.#deleting) return;
			this.#deleting = true;
			runInBackground(async () => {
				try {
					const { path } = await this.#identity();
					const certificate = {
						type: "events.iterate.com/agent/deleted",
						payload: { path },
						idempotencyKey: `agent/deleted:${path}`
					};
					await this.#postToTheCatalog(certificate);
					await append(certificate);
				} finally {
					this.#deleting = false;
				}
			});
			return;
		}
		const now = this.#now();
		const trigger = state.pendingLlmRequestTrigger;
		if (state.paused && trigger?.source === "external") {
			runInBackground(() => append({
				type: "events.iterate.com/agent/resumed",
				idempotencyKey: this.idempotencyKey(`resume/${String(trigger.offset)}`),
				payload: { reason: "external input" }
			}));
			return;
		}
		if (trigger && !state.openRequest && !state.paused) {
			const { maxAutonomousTurns, llmRequestRetryPolicy, llmRequestExpiryMs, llm } = state.config;
			const breaker = trigger.source === "agent-loop" && state.autonomousTurnCount >= maxAutonomousTurns ? `autonomous turn limit reached (${String(maxAutonomousTurns)} consecutive turns without external input)` : state.consecutiveLlmFailures >= llmRequestRetryPolicy.maxAttempts ? `the model failed ${String(state.consecutiveLlmFailures)} times in a row` : null;
			if (breaker) {
				runInBackground(() => append({
					type: "events.iterate.com/agent/paused",
					idempotencyKey: this.idempotencyKey(`pause/${String(trigger.offset)}`),
					payload: {
						reason: breaker,
						triggerOffset: trigger.offset
					}
				}));
				return;
			}
			const windowMs = state.config.llmRequestDebounceMs + retryBackoffMs(state);
			const windowClosesInMs = trigger.atMs + windowMs - now;
			const intent = {
				type: "events.iterate.com/agent/llm-request-requested",
				idempotencyKey: this.idempotencyKey(`request/${String(trigger.offset)}`),
				payload: {
					model: llm.model,
					expiresAt: trigger.atMs + llmRequestExpiryMs,
					triggerOffset: trigger.offset
				}
			};
			runInBackground(async () => {
				if (windowClosesInMs > 0) await this.#sleep(windowClosesInMs);
				await append(intent);
			});
			return;
		}
		const open = state.openRequest;
		if (open && !this.#llmRequestsInFlight.has(open.requestedAtOffset)) {
			if (now >= open.expiresAt) runInBackground(() => append({
				type: "events.iterate.com/agent/llm-request-settled",
				idempotencyKey: this.idempotencyKey(`settle/${String(open.requestedAtOffset)}`),
				payload: {
					requestOffset: open.requestedAtOffset,
					result: {
						status: "cancelled",
						reason: "expired"
					}
				}
			}));
			else {
				const inFlight = {
					controller: new AbortController(),
					partialText: ""
				};
				this.#llmRequestsInFlight.set(open.requestedAtOffset, inFlight);
				runInBackground(() => this.#runLlmRequest(open, state, append, inFlight));
			}
		}
	}
	/** The model over the conversation up to the request, STREAMED: each coalescing window of the
	*  answer's text and thinking is one ephemeral `llm-response-frame` (a feed renders the answer as
	*  it is written); ONE batch then settles the request, lands the assistant's words and reports the
	*  cost, so an eviction between them is impossible. An interruption settles the request itself (processEvent) — an
	*  aborted stream ends here silently, and a success that raced it loses on the settle key. */
	async #runLlmRequest(open, state, append, inFlight) {
		const startedAt = this.#now();
		const { controller } = inFlight;
		const expiry = setTimeout(() => controller.abort(/* @__PURE__ */ new Error("the model did not finish before the request expired")), Math.max(1e3, open.expiresAt - startedAt));
		let idle = setTimeout(() => controller.abort(/* @__PURE__ */ new Error("the model stream stalled")), STREAM_IDLE_BUDGET_MS);
		try {
			const { path } = await this.#identity();
			let tree = [];
			try {
				try {
					var _usingCtx5 = _usingCtx();
					tree = await _usingCtx5.u(this.deps.getItx()).cd(path).rewriteRules.list();
				} catch (_) {
					_usingCtx5.e = _;
				} finally {
					_usingCtx5.d();
				}
			} catch (error) {
				if (errorCode(error) !== "NO_ITX_EXPRESSION_MATCH") throw error;
			}
			const items = state.contextItems.filter((item) => item.offset < open.requestedAtOffset);
			const images = /* @__PURE__ */ new Map();
			for (const item of items) for (const file of item.files || []) {
				if (!file.contentType.startsWith("image/") || images.has(file.path)) continue;
				try {
					try {
						var _usingCtx6 = _usingCtx();
						const itx = _usingCtx6.u(this.deps.getItx());
						images.set(file.path, {
							contentType: file.contentType,
							base64: bytesToBase64(await itx.files.get(file.path).bytes())
						});
					} catch (_) {
						_usingCtx6.e = _;
					} finally {
						_usingCtx6.d();
					}
				} catch {}
			}
			const messages = buildChatMessages(items, images, tree);
			const llmRequestOffset = open.requestedAtOffset;
			let responseDelta = "";
			let thinkingDelta = "";
			let windowOpen = false;
			let sequence = 0;
			let windows = Promise.resolve();
			const closeWindow = () => {
				windowOpen = false;
				if (!responseDelta && !thinkingDelta) return;
				const payload = {
					llmRequestOffset,
					responseDelta,
					thinkingDelta,
					sequence: sequence++
				};
				responseDelta = "";
				thinkingDelta = "";
				windows = windows.then(() => append({
					type: "events.iterate.com/agent/llm-response-frame",
					ephemeral: true,
					payload
				})).then(() => void 0, () => void 0);
			};
			const settle = async (result, ...alongside) => {
				closeWindow();
				await windows;
				await appendUnlessLost(append, {
					type: "events.iterate.com/agent/llm-request-settled",
					idempotencyKey: this.idempotencyKey(`settle/${String(llmRequestOffset)}`),
					payload: {
						requestOffset: llmRequestOffset,
						durationMs: this.#now() - startedAt,
						result
					}
				}, ...alongside);
			};
			let answer;
			try {
				answer = await this.#stream({
					model: open.model,
					messages,
					signal: controller.signal,
					onDelta: (text, thinking) => {
						if (controller.signal.aborted) return;
						clearTimeout(idle);
						idle = setTimeout(() => controller.abort(/* @__PURE__ */ new Error("the model stream stalled")), STREAM_IDLE_BUDGET_MS);
						if (!text && !thinking) return;
						inFlight.partialText += text;
						responseDelta += text;
						thinkingDelta += thinking;
						if (responseDelta.length + thinkingDelta.length >= FRAME_WINDOW_MAX_CHARS) return closeWindow();
						if (windowOpen) return;
						windowOpen = true;
						this.#sleep(FRAME_WINDOW_MS).then(closeWindow);
					}
				});
			} catch (error) {
				if (controller.signal.reason instanceof InterruptedError) return;
				await settle({
					status: "failed",
					errorMessage: String(error instanceof Error ? error.message : error).slice(0, 4e3),
					partialText: inFlight.partialText || void 0
				});
				return;
			}
			if (controller.signal.reason instanceof InterruptedError) return;
			const { text, usage } = answer;
			await settle({
				status: "succeeded",
				text,
				usage
			}, {
				type: "events.iterate.com/agent/context-added",
				idempotencyKey: this.idempotencyKey(`assistant/${String(llmRequestOffset)}`),
				payload: {
					role: "assistant",
					content: text,
					llmRequestOffset
				}
			}, ...usage ? [{
				type: "events.iterate.com/agent/token-usage-reported",
				idempotencyKey: this.idempotencyKey(`usage/${String(llmRequestOffset)}`),
				payload: {
					model: open.model,
					maxContextTokens: contextWindowTokens(open.model),
					inputTokens: usage.inputTokens,
					outputTokens: usage.outputTokens
				}
			}] : []);
		} finally {
			clearTimeout(expiry);
			clearTimeout(idle);
			this.#llmRequestsInFlight.delete(open.requestedAtOffset);
		}
	}
	/** One STREAMED model call over the conversation so far: every provider event the stream carries
	*  reaches `onDelta` as it arrives, with the answer text and the thinking it adds (both "" for a
	*  bookkeeping event); the call answers the whole text once the stream ends, with the usage the
	*  provider reported. Aborting `signal` stops the stream; the call then rejects.
	*
	*  Two routes by the model's name, both `itx.ai` under THIS context's rules (a test lends a fake
	*  there), each drained inside its one `getItx` scope: the call stays open until its body is
	*  read. A `@cf/…` answer may be streamed or whole JSON.
	*  Anything else is OpenAI's Responses API as a Workers AI partner model on Cloudflare's billing
	*  — no key, ours or a project's — the FAST reading of a reasoning model: low effort, with its
	*  summary streamed. */
	async #stream({ model, messages, signal, onDelta }) {
		try {
			var _usingCtx7 = _usingCtx();
			if (model.startsWith("@cf/")) try {
				var _usingCtx8 = _usingCtx();
				const ai = _usingCtx8.u(this.deps.getItx()).ai;
				const raw = await raceAbort(signal, ai.run(model, {
					messages,
					stream: true
				}));
				if (raw instanceof ReadableStream) {
					let text = "";
					let usage;
					await drainSse(raw, signal, (event) => {
						const chunk = z.looseObject({ response: z.string().optional() }).safeParse(event);
						const delta = chunk.success ? chunk.data.response || "" : "";
						text += delta;
						onDelta(delta, "");
						const reported = z.looseObject({ usage: z.unknown() }).safeParse(event);
						if (reported.success && reported.data.usage !== void 0) usage = normalizeUsage(reported.data.usage) ?? usage;
					});
					if (text.trim() === "") throw new Error("the model answered with no text");
					return {
						text: text.trim(),
						usage
					};
				}
				const answer = ChatAnswer.parse(raw);
				const text = ("response" in answer ? answer.response : answer.choices[0].message.content).trim();
				if (text === "") throw new Error("the model answered with no text");
				onDelta(text, "");
				return { text };
			} catch (_) {
				_usingCtx8.e = _;
			} finally {
				_usingCtx8.d();
			}
			const { projectId, path } = await this.#identity();
			const raw = await raceAbort(signal, _usingCtx7.u(this.deps.getItx()).ai.run(`openai/${model}`, {
				input: responsesInput(messages),
				stream: true,
				store: false,
				reasoning: {
					effort: "low",
					summary: "auto"
				}
			}, {
				returnRawResponse: true,
				gateway: {
					id: AI_GATEWAY_ID,
					skipCache: true,
					metadata: {
						projectId,
						streamPath: path,
						context: "agent-turn"
					}
				}
			}));
			if (!(raw instanceof Response)) throw new Error(`model ${model}: Workers AI did not answer with the raw response`);
			const response = raw;
			if (!response.ok || !response.body) throw new Error(`openai/${model} ${String(response.status)}: ${(await response.text()).slice(0, 400)}`);
			let text = "";
			let usage;
			await drainSse(response.body, signal, (raw) => {
				const event = ResponsesEvent.safeParse(raw);
				if (!event.success) return;
				const { type } = event.data;
				if (type === "response.output_text.delta") {
					const delta = typeof event.data.delta === "string" ? event.data.delta : "";
					text += delta;
					onDelta(delta, "");
				} else if (type === "response.reasoning_summary_text.delta") onDelta("", typeof event.data.delta === "string" ? event.data.delta : "");
				else if (type === "response.completed" || type === "response.incomplete") {
					const done = z.looseObject({ response: z.looseObject({ usage: z.unknown() }) }).safeParse(raw);
					if (done.success) usage = normalizeUsage(done.data.response.usage) ?? usage;
				} else if (type === "response.failed" || type === "error") {
					const failure = z.looseObject({
						error: z.looseObject({ message: z.string() }).optional(),
						response: z.looseObject({ error: z.looseObject({ message: z.string() }).optional() }).optional()
					}).safeParse(raw);
					throw new Error(`openai: ${failure.success ? failure.data.error?.message || failure.data.response?.error?.message || type : type}`);
				}
			});
			if (text.trim() === "") throw new Error("the model answered with no text");
			return {
				text: text.trim(),
				usage
			};
		} catch (_) {
			_usingCtx7.e = _;
		} finally {
			_usingCtx7.d();
		}
	}
};
//#endregion
export { renderScriptSettlement as a, renderCapabilityTree as i, buildChatMessages as n, raceAbort as r, AgentProcessor as t };

//# sourceMappingURL=processor-CHj0Ui4P.mjs.map