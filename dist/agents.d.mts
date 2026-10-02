import { C as StreamEvent, T as StreamProcessor, c as ProcessorState, n as DefinedProcessorContract, t as ConsumedEvent, v as ReduceArgs } from "./contract-D1J6d08G.mjs";
import { r as AgentState } from "./contract-DtO5-VNU.mjs";
import { j as IterateContextApi } from "./api-DYAY3SD8.mjs";
import { s as StreamProcessorDurableObject } from "./index-BdjwKrd-.mjs";
import { t as AgentProcessor } from "./processor-xCTbUrFU.mjs";
import { RpcTarget } from "cloudflare:workers";
import { z } from "zod";
//#region src/agents/api.d.ts
/** What `agents.get(path).message(input)` takes: the words, or the words with attachments (each
 *  stored under the agent's path in `itx.files` and named on the event). */
type AgentMessageInput = string | {
  message: string;
  files?: {
    contentType: string;
    filename: string;
    data: Uint8Array | ArrayBuffer | string;
  }[];
};
/** `itx.agents.get(path)`: one agent. Anything else on its context is a plain
 *  `itx.cd(path).append(…)`, stamped with where it came from. */
interface AgentHandleApi {
  /** A person's words: ONE `events.iterate.com/agent/context-added`, the trigger of the agent's
   *  next turn, answered so a caller can wait for what follows it. Sent from another agent, the model reads them as `[from <sender's context>]` — the collection's base, which
   *  the sender's own `itx.agents` row pins (collection.ts); from anywhere else they read as a
   *  person's. A deleted agent, or one never created, refuses. */
  message(input: AgentMessageInput): Promise<StreamEvent>;
}
/** `itx.agents` — installed by rewrite rule on the project's root and on each agent's context.
 *  `create` and `delete` are sagas on the agent's path (a deleted agent is not re-creatable). */
interface AgentsApi {
  list(): Promise<{
    path: string;
    createdAt: string;
  }[]>;
  get(path: string): AgentHandleApi;
  create(path: string): Promise<{
    path: string;
  }>;
  delete(path: string): Promise<{
    path: string;
  }>;
}
declare module "iterate/api" {
  interface InstalledAppRoots {
    agents: AgentsApi;
  }
}
//#endregion
//#region src/agents/collection.d.ts
/** `itx.agents` (api.ts `AgentsApi`) over one base: the root's at `/`, an agent's own at its
 *  path (`at(base)`, catalog.ts). */
declare class AgentCollectionRpcTarget extends RpcTarget implements AgentsApi {
  private readonly getItx;
  private readonly catalog;
  private readonly base;
  constructor(getItx: () => IterateContextApi & Disposable, catalog: () => Promise<AgentCatalogState>, base?: string);
  get(path: string): AgentReference;
  /** Every agent born under the project, by path — the certificates cross-posted to `/`, folded. */
  list(): Promise<{
    path: string;
    createdAt: string;
  }[]>;
  /** Bring the agent at `path` into being: the `agent` processor row on that path, then
   *  `agent/create-requested`, then the terminal fact — `agent/created` (in the catalog by then), or
   *  `agent/create-failed`, thrown; a later call is a new attempt. Idempotent: a created agent answers
   *  at once, and a creation already open is WAITED ON, never requested again — the terminal is
   *  sought after the request that opened it, so a certificate landing between the read and the
   *  wait is seen, not missed. A deleted agent is not re-creatable: thrown. Data back, never the
   *  handle: `itx.agents.get(path)` addresses it. */
  create(path: string): Promise<{
    path: string;
  }>;
  /** Take the agent at `path` out of being: `agent/delete-requested` on that path, then the death
   *  certificate — `agent/deleted` (gone from the catalog by then; the loop runs no more turns) —
   *  then the `agent` processor row goes, and the facet with it, storage included. Idempotent: a
   *  deleted agent answers at once, and a deletion already open is WAITED ON, never requested again
   *  — the certificate is sought after the request that opened it, so one landing between the read
   *  and the wait is seen, not missed. An agent never created has nothing to delete: thrown.
   *  Terminal: a deleted agent is not re-creatable. */
  delete(path: string): Promise<{
    path: string;
  }>;
}
/** `itx.agents.get(path)` (api.ts `AgentHandleApi`): the agent at one path, reached from the
 *  collection's base. */
declare class AgentReference extends RpcTarget implements AgentHandleApi {
  private readonly getItx;
  private readonly path;
  private readonly catalog;
  private readonly base;
  constructor(getItx: () => IterateContextApi & Disposable, path: string, catalog: () => Promise<AgentCatalogState>, base: string);
  /** A person's words: a dead agent refuses from the catalog (the header: its facet is never hosted
   *  again); a live one's words go to the facet its context's `agent` row hosts, by NAME — never by
   *  spec, so no facet is hosted for an agent that has none. NO_FACET is then a context without an
   *  `agent` row: never born, dead since, or a live agent without its row, which only `create` binds
   *  again — each refused. The facet appends them, so they are stamped with the agent's own path;
   *  the sender rides beside them as the base, which the sender's own `itx.agents` row pins
   *  (`itx.cd('/').agents.at(<sender>)`, written by `create`) — `/` for every context that reaches
   *  the root's collection, which the fold reads as a person (processor.ts). */
  message(input: Parameters<AgentHandleApi["message"]>[0]): Promise<StreamEvent>;
}
//#endregion
//#region src/agents/catalog.d.ts
declare const AgentCatalogContract: DefinedProcessorContract<z.ZodObject<{
  agents: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
    createdAt: z.ZodString;
  }, z.core.$strip>>>;
  deleted: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
    deletedAt: z.ZodString;
  }, z.core.$strip>>>;
}, z.core.$strip>, {}, readonly ["events.iterate.com/agent/created", "events.iterate.com/agent/deleted"], readonly [DefinedProcessorContract<z.ZodObject<{
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
}], readonly ["events.iterate.com/agent/created", "events.iterate.com/agent/create-failed", "events.iterate.com/agent/deleted", "events.iterate.com/agent/context-added", "events.iterate.com/agent/web-message-sent", "events.iterate.com/agent/summary-updated", "events.iterate.com/agent/llm-request-requested", "events.iterate.com/agent/llm-response-frame", "events.iterate.com/agent/llm-request-settled", "events.iterate.com/agent/token-usage-reported", "events.iterate.com/agent/paused", "events.iterate.com/agent/resumed", "events.iterate.com/itx/run-requested"]>], readonly []>;
type AgentCatalogState = ProcessorState<typeof AgentCatalogContract>;
declare class AgentCatalogProcessor extends StreamProcessor<AgentCatalogState, ConsumedEvent<typeof AgentCatalogContract>> {
  readonly contract: DefinedProcessorContract<z.ZodObject<{
    agents: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
      createdAt: z.ZodString;
    }, z.core.$strip>>>;
    deleted: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
      deletedAt: z.ZodString;
    }, z.core.$strip>>>;
  }, z.core.$strip>, {}, readonly ["events.iterate.com/agent/created", "events.iterate.com/agent/deleted"], readonly [DefinedProcessorContract<z.ZodObject<{
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
  }], readonly ["events.iterate.com/agent/created", "events.iterate.com/agent/create-failed", "events.iterate.com/agent/deleted", "events.iterate.com/agent/context-added", "events.iterate.com/agent/web-message-sent", "events.iterate.com/agent/summary-updated", "events.iterate.com/agent/llm-request-requested", "events.iterate.com/agent/llm-response-frame", "events.iterate.com/agent/llm-request-settled", "events.iterate.com/agent/token-usage-reported", "events.iterate.com/agent/paused", "events.iterate.com/agent/resumed", "events.iterate.com/itx/run-requested"]>], readonly []>;
  /** A certificate counts only from the agent it names: each agent writes its own on `/`
   *  (processor.ts), and the platform stamps where it came from (core/os caller.ts `stampCaller`),
   *  so one any other context appends is ignored — anyone may append anywhere, and a forged death
   *  would refuse the agent's every message for good. */
  reduce({ state, event }: ReduceArgs<AgentCatalogState, ConsumedEvent<typeof AgentCatalogContract>>): {
    deleted: Record<string, {
      deletedAt: string;
    }>;
    agents: {
      [x: string]: {
        createdAt: string;
      } | {
        createdAt: string;
      };
    };
  } | undefined;
}
/** The agents app's collection facet — what the `itx.agents` rule names (install.ts): the
 *  published `AgentsApi` (api.ts) at the project's root, plus `at(base)`, the collection an agent's
 *  own `itx.agents` rule reaches. */
export declare class AgentCollectionDurableObject extends StreamProcessorDurableObject<AgentCatalogState> implements AgentsApi {
  #private;
  /** The processor's reads, and `itx.agents`: the collection's verbs and `at(base)` (collection.ts). */
  static publicMethods: string[];
  processor: AgentCatalogProcessor;
  at(base: string): AgentCollectionRpcTarget;
  list(): Promise<{
    path: string;
    createdAt: string;
  }[]>;
  get(path: string): AgentHandleApi;
  create(path: string): Promise<{
    path: string;
  }>;
  delete(path: string): Promise<{
    path: string;
  }>;
}
//#endregion
//#region src/agents/durable-object.d.ts
export declare class AgentDurableObject extends StreamProcessorDurableObject<AgentState> implements Pick<AgentHandleApi, "message"> {
  #private;
  /** The processor's reads, and a person's words (`message`) — `itx.agents.get(path).message(…)`
   *  reaches it through the collection (collection.ts). */
  static publicMethods: string[];
  processor: AgentProcessor;
  /** A person's words: ONE `context-added`, the trigger of the next turn — with their attachments,
   *  each stored first under this agent's path (`itx.files`, `<path>/<8 of a uuid>-<name>`)
   *  and named on the event; an image among them is what the model will see. `from` is the
   *  collection's base, which it relays as the sender (collection.ts `AgentReference.message`). The
   *  event is answered so a caller can wait for what follows it. */
  message(input: Parameters<AgentHandleApi["message"]>[0], from?: string): Promise<StreamEvent>;
}
//#endregion
export type { AgentHandleApi, AgentMessageInput, AgentsApi };
//# sourceMappingURL=agents.d.mts.map