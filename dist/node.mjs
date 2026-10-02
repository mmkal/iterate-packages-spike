import { a as withTimeout } from "./lib-CUg6cRWv.mjs";
import { newWebSocketRpcSession } from "capnweb";
import WebSocket from "ws";
//#region src/node.ts
/** THE CONNECTION'S HEARTBEAT: a WebSocket ping every `intervalMs`, which the edge answers without
*  the Worker. A connection that answers none for `deadAfterMs` is dead and is terminated, so
*  `closed` resolves and its owner can reconnect. A network that vanishes without a close — a
*  laptop asleep, a NAT mapping expired — otherwise leaves a socket that never sends, never
*  receives and never closes: on 2026-09-25 an idle `iterate tunnel` sat 55 minutes behind a
*  carrier NAT that had dropped its mapping, its visitors hanging, the CLI unaware. The pings are
*  also the traffic that keeps such a mapping from expiring. */
const HEARTBEAT = {
	intervalMs: 15e3,
	deadAfterMs: 45e3
};
async function connectIterate(input) {
	const url = new URL("/api", input.baseUrl);
	if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Iterate URL must use http or https.");
	url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	const socket = new WebSocket(url.href, { handshakeTimeout: 15e3 });
	const root = newWebSocketRpcSession(socket);
	const heartbeat = input.heartbeat || HEARTBEAT;
	let lastPongAt = Date.now();
	let dead = "";
	socket.on("pong", () => lastPongAt = Date.now());
	const pinger = setInterval(() => {
		if (socket.readyState !== WebSocket.OPEN) return;
		if (Date.now() - lastPongAt < heartbeat.deadAfterMs) return socket.ping();
		dead = `no answer to a WebSocket ping for ${heartbeat.deadAfterMs / 1e3} s`;
		socket.terminate();
	}, heartbeat.intervalMs);
	pinger.unref();
	const closed = new Promise((resolve) => {
		socket.once("close", (code, reason) => {
			clearInterval(pinger);
			resolve({
				code,
				reason: dead || reason.toString()
			});
		});
	});
	socket.on("error", () => {});
	try {
		const session = await withTimeout(root.authenticate(input.auth), 2e4, "Iterate authentication");
		return {
			session,
			closed,
			[Symbol.dispose]() {
				try {
					session[Symbol.dispose]();
				} finally {
					try {
						root[Symbol.dispose]();
					} finally {
						socket.close();
					}
				}
			}
		};
	} catch (error) {
		try {
			root[Symbol.dispose]();
		} finally {
			socket.terminate();
		}
		throw error;
	}
}
//#endregion
export { connectIterate };

//# sourceMappingURL=node.mjs.map