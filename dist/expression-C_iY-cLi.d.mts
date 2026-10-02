import { RpcTarget } from "capnweb";
//#region src/expression.d.ts
/** One step: a property read (string) or a call (`[method, ...args]`). Args are plain JSON. The
 *  method `""` is the ANONYMOUS call — call the value itself: `itx.builtins.rpcStubs.get('cam')(1, 2)`
 *  is `["itx","builtins","rpcStubs",["get","cam"],["",1,2]]` — what a `provide(stub)` rule spells when
 *  the lent stub is called with args. */
type ItxExpressionStep = string | [method: string, ...args: unknown[]];
/** An itx expression as data: the scope root (`itx`) then get/call steps. THE parsed form every
 *  dispatching method works on. */
type ItxExpression = ItxExpressionStep[];
/** THE dispatch target, in EITHER codec half — a dotted string that starts with the scope root
 *  (`"itx.facets.get('core')"`) OR the parsed structured form (`["itx","facets",["get","core"]]`).
 *  Both carry call args (the string via `.method(args)`), and `normalizedItxExpression` normalizes
 *  either to the structured form — so either works wherever one works, in every method that dispatches. */
type ItxExpressionInput = string | ItxExpression;
/** An itx-expression PREFIX — a rewrite rule's `match`: dotted names, any of which may be a call step
 *  PINNING literal args — `itx.ai.run` or `itx.ai.run('gpt-5')` or `itx.repo.get('main').files`. A
 *  pinned arg must equal the call's arg at that position for the rule to match, and is CONSUMED by
 *  the match (partial application): `itx.ai.run('gpt-5') ⇒ itx.openai.chat` makes
 *  `itx.ai.run('gpt-5', inputs)` into `itx.openai.chat(inputs)`. */
type ItxExpressionPrefix = ItxExpression;
/** The name a step carries: the property itself, or a call step's method. */
declare const itxExpressionStepName: (step: ItxExpressionStep | undefined) => string | undefined;
/** The merge entry's key — `...@` — read by core/os `fillItxExpressionHoles`. */
declare const ITX_EXPRESSION_MERGE_KEY = "...@";
/** Is `value` the marker literal `{ "@": true }`? */
declare const isItxExpressionHole: (value: unknown) => boolean;
/** Does `value` (a step, an arg tree, a whole expression) hold the marker or a merge entry anywhere? */
declare function containsItxExpressionHole(value: unknown): boolean;
/** Parse the STRING half: dotted names + `.method(args)` calls (args JSON5-parsed); rejects reserved
 *  names + bare scope calls. `holes: true` — a rewrite rule's TARGET only — lexes `@` / `...@` into
 *  the marker literals; anywhere else a bare `@` is refused. */
declare function parse(source: string, options?: {
  holes?: boolean;
}): ItxExpression;
/** THE ONE NORMALIZER: either half, normalized to the array half and checked — a string is
 *  parsed (short by rule), an array is shape-checked in place. Every function that takes an
 *  `ItxExpressionInput` (the edge `invoke`, the resolver, the event builders, the prefix parser
 *  below) enters through it. */
declare function normalizedItxExpression(input: ItxExpressionInput, options?: {
  holes?: boolean;
}): ItxExpression;
/** Object args print with their keys SORTED, so two spellings of one object are one canonical string
 *  — one rewrite-rule row, one facet memo, one library connection memo (library.ts) — the way
 *  `jsonEqual` already matches them. A `JSON.stringify` / `JSON5.stringify` replacer. */
declare const keySortedForPrint: (_key: string, value: unknown) => unknown;
/** Canonical stored form: dotted path + `.method(args)` calls (args `JSON5.stringify`d, object keys
 *  sorted). `holes: true` — a rewrite rule's TARGET only — spells the marker literals back as `@` /
 *  `...@`, and `parse(print(e, { holes: true }), { holes: true })` round-trips; without it the
 *  reserved literals print as the plain JSON5 they are, so a CALL that happens to carry `{ "@": true }`
 *  as data round-trips through `parse` (no holes) unchanged — the resolve/invoke law holds for it. */
declare function print(expr: ItxExpression, options?: {
  holes?: boolean;
}): string;
/** Parse an itx-expression prefix (either codec half) — `normalizedItxExpression` (so every step is
 *  an identifier that is not reserved, in either half) plus the two refusals only a PREFIX has: the
 *  anonymous call step (`f(x)(y)` — a prefix cannot call a result), and a call step with NO args,
 *  which pins nothing and is the same prefix as the plain name: spell `itx.ai.run`. */
declare function parseItxExpressionPrefix(source: ItxExpressionInput): ItxExpressionPrefix;
/** THE ONE canonical spelling of an itx-expression prefix — the rewrite-rule table's key, what a lent
 *  stub is keyed by through `provide`'s sugar: parsed, then printed (dotted names; pinned args as JSON5
 *  literals). */
declare function canonicalItxExpressionPrefix(source: ItxExpressionInput): string;
/** Names that must NEVER become dynamic capability segments — a dispatcher answering them would turn
 *  a plain property probe into a live capability call. Enforced at the prototype-chain hop and at
 *  every depth of the path proxies it hands out, and by the library's connectors, which never grow
 *  a method by one of these names (core/os library/connection.ts). Two kinds, one set: */
declare const RESERVED_SEGMENT_NAMES: ReadonlySet<string>;
/** Install the hop drawn in the header on a class's PROTOTYPE CHAIN, with the scope `root` (`["itx"]`
 *  for the edge context, `[]` for a handle). Call ONCE per class. Constructor inheritance is
 *  untouched — only `Class.prototype`'s parent link changes, and the hop forwards everything it does
 *  not intercept. */
declare function installPrototypeInvokeFallback<T extends abstract new (...args: never[]) => object>(cls: T, root: readonly string[]): void;
/** A branded, pipelinable handle for a MID-CHAIN capability (`facets.get(name)`, `cd(path)`,
 *  `workers.get(spec)`, a lent stub) whose unknown dotted members reduce into ONE dispatch of the
 *  itx-expression STEPS relative to it; the constructor's `dispatch` routes those steps into the
 *  underlying object. Declared members (`invoke` / `applyRoot`) win over the fallback, so a
 *  capability cannot be named either — the two reserved words this wrapper adds. */
declare class InvokeHandle extends RpcTarget {
  #private;
  constructor(dispatchItxExpressionSteps: (itxExpressionSteps: ItxExpression) => unknown);
  /** THE dispatch method the prototype hop reduces onto; the expression is RELATIVE to this handle. */
  invoke(itxExpressionSteps: ItxExpression): unknown;
  /** Call the bare capability this handle fronts — the ANONYMOUS call step (how a rewritten call
   *  whose target IS a handle calls it: `handle(events, range)`). */
  applyRoot(args: unknown[]): unknown;
}
/** Walk itx-expression steps off a capnweb stub; the ANONYMOUS call step (`""`) calls the value
 *  itself (a bare function lent as a capability). NO await inside the loop: on a capnweb stub every
 *  step is a PIPELINED path, so an n-step chain costs ONE round trip, flushed by the caller's single
 *  await. A DIRECT call on the stub, never `.apply`: reading `.apply` off a capnweb stub's method is
 *  itself a pipelined remote path, and calling it sends the stub as an argument, which a facet stub
 *  refuses with a DataCloneError. What a connector over a lent stub or a remote capnweb API walks. */
declare function walkStepsOnRpcStub(stub: unknown, steps: ItxExpression): unknown;
//#endregion
export { print as _, ItxExpressionPrefix as a, canonicalItxExpressionPrefix as c, isItxExpressionHole as d, itxExpressionStepName as f, parseItxExpressionPrefix as g, parse as h, ItxExpressionInput as i, containsItxExpressionHole as l, normalizedItxExpression as m, InvokeHandle as n, ItxExpressionStep as o, keySortedForPrint as p, ItxExpression as r, RESERVED_SEGMENT_NAMES as s, ITX_EXPRESSION_MERGE_KEY as t, installPrototypeInvokeFallback as u, walkStepsOnRpcStub as v };
//# sourceMappingURL=expression-C_iY-cLi.d.mts.map