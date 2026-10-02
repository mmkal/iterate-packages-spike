import { t as VoiceApi } from "./api-CORzUQ4D.mjs";
import { z } from "zod";
import { IterateContextApi } from "iterate/api";
//#region src/call-client.d.ts
/** How often a live call says `keepalive`: the relay reaps a call after 60 s without device input,
 *  and a caller who listens quietly sends none. */
export declare const VOICE_CALL_KEEPALIVE_MS = 20000;
/** One chunk of the answer as the relay wrote it: 16 kHz mono PCM16, base64 (empty on a frame that
 *  only marks the answer's end). */
export type VoiceCallSpeakerFrame = {
  pcm: string;
  /** Throw away everything queued, then play this frame. */
  clearSpeakerBufferBeforeFrame?: boolean;
  /** Nothing more is coming for this answer. */
  lastFrameOfAnswer?: boolean;
};
/** The call's facts, as much of each payload as a caller reads (voice-agent.ts's contract and
 *  iterate/agents' write them; their other fields pass through). */
declare const VoiceCallFact: z.ZodDiscriminatedUnion<[z.ZodObject<{
  type: z.ZodLiteral<"events.iterate.com/voice-agent/call-started">;
  payload: z.ZodObject<{
    conversationId: z.ZodString;
  }, z.core.$loose>;
}, z.core.$strip>, z.ZodObject<{
  type: z.ZodLiteral<"events.iterate.com/voice-agent/conversation-accepted">;
  payload: z.ZodObject<{
    handshakeTookMs: z.ZodNumber;
    upgradeTookMs: z.ZodNumber;
  }, z.core.$loose>;
}, z.core.$strip>, z.ZodObject<{
  type: z.ZodLiteral<"events.iterate.com/voice-agent/call-ended">;
  payload: z.ZodObject<{
    reason: z.ZodString;
  }, z.core.$loose>;
}, z.core.$strip>, z.ZodObject<{
  type: z.ZodLiteral<"events.iterate.com/voice-agent/utterance-transcribed">;
  payload: z.ZodObject<{
    text: z.ZodString;
  }, z.core.$loose>;
}, z.core.$strip>, z.ZodObject<{
  type: z.ZodLiteral<"events.iterate.com/voice-agent/answer-transcribed">;
  payload: z.ZodObject<{
    text: z.ZodString;
  }, z.core.$loose>;
}, z.core.$strip>, z.ZodObject<{
  type: z.ZodLiteral<"events.iterate.com/agent/context-added">;
  payload: z.ZodObject<{
    role: z.ZodString;
    content: z.ZodString;
    llmRequestOffset: z.ZodOptional<z.ZodNumber>;
  }, z.core.$loose>;
}, z.core.$strip>, z.ZodObject<{
  type: z.ZodLiteral<"events.iterate.com/voice-agent/provider-error-reported">;
  payload: z.ZodObject<{
    message: z.ZodString;
  }, z.core.$loose>;
}, z.core.$strip>, z.ZodObject<{
  type: z.ZodLiteral<"events.iterate.com/voice-agent/provider-disconnected">;
  payload: z.ZodObject<{
    reason: z.ZodString;
  }, z.core.$loose>;
}, z.core.$strip>], "type">;
type VoiceCallFact = z.infer<typeof VoiceCallFact>;
/** What this client saw of the call, counted here because the relay cannot see the last hop. */
export type VoiceCallStats = {
  micFramesSent: number;
  /** Frames offered while five appends were still in flight (a slow link). */
  micFramesDropped: number;
  /** Frames whose append failed. */
  micFramesFailed: number;
  spkChunksReceived: number;
  spkMsReceived: number;
  handshakeMs: number | null;
};
export type VoiceCall<Context> = {
  /** The call's own context: what a live-state view subscribes to, and where a caller appends
   *  anything else the call carries. */
  itx: Context;
  streamPath: string;
  activation: string;
  stats: VoiceCallStats;
  /** Append one microphone frame (16 kHz mono PCM16, base64) without waiting for it; false when
   *  the link is too slow and the frame was dropped. */
  sendMicFrame(pcm: string): boolean;
  /** Stop the microphone and the keepalive, wait for the frames in flight, append `call-ended`
   *  with `reason`, wait (at most 2 s) for the answer's last frames to arrive, and end the
   *  subscription. */
  hangUp(reason: string): Promise<void>;
};
/** Place a call on `project` (a root whose `itx.voice` is installed). `client` names the caller
 *  in the call's path (`web`, `cli`); `onSpeakerFrame` gets the answer's frames for this call,
 *  `onFact` the call's facts, both in log order. Resolves once the press has landed and the
 *  subscription is live. */
export declare function startVoiceCall<Context extends Pick<IterateContextApi, "subscribe" | "append">>(project: {
  voice: Pick<VoiceApi, "setupVoiceAgent">;
  cd(path: string): Context;
}, options: {
  client: string;
  onSpeakerFrame(frame: VoiceCallSpeakerFrame): void;
  onFact(fact: VoiceCallFact): void;
}): Promise<VoiceCall<Context>>;
//#endregion
export { VoiceCallFact };