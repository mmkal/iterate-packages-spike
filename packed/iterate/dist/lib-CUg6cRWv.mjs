//#region src/lib.ts
/** A plain Error carrying `code` (+ optional `data`) as own enumerable properties. */
function codedError(code, message, data) {
	return Object.assign(new Error(message), data === void 0 ? { code } : {
		code,
		data
	});
}
/** OUR MARK (core/os cause.ts): what the platform sends — a request, a mail — carries the cause of
*  the code that sent it here, as JSON; a request that comes back with it resumes its chain. */
const ITERATE_CAUSE_HEADER = "X-Iterate-Cause";
/** An answer refused past the loop limit — a 508 marked so — as the LOOP_LIMIT refusal it is,
*  already recorded where it was met; none for any other answer. */
async function loopLimitOf(answer) {
	if (answer.status !== 508 || !answer.headers.has("iterate-loop-limit")) return void 0;
	return codedError("LOOP_LIMIT", (await answer.text()).trim(), { recorded: true });
}
const isRecord = (v) => typeof v === "object" && !!v && !Array.isArray(v);
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
//#endregion
export { withTimeout as a, loopLimitOf as i, codedError as n, jsonEqual as r, ITERATE_CAUSE_HEADER as t };

//# sourceMappingURL=lib-CUg6cRWv.mjs.map