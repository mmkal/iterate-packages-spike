import { t as VoiceApi } from "./api-CORzUQ4D.mjs";
import { IterateConfigEntrypoint, StreamProcessorDurableObject } from "iterate/sdk";
import { z } from "zod";
import { ConsumedEvent, ProcessEventArgs, ReduceArgs, StreamProcessor } from "iterate/stream/processor";
//#region src/worker.d.ts
export default class VoiceWorker extends IterateConfigEntrypoint implements VoiceApi {
  health(): Promise<{
    ok: true;
    projectId: string;
  }>;
  /** Render to the resolution and pixel format advertised by the target. */
  setImage(rawInput: Parameters<VoiceApi["setImage"]>[0]): Promise<{
    shown: false;
    bytes: number;
    renderMs: number;
    transferMs: number;
    totalMs: number;
    width?: undefined;
    height?: undefined;
    format?: undefined;
  } | {
    shown: true;
    width: number;
    height: number;
    format: "gray4" | "mono1" | "rgb565";
    bytes: number;
    renderMs: number;
    transferMs: number;
    totalMs: number;
  }>;
  /** The press. `activation` is the device's call identity: the call starts under it at boot and
   * the microphone frames carry it. */
  setupVoiceAgent(options: Parameters<VoiceApi["setupVoiceAgent"]>[0]): Promise<{
    streamPath: string;
  }>;
}
//#endregion
//#region src/voice-agent.d.ts
/** A fold transcript turn: who spoke, and what the provider heard them say. */
interface TranscriptTurn {
  role: "listener" | "assistant";
  text: string;
}
/** Everything that outlives the Durable Object holding the socket. No queues, no byte counts, no
 * "is speaking" flag: reduced state that depends on a buffer no restart can replay is a lie. */
declare const VoiceState: z.ZodObject<{
  transcript: z.ZodDefault<z.ZodArray<z.ZodObject<{
    role: z.ZodEnum<{
      assistant: "assistant";
      listener: "listener";
    }>;
    text: z.ZodString;
  }, z.core.$strict>>>;
  call: z.ZodDefault<z.ZodNullable<z.ZodObject<{
    conversationId: z.ZodString;
    activation: z.ZodString;
    lastDeviceInputAtStreamMs: z.ZodNumber;
  }, z.core.$strip>>>;
  lastEnd: z.ZodDefault<z.ZodNullable<z.ZodObject<{
    activation: z.ZodString;
    reason: z.ZodString;
  }, z.core.$strip>>>;
}, z.core.$strip>;
/** What a client renders live (`itx.facets.get('voice-agent').liveSnapshot()` seeds it, the
 * `itx/live-state-changed` deltas keep it current): the fold plus the two runtime facts a page wants. */
type VoiceLiveView = {
  /** No call; a call whose provider dial is not ready; a live call; the last call's aftermath. */
  phase: "idle" | "dialing" | "live" | "ended";
  activation: string | null;
  /** The provider is speaking right now (the answer's frames are going to the device). */
  answering: boolean;
  transcript: TranscriptTurn[];
  lastEnd: {
    activation: string;
    reason: string;
  } | null;
};
declare const VoiceAgentContract: import("iterate/stream/contract").DefinedProcessorContract<z.ZodObject<{
  transcript: z.ZodDefault<z.ZodArray<z.ZodObject<{
    role: z.ZodEnum<{
      assistant: "assistant";
      listener: "listener";
    }>;
    text: z.ZodString;
  }, z.core.$strict>>>;
  call: z.ZodDefault<z.ZodNullable<z.ZodObject<{
    conversationId: z.ZodString;
    activation: z.ZodString;
    lastDeviceInputAtStreamMs: z.ZodNumber;
  }, z.core.$strip>>>;
  lastEnd: z.ZodDefault<z.ZodNullable<z.ZodObject<{
    activation: z.ZodString;
    reason: z.ZodString;
  }, z.core.$strip>>>;
}, z.core.$strip>, {
  readonly "events.iterate.com/voice-agent/keepalive": {
    readonly description: string;
    readonly ephemeral: true;
    readonly payloadSchema: z.ZodObject<{}, z.core.$strict>;
  };
  readonly "events.iterate.com/voice-agent/mic-frame": {
    readonly description: "One capture chunk of the call named by its activation.";
    readonly ephemeral: true;
    readonly payloadSchema: z.ZodObject<{
      activation: z.ZodString;
      pcm: z.ZodString;
    }, z.core.$loose>;
  };
  readonly "events.iterate.com/voice-agent/call-started": {
    readonly description: "The press opened the call: the device's activation and the conversation id derived from it.";
    readonly payloadSchema: z.ZodObject<{
      activation: z.ZodString;
      conversationId: z.ZodString;
    }, z.core.$loose>;
  };
  readonly "events.iterate.com/voice-agent/conversation-accepted": {
    readonly description: "The provider started the session; the call is live.";
    readonly payloadSchema: z.ZodObject<{
      activation: z.ZodString;
      conversationId: z.ZodString;
      handshakeTookMs: z.ZodNumber;
      upgradeTookMs: z.ZodNumber;
      heldMicFrames: z.ZodNumber;
    }, z.core.$loose>;
  };
  readonly "events.iterate.com/voice-agent/call-ended": {
    readonly description: "The call is over; the device appends it too (the hang-up button).";
    readonly payloadSchema: z.ZodObject<{
      activation: z.ZodString;
      reason: z.ZodString;
    }, z.core.$loose>;
  };
  readonly "events.iterate.com/voice-agent/provider-error-reported": {
    readonly description: "The provider reported an error, verbatim.";
    readonly payloadSchema: z.ZodObject<{
      conversationId: z.ZodString;
      message: z.ZodString;
    }, z.core.$loose>;
  };
  readonly "events.iterate.com/voice-agent/provider-disconnected": {
    readonly description: "The provider's session or socket closed under a live call.";
    readonly payloadSchema: z.ZodObject<{
      conversationId: z.ZodString;
      reason: z.ZodString;
    }, z.core.$loose>;
  };
  readonly "events.iterate.com/voice-agent/utterance-transcribed": {
    readonly description: "The provider's transcription of one finished listener turn.";
    readonly payloadSchema: z.ZodObject<{
      conversationId: z.ZodString;
      text: z.ZodString;
      key: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>;
  };
  readonly "events.iterate.com/voice-agent/answer-transcribed": {
    description: string;
    payloadSchema: z.ZodObject<{
      conversationId: z.ZodString;
      text: z.ZodString;
      key: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>;
  };
  readonly "events.iterate.com/voice-agent/speaker-frame": {
    readonly description: "One chunk of the answer, forwarded as it arrived.";
    readonly ephemeral: true;
    readonly payloadSchema: z.ZodObject<{
      activation: z.ZodString;
      conversationId: z.ZodString;
      pcm: z.ZodString;
      clearSpeakerBufferBeforeFrame: z.ZodOptional<z.ZodBoolean>;
      lastFrameOfAnswer: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$loose>;
  };
}, readonly ["events.iterate.com/agent/summary-updated", "events.iterate.com/agent/web-message-sent", "events.iterate.com/agent/paused", "events.iterate.com/voice-agent/call-started", "events.iterate.com/voice-agent/call-ended", "events.iterate.com/voice-agent/utterance-transcribed", "events.iterate.com/voice-agent/answer-transcribed", "events.iterate.com/voice-agent/mic-frame", "events.iterate.com/voice-agent/keepalive"], readonly [import("iterate/stream/contract").DefinedProcessorContract<z.ZodObject<{
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
}], readonly ["events.iterate.com/agent/created", "events.iterate.com/agent/create-failed", "events.iterate.com/agent/deleted", "events.iterate.com/agent/context-added", "events.iterate.com/agent/web-message-sent", "events.iterate.com/agent/summary-updated", "events.iterate.com/agent/llm-request-requested", "events.iterate.com/agent/llm-response-frame", "events.iterate.com/agent/llm-request-settled", "events.iterate.com/agent/token-usage-reported", "events.iterate.com/agent/paused", "events.iterate.com/agent/resumed", "events.iterate.com/itx/run-requested"]>], readonly ["events.iterate.com/voice-agent/conversation-accepted", "events.iterate.com/voice-agent/call-ended", "events.iterate.com/voice-agent/provider-error-reported", "events.iterate.com/voice-agent/provider-disconnected", "events.iterate.com/voice-agent/utterance-transcribed", "events.iterate.com/voice-agent/answer-transcribed", "events.iterate.com/voice-agent/speaker-frame"]>;
type VoiceAgentContract = typeof VoiceAgentContract;
type VoiceState = z.infer<typeof VoiceState>;
/** What the host injects; every wait and every clock in this file comes from here. */
type VoiceAgentDeps = {
  projectContext: () => Promise<string>;
  nowAtFacetMs(): number;
  /** The only way this processor waits, injected so tests can use a fake clock. */
  sleep(ms: number): Promise<void>;
  dialProvider(): Promise<WebSocket>;
  /** Hand words to the agent on this context through the agents app
   *  (`itx.agents.get(path).message(words)`), answered with the `context-added` it appended. */
  messageAgent(words: string): Promise<{
    offset: number;
  }>;
};
type VoiceArgs = ProcessEventArgs<VoiceState, ConsumedEvent<VoiceAgentContract>>;
declare class VoiceAgentProcessor extends StreamProcessor<VoiceState, ConsumedEvent<VoiceAgentContract>> {
  #private;
  readonly contract: import("iterate/stream/contract").DefinedProcessorContract<z.ZodObject<{
    transcript: z.ZodDefault<z.ZodArray<z.ZodObject<{
      role: z.ZodEnum<{
        assistant: "assistant";
        listener: "listener";
      }>;
      text: z.ZodString;
    }, z.core.$strict>>>;
    call: z.ZodDefault<z.ZodNullable<z.ZodObject<{
      conversationId: z.ZodString;
      activation: z.ZodString;
      lastDeviceInputAtStreamMs: z.ZodNumber;
    }, z.core.$strip>>>;
    lastEnd: z.ZodDefault<z.ZodNullable<z.ZodObject<{
      activation: z.ZodString;
      reason: z.ZodString;
    }, z.core.$strip>>>;
  }, z.core.$strip>, {
    readonly "events.iterate.com/voice-agent/keepalive": {
      readonly description: string;
      readonly ephemeral: true;
      readonly payloadSchema: z.ZodObject<{}, z.core.$strict>;
    };
    readonly "events.iterate.com/voice-agent/mic-frame": {
      readonly description: "One capture chunk of the call named by its activation.";
      readonly ephemeral: true;
      readonly payloadSchema: z.ZodObject<{
        activation: z.ZodString;
        pcm: z.ZodString;
      }, z.core.$loose>;
    };
    readonly "events.iterate.com/voice-agent/call-started": {
      readonly description: "The press opened the call: the device's activation and the conversation id derived from it.";
      readonly payloadSchema: z.ZodObject<{
        activation: z.ZodString;
        conversationId: z.ZodString;
      }, z.core.$loose>;
    };
    readonly "events.iterate.com/voice-agent/conversation-accepted": {
      readonly description: "The provider started the session; the call is live.";
      readonly payloadSchema: z.ZodObject<{
        activation: z.ZodString;
        conversationId: z.ZodString;
        handshakeTookMs: z.ZodNumber;
        upgradeTookMs: z.ZodNumber;
        heldMicFrames: z.ZodNumber;
      }, z.core.$loose>;
    };
    readonly "events.iterate.com/voice-agent/call-ended": {
      readonly description: "The call is over; the device appends it too (the hang-up button).";
      readonly payloadSchema: z.ZodObject<{
        activation: z.ZodString;
        reason: z.ZodString;
      }, z.core.$loose>;
    };
    readonly "events.iterate.com/voice-agent/provider-error-reported": {
      readonly description: "The provider reported an error, verbatim.";
      readonly payloadSchema: z.ZodObject<{
        conversationId: z.ZodString;
        message: z.ZodString;
      }, z.core.$loose>;
    };
    readonly "events.iterate.com/voice-agent/provider-disconnected": {
      readonly description: "The provider's session or socket closed under a live call.";
      readonly payloadSchema: z.ZodObject<{
        conversationId: z.ZodString;
        reason: z.ZodString;
      }, z.core.$loose>;
    };
    readonly "events.iterate.com/voice-agent/utterance-transcribed": {
      readonly description: "The provider's transcription of one finished listener turn.";
      readonly payloadSchema: z.ZodObject<{
        conversationId: z.ZodString;
        text: z.ZodString;
        key: z.ZodOptional<z.ZodString>;
      }, z.core.$loose>;
    };
    readonly "events.iterate.com/voice-agent/answer-transcribed": {
      description: string;
      payloadSchema: z.ZodObject<{
        conversationId: z.ZodString;
        text: z.ZodString;
        key: z.ZodOptional<z.ZodString>;
      }, z.core.$loose>;
    };
    readonly "events.iterate.com/voice-agent/speaker-frame": {
      readonly description: "One chunk of the answer, forwarded as it arrived.";
      readonly ephemeral: true;
      readonly payloadSchema: z.ZodObject<{
        activation: z.ZodString;
        conversationId: z.ZodString;
        pcm: z.ZodString;
        clearSpeakerBufferBeforeFrame: z.ZodOptional<z.ZodBoolean>;
        lastFrameOfAnswer: z.ZodOptional<z.ZodBoolean>;
      }, z.core.$loose>;
    };
  }, readonly ["events.iterate.com/agent/summary-updated", "events.iterate.com/agent/web-message-sent", "events.iterate.com/agent/paused", "events.iterate.com/voice-agent/call-started", "events.iterate.com/voice-agent/call-ended", "events.iterate.com/voice-agent/utterance-transcribed", "events.iterate.com/voice-agent/answer-transcribed", "events.iterate.com/voice-agent/mic-frame", "events.iterate.com/voice-agent/keepalive"], readonly [import("iterate/stream/contract").DefinedProcessorContract<z.ZodObject<{
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
  }], readonly ["events.iterate.com/agent/created", "events.iterate.com/agent/create-failed", "events.iterate.com/agent/deleted", "events.iterate.com/agent/context-added", "events.iterate.com/agent/web-message-sent", "events.iterate.com/agent/summary-updated", "events.iterate.com/agent/llm-request-requested", "events.iterate.com/agent/llm-response-frame", "events.iterate.com/agent/llm-request-settled", "events.iterate.com/agent/token-usage-reported", "events.iterate.com/agent/paused", "events.iterate.com/agent/resumed", "events.iterate.com/itx/run-requested"]>], readonly ["events.iterate.com/voice-agent/conversation-accepted", "events.iterate.com/voice-agent/call-ended", "events.iterate.com/voice-agent/provider-error-reported", "events.iterate.com/voice-agent/provider-disconnected", "events.iterate.com/voice-agent/utterance-transcribed", "events.iterate.com/voice-agent/answer-transcribed", "events.iterate.com/voice-agent/speaker-frame"]>;
  private readonly deps;
  constructor(deps: VoiceAgentDeps);
  reduce({ state, event }: ReduceArgs<VoiceState, ConsumedEvent<VoiceAgentContract>>): {
    transcript: {
      role: "assistant" | "listener";
      text: string;
    }[];
    call: {
      conversationId: string;
      activation: string;
      lastDeviceInputAtStreamMs: number;
    } | null;
    lastEnd: {
      activation: string;
      reason: string;
    } | null;
  };
  /** The engine publishes this after every batch — twenty microphone batches a second during a
   * call, so the runtime facts (dial ready, answer speaking) reach the page within a frame. */
  projectLiveState(state: VoiceState): VoiceLiveView;
  processEvent(args: VoiceArgs): undefined;
}
/** The class the loader hosts: `facets.get("voice-agent", { source, className: "VoiceAgentDurableObject" })`. */
export declare class VoiceAgentDurableObject extends StreamProcessorDurableObject<VoiceState> {
  #private;
  processor: VoiceAgentProcessor;
}
//#endregion
export type { VoiceApi };