import { OAuthScopes } from "./oauth-scopes.mjs";
import { newWebSocketRpcSession } from "capnweb";
//#region src/client/socket.ts
/** Open a WebSocket, trying again for a while when the connection fails: a phone waking up, a
*  tunnel flapping, a cold edge — the things a first attempt trips over. Resolves with the socket
*  once it is OPEN; rejects with the last failure after the last attempt. The delays are the
*  waits BETWEEN attempts (the first is immediate).
*
*  Every failed attempt is explained, never swallowed (docs/engineering-invariants.md): the error
*  names the close code and reason the socket closed with before it opened, and each attempt that
*  is tried again logs a `client.platform-failure-socket-open` warn first. The upgrade's HTTP status
*  is not among them: the WebSocket API never exposes the handshake's response (a refused upgrade
*  is a close 1006, by design — https://websockets.spec.whatwg.org/#feedback-from-the-protocol),
*  so a non-standard `ErrorEvent.error` (Node's undici names "non-101 status code" there) is added
*  when the runtime gives one. */
const RETRY_DELAYS_MS = [
	250,
	500,
	1e3,
	2e3,
	4e3,
	8e3
];
/** How long one attempt may take to open. A handshake that neither opens nor closes is a failed
*  attempt too, closed and tried again like any other: without a bound the page waits on it for as
*  long as the browser does, behind a spinner that never ends (a Dash spec sat 30 s after its
*  sign-in's `POST /api` answered, with no `/api` upgrade ever reaching the Worker, 2026-09-24).
*  A healthy upgrade opens in well under a second. */
const HANDSHAKE_TIMEOUT_MS = 1e4;
function openSocketWithRetry(url, options = {}) {
	const delays = options.delaysMs || RETRY_DELAYS_MS;
	const handshakeTimeoutMs = options.handshakeTimeoutMs ?? HANDSHAKE_TIMEOUT_MS;
	const Socket = options.WebSocket || WebSocket;
	const sleep = options.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
	const once = () => new Promise((resolve, reject) => {
		const socket = new Socket(url);
		let cause = "";
		const timeout = setTimeout(() => {
			settle();
			socket.close();
			reject(/* @__PURE__ */ new Error(`WebSocket did not open in ${handshakeTimeoutMs} ms`));
		}, handshakeTimeoutMs);
		function settle() {
			clearTimeout(timeout);
			socket.removeEventListener("open", opened);
			socket.removeEventListener("close", failed);
			socket.removeEventListener("error", errored);
		}
		function errored(event) {
			const error = event.error;
			if (error instanceof Error) cause = ` (${error.message})`;
		}
		function opened() {
			settle();
			resolve(socket);
		}
		function failed(event) {
			settle();
			reject(/* @__PURE__ */ new Error(`WebSocket connection failed: closed ${event.code}${event.reason ? ` "${event.reason}"` : ""} before it opened${cause}`));
		}
		socket.addEventListener("open", opened, { once: true });
		socket.addEventListener("error", errored);
		socket.addEventListener("close", failed, { once: true });
	});
	return (async () => {
		for (let attempt = 1;; attempt++) try {
			return await once();
		} catch (error) {
			const delay = delays[attempt - 1];
			if (delay === void 0) throw error;
			console.warn({
				event: "client.platform-failure-socket-open",
				url: String(url),
				attempt,
				attempts: delays.length + 1,
				retryInMs: delay,
				message: error.message
			});
			await sleep(delay);
		}
	})();
}
//#endregion
//#region src/app.ts
/** The browser leaves for the issuer's login (a document navigation) and this never settles — no
*  framework in the loop: a TanStack `beforeLoad` awaiting it ends the way a thrown
*  `redirect({ reloadDocument: true })` did, a plain page simply navigates. */
function leaveForLogin(login) {
	window.location.assign(login);
	return new Promise(() => {});
}
function connectionOn(socket) {
	const iterate = newWebSocketRpcSession(socket);
	return {
		api: iterate.authenticate({ type: "from-server-cookie" }),
		socket,
		dispose: () => iterate[Symbol.dispose]()
	};
}
/** Create once per app — a TanStack route's client-only `beforeLoad`, or a plain page's entry.
*  Every loader and action of the page shares the returned public RPC session.
*
*  Connecting tries for a while (client/socket.ts: ≈16 s of attempts) before an error reaches the
*  page — a phone waking up or a flapping tunnel is not a reason to show "connection failed". And
*  the `api` the page holds is a proxy to the CURRENT connection: when the socket closes, the next
*  call opens a fresh one and pipelines onto it, so a dropped connection costs a reconnect, not the
*  page. A reconnect the platform refuses (the session ended elsewhere) rejects that call; the
*  page's retry runs `authenticate` again — a fresh one, the socket's close forgot the last — whose
*  probe sends the browser to log in. */
function createIterateClient(options = {}) {
	const scopes = OAuthScopes.parse(options.scopes || []);
	let live = null;
	let connecting;
	const socketUrl = () => {
		const url = new URL("/api", window.location.href);
		url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
		return url;
	};
	/** Adopt a connection as the live one until its socket closes. A close also forgets the settled
	*  `authenticate` — the next one probes `/api` again, so a session that ended elsewhere sends the
	*  browser to log in instead of a retry that can only fail. */
	function adopt(socket) {
		const connection = connectionOn(socket);
		live = connection;
		const forget = () => {
			if (live !== connection) return;
			live = null;
			connecting = void 0;
		};
		const dispose = () => {
			forget();
			connection.dispose();
		};
		socket.addEventListener("close", () => {
			forget();
			window.removeEventListener("pagehide", dispose);
		}, { once: true });
		window.addEventListener("pagehide", dispose, { once: true });
		return connection;
	}
	const api = new Proxy({}, { get(_target, property) {
		const connection = live || adopt(new WebSocket(socketUrl()));
		return Reflect.get(connection.api, property);
	} });
	const loginUrl = (params) => `/.auth/login?${new URLSearchParams({
		scope: scopes.join(" "),
		...params
	})}`;
	async function connect(next) {
		const login = loginUrl({ next });
		const probe = await fetch("/api", {
			method: "POST",
			body: "",
			signal: AbortSignal.timeout(1e4)
		});
		await probe.body?.cancel();
		if (probe.status === 401) return leaveForLogin(login);
		if (!probe.ok) throw new Error(`iterate is unavailable (${probe.status}). Please retry.`);
		if (!live) adopt(await openSocketWithRetry(socketUrl()));
		const info = await api.info();
		return {
			api,
			info,
			signInFor: (project) => leaveForLogin(loginUrl({
				next: window.location.href,
				project
			}))
		};
	}
	return { authenticate(next = "/") {
		connecting ||= connect(next).catch((error) => {
			connecting = void 0;
			throw error;
		});
		return connecting;
	} };
}
//#endregion
export { createIterateClient };

//# sourceMappingURL=app.mjs.map