import { T as StreamProcessor, n as DefinedProcessorContract, p as ProcessEventArgs, r as EmittedEventInput, t as ConsumedEvent, v as ReduceArgs } from "./contract-D1J6d08G.mjs";
import { i as ChatMessage, r as AgentState, t as AgentContract } from "./contract-DtO5-VNU.mjs";
import { Q as RewriteRuleListEntry, j as IterateContextApi } from "./api-DYAY3SD8.mjs";
import { o as RunSettlement } from "./run-1CfRs5DM.mjs";
import { z } from "zod";
//#region src/agents/processor.d.ts
/** The conversation as the model reads it. An item another context appended opens with
 *  `[from <context>]`. An item's images become image parts (a data: URL of the bytes in `images`,
 *  keyed by path — a vision model sees the pixels); any other attachment, or an image whose bytes
 *  are gone, is a line naming it and how a script reads it (a hint line). The developer's notes
 *  read as system instructions. */
declare function buildChatMessages(items: AgentState["contextItems"], images: Map<string, {
  contentType: string;
  base64: string;
}>, tree?: RewriteRuleListEntry[]): ChatMessage[];
/** The agent's table as the model reads it: one line per name it can spell (`match — description`,
 *  a row without a description shows its target), grouped by the context each row came from when
 *  more than one; masks and the bare `itx` row are not names. Null when nothing is spellable (a jail
 *  with no grants yet): then no tree message at all. */
declare function renderCapabilityTree(rows: RewriteRuleListEntry[]): string | null;
/** Race an un-abortable dial against the caller's signal: the caller regains control the moment it
 *  aborts (an interruption, the expiry, the idle watchdog). A Response or stream the orphaned dial
 *  answers after that is cancelled, so the provider stops and no unread body holds the edge's
 *  invocation open; a stream already open is cancelled by `drainSse` itself. */
declare function raceAbort<T>(signal: AbortSignal, work: Promise<T>): Promise<T>;
type AgentEvent = ConsumedEvent<typeof AgentContract>;
type AgentArgs = ProcessEventArgs<AgentState, AgentEvent, AgentEmitted>;
/** What the loop appends: each type the contract emits, its payload as the catalog spells it. */
type AgentEmitted = EmittedEventInput<typeof AgentContract>;
/** A settlement as the model reads it next — or null when the script returned nothing: the turn ends. */
declare function renderScriptSettlement(settlement: RunSettlement): string | null;
type AgentProcessorDeps = {
  /** The host's scope accessor: `itx.ai`, `itx.files`, `itx.whoami()` — the effects this loop
   *  reaches through the context, under its rules (a test lends a fake `itx.ai` there). */
  getItx: () => IterateContextApi & Disposable;
  /** The clock and the wait, injected only so a unit test can make the debounce instant. */
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
};
declare class AgentProcessor extends StreamProcessor<AgentState, AgentEvent> {
  #private;
  readonly contract: DefinedProcessorContract<z.ZodObject<{
    creation: z.ZodDefault<z.ZodNullable<z.ZodObject<{
      status: z.ZodEnum<{
        created: "created";
        failed: "failed";
        requested: "requested";
      }>;
      offset: z.ZodNumber;
    }, z.core.$strip>>>;
    deletion: z.ZodDefault<z.ZodNullable<z.ZodObject<{
      status: z.ZodEnum<{
        deleted: "deleted";
        requested: "requested";
      }>;
      offset: z.ZodNumber;
    }, z.core.$strip>>>;
    config: z.ZodPrefault<z.ZodObject<{
      llm: z.ZodPrefault<z.ZodObject<{
        model: z.ZodDefault<z.ZodString>;
      }, z.core.$strip>>;
      maxAutonomousTurns: z.ZodDefault<z.ZodNumber>;
      llmRequestExpiryMs: z.ZodDefault<z.ZodNumber>;
      llmRequestDebounceMs: z.ZodDefault<z.ZodNumber>;
      llmRequestRetryPolicy: z.ZodPrefault<z.ZodObject<{
        maxAttempts: z.ZodDefault<z.ZodNumber>;
        backoffBaseMs: z.ZodDefault<z.ZodNumber>;
        backoffMaxMs: z.ZodDefault<z.ZodNumber>;
      }, z.core.$strip>>;
    }, z.core.$strip>>;
    contextItems: z.ZodDefault<z.ZodArray<z.ZodObject<{
      offset: z.ZodNumber;
      role: z.ZodEnum<{
        assistant: "assistant";
        developer: "developer";
        system: "system";
        user: "user";
      }>;
      content: z.ZodString;
      actor: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"user">;
      }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"script">;
        requestOffset: z.ZodNumber;
      }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"agent">;
      }, z.core.$strip>], "type">>;
      llmRequestOffset: z.ZodOptional<z.ZodNumber>;
      files: z.ZodOptional<z.ZodArray<z.ZodObject<{
        contentType: z.ZodString;
        filename: z.ZodString;
        path: z.ZodString;
        size: z.ZodNumber;
      }, z.core.$strip>>>;
      from: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    pendingLlmRequestTrigger: z.ZodDefault<z.ZodNullable<z.ZodObject<{
      offset: z.ZodNumber;
      atMs: z.ZodNumber;
      source: z.ZodEnum<{
        "agent-loop": "agent-loop";
        external: "external";
      }>;
    }, z.core.$strip>>>;
    openRequest: z.ZodDefault<z.ZodNullable<z.ZodObject<{
      requestedAtOffset: z.ZodNumber;
      expiresAt: z.ZodNumber;
      model: z.ZodString;
      triggerSource: z.ZodEnum<{
        "agent-loop": "agent-loop";
        external: "external";
      }>;
    }, z.core.$strip>>>;
    consecutiveLlmFailures: z.ZodDefault<z.ZodNumber>;
    autonomousTurnCount: z.ZodDefault<z.ZodNumber>;
    lastActivityAt: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    paused: z.ZodDefault<z.ZodNullable<z.ZodObject<{
      reason: z.ZodString;
      atOffset: z.ZodNumber;
    }, z.core.$strip>>>;
  }, z.core.$strip>, {
    readonly "events.iterate.com/agent/create-requested": {
      readonly description: "Someone asked for this agent (`itx.agents.create(path)`). No payload: the context it lands on IS the agent. The collection writes the child's parent link `itx ⇒ itx.cd(creator)` before this request, the creator being the context whose `itx.agents` reached the collection, so the link is part of the birth and nothing re-points a born context. The processor lands created (with the default system prompt beside it) or create-failed; a request after a failure is a new attempt, one after the certificate a harmless fact.";
      readonly payloadSchema: z.ZodObject<{}, z.core.$strip>;
    };
    readonly "events.iterate.com/agent/created": {
      readonly description: "The birth certificate: on the agent's path, and cross-posted to / for the project catalog — hence it names the path.";
      readonly payloadSchema: z.ZodObject<{
        path: z.ZodString;
      }, z.core.$strip>;
    };
    readonly "events.iterate.com/agent/create-failed": {
      readonly description: "What the birth reported. Terminal until a new request.";
      readonly payloadSchema: z.ZodObject<{
        error: z.ZodString;
      }, z.core.$strip>;
    };
    readonly "events.iterate.com/agent/delete-requested": {
      readonly description: "Someone asked for this agent to go (`itx.agents.delete(path)`). No payload: the context it lands on IS the agent. Nothing to tear down — the processor lands deleted, and the loop runs no more turns from here on; a request after the certificate is a harmless fact.";
      readonly payloadSchema: z.ZodObject<{}, z.core.$strip>;
    };
    readonly "events.iterate.com/agent/deleted": {
      readonly description: "The death certificate: on the agent's path, and cross-posted to / for the project catalog, which drops the entry and keeps the death — hence it names the path. Terminal: a deleted agent is not re-creatable, and its facet is never hosted again.";
      readonly payloadSchema: z.ZodObject<{
        path: z.ZodString;
      }, z.core.$strip>;
    };
    readonly "events.iterate.com/agent/configured": {
      readonly description: "Merges a partial configuration into the agent's config; omitted keys keep their values.";
      readonly payloadSchema: z.ZodObject<{
        config: z.ZodObject<{
          llm: z.ZodOptional<z.ZodObject<{
            model: z.ZodOptional<z.ZodString>;
          }, z.core.$strip>>;
          maxAutonomousTurns: z.ZodOptional<z.ZodNumber>;
          llmRequestExpiryMs: z.ZodOptional<z.ZodNumber>;
          llmRequestDebounceMs: z.ZodOptional<z.ZodNumber>;
          llmRequestRetryPolicy: z.ZodOptional<z.ZodObject<{
            maxAttempts: z.ZodOptional<z.ZodNumber>;
            backoffBaseMs: z.ZodOptional<z.ZodNumber>;
            backoffMaxMs: z.ZodOptional<z.ZodNumber>;
          }, z.core.$strip>>;
        }, z.core.$strip>;
      }, z.core.$strip>;
    };
    readonly "events.iterate.com/agent/context-added": {
      readonly description: "Words into the model's context — the everyday event. A user or developer item raises the pending trigger unless its policy says not to; the assistant's own output carries llmRequestOffset.";
      readonly payloadSchema: z.ZodObject<{
        role: z.ZodEnum<{
          assistant: "assistant";
          developer: "developer";
          system: "system";
          user: "user";
        }>;
        content: z.ZodString;
        actor: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
          type: z.ZodLiteral<"user">;
        }, z.core.$strip>, z.ZodObject<{
          type: z.ZodLiteral<"script">;
          requestOffset: z.ZodNumber;
        }, z.core.$strip>, z.ZodObject<{
          type: z.ZodLiteral<"agent">;
        }, z.core.$strip>], "type">>;
        files: z.ZodOptional<z.ZodArray<z.ZodObject<{
          contentType: z.ZodString;
          filename: z.ZodString;
          path: z.ZodString;
          size: z.ZodNumber;
        }, z.core.$strip>>>;
        from: z.ZodOptional<z.ZodString>;
        llmRequestPolicy: z.ZodOptional<z.ZodObject<{
          behaviour: z.ZodEnum<{
            "after-current-request": "after-current-request";
            "dont-trigger-request": "dont-trigger-request";
            "interrupt-current-request": "interrupt-current-request";
          }>;
        }, z.core.$strip>>;
        llmRequestOffset: z.ZodOptional<z.ZodNumber>;
      }, z.core.$strip>;
    };
    readonly "events.iterate.com/agent/web-message-sent": {
      readonly description: "THE assistant-message fact: the markdown outside the tag, what a person is shown; llmRequestOffset names the answer it came from, and besideScript marks prose written beside a script, before its result.";
      readonly payloadSchema: z.ZodObject<{
        message: z.ZodString;
        llmRequestOffset: z.ZodOptional<z.ZodNumber>;
        besideScript: z.ZodOptional<z.ZodLiteral<true>>;
      }, z.core.$strip>;
    };
    readonly "events.iterate.com/agent/summary-updated": {
      readonly description: "The tag's status attribute as the live activity label — the platform's summary vocabulary, the one field this loop speaks.";
      readonly payloadSchema: z.ZodObject<{
        activity: z.ZodString;
      }, z.core.$strip>;
    };
    readonly "events.iterate.com/agent/llm-request-requested": {
      readonly description: "The loop recorded its intent to run the model for ONE trigger (the offset it names); the event's offset is the request's identity. An intent whose trigger has moved on is a harmless fact.";
      readonly payloadSchema: z.ZodObject<{
        model: z.ZodString;
        expiresAt: z.ZodNumber;
        triggerOffset: z.ZodNumber;
      }, z.core.$strip>;
    };
    readonly "events.iterate.com/agent/llm-response-frame": {
      readonly description: "EPHEMERAL, never stored: one coalescing window of the answer being written for the request it names — the text and the thinking it adds, which a feed appends to what it has shown. The settled event carries the durable text.";
      readonly ephemeral: true;
      readonly payloadSchema: z.ZodObject<{
        llmRequestOffset: z.ZodNumber;
        responseDelta: z.ZodString;
        thinkingDelta: z.ZodString;
        sequence: z.ZodNumber;
      }, z.core.$strip>;
    };
    readonly "events.iterate.com/agent/llm-request-settled": {
      readonly description: "The request's terminal fact: the model's text (and what it cost), its failure, its expiry, or the person's interruption — the two last with whatever streamed before.";
      readonly payloadSchema: z.ZodObject<{
        requestOffset: z.ZodNumber;
        durationMs: z.ZodOptional<z.ZodNumber>;
        result: z.ZodDiscriminatedUnion<[z.ZodObject<{
          status: z.ZodLiteral<"succeeded">;
          text: z.ZodString;
          usage: z.ZodOptional<z.ZodObject<{
            inputTokens: z.ZodNumber;
            outputTokens: z.ZodNumber;
            cachedInputTokens: z.ZodOptional<z.ZodNumber>;
            reasoningOutputTokens: z.ZodOptional<z.ZodNumber>;
          }, z.core.$strip>>;
        }, z.core.$strip>, z.ZodObject<{
          status: z.ZodLiteral<"failed">;
          errorMessage: z.ZodString;
          partialText: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
          status: z.ZodLiteral<"cancelled">;
          reason: z.ZodEnum<{
            expired: "expired";
            "interrupted-by-user-input": "interrupted-by-user-input";
          }>;
          partialText: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>], "status">;
      }, z.core.$strip>;
    };
    readonly "events.iterate.com/agent/token-usage-reported": {
      readonly description: "What the last successful request cost against the model's context window (the platform's vocabulary; a feed shows the context's fullness).";
      readonly payloadSchema: z.ZodObject<{
        model: z.ZodString;
        maxContextTokens: z.ZodNumber;
        inputTokens: z.ZodNumber;
        outputTokens: z.ZodNumber;
      }, z.core.$strip>;
    };
    readonly "events.iterate.com/agent/paused": {
      readonly description: "New turns stay parked until agent/resumed: a breaker tripped, or an operator paused.";
      readonly payloadSchema: z.ZodObject<{
        reason: z.ZodString;
        triggerOffset: z.ZodOptional<z.ZodNumber>;
      }, z.core.$strip>;
    };
    readonly "events.iterate.com/agent/resumed": {
      readonly description: "Turns run again; the breakers' counts start over.";
      readonly payloadSchema: z.ZodObject<{
        reason: z.ZodOptional<z.ZodString>;
      }, z.core.$strip>;
    };
  }, readonly ["events.iterate.com/agent/create-requested", "events.iterate.com/agent/created", "events.iterate.com/agent/create-failed", "events.iterate.com/agent/delete-requested", "events.iterate.com/agent/deleted", "events.iterate.com/agent/configured", "events.iterate.com/agent/context-added", "events.iterate.com/agent/llm-request-requested", "events.iterate.com/agent/llm-request-settled", "events.iterate.com/agent/paused", "events.iterate.com/agent/resumed", "events.iterate.com/itx/run-settled"], readonly [{
    events: {
      "events.iterate.com/itx/run-requested": {
        description: string;
        payloadSchema: z.ZodObject<{
          code: z.ZodString;
        }, z.core.$strip>;
      };
      "events.iterate.com/itx/run-settled": {
        description: string;
        payloadSchema: z.ZodObject<{
          requestOffset: z.ZodNumber;
          settlement: z.ZodDiscriminatedUnion<[z.ZodObject<{
            status: z.ZodLiteral<"succeeded">;
            result: z.ZodOptional<z.ZodUnknown>;
          }, z.core.$strip>, z.ZodObject<{
            status: z.ZodLiteral<"failed">;
            error: z.ZodString;
            failureKind: z.ZodEnum<{
              deadline: "deadline";
              interrupted: "interrupted";
              runtime: "runtime";
            }>;
          }, z.core.$strip>], "status">;
        }, z.core.$strip>;
      };
    };
  }], readonly ["events.iterate.com/agent/created", "events.iterate.com/agent/create-failed", "events.iterate.com/agent/deleted", "events.iterate.com/agent/context-added", "events.iterate.com/agent/web-message-sent", "events.iterate.com/agent/summary-updated", "events.iterate.com/agent/llm-request-requested", "events.iterate.com/agent/llm-response-frame", "events.iterate.com/agent/llm-request-settled", "events.iterate.com/agent/token-usage-reported", "events.iterate.com/agent/paused", "events.iterate.com/agent/resumed", "events.iterate.com/itx/run-requested"]>;
  private readonly deps;
  constructor(deps: AgentProcessorDeps);
  /** Every change the facts make is stamped with the event's time: `lastActivityAt` moves exactly
   *  when the state does, so a harmless fact (a late intent, a repeated certificate) never reorders
   *  the sidebar. */
  reduce(args: ReduceArgs<AgentState, AgentEvent>): AgentState | undefined;
  processEvent(args: AgentArgs): undefined;
}
//#endregion
export { renderScriptSettlement as a, renderCapabilityTree as i, buildChatMessages as n, raceAbort as r, AgentProcessor as t };
//# sourceMappingURL=processor-xCTbUrFU.d.mts.map