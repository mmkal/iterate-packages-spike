import { spawn, spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import process$1 from "node:process";
import repl from "node:repl";
import { RpcTarget, WebSocketPair, newWebSocketRpcSession, upgradeWebSocketResponse } from "capnweb";
import { builtInPrompts, createCli, os, yamlTableConsoleLogger } from "trpc-cli";
import { z } from "zod";
import WebSocket from "ws";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, hostname } from "node:os";
import { createServer } from "node:http";
import * as oauth from "oauth4webapi";
import { pathToFileURL } from "node:url";
//#region src/lib.ts
/** A plain Error carrying `code` (+ optional `data`) as own enumerable properties. */
function codedError(code, message, data) {
	return Object.assign(new Error(message), data === void 0 ? { code } : {
		code,
		data
	});
}
async function withTimeout(promise, ms, what) {
	let timer;
	try {
		return await Promise.race([promise, new Promise((_, reject) => {
			timer = setTimeout(() => reject(codedError("TIMEOUT", `${typeof what === "function" ? what() : what}: no answer in ${ms / 1e3}s`)), ms);
		})]);
	} finally {
		if (timer) clearTimeout(timer);
	}
}
/** Only plain HTTP loopback origins use development login and client registration. */
function isLocalOrigin(origin) {
	const url = new URL(origin);
	return url.protocol === "http:" && (url.hostname === "localhost" || url.hostname.endsWith(".localhost") || url.hostname === "127.0.0.1");
}
//#endregion
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
//#region src/cli/coding-agent.ts
/**
* Whether a coding agent, not a person, is running this process. The one list of agent markers for
* the iterate CLI (no browser opens, no prompts) and .husky/prepare-commit-msg (no
* `git commit --amend`). The hook loads this file with Node's own type stripping, so it stays
* import-free erasable TypeScript.
*
* - Claude Code sets CLAUDE_CODE_CHILD_SESSION=1 in the processes its tool calls and hooks spawn.
*   Not CLAUDECODE: Claude Code's IDE extensions also set that in the integrated terminal a person
*   types into. https://code.claude.com/docs/en/env-vars
* - OpenCode sets OPENCODE=1 and OPENCODE_SESSION.
* - AGENT=1 is the generic marker for other agents.
*/
function isCodingAgent(env) {
	return env.CLAUDE_CODE_CHILD_SESSION === "1" || env.OPENCODE === "1" || Boolean(env.OPENCODE_SESSION) || env.AGENT === "1";
}
//#endregion
//#region src/cli/config.ts
const CONFIG_DIR = join(process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : join(homedir(), ".config"), "iterate");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");
/** Stored session (lives inside a config entry) */
const StoredSession = z.object({
	token: z.string().optional(),
	refreshToken: z.string().optional(),
	clientId: z.string().optional(),
	scope: z.string().optional(),
	expiresAt: z.string().optional()
});
/** A named config — describes which server to talk to and how to authenticate. */
const Config = z.object({
	defaultProject: z.string().optional(),
	osBaseUrl: z.string().optional().default("https://os.iterate.com"),
	session: StoredSession.optional()
});
/** The config file on disk (~/.config/iterate/config.json) */
const ConfigFile = z.object({
	configs: z.record(z.string(), Config).optional(),
	default: z.string().optional(),
	/** Maps absolute directory path to a config name */
	workspaces: z.record(z.string(), z.string()).optional()
});
const normalizeConfig = (config) => ({
	...config,
	osBaseUrl: config.osBaseUrl.replace(/\/+$/, "")
});
const readConfigFile = () => {
	if (!existsSync(CONFIG_PATH)) return {};
	const rawText = readFileSync(CONFIG_PATH, "utf8");
	try {
		return ConfigFile.parse(JSON.parse(rawText));
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		throw new Error(`Invalid JSON in ${CONFIG_PATH}: ${detail}`);
	}
};
const writeConfigFile = (configFile) => {
	const parsed = ConfigFile.safeParse(configFile);
	if (!parsed.success) throw new Error(`Invalid config file: ${z.prettifyError(parsed.error)}`);
	mkdirSync(dirname(CONFIG_PATH), { recursive: true });
	writeFileSync(CONFIG_PATH, `${JSON.stringify(parsed.data, null, 2)}\n`, { mode: 384 });
};
/**
* Read and validate a single named config, applying schema defaults and
* normalizing URLs. A missing or invalid config is returned as an Error value.
*/
function readConfig(name) {
	const raw = readConfigFile().configs?.[name] ?? (name === "prd" ? {} : void 0);
	if (!raw) return /* @__PURE__ */ new Error(`Config "${name}" not found in ${CONFIG_PATH}`);
	const parsed = Config.safeParse(raw);
	if (!parsed.success) return /* @__PURE__ */ new Error(`Invalid config "${name}" in ${CONFIG_PATH}:\n${z.prettifyError(parsed.error)}`);
	return normalizeConfig(parsed.data);
}
/**
* Merge session fields into the named config's stored session. Extra
* runtime-only keys on `session` are stripped by the schema on write.
*/
const updateConfigSession = (configName, session) => {
	const configFile = readConfigFile();
	configFile.configs ||= {};
	const entry = configFile.configs[configName] ||= normalizeConfig(Config.parse({}));
	entry.session = {
		...entry.session,
		...session
	};
	writeConfigFile(configFile);
};
const removeConfigSession = (configName) => {
	const configFile = readConfigFile();
	const entry = configFile.configs?.[configName];
	if (!entry?.session) return;
	delete entry.session;
	writeConfigFile(configFile);
};
//#endregion
//#region src/cli/run-command.ts
/** Spawn a command, optionally feed it stdin, and collect its result. */
function run(command, args, stdin) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args);
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (d) => stdout += d);
		child.stderr.on("data", (d) => stderr += d);
		child.on("error", reject);
		child.on("close", (code) => resolve({
			stdout,
			stderr,
			exitCode: code ?? 1
		}));
		child.stdin.end(stdin);
	});
}
//#endregion
//#region src/cli/menubar-app.ts
const BUILD_DIR = join(CONFIG_DIR, "menubar-build");
const APP_PATH = join(BUILD_DIR, "Iterate.app");
const SOURCES = [
	"Iterate.swift",
	"IterateIcon.swift",
	"build-menubar-app.sh"
];
/** Compile-if-needed and launch the menu-bar app for one project/config. */
async function launchMenubarApp(input) {
	if (process.platform !== "darwin") throw new Error("The menu-bar app is macOS-only.");
	const log = input.log || (() => {});
	const root = packageRoot();
	const menubarDir = join(root, "menubar");
	const binPath = join(root, "bin", "iterate.js");
	const contents = await Promise.all(SOURCES.map((name) => readFile(join(menubarDir, name), "utf8")));
	const hash = createHash("sha256").update(contents.join("\0")).digest("hex").slice(0, 12);
	const marker = join(BUILD_DIR, `.built-${hash}`);
	if (!existsSync(marker) || !existsSync(APP_PATH)) {
		log("Building the menu-bar app (swiftc)…");
		await mkdir(BUILD_DIR, { recursive: true });
		const build = await run("bash", [join(menubarDir, "build-menubar-app.sh"), BUILD_DIR]);
		if (build.exitCode !== 0) throw new Error(`Menu-bar build failed — install the Xcode command-line tools (xcode-select --install)?\n${build.stderr.trim() || build.stdout.trim()}`);
		await writeFile(marker, hash);
	}
	await writeFile(join(CONFIG_DIR, "menubar.json"), `${JSON.stringify({
		command: process.execPath,
		args: [binPath],
		config: input.configName,
		project: input.project,
		xdgConfigHome: process.env.XDG_CONFIG_HOME
	}, null, 2)}\n`);
	const open = await run("open", [
		"-a",
		APP_PATH,
		join(CONFIG_DIR, "menubar.json")
	]);
	if (open.exitCode !== 0) throw new Error(`Could not launch the app: ${open.stderr.trim()}`);
	log(`Launched Iterate for project "${input.project}" (config ${input.configName}).`);
	log("It lives in your menu bar — click the 𝑖 to sign in and share your computer with the project's agents.");
}
/** The `iterate` package's root, the folder holding `bin/iterate.js`: this module runs from
*  `src/cli/` in the repo and from a `dist/` chunk once built. */
function packageRoot() {
	for (let dir = import.meta.dirname; dir !== dirname(dir); dir = dirname(dir)) if (existsSync(join(dir, "bin", "iterate.js"))) return dir;
	throw new Error(`no bin/iterate.js above ${import.meta.dirname}`);
}
//#endregion
//#region src/oauth-scopes.ts
/** The platform's OAuth scopes — what an app may ask for and what a consent grants:
*   - `iterate`             — reach the projects the person grants (every app; implied, always granted)
*   - `account`             — manage the person's sessions and personal access tokens
*   - `organizations:write` — the person's organizations: list every one they belong to, create new ones
*   - `admin`               — operate the platform: every project and person. Granted only to an
*                             email the deployment's `admins` lists (core/os consent.ts), and only
*                             while it lists it (oauth.ts). Signing a client in as someone else is
*                             no scope: the issuer offers it to a listed admin at consent
*  Consent is task-based (the shape Cloudflare's own OAuth consent took in August 2026: a client
*  requests a set, the person may deselect the optional ones, the token carries what was granted):
*  `iterate` is required, every other requested scope is optional on the consent page, and an app
*  reads the granted set from `session.info().scopes` rather than assuming its request. */
const OAuthScope = z.enum([
	"iterate",
	"account",
	"organizations:write",
	"admin"
]);
const OAuthScopes = z.array(OAuthScope).transform((scopes) => [.../* @__PURE__ */ new Set(["iterate", ...scopes])]);
//#endregion
//#region src/client/oauth.ts
/** The platform's issuer as oauth4webapi's authorization server: its endpoints under `/oauth2`, and
*  the `iss` it adds to every authorization response (RFC 9207), which `validateAuthResponse` then
*  requires. The same description for an app's browser session and the CLI. */
function authorizationServer(issuer) {
	return {
		issuer,
		authorization_endpoint: `${issuer}/oauth2/auth`,
		token_endpoint: `${issuer}/oauth2/token`,
		registration_endpoint: `${issuer}/oauth2/register`,
		authorization_response_iss_parameter_supported: true
	};
}
/** The same code/PKCE parameters for browser login and a console-minted token. */
async function authorizationCodeRequest(input) {
	const verifier = oauth.generateRandomCodeVerifier();
	const challenge = await oauth.calculatePKCECodeChallenge(verifier);
	const state = oauth.generateRandomState();
	const url = new URL("/oauth2/auth", input.issuer);
	url.search = new URLSearchParams({
		response_type: "code",
		client_id: input.clientId,
		redirect_uri: input.redirectUri,
		scope: OAuthScopes.parse(input.scopes || []).join(" "),
		state,
		code_challenge: challenge,
		code_challenge_method: "S256"
	}).toString();
	for (const resource of input.resources) url.searchParams.append("resource", resource);
	return {
		url,
		state,
		verifier
	};
}
//#endregion
//#region \0@oxc-project+runtime@0.151.0/helpers/esm/usingCtx.js
function _usingCtx() {
	var r = "function" == typeof SuppressedError ? SuppressedError : function(r, e) {
		var n = Error();
		return n.name = "SuppressedError", n.error = r, n.suppressed = e, n;
	}, e = {}, n = [];
	function using(r, e) {
		if (null != e) {
			if (Object(e) !== e) throw new TypeError("using declarations can only be used with objects, functions, null, or undefined.");
			if (r) var o = e[Symbol.asyncDispose || Symbol["for"]("Symbol.asyncDispose")];
			if (void 0 === o && (o = e[Symbol.dispose || Symbol["for"]("Symbol.dispose")], r)) var t = o;
			if ("function" != typeof o) throw new TypeError("Object is not disposable.");
			t && (o = function o() {
				try {
					t.call(e);
				} catch (r) {
					return Promise.reject(r);
				}
			}), n.push({
				v: e,
				d: o,
				a: r
			});
		} else r && n.push({
			d: e,
			a: r
		});
		return e;
	}
	return {
		e,
		u: using.bind(null, !1),
		a: using.bind(null, !0),
		d: function d() {
			var o, t = this.e, s = 0;
			function next() {
				for (; o = n.pop();) try {
					if (!o.a && 1 === s) return s = 0, n.push(o), Promise.resolve().then(next);
					if (o.d) {
						var r = o.d.call(o.v);
						if (o.a) return s |= 2, Promise.resolve(r).then(next, err);
					} else s |= 1;
				} catch (r) {
					return err(r);
				}
				if (1 === s) return t !== e ? Promise.reject(t) : Promise.resolve();
				if (t !== e) throw t;
			}
			function err(n) {
				return t = t !== e ? new r(n, t) : n, next();
			}
			return next();
		}
	};
}
//#endregion
//#region src/cli/oauth.ts
/** The platform API's audience (the RFC 8707 resource) at `osBaseUrl`, local port included. */
const oauthResourceForOsBaseUrl = (osBaseUrl) => new URL("/api", osBaseUrl).href;
/** Sign in at `issuer` in a browser: `openBrowser` gets the authorization URL, and the redirect
*  back to this process's loopback listener is validated (state, `iss`, no `error`) before its code
*  is redeemed with the PKCE verifier. `iterate login` asks for `iterate` alone, so the session it
*  stores on disk mints no key; `iterate tokens` signs in again for its one call with `account`
*  (cli.ts `withAccountSession`). */
async function oauthLogin(input) {
	try {
		var _usingCtx$5 = _usingCtx();
		const as = authorizationServer(input.issuer);
		const resource = oauthResourceForOsBaseUrl(input.issuer);
		const loopback = _usingCtx$5.a(await listenForRedirect());
		const client = { client_id: (await oauth.processDynamicClientRegistrationResponse(await oauth.dynamicClientRegistrationRequest(as, {
			client_name: "iterate CLI",
			redirect_uris: [loopback.redirectUri],
			token_endpoint_auth_method: "none",
			grant_types: ["authorization_code", "refresh_token"],
			response_types: ["code"]
		}, requestOptions(input.issuer)))).client_id };
		const request = await authorizationCodeRequest({
			issuer: input.issuer,
			clientId: client.client_id,
			redirectUri: loopback.redirectUri,
			resources: [resource],
			scopes: input.scopes
		});
		await input.openBrowser(request.url);
		let callback;
		try {
			callback = oauth.validateAuthResponse(as, client, await loopback.redirect, request.state);
		} catch (error) {
			if (error instanceof oauth.AuthorizationResponseError) throw new Error(`Sign-in was not authorized: ${error.error}${error.error_description ? ` (${error.error_description})` : ""}.`, { cause: error });
			throw error;
		}
		const started = Date.now();
		return sessionFromTokens(await tokenResponse("OAuth token exchange", async () => oauth.processAuthorizationCodeResponse(as, client, await oauth.authorizationCodeGrantRequest(as, client, oauth.None(), callback, loopback.redirectUri, request.verifier, {
			...requestOptions(input.issuer),
			additionalParameters: { resource }
		}))), client.client_id, started);
	} catch (_) {
		_usingCtx$5.e = _;
	} finally {
		await _usingCtx$5.d();
	}
}
/** A fresh access token for `session` from `issuer`. The issuer may keep the refresh token; an
*  omitted scope means the grant's scope is unchanged (RFC 6749 §5.1). */
async function refreshOAuthSession(input) {
	const { refreshToken, clientId } = input.session;
	if (!refreshToken || !clientId) throw new Error(`Session expired for ${input.issuer}. Run \`iterate login\` again.`);
	const as = authorizationServer(input.issuer);
	const client = { client_id: clientId };
	const started = Date.now();
	return sessionFromTokens(await tokenResponse("OAuth refresh", async () => oauth.processRefreshTokenResponse(as, client, await oauth.refreshTokenGrantRequest(as, client, oauth.None(), refreshToken, {
		...requestOptions(input.issuer),
		additionalParameters: { resource: oauthResourceForOsBaseUrl(input.issuer) }
	}))), clientId, started, input.session);
}
/** A bounded request. oauth4webapi sends only HTTPS unless told otherwise
*  (https://github.com/panva/oauth4webapi/blob/main/docs/variables/allowInsecureRequests.md); a
*  local issuer (`pnpm dev`) is plain http. */
function requestOptions(issuer) {
	return {
		signal: AbortSignal.timeout(3e4),
		[oauth.allowInsecureRequests]: isLocalOrigin(issuer)
	};
}
/** The issuer's refusal of a code or refresh token, as the person should read it: its status,
*  OAuth error code and description, so `invalid_grant` reads apart from any other 400 (iterate/iterate#3008). */
async function tokenResponse(step, request) {
	try {
		return await request();
	} catch (error) {
		if (error instanceof oauth.ResponseBodyError) throw new Error(`${step} failed (${error.status} ${error.error}${error.error_description ? `: ${error.error_description}` : ""}). Run \`iterate login\` again.`, { cause: error });
		throw error;
	}
}
function sessionFromTokens(tokens, clientId, started, previous) {
	return {
		token: tokens.access_token,
		refreshToken: tokens.refresh_token || previous?.refreshToken,
		clientId,
		scope: tokens.scope || previous?.scope,
		expiresAt: tokens.expires_in === void 0 ? void 0 : new Date(started + tokens.expires_in * 1e3).toISOString()
	};
}
/** The loopback redirect (https://www.rfc-editor.org/rfc/rfc8252#section-7.3): `/callback` on an
*  ephemeral localhost port, answered once. `redirect` is its query string, for oauth4webapi to
*  validate; it rejects after five minutes without one. Disposal closes the listener. */
async function listenForRedirect() {
	const settle = Promise.withResolvers();
	settle.promise.catch(() => {});
	let answered = false;
	const server = createServer((request, response) => {
		const url = new URL(request.url || "/", "http://localhost");
		if (url.pathname !== "/callback") {
			response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found.");
			return;
		}
		if (answered) {
			response.writeHead(409, { "content-type": "text/plain; charset=utf-8" }).end("This sign-in already finished.");
			return;
		}
		answered = true;
		const declined = url.searchParams.has("error");
		response.writeHead(declined ? 400 : 200, { "content-type": "text/html; charset=utf-8" }).end(declined ? "<h1>Iterate sign-in was not authorized</h1><p>You can return to the terminal.</p>" : "<h1>Iterate sign-in received</h1><p>You can close this tab and return to the terminal.</p>");
		settle.resolve(url.searchParams);
	});
	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "localhost", resolve);
	});
	const timeout = setTimeout(() => settle.reject(/* @__PURE__ */ new Error("Timed out waiting for the sign-in redirect.")), 3e5);
	const { port } = server.address();
	return {
		redirectUri: `http://localhost:${port}/callback`,
		redirect: settle.promise,
		async [Symbol.asyncDispose]() {
			clearTimeout(timeout);
			server.closeAllConnections();
			await new Promise((resolve) => server.close(() => resolve()));
		}
	};
}
//#endregion
//#region src/cli/provide.ts
/** A capability's name: `itx.<name>`, dotted segments allowed (`whatsapp.jonas`). */
const NAME = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*$/;
/** THE FILE, IMPORTED BY NODE ITSELF: `.ts`, `.mts`, `.mjs` and `.js` alike (Node strips a `.ts`
*  file's types, 22.18 and later). Its bare imports resolve from its own folder's `node_modules`, so
*  its dependencies are that folder's to install, never this CLI's: a missing one names the folder
*  to install in. Importing it runs its top level once, for the whole process. */
async function importProvidedFile(file) {
	const path = resolve(file);
	if (!existsSync(path)) throw new Error(`No file ${path}.`);
	let imported;
	try {
		imported = await import(pathToFileURL(path).href);
	} catch (error) {
		const { code, message } = error;
		if (code === "ERR_MODULE_NOT_FOUND" && message?.startsWith("Cannot find package")) {
			const packageDirectory = nearestPackageDirectory(path);
			throw new Error(packageDirectory ? `${message}. Install ${basename(path)}'s dependencies first: npm install (or pnpm install) in ${packageDirectory}.` : `${message}. ${basename(path)} has no package.json above it: make one in ${dirname(path)} that lists its dependencies, then npm install there.`);
		}
		if (code === "ERR_UNKNOWN_FILE_EXTENSION") throw new Error(`${message}. Node ${process.version} cannot load ${extname(path)} files: Node 22.18 or later strips a TypeScript file's types itself.`);
		throw error;
	}
	if (typeof imported.default !== "function") throw new Error(`${basename(path)} has no default export to provide: export default function ({ itx }) { return { someFunction() {} } }`);
	return {
		provide: imported.default,
		description: typeof imported.description === "string" ? imported.description : void 0
	};
}
/** `whatsapp.ts` → `whatsapp`: the default name, when the file's name is one. */
function nameOfFile(file) {
	const name = basename(file, extname(file));
	if (!NAME.test(name)) throw new Error(`${basename(file)} is not a capability name: pass --name, letters and digits starting with a letter (e.g. --name whatsapp).`);
	return name;
}
/** THE LENT STUB: the functions of `provided` as the methods of one RpcTarget of THIS process's
*  capnweb. capnweb lends only instances of its own `RpcTarget`, and in Node that is a class of each
*  installed copy: an RpcTarget from the file's own copy of capnweb would not be one here, so the
*  file answers plain functions and this wraps them. Which functions is capnweb's own rule: a plain
*  object's own properties, a class instance's methods (never its fields). Arguments and answers
*  cross as they are (plain data, bytes, stubs); anything else fails the call. */
function rpcTargetOf(provided) {
	if (typeof provided !== "object" || !provided) throw new Error(`The default export answered ${String(provided)}: it must answer an object of functions.`);
	const object = provided;
	const prototype = Object.getPrototypeOf(object);
	const layers = [];
	if (prototype === Object.prototype || prototype === null) layers.push(object);
	else for (let layer = prototype; layer && layer !== Object.prototype; layer = Object.getPrototypeOf(layer)) layers.push(layer);
	const names = /* @__PURE__ */ new Set();
	for (const layer of layers) for (const name of Object.getOwnPropertyNames(layer)) if (name !== "constructor" && typeof object[name] === "function") names.add(name);
	if (names.size === 0) throw new Error("The default export answered an object with no functions: nothing to lend.");
	class Provided extends RpcTarget {}
	for (const name of names) Object.defineProperty(Provided.prototype, name, { value: (...args) => object[name](...args) });
	return new Provided();
}
/** How long `provide` waits before each attempt to reconnect after its connection closed, about
*  five minutes in all, as `iterate tunnel` does: long enough for Wi-Fi to come back or a laptop to
*  wake, short enough that a lend whose network is gone for good says so and exits. */
const RECONNECT_DELAYS_MS$1 = [
	1e3,
	2e3,
	4e3,
	8e3,
	15e3,
	...Array(9).fill(3e4)
];
/** `iterate provide <file>`: lend the file's functions to the project as `itx.<name>` until Ctrl-C.
*  On every connection — the first, and each one `reconnect` opens after one closes or the lend
*  ends under it — the file's default export is called with that connection's project as `itx`,
*  and what it answers is lent again at the same name: the file keeps its long-lived state (a
*  socket, a session) in its own module scope and reaches the project through the newest `itx`.
*  `itx.<name>` is printed on stdout once live. Only when every attempt to reconnect fails does it
*  end, with an error. */
async function runProvide(input) {
	if (!NAME.test(input.name)) throw new Error(`${JSON.stringify(input.name)} is not a capability name: letters and digits starting with a letter, dotted segments allowed (whatsapp, whatsapp.jonas).`);
	const match = `itx.${input.name}`;
	let stop = () => {};
	const stopped = new Promise((resolve) => stop = () => resolve("stopped"));
	process.once("SIGINT", stop);
	process.once("SIGTERM", stop);
	/** Lend over one connection until Ctrl-C, or until the connection closes or the lend ends — why,
	*  as a line. */
	const serve = async (connection, first) => {
		try {
			var _usingCtx$4 = _usingCtx();
			const project = _usingCtx$4.u(await connection.session.projects.get(input.project));
			const target = rpcTargetOf(await input.file.provide({ itx: project }));
			const lend = _usingCtx$4.u(await project.provide(match, target, input.file.description ? { description: input.file.description } : void 0));
			if (first) {
				console.log(match);
				console.error(`${match} is live for project ${input.project}. Press Ctrl-C to stop.`);
			} else console.error(`Reconnected: ${match} is live again.`);
			const lendEnded = lend.lendEnded().then((reason) => `its lend ended: the stub ${reason}`, (error) => `its lend ended: ${messageOf$1(error)}`);
			const connectionClosed = connection.closed.then(({ code, reason }) => `${code}: ${reason || "connection closed"}`);
			return await Promise.race([
				stopped,
				connectionClosed,
				lendEnded
			]);
		} catch (_) {
			_usingCtx$4.e = _;
		} finally {
			_usingCtx$4.d();
		}
	};
	const delaysMs = input.reconnectDelaysMs || RECONNECT_DELAYS_MS$1;
	let connection = input.connection;
	let lastFailure = "";
	try {
		for (let first = true, failures = 0;; first = false) {
			if (connection) try {
				const outcome = await serve(connection, first);
				if (outcome === "stopped") return;
				lastFailure = outcome;
				console.error(`${match} disconnected (${lastFailure}). Reconnecting...`);
				failures = 0;
			} catch (error) {
				if (first) throw error;
				lastFailure = messageOf$1(error);
				console.error(`Could not lend ${match} again: ${lastFailure}`);
			} finally {
				connection[Symbol.dispose]();
			}
			const delayMs = delaysMs[failures++];
			if (delayMs === void 0) throw new Error(`${match} disconnected and could not reconnect (${lastFailure}). Run iterate provide again.`);
			let wait;
			const waited = await Promise.race([stopped, new Promise((resolve) => wait = setTimeout(() => resolve("waited"), delayMs))]);
			clearTimeout(wait);
			if (waited === "stopped") return;
			connection = await input.reconnect().catch((error) => {
				lastFailure = messageOf$1(error);
				console.error(`Could not reconnect: ${lastFailure}`);
				return null;
			});
		}
	} finally {
		process.removeListener("SIGINT", stop);
		process.removeListener("SIGTERM", stop);
	}
}
/** The folder of the nearest package.json at or above the file's own folder. */
function nearestPackageDirectory(path) {
	for (let directory = dirname(path);; directory = dirname(directory)) {
		if (existsSync(join(directory, "package.json"))) return directory;
		if (dirname(directory) === directory) return null;
	}
}
function messageOf$1(error) {
	return error instanceof Error ? error.message : String(error);
}
//#endregion
//#region src/cli/tunnel.ts
/** Headers the local dial makes itself: undici throws on the hop-by-hop ones, and `host` must be
*  localhost's (Vite's `allowedHosts` refuses any other). */
const HOP_BY_HOP_HEADERS = [
	"connection",
	"keep-alive",
	"proxy-connection",
	"transfer-encoding",
	"te",
	"trailer",
	"upgrade",
	"host"
];
/** THE TUNNEL'S LENT STUB: every request the project's host routes here, proxied to
*  `http://localhost:<port>` — method, headers, streamed body, redirects handed back as they are.
*  A WebSocket upgrade dials the local server with the visitor's subprotocols and pumps frames both
*  ways. Nothing listening is a 502 naming the port. */
var LocalPortRpcTarget = class extends RpcTarget {
	#port;
	#log;
	constructor(port, log = () => {}) {
		super();
		this.#port = port;
		this.#log = log;
	}
	async fetch(request) {
		const visitorUrl = new URL(request.url);
		const basePath = request.headers.get("x-iterate-base-path") || "";
		const localUrl = new URL(`http://localhost:${this.#port}`);
		localUrl.pathname = `${basePath}${visitorUrl.pathname}`;
		localUrl.search = visitorUrl.search;
		const headers = new Headers(request.headers);
		for (const name of HOP_BY_HOP_HEADERS) headers.delete(name);
		if ((request.headers.get("upgrade") ?? "").toLowerCase() === "websocket") return this.#upgradeWebSocket(request, localUrl, headers);
		let response;
		try {
			response = await fetch(localUrl, {
				method: request.method,
				headers,
				body: request.body,
				duplex: "half",
				redirect: "manual"
			});
		} catch (error) {
			this.#log(`${request.method} ${localUrl.pathname}${localUrl.search} → 502 (${causeOf(error)})`);
			return new Response(`Nothing answered on localhost:${this.#port} (${causeOf(error)})\n`, { status: 502 });
		}
		this.#log(`${request.method} ${localUrl.pathname}${localUrl.search} → ${response.status}`);
		const responseHeaders = new Headers(response.headers);
		if (responseHeaders.has("content-encoding")) {
			responseHeaders.delete("content-encoding");
			responseHeaders.delete("content-length");
		}
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders
		});
	}
	/** The local server's WebSocket, bridged through a `WebSocketPair`: the pair buffers what the
	*  server says before the visitor's side is wired (Vite's HMR server greets at once). */
	async #upgradeWebSocket(request, localUrl, headers) {
		const protocols = (request.headers.get("sec-websocket-protocol") ?? "").split(",").map((protocol) => protocol.trim()).filter(Boolean);
		localUrl.protocol = "ws:";
		const pair = new WebSocketPair();
		const visitorSide = pair[1];
		visitorSide.accept();
		const localHeaders = {};
		headers.forEach((value, name) => {
			if (!name.startsWith("sec-websocket-")) localHeaders[name] = value;
		});
		const local = new WebSocket(localUrl, protocols, { headers: localHeaders });
		local.on("message", (data, isBinary) => {
			const buffer = data;
			try {
				visitorSide.send(isBinary ? new Uint8Array(buffer) : buffer.toString());
			} catch {}
		});
		try {
			await new Promise((resolve, reject) => {
				local.once("open", resolve);
				local.once("error", reject);
				local.once("unexpected-response", (_request, response) => reject(/* @__PURE__ */ new Error(`the local server answered ${response.statusCode}`)));
			});
		} catch (error) {
			visitorSide.close(1011, "no local WebSocket");
			this.#log(`WS ${localUrl.pathname} → 502 (${causeOf(error)})`);
			return new Response(`No WebSocket answered on localhost:${this.#port} (${causeOf(error)})\n`, { status: 502 });
		}
		this.#log(`WS ${localUrl.pathname} → 101${local.protocol ? ` (${local.protocol})` : ""}`);
		visitorSide.addEventListener("message", (event) => {
			if (local.readyState === WebSocket.OPEN) local.send(event.data);
		});
		visitorSide.addEventListener("close", (event) => {
			local.close(relayedCloseCode(event.code), event.reason);
		});
		local.on("close", (code, reason) => {
			try {
				visitorSide.close(relayedCloseCode(code), reason.toString());
			} catch {}
		});
		local.on("error", () => {
			try {
				visitorSide.close(1011, "the local WebSocket failed");
			} catch {}
		});
		return upgradeWebSocketResponse(pair[0], { headers: local.protocol ? { "Sec-WebSocket-Protocol": local.protocol } : {} });
	}
};
/** The platform's close-code policy (core/os src/context/websocket-close.ts `relayedCloseCode`),
*  copied, since this package is published on its own. */
function relayedCloseCode(code) {
	if (code === void 0 || code === 1005) return 1e3;
	if (code >= 1e3 && code <= 1003 || code >= 1007 && code <= 1014) return code;
	return code >= 3e3 && code <= 4999 ? code : 1011;
}
/** undici hides the reason a dial failed (ECONNREFUSED) in `cause`. */
function causeOf(error) {
	const cause = error?.cause;
	return cause?.code || cause?.message || (error instanceof Error ? error.message : String(error));
}
/** How long the tunnel waits before each attempt to reconnect after its connection closed, about
*  five minutes in all: long enough for Wi-Fi to come back or a laptop to wake, short enough that a
*  tunnel whose network is gone for good says so and exits. */
const RECONNECT_DELAYS_MS = [
	1e3,
	2e3,
	4e3,
	8e3,
	15e3,
	...Array(9).fill(3e4)
];
/** `iterate tunnel <port>`: lend a `LocalPortRpcTarget` to the project as `itx.tunnels.<name>` with
*  the fetch route `tunnel-<name>` taking the `<name>` routing slug's host to it (or, given a
*  `hostname`, that hostname's requests alone), print the URL on stdout, and on Ctrl-C delete the
*  route, then end the lend. The route rides the lend (`provide`'s `fetchRoute`):
*  the platform sets it again whenever it re-attaches the lend and removes it when the lend ends —
*  a tunnel killed outright, or asleep, leaves no route behind. A connection that closes (its
*  heartbeat found it dead, iterate/node) is replaced: `reconnect` opens a fresh one and the tunnel
*  lends and routes again over it, the same name taking its own route over. Only when every attempt
*  fails does the tunnel end, with an error. */
async function runTunnel(input) {
	const tunnelName = input.tunnelName || `t${randomBytes(4).toString("hex")}`;
	const fetchRouteName = `tunnel-${tunnelName}`;
	const target = `itx.tunnels.${tunnelName}`;
	const { hostname } = input;
	if (hostname && !/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]+$/.test(hostname)) throw new Error(`--hostname ${JSON.stringify(hostname)} is not one lowercase hostname, e.g. hello.tunnels.example.com`);
	const requestMatcher = hostname ? { url: { hostname } } : { routingSlug: tunnelName };
	let stop = () => {};
	const stopped = new Promise((resolve) => stop = () => resolve("stopped"));
	process.once("SIGINT", stop);
	process.once("SIGTERM", stop);
	/** Serve over one connection until Ctrl-C (the route deleted), or until the connection closes or
	*  the lend ends — why, as a line. */
	const serve = async (connection, first) => {
		try {
			var _usingCtx$3 = _usingCtx();
			const project = _usingCtx$3.u(await connection.session.projects.get(input.project));
			const conflict = (await project.fetchRoutes.list()).find((route) => (route.fetchRouteName === fetchRouteName || (hostname ? route.requestMatcher.url?.hostname === hostname : route.requestMatcher.routingSlug === tunnelName)) && !(route.fetchRouteName === fetchRouteName && route.target.join(".") === target));
			if (conflict) throw new Error(`The fetch route ${conflict.fetchRouteName} (target ${conflict.target.join(".")}) already has this name or host. Pick another ${hostname ? "--name or --hostname" : "--name"}.`);
			const url = hostname ? `https://${hostname}/` : await project.url({ routingSlug: tunnelName });
			const lend = _usingCtx$3.u(await project.provide(target, new LocalPortRpcTarget(input.port, (line) => console.error(line)), { fetchRoute: {
				fetchRouteName,
				requestMatcher,
				authRequirement: input.public ? null : { visitors: "project-members" }
			} }));
			if (first) {
				console.log(url);
				console.error(`${url} → http://localhost:${input.port} (${input.public ? "public" : "project members only"}). Press Ctrl-C to stop.`);
				const basePath = new URL(url).pathname;
				if (basePath !== "/") console.error(`Projects are served under paths here: your local server must serve under ${basePath} (Vite: --base ${basePath}). To serve at / on an origin of its own, give the deployment a domain with a wildcard certificate: https://github.com/iterate/iterate/blob/main/core/os/SELF-HOSTING.md#custom-domain-own-origins-for-apps-and-tunnels`);
			} else console.error(`Reconnected: ${url} → http://localhost:${input.port}`);
			const lendEnded = lend.lendEnded().then((reason) => `its lend ended: the stub ${reason}`, (error) => `its lend ended: ${messageOf(error)}`);
			const connectionClosed = connection.closed.then(({ code, reason }) => `${code}: ${reason || "connection closed"}`);
			const outcome = await Promise.race([
				stopped,
				connectionClosed,
				lendEnded
			]);
			if (outcome === "stopped") await project.fetchRoutes.set(fetchRouteName, null).catch((error) => {
				console.error(`Could not delete the fetch route ${fetchRouteName}: ${messageOf(error)}`);
			});
			return outcome;
		} catch (_) {
			_usingCtx$3.e = _;
		} finally {
			_usingCtx$3.d();
		}
	};
	const delaysMs = input.reconnectDelaysMs || RECONNECT_DELAYS_MS;
	let connection = input.connection;
	let lastFailure = "";
	try {
		for (let first = true, failures = 0;; first = false) {
			if (connection) try {
				const outcome = await serve(connection, first);
				if (outcome === "stopped") return;
				lastFailure = outcome;
				console.error(`The tunnel disconnected (${lastFailure}). Reconnecting...`);
				failures = 0;
			} catch (error) {
				if (first) throw error;
				lastFailure = messageOf(error);
				console.error(`Could not serve the tunnel again: ${lastFailure}`);
			} finally {
				connection[Symbol.dispose]();
			}
			const delayMs = delaysMs[failures++];
			if (delayMs === void 0) throw new Error(`The tunnel disconnected and could not reconnect (${lastFailure}). Run iterate tunnel again.`);
			let wait;
			const waited = await Promise.race([stopped, new Promise((resolve) => wait = setTimeout(() => resolve("waited"), delayMs))]);
			clearTimeout(wait);
			if (waited === "stopped") return;
			connection = await input.reconnect().catch((error) => {
				lastFailure = messageOf(error);
				console.error(`Could not reconnect: ${lastFailure}`);
				return null;
			});
		}
	} finally {
		process.removeListener("SIGINT", stop);
		process.removeListener("SIGTERM", stop);
	}
}
function messageOf(error) {
	return error instanceof Error ? error.message : String(error);
}
//#endregion
//#region src/cli/use-my-computer.ts
/** Methods run locally with the authority of the person sharing this Mac. */
var MyComputer = class extends RpcTarget {
	#emit;
	#nextCall = 0;
	constructor(emit = () => {}) {
		super();
		this.#emit = emit;
	}
	async #call(method, summary, operation) {
		const id = ++this.#nextCall;
		this.#emit({
			type: "call",
			id,
			method,
			summary: summary.slice(0, 160)
		});
		let ok = false;
		try {
			const result = await operation();
			ok = true;
			return result;
		} finally {
			this.#emit({
				type: "call-done",
				id,
				ok
			});
		}
	}
	/** Pop a native dialog on screen and return which button the human clicked. */
	async ask({ question, buttons = ["No", "Yes"] }) {
		return this.#call("ask", question, async () => {
			if (buttons.length < 1 || buttons.length > 3) throw new Error("ask() needs 1–3 buttons (AppleScript dialogs cap at three).");
			const buttonList = buttons.map((b) => `"${escapeForAppleScript(b)}"`).join(", ");
			const { stdout } = await osascript(`display dialog "${escapeForAppleScript(question)}" buttons {${buttonList}} default button "${escapeForAppleScript(buttons[0])}" with title "iterate · myComputer"`);
			return { answer: stdout.trim().replace(/^button returned:/, "") };
		});
	}
	/** Show a desktop notification. */
	async notify({ message, title = "iterate" }) {
		return this.#call("notify", message, async () => {
			await osascript(`display notification "${escapeForAppleScript(message)}" with title "${escapeForAppleScript(title)}"`);
			return { ok: true };
		});
	}
	/** Run arbitrary Swift and return its output — full power, when an agent needs it. */
	async runSwift({ code }) {
		return await this.#call("runSwift", "Swift script", () => run("swift", ["-"], code));
	}
	__describe() {
		return {
			instructions: "A live Mac shared by its owner. Ask before destructive actions. Methods: ask({ question, buttons? }), notify({ message, title? }), runSwift({ code }). Swift has full local access.",
			types: "ask(input: { question: string; buttons?: string[] }): Promise<{ answer: string }>; notify(input: { message: string; title?: string }): Promise<{ ok: true }>; runSwift(input: { code: string }): Promise<{ stdout: string; stderr: string; exitCode: number }>;"
		};
	}
};
async function askComputerName() {
	const proposed = proposeComputerName();
	if (!process.stdin.isTTY) return proposed;
	return (await builtInPrompts().input({
		message: "What should agents call this computer? (camelCase — it becomes the itx.<name> path)",
		default: proposed,
		validate: (value) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(value.trim()) || "Use a camelCase name: letters and digits, starting with a letter (e.g. jonasComputer)."
	}, {
		command: { name: () => "use-my-computer" },
		inputs: {
			argv: [],
			arguments: [],
			options: []
		}
	})).trim();
}
/** "Jonas’s-MacBook-Pro.local" → "jonasComputer". A friendly default, always editable. */
function proposeComputerName() {
	const cleaned = hostname().replace(/\.local$/i, "").split(/[^a-zA-Z0-9]+/).filter(Boolean)[0]?.toLowerCase().replace(/[^a-z0-9]/g, "");
	return cleaned ? `${cleaned}Computer` : "myComputer";
}
/** Provision belongs to this connection; signals release it before closing the transport.
* A disconnect ends sharing visibly. The caller explicitly starts each new share. */
async function shareMyComputer(input) {
	try {
		var _usingCtx$2 = _usingCtx();
		const name = input.name || await askComputerName();
		const project = _usingCtx$2.u(await input.connection.session.projects.get(input.project));
		const emit = (event) => {
			if (input.json) process.stdout.write(`${JSON.stringify(event)}\n`);
		};
		_usingCtx$2.u(await project.provide(`itx.${name}`, new MyComputer(emit)));
		emit({
			type: "status",
			loggedIn: true,
			name
		});
		console.error(`itx.${name} is live for project ${input.project}. Press Ctrl-C to stop sharing.`);
		console.error(`Tell your agent to call itx.${name}.__describe() to learn how to use this Mac.`);
		let stop = () => {};
		const stopped = new Promise((resolve) => {
			stop = () => resolve("stopped");
		});
		process.once("SIGINT", stop);
		process.once("SIGTERM", stop);
		if (input.json) {
			process.stdin.once("end", stop);
			process.stdin.resume();
			if (process.stdin.readableEnded) stop();
		}
		try {
			const outcome = await Promise.race([stopped, input.connection.closed]);
			if (outcome !== "stopped") throw new Error(`Computer sharing disconnected (${outcome.code}: ${outcome.reason || "connection closed"}). Run iterate use-my-computer again to reconnect.`);
		} finally {
			process.removeListener("SIGINT", stop);
			process.removeListener("SIGTERM", stop);
			if (input.json) {
				process.stdin.removeListener("end", stop);
				process.stdin.pause();
			}
		}
	} catch (_) {
		_usingCtx$2.e = _;
	} finally {
		_usingCtx$2.d();
	}
}
/** Run an AppleScript snippet, throwing if osascript reports failure (e.g. the human cancels). */
async function osascript(script) {
	const result = await run("osascript", ["-e", script]);
	if (result.exitCode !== 0) throw new Error(`osascript failed (exit ${result.exitCode}): ${result.stderr.trim() || "no output"}`);
	return result;
}
/** Escape a string for embedding in an AppleScript double-quoted literal. */
const escapeForAppleScript = (text) => text.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\r/g, "\\r").replace(/\n/g, "\\n");
//#endregion
//#region src/cli/cli.ts
const isAgent = isCodingAgent(process$1.env);
let configFlagOverride;
const consumeCliStringFlag = (flagName) => {
	const args = process$1.argv.slice(2);
	const flagIndex = args.indexOf(flagName);
	if (flagIndex === -1) return void 0;
	const value = args[flagIndex + 1];
	if (!value || value.startsWith("-")) throw new Error(`${flagName} requires a value`);
	process$1.argv.splice(flagIndex + 2, 2);
	return value;
};
const hasConfig = (configFile, name) => name === "prd" || Boolean(configFile.configs?.[name]);
/**
* Resolve which config name to use.
* Priority: --config flag > workspace match (walk up from cwd) > default > single-config auto > built-in prd
*/
const resolveConfigName = (workspacePath) => {
	const configFile = readConfigFile();
	if (configFlagOverride) {
		if (!hasConfig(configFile, configFlagOverride)) return /* @__PURE__ */ new Error(`Config "${configFlagOverride}" not found. Available: ${Object.keys(configFile.configs || {}).join(", ") || "(none)"}`);
		return configFlagOverride;
	}
	let dir = workspacePath;
	while (dir && dir !== "/") {
		const match = configFile.workspaces?.[dir];
		if (match) {
			if (!hasConfig(configFile, match)) return /* @__PURE__ */ new Error(`Workspace "${dir}" maps to config "${match}" which doesn't exist.`);
			return match;
		}
		dir = dirname(dir);
	}
	if (configFile.default) {
		if (!hasConfig(configFile, configFile.default)) return /* @__PURE__ */ new Error(`Default config "${configFile.default}" doesn't exist. Available: ${Object.keys(configFile.configs || {}).join(", ") || "(none)"}`);
		return configFile.default;
	}
	const configNames = Object.keys(configFile.configs || {});
	if (configNames.length === 1) return configNames[0];
	return "prd";
};
function resolveConfig(workspacePath, options) {
	const result = (() => {
		const name = resolveConfigName(workspacePath);
		if (name instanceof Error) return name;
		const config = readConfig(name);
		if (config instanceof Error) return config;
		return {
			name,
			config
		};
	})();
	if (result instanceof Error && options?.throw) throw result;
	return result;
}
/**
* Resolve the config's OAuth credentials before connecting.
* OAuth sessions are refreshed when possible.
*/
const storedCredentials = async (config, configName) => {
	let session = config.session;
	if (!session) throw new Error(`Not logged in to ${config.osBaseUrl}. Run \`iterate login\` first.`);
	if (sessionNeedsRefresh(session)) {
		session = await refreshOAuthSession({
			issuer: config.osBaseUrl,
			session
		});
		config.session = session;
		updateConfigSession(configName, session);
	}
	if (session.token) return {
		type: "bearer",
		token: session.token
	};
	throw new Error(`No bearer token for ${config.osBaseUrl}. Run \`iterate login\` again.`);
};
const sessionNeedsRefresh = (session) => {
	if (!session.expiresAt) return false;
	const expiresAt = Date.parse(session.expiresAt);
	return Number.isFinite(expiresAt) && expiresAt <= Date.now() + 6e4;
};
const credentialsForConfig = async (config, name) => {
	const secret = process$1.env.APP_CONFIG_SECRETS__ADMIN_BEARER?.trim();
	if (secret) return {
		type: "admin-secret",
		secret
	};
	const token = process$1.env.ITERATE_BEARER_TOKEN?.trim();
	if (token) return {
		type: "bearer",
		token
	};
	return await storedCredentials(config, name);
};
/** THE `tokens` COMMANDS' OWN SIGN-IN, a step up from the stored login: a person's keys are managed
*  only with the `account` scope, which `iterate login` does not ask for, so the refresh token a
*  config file keeps on disk mints nothing. Each `tokens` command signs in in the browser asking for
*  `account`, holds that session in memory for its one call, and ends it before it returns (the key
*  it minted outlives it, and lists it as `mintedBy`). Whatever the environment holds is not used: a
*  key in `ITERATE_BEARER_TOKEN` has `iterate` alone, and the operator's bearer names no person. */
const withAccountSession = async (run) => {
	try {
		var _usingCtx$1 = _usingCtx();
		const { config } = resolveConfig(process$1.cwd(), { throw: true });
		console.error(`Signing in to ${config.osBaseUrl} to manage your personal access tokens...`);
		const stepUp = await oauthLogin({
			issuer: config.osBaseUrl,
			openBrowser: openBrowserForLogin,
			scopes: ["iterate", "account"]
		});
		const connection = _usingCtx$1.u(await connectIterate({
			baseUrl: config.osBaseUrl,
			auth: {
				type: "bearer",
				token: stepUp.token
			}
		}));
		try {
			return await run(connection.session);
		} finally {
			await connection.session.logout().catch((error) => {
				console.error(`Could not end this sign-in (${error instanceof Error ? error.message : String(error)}); end it from the Dash's Sessions page.`);
			});
		}
	} catch (_) {
		_usingCtx$1.e = _;
	} finally {
		_usingCtx$1.d();
	}
};
const connectConfigured = async () => {
	const resolved = resolveConfig(process$1.cwd(), { throw: true });
	return {
		resolved,
		connection: await connectIterate({
			baseUrl: resolved.config.osBaseUrl,
			auth: await credentialsForConfig(resolved.config, resolved.name)
		})
	};
};
const selectProject = async (connection, configured) => {
	if (configured) return configured;
	const projects = await connection.session.projects.list();
	if (projects.length === 1) return projects[0].id;
	throw new Error(`Pass --project or set defaultProject in ${CONFIG_PATH}. Accessible projects: ${projects.map((p) => `${p.slug} (${p.id})`).join(", ") || "none"}.`);
};
const openUrlInBrowser = async (url) => {
	const { execFile } = await import("node:child_process");
	const { command, args } = process$1.platform === "darwin" ? {
		command: "open",
		args: [url]
	} : process$1.platform === "win32" ? {
		command: "cmd",
		args: [
			"/c",
			"start",
			"",
			url
		]
	} : {
		command: "xdg-open",
		args: [url]
	};
	execFile(command, args, (error) => {
		if (error) console.error(`Could not open a browser: ${error.message}. Open the URL above manually.`);
	});
};
const readErrorBody = async (response) => {
	const text = await response.text();
	return text.length > 300 ? `${text.slice(0, 300)}...` : text;
};
/** The authorization URL, printed (an agent, or `ITERATE_SKIP_BROWSER_OPEN=1`, opens it itself)
*  and opened in the person's browser. */
const openBrowserForLogin = async (url) => {
	console.error(`\nOpening browser to authenticate with Iterate:\n`);
	console.error(`  ${url.href}\n`);
	if (!isAgent && process$1.env.ITERATE_SKIP_BROWSER_OPEN !== "1") await openUrlInBrowser(url.href);
};
const loginToResolvedConfig = async (resolved) => {
	try {
		var _usingCtx3 = _usingCtx();
		const { config } = resolved;
		console.error(`Logging in to ${config.osBaseUrl}...`);
		const oauthResult = await oauthLogin({
			issuer: config.osBaseUrl,
			openBrowser: openBrowserForLogin
		});
		config.session = oauthResult;
		await _usingCtx3.u(await connectIterate({
			baseUrl: config.osBaseUrl,
			auth: {
				type: "bearer",
				token: oauthResult.token
			}
		})).session.whoami();
		updateConfigSession(resolved.name, oauthResult);
		return oauthResult;
	} catch (_) {
		_usingCtx3.e = _;
	} finally {
		_usingCtx3.d();
	}
};
const launcherProcedures = {
	ping: os.input(z.object({})).handler(async () => {
		try {
			var _usingCtx4 = _usingCtx();
			const { connection } = await connectConfigured();
			return {
				message: "Iterate session valid",
				principal: await _usingCtx4.u(connection).session.whoami()
			};
		} catch (_) {
			_usingCtx4.e = _;
		} finally {
			_usingCtx4.d();
		}
	}),
	login: os.input(z.object({})).meta({ description: "Authenticate with Iterate via browser OAuth" }).handler(async () => {
		const session = await loginToResolvedConfig(resolveConfig(process$1.cwd(), { throw: true }));
		return {
			message: "Logged in successfully",
			expiresAt: session.expiresAt,
			scope: session.scope
		};
	}),
	logout: os.input(z.object({})).meta({ description: "Remove the current config's stored session" }).handler(async () => {
		const resolved = resolveConfig(process$1.cwd(), { throw: true });
		removeConfigSession(resolved.name);
		return { message: `Logged out from ${resolved.name}` };
	}),
	orgs: { list: os.input(z.object({})).handler(async () => {
		try {
			var _usingCtx5 = _usingCtx();
			const { connection } = await connectConfigured();
			return await _usingCtx5.u(connection).session.organizations.list();
		} catch (_) {
			_usingCtx5.e = _;
		} finally {
			_usingCtx5.d();
		}
	}) },
	projects: { list: os.input(z.object({})).handler(async () => {
		try {
			var _usingCtx6 = _usingCtx();
			const { connection } = await connectConfigured();
			return await _usingCtx6.u(connection).session.projects.list();
		} catch (_) {
			_usingCtx6.e = _;
		} finally {
			_usingCtx6.d();
		}
	}) },
	repl: os.input(z.object({
		project: z.string().optional().describe("Project id or slug"),
		context: z.string().default("/").describe("Context path within the project")
	})).meta({ description: "Open a local Node REPL with itx and RpcTarget in scope" }).handler(async ({ input }) => {
		try {
			var _usingCtx7 = _usingCtx();
			const { resolved, connection } = await connectConfigured();
			const owned = _usingCtx7.u(connection);
			const project = input.project || resolved.config.defaultProject;
			if (!project && input.context !== "/") throw new Error("--context requires --project or a configured defaultProject.");
			const root = _usingCtx7.u(project ? await owned.session.projects.get(project) : null);
			const context = _usingCtx7.u(root ? await root.cd(input.context) : null);
			console.error(`Connected to ${resolved.config.osBaseUrl}, ${project ? `project ${project}, context ${input.context}` : "session"}. Use .exit to quit.`);
			const server = repl.start({
				prompt: "itx> ",
				useGlobal: true
			});
			const initialize = () => {
				server.context.itx = context || owned.session;
				server.context.RpcTarget = RpcTarget;
			};
			initialize();
			server.on("reset", initialize);
			try {
				const outcome = await Promise.race([new Promise((resolve) => server.once("exit", () => resolve("exit"))), owned.closed]);
				if (outcome !== "exit") throw new Error(`REPL disconnected (${outcome.code}: ${outcome.reason || "connection closed"}). Start a new REPL to reconnect.`);
			} finally {
				server.close();
			}
		} catch (_) {
			_usingCtx7.e = _;
		} finally {
			_usingCtx7.d();
		}
	}),
	itx: { run: os.input(z.object({
		project: z.string().optional().describe("Project id or slug; defaults to config.defaultProject"),
		context: z.string().default("/").describe("Context path within the project"),
		eval: z.string().optional().describe("Script body with itx in scope; use return for the result"),
		file: z.string().optional().describe("Read the script from a UTF-8 file; - reads stdin")
	}).refine((input) => Boolean(input.eval) !== Boolean(input.file), "Specify exactly one of --eval or --file")).meta({ description: "Run an itx script once on Iterate" }).handler(async ({ input }) => {
		try {
			var _usingCtx8 = _usingCtx();
			let script = input.eval;
			if (input.file === "-") {
				const chunks = [];
				for await (const chunk of process$1.stdin) chunks.push(Buffer.from(chunk));
				script = Buffer.concat(chunks).toString("utf8");
			} else if (input.file) script = await readFile(input.file, "utf8");
			const { resolved, connection } = await connectConfigured();
			const owned = _usingCtx8.u(connection);
			const project = await selectProject(owned, input.project || resolved.config.defaultProject);
			const root = _usingCtx8.u(await owned.session.projects.get(project));
			return await _usingCtx8.u(await root.cd(input.context)).run(`async (itx) => {\n${script}\n}`);
		} catch (_) {
			_usingCtx8.e = _;
		} finally {
			_usingCtx8.d();
		}
	}) },
	tokens: {
		create: os.input(z.object({
			name: z.string().trim().min(1).describe("What the token is for, as the sessions list shows it"),
			project: z.array(z.string()).min(1).describe("The projects the token may reach, by id or slug"),
			expiresInDays: z.number().int().positive().default(30).describe("Days until the token expires"),
			neverExpires: z.boolean().optional().describe("A token that ends only when it is revoked")
		})).meta({ description: "Mint a personal access token: your bearer at /api, at /mcp and on the projects' hosts, printed once (signs in with the account scope for this one call)" }).handler(async ({ input }) => withAccountSession(async (session) => {
			const reachable = await session.projects.list();
			const projects = input.project.map((ref) => {
				const project = reachable.find((row) => row.id === ref || row.slug === ref);
				if (!project) throw new Error(`No project ${JSON.stringify(ref)} in this session. Accessible projects: ${reachable.map((row) => row.slug).join(", ") || "none"}.`);
				return project.id;
			});
			return await session.grants.mint({
				name: input.name,
				projects,
				expiresAt: input.neverExpires ? void 0 : Date.now() + input.expiresInDays * 24 * 36e5
			});
		})),
		list: os.input(z.object({})).meta({ description: "List your personal access tokens, never their bearers (signs in with the account scope for this one call)" }).handler(async () => withAccountSession(async (session) => {
			const { items } = await session.grants.list();
			return items.filter((item) => item.kind === "personal" || item.kind === "device").map(({ id, name, projects, expiresAt, lastUsedAt, mintedBy }) => ({
				id,
				name,
				projects: projects?.join(", "),
				expiresAt: expiresAt ? new Date(expiresAt).toISOString() : "never",
				lastUsedAt: lastUsedAt ? new Date(lastUsedAt).toISOString() : null,
				mintedBy: items.find((item) => item.id === mintedBy)?.name ?? `${mintedBy} (no longer listed)`
			}));
		})),
		revoke: os.input(z.object({ id: z.string().meta({ positional: true }).describe("The token's id, pat_…") })).meta({ description: "Revoke a personal access token: refused everywhere at once (signs in with the account scope for this one call)" }).handler(async ({ input }) => withAccountSession(async (session) => {
			await session.grants.end(input.id);
			return { revoked: input.id };
		}))
	},
	mcp: { claude: os.input(z.object({ exec: z.boolean().optional().describe("Run Claude Code in this terminal instead of printing its command") })).meta({ description: "Claude Code against the config's /mcp with a personal access token (ITERATE_BEARER_TOKEN): checks tools/list, then prints or runs the command" }).handler(async ({ input }) => {
		const token = process$1.env.ITERATE_BEARER_TOKEN?.trim();
		if (!token) throw new Error("iterate mcp claude needs ITERATE_BEARER_TOKEN, a personal access token of the deployment the config names: `iterate tokens create --name claude --project <slug>` mints one.");
		const resolved = resolveConfig(process$1.cwd(), { throw: true });
		const { mcpUrl, tools } = await preflightMcp(resolved.config.osBaseUrl, token);
		console.error(`${mcpUrl} accepted the bearer; tools: ${tools.join(", ")}`);
		if (!input.exec) {
			console.log(claudeMcpCommand(mcpUrl));
			return;
		}
		const claude = spawnSync("claude", claudeMcpArgs({
			mcpUrl,
			token
		}), { stdio: "inherit" });
		if (claude.error) throw new Error(`Could not start claude: ${claude.error.message}`, { cause: claude.error });
		process$1.exit(claude.status ?? 1);
	}) },
	menubar: os.input(z.object({ project: z.string().optional().describe("Project id or slug") })).meta({ description: "Launch the macOS menu bar for sign-in and computer sharing" }).handler(async ({ input }) => {
		const resolved = resolveConfig(process$1.cwd(), { throw: true });
		const project = input.project || resolved.config.defaultProject;
		if (!project) throw new Error("menubar needs --project or a configured defaultProject.");
		await launchMenubarApp({
			configName: resolved.name,
			project,
			log: console.error
		});
	}),
	useMyComputer: os.input(z.object({
		project: z.string().optional().describe("Project id or slug"),
		json: z.boolean().optional().describe("Emit menu-bar events as NDJSON; stop on stdin EOF"),
		name: z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/).optional().describe("Computer capability name, e.g. jonasComputer")
	})).meta({ description: "Share this Mac with a project until Ctrl-C" }).handler(async ({ input }) => {
		try {
			var _usingCtx9 = _usingCtx();
			if (process$1.platform !== "darwin") throw new Error("use-my-computer requires macOS (AppleScript and Swift).");
			const { resolved, connection } = await connectConfigured();
			const owned = _usingCtx9.u(connection);
			await shareMyComputer({
				connection: owned,
				project: await selectProject(owned, input.project || resolved.config.defaultProject),
				name: input.name,
				json: input.json
			});
		} catch (_) {
			_usingCtx9.e = _;
		} finally {
			_usingCtx9.d();
		}
	}),
	tunnel: os.input(z.object({
		port: z.number().int().min(1).max(65535).meta({ positional: true }).describe("The local port to serve, e.g. Vite's 5173"),
		name: z.string().optional().describe("The tunnel's name and routing slug: the tunnel is <name>--<project> (default: a random one)"),
		hostname: z.string().optional().describe("Serve on this hostname of the project instead of the name's, e.g. hello.tunnels.example.com"),
		public: z.boolean().optional().describe("Anyone may use it (default: signed-in project members only)"),
		project: z.string().optional().describe("Project id or slug")
	})).meta({ description: "Serve a local port on a project host until Ctrl-C, WebSockets included" }).handler(async ({ input }) => {
		const { resolved, connection } = await connectConfigured();
		let project;
		try {
			project = await selectProject(connection, input.project || resolved.config.defaultProject);
		} catch (error) {
			connection[Symbol.dispose]();
			throw error;
		}
		await runTunnel({
			connection,
			reconnect: async () => (await connectConfigured()).connection,
			project,
			port: input.port,
			tunnelName: input.name,
			hostname: input.hostname,
			public: input.public
		});
	}),
	provide: os.input(z.object({
		file: z.string().meta({ positional: true }).describe("A .ts, .mjs or .js file whose default export, ({ itx }) => ({ someFunction() {} }), answers the functions to lend"),
		name: z.string().optional().describe("The capability's name, itx.<name> (default: the file's, whatsapp.ts → whatsapp)"),
		project: z.string().optional().describe("Project id or slug")
	})).meta({ description: "Lend a local file's functions to a project as itx.<name> until Ctrl-C; the file's folder installs its own dependencies" }).handler(async ({ input }) => {
		const file = await importProvidedFile(input.file);
		const name = input.name || nameOfFile(input.file);
		const { resolved, connection } = await connectConfigured();
		let project;
		try {
			project = await selectProject(connection, input.project || resolved.config.defaultProject);
		} catch (error) {
			connection[Symbol.dispose]();
			throw error;
		}
		await runProvide({
			connection,
			reconnect: async () => (await connectConfigured()).connection,
			project,
			file,
			name
		});
	}),
	config: {
		get: os.input(z.object({})).meta({
			default: true,
			description: "Show config, resolved target, and session status"
		}).handler(async () => {
			const configFile = readConfigFile();
			const resolved = resolveConfig(process$1.cwd());
			const configs = configFile.configs || {};
			const sessions = Object.fromEntries(Object.entries(configs).map(([name, cfg]) => {
				if (!cfg.session) return [name, null];
				return [name, {
					hasToken: Boolean(cfg.session?.token),
					expiresAt: cfg.session?.expiresAt,
					expired: cfg.session?.expiresAt ? new Date(cfg.session.expiresAt) < /* @__PURE__ */ new Date() : false
				}];
			}));
			if (resolved instanceof Error) return {
				configPath: CONFIG_PATH,
				error: resolved.message
			};
			return {
				configPath: CONFIG_PATH,
				config: resolved.name,
				...resolved.config,
				session: sessions[resolved.name]
			};
		}),
		list: os.input(z.object({})).meta({ description: "List all named configs" }).handler(async () => {
			const configFile = readConfigFile();
			const currentName = resolveConfigName(process$1.cwd());
			const configs = {
				["prd"]: {},
				...configFile.configs || {}
			};
			return {
				configs: Object.fromEntries(Object.entries(configs).map(([name, cfg]) => [name, {
					osBaseUrl: Config.parse(cfg).osBaseUrl,
					active: name === currentName ? true : void 0
				}])),
				default: configFile.default
			};
		}),
		set: os.input(z.object({
			name: z.string().describe("Config name (e.g. dev, prd, preview)"),
			osBaseUrl: z.string().optional().describe("Base URL for OS API (e.g. https://os.iterate.com)"),
			defaultProject: z.string().optional().describe("Default project id or slug"),
			setDefault: z.boolean().optional().describe("Set as the default config"),
			setWorkspace: z.boolean().optional().describe("Map current directory to this config")
		})).meta({ description: "Create or update a named config" }).handler(async ({ input }) => {
			const configFile = readConfigFile();
			configFile.configs ||= {};
			configFile.configs[input.name] ||= Config.parse({});
			if (input.osBaseUrl && input.osBaseUrl !== configFile.configs[input.name].osBaseUrl) {
				configFile.configs[input.name].osBaseUrl = input.osBaseUrl;
				delete configFile.configs[input.name].session;
			}
			if (input.defaultProject) configFile.configs[input.name].defaultProject = input.defaultProject;
			if (input.setDefault) configFile.default = input.name;
			if (input.setWorkspace) {
				configFile.workspaces ||= {};
				configFile.workspaces[process$1.cwd()] = input.name;
			}
			writeConfigFile(configFile);
			return {
				configPath: CONFIG_PATH,
				config: {
					...configFile.configs[input.name],
					session: void 0
				}
			};
		}),
		use: os.input(z.object({ name: z.string().meta({ positional: true }).describe("Config name to set as default") })).meta({ description: "Set the default config" }).handler(async ({ input }) => {
			const configFile = readConfigFile();
			if (input.name !== "prd" && !configFile.configs?.[input.name]) throw new Error(`Config "${input.name}" not found. Available: ${Object.keys(configFile.configs || {}).join(", ") || "(none)"}`);
			configFile.default = input.name;
			writeConfigFile(configFile);
			return { default: input.name };
		}),
		current: os.input(z.object({})).meta({ description: "Show which config is active and why" }).handler(async () => {
			const resolved = resolveConfig(process$1.cwd(), { throw: true });
			return {
				name: resolved.name,
				config: {
					...resolved.config,
					session: resolved.config.session ? { loggedIn: true } : void 0
				},
				resolvedVia: configFlagOverride ? "--config flag" : "workspace mapping or default"
			};
		})
	}
};
const runCli = async () => {
	configFlagOverride = consumeCliStringFlag("--config");
	if (process$1.argv.length === 2) process$1.argv.push("--help");
	await createCli({
		router: launcherProcedures,
		name: "iterate",
		description: "Iterate CLI. Run itx scripts, authenticate, share your computer, and provide local code."
	}).run({
		prompts: !isAgent && process$1.stdin.isTTY && process$1.stdout.isTTY,
		logger: yamlTableConsoleLogger
	});
};
/**
* The deployment's MCP endpoint, proven to accept `token` by a `tools/list`, which the platform's
* stateless handler (core/os/src/mcp.ts) answers without an `initialize` first.
*
* Starts at `<osBaseUrl>/mcp`. A deployment with its own MCP origin answers there with a 308 to it
* (core/os/src/worker.ts: os.iterate.com/mcp → https://mcp.iterate.com/). The redirect is followed
* here, bearer kept, because fetch drops `Authorization` on a cross-origin redirect
* (https://fetch.spec.whatwg.org/#http-redirect-fetch), which would read as a rejected bearer; the
* returned URL is the final one, so Claude Code never meets the redirect.
*/
const preflightMcp = async (osBaseUrl, token) => {
	let mcpUrl = new URL("/mcp", osBaseUrl).href;
	let response = await postToolsList(mcpUrl, token);
	const location = response.headers.get("location");
	if ((response.status === 307 || response.status === 308) && location) {
		mcpUrl = new URL(location, mcpUrl).href;
		response = await postToolsList(mcpUrl, token);
	}
	if (response.status === 401) throw new Error(`${mcpUrl} rejected the bearer (401). ITERATE_BEARER_TOKEN must be a live personal access token of the deployment at ${osBaseUrl}.`);
	if (!response.ok) throw new Error(`tools/list on ${mcpUrl} failed (${response.status}): ${await readErrorBody(response)}`);
	const body = await response.text();
	const json = response.headers.get("content-type")?.startsWith("text/event-stream") ? body.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n") : body;
	const parsed = z.object({ result: z.object({ tools: z.array(z.object({ name: z.string() })) }) }).safeParse(JSON.parse(json));
	if (!parsed.success) throw new Error(`tools/list on ${mcpUrl} answered no tool list: ${json.slice(0, 300)}`);
	return {
		mcpUrl,
		tools: parsed.data.result.tools.map((tool) => tool.name)
	};
};
const postToolsList = (mcpUrl, token) => fetch(mcpUrl, {
	method: "POST",
	redirect: "manual",
	signal: AbortSignal.timeout(3e4),
	headers: {
		authorization: `Bearer ${token}`,
		"content-type": "application/json",
		accept: "application/json, text/event-stream"
	},
	body: JSON.stringify({
		jsonrpc: "2.0",
		id: 1,
		method: "tools/list",
		params: {}
	})
});
/**
* Claude Code's arguments for one HTTP MCP server named `iterate` and no other: `--mcp-config`
* takes the JSON inline, `--strict-mcp-config` ignores the user's own MCP servers
* (https://code.claude.com/docs/en/cli-reference, https://code.claude.com/docs/en/mcp).
*/
const claudeMcpArgs = (input) => [
	"--mcp-config",
	JSON.stringify({ mcpServers: { iterate: {
		type: "http",
		url: input.mcpUrl,
		headers: { Authorization: `Bearer ${input.token}` }
	} } }),
	"--strict-mcp-config"
];
/** `claude` with `claudeMcpArgs` as a shell command that reads the key from `$ITERATE_BEARER_TOKEN`
*  when it runs: printed, it carries no key. */
const claudeMcpCommand = (mcpUrl) => {
	const placeholder = "ITERATE_BEARER_TOKEN_PLACEHOLDER";
	return shellCommand(["claude", ...claudeMcpArgs({
		mcpUrl,
		token: placeholder
	})]).replace(placeholder, `'"$ITERATE_BEARER_TOKEN"'`);
};
/** POSIX-shell-quoted: plain words bare, anything else single-quoted with `'` spelled `'\''`. */
const shellCommand = (argv) => argv.map((arg) => /^[\w./:@%+=,-]+$/.test(arg) ? arg : `'${arg.replaceAll("'", `'\\''`)}'`).join(" ");
//#endregion
export { claudeMcpArgs, claudeMcpCommand, preflightMcp, runCli, shellCommand };

//# sourceMappingURL=cli.mjs.map