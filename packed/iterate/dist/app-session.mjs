import { isLocalOrigin } from "./lib.mjs";
import { t as _usingCtx } from "./usingCtx-5QB_oFRV.mjs";
import { OAuthScopes } from "./oauth-scopes.mjs";
import { authorizationCodeRequest, authorizationServer } from "./oauth.mjs";
import { DurableObject } from "cloudflare:workers";
import { z } from "zod";
import { newHttpBatchRpcSession } from "capnweb";
import * as oauth from "oauth4webapi";
//#region src/app-session.ts
/** Each app binds this same class. Token exchange and logout use the issuer's
* public protocol, so separately deployed apps need no platform bindings.
* The input gate serializes refresh and logout across tabs. */
var BrowserSession = class extends DurableObject {
	begin(host, next) {
		return this.#serial(async () => {
			if (await this.ctx.storage.get("session")) throw new Error("Browser session already exists");
			const origin = new URL(host.origin);
			const local = isLocalOrigin(host.origin);
			if (origin.protocol !== "https:" && !local) throw new Error("Browser login requires HTTPS");
			let clientId = host.client?.id || `${host.origin}/.auth/client.json`;
			if (local) {
				const response = await fetch(`${host.issuer}/oauth2/register`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						client_name: host.client?.name || origin.host,
						client_uri: host.origin,
						logo_uri: host.client?.logoUri,
						redirect_uris: [`${host.origin}/.auth/callback`],
						token_endpoint_auth_method: "none",
						grant_types: ["authorization_code", "refresh_token"],
						response_types: ["code"]
					}),
					signal: AbortSignal.timeout(1e4)
				});
				if (!response.ok) throw new Error(`Local client registration failed (${response.status})`);
				clientId = z.object({ client_id: z.string().min(1) }).parse(await response.json()).client_id;
			}
			const { url, state, verifier } = await authorizationCodeRequest({
				issuer: host.issuer,
				clientId,
				redirectUri: `${host.origin}/.auth/callback`,
				resources: [host.resource],
				scopes: host.scopes
			});
			const data = {
				...host,
				next,
				clientId,
				phase: "pending",
				state,
				verifier,
				until: Date.now() + 6e5
			};
			await this.ctx.storage.put("session", data);
			await this.ctx.storage.setAlarm(data.until);
			return url.href;
		});
	}
	/** The issuer's redirect back to `/.auth/callback`, its query string. oauth4webapi validates it
	*  (the state matches this browser's pending flow, the `iss` matches the issuer, no `error`), then
	*  exchanges the code for tokens. */
	complete(callbackQuery) {
		return this.#serial(async () => {
			const data = await this.ctx.storage.get("session");
			if (!data || data.phase !== "pending" || data.until <= Date.now()) return { error: "This sign-in expired or does not match this browser. Start sign-in again." };
			const as = authorizationServer(data.issuer);
			const client = { client_id: data.clientId };
			let callback;
			try {
				callback = oauth.validateAuthResponse(as, client, new URLSearchParams(callbackQuery), data.state);
			} catch (error) {
				if (error instanceof oauth.AuthorizationResponseError) {
					await this.#clear();
					return { error: "Authorization was declined." };
				}
				return { error: "This sign-in expired or does not match this browser. Start sign-in again." };
			}
			const started = Date.now();
			let tokens;
			try {
				const response = await oauth.authorizationCodeGrantRequest(as, client, oauth.None(), callback, `${data.origin}/.auth/callback`, data.verifier, this.#tokenOptions(data));
				tokens = await oauth.processAuthorizationCodeResponse(as, client, response);
			} catch (error) {
				await this.#endOnDeadGrant(error);
				return { error: "Sign-in could not complete. Start sign-in again." };
			}
			await this.#activate(data, tokens, started);
			return { next: data.next };
		});
	}
	bearer() {
		return this.#serial(() => this.#bearer());
	}
	/** THE ISSUER THIS SESSION IS BOUND TO and the resource its tokens are for — written once at
	*  `begin`, never steered by a request: the app's `/api` proxy, its login probe and its logout read
	*  them from here, so a browser connected to one issuer can only ever spend its credential there.
	*  Null when no session was begun. */
	async host() {
		const data = await this.ctx.storage.get("session");
		return data ? {
			issuer: data.issuer,
			resource: data.resource
		} : null;
	}
	async scopes() {
		const data = await this.ctx.storage.get("session");
		return data?.phase === "active" ? data.scopes : [];
	}
	/** Public client metadata chosen by the app before consent; never a browser-supplied claim. */
	async client() {
		const data = await this.ctx.storage.get("session");
		return data?.phase === "active" ? data.client : void 0;
	}
	/** A verified 401 means this local credential no longer grants access. */
	discard() {
		return this.#serial(() => this.#clear());
	}
	end() {
		return this.#serial(async () => {
			const token = await this.#bearer();
			const data = await this.ctx.storage.get("session");
			if (token && data) {
				const probe = await fetch(new Request(data.resource, {
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
					body: "",
					signal: AbortSignal.timeout(1e4)
				}));
				await probe.body?.cancel();
				if (probe.status !== 401) try {
					var _usingCtx$1 = _usingCtx();
					if (!probe.ok) throw new Error(`Sign-out could not reach Iterate (${probe.status}). Try again.`);
					const api = _usingCtx$1.u(newHttpBatchRpcSession(new Request(data.resource, {
						headers: { Authorization: `Bearer ${token}` },
						signal: AbortSignal.timeout(1e4)
					})));
					await _usingCtx$1.u(api.authenticate({
						type: "bearer",
						token
					})).logout();
				} catch (_) {
					_usingCtx$1.e = _;
				} finally {
					_usingCtx$1.d();
				}
			}
			await this.#clear();
		});
	}
	async alarm() {
		await this.#clear();
	}
	async #bearer() {
		const data = await this.ctx.storage.get("session");
		if (!data || data.phase !== "active") return null;
		if (data.until <= Date.now()) {
			await this.#clear();
			return null;
		}
		if (data.expiresAt > Date.now() + 3e4) return data.accessToken;
		const as = authorizationServer(data.issuer);
		const client = { client_id: data.clientId };
		const started = Date.now();
		let tokens;
		try {
			const response = await oauth.refreshTokenGrantRequest(as, client, oauth.None(), data.refreshToken, this.#tokenOptions(data));
			tokens = await oauth.processRefreshTokenResponse(as, client, response);
		} catch (error) {
			await this.#endOnDeadGrant(error);
			return null;
		}
		return (await this.#activate(data, tokens, started)).accessToken;
	}
	/** The token request's shared options: the audience (RFC 8707 resource), a bounded timeout, and —
	*  only for a LOCAL APP (`begin` already admits http there) — oauth4webapi's opt-out of its
	*  HTTPS-only default. Keyed on the app's origin, never the issuer's: an issuer a person typed can
	*  not talk a deployed app into sending its codes in the clear. */
	#tokenOptions(data) {
		const options = {
			additionalParameters: { resource: data.resource },
			signal: AbortSignal.timeout(1e4)
		};
		if (isLocalOrigin(data.origin)) options[oauth.allowInsecureRequests] = true;
		return options;
	}
	/** Write the active session from a token response. A refresh reuses the prior refresh token when
	*  the issuer does not rotate it. */
	async #activate(data, tokens, started) {
		const refreshToken = tokens.refresh_token || (data.phase === "active" ? data.refreshToken : void 0);
		if (!refreshToken) throw new Error("Iterate returned no refresh token.");
		const { origin, issuer, resource, clientId, next } = data;
		const stored = {
			origin,
			issuer,
			resource,
			clientId,
			client: data.client,
			next,
			phase: "active",
			scopes: tokens.scope ? OAuthScopes.parse(tokens.scope.split(" ").filter(Boolean)) : data.scopes,
			accessToken: tokens.access_token,
			refreshToken,
			expiresAt: started + (tokens.expires_in ?? 0) * 1e3,
			until: data.phase === "pending" ? started + 2592e6 : data.until
		};
		await this.ctx.storage.put("session", stored);
		await this.ctx.storage.setAlarm(stored.until);
		return stored;
	}
	/** A dead code or refresh token (`invalid_grant`) ends the session; other failures are transient.
	*  A token endpoint that answered anything but its token — an OAuth error body, or a response
	*  oauth4webapi could not read as one (an uncaught 500) — throws one message naming its status,
	*  which reads the same on the far side of the Durable Object's RPC. */
	async #endOnDeadGrant(error) {
		if (error instanceof oauth.ResponseBodyError && error.error === "invalid_grant") {
			await this.#clear();
			return;
		}
		const status = error instanceof oauth.ResponseBodyError ? error.status : error instanceof oauth.OperationProcessingError && error.cause instanceof Response ? error.cause.status : null;
		throw status === null ? error : /* @__PURE__ */ new Error(`Iterate token exchange failed (${status}). Try again.`);
	}
	/** An operation failure must not reset the DO or fail other tabs' requests. */
	#serial(work) {
		return this.ctx.blockConcurrencyWhile(() => work().then((value) => ({ value }), (error) => ({ error }))).then((result) => {
			if ("error" in result) throw result.error;
			return result.value;
		});
	}
	async #clear() {
		await this.ctx.storage.deleteAll();
		await this.ctx.storage.deleteAlarm();
	}
};
//#endregion
export { BrowserSession };

//# sourceMappingURL=app-session.mjs.map