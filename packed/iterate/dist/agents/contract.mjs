import { defineProcessorContract } from "../stream/contract.mjs";
import { RunEventCatalog } from "../stream/run.mjs";
import { z } from "zod";
//#region src/agents/contract.ts
/** Who put words into the context: a person, a script's result, or the loop itself (a format
*  correction). A script's or the loop's words are self-triggered input — the autonomous-turn
*  breaker counts them; a person's are external and reset it. */
const Actor = z.discriminatedUnion("type", [
	z.object({ type: z.literal("user") }),
	z.object({
		type: z.literal("script"),
		requestOffset: z.number().int().positive()
	}),
	z.object({ type: z.literal("agent") })
]);
const Role = z.enum([
	"system",
	"developer",
	"user",
	"assistant"
]);
/** A file attached to a context item (an attachment record, minus its signed URL): the
*  project file it was stored as (`itx.files`), its content type, original name and size. */
const FileAttachment = z.object({
	contentType: z.string().min(1),
	filename: z.string().min(1),
	path: z.string().min(1),
	size: z.number().int().nonnegative()
});
/** Where a request's trigger came from: a person (`external`) or the loop's own consequences. */
const TriggerSource = z.enum(["external", "agent-loop"]);
/** What a model call cost, normalized: the provider's totals, and the cached/reasoning breakdowns
*  when it reports them. */
/** Why an LLM request stopped short: a person typed over it, or it ran past its deadline. The
*  Agents UI reads it too (src/lib/events/agent-ui-reducer.ts). */
const AgentLlmRequestCancelReason = z.enum(["interrupted-by-user-input", "expired"]);
const LlmUsage = z.object({
	inputTokens: z.number().int().nonnegative(),
	outputTokens: z.number().int().nonnegative(),
	cachedInputTokens: z.number().int().nonnegative().optional(),
	reasoningOutputTokens: z.number().int().nonnegative().optional()
});
const AgentContract = defineProcessorContract({
	slug: "agent",
	version: "6",
	description: "An agent: a conversation on its own context, driven by a model that acts by writing scripts against itx.",
	/** THE REDUCED STATE — what the reduce keeps between events: where creation stands (as the OFFSET
	*  of the event that says so — the request, the certificate, or the failure; read that event for
	*  the error), where deletion stands the same way (the request, or the certificate — set, the loop
	*  runs no more turns), the conversation as the model will read it, and the loop's obligations —
	*  the one pending trigger, the one open request, the breakers' counts, a pause (a script it asked
	*  for is the CONTEXT's obligation: core state `runs`). It is the checkpoint the facet stores, what
	*  `snapshot()` and `liveSnapshot()` answer, the guard `message()` reads before it speaks, and
	*  what the agents app renders as the live status beside the log. */
	stateSchema: z.object({
		creation: z.object({
			status: z.enum([
				"requested",
				"created",
				"failed"
			]),
			offset: z.number().int().positive()
		}).nullable().default(null),
		/** Where deletion stands, as the offset of the event that says so; null while the agent lives. */
		deletion: z.object({
			status: z.enum(["requested", "deleted"]),
			offset: z.number().int().positive()
		}).nullable().default(null),
		/** The knobs `agent/configured` patches; every one defaulted, so `{}` is a whole config. */
		config: z.object({
			llm: z.object({ model: z.string().min(1).default("gpt-6-astra") }).prefault({}),
			/** Consecutive self-triggered turns (script results, corrections) before the loop pauses. */
			maxAutonomousTurns: z.number().int().positive().default(20),
			/** How long a recorded request stays runnable; past it, settled as expired. */
			llmRequestExpiryMs: z.number().int().positive().default(6e5),
			/** The debounce window: a request waits this long after its trigger for more content — a second
			*  message inside the window moves the trigger and ONE request answers both. */
			llmRequestDebounceMs: z.number().int().nonnegative().default(250),
			/** Consecutive model failures before the loop pauses; between attempts, the backoff —
			*  `backoffBaseMs · 2^(failures−1)`, capped at `backoffMaxMs` — folded into the debounce window. */
			llmRequestRetryPolicy: z.object({
				maxAttempts: z.number().int().positive().default(3),
				backoffBaseMs: z.number().int().nonnegative().default(1e4),
				backoffMaxMs: z.number().int().nonnegative().default(6e4)
			}).prefault({})
		}).prefault({}),
		/** Every model-visible item, in offset order — the conversation the next request is built from. */
		contextItems: z.array(z.object({
			offset: z.number().int().positive(),
			role: Role,
			content: z.string(),
			actor: Actor.optional(),
			llmRequestOffset: z.number().int().positive().optional(),
			files: z.array(FileAttachment).optional(),
			/** The context it came from, when another one sent it (processor.ts, the fold): the
			*  model reads it as `[from <context>]`. */
			from: z.string().optional()
		})).default([]),
		/** The ONE trigger the next request answers; null once a request has been recorded for it. */
		pendingLlmRequestTrigger: z.object({
			offset: z.number().int().positive(),
			atMs: z.number(),
			source: TriggerSource
		}).nullable().default(null),
		/** The one recorded request not yet settled: the loop's obligation, whichever incarnation runs it. */
		openRequest: z.object({
			requestedAtOffset: z.number().int().positive(),
			expiresAt: z.number(),
			model: z.string(),
			triggerSource: TriggerSource
		}).nullable().default(null),
		consecutiveLlmFailures: z.number().int().nonnegative().default(0),
		autonomousTurnCount: z.number().int().nonnegative().default(0),
		/** When the state last moved: the `createdAt` of the last event the reduce changed it for —
		*  words in, a request opened or settled, a pause. What the agents app's sidebar orders by. */
		lastActivityAt: z.string().nullable().default(null),
		/** Set by `agent/paused` (the breakers, or an operator); cleared by `agent/resumed`. */
		paused: z.object({
			reason: z.string(),
			atOffset: z.number().int().positive()
		}).nullable().default(null)
	}),
	events: {
		"events.iterate.com/agent/create-requested": {
			description: "Someone asked for this agent (`itx.agents.create(path)`). No payload: the context it lands on IS the agent. The collection writes the child's parent link `itx ⇒ itx.cd(creator)` before this request, the creator being the context whose `itx.agents` reached the collection, so the link is part of the birth and nothing re-points a born context. The processor lands created (with the default system prompt beside it) or create-failed; a request after a failure is a new attempt, one after the certificate a harmless fact.",
			payloadSchema: z.object({})
		},
		"events.iterate.com/agent/created": {
			description: "The birth certificate: on the agent's path, and cross-posted to / for the project catalog — hence it names the path.",
			payloadSchema: z.object({ path: z.string().min(1) })
		},
		"events.iterate.com/agent/create-failed": {
			description: "What the birth reported. Terminal until a new request.",
			payloadSchema: z.object({ error: z.string() })
		},
		"events.iterate.com/agent/delete-requested": {
			description: "Someone asked for this agent to go (`itx.agents.delete(path)`). No payload: the context it lands on IS the agent. Nothing to tear down — the processor lands deleted, and the loop runs no more turns from here on; a request after the certificate is a harmless fact.",
			payloadSchema: z.object({})
		},
		"events.iterate.com/agent/deleted": {
			description: "The death certificate: on the agent's path, and cross-posted to / for the project catalog, which drops the entry and keeps the death — hence it names the path. Terminal: a deleted agent is not re-creatable, and its facet is never hosted again.",
			payloadSchema: z.object({ path: z.string().min(1) })
		},
		"events.iterate.com/agent/configured": {
			description: "Merges a partial configuration into the agent's config; omitted keys keep their values.",
			payloadSchema: z.object({ config: z.object({
				llm: z.object({ model: z.string().min(1).optional() }).optional(),
				maxAutonomousTurns: z.number().int().positive().optional(),
				llmRequestExpiryMs: z.number().int().positive().optional(),
				llmRequestDebounceMs: z.number().int().nonnegative().optional(),
				llmRequestRetryPolicy: z.object({
					maxAttempts: z.number().int().positive().optional(),
					backoffBaseMs: z.number().int().nonnegative().optional(),
					backoffMaxMs: z.number().int().nonnegative().optional()
				}).optional()
			}) })
		},
		"events.iterate.com/agent/context-added": {
			description: "Words into the model's context — the everyday event. A user or developer item raises the pending trigger unless its policy says not to; the assistant's own output carries llmRequestOffset.",
			payloadSchema: z.object({
				role: Role,
				content: z.string(),
				actor: Actor.optional(),
				/** What rides with the words: files stored under this agent's path (`message()` stores them). */
				files: z.array(FileAttachment).optional(),
				/** The context that sent the words through `itx.agents.get(path).message(…)`, as the
				*  collection relays it (collection.ts): the agent's own facet appends them, so their
				*  `source.origin` is the agent itself. */
				from: z.string().optional(),
				/** The policies: `dont-trigger-request` (words that raise no turn), `after-current-request`
				*  (the default: the next turn), `interrupt-current-request` (cut the running answer short —
				*  the request settles cancelled with what streamed so far, and these words start the next). */
				llmRequestPolicy: z.object({ behaviour: z.enum([
					"dont-trigger-request",
					"after-current-request",
					"interrupt-current-request"
				]) }).optional(),
				llmRequestOffset: z.number().int().positive().optional()
			})
		},
		"events.iterate.com/agent/web-message-sent": {
			description: "THE assistant-message fact: the markdown outside the tag, what a person is shown; llmRequestOffset names the answer it came from, and besideScript marks prose written beside a script, before its result.",
			payloadSchema: z.object({
				message: z.string().min(1),
				llmRequestOffset: z.number().int().positive().optional(),
				/** The answer also held a script, so these words were written before its result: a reader
				*  that may state only verified results (a voice call) holds them back. */
				besideScript: z.literal(true).optional()
			})
		},
		"events.iterate.com/agent/summary-updated": {
			description: "The tag's status attribute as the live activity label — the platform's summary vocabulary, the one field this loop speaks.",
			payloadSchema: z.object({ activity: z.string().min(1) })
		},
		"events.iterate.com/agent/llm-request-requested": {
			description: "The loop recorded its intent to run the model for ONE trigger (the offset it names); the event's offset is the request's identity. An intent whose trigger has moved on is a harmless fact.",
			payloadSchema: z.object({
				model: z.string().min(1),
				expiresAt: z.number(),
				triggerOffset: z.number().int().positive()
			})
		},
		"events.iterate.com/agent/llm-response-frame": {
			description: "EPHEMERAL, never stored: one coalescing window of the answer being written for the request it names — the text and the thinking it adds, which a feed appends to what it has shown. The settled event carries the durable text.",
			ephemeral: true,
			payloadSchema: z.object({
				llmRequestOffset: z.number().int().positive(),
				/** The answer text this window adds ("" when it adds only thinking). */
				responseDelta: z.string(),
				/** The model's thinking (a reasoning summary) this window adds ("" when it adds only text). */
				thinkingDelta: z.string(),
				/** The window's ordinal within the response — a redelivered window is told from a new one. */
				sequence: z.number().int().nonnegative()
			})
		},
		"events.iterate.com/agent/llm-request-settled": {
			description: "The request's terminal fact: the model's text (and what it cost), its failure, its expiry, or the person's interruption — the two last with whatever streamed before.",
			payloadSchema: z.object({
				requestOffset: z.number().int().positive(),
				durationMs: z.number().nonnegative().optional(),
				result: z.discriminatedUnion("status", [
					z.object({
						status: z.literal("succeeded"),
						text: z.string(),
						usage: LlmUsage.optional()
					}),
					z.object({
						status: z.literal("failed"),
						errorMessage: z.string(),
						partialText: z.string().optional()
					}),
					z.object({
						status: z.literal("cancelled"),
						reason: AgentLlmRequestCancelReason,
						partialText: z.string().optional()
					})
				])
			})
		},
		"events.iterate.com/agent/token-usage-reported": {
			description: "What the last successful request cost against the model's context window (the platform's vocabulary; a feed shows the context's fullness).",
			payloadSchema: z.object({
				model: z.string().min(1),
				maxContextTokens: z.number().int().positive(),
				inputTokens: z.number().int().nonnegative(),
				outputTokens: z.number().int().nonnegative()
			})
		},
		"events.iterate.com/agent/paused": {
			description: "New turns stay parked until agent/resumed: a breaker tripped, or an operator paused.",
			payloadSchema: z.object({
				reason: z.string(),
				triggerOffset: z.number().int().positive().optional()
			})
		},
		"events.iterate.com/agent/resumed": {
			description: "Turns run again; the breakers' counts start over.",
			payloadSchema: z.object({ reason: z.string().optional() })
		}
	},
	processorDeps: [RunEventCatalog],
	consumes: [
		"events.iterate.com/agent/create-requested",
		"events.iterate.com/agent/created",
		"events.iterate.com/agent/create-failed",
		"events.iterate.com/agent/delete-requested",
		"events.iterate.com/agent/deleted",
		"events.iterate.com/agent/configured",
		"events.iterate.com/agent/context-added",
		"events.iterate.com/agent/llm-request-requested",
		"events.iterate.com/agent/llm-request-settled",
		"events.iterate.com/agent/paused",
		"events.iterate.com/agent/resumed",
		"events.iterate.com/itx/run-settled"
	],
	emits: [
		"events.iterate.com/agent/created",
		"events.iterate.com/agent/create-failed",
		"events.iterate.com/agent/deleted",
		"events.iterate.com/agent/context-added",
		"events.iterate.com/agent/web-message-sent",
		"events.iterate.com/agent/summary-updated",
		"events.iterate.com/agent/llm-request-requested",
		"events.iterate.com/agent/llm-response-frame",
		"events.iterate.com/agent/llm-request-settled",
		"events.iterate.com/agent/token-usage-reported",
		"events.iterate.com/agent/paused",
		"events.iterate.com/agent/resumed",
		"events.iterate.com/itx/run-requested"
	]
});
//#endregion
export { AgentContract, AgentLlmRequestCancelReason };

//# sourceMappingURL=contract.mjs.map