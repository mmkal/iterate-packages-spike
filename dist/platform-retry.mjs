//#region src/platform-retry.ts
/** How long a caller waits before asking again after each platform failure: the `retryAfterMs` of
*  code UNAVAILABLE and an edge answer's `Retry-After`. A deploy's reset and a lost connection are
*  over by the time a person asks again. An overload is not: 10 s lets a burst drain before its
*  callers come back ("scheduling to retry the operation much later", capnp rpc.capnp). */
const RETRY_AFTER_MS = {
	"deploy-reset": 1e3,
	disconnected: 1e3,
	overloaded: 1e4
};
/** A failure's kind, read off what workerd and our own code stamp on it, then off the messages
*  Cloudflare documents for failures that arrive without the stamp. */
function failureKind(error) {
	if (!(error instanceof Object)) return "failed";
	const stamped = error;
	if (stamped.code === "UNAVAILABLE") return isPlatformFailureKind(stamped.data?.kind) ? stamped.data.kind : "failed";
	if (typeof stamped.code === "string") return "refused";
	const text = messagesOf(error);
	if (/reset because its code was updated/.test(text)) return "deploy-reset";
	if (stamped.overloaded === true || OVERLOADED_MESSAGE.test(text)) return "overloaded";
	if (stamped.retryable === true || DISCONNECTED_MESSAGE.test(text)) return "disconnected";
	return "failed";
}
/** The messages of a failure whose flags do not reach the caller, read as Cloudflare's own retry
*  example reads them (https://developers.cloudflare.com/d1/best-practices/retry-queries/): D1's
*  binding builds its error from the database's answer
*  (https://developers.cloudflare.com/d1/observability/debug-d1/#error-list), and a storage reset
*  is stamped by the type the storage failed with, which may be FAILED (workerd io/actor-cache.c++:
*  "Pass through exception type"). A storage timeout is OVERLOADED (workerd io/worker.c++
*  `makeTimeoutPromise`). A call on a Durable Object instance Cloudflare shut down, to host the
*  object elsewhere or to update its runtime, fails with "this Durable Object instance is no longer
*  active. Reconnect or retry the request." once it touches storage, and the next call reaches the
*  instance that replaced it
*  (https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/#shutdown-behavior). */
const OVERLOADED_MESSAGE = /is overloaded|exceeded timeout which caused object to be reset|exceeded its (memory|CPU time) limit and was reset/;
const DISCONNECTED_MESSAGE = /Network connection lost|storage\b.*\bcaused object to be reset|this Durable Object instance is no longer active|Replica disconnected|transient issue on remote node|client disconnected/;
/** A failure's message and those of the causes it wraps, one per line: sqlfu wraps a D1 error, whose
*  cause is the binding's own. */
function messagesOf(error) {
	const messages = [];
	for (let cause = error, depth = 0; cause instanceof Error && depth < 3; depth++) {
		messages.push(cause.message);
		cause = cause.cause;
	}
	return messages.join("\n");
}
/** Whether `error`, or a cause it wraps, is workerd's opaque "internal error; reference = …"
*  (jsg/util.c++ `renderInternalError`): a failure hidden from JavaScript, whether the runtime's own
*  or a defect of the code it ran (a facet whose class is not exported fails the same way), so
*  `failureKind` reads it as `failed`. Only a caller whose callee runs no code of ours or a
*  project's can read it as the runtime's own (control-plane/edge.ts, over D1). */
const isOpaqueInternalError = (error) => /(^|: )internal error; reference = /m.test(messagesOf(error));
const isPlatformFailureKind = (kind) => kind === "deploy-reset" || kind === "disconnected" || kind === "overloaded";
/** An HTTP answer that is not a success: its status is what `httpFailureKind` reads, and its
*  `Retry-After` how long the far side asked to be left alone, which `retryPlatformFailures`
*  honors. */
var HttpAnswerError = class extends Error {
	status;
	retryAfterMs;
	constructor(message, answer) {
		super(message);
		this.status = answer.status;
		this.retryAfterMs = retryAfterMs(answer.headers.get("retry-after"));
	}
};
/** A `Retry-After` in ms: delay-seconds, or an HTTP-date (RFC 9110 §10.2.3). */
function retryAfterMs(header) {
	if (!header) return void 0;
	const seconds = Number(header);
	if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1e3;
	const untilMs = Date.parse(header) - Date.now();
	return Number.isFinite(untilMs) ? Math.max(untilMs, 0) : void 0;
}
/** A failed HTTP call's kind: a 429 or 408 is the far side asking for a slower pace (overloaded), a
*  5xx or a connection that failed before any answer (`fetch` rejects with a TypeError) is the far
*  side's failure (disconnected), any other status an answer about the request (refused). Anything
*  else is read as `failureKind` reads it: a timeout or an abort of the caller's own is `failed`. */
function httpFailureKind(answer) {
	const status = answer instanceof Response || answer instanceof HttpAnswerError ? answer.status : void 0;
	if (status === 429 || status === 408) return "overloaded";
	if (status !== void 0) return status >= 500 ? "disconnected" : "refused";
	if (answer instanceof TypeError) return "disconnected";
	return failureKind(answer);
}
/**
* Whether an answer is CLOUDFLARE'S OWN NOT-FOUND FOR A workers.dev HOSTNAME THE SERVER DOES NOT
* ROUTE YET: a failure of kind `disconnected`, since the request never reached a Worker, which makes
* it safe to send again whatever its method. A brand-new Worker's hostname reaches Cloudflare's
* servers one by one, and a connection that lands on one that has not learned it yet gets one of
* three answers only Cloudflare gives. The first is a 404 with `x-preview-user-error: true`, the
* "There is nothing here yet" page, when the hostname also reads as `<alias>-<worker>`, a preview URL
* of an existing Worker with preview URLs on (every per-commit deployment's does:
* `<prefix>-<sha7>-os` of `os`). The others are a 404 whose body is `error code: 1042` and a 500 whose
* body is `error code: 1104`. The page decides by its header, so `body` is read only for a small
* plain answer; a Worker's own 404 or 500 is never one of these.
*/
function isNotRoutedYet(answer) {
	if (answer.status === 404 && answer.headers["x-preview-user-error"] === "true") return true;
	const code = answer.body?.trim();
	return answer.status === 404 && code === "error code: 1042" || answer.status === 500 && code === "error code: 1104";
}
/** What a script's log line says about a failed HTTP call: its status (`network` when no answer
*  came) and its message. */
function httpFailureFields(error) {
	return {
		status: error instanceof HttpAnswerError ? error.status : "network",
		message: error instanceof Error ? error.message : String(error)
	};
}
/** One repeat, now: capnp's answer to DISCONNECTED, "disconnect and start over" (rpc.capnp): on a
*  fresh Durable Object stub, since "many exceptions leave the DurableObjectStub in a broken state"
*  (https://developers.cloudflare.com/durable-objects/best-practices/error-handling/). A second
*  failure is capnp's OVERLOADED, and the caller's. */
const ONCE_NOW = {
	delaysMs: [0],
	repeatsOverload: false
};
/** One repeat a second later: an upstream service's passing internal error (Artifacts' 10400,
*  Browser Run's 6002 on inline HTML, a git remote's 5xx), fine a moment later. */
const UPSTREAM_ONCE = {
	delaysMs: [1e3],
	repeatsOverload: false
};
/** A relay's lend, whose connection to the Durable Object a burst of lends can drop: once now, then
*  twice more within the four seconds the object's 10 s page timeout leaves room for. */
const RELAY_BURST = {
	delaysMs: [
		0,
		1e3,
		3e3
	],
	repeatsOverload: false
};
/** A CI script's call on another service's API: about 17 s in all. A 429 is repeated too: the
*  script is the caller waiting it out. */
const CI_HTTP = {
	delaysMs: [
		2e3,
		5e3,
		1e4
	],
	repeatsOverload: true
};
/** A deploy's or a preview's call on Cloudflare's API, a wrangler command's included: two to four
*  minutes in all. The API allows 1,200 requests per five minutes per user
*  (https://developers.cloudflare.com/fundamentals/api/reference/limits/), which parallel preview
*  deploys share, so a rate-limited window lasts minutes: Cloudflare has answered
*  `Retry-After: 120`. The last wait is that long, so a direct call waits out the whole window it
*  was asked to, and a wrangler command, which cannot see the header, runs a last time after it. */
const CLOUDFLARE_API = {
	delaysMs: [
		5e3,
		15e3,
		3e4,
		75e3,
		12e4
	],
	repeatsOverload: true
};
/** THE DURABLE LADDER's wait before attempt `attempt` (1-based) of a delivery that failed: 1 s·2ⁿ,
*  capped at `capMs` (30 minutes, unless a longer ladder names its own), ±20% jitter. Durable: the
*  rung is written down and an alarm fires it, so an overloaded failure is repeated here and never
*  in the call. */
const durableLadderDelayMs = (attempt, capMs = 18e5) => Math.round(Math.min(1e3 * 2 ** (attempt - 1), capMs) * (.8 + Math.random() * .4));
/**
* `attempt`, made again after each of the schedule's waits while it fails with a platform failure
* and running it twice is running it once (`idempotent`). An overloaded failure is repeated only by
* a schedule that `repeatsOverload`; every other kind (a refusal, our own defect) is thrown at once.
* `idempotent` may read the failure: a request the far side refused unrun is safe to send again.
* Recovery is bounded: the last failure is thrown, and once the caller's `signal` aborts no repeat
* starts and no wait runs on.
*
* Each repeat logs one line, and so does giving up on an idempotent call the platform still fails
* (`logPlatformFailure`): `<area>.deploy-reset-retry` at info, `<area>.platform-failure-retry` at
* warn, then `<area>.…-gave-up`. `describe` says what else a line carries: the call's `name`, which
* the prd fault alarm groups by, and what it named.
*/
async function retryPlatformFailures(attempt, options) {
	const { schedule, signal } = options;
	for (let attempts = 1;; attempts++) try {
		return await attempt();
	} catch (error) {
		const kind = options.kind(error);
		if (!(typeof options.idempotent === "function" ? options.idempotent(error) : options.idempotent) || !isPlatformFailureKind(kind)) throw error;
		const fields = {
			message: String(error),
			...options.describe(error)
		};
		const delayMs = schedule.delaysMs[attempts - 1];
		if (delayMs !== void 0 && (kind !== "overloaded" || schedule.repeatsOverload) && !signal?.aborted) {
			const askedMs = error instanceof HttpAnswerError ? error.retryAfterMs ?? 0 : 0;
			const retryInMs = Math.max(jitteredMs(delayMs), Math.min(askedMs, Math.max(...schedule.delaysMs)));
			logPlatformFailure(options.area, "retry", kind, {
				...fields,
				attempt: attempts,
				retryInMs
			});
			await pause(retryInMs, signal);
			if (!signal?.aborted) continue;
		}
		logPlatformFailure(options.area, "gave-up", kind, {
			...fields,
			attempts
		});
		throw error;
	}
}
/** A schedule's wait, jittered down to between half and all of itself (`Schedule`). */
const jitteredMs = (delayMs) => Math.round(delayMs / 2 + Math.random() * delayMs / 2);
/** `ms` of waiting, cut short when `signal` aborts. */
function pause(ms, signal) {
	return new Promise((resolve) => {
		const done = () => {
			clearTimeout(timer);
			signal?.removeEventListener("abort", done);
			resolve();
		};
		const timer = setTimeout(done, ms);
		signal?.addEventListener("abort", done, { once: true });
	});
}
/**
* A script's HTTP request on another service's API, sent again as `retryPlatformFailures` makes a
* call again, on `schedule` (CI_HTTP unless named): the first answer that is not the far side's
* failure (a success, or an answer about the request, which is the caller's). A 5xx, a 429 or 408,
* a connection that failed and an attempt that got no answer within `timeoutMs` (our own deadline,
* an overload) are the far side's; the last of them is thrown, an answer's as an HttpAnswerError
* that quotes it. Anything else `send` throws is our own, thrown at once. Only an `idempotent`
* request is sent again, except after a 429, which the far side refused unrun (RFC 6585 §4). Each
* retry is a `<area>.platform-failure-retry` warn naming the request (`what`). The caller's
* `signal` aborts the attempt in flight and ends the schedule.
*/
async function fetchRetryingPlatformFailures(what, send, options) {
	const { signal, timeoutMs = 3e4 } = options;
	return retryPlatformFailures(async () => {
		const timeout = AbortSignal.timeout(timeoutMs);
		const response = await send(signal ? AbortSignal.any([signal, timeout]) : timeout).catch((error) => {
			if (signal?.aborted) throw error;
			if (timeout.aborted) throw Object.assign(/* @__PURE__ */ new Error(`${what}: no answer within ${timeoutMs / 1e3} s`), { overloaded: true });
			if (!(error instanceof TypeError && error.message === "fetch failed")) throw error;
			const why = error.cause instanceof Error ? `: ${error.cause.message}` : "";
			throw Object.assign(/* @__PURE__ */ new Error(`${what}: fetch failed${why}`), { retryable: true });
		});
		if (!isPlatformFailureKind(httpFailureKind(response))) return response;
		const text = await response.text().catch(() => "");
		throw new HttpAnswerError(`${what} answered HTTP ${response.status}: ${text.slice(0, 500)}`, response);
	}, {
		area: options.area,
		schedule: options.schedule || CI_HTTP,
		idempotent: (error) => options.idempotent || error instanceof HttpAnswerError && error.status === 429,
		kind: (error) => error instanceof HttpAnswerError ? httpFailureKind(error) : failureKind(error),
		describe: (error) => ({
			request: what,
			...httpFailureFields(error)
		}),
		signal
	});
}
/** One line about a platform failure, named `<area>.<outcome>` by the one rule: a deploy's reset
*  is expected, `<area>.deploy-reset-<action>` at info; any other is the platform's failure,
*  `<area>.platform-failure-<action>` at warn, which the prd fault alarm counts
*  (scripts/ci/prd-fault-alarm.ts). */
function logPlatformFailure(area, action, kind, fields) {
	if (kind === "deploy-reset") console.info({
		event: `${area}.deploy-reset-${action}`,
		kind,
		...fields
	});
	else console.warn({
		event: `${area}.platform-failure-${action}`,
		kind,
		...fields
	});
}
//#endregion
export { CI_HTTP, CLOUDFLARE_API, HttpAnswerError, ONCE_NOW, RELAY_BURST, RETRY_AFTER_MS, UPSTREAM_ONCE, durableLadderDelayMs, failureKind, fetchRetryingPlatformFailures, httpFailureFields, httpFailureKind, isNotRoutedYet, isOpaqueInternalError, isPlatformFailureKind, jitteredMs, logPlatformFailure, retryPlatformFailures };

//# sourceMappingURL=platform-retry.mjs.map