import { z } from "zod";
//#region src/call-client.ts
/** How often a live call says `keepalive`: the relay reaps a call after 60 s without device input,
*  and a caller who listens quietly sends none. */
const VOICE_CALL_KEEPALIVE_MS = 2e4;
/** A slow link drops microphone frames rather than queueing them: at most this many appends in
*  flight at once. */
const MAX_MIC_FRAMES_IN_FLIGHT = 5;
/** How long hanging up waits for a `call-ended` to come back through the subscription before it
*  ends it. The subscription delivers in log order, so once the echo is here every speaker frame
*  the relay wrote before the end has reached `onSpeakerFrame`. */
const HANG_UP_ECHO_MS = 2e3;
const SpeakerFrame = z.object({
	type: z.literal("events.iterate.com/voice-agent/speaker-frame"),
	payload: z.looseObject({
		activation: z.string(),
		pcm: z.string(),
		clearSpeakerBufferBeforeFrame: z.boolean().optional(),
		lastFrameOfAnswer: z.boolean().optional()
	})
});
/** The call's facts, as much of each payload as a caller reads (voice-agent.ts's contract and
*  iterate/agents' write them; their other fields pass through). */
const VoiceCallFact = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("events.iterate.com/voice-agent/call-started"),
		payload: z.looseObject({ conversationId: z.string() })
	}),
	z.object({
		type: z.literal("events.iterate.com/voice-agent/conversation-accepted"),
		payload: z.looseObject({
			handshakeTookMs: z.number(),
			upgradeTookMs: z.number()
		})
	}),
	z.object({
		type: z.literal("events.iterate.com/voice-agent/call-ended"),
		payload: z.looseObject({ reason: z.string() })
	}),
	z.object({
		type: z.literal("events.iterate.com/voice-agent/utterance-transcribed"),
		payload: z.looseObject({ text: z.string() })
	}),
	z.object({
		type: z.literal("events.iterate.com/voice-agent/answer-transcribed"),
		payload: z.looseObject({ text: z.string() })
	}),
	z.object({
		type: z.literal("events.iterate.com/agent/context-added"),
		payload: z.looseObject({
			role: z.string(),
			content: z.string(),
			llmRequestOffset: z.number().optional()
		})
	}),
	z.object({
		type: z.literal("events.iterate.com/voice-agent/provider-error-reported"),
		payload: z.looseObject({ message: z.string() })
	}),
	z.object({
		type: z.literal("events.iterate.com/voice-agent/provider-disconnected"),
		payload: z.looseObject({ reason: z.string() })
	})
]);
/** Place a call on `project` (a root whose `itx.voice` is installed). `client` names the caller
*  in the call's path (`web`, `cli`); `onSpeakerFrame` gets the answer's frames for this call,
*  `onFact` the call's facts, both in log order. Resolves once the press has landed and the
*  subscription is live. */
async function startVoiceCall(project, options) {
	const { client, onSpeakerFrame, onFact } = options;
	const activation = Array.from(crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");
	const streamPath = `/agents/voice/${client}/${(/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/[-:T]/g, "")}-${activation}`;
	const itx = project.cd(streamPath);
	const stats = {
		micFramesSent: 0,
		micFramesDropped: 0,
		micFramesFailed: 0,
		spkChunksReceived: 0,
		spkMsReceived: 0,
		handshakeMs: null
	};
	const callEnded = Promise.withResolvers();
	const [{ streamPath: settledPath }, subscription] = await Promise.all([project.voice.setupVoiceAgent({
		streamPath,
		activation
	}), itx.subscribe({
		name: `${client}-${activation}`,
		consumes: ["events.iterate.com/voice-agent/speaker-frame", ...VoiceCallFact.options.map((fact) => fact.shape.type.value)],
		target: (events) => {
			for (const event of events) {
				const frame = SpeakerFrame.safeParse(event);
				if (frame.success) {
					if (frame.data.payload.activation !== activation) continue;
					if (frame.data.payload.pcm) {
						stats.spkChunksReceived += 1;
						const bytes = Math.floor(frame.data.payload.pcm.replace(/=+$/, "").length * 3 / 4);
						stats.spkMsReceived += bytes / 32;
					}
					onSpeakerFrame(frame.data.payload);
					continue;
				}
				const fact = VoiceCallFact.safeParse(event);
				if (!fact.success) continue;
				if (fact.data.type === "events.iterate.com/voice-agent/conversation-accepted") stats.handshakeMs = fact.data.payload.handshakeTookMs;
				if (fact.data.type === "events.iterate.com/voice-agent/call-ended") callEnded.resolve();
				onFact(fact.data);
			}
		}
	})]);
	if (settledPath !== streamPath) throw new Error(`setupVoiceAgent answered ${settledPath} for ${streamPath}`);
	const inFlight = /* @__PURE__ */ new Set();
	let open = true;
	const keepalive = setInterval(() => {
		itx.append({
			type: "events.iterate.com/voice-agent/keepalive",
			ephemeral: true,
			payload: {}
		}).catch(() => void 0);
	}, VOICE_CALL_KEEPALIVE_MS);
	return {
		itx,
		streamPath,
		activation,
		stats,
		sendMicFrame(pcm) {
			if (!open) return false;
			if (inFlight.size >= MAX_MIC_FRAMES_IN_FLIGHT) {
				stats.micFramesDropped += 1;
				return false;
			}
			stats.micFramesSent += 1;
			const sent = itx.append({
				type: "events.iterate.com/voice-agent/mic-frame",
				ephemeral: true,
				payload: {
					activation,
					pcm
				}
			}).catch(() => {
				stats.micFramesFailed += 1;
			}).finally(() => inFlight.delete(sent));
			inFlight.add(sent);
			return true;
		},
		async hangUp(reason) {
			open = false;
			clearInterval(keepalive);
			await Promise.all(inFlight);
			if (await itx.append({
				type: "events.iterate.com/voice-agent/call-ended",
				payload: {
					activation,
					reason
				}
			}).then(() => true, () => false)) {
				let timer;
				await Promise.race([callEnded.promise, new Promise((resolve) => timer = setTimeout(resolve, HANG_UP_ECHO_MS))]);
				clearTimeout(timer);
			}
			try {
				subscription[Symbol.dispose]();
			} catch {}
		}
	};
}
//#endregion
export { VOICE_CALL_KEEPALIVE_MS, startVoiceCall };
