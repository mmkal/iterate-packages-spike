//#region src/lib.ts
/** A plain Error carrying `code` (+ optional `data`) as own enumerable properties. */
function codedError(code, message, data) {
	return Object.assign(new Error(message), data === void 0 ? { code } : {
		code,
		data
	});
}
/** The code of an error that crossed any number of hops — undefined for uncoded errors. */
function errorCode(error) {
	return typeof error === "object" && error && "code" in error ? error.code : void 0;
}
/** OUR MARK (core/os cause.ts): what the platform sends — a request, a mail — carries the cause of
*  the code that sent it here, as JSON; a request that comes back with it resumes its chain. */
const ITERATE_CAUSE_HEADER = "X-Iterate-Cause";
/** What marks a 508 as an act refused past the loop limit (core/os unavailable.ts). */
const LOOP_LIMIT_HEADER = "iterate-loop-limit";
/** An answer refused past the loop limit — a 508 marked so — as the LOOP_LIMIT refusal it is,
*  already recorded where it was met; none for any other answer. */
async function loopLimitOf(answer) {
	if (answer.status !== 508 || !answer.headers.has("iterate-loop-limit")) return void 0;
	return codedError("LOOP_LIMIT", (await answer.text()).trim(), { recorded: true });
}
const MAX = {
	message: 1024,
	stack: 16384,
	string: 256,
	attributeKeys: 32
};
let forwardIssue;
/** Also hand every issue to `forward` (one per isolate; the last call wins). It runs inside
*  `reportIssue`'s armor: a throw is swallowed. */
function forwardIssues(forward) {
	forwardIssue = forward;
}
/** Print ONE bounded console.error line for an unexpected failure; never throws. */
function reportIssue(failureSite, caught, attributes) {
	try {
		const bounded = {};
		for (const [key, value] of Object.entries(attributes || {}).slice(0, MAX.attributeKeys)) {
			if (value === void 0) continue;
			bounded[key.slice(0, MAX.string)] = typeof value === "string" ? value.slice(0, MAX.string) : value;
		}
		const code = errorCode(caught);
		const error = caught instanceof Error ? {
			type: (caught.name || "Error").slice(0, MAX.string),
			message: caught.message.slice(0, MAX.message),
			...caught.stack && { stack: caught.stack.slice(0, MAX.stack) }
		} : typeof caught === "object" && caught ? { type: "ObjectThrown" } : {
			type: `${typeof caught}Thrown`,
			message: String(caught).slice(0, MAX.message)
		};
		console.error({
			...bounded,
			event: "issue",
			failureSite: failureSite.slice(0, MAX.string),
			code,
			error
		});
		forwardIssue?.({
			failureSite,
			caught,
			attributes: bounded
		});
	} catch {}
}
/** Release each of `rpcSessions`, the last first. The answer they served is already in, so a release
*  that throws is reported, never made the call's failure. */
function releaseRpcSessions(rpcSessions) {
	for (const rpcSession of [...rpcSessions].reverse()) try {
		rpcSession?.[Symbol.dispose]?.();
	} catch (error) {
		reportIssue("itx-expression.release-rpc-session", error);
	}
}
const isRecord = (v) => typeof v === "object" && !!v && !Array.isArray(v);
const escape = (seg) => String(seg).replaceAll("~", "~0").replaceAll("/", "~1");
/** Structural deep-equal over plain JSON values — order-insensitive, unbudgeted (JSON is acyclic).
*  THE one deep-equal: the live-state diff's "don't emit" test AND the idempotency-body compare
*  (re-exported through stream/processor.ts). The `Object.hasOwn(b, k)` guard is load-bearing — without
*  it, two objects with the same key COUNT but different key SETS compare equal. */
function jsonEqual(a, b) {
	if (Object.is(a, b)) return true;
	if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => jsonEqual(v, b[i]));
	if (isRecord(a) && isRecord(b)) {
		const ka = Object.keys(a);
		return ka.length === Object.keys(b).length && ka.every((k) => Object.hasOwn(b, k) && jsonEqual(a[k], b[k]));
	}
	return false;
}
/** Structural diff `a → b`, or undefined when deep-equal (the producer's "don't emit" signal).
*  Objects recurse per key; arrays get the chat-log fast paths (pure append → `add …/-` ops,
*  pure tail-truncate → `remove` ops) and are replaced wholesale on any middle divergence —
*  the LiveView trade: optimize the growing log, full-render the rewrite.
*  Both sides are JSON-normalized first — the wire is JSON, so the diff must see exactly what
*  the wire will carry: undefined-valued keys vanish, Dates become their ISO strings, array
*  holes become null. Diffing what you didn't normalize is how a Date change goes silent. */
function diff(a, b) {
	const json = (v) => {
		const s = JSON.stringify(v);
		return s ? JSON.parse(s) : void 0;
	};
	return walk(json(a), json(b), "");
}
function walk(a, b, path) {
	if (jsonEqual(a, b)) return void 0;
	if (Array.isArray(a) && Array.isArray(b)) {
		const shared = Math.min(a.length, b.length);
		let p = 0;
		while (p < shared && jsonEqual(a[p], b[p])) p++;
		if (p === a.length) return b.slice(p).map((value) => ({
			op: "add",
			path: `${path}/-`,
			value
		}));
		if (p === b.length) return a.slice(p).map((_, i) => ({
			op: "remove",
			path: `${path}/${a.length - 1 - i}`
		}));
		return [{
			op: "replace",
			path,
			value: b
		}];
	}
	if (isRecord(a) && isRecord(b)) {
		const ops = [];
		for (const k of Object.keys(a)) if (!Object.hasOwn(b, k)) ops.push({
			op: "remove",
			path: `${path}/${escape(k)}`
		});
		for (const k of Object.keys(b)) if (!Object.hasOwn(a, k)) ops.push({
			op: "add",
			path: `${path}/${escape(k)}`,
			value: b[k]
		});
		else ops.push(...walk(a[k], b[k], `${path}/${escape(k)}`) ?? []);
		return ops.length ? ops : void 0;
	}
	return [{
		op: "replace",
		path,
		value: b
	}];
}
/** Apply a patch non-mutatingly (clone-then-mutate). The client half of `diff` — exported
*  through the SDK so subscribers need no third-party json-patch dependency. */
function applyPatch(doc, ops) {
	let root = structuredClone(doc);
	for (const op of ops) {
		if (op.path === "") {
			if (op.op === "remove") throw new Error("applyPatch: cannot remove the document root");
			root = op.value;
			continue;
		}
		const segs = op.path.slice(1).split("/").map((s) => s.replaceAll("~1", "/").replaceAll("~0", "~"));
		for (const s of segs) if (s === "__proto__") throw new Error(`applyPatch: refusing __proto__ in path ${op.path}`);
		const last = segs.pop();
		let parent = root;
		for (const s of segs) {
			parent = Array.isArray(parent) ? parent[Number(s)] : isRecord(parent) && Object.hasOwn(parent, s) ? parent[s] : void 0;
			if (parent === void 0) throw new Error(`applyPatch: missing path ${op.path}`);
		}
		if (Array.isArray(parent)) {
			if (op.op === "add") {
				if (last === "-") parent.push(op.value);
				else parent.splice(Number(last), 0, op.value);
			} else if (op.op === "replace") parent[Number(last)] = op.value;
			else parent.splice(Number(last), 1);
		} else if (isRecord(parent)) {
			if (op.op === "remove") delete parent[last];
			else parent[last] = op.value;
		} else throw new Error(`applyPatch: path ${op.path} traverses a non-container`);
	}
	return root;
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
/** Bytes to base64, chunked so a long buffer cannot overflow the call stack's argument list. */
function bytesToBase64(bytes) {
	let binary = "";
	for (let index = 0; index < bytes.length; index += 32768) binary += String.fromCharCode(...bytes.subarray(index, index + 32768));
	return btoa(binary);
}
/** Whether `request` may spend the cookies it carries: its `Origin` header is this origin, or absent
*  (a non-browser client — curl, a script). A browser stamps the page's origin on every WebSocket
*  handshake, every cross-site fetch and every form POST, so a foreign origin means a foreign site
*  drove the request with the visitor's cookie riding along. A malformed `Origin` (the literal
*  `null` of a sandboxed document included) is foreign. */
function isSameOriginBrowserRequest(request) {
	const origin = request.headers.get("origin");
	if (origin === null) return true;
	try {
		return new URL(origin).origin === new URL(request.url).origin;
	} catch {
		return false;
	}
}
/** The value of the cookie `name` in a `Cookie` header, or null. */
function cookieValueOf(cookieHeader, name) {
	for (const part of (cookieHeader || "").split(";")) {
		const separator = part.indexOf("=");
		if (separator < 0) continue;
		if (part.slice(0, separator).trim() === name) return part.slice(separator + 1).trim();
	}
	return null;
}
/** `next` as a path on `origin`, else "/" — a redirect never leaves the host: `//evil.example`,
*  `/\evil.example` and an absolute URL all resolve to a foreign origin and fall back to "/". The
*  issuer's login redirect uses it too (core/os issuer-pages.ts). */
function sameOriginPath(next, origin) {
	try {
		const url = new URL(next, origin);
		return url.origin === origin ? url.pathname + url.search : "/";
	} catch {
		return "/";
	}
}
/** Only plain HTTP loopback origins use development login and client registration. */
function isLocalOrigin(origin) {
	const url = new URL(origin);
	return url.protocol === "http:" && (url.hostname === "localhost" || url.hostname.endsWith(".localhost") || url.hostname === "127.0.0.1");
}
/** Resolve a `cd` target against a context's own path — the one resolver every `cd` (the edge
*  method, the built-in root, the library's relative handles) shares. Absolute ("/agents/x") stands alone; relative
*  ("agents/x", "../inbox", ".") joins onto `base`. `.` and `..` resolve; the root cannot be
*  escaped ("/.." is "/"). The result is canonical: leading slash, no trailing slash but for "/". */
function resolveContextPath(basePath, contextPath) {
	const segments = [];
	for (const seg of `${contextPath.startsWith("/") ? "" : basePath}/${contextPath}`.split("/")) {
		if (seg === "" || seg === ".") continue;
		if (seg === "..") segments.pop();
		else segments.push(seg);
	}
	return `/${segments.join("/")}`;
}
/**
* Which deployment a page is on, told apart in the browser tab: a per-PR preview gets a purple icon
* with its PR number and a `[pr<N>]` title prefix, local dev a teal icon and `[dev]`, and
* production keeps the app's own plain logo and its titles untouched, in every client.
*
* Read from the page's own hostname, the one fact the Worker, the server render and the browser
* all agree on, so no env var or config carries it (envs.ts names the hosts):
* - `pr<N>-<sha7>-<app>.<subdomain>.workers.dev`: a PR's per-commit deployment (scripts/os/preview.ts)
* - `localhost`, `*.localhost`, `127.0.0.1`: `pnpm dev`
* - anything else: production (os.iterate.com, dash.iterate.com, agents.iterate.com, …)
*
* Rendered by environment-head-content.tsx in every client's root (packages/ui's, and core/os's own
* copy), and by the OS's `/favicon.svg` (core/os/src/issuer-pages.ts), which the SDK's gate pages
* link.
*/
function deploymentEnvironment(hostname) {
	const preview = /^(pr(\d+)(?:-[^.]+)?)-[^.-]+\.[^.]+\.workers\.dev$/.exec(hostname);
	if (preview) return {
		kind: "preview",
		pr: Number(preview[2]),
		deployment: preview[1]
	};
	if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1") return { kind: "dev" };
	return { kind: "production" };
}
/** `Dash` → `[pr2990] Dash` on a preview, `[dev] Dash` locally, `Dash` in production. */
function environmentTitle(environment, title) {
	if (environment.kind === "production") return title;
	return `[${environment.kind === "preview" ? `pr${environment.pr}` : "dev"}] ${title}`;
}
/** Production's icon is the app's own file (`productionHref`), byte for byte; preview and dev get
*  an inline SVG, so no app ships or routes a second file. */
function environmentFaviconHref(environment, productionHref) {
	if (environment.kind === "production") return productionHref;
	return `data:image/svg+xml,${encodeURIComponent(environmentFaviconSvg(environment))}`;
}
/**
* Preview: purple, the PR number in white as large as the square allows (PR numbers run to four
* digits and more, too many for the corner badge iterate/iterate#2197 drew for single-digit preview slots).
* Dev: teal, the white iterate mark (core/os/public/iterate-logo.svg's paths).
*/
function environmentFaviconSvg(environment) {
	if (environment.kind === "dev") return `<svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg"><rect width="500" height="500" fill="${FAVICON_BACKGROUNDS.dev}"/><g fill="white" transform="translate(20 20) scale(0.92)"><path d="M264.649 170.149H289.821L286.092 186.904L276.303 233.444L270.709 259.971L263.717 293.015L258.124 320.008L251.131 352.586L249.267 364.687V371.668L249.733 372.133H253.462L259.522 369.806L266.048 365.617L275.371 357.24L282.829 349.328L286.558 345.14L288.888 346.071L294.948 350.725L308 360.498L307.068 362.36L303.339 367.944L296.813 376.322L291.685 382.837L286.558 388.422L282.363 393.076L275.837 399.592L272.108 402.849L267.446 406.573L262.785 409.83L256.725 413.554L247.869 417.742L238.08 420.535L231.554 421H224.096L216.637 420.069L211.51 418.673L206.382 416.811L201.255 413.088L196.594 408.434L192.865 400.988L191.466 394.938L191 389.818V383.768L193.797 365.152L199.857 335.832L207.315 301.392L224.096 223.205L225.028 216.224V206.916L224.562 205.054L222.231 204.123L219.434 203.193L206.382 203.658L196.127 204.589H193.331V178.526L194.263 175.734L258.59 170.615L264.649 170.149Z"/><path d="M264.649 78H268.844L275.836 78.9308L282.362 80.7924L287.49 83.5848L292.151 87.7734L295.414 92.8928L297.278 96.616L299.143 105.924L299.609 113.836L299.143 118.49L298.677 122.213L296.812 128.729L293.549 134.779L290.286 138.502L286.091 141.76L282.362 143.621L278.167 145.018L274.438 145.948L267.912 146.414H260.92L254.394 145.483L249.267 144.087L244.139 141.294L239.944 138.037L236.681 133.383L233.884 127.332L232.486 121.282L232.02 117.559V108.716L232.952 101.735L234.816 95.6852L237.613 90.1004L240.41 86.3772L246.936 82.1886L252.529 79.8616L259.522 78.4654L264.649 78Z"/></g></svg>`;
	const digits = String(environment.pr);
	const fontSize = Math.min(360, Math.floor(460 / (.58 * digits.length)));
	const stretch = Math.min(1.6, 360 / fontSize);
	const baseline = Math.round((250 + .36 * fontSize * stretch) / stretch);
	return `<svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg"><rect width="500" height="500" fill="${FAVICON_BACKGROUNDS.preview}"/><text x="250" y="${baseline}" transform="scale(1 ${Math.round(stretch * 100) / 100})" text-anchor="middle" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="800">${digits}</text></svg>`;
}
const FAVICON_BACKGROUNDS = {
	preview: "#7C3AED",
	dev: "#0F766E"
};
//#endregion
export { ITERATE_CAUSE_HEADER, LOOP_LIMIT_HEADER, applyPatch, bytesToBase64, codedError, cookieValueOf, deploymentEnvironment, diff, environmentFaviconHref, environmentFaviconSvg, environmentTitle, errorCode, forwardIssues, isLocalOrigin, isSameOriginBrowserRequest, jsonEqual, loopLimitOf, releaseRpcSessions, reportIssue, resolveContextPath, sameOriginPath, withTimeout };

//# sourceMappingURL=lib.mjs.map