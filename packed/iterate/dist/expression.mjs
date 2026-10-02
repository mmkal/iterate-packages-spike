import { codedError, jsonEqual } from "./lib.mjs";
import { RpcTarget } from "capnweb";
import JSON5 from "json5";
//#region src/expression.ts
/** A STRING expression is for what a person types: short. Anything bigger — a worker's source, a large
*  literal — rides the PARSED form (`["itx","workers",["get",{ source }]]`), which is plain data and never
*  meets json5. The cap is O(1), before any parsing (stock json5 allocates per character and a
*  multi-megabyte literal kills a 128 MiB isolate). */
const ITX_EXPRESSION_STRING_MAX_CHARS = 2048;
/** The name a step carries: the property itself, or a call step's method. */
const itxExpressionStepName = (step) => Array.isArray(step) ? step[0] : step;
const IDENT = /^[A-Za-z_$][A-Za-z0-9_$-]*/;
const RESERVED = /* @__PURE__ */ new Set([
	"__proto__",
	"constructor",
	"prototype"
]);
/** The marker's array-half spelling, the one reserved literal. */
const ITX_EXPRESSION_HOLE = { "@": true };
/** The merge entry's key — `...@` — read by core/os `fillItxExpressionHoles`. */
const ITX_EXPRESSION_MERGE_KEY = "...@";
/** A single- or double-quoted string literal (escapes honored) or a JSON5 comment (block or line):
*  THE one pattern every walk that must skip what is inside them is built from — the marker lex, the
*  marker print, the paren matcher. In an alternation a span is consumed whole, so nothing inside one
*  (a quote in a comment, an `@` in a string) is ever seen by the other alternatives. */
const STRING_OR_COMMENT = String.raw`"(?:[^"\\]|\\[\s\S])*"|'(?:[^'\\]|\\[\s\S])*'|/\*[\s\S]*?\*/|//[^\n]*`;
const isStringOrComment = (match) => match[0] === "\"" || match[0] === "'" || match[0] === "/";
/** In call args: a literal (kept verbatim) or a marker — `...@` before `@`, so the merge form wins. */
const MARKERS_IN_ARGS = new RegExp(`${STRING_OR_COMMENT}|\\.\\.\\.@|@`, "g");
/** In JSON5's printed output: the marker literal `{'@':true}` and the merge entry `'...@':true` are
*  spelled with a single-quoted key and matched on those exact boundaries — listed BEFORE the literal
*  alternative so the entry's `'...@'` is read as the entry, not as a string. A user's string that
*  merely contains those characters is emitted by JSON5 as a longer (double-quoted) literal and is
*  consumed whole. */
const MARKERS_IN_PRINT = new RegExp(`\\{'@':true\\}|'\\.\\.\\.@':true|${STRING_OR_COMMENT}`, "g");
/** A bracket outside a literal. */
const BRACKETS = new RegExp(`${STRING_OR_COMMENT}|[()[\\]{}]`, "g");
/** Is `value` the marker literal `{ "@": true }`? */
const isItxExpressionHole = (value) => jsonEqual(value, ITX_EXPRESSION_HOLE);
/** Does `value` (a step, an arg tree, a whole expression) hold the marker or a merge entry anywhere? */
function containsItxExpressionHole(value) {
	if (isItxExpressionHole(value)) return true;
	if (Array.isArray(value)) return value.some(containsItxExpressionHole);
	if (value !== null && typeof value === "object") return value["...@"] === true || Object.values(value).some(containsItxExpressionHole);
	return false;
}
/** Index of the `)` closing the `(` at `open`; tracks bracket depth, skipping quoted string args. */
function matchingParen(source, open) {
	let depth = 0;
	BRACKETS.lastIndex = open;
	for (let bracket = BRACKETS.exec(source); bracket; bracket = BRACKETS.exec(source)) {
		if (isStringOrComment(bracket[0])) continue;
		if ("([{".includes(bracket[0])) depth++;
		else if (--depth === 0) return bracket.index;
	}
	throw new Error(`expression: unbalanced "(" in ${JSON.stringify(source)}`);
}
/** Parse the STRING half: dotted names + `.method(args)` calls (args JSON5-parsed); rejects reserved
*  names + bare scope calls. `holes: true` — a rewrite rule's TARGET only — lexes `@` / `...@` into
*  the marker literals; anywhere else a bare `@` is refused. */
function parse(source, options) {
	if (source.length > ITX_EXPRESSION_STRING_MAX_CHARS) throw codedError("EXPRESSION_TOO_LONG", `itx expression: ${source.length} chars is over the ${ITX_EXPRESSION_STRING_MAX_CHARS}-char limit for the string form — a string expression is for what a person types; pass the parsed form instead: ["itx","workers",["get",{ source: … }]]`);
	const s = source.trim();
	const steps = [];
	let i = 0;
	function fail(m) {
		throw new Error(`expression: ${m} in ${JSON.stringify(source)}`);
	}
	const readName = () => {
		const m = IDENT.exec(s.slice(i));
		if (!m) fail(`name expected at ${i}`);
		if (RESERVED.has(m[0])) fail(`reserved name "${m[0]}"`);
		i += m[0].length;
		return m[0];
	};
	steps.push(readName());
	while (i < s.length) {
		const c = s[i];
		if (/\s/.test(c)) i++;
		else if (c === ".") steps.push((i++, readName()));
		else if (c === "(") {
			const end = matchingParen(s, i);
			const inner = s.slice(i + 1, end).trim().replace(MARKERS_IN_ARGS, (match) => {
				if (isStringOrComment(match)) return match;
				if (!options?.holes) fail("`@` (the caller's input) is legal only in a rewrite rule's target");
				return match === "@" ? JSON.stringify(ITX_EXPRESSION_HOLE) : `${JSON.stringify(ITX_EXPRESSION_MERGE_KEY)}:true`;
			});
			let args = [];
			try {
				if (inner !== "") args = JSON5.parse(`[${inner}]`);
			} catch (e) {
				fail(`call args are not JSON5 (${e.message})`);
			}
			const previous = steps.at(-1);
			if (Array.isArray(previous)) steps.push(["", ...args]);
			else {
				const name = steps.pop();
				if (typeof name !== "string") fail("a call must follow a name");
				if (steps.length === 0) fail("cannot call the scope symbol itself");
				steps.push([name, ...args]);
			}
			i = end + 1;
		} else fail(`unexpected ${JSON.stringify(c)} at ${i}`);
	}
	return steps;
}
/** The array half, checked the way the parser checks the string half — every name step an identifier
*  that is not reserved, every call step `[method, ...args]` with an identifier method (or `""`, the
*  anonymous call, only right after a call) — WITHOUT printing and re-parsing: a stored target carries a worker's whole source as
*  data, and that data must never meet the string codec (the 2 KiB cap, json5). Throws in the
*  parser's words. */
function assertItxExpressionShape(expression) {
	const fail = (m) => {
		throw new Error(`expression: ${m} in ${JSON.stringify(expression).slice(0, 200)}`);
	};
	if (!Array.isArray(expression) || expression.length === 0) fail("an expression is a non-empty array");
	const name = (step, what) => {
		if (!IDENT.test(step) || IDENT.exec(step)[0] !== step) fail(`${what} ${JSON.stringify(step)} is not an identifier`);
		if (RESERVED.has(step)) fail(`reserved name "${step}"`);
	};
	expression.forEach((step, i) => {
		if (typeof step === "string") {
			name(step, i === 0 ? "the root" : "a name step");
			return;
		}
		if (!Array.isArray(step) || typeof step[0] !== "string") fail(`step ${i} is neither a name nor [method, ...args]`);
		const [method] = step;
		if (method === "") {
			if (i === 0 || !Array.isArray(expression[i - 1])) fail("the anonymous call `f(x)(y)` follows a call");
		} else name(method, "a method");
		if (i === 0) fail("a call on the root itself");
	});
}
/** THE ONE NORMALIZER: either half, normalized to the array half and checked — a string is
*  parsed (short by rule), an array is shape-checked in place. Every function that takes an
*  `ItxExpressionInput` (the edge `invoke`, the resolver, the event builders, the prefix parser
*  below) enters through it. */
function normalizedItxExpression(input, options) {
	if (typeof input === "string") return parse(input, options);
	assertItxExpressionShape(input);
	return input;
}
/** Object args print with their keys SORTED, so two spellings of one object are one canonical string
*  — one rewrite-rule row, one facet memo, one library connection memo (library.ts) — the way
*  `jsonEqual` already matches them. A `JSON.stringify` / `JSON5.stringify` replacer. */
const keySortedForPrint = (_key, value) => value !== null && typeof value === "object" && !Array.isArray(value) ? Object.fromEntries(Object.keys(value).sort().map((k) => [k, value[k]])) : value;
/** Canonical stored form: dotted path + `.method(args)` calls (args `JSON5.stringify`d, object keys
*  sorted). `holes: true` — a rewrite rule's TARGET only — spells the marker literals back as `@` /
*  `...@`, and `parse(print(e, { holes: true }), { holes: true })` round-trips; without it the
*  reserved literals print as the plain JSON5 they are, so a CALL that happens to carry `{ "@": true }`
*  as data round-trips through `parse` (no holes) unchanged — the resolve/invoke law holds for it. */
function print(expr, options) {
	return expr.map((step, i) => {
		const dot = i ? "." : "";
		if (typeof step === "string") return dot + step;
		const json = JSON5.stringify(step.slice(1), keySortedForPrint).slice(1, -1);
		const args = options?.holes ? json.replace(MARKERS_IN_PRINT, (match) => match === "{'@':true}" ? "@" : match === "'...@':true" ? "...@" : match) : json;
		return step[0] === "" ? `(${args})` : `${dot}${step[0]}(${args})`;
	}).join("");
}
/** Parse an itx-expression prefix (either codec half) — `normalizedItxExpression` (so every step is
*  an identifier that is not reserved, in either half) plus the two refusals only a PREFIX has: the
*  anonymous call step (`f(x)(y)` — a prefix cannot call a result), and a call step with NO args,
*  which pins nothing and is the same prefix as the plain name: spell `itx.ai.run`. */
function parseItxExpressionPrefix(source) {
	const expr = normalizedItxExpression(source);
	const spelled = typeof source === "string" ? source : print(expr);
	for (const step of expr) {
		if (!Array.isArray(step)) continue;
		if (step[0] === "") throw new Error(`an itx-expression prefix cannot call a result — ${JSON.stringify(spelled)}`);
		if (step.length === 1) throw new Error(`an itx-expression prefix pins literal args with a call step — ${JSON.stringify(spelled)} has "${step[0]}()" with none; spell "${step[0]}"`);
	}
	return expr;
}
/** THE ONE canonical spelling of an itx-expression prefix — the rewrite-rule table's key, what a lent
*  stub is keyed by through `provide`'s sugar: parsed, then printed (dotted names; pinned args as JSON5
*  literals). */
function canonicalItxExpressionPrefix(source) {
	return print(parseItxExpressionPrefix(source));
}
/** Names that must NEVER become dynamic capability segments — a dispatcher answering them would turn
*  a plain property probe into a live capability call. Enforced at the prototype-chain hop and at
*  every depth of the path proxies it hands out, and by the library's connectors, which never grow
*  a method by one of these names (core/os library/connection.ts). Two kinds, one set: */
const RESERVED_SEGMENT_NAMES = /* @__PURE__ */ new Set([
	"__defineGetter__",
	"__defineSetter__",
	"__lookupGetter__",
	"__lookupSetter__",
	"__proto__",
	"catch",
	"constructor",
	"dup",
	"finally",
	"hasOwnProperty",
	"isPrototypeOf",
	"map",
	"onRpcBroken",
	"propertyIsEnumerable",
	"prototype",
	"then",
	"toLocaleString",
	"toString",
	"valueOf",
	"toJSON",
	"asymmetricMatch"
]);
/** The path proxy: a function-backed Proxy (not an RpcTarget instance) — each missing property
*  extends `path`, and applying the function reduces the whole accumulated access into ONE
*  `invoke(expression)` call, `[...root, ...path.slice(0, -1), [path.at(-1), ...args]]`. */
function createItxExpressionPathProxy(invoker, root, path) {
	const valueFor = (key) => createItxExpressionPathProxy(invoker, root, [...path, key]);
	return new Proxy(function() {}, {
		apply(_target, _thisArg, args) {
			const method = path[path.length - 1];
			const expr = [
				...root,
				...path.slice(0, -1),
				[method, ...args]
			];
			return invoker.invoke(expr);
		},
		get(target, key, receiver) {
			if (typeof key === "symbol") return Reflect.get(target, key, receiver);
			if (RESERVED_SEGMENT_NAMES.has(key)) return void 0;
			return valueFor(key);
		},
		getOwnPropertyDescriptor(target, key) {
			const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
			if (descriptor) return descriptor;
			if (typeof key === "symbol" || RESERVED_SEGMENT_NAMES.has(key)) return void 0;
			return {
				configurable: true,
				enumerable: true,
				value: valueFor(key),
				writable: false
			};
		},
		has(target, key) {
			if (typeof key === "symbol") return key in target;
			return !RESERVED_SEGMENT_NAMES.has(key);
		}
	});
}
/** Install the hop drawn in the header on a class's PROTOTYPE CHAIN, with the scope `root` (`["itx"]`
*  for the edge context, `[]` for a handle). Call ONCE per class. Constructor inheritance is
*  untouched — only `Class.prototype`'s parent link changes, and the hop forwards everything it does
*  not intercept. */
function installPrototypeInvokeFallback(cls, root) {
	const parentPrototype = Object.getPrototypeOf(cls.prototype);
	const hop = new Proxy(Object.create(parentPrototype), { get(hopTarget, key, receiver) {
		if (typeof key === "symbol" || key in hopTarget) return Reflect.get(hopTarget, key, receiver);
		if (RESERVED_SEGMENT_NAMES.has(key)) return void 0;
		if (!(receiver instanceof cls)) return;
		return createItxExpressionPathProxy(receiver, root, [key]);
	} });
	Object.setPrototypeOf(cls.prototype, hop);
}
/** A branded, pipelinable handle for a MID-CHAIN capability (`facets.get(name)`, `cd(path)`,
*  `workers.get(spec)`, a lent stub) whose unknown dotted members reduce into ONE dispatch of the
*  itx-expression STEPS relative to it; the constructor's `dispatch` routes those steps into the
*  underlying object. Declared members (`invoke` / `applyRoot`) win over the fallback, so a
*  capability cannot be named either — the two reserved words this wrapper adds. */
var InvokeHandle = class extends RpcTarget {
	#dispatchItxExpressionSteps;
	constructor(dispatchItxExpressionSteps) {
		super();
		this.#dispatchItxExpressionSteps = dispatchItxExpressionSteps;
	}
	/** THE dispatch method the prototype hop reduces onto; the expression is RELATIVE to this handle. */
	invoke(itxExpressionSteps) {
		return this.#dispatchItxExpressionSteps(itxExpressionSteps);
	}
	/** Call the bare capability this handle fronts — the ANONYMOUS call step (how a rewritten call
	*  whose target IS a handle calls it: `handle(events, range)`). */
	applyRoot(args) {
		return this.#dispatchItxExpressionSteps([["", ...args]]);
	}
};
installPrototypeInvokeFallback(InvokeHandle, []);
/** Walk itx-expression steps off a capnweb stub; the ANONYMOUS call step (`""`) calls the value
*  itself (a bare function lent as a capability). NO await inside the loop: on a capnweb stub every
*  step is a PIPELINED path, so an n-step chain costs ONE round trip, flushed by the caller's single
*  await. A DIRECT call on the stub, never `.apply`: reading `.apply` off a capnweb stub's method is
*  itself a pipelined remote path, and calling it sends the stub as an argument, which a facet stub
*  refuses with a DataCloneError. What a connector over a lent stub or a remote capnweb API walks. */
function walkStepsOnRpcStub(stub, steps) {
	let value = stub;
	for (const step of steps) if (typeof step === "string") value = value[step];
	else {
		const [method, ...args] = step;
		value = method === "" ? value(...args) : value[method](...args);
	}
	return value;
}
//#endregion
export { ITX_EXPRESSION_MERGE_KEY, InvokeHandle, RESERVED_SEGMENT_NAMES, canonicalItxExpressionPrefix, containsItxExpressionHole, installPrototypeInvokeFallback, isItxExpressionHole, itxExpressionStepName, keySortedForPrint, normalizedItxExpression, parse, parseItxExpressionPrefix, print, walkStepsOnRpcStub };

//# sourceMappingURL=expression.mjs.map