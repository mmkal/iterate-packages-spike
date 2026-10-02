import { i as __toESM, t as require_react } from "../../react2.mjs";
import { t as require_react_dom } from "../../react-dom.mjs";
import { n as cn, t as require_jsx_runtime } from "../../jsx-runtime.mjs";
import { $ as getPreviousTabbable, A as useSyncedFloatingRootContext, An as isOverflowElement, At as isVirtualClick, B as useFloatingTree, Bt as useId, C as useOpenStateTransitions, Cn as useRefWithInit, Ct as ARROW_LEFT$1, D as useTriggerDataForwarding, Dt as contains, E as usePopupRootSync, En as getWindow, Et as activeElement, F as resolveRef, Ft as ios, H as FloatingPortal, Ht as cancelOpen, I as FloatingNode, It as mac, J as createAttribute, Jt as itemPress, K as DROPDOWN_COLLISION_AVOIDANCE, Kt as focusOut, L as FloatingTree, Lt as Timeout, M as fastComponent, Mn as createLucideIcon, Mt as stopEvent, N as fastComponentRef, Nt as jsdom, O as useOpenChangeComplete, On as isHTMLElement, Ot as getTarget, P as useDismiss, Pt as webkit, Q as getNextTabbable, Qt as siblingOpen, R as useFloatingNodeId, Rt as useTimeout, S as useImplicitActiveTrigger, Sn as useStableCallback, St as ARROW_DOWN$1, T as usePopupRootStore, Tn as getParentNode, Tt as ARROW_UP$1, Ut as closePress, V as FloatingTreeStore, Vt as createChangeEventDetails, W as usePortalContext, X as getNodeChildren, Xt as none, Y as getNodeAncestors, Yt as listNavigation, Z as focusable, _ as PopupHandleAttachment, _n as ownerDocument, a as parse$1, at as findNonDisabledListIndex, b as createDefaultInitialFocus, bn as mergeProps, bt as isTypeableElement, c as useHoverReferenceInteraction, ct as isElementVisible, d as useFocus, dn as useRenderElement, dt as FocusGuard, et as getTabbableAfterElement, f as usePopupHandleStore, fn as EMPTY_ARRAY, ft as AnimationFrame, g as FOCUSABLE_POPUP_PROPS, gn as useMergedRefs, gt as addEventListener, h as PopupTriggerMap, hn as isReactVersionAtLeast, ht as mergeCleanups, i as getDisabledMountTransitionStyles, in as pressableTriggerOpenStateMapping, it as tabbable, j as ReactStore, jn as isShadowRoot, jt as isVirtualPointerEvent, k as useAnimationsFinished, kn as isLastTraversableNode, kt as isMouseLikePointerType, l as useHoverFloatingInteraction, lt as isIndexOutOfListBounds, m as popupStoreSelectors, mn as NOOP, mt as useValueAsRef, n as useAnchorPositioning, nn as popupStateMapping, nt as isOutsideEvent, o as stringify, ot as getMaxListIndex, p as createInitialPopupStoreState, pn as EMPTY_OBJECT, pt as useAnimationFrame, q as POPUP_COLLISION_AVOIDANCE, qt as imperativeAction, r as useDirection, rn as popupTransitionStateMapping, rt as isTabbable, s as safePolygon, st as getMinListIndex, t as usePositioner, tn as triggerPress, tt as getTabbableBeforeElement, un as transitionStatusMapping, ut as isListIndexDisabled, vn as formatErrorMessage, vt as getFloatingFocusElement, w as usePopupInteractionProps, wn as getNodeName, wt as ARROW_RIGHT$1, x as createPopupOpenState, xn as useIsoLayoutEffect, y as attachPreventUnmountOnClose, yn as makeEventPreventable, yt as isTypeableCombobox, z as useFloatingParentNodeId, zt as useBaseUiId } from "../../usePositioner.mjs";
//#region src/lib/plain-left-click.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/** A plain left click — not a modified one (cmd/ctrl/shift/alt: a new tab or window), not the
*  middle button, not one something else already handled. */
function plainLeftClick(event) {
	return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}
//#endregion
//#region src/components/context-view/context-path.tsx
var import_jsx_runtime = require_jsx_runtime();
/** The links a context view's rows use for the paths they name (a child context's): provided by
*  `ContextView` from its `pathLinks`, absent where the app gave none. */
const ContextPathLinksContext = (0, import_react.createContext)(void 0);
/** An anchor to a context path: a plain click goes through the app's router, a modified or middle
*  click is the browser's. */
function PathLink({ path, links, className, children, ...rest }) {
	const href = links.hrefOf(path);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href,
		className,
		onClick: (event) => {
			event.stopPropagation();
			if (links.onNavigate && plainLeftClick(event)) links.onNavigate(href, event);
		},
		...rest,
		children
	});
}
/** A path a row names (`Child context /repos/config created`): a link when the view has
*  `pathLinks`, else the path as text. The path is the children too, so a sentence's text (the
*  fold's fact, folds.tsx `sentenceText`) still carries it. */
function ContextPathText({ path }) {
	const links = (0, import_react.useContext)(ContextPathLinksContext);
	if (!links) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "font-mono",
		children: path
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PathLink, {
		path,
		links,
		className: "font-mono underline decoration-border underline-offset-2 hover:decoration-foreground",
		children: path
	});
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/core/util.js
function getEnumValues(entries) {
	const numericValues = Object.values(entries).filter((v) => typeof v === "number");
	return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
}
function joinValues(array, separator = "|") {
	return array.map((val) => stringifyPrimitive(val)).join(separator);
}
function jsonStringifyReplacer(_, value) {
	if (typeof value === "bigint") return value.toString();
	return value;
}
var Cached = class {
	constructor(getter) {
		this._getter = getter;
		this._value = void 0;
	}
	get value() {
		const getter = this._getter;
		if (getter !== void 0) {
			this._value = getter();
			this._getter = void 0;
		}
		return this._value;
	}
};
function cached(getter) {
	return new Cached(getter);
}
function nullish(input) {
	return input === null || input === void 0;
}
function cleanRegex(source) {
	const start = source.startsWith("^") ? 1 : 0;
	const end = source.endsWith("$") ? source.length - 1 : source.length;
	return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
	const ratio = val / step;
	const roundedRatio = Math.round(ratio);
	const tolerance = 4 * Number.EPSILON * Math.max(Math.abs(ratio), 1);
	if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
	return ratio - roundedRatio;
}
function assignProp(target, prop, value) {
	Object.defineProperty(target, prop, {
		value,
		writable: true,
		enumerable: true,
		configurable: true
	});
}
/**
* Whichever object a def's `shape` currently answers from: the one the caller passed until the first read, the frozen copy after it.
*
* Its keys and descriptors read without invoking anything, which is what lets a discriminated union check its discriminator, and the cycle walk read a shape, without resolving a getter that references the schema being constructed. A def that answers `shape` from an accessor of its own has none.
*/
function rawShape(def) {
	const desc = Object.getOwnPropertyDescriptor(def, "shape");
	return desc?.get ? desc.get.raw : desc?.value;
}
function sourceShape(schema) {
	return rawShape(schema._zod.def) ?? schema._zod.def.shape;
}
function deferProp(target, key, getter) {
	Object.defineProperty(target, key, {
		get() {
			const value = getter();
			assignProp(this, key, value);
			return value;
		},
		enumerable: true,
		configurable: true
	});
}
function putProp(target, key, value) {
	if (key in target) assignProp(target, key, value);
	else target[key] = value;
}
/**
* Copies `keys` of `source`'s shape onto `target`, each value passed through `wrap`.
*
* A key the source has resolved is copied through now, so the derived shape states it outright and nothing has to resolve it to learn what it holds. A key the source still defers stays deferred, and reads back through the source's own `shape`, so it resolves once and both shapes get that one schema.
*/
function mirrorShape(target, source, keys, wrap) {
	const raw = sourceShape(source);
	for (const key of keys) {
		const desc = Object.getOwnPropertyDescriptor(raw, key);
		if (!desc.enumerable) continue;
		if (desc.get) deferProp(target, key, () => {
			const value = source._zod.def.shape[key];
			return wrap ? wrap(value, key) : value;
		});
		else putProp(target, key, wrap ? wrap(desc.value, key) : desc.value);
	}
}
function mirrorProps(target, source) {
	for (const key of Reflect.ownKeys(source)) {
		const desc = Object.getOwnPropertyDescriptor(source, key);
		if (!desc.enumerable) continue;
		if (desc.get) deferProp(target, key, () => source[key]);
		else putProp(target, key, desc.value);
	}
}
function mergeDefs(...defs) {
	const mergedDescriptors = {};
	for (const def of defs) {
		const descriptors = Object.getOwnPropertyDescriptors(def);
		Object.assign(mergedDescriptors, descriptors);
	}
	return Object.defineProperties({}, mergedDescriptors);
}
function esc(str) {
	return JSON.stringify(str);
}
function slugify(input) {
	return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
function isObject$1(data) {
	return typeof data === "object" && data !== null && !Array.isArray(data);
}
const allowsEval = /* @__PURE__*/ cached(() => {
	if (globalConfig.jitless) return false;
	if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
	try {
		new Function("");
		return true;
	} catch (_) {
		return false;
	}
});
function isPlainObject(o) {
	if (isObject$1(o) === false) return false;
	const ctor = o.constructor;
	if (ctor === void 0) return true;
	if (typeof ctor !== "function") return true;
	const prot = ctor.prototype;
	if (isObject$1(prot) === false) return false;
	if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
	return true;
}
function shallowClone(o) {
	if (isPlainObject(o)) return { ...o };
	if (Array.isArray(o)) return [...o];
	if (o instanceof Map) return new Map(o);
	if (o instanceof Set) return new Set(o);
	return o;
}
const propertyKeyTypes = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
	const cl = new inst._zod.constr(def ?? inst._zod.def);
	if (!def || params?.parent) cl._zod.parent = inst;
	return cl;
}
function normalizeParams(_params) {
	const params = _params;
	if (!params) return {};
	if (typeof params === "string") return { error: () => params };
	if (params?.message !== void 0) {
		if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
		params.error = params.message;
	}
	delete params.message;
	if (typeof params.error === "string") return {
		...params,
		error: () => params.error
	};
	return params;
}
function stringifyPrimitive(value) {
	if (typeof value === "bigint") return value.toString() + "n";
	if (typeof value === "string") return `"${value}"`;
	return `${value}`;
}
function optionalKeys(shape) {
	return Object.keys(shape).filter((k) => {
		return shape[k]._zod.optin !== void 0 && shape[k]._zod.optout === "optional";
	});
}
const NUMBER_FORMAT_RANGES = /*@__PURE__*/ (() => ({
	safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}))();
const BIGINT_FORMAT_RANGES = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function pick(schema, mask) {
	const currDef = schema._zod.def;
	const checks = currDef.checks;
	if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
	const newShape = {};
	mirrorShape(newShape, schema, maskedKeys(schema, mask));
	return clone(schema, mergeDefs(currDef, {
		shape: newShape,
		checks: []
	}));
}
function maskedKeys(schema, mask) {
	const raw = sourceShape(schema);
	const keys = [];
	for (const key of Reflect.ownKeys(mask)) {
		if (!Object.getOwnPropertyDescriptor(raw, key)?.enumerable) throw new Error(`Unrecognized key: "${String(key)}"`);
		if (mask[key]) keys.push(key);
	}
	return keys;
}
function omit(schema, mask) {
	const currDef = schema._zod.def;
	const checks = currDef.checks;
	if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
	const omitted = new Set(maskedKeys(schema, mask));
	const newShape = {};
	mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)).filter((key) => !omitted.has(key)));
	return clone(schema, mergeDefs(currDef, {
		shape: newShape,
		checks: []
	}));
}
function extend(schema, shape) {
	if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
	const checks = schema._zod.def.checks;
	if (checks && checks.length > 0) {
		const existingShape = sourceShape(schema);
		for (const key of Reflect.ownKeys(shape)) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
}
function extended(schema, shape) {
	const newShape = {};
	mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)));
	mirrorProps(newShape, shape);
	return newShape;
}
function safeExtend(schema, shape) {
	if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
	return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
}
function merge(a, b) {
	if (!b?._zod?.def) throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	const newShape = {};
	mirrorShape(newShape, a, Reflect.ownKeys(sourceShape(a)));
	mirrorShape(newShape, b, Reflect.ownKeys(sourceShape(b)));
	return clone(a, mergeDefs(a._zod.def, {
		shape: newShape,
		get catchall() {
			return b._zod.def.catchall;
		},
		checks: b._zod.def.checks ?? []
	}));
}
function partial(Class, schema, mask, name = "partial") {
	const checks = schema._zod.def.checks;
	if (checks && checks.length > 0) throw new Error(`.${name}() cannot be used on object schemas containing refinements`);
	const selected = mask ? new Set(maskedKeys(schema, mask)) : void 0;
	const newShape = {};
	mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), Class && ((value, key) => selected && !selected.has(key) ? value : new Class({
		type: "optional",
		innerType: value
	})));
	return clone(schema, mergeDefs(schema._zod.def, {
		shape: newShape,
		checks: []
	}));
}
function required(Class, schema, mask) {
	const selected = mask ? new Set(maskedKeys(schema, mask)) : void 0;
	const newShape = {};
	mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), (value, key) => selected && !selected.has(key) ? value : new Class({
		type: "nonoptional",
		innerType: value
	}));
	return clone(schema, mergeDefs(schema._zod.def, { shape: newShape }));
}
function aborted(x, startIndex = 0) {
	if (x.aborted === true) return true;
	for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
	return false;
}
function explicitlyAborted(x, startIndex = 0) {
	if (x.aborted === true) return true;
	for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
	return false;
}
function prefixIssues(path, issues) {
	return issues.map((iss) => {
		var _a;
		(_a = iss).path ?? (_a.path = []);
		iss.path.unshift(path);
		return iss;
	});
}
function unwrapMessage(message) {
	return typeof message === "string" ? message : message?.message;
}
function attachSchema(issues, start, inst) {
	var _a;
	for (let i = start; i < issues.length; i++) (_a = issues[i]).schema ?? (_a.schema = inst);
}
function finalizeIssue(iss, ctx, config) {
	var _a;
	const traits = iss.inst?._zod?.traits;
	if (traits?.has("$ZodType")) {
		if (traits.has("$ZodCheck")) (_a = iss).schema ?? (_a.schema = iss.inst);
		else iss.schema = iss.inst;
	}
	const schemaError = iss.schema !== iss.inst ? iss.schema?._zod.def?.error : void 0;
	const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(schemaError?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
	const full = {};
	for (const k of Object.keys(iss)) {
		if (k === "inst" || k === "schema" || k === "continue" || k === "input" || k === "__proto__") continue;
		full[k] = iss[k];
	}
	full.path ?? (full.path = []);
	full.message = message;
	if (ctx?.reportInput) full.input = iss.input;
	return full;
}
const highSurrogate = /[\uD800-\uDBFF]/;
function codePointLength(str) {
	const units = str.length;
	if (!highSurrogate.test(str)) return units;
	let count = units;
	for (let i = 0; i < units - 1; i++) if ((str.charCodeAt(i) & 64512) === 55296 && (str.charCodeAt(i + 1) & 64512) === 56320) {
		count--;
		i++;
	}
	return count;
}
function getLengthableOrigin(input) {
	if (Array.isArray(input)) return "array";
	if (typeof input === "string") return "string";
	return "unknown";
}
function parsedType(data) {
	const t = typeof data;
	switch (t) {
		case "number": return Number.isNaN(data) ? "nan" : "number";
		case "object": {
			if (data === null) return "null";
			if (Array.isArray(data)) return "array";
			const obj = data;
			if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) return obj.constructor.name;
		}
	}
	return t;
}
function issue(...args) {
	const [iss, input, inst] = args;
	if (typeof iss === "string") return {
		message: iss,
		code: "custom",
		input,
		inst
	};
	return { ...iss };
}
/**
* Installs a trait's members on its prototype. Each value builds that member for the instance on first read; the built value shadows the accessor as an own property, so a detached `const { parse } = schema` keeps working.
*
* Call this from a `proto` initializer, which runs once per prototype — never per instance.
*/
function members(proto, table) {
	for (const key in table) {
		const desc = Object.getOwnPropertyDescriptor(table, key);
		if (desc.get) Object.defineProperty(proto, key, {
			...desc,
			enumerable: false
		});
		else defineBound(proto, key, desc.value);
	}
}
/** Shadows a prototype member with an own value, so a getter that builds from the instance runs once. */
function own(inst, key, value, enumerable = true) {
	Object.defineProperty(inst, key, {
		configurable: true,
		writable: true,
		enumerable,
		value
	});
	return value;
}
/** Like {@link own}, for a member that was never an own data property and has to stay out of `Object.keys`. */
function hide(inst, key, value) {
	return own(inst, key, value, false);
}
/** Adds members a table derives from the instance: each builds on first read and shadows as own data, and assignment shadows the same way, as when these were own properties. */
function derived(computes, table) {
	for (const key in computes) {
		const compute = computes[key];
		Object.defineProperty(table, key, {
			configurable: true,
			enumerable: true,
			get() {
				return own(this, key, compute(this));
			},
			set(value) {
				own(this, key, value);
			}
		});
	}
	return table;
}
function defineBound(proto, key, fn) {
	Object.defineProperty(proto, key, {
		configurable: true,
		get() {
			return this == null ? fn : own(this, key, fn.bind(this));
		},
		set(value) {
			own(this, key, value);
		}
	});
}
/** Returns the prototype to install on, or `undefined` if this group is already installed on it. */
function claim(inst, sentinel) {
	const proto = Object.getPrototypeOf(inst);
	return sentinel in proto ? void 0 : proto;
}
let installing;
let broke = false;
const breaker = {
	configurable: true,
	get() {
		broke = true;
	}
};
/**
* Installs a lazily-derived internal on the `_zod` prototype of `inst`'s
* constructor, computed from the internals object itself and cached there on
* first read. One accessor per constructor rather than one per instance.
*/
function defineLazyInternal(inst, key, compute) {
	const proto = Object.getPrototypeOf(inst._zod);
	if (key in proto && installing !== inst._zod) {
		installing = void 0;
		return;
	}
	installing = inst._zod;
	Object.defineProperty(proto, key, {
		configurable: true,
		get() {
			Object.defineProperty(this, key, breaker);
			const outer = broke;
			broke = false;
			try {
				const value = compute(this);
				if (broke) delete this[key];
				else Object.defineProperty(this, key, {
					configurable: true,
					writable: true,
					value
				});
				broke = broke || outer;
				return value;
			} catch (err) {
				delete this[key];
				broke = broke || outer;
				throw err;
			}
		},
		set(value) {
			Object.defineProperty(this, key, {
				configurable: true,
				writable: true,
				value
			});
		}
	});
}
/**
* Installs `key` on `inst`'s prototype, computed by `make` on first read and cached there as an own
* data property. One accessor per constructor rather than one per instance, because an own accessor
* puts every instance after the first into v8 dictionary mode. The key doubles as the sentinel.
*/
function installLazyProp(inst, key, make, enumerable) {
	const proto = claim(inst, key);
	if (!proto) return;
	Object.defineProperty(proto, key, {
		configurable: true,
		get() {
			const desc = {
				configurable: true,
				writable: true,
				enumerable,
				value: void 0
			};
			Object.defineProperty(this, key, desc);
			desc.value = make(this);
			Object.defineProperty(this, key, desc);
			return desc.value;
		},
		set(value) {
			Object.defineProperty(this, key, {
				configurable: true,
				writable: true,
				enumerable,
				value
			});
		}
	});
}
/** Marks the thunk `_catch` synthesises for a constant catch value. `Function.length` cannot tell that thunk from a user callback — rest and defaulted parameters both report arity 0 — and a user callback reads `ctx.error`, whose issues only finalize correctly against the caller's per-parse error map. Provenance can say what arity cannot. A plain string key rather than `Symbol.for`, whose call at module scope no bundler can prove pure — the same shape that anchored `urlCanParse` into every build. */
const CONSTANT_CATCH = "~constantCatch";
/** Wraps a constant catch value in a thunk tagged with {@link CONSTANT_CATCH}. */
function constantCatch(value) {
	const fn = () => value;
	fn[CONSTANT_CATCH] = true;
	return fn;
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/core/core.js
var _a$1;
const _zodDesc = {
	value: void 0,
	enumerable: false
};
let _E = "captureStackTrace" in Error ? Error : null;
function newError(Definition) {
	const E = _E;
	if (E) {
		const saved = E.stackTraceLimit;
		if (typeof saved === "number") {
			try {
				E.stackTraceLimit = 0;
			} catch {
				_E = null;
				return new Definition();
			}
			try {
				return new Definition();
			} finally {
				E.stackTraceLimit = saved;
			}
		}
	}
	return new Definition();
}
function $constructor(name, initializer, proto, params) {
	const zodProto = {};
	function Internals(def) {
		this.def = def;
		this.constr = _;
		this.traits = /* @__PURE__ */ new Set();
	}
	Internals.prototype = zodProto;
	const protoMembers = proto;
	const initialized = protoMembers && /* @__PURE__ */ new WeakSet();
	function init(inst, def) {
		if (!inst._zod) {
			_zodDesc.value = new Internals(def);
			try {
				Object.defineProperty(inst, "_zod", _zodDesc);
			} finally {
				_zodDesc.value = void 0;
			}
		} else if (inst._zod.traits.has(name)) return;
		inst._zod.traits.add(name);
		initializer(inst, def);
		if (initialized) {
			const own = Object.getPrototypeOf(inst);
			const ctorProto = inst._zod.constr.prototype;
			let up = own;
			while (up && up !== ctorProto) up = Object.getPrototypeOf(up);
			const target = up ?? own;
			if (!initialized.has(target)) {
				initialized.add(target);
				members(target, protoMembers);
			}
		}
		const proto = _.prototype;
		for (const k in proto) {
			if (!Object.prototype.hasOwnProperty.call(proto, k)) continue;
			if (!(k in inst)) inst[k] = proto[k].bind(inst);
		}
	}
	const Parent = params?.Parent ?? Object;
	class Definition extends Parent {}
	Object.defineProperty(Definition, "name", { value: name });
	function _(def) {
		const inst = params?.Parent ? newError(Definition) : this;
		init(inst, def);
		const deferred = inst._zod.deferred;
		if (deferred) {
			for (const fn of deferred) fn();
			inst._zod.deferred = void 0;
		}
		const pp = globalThis.__zod_globalConfig?.postProcessor;
		if (pp) pp(inst);
		return inst;
	}
	Object.defineProperty(_, "init", { value: init });
	Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
		if (params?.Parent && inst instanceof params.Parent) return true;
		return inst?._zod?.traits?.has(name);
	} });
	Object.defineProperty(_, "name", { value: name });
	return _;
}
var $ZodAsyncError = class extends Error {
	constructor() {
		super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
	}
};
var $ZodEncodeError = class extends Error {
	constructor(name) {
		super(`Encountered unidirectional transform during encode: ${name}`);
		this.name = "ZodEncodeError";
	}
};
(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
const globalConfig = globalThis.__zod_globalConfig;
function config(newConfig) {
	if (newConfig) Object.assign(globalConfig, newConfig);
	return globalConfig;
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/core/errors.js
const _issuesDesc = {
	value: void 0,
	enumerable: false
};
const _installedToString = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
const initializer$1 = (inst, def) => {
	inst.name = "$ZodError";
	_issuesDesc.value = def;
	Object.defineProperty(inst, "issues", _issuesDesc);
	_issuesDesc.value = void 0;
	Object.defineProperty(inst, "message", {
		value: JSON.stringify(def, jsonStringifyReplacer, 2),
		enumerable: true,
		configurable: true,
		writable: true
	});
	const proto = Object.getPrototypeOf(inst);
	if (!_installedToString.has(proto)) {
		_installedToString.add(proto);
		Object.defineProperty(proto, "toString", {
			configurable: true,
			enumerable: false,
			get() {
				const value = () => this.message;
				Object.defineProperty(this, "toString", {
					value,
					configurable: true,
					writable: true
				});
				return value;
			},
			set(value) {
				Object.defineProperty(this, "toString", {
					value,
					configurable: true,
					writable: true
				});
			}
		});
	}
};
const $ZodError = $constructor("$ZodError", initializer$1);
$constructor("$ZodError", initializer$1, void 0, { Parent: Error });
/** Get-or-create `obj[key]` as an own data property. A path segment naming an inherited member
* ("toString", "constructor") would otherwise read through to the prototype, and assigning
* "__proto__" would hit the setter instead of creating a key. */
function node(obj, key, make) {
	if (!Object.prototype.hasOwnProperty.call(obj, key)) {
		if (key === "__proto__") Object.defineProperty(obj, key, {
			value: make(),
			writable: true,
			enumerable: true,
			configurable: true
		});
		else obj[key] = make();
	}
	return obj[key];
}
function flattenError(error, mapper = (issue) => issue.message) {
	const fieldErrors = {};
	const formErrors = [];
	for (const sub of error.issues) if (sub.path.length > 0) node(fieldErrors, sub.path[0], () => []).push(mapper(sub));
	else formErrors.push(mapper(sub));
	return {
		formErrors,
		fieldErrors
	};
}
function formatError(error, mapper = (issue) => issue.message) {
	const fieldErrors = { _errors: [] };
	const processError = (error, path = []) => {
		for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
		else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
		else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
		else {
			const fullpath = [...path, ...issue.path];
			if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
			else {
				let curr = fieldErrors;
				let i = 0;
				while (i < fullpath.length) {
					const el = fullpath[i];
					const terminal = i === fullpath.length - 1;
					if (el === "_errors") {
						if (terminal) curr._errors.push(mapper(issue));
						i++;
						continue;
					}
					if (!Object.prototype.hasOwnProperty.call(curr, el)) Object.defineProperty(curr, el, {
						value: { _errors: [] },
						enumerable: true,
						writable: true,
						configurable: true
					});
					const node = curr[el];
					if (terminal) node._errors.push(mapper(issue));
					curr = node;
					i++;
				}
			}
		}
	};
	processError(error);
	return fieldErrors;
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/core/parse.js
function finalizeParams(callee, params) {
	return {
		callee: params?.callee ?? callee,
		Err: params?.Err
	};
}
const _parse = (_Err) => {
	const fn = (schema, value, _ctx, _params) => {
		const ctx = _ctx ? {
			..._ctx,
			async: false
		} : { async: false };
		const result = schema._zod.run({
			value,
			issues: []
		}, ctx);
		if (result instanceof Promise) throw new $ZodAsyncError();
		if (result.issues.length) {
			const e = new ((_params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
			captureStackTrace(e, _params?.callee ?? fn);
			throw e;
		}
		return result.value;
	};
	return fn;
};
const _parseAsync = (_Err) => {
	const fn = async (schema, value, _ctx, params) => {
		const ctx = _ctx ? {
			..._ctx,
			async: true
		} : { async: true };
		let result = schema._zod.run({
			value,
			issues: []
		}, ctx);
		if (result instanceof Promise) result = await result;
		if (result.issues.length) {
			const e = new ((params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
			captureStackTrace(e, params?.callee ?? fn);
			throw e;
		}
		return result.value;
	};
	return fn;
};
const _safeParse = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: false
	} : { async: false };
	const result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) throw new $ZodAsyncError();
	return result.issues.length ? failure(_Err, result.issues, ctx) : {
		success: true,
		data: result.value
	};
};
function failure(Err, issues, ctx) {
	let error;
	return {
		success: false,
		get error() {
			if (!error) {
				error = new Err(issues.map((iss) => finalizeIssue(iss, ctx, config())));
				issues = void 0;
				ctx = void 0;
			}
			return error;
		},
		set error(e) {
			error = e;
			issues = void 0;
			ctx = void 0;
		}
	};
}
const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: true
	} : { async: true };
	let result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) result = await result;
	return result.issues.length ? failure(_Err, result.issues, ctx) : {
		success: true,
		data: result.value
	};
};
const COMPILE_INVALID = /* @__PURE__ */ Symbol.for("zod.compile.invalid");
const COMPILE_FALLBACK = /* @__PURE__ */ Symbol.for("zod.compile.fallback");
const validate = ((schema, value, _ctx) => {
	const validator = schema._zod.bag.validator;
	if (validator !== void 0) {
		if (validator(value) !== COMPILE_INVALID) return true;
		if (validator.definite === true && _ctx === void 0) return false;
	}
	return validateFallback(schema, value, _ctx);
});
function validateFallback(schema, value, _ctx) {
	const ctx = _ctx ? {
		..._ctx,
		async: false,
		abortEarly: true
	} : {
		async: false,
		abortEarly: true
	};
	const fallbackRun = schema._zod.bag.fallbackRun;
	let result;
	if (fallbackRun) {
		ctx[COMPILE_FALLBACK] = true;
		result = fallbackRun({
			value,
			issues: []
		}, ctx);
	} else result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) throw new $ZodAsyncError();
	return result.issues.length === 0;
}
const validateAsync$1 = async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: true,
		abortEarly: true
	} : {
		async: true,
		abortEarly: true
	};
	let result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) result = await result;
	return result.issues.length === 0;
};
const _encode = (_Err) => {
	const parse = _parse(_Err);
	const fn = (schema, value, _ctx, _params) => {
		const ctx = _ctx ? {
			..._ctx,
			direction: "backward"
		} : { direction: "backward" };
		return parse(schema, value, ctx, finalizeParams(fn, _params));
	};
	return fn;
};
const _decode = (_Err) => {
	const parse = _parse(_Err);
	const fn = (schema, value, _ctx, _params) => {
		return parse(schema, value, _ctx, finalizeParams(fn, _params));
	};
	return fn;
};
const _encodeAsync = (_Err) => {
	const parseAsync = _parseAsync(_Err);
	const fn = async (schema, value, _ctx, _params) => {
		const ctx = _ctx ? {
			..._ctx,
			direction: "backward"
		} : { direction: "backward" };
		return await parseAsync(schema, value, ctx, finalizeParams(fn, _params));
	};
	return fn;
};
const _decodeAsync = (_Err) => {
	const parseAsync = _parseAsync(_Err);
	const fn = async (schema, value, _ctx, _params) => {
		return await parseAsync(schema, value, _ctx, finalizeParams(fn, _params));
	};
	return fn;
};
const _safeEncode = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		direction: "backward"
	} : { direction: "backward" };
	return _safeParse(_Err)(schema, value, ctx);
};
const _safeDecode = (_Err) => (schema, value, _ctx) => {
	return _safeParse(_Err)(schema, value, _ctx);
};
const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		direction: "backward"
	} : { direction: "backward" };
	return _safeParseAsync(_Err)(schema, value, ctx);
};
const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
	return _safeParseAsync(_Err)(schema, value, _ctx);
};
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/core/regexes.js
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link cuid2} instead.
* See https://github.com/paralleldrive/cuid.
*/
const cuid = /^[cC][0-9a-z]{6,}$/;
const cuid2 = /^[0-9a-z]+$/;
const ulid = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/;
const xid = /^[0-9a-vA-V]{20}$/;
const ksuid = /^[A-Za-z0-9]{27}$/;
const nanoid = /^[a-zA-Z0-9_-]{21}$/;
function nanoidOfLength(length) {
	return new RegExp(`^[a-zA-Z0-9_-]{${length}}$`);
}
/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
const duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
/** Returns a regex for validating an RFC 9562/4122 UUID.
*
* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
const uuid = (version) => {
	if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
	return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
/** Practical email validation */
const email = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
const _emoji$1 = `^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$`;
function emoji() {
	return new RegExp(_emoji$1, "u");
}
const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
const base64url = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/;
const httpProtocol = /^https?$/;
const e164 = /^\+[1-9]\d{6,14}$/;
const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
/** Anchors a pattern source. The interpolation lives here rather than at the call site because
* esbuild will not drop a `@__PURE__` call whose own argument interpolates a variable, but it
* will drop `anchor(dateSource)`. Keeping it inline pinned `date` into every bundle. */
function anchor(source) {
	return new RegExp(`^${source}$`);
}
const date = /*@__PURE__*/ anchor(dateSource);
function timeSource(args) {
	const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
	return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : args.seconds ? `${hhmm}:[0-5]\\d(?:\\.\\d+)?` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function time(args) {
	return new RegExp(`^${timeSource(args)}$`);
}
function datetime(args) {
	const opts = ["Z"];
	if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
	const qualified = `${timeSource({
		precision: args.precision,
		seconds: true
	})}(?:${opts.join("|")})`;
	const timeRegex = args.local ? `${qualified}|${timeSource({ precision: args.precision })}` : qualified;
	return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
const anyString = /^[\s\S]{0,}$/;
const number$1 = /^-?\d+(?:\.\d+)?$/;
const lowercase = /^[^A-Z]*$/;
const uppercase = /^[^a-z]*$/;
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/core/checks.js
const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
	var _a;
	inst._zod ?? (inst._zod = {});
	inst._zod.def = def;
	(_a = inst._zod).onattach ?? (_a.onattach = []);
});
/** Default `when` for length-based checks: run only on non-nullish values with a `length`. */
const _whenHasLength = (payload) => {
	const val = payload.value;
	return !nullish(val) && val.length !== void 0;
};
const numericOriginMap = {
	number: "number",
	bigint: "bigint",
	object: "date"
};
const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
	$ZodCheck.init(inst, def);
	const origin = numericOriginMap[typeof def.value];
	inst._zod.check = (payload) => {
		if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
		payload.issues.push({
			origin: numericOriginMap[typeof payload.value] ?? origin,
			code: "too_big",
			maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
			input: payload.value,
			inclusive: def.inclusive,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
	$ZodCheck.init(inst, def);
	const origin = numericOriginMap[typeof def.value];
	inst._zod.check = (payload) => {
		if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
		payload.issues.push({
			origin: numericOriginMap[typeof payload.value] ?? origin,
			code: "too_small",
			minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
			input: payload.value,
			inclusive: def.inclusive,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckMultipleOf = /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
	$ZodCheck.init(inst, def);
	inst._zod.check = (payload) => {
		if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
		if (typeof payload.value === "bigint" ? def.value !== BigInt(0) && payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
		payload.issues.push({
			origin: typeof payload.value,
			code: "not_multiple_of",
			divisor: def.value,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
	$ZodCheck.init(inst, def);
	def.format = def.format || "float64";
	const isInt = def.format?.includes("int");
	const origin = isInt ? "int" : "number";
	const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
	inst._zod.check = (payload) => {
		const input = payload.value;
		if (isInt) {
			if (!Number.isInteger(input)) {
				payload.issues.push({
					expected: origin,
					format: def.format,
					code: "invalid_type",
					continue: false,
					input,
					inst
				});
				return;
			}
			if (!Number.isSafeInteger(input)) {
				if (input > 0) payload.issues.push({
					input,
					code: "too_big",
					maximum: Number.MAX_SAFE_INTEGER,
					note: "Integers must be within the safe integer range.",
					inst,
					origin,
					inclusive: true,
					continue: !def.abort
				});
				else payload.issues.push({
					input,
					code: "too_small",
					minimum: Number.MIN_SAFE_INTEGER,
					note: "Integers must be within the safe integer range.",
					inst,
					origin,
					inclusive: true,
					continue: !def.abort
				});
				return;
			}
		}
		if (input < minimum) payload.issues.push({
			origin: "number",
			input,
			code: "too_small",
			minimum,
			inclusive: true,
			inst,
			continue: !def.abort
		});
		if (input > maximum) payload.issues.push({
			origin: "number",
			input,
			code: "too_big",
			maximum,
			inclusive: true,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
	inst._zod.check = (payload) => {
		const input = payload.value;
		const units = input.length;
		if ((typeof input === "string" && units > def.maximum ? codePointLength(input) : units) <= def.maximum) return;
		const origin = getLengthableOrigin(input);
		payload.issues.push({
			origin,
			code: "too_big",
			maximum: def.maximum,
			inclusive: true,
			input,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
	inst._zod.check = (payload) => {
		const input = payload.value;
		const units = input.length;
		if ((typeof input === "string" && units >= def.minimum && units < def.minimum * 2 ? codePointLength(input) : units) >= def.minimum) return;
		const origin = getLengthableOrigin(input);
		payload.issues.push({
			origin,
			code: "too_small",
			minimum: def.minimum,
			inclusive: true,
			input,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
	inst._zod.check = (payload) => {
		const input = payload.value;
		const units = input.length;
		const length = typeof input === "string" && units >= def.length && units <= def.length * 2 ? codePointLength(input) : units;
		if (length === def.length) return;
		const origin = getLengthableOrigin(input);
		const tooBig = length > def.length;
		payload.issues.push({
			origin,
			...tooBig ? {
				code: "too_big",
				maximum: def.length
			} : {
				code: "too_small",
				minimum: def.length
			},
			inclusive: true,
			exact: true,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
	var _a, _b;
	$ZodCheck.init(inst, def);
	if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
		def.pattern.lastIndex = 0;
		if (def.pattern.test(payload.value)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: def.format,
			input: payload.value,
			...def.pattern ? { pattern: def.pattern.toString() } : {},
			inst,
			continue: !def.abort
		});
	});
	else (_b = inst._zod).check ?? (_b.check = () => {});
});
const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
	$ZodCheckStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		def.pattern.lastIndex = 0;
		if (def.pattern.test(payload.value)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: payload.value,
			pattern: def.pattern.toString(),
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
	def.pattern ?? (def.pattern = lowercase);
	$ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
	def.pattern ?? (def.pattern = uppercase);
	$ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
	$ZodCheck.init(inst, def);
	const escapedRegex = escapeRegex(def.includes);
	def.pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position},}${escapedRegex}` : escapedRegex);
	inst._zod.check = (payload) => {
		if (payload.value.includes(def.includes, def.position)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: def.includes,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
	$ZodCheck.init(inst, def);
	const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
	def.pattern ?? (def.pattern = pattern);
	inst._zod.check = (payload) => {
		if (payload.value.startsWith(def.prefix)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: def.prefix,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
	$ZodCheck.init(inst, def);
	const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
	def.pattern ?? (def.pattern = pattern);
	inst._zod.check = (payload) => {
		if (payload.value.endsWith(def.suffix)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: def.suffix,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
	$ZodCheck.init(inst, def);
	inst._zod.check = (payload) => {
		payload.value = def.tx(payload.value);
	};
});
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/core/doc.js
var Doc = class {
	constructor(args = [], closed = {}) {
		this.content = [];
		this.indent = 0;
		this.args = args;
		this.closed = closed;
	}
	indented(fn) {
		this.indent += 1;
		try {
			fn(this);
		} finally {
			this.indent -= 1;
		}
	}
	write(arg) {
		if (typeof arg === "function") {
			arg(this, { execution: "sync" });
			arg(this, { execution: "async" });
			return;
		}
		const lines = arg.split("\n").filter((x) => x);
		const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
		const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
		for (const line of dedented) this.content.push(line);
	}
	compile() {
		const F = Function;
		const content = this?.content ?? [``];
		return new F(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {\n${content.join("\n")}\n};`)(...Object.values(this.closed));
	}
};
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/core/versions.js
const version = {
	major: 4,
	minor: 6,
	patch: 5
};
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/core/schemas.js
const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
	var _a;
	inst ?? (inst = {});
	inst._zod.def = def;
	inst._zod.bag = inst._zod.bag || {};
	inst._zod.version = version;
	const defChecks = inst._zod.def.checks;
	const checks = inst._zod.traits.has("$ZodCheck") ? [inst, ...defChecks ?? []] : defChecks?.length ? [...defChecks] : [];
	for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
	if (checks.length === 0) {
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		inst._zod.deferred?.push(() => {
			inst._zod.run = inst._zod.parse;
		});
	} else {
		const runChecks = (payload, checks, ctx) => {
			if (payload.memo) return payload;
			let isAborted = aborted(payload);
			let asyncResult;
			for (const ch of checks) {
				if (ch._zod.def.when) {
					if (explicitlyAborted(payload)) continue;
					if (!ch._zod.def.when(payload)) continue;
				} else if (isAborted) continue;
				const currLen = payload.issues.length;
				const _ = ch._zod.check(payload);
				if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
				if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
					await _;
					if (payload.issues.length === currLen) return;
					attachSchema(payload.issues, currLen, inst);
					if (!isAborted) isAborted = aborted(payload, currLen);
				});
				else {
					if (payload.issues.length === currLen) continue;
					attachSchema(payload.issues, currLen, inst);
					if (!isAborted) isAborted = aborted(payload, currLen);
				}
			}
			if (asyncResult) return asyncResult.then(() => {
				return payload;
			});
			return payload;
		};
		const handleCanaryResult = (canary, payload, ctx) => {
			if (aborted(canary)) {
				canary.aborted = true;
				return canary;
			}
			const checkResult = runChecks(payload, checks, ctx);
			if (checkResult instanceof Promise) {
				if (ctx.async === false) throw new $ZodAsyncError();
				return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
			}
			return inst._zod.parse(checkResult, ctx);
		};
		inst._zod.run = (payload, ctx) => {
			if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
			if (ctx.direction === "backward") {
				const canary = inst._zod.parse({
					value: payload.value,
					issues: []
				}, {
					...ctx,
					skipChecks: true
				});
				if (canary instanceof Promise) return canary.then((canary) => {
					return handleCanaryResult(canary, payload, ctx);
				});
				return handleCanaryResult(canary, payload, ctx);
			}
			const result = inst._zod.parse(payload, ctx);
			if (result instanceof Promise) {
				if (ctx.async === false) throw new $ZodAsyncError();
				return result.then((result) => runChecks(result, checks, ctx));
			}
			return runChecks(result, checks, ctx);
		};
	}
}, {
	get "~standard"() {
		return hide(this, "~standard", standardProps(this));
	},
	set "~standard"(value) {
		own(this, "~standard", value);
	}
});
/** The Standard Schema surface for `inst`. Shared so wrappers can extend it without forcing it. */
const toStandardResult = (r, ctx) => r.issues.length ? { issues: r.issues.map((iss) => finalizeIssue(iss, ctx, config())) } : { value: r.value };
async function validateAsync(inst, value) {
	const ctx = { async: true };
	return toStandardResult(await inst._zod.run({
		value,
		issues: []
	}, ctx), ctx);
}
function standardProps(inst) {
	return {
		validate: (value) => {
			const ctx = { async: false };
			try {
				const r = inst._zod.run({
					value,
					issues: []
				}, ctx);
				if (!(r instanceof Promise)) return toStandardResult(r, ctx);
			} catch (_) {}
			return validateAsync(inst, value);
		},
		vendor: "zod",
		version: 1
	};
}
const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = def.pattern ?? anyString;
	inst._zod.parse = (payload, _) => {
		if (def.coerce) try {
			payload.value = String(payload.value);
		} catch (_) {}
		if (typeof payload.value === "string") return payload;
		payload.issues.push({
			expected: "string",
			code: "invalid_type",
			input: payload.value,
			inst
		});
		return payload;
	};
});
const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
	$ZodCheckStringFormat.init(inst, def);
	$ZodString.init(inst, def);
});
const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
	def.pattern ?? (def.pattern = guid);
	$ZodStringFormat.init(inst, def);
});
const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
	if (def.version) {
		const v = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[def.version];
		if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
		def.pattern ?? (def.pattern = uuid(v));
	} else def.pattern ?? (def.pattern = uuid());
	$ZodStringFormat.init(inst, def);
});
const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
	def.pattern ?? (def.pattern = email);
	$ZodStringFormat.init(inst, def);
});
function canParseURL(input) {
	try {
		if (typeof URL !== "undefined" && typeof URL.canParse === "function") return URL.canParse(input);
		new URL(input);
		return true;
	} catch {
		return false;
	}
}
function validateURL(trimmed, def) {
	if (!("normalize" in def) && !("hostname" in def) && !("protocol" in def)) return canParseURL(trimmed) || 2;
	return parseURLObject(trimmed, def);
}
/** Parses a URL while preserving the non-normalizing HTTP guard. */
function parseURLObject(trimmed, def) {
	if (!def.normalize && def.protocol?.source === httpProtocol.source && !/^https?:\/\//i.test(trimmed)) return 1;
	try {
		if (typeof URL !== "undefined") {
			const URLStatic = URL;
			if (typeof URLStatic.parse === "function") return URLStatic.parse(trimmed) ?? 2;
		}
		return new URL(trimmed);
	} catch {
		return 2;
	}
}
const asciiTabOrNewline = /[\t\n\r]/g;
/** The URL parser deletes every ASCII tab, LF and CR from its input before it parses, so `new URL("https://exa\nmple.com")` reports on `example.com`. Applying the same deletion to the returned value closes the half of that divergence which can move the host; the parser's other rewrite, stripping C0 controls at the edges, cannot. */
function stripTabAndNewline(value) {
	return value.replace(asciiTabOrNewline, "");
}
function urlHostnameOk(url, hostname) {
	hostname.lastIndex = 0;
	return hostname.test(url.hostname);
}
function urlProtocolOk(url, protocol) {
	protocol.lastIndex = 0;
	return protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol);
}
const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		try {
			const trimmed = payload.value.trim();
			const url = validateURL(trimmed, def);
			if (url === 1) {
				payload.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid URL format",
					input: payload.value,
					inst,
					continue: !def.abort
				});
				return;
			}
			if (url === 2) {
				payload.issues.push({
					code: "invalid_format",
					format: "url",
					input: payload.value,
					inst,
					continue: !def.abort
				});
				return;
			}
			if (url === true) {
				payload.value = stripTabAndNewline(trimmed);
				return;
			}
			if (def.hostname && !urlHostnameOk(url, def.hostname)) payload.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: def.hostname.source,
				input: payload.value,
				inst,
				continue: !def.abort
			});
			if (def.protocol && !urlProtocolOk(url, def.protocol)) payload.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: def.protocol.source,
				input: payload.value,
				inst,
				continue: !def.abort
			});
			payload.value = def.normalize ? url.href : stripTabAndNewline(trimmed);
			return;
		} catch (_) {
			payload.issues.push({
				code: "invalid_format",
				format: "url",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		}
	};
});
const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
	def.pattern ?? (def.pattern = emoji());
	$ZodStringFormat.init(inst, def);
});
const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
	if (def.length !== void 0 && (!Number.isInteger(def.length) || def.length < 1)) throw new Error(`Invalid nanoid length: ${def.length}`);
	def.pattern ?? (def.pattern = def.length === void 0 ? nanoid : nanoidOfLength(def.length));
	$ZodStringFormat.init(inst, def);
});
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
* See https://github.com/paralleldrive/cuid.
*/
const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
	def.pattern ?? (def.pattern = cuid);
	$ZodStringFormat.init(inst, def);
});
const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
	def.pattern ?? (def.pattern = cuid2);
	$ZodStringFormat.init(inst, def);
});
const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
	def.pattern ?? (def.pattern = ulid);
	$ZodStringFormat.init(inst, def);
});
const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
	def.pattern ?? (def.pattern = xid);
	$ZodStringFormat.init(inst, def);
});
const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
	def.pattern ?? (def.pattern = ksuid);
	$ZodStringFormat.init(inst, def);
});
const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
	def.pattern ?? (def.pattern = datetime(def));
	$ZodStringFormat.init(inst, def);
});
const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
	def.pattern ?? (def.pattern = date);
	$ZodStringFormat.init(inst, def);
});
const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
	def.pattern ?? (def.pattern = time(def));
	$ZodStringFormat.init(inst, def);
});
const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
	def.pattern ?? (def.pattern = duration);
	$ZodStringFormat.init(inst, def);
});
const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
	def.pattern ?? (def.pattern = ipv4);
	$ZodStringFormat.init(inst, def);
});
/** An IPv6 address is written with hex digits, colons and dots, and nothing else. The guard is what makes the check below an IPv6 check: `new URL("http://[...]")` parses an authority, not an address, so `@` and `\` re-delimit it and `"::@1\\"` validates against the host `0.0.0.1`. The URL parser also deletes ASCII tab, LF and CR rather than failing, which is how `"::1\n"` validated as `::1`. */
const ipv6Alphabet = /^[0-9a-fA-F:.]+$/;
function isValidIPv6(value) {
	if (!ipv6Alphabet.test(value)) return false;
	return canParseURL(`http://[${value}]`);
}
const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
	def.pattern ?? (def.pattern = ipv6);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (!isValidIPv6(payload.value)) payload.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
	def.pattern ?? (def.pattern = cidrv4);
	$ZodStringFormat.init(inst, def);
});
function isValidCIDRv6(value) {
	const parts = value.split("/");
	if (parts.length !== 2) return false;
	const [address, prefix] = parts;
	if (!prefix) return false;
	const prefixNum = Number(prefix);
	if (`${prefixNum}` !== prefix) return false;
	if (prefixNum < 0 || prefixNum > 128) return false;
	return isValidIPv6(address);
}
const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
	def.pattern ?? (def.pattern = cidrv6);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (!isValidCIDRv6(payload.value)) payload.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
function isValidBase64(data) {
	if (data === "") return true;
	if (/\s/.test(data)) return false;
	if (data.length % 4 !== 0) return false;
	try {
		atob(data);
		return true;
	} catch {
		return false;
	}
}
const base64Charset = /^[0-9a-zA-Z+/]*={0,2}$/;
const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
	def.pattern ?? (def.pattern = base64Charset);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (isValidBase64(payload.value)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "base64",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const base64urlCharset = /^[A-Za-z0-9_-]*$/;
function isValidBase64URL(data) {
	if (!base64urlCharset.test(data)) return false;
	const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
	return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
}
const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
	def.pattern ?? (def.pattern = base64urlCharset);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (isValidBase64URL(payload.value)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
	def.pattern ?? (def.pattern = e164);
	$ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
	try {
		const tokensParts = token.split(".");
		if (tokensParts.length !== 3) return false;
		const [header] = tokensParts;
		if (!header) return false;
		const parsedHeader = JSON.parse(atob(header));
		if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
		if (!parsedHeader.alg) return false;
		if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
		return true;
	} catch {
		return false;
	}
}
const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (isValidJWT(payload.value, def.alg)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = number$1;
	inst._zod.parse = (payload, _ctx) => {
		if (def.coerce) try {
			payload.value = Number(payload.value);
		} catch (_) {}
		const input = payload.value;
		if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
		const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? String(input) : void 0 : void 0;
		payload.issues.push({
			expected: "number",
			code: "invalid_type",
			input,
			inst,
			...received ? { received } : {}
		});
		return payload;
	};
});
const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
	$ZodCheckNumberFormat.init(inst, def);
	$ZodNumber.init(inst, def);
});
const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload) => payload;
});
const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _ctx) => {
		payload.issues.push({
			expected: "never",
			code: "invalid_type",
			input: payload.value,
			inst
		});
		return payload;
	};
});
function handleArrayResult(result, final, index) {
	if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
	final.value[index] = result.value;
}
const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
	$ZodType.init(inst, def);
	const memo = globalConfig.memoizer;
	memo?.attach(inst);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		if (!Array.isArray(input)) {
			payload.issues.push({
				expected: "array",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		payload.value = memo ? memo.alloc(inst, payload, Array(input.length), ctx) : Array(input.length);
		const proms = [];
		const abortEarly = ctx?.abortEarly;
		for (let i = 0; i < input.length; i++) {
			const item = input[i];
			const result = def.element._zod.run({
				value: item,
				issues: []
			}, ctx);
			if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
			else {
				handleArrayResult(result, payload, i);
				if (abortEarly && result.issues.length !== 0 && aborted(result)) break;
			}
		}
		if (proms.length) return Promise.all(proms).then(() => payload);
		return payload;
	};
});
function handlePropertyResult(result, final, key, input, optin, optout) {
	const isPresent = key in input;
	const isOptionalOut = optout === "optional";
	if (!isPresent && isOptionalOut && optin === "optional") return;
	if (result.issues.length) {
		if (optin !== void 0 && isOptionalOut && !isPresent) return;
		final.issues.push(...prefixIssues(key, result.issues));
	}
	if (!isPresent && optin === void 0) {
		if (!result.issues.length) final.issues.push({
			code: "invalid_type",
			expected: "nonoptional",
			input: void 0,
			path: [key]
		});
		return;
	}
	if (result.value === void 0) {
		if (isPresent || optin === "defaulted" && !isOptionalOut) final.value[key] = void 0;
	} else final.value[key] = result.value;
}
const NO_SYMBOL_KEYS = [];
function normalizeDef(def) {
	const keys = Object.keys(def.shape);
	const ownSymbols = Object.getOwnPropertySymbols(def.shape);
	const symbolKeys = ownSymbols.length ? ownSymbols : NO_SYMBOL_KEYS;
	const allKeys = symbolKeys.length ? [...keys, ...symbolKeys] : keys;
	for (const k of allKeys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${String(k)}": expected a Zod schema`);
	const okeys = optionalKeys(def.shape);
	return {
		...def,
		allKeys,
		symbolKeys,
		keySet: new Set(keys),
		numKeys: keys.length,
		optionalKeys: new Set(okeys)
	};
}
function handleCatchall(proms, input, payload, ctx, def, inst, abortEarly) {
	const unrecognized = [];
	const keySet = def.keySet;
	const _catchall = def.catchall._zod;
	const t = _catchall.def.type;
	const optin = _catchall.optin;
	const optout = _catchall.optout;
	let seen = 0;
	for (const key in input) {
		if (abortEarly && payload.issues.length !== seen) {
			if (aborted(payload, seen)) break;
			seen = payload.issues.length;
		}
		if (keySet.has(key)) continue;
		if (key === "__proto__") {
			if (t === "never") unrecognized.push(key);
			continue;
		}
		if (t === "never") {
			unrecognized.push(key);
			continue;
		}
		const r = _catchall.run({
			value: input[key],
			issues: []
		}, ctx);
		if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
		else handlePropertyResult(r, payload, key, input, optin, optout);
	}
	if (unrecognized.length) payload.issues.push({
		code: "unrecognized_keys",
		keys: unrecognized,
		input,
		inst,
		continue: true
	});
	if (!proms.length) return payload;
	return Promise.all(proms).then(() => {
		return payload;
	});
}
const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
	$ZodType.init(inst, def);
	const desc = Object.getOwnPropertyDescriptor(def, "shape");
	const sh = desc?.get ? desc.get.raw : def.shape ?? {};
	if (sh) {
		const get = () => {
			const newSh = { ...sh };
			Object.defineProperty(def, "shape", { value: newSh });
			get.raw = newSh;
			return newSh;
		};
		get.raw = sh;
		Object.defineProperty(def, "shape", { get });
	}
	const _normalized = cached(() => normalizeDef(def));
	defineLazyInternal(inst, "propValues", (zod) => {
		const shape = zod.def.shape;
		const propValues = {};
		for (const key in shape) {
			const field = shape[key]._zod;
			if (field.values) {
				if (!Object.prototype.hasOwnProperty.call(propValues, key)) assignProp(propValues, key, /* @__PURE__ */ new Set());
				for (const v of field.values) propValues[key].add(v);
				if (field.optin !== void 0) propValues[key].add(void 0);
			}
		}
		return propValues;
	});
	const isObject = isObject$1;
	const catchall = def.catchall;
	let value;
	const memo = globalConfig.memoizer;
	memo?.attach(inst);
	inst._zod.parse = (payload, ctx) => {
		value ?? (value = _normalized.value);
		const input = payload.value;
		if (!isObject(input)) {
			payload.issues.push({
				expected: "object",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
		const proms = [];
		const shape = value.shape;
		const abortEarly = ctx?.abortEarly;
		let seen = payload.issues.length;
		for (const key of value.allKeys) {
			if (abortEarly && payload.issues.length !== seen) {
				if (aborted(payload, seen)) break;
				seen = payload.issues.length;
			}
			if (key === "__proto__") continue;
			const el = shape[key];
			const optin = el._zod.optin;
			const optout = el._zod.optout;
			const r = el._zod.run({
				value: input[key],
				issues: []
			}, ctx);
			if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
			else handlePropertyResult(r, payload, key, input, optin, optout);
		}
		if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
		return handleCatchall(proms, input, payload, ctx, _normalized.value, inst, abortEarly === true);
	};
});
const $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
	$ZodObject.init(inst, def);
	const superParse = inst._zod.parse;
	const _normalized = cached(() => normalizeDef(def));
	const memo = globalConfig.memoizer;
	const generateFastpass = (shape) => {
		const normalized = _normalized.value;
		const syms = normalized.symbolKeys;
		const doc = new Doc(["payload", "ctx"], {
			shape,
			inst,
			memo,
			syms
		});
		const parseStr = (k) => `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
		const prefixStr = (id, k) => `
          let ${id}_ab = false;
          for (let i = 0; i < ${id}.issues.length; i++) {
            const iss = ${id}.issues[i];
            iss.path = iss.path ? [${k}, ...iss.path] : [${k}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${id}_ab = true;
          }
          if (${id}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
		doc.write(`const input = payload.value;`);
		const ids = Object.create(null);
		let counter = 0;
		for (const key of normalized.allKeys) ids[key] = `key_${counter++}`;
		doc.write(memo ? `const newResult = memo.alloc(inst, payload, {}, ctx);` : `const newResult = {};`);
		for (const key of normalized.allKeys) {
			if (key === "__proto__") continue;
			const id = ids[key];
			const k = typeof key === "symbol" ? `syms[${syms.indexOf(key)}]` : esc(key);
			const isPresent = `${k} in input`;
			const schema = shape[key];
			const optin = schema?._zod?.optin;
			const isOptionalIn = optin !== void 0;
			const isOptionalOut = schema?._zod?.optout === "optional";
			doc.write(`const ${id} = ${parseStr(k)};`);
			if (isOptionalIn && isOptionalOut) {
				const assign = optin === "optional" ? `${id}_present` : `${id}.value !== undefined || ${id}_present`;
				doc.write(`
        const ${id}_present = ${isPresent};
        if (!${id}.issues.length || ${id}_present) {
          if (${id}.issues.length) {${prefixStr(id, k)}
          }

          if (${assign}) {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
			} else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${isPresent};
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${id}_present) {
          newResult[${k}] = ${id}.value;
        }

      `);
			else {
				doc.write(`
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
      `);
				if (optin === "defaulted") doc.write(`newResult[${k}] = ${id}.value;`);
				else doc.write(`
        if (${id}.value !== undefined || ${isPresent}) {
          newResult[${k}] = ${id}.value;
        }
      `);
			}
		}
		doc.write(`payload.value = newResult;`);
		doc.write(`return payload;`);
		return doc.compile();
	};
	let fastpass;
	const isObject = isObject$1;
	const jit = !globalConfig.jitless;
	const fastEnabled = jit && allowsEval.value;
	const catchall = def.catchall;
	let value;
	inst._zod.parse = (payload, ctx) => {
		value ?? (value = _normalized.value);
		const input = payload.value;
		if (!isObject(input)) {
			payload.issues.push({
				expected: "object",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
			if (!fastpass) fastpass = generateFastpass(def.shape);
			payload = fastpass(payload, ctx);
			if (!catchall) return payload;
			return handleCatchall([], input, payload, ctx, value, inst, ctx?.abortEarly === true);
		}
		return superParse(payload, ctx);
	};
});
function handleUnionResults(results, final, inst, ctx) {
	for (const result of results) if (result.issues.length === 0) {
		final.value = result.value;
		return final;
	}
	const nonaborted = results.filter((r) => !aborted(r));
	if (nonaborted.length === 1) {
		final.value = nonaborted[0].value;
		return nonaborted[0];
	}
	final.issues.push({
		code: "invalid_union",
		input: final.value,
		inst,
		errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
	});
	return final;
}
const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "optin", (zod) => zod.def.options.some((o) => o._zod.optin === "defaulted") ? "defaulted" : zod.def.options.some((o) => o._zod.optin !== void 0) ? "optional" : void 0);
	defineLazyInternal(inst, "optout", (zod) => zod.def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
	defineLazyInternal(inst, "values", (zod) => {
		if (zod.def.options.every((o) => o._zod.values)) return new Set(zod.def.options.flatMap((option) => Array.from(option._zod.values)));
	});
	defineLazyInternal(inst, "pattern", (zod) => {
		if (zod.def.options.every((o) => o._zod.pattern)) {
			const patterns = zod.def.options.map((o) => o._zod.pattern);
			return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
		}
	});
	const first = def.options.length === 1 ? def.options[0]._zod.run : null;
	inst._zod.parse = (payload, ctx) => {
		if (first) return first(payload, ctx);
		let async = false;
		const results = [];
		for (const option of def.options) {
			const result = option._zod.run({
				value: payload.value,
				issues: []
			}, ctx);
			if (result instanceof Promise) {
				results.push(result);
				async = true;
			} else {
				if (result.issues.length === 0) return result;
				results.push(result);
			}
		}
		if (!async) return handleUnionResults(results, payload, inst, ctx);
		return Promise.all(results).then((results) => {
			return handleUnionResults(results, payload, inst, ctx);
		});
	};
});
const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		const left = def.left._zod.run({
			value: input,
			issues: []
		}, ctx);
		const right = def.right._zod.run({
			value: input,
			issues: []
		}, ctx);
		if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
			return handleIntersectionResults(payload, left, right);
		});
		return handleIntersectionResults(payload, left, right);
	};
});
function mergeValues(a, b) {
	if (a === b) return {
		valid: true,
		data: a
	};
	if (a instanceof Date && b instanceof Date && +a === +b) return {
		valid: true,
		data: a
	};
	if (isPlainObject(a) && isPlainObject(b)) {
		const bKeys = Object.keys(b);
		const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
		const newObj = {
			...a,
			...b
		};
		if (Object.prototype.hasOwnProperty.call(newObj, "__proto__")) delete newObj.__proto__;
		for (const key of sharedKeys) {
			if (key === "__proto__") continue;
			const sharedValue = mergeValues(a[key], b[key]);
			if (!sharedValue.valid) return {
				valid: false,
				mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
			};
			newObj[key] = sharedValue.data;
		}
		return {
			valid: true,
			data: newObj
		};
	}
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return {
			valid: false,
			mergeErrorPath: []
		};
		const newArray = [];
		for (let index = 0; index < a.length; index++) {
			const itemA = a[index];
			const itemB = b[index];
			const sharedValue = mergeValues(itemA, itemB);
			if (!sharedValue.valid) return {
				valid: false,
				mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
			};
			newArray.push(sharedValue.data);
		}
		return {
			valid: true,
			data: newArray
		};
	}
	return {
		valid: false,
		mergeErrorPath: []
	};
}
function handleIntersectionResults(result, left, right) {
	const unrecKeys = /* @__PURE__ */ new Map();
	let unrecIssue;
	const keyIssues = /* @__PURE__ */ new Map();
	const collect = (iss, side) => {
		let keys;
		if (iss.code === "unrecognized_keys" && !iss.path?.length) {
			unrecIssue ?? (unrecIssue = iss);
			keys = iss.keys;
		} else if (iss.code === "invalid_key" && iss.origin === "record" && iss.path?.length === 1) {
			const k = String(iss.path[0]);
			if (!keyIssues.has(k)) keyIssues.set(k, iss);
			keys = [k];
		} else return false;
		for (const k of keys) {
			if (!unrecKeys.has(k)) unrecKeys.set(k, {});
			unrecKeys.get(k)[side] = true;
		}
		return true;
	};
	for (const iss of left.issues) if (!collect(iss, "l")) result.issues.push(iss);
	for (const iss of right.issues) if (!collect(iss, "r")) result.issues.push(iss);
	const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
	if (bothKeys.length) {
		const aggregated = unrecIssue ? bothKeys.filter((k) => unrecIssue.keys.includes(k)) : [];
		if (aggregated.length) result.issues.push({
			...unrecIssue,
			keys: aggregated
		});
		for (const k of bothKeys) if (!aggregated.includes(k) && keyIssues.has(k)) result.issues.push(keyIssues.get(k));
	}
	const merged = mergeValues(left.value, right.value);
	if (!merged.valid) {
		if (aborted(result)) return result;
		throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
	}
	result.value = merged.data;
	return result;
}
const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
	$ZodType.init(inst, def);
	const values = getEnumValues(def.entries);
	const valuesSet = new Set(values);
	inst._zod.values = valuesSet;
	defineLazyInternal(inst, "pattern", (zod) => {
		const patternValues = getEnumValues(zod.def.entries).filter((k) => propertyKeyTypes.has(typeof k));
		return new RegExp(patternValues.length ? `^(${patternValues.map((o) => escapeRegex(o.toString())).join("|")})$` : "^[^\\s\\S]$");
	});
	inst._zod.parse = (payload, _ctx) => {
		const input = payload.value;
		if (valuesSet.has(input)) return payload;
		payload.issues.push({
			code: "invalid_value",
			values,
			input,
			inst
		});
		return payload;
	};
});
const $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
	$ZodType.init(inst, def);
	const values = new Set(def.values);
	inst._zod.values = values;
	defineLazyInternal(inst, "pattern", (zod) => {
		const vals = zod.def.values;
		return new RegExp(vals.length ? `^(${vals.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$` : "^[^\\s\\S]$");
	});
	inst._zod.parse = (payload, _ctx) => {
		const input = payload.value;
		if (values.has(input)) return payload;
		payload.issues.push({
			code: "invalid_value",
			values: def.values,
			input,
			inst
		});
		return payload;
	};
});
const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	globalConfig.memoizer?.guard(inst);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
		const _out = def.transform(payload.value, payload);
		if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
			payload.value = output;
			return payload;
		});
		if (_out instanceof Promise) throw new $ZodAsyncError();
		payload.value = _out;
		return payload;
	};
});
function handleOptionalResult(payload, result) {
	payload.value = result.issues.length ? void 0 : result.value;
	return payload;
}
const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
	inst._zod.optout = "optional";
	defineLazyInternal(inst, "values", (zod) => {
		const values = zod.def.innerType._zod.values;
		return values ? /* @__PURE__ */ new Set([...values, void 0]) : void 0;
	});
	defineLazyInternal(inst, "pattern", (zod) => {
		const pattern = zod.def.innerType._zod.pattern;
		return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		if (payload.value === void 0) {
			if (def.innerType._zod.optin !== "defaulted") return payload;
			const result = def.innerType._zod.run({
				value: payload.value,
				issues: []
			}, ctx);
			if (result instanceof Promise) return result.then((result) => handleOptionalResult(payload, result));
			return handleOptionalResult(payload, result);
		}
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	defineLazyInternal(inst, "pattern", (zod) => zod.def.innerType._zod.pattern);
	inst._zod.parse = (payload, ctx) => {
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin);
	defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
	defineLazyInternal(inst, "pattern", (zod) => {
		const pattern = zod.def.innerType._zod.pattern;
		return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
	});
	defineLazyInternal(inst, "values", (zod) => {
		return zod.def.innerType._zod.values ? /* @__PURE__ */ new Set([...zod.def.innerType._zod.values, null]) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		if (payload.value === null) return payload;
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "defaulted";
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		if (payload.value === void 0) {
			payload.value = def.defaultValue;
			/**
			* $ZodDefault returns the default value immediately in forward direction.
			* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
			return payload;
		}
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
		return handleDefaultResult(result, def);
	};
});
function handleDefaultResult(payload, def) {
	if (payload.value === void 0) payload.value = def.defaultValue;
	return payload;
}
const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "defaulted";
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		if (payload.value === void 0) payload.value = def.defaultValue;
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "values", (zod) => {
		const v = zod.def.innerType._zod.values;
		return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
		return handleNonOptionalResult(result, inst);
	};
});
function handleNonOptionalResult(payload, inst) {
	if (!payload.issues.length && payload.value === void 0) payload.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: payload.value,
		inst
	});
	return payload;
}
function handleCatchResult(payload, result, def, ctx) {
	if (!result.issues.length) {
		payload.value = result.value;
		if (result.memo) payload.memo = true;
		return payload;
	}
	payload.value = def.catchValue({
		...result,
		value: payload.value,
		error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
		input: payload.value
	});
	return payload;
}
const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
	defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		const result = def.innerType._zod.run({
			value: payload.value,
			issues: []
		}, ctx);
		if (result instanceof Promise) return result.then((result) => handleCatchResult(payload, result, def, ctx));
		return handleCatchResult(payload, result, def, ctx);
	};
});
const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "values", (zod) => zod.def.in._zod.values);
	defineLazyInternal(inst, "optin", (zod) => zod.def.in._zod.optin);
	defineLazyInternal(inst, "optout", (zod) => zod.def.out._zod.optout);
	defineLazyInternal(inst, "propValues", (zod) => zod.def.in._zod.propValues);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") {
			const right = def.out._zod.run(payload, ctx);
			if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
			return handlePipeResult(right, def.in, ctx);
		}
		const left = def.in._zod.run(payload, ctx);
		if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
		return handlePipeResult(left, def.out, ctx);
	};
});
function handlePipeResult(left, next, ctx) {
	if (left.issues.some((iss) => iss.code !== "unrecognized_keys")) {
		left.aborted = true;
		return left;
	}
	return next._zod.run({
		value: left.value,
		issues: left.issues
	}, ctx);
}
const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "propValues", (zod) => zod.def.innerType._zod.propValues);
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	defineLazyInternal(inst, "optin", (zod) => zod.def.innerType?._zod?.optin);
	defineLazyInternal(inst, "optout", (zod) => zod.def.innerType?._zod?.optout);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then(handleReadonlyResult);
		return handleReadonlyResult(result);
	};
});
function handleReadonlyResult(payload) {
	if (!payload.memo) payload.value = Object.freeze(payload.value);
	return payload;
}
const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
	$ZodCheck.init(inst, def);
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _) => {
		return payload;
	};
	inst._zod.check = (payload) => {
		const input = payload.value;
		const r = def.fn(input);
		if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
		handleRefineResult(r, payload, input, inst);
	};
});
function handleRefineResult(result, payload, input, inst) {
	if (!result) {
		const _iss = {
			code: "custom",
			input,
			inst,
			path: [...inst._zod.def.path ?? []],
			continue: !inst._zod.def.abort
		};
		if (inst._zod.def.params) _iss.params = inst._zod.def.params;
		payload.issues.push(issue(_iss));
	}
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/core/memoizer.js
var $ZodCyclicError = class extends Error {
	constructor() {
		super(`Cannot parse a reference cycle that closes through a transform`);
		this.name = "ZodCyclicError";
	}
};
/** Keyed off the context object every schema in one parse call already shares. */
const STATE = "~memo";
const NO_ISSUES = [];
function isRef(value) {
	return value !== null && typeof value === "object";
}
function cloneIssues(issues) {
	return issues.map((iss) => iss.path ? {
		...iss,
		path: iss.path.slice()
	} : { ...iss });
}
const recursive = /*@__PURE__*/ new WeakMap();
/** What the walk established, in order of certainty: ordered so the strongest answer among children wins. */
const NONE = 0;
const ASSUMED = 1;
const PROVEN = 2;
/** Whether this schema's subtree contains a cycle, so one parse can re-enter it. */
function isRecursive(inst, stack, resolve) {
	const cached = recursive.get(inst);
	if (cached !== void 0) return cached ? PROVEN : NONE;
	if (stack.has(inst)) return PROVEN;
	stack.add(inst);
	let result = NONE;
	const check = (child) => {
		if (result !== PROVEN && child?._zod) {
			const answer = isRecursive(child, stack, resolve);
			if (answer > result) result = answer;
		}
	};
	const shape = (sh, spread) => {
		let answer = NONE;
		for (const key of Reflect.ownKeys(sh)) {
			const desc = Object.getOwnPropertyDescriptor(sh, key);
			if (spread && !desc.enumerable) continue;
			const child = desc.get ? ASSUMED : desc.value?._zod ? isRecursive(desc.value, stack, resolve) : NONE;
			if (child > answer) answer = child;
		}
		return answer;
	};
	const merge = (answer) => {
		if (answer > result) result = answer;
	};
	const def = inst._zod.def;
	switch (def.type) {
		case "object": {
			const raw = rawShape(def);
			merge(raw ? shape(raw, true) : ASSUMED);
			check(def.catchall);
			break;
		}
		case "array":
			check(def.element);
			break;
		case "tuple":
			for (const el of def.items) check(el);
			check(def.rest);
			break;
		case "record":
		case "map":
			check(def.keyType);
			check(def.valueType);
			break;
		case "set":
			check(def.valueType);
			break;
		case "union":
			for (const el of def.options) check(el);
			break;
		case "intersection":
			check(def.left);
			check(def.right);
			break;
		case "optional":
		case "nullable":
		case "default":
		case "prefault":
		case "catch":
		case "readonly":
		case "nonoptional":
		case "promise":
		case "success":
			check(def.innerType);
			break;
		case "pipe":
			check(def.in);
			check(def.out);
			break;
		case "function":
			check(def.input);
			check(def.output);
			break;
		case "lazy": {
			const inner = def._cachedInner ?? (resolve ? inst._zod.innerType : void 0);
			merge(inner ? isRecursive(inner, stack, false) : ASSUMED);
			break;
		}
		case "template_literal":
		case "string":
		case "number":
		case "int":
		case "boolean":
		case "bigint":
		case "symbol":
		case "undefined":
		case "null":
		case "void":
		case "never":
		case "any":
		case "unknown":
		case "date":
		case "nan":
		case "enum":
		case "literal":
		case "file":
		case "transform":
		case "custom": break;
		default: for (const key in def) {
			const desc = Object.getOwnPropertyDescriptor(def, key);
			if (!desc || desc.get) continue;
			const value = desc.value;
			if (!value || typeof value !== "object") continue;
			if (value._zod) check(value);
			else if (Array.isArray(value)) for (const el of value) check(el);
		}
	}
	stack.delete(inst);
	return settle(inst, result);
}
/** An assumed answer must not outlive the resolution that settles it, so only a certain one is cached. */
function settle(inst, answer) {
	if (answer !== ASSUMED) recursive.set(inst, answer === PROVEN);
	return answer;
}
function bucketFor(state, inst) {
	let bucket = state.buckets.get(inst);
	if (!bucket) {
		bucket = /* @__PURE__ */ new WeakMap();
		state.buckets.set(inst, bucket);
	}
	return bucket;
}
let handoff;
const open$1 = [];
const memo$3 = {
	alloc(_inst, payload, empty) {
		const bucket = handoff;
		if (!bucket) return empty;
		handoff = void 0;
		const entry = {
			value: empty,
			issues: null
		};
		bucket.set(payload.value, entry);
		open$1.push(entry);
		return empty;
	},
	guard(inst) {
		var _a;
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		inst._zod.deferred.push(() => {
			const base = inst._zod.parse;
			const wrapped = (payload, ctx) => {
				if (ctx.direction !== "backward" && isBackEdge(ctx, payload.value)) throw new $ZodCyclicError();
				return base(payload, ctx);
			};
			inst._zod.parse = wrapped;
			if (inst._zod.run === base) inst._zod.run = wrapped;
		});
	},
	attach(inst) {
		var _a;
		let isRecursiveInst;
		let rechecked = false;
		let lastCtx;
		let lastBucket;
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		inst._zod.deferred.push(() => {
			const base = inst._zod.parse;
			const wrapped = (payload, ctx) => {
				if (isRecursiveInst === void 0) {
					const walked = isRecursive(inst, /* @__PURE__ */ new Set(), false);
					if (walked === NONE) {
						inst._zod.parse = base;
						if (inst._zod.run === wrapped) inst._zod.run = base;
						return base(payload, ctx);
					}
					if (walked === PROVEN || rechecked) isRecursiveInst = true;
					else rechecked = true;
				}
				const input = payload.value;
				if (!isRef(input)) return base(payload, ctx);
				let state = ctx[STATE];
				if (!state) {
					state = {
						buckets: /* @__PURE__ */ new WeakMap(),
						backEdges: void 0
					};
					ctx[STATE] = state;
				}
				let bucket;
				if (lastCtx === ctx) bucket = lastBucket;
				else {
					bucket = bucketFor(state, inst);
					lastCtx = ctx;
					lastBucket = bucket;
				}
				const hit = bucket.get(input);
				if (hit) {
					payload.value = hit.value;
					if (hit.issues) {
						if (hit.issues.length) payload.issues.push(...cloneIssues(hit.issues));
					} else {
						payload.memo = true;
						state.backEdges ?? (state.backEdges = /* @__PURE__ */ new WeakSet());
						state.backEdges.add(hit.value);
					}
					return payload;
				}
				handoff = bucket;
				const depth = open$1.length;
				const result = base(payload, ctx);
				handoff = void 0;
				const entry = open$1.length > depth ? open$1.pop() : void 0;
				if (result instanceof Promise) return result.then((r) => {
					if (entry) entry.issues = r.issues.length ? cloneIssues(r.issues) : NO_ISSUES;
					return r;
				});
				if (entry) entry.issues = result.issues.length ? cloneIssues(result.issues) : NO_ISSUES;
				return result;
			};
			inst._zod.parse = wrapped;
			if (inst._zod.run === base) inst._zod.run = wrapped;
		});
	}
};
/** The memoizer that gives containers cycle support. `zod` installs it by default; `zod/mini` opts in with `config({ memoizer: memoizer() })`. */
function memoizer() {
	return memo$3;
}
/** Whether this value is a node a back-edge resolved to before it finished. */
function isBackEdge(ctx, value) {
	const backEdges = ctx[STATE]?.backEdges;
	return backEdges !== void 0 && isRef(value) && backEdges.has(value);
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/locales/en.js
const error = () => {
	const Sizable = {
		string: {
			unit: "characters",
			verb: "to have"
		},
		file: {
			unit: "bytes",
			verb: "to have"
		},
		array: {
			unit: "items",
			verb: "to have"
		},
		set: {
			unit: "items",
			verb: "to have"
		},
		map: {
			unit: "entries",
			verb: "to have"
		}
	};
	function getSizing(origin) {
		return Sizable[origin] ?? null;
	}
	const FormatDictionary = {
		regex: "input",
		email: "email address",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO datetime",
		date: "ISO date",
		time: "ISO time",
		duration: "ISO duration",
		ipv4: "IPv4 address",
		ipv6: "IPv6 address",
		mac: "MAC address",
		cidrv4: "IPv4 range",
		cidrv6: "IPv6 range",
		base64: "base64-encoded string",
		base64url: "base64url-encoded string",
		json_string: "JSON string",
		e164: "E.164 number",
		currency_code: "currency code",
		credit_card: "credit card number",
		iban: "IBAN",
		jwt: "JWT",
		template_literal: "input"
	};
	const TypeDictionary = { nan: "NaN" };
	function getTypeName(type, input) {
		if (type === "number" && typeof input === "number" && !Number.isFinite(input)) return String(input);
		return TypeDictionary[type] ?? type;
	}
	return (issue) => {
		switch (issue.code) {
			case "invalid_type": return `Invalid input: expected ${getTypeName(issue.expected)}, received ${getTypeName(parsedType(issue.input), issue.input)}`;
			case "invalid_value":
				if (issue.values.length === 1) return `Invalid input: expected ${stringifyPrimitive(issue.values[0])}`;
				return `Invalid option: expected one of ${joinValues(issue.values, "|")}`;
			case "too_big": {
				const adj = issue.exact ? "exactly " : issue.inclusive ? "<=" : "<";
				const sizing = getSizing(issue.origin);
				if (sizing) return `Too big: expected ${issue.origin ?? "value"} to have ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elements"}`;
				return `Too big: expected ${issue.origin ?? "value"} to be ${adj}${issue.maximum.toString()}`;
			}
			case "too_small": {
				const adj = issue.exact ? "exactly " : issue.inclusive ? ">=" : ">";
				const sizing = getSizing(issue.origin);
				if (sizing) return `Too small: expected ${issue.origin} to have ${adj}${issue.minimum.toString()} ${sizing.unit}`;
				return `Too small: expected ${issue.origin} to be ${adj}${issue.minimum.toString()}`;
			}
			case "invalid_format": {
				const _issue = issue;
				if (_issue.format === "starts_with") return `Invalid string: must start with "${_issue.prefix}"`;
				if (_issue.format === "ends_with") return `Invalid string: must end with "${_issue.suffix}"`;
				if (_issue.format === "includes") return `Invalid string: must include "${_issue.includes}"`;
				if (_issue.format === "regex") return `Invalid string: must match pattern ${_issue.pattern}`;
				return `Invalid ${FormatDictionary[_issue.format] ?? issue.format}`;
			}
			case "not_multiple_of": return `Invalid number: must be a multiple of ${issue.divisor}`;
			case "unrecognized_keys": return `Unrecognized key${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${issue.origin}`;
			case "invalid_union":
				if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) return `Invalid discriminator value. Expected ${issue.options.map((o) => `'${o}'`).join(" | ")}`;
				if (issue.inclusive === false) return "Invalid input: more than one option matched";
				return "Invalid input";
			case "invalid_element": return `Invalid value in ${issue.origin}`;
			default: return `Invalid input`;
		}
	};
};
function en_default() {
	return { localeError: error() };
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/core/registries.js
var _a;
var $ZodRegistry = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap();
		this._idmap = /* @__PURE__ */ new Map();
	}
	add(schema, ..._meta) {
		const meta = _meta[0];
		this._map.set(schema, meta);
		if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
		return this;
	}
	clear() {
		this._map = /* @__PURE__ */ new WeakMap();
		this._idmap = /* @__PURE__ */ new Map();
		return this;
	}
	remove(schema) {
		const meta = this._map.get(schema);
		if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
		this._map.delete(schema);
		return this;
	}
	get(schema) {
		const p = schema._zod.parent;
		if (p) {
			const pm = { ...this.get(p) ?? {} };
			delete pm.id;
			const f = {
				...pm,
				...this._map.get(schema)
			};
			return Object.keys(f).length ? f : void 0;
		}
		return this._map.get(schema);
	}
	has(schema) {
		return this._map.has(schema);
	}
};
function registry() {
	return new $ZodRegistry();
}
(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
const globalRegistry = globalThis.__zod_globalRegistry;
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/core/api.js
function snapshotChecks(def) {
	if (def.checks) def.checks = [...def.checks];
	return def;
}
// @__NO_SIDE_EFFECTS__
function _string(Class, params) {
	return new Class(snapshotChecks({
		type: "string",
		...normalizeParams(params)
	}));
}
// @__NO_SIDE_EFFECTS__
function _email(Class, params) {
	return new Class({
		type: "string",
		format: "email",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _guid(Class, params) {
	return new Class({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uuid(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uuidv4(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v4",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uuidv6(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v6",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uuidv7(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v7",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _url(Class, params) {
	return new Class({
		type: "string",
		format: "url",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _emoji(Class, params) {
	return new Class({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _nanoid(Class, params) {
	return new Class({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link _cuid2} instead.
* See https://github.com/paralleldrive/cuid.
*/
// @__NO_SIDE_EFFECTS__
function _cuid(Class, params) {
	return new Class({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _cuid2(Class, params) {
	return new Class({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _ulid(Class, params) {
	return new Class({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _xid(Class, params) {
	return new Class({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _ksuid(Class, params) {
	return new Class({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _ipv4(Class, params) {
	return new Class({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _ipv6(Class, params) {
	return new Class({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _cidrv4(Class, params) {
	return new Class({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _cidrv6(Class, params) {
	return new Class({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _base64(Class, params) {
	return new Class({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _base64url(Class, params) {
	return new Class({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _e164(Class, params) {
	return new Class({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _jwt(Class, params) {
	return new Class({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _isoDateTime(Class, params) {
	return new Class({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: false,
		local: false,
		precision: null,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _isoDate(Class, params) {
	return new Class({
		type: "string",
		format: "date",
		check: "string_format",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _isoTime(Class, params) {
	return new Class({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _isoDuration(Class, params) {
	return new Class({
		type: "string",
		format: "duration",
		check: "string_format",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _number(Class, params) {
	return new Class(snapshotChecks({
		type: "number",
		checks: [],
		...normalizeParams(params)
	}));
}
// @__NO_SIDE_EFFECTS__
function _int(Class, params) {
	return new Class({
		type: "number",
		check: "number_format",
		abort: false,
		format: "safeint",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _unknown(Class) {
	return new Class({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function _never(Class, params) {
	return new Class({
		type: "never",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _lt(value, params) {
	return new $ZodCheckLessThan({
		check: "less_than",
		...normalizeParams(params),
		value,
		inclusive: false
	});
}
// @__NO_SIDE_EFFECTS__
function _lte(value, params) {
	return new $ZodCheckLessThan({
		check: "less_than",
		...normalizeParams(params),
		value,
		inclusive: true
	});
}
// @__NO_SIDE_EFFECTS__
function _gt(value, params) {
	return new $ZodCheckGreaterThan({
		check: "greater_than",
		...normalizeParams(params),
		value,
		inclusive: false
	});
}
// @__NO_SIDE_EFFECTS__
function _gte(value, params) {
	return new $ZodCheckGreaterThan({
		check: "greater_than",
		...normalizeParams(params),
		value,
		inclusive: true
	});
}
// @__NO_SIDE_EFFECTS__
function _multipleOf(value, params) {
	return new $ZodCheckMultipleOf({
		check: "multiple_of",
		...normalizeParams(params),
		value
	});
}
// @__NO_SIDE_EFFECTS__
function _maxLength(maximum, params) {
	return new $ZodCheckMaxLength({
		check: "max_length",
		...normalizeParams(params),
		maximum
	});
}
// @__NO_SIDE_EFFECTS__
function _minLength(minimum, params) {
	return new $ZodCheckMinLength({
		check: "min_length",
		...normalizeParams(params),
		minimum
	});
}
// @__NO_SIDE_EFFECTS__
function _length(length, params) {
	return new $ZodCheckLengthEquals({
		check: "length_equals",
		...normalizeParams(params),
		length
	});
}
// @__NO_SIDE_EFFECTS__
function _regex(pattern, params) {
	return new $ZodCheckRegex({
		check: "string_format",
		format: "regex",
		...normalizeParams(params),
		pattern
	});
}
// @__NO_SIDE_EFFECTS__
function _lowercase(params) {
	return new $ZodCheckLowerCase({
		check: "string_format",
		format: "lowercase",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uppercase(params) {
	return new $ZodCheckUpperCase({
		check: "string_format",
		format: "uppercase",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _includes(includes, params) {
	return new $ZodCheckIncludes({
		check: "string_format",
		format: "includes",
		...normalizeParams(params),
		includes
	});
}
// @__NO_SIDE_EFFECTS__
function _startsWith(prefix, params) {
	return new $ZodCheckStartsWith({
		check: "string_format",
		format: "starts_with",
		...normalizeParams(params),
		prefix
	});
}
// @__NO_SIDE_EFFECTS__
function _endsWith(suffix, params) {
	return new $ZodCheckEndsWith({
		check: "string_format",
		format: "ends_with",
		...normalizeParams(params),
		suffix
	});
}
// @__NO_SIDE_EFFECTS__
function _overwrite(tx) {
	return new $ZodCheckOverwrite({
		check: "overwrite",
		tx
	});
}
// @__NO_SIDE_EFFECTS__
function _normalize(form) {
	return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
}
// @__NO_SIDE_EFFECTS__
function _trim() {
	return /* @__PURE__ */ _overwrite((input) => input.trim());
}
// @__NO_SIDE_EFFECTS__
function _toLowerCase() {
	return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function _toUpperCase() {
	return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function _slugify() {
	return /* @__PURE__ */ _overwrite((input) => slugify(input));
}
// @__NO_SIDE_EFFECTS__
function _array(Class, element, params) {
	return new Class({
		type: "array",
		element,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _refine(Class, fn, _params) {
	return new Class({
		type: "custom",
		check: "custom",
		fn,
		...normalizeParams(_params)
	});
}
// @__NO_SIDE_EFFECTS__
function _superRefine(fn, params) {
	const ch = /* @__PURE__ */ _check((payload) => {
		payload.addIssue = (issue$2) => {
			if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
			else {
				const _issue = issue$2;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				if (!("input" in _issue)) _issue.input = payload.value;
				_issue.inst ?? (_issue.inst = ch);
				_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
				payload.issues.push(issue(_issue));
			}
		};
		return fn(payload.value, payload);
	}, params);
	return ch;
}
// @__NO_SIDE_EFFECTS__
function _check(fn, params) {
	const ch = new $ZodCheck({
		check: "custom",
		...normalizeParams(params)
	});
	ch._zod.check = fn;
	return ch;
}
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/core/to-json-schema.js
function assignProps(target, ...sources) {
	for (const source of sources) for (const key of Reflect.ownKeys(source)) if (Object.prototype.propertyIsEnumerable.call(source, key)) assignProp(target, key, source[key]);
	return target;
}
function initializeContext(params) {
	let target = params?.target ?? "draft-2020-12";
	if (target === "draft-4") target = "draft-04";
	if (target === "draft-7") target = "draft-07";
	return {
		processors: params.processors ?? {},
		metadataRegistry: params?.metadata ?? globalRegistry,
		target,
		unrepresentable: params?.unrepresentable ?? "throw",
		override: params?.override ?? (() => {}),
		io: params?.io ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		sharedDefsExtractedFor: void 0,
		sharedEmitDoneFor: void 0,
		cycles: params?.cycles ?? "ref",
		reused: params?.reused ?? "inline",
		intersections: [],
		deferred: [],
		external: params?.external ?? void 0
	};
}
/**
* Applies the `unrepresentable` setting at a site that has no JSON Schema equivalent. Throws
* `message` unless the setting (or the handler's return value) says otherwise. Returns `true` if a
* custom JSON Schema was written into `json`, in which case the caller must not write its own.
*/
function handleUnrepresentable(schema, ctx, json, params, message) {
	const result = typeof ctx.unrepresentable === "function" ? ctx.unrepresentable({
		zodSchema: schema,
		path: params.path,
		message
	}) : ctx.unrepresentable;
	if (result === "any") return false;
	if (result === void 0 || result === "throw") throw new Error(message);
	Object.assign(json, result);
	return true;
}
function processSchema(schema, ctx, _params = {
	path: [],
	schemaPath: []
}) {
	var _a;
	const def = schema._zod.def;
	const seen = ctx.seen.get(schema);
	if (seen) {
		seen.count++;
		if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
		return seen.schema;
	}
	const result = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: _params.path
	};
	ctx.seen.set(schema, result);
	ctx.sharedDefsExtractedFor = void 0;
	ctx.sharedEmitDoneFor = void 0;
	const overrideSchema = schema._zod.toJSONSchema?.();
	if (overrideSchema) result.schema = overrideSchema;
	else {
		const params = {
			..._params,
			schemaPath: [..._params.schemaPath, schema],
			path: _params.path
		};
		if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
		else {
			const _json = result.schema;
			const processor = ctx.processors[def.type];
			if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
			processor(schema, ctx, _json, params);
		}
		const parent = schema._zod.parent;
		if (parent) {
			if (!result.ref) result.ref = parent;
			processSchema(parent, ctx, params);
			ctx.seen.get(parent).isParent = true;
		}
	}
	const meta = ctx.metadataRegistry.get(schema);
	if (meta) assignProps(result.schema, meta);
	if (ctx.io === "input" && isTransforming(schema)) {
		delete result.schema.examples;
		delete result.schema.default;
	}
	if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
	delete result.schema._prefault;
	return ctx.seen.get(schema).schema;
}
function encodeJSONPointerSegment(segment) {
	return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}
function extractDefs(ctx, schema) {
	const root = ctx.seen.get(schema);
	if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
	if (ctx.external && ctx.sharedDefsExtractedFor === ctx.external) return;
	const idToSchema = /* @__PURE__ */ new Map();
	for (const entry of ctx.seen.entries()) {
		const id = ctx.metadataRegistry.get(entry[0])?.id;
		if (id) {
			const existing = idToSchema.get(id);
			if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
			idToSchema.set(id, entry[0]);
		}
	}
	const makeURI = (entry) => {
		const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
		if (ctx.external) {
			const externalId = ctx.external.registry.get(entry[0])?.id;
			const uriGenerator = ctx.external.uri ?? ((id) => id);
			if (externalId) return { ref: uriGenerator(externalId) };
			const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
			entry[1].defId = id;
			return {
				defId: id,
				ref: `${uriGenerator("__shared")}#/${defsSegment}/${encodeJSONPointerSegment(id)}`
			};
		}
		const uriPrefix = `#`;
		const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
		if (entry[1] === root && !entry[1].schema.id) return { ref: uriPrefix };
		const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
		return {
			defId,
			ref: defUriPrefix + encodeJSONPointerSegment(defId)
		};
	};
	const extractToDef = (entry) => {
		if (entry[1].schema.$ref) return;
		const seen = entry[1];
		const { ref, defId } = makeURI(entry);
		seen.def = { ...seen.schema };
		if (defId) seen.defId = defId;
		const schema = seen.schema;
		for (const key in schema) delete schema[key];
		schema.$ref = ref;
	};
	if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
	}
	for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (schema === entry[0]) {
			extractToDef(entry);
			continue;
		}
		if (ctx.external) {
			const ext = ctx.external.registry.get(entry[0])?.id;
			if (schema !== entry[0] && ext) {
				extractToDef(entry);
				continue;
			}
		}
		if (ctx.metadataRegistry.get(entry[0])?.id) {
			extractToDef(entry);
			continue;
		}
		if (seen.cycle) {
			extractToDef(entry);
			continue;
		}
		if (seen.count > 1) {
			if (ctx.reused === "ref") extractToDef(entry);
		}
	}
	if (ctx.external) ctx.sharedDefsExtractedFor = ctx.external;
}
/** Rewrites `anyOf: [{type: "a"}, {type: "b"}]` to `type: ["a", "b"]`, which every JSON Schema draft treats as equivalent and most consumers render far better for the nullable case. Only branches that are a bare type assertion qualify — anything carrying a constraint, `$ref`, `const` or metadata is left alone. Runs after `flattenRef`, so a branch an override decorated or `$defs` extraction turned into a `$ref` is no longer bare and correctly stays in `anyOf`. `oneOf` is excluded: `integer` and `number` overlap, so "exactly one" and "at least one" are not the same there. OpenAPI 3.0 is excluded: its `type` must be a single string. */
function compactTypeUnion(schema) {
	const options = schema.anyOf;
	if (!Array.isArray(options) || options.length === 0 || schema.type !== void 0) return;
	const types = [];
	for (const option of options) {
		if (!option || typeof option !== "object") return;
		compactTypeUnion(option);
		const keys = Object.keys(option);
		if (keys.length !== 1 || keys[0] !== "type") return;
		const type = option.type;
		for (const member of Array.isArray(type) ? type : [type]) {
			if (typeof member !== "string") return;
			if (!types.includes(member)) types.push(member);
		}
	}
	delete schema.anyOf;
	schema.type = types.length === 1 ? types[0] : types;
}
/** Keywords `foldIntersection` knows how to combine. Anything else — `$ref`, `patternProperties`,
* an annotation like `description` — makes a member unfoldable, so a constraint this does not
* understand leaves the `allOf` alone instead of being silently dropped or misattributed. */
const FOLDABLE_KEYS = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]);
const UNION_KEYS = ["oneOf", "anyOf"];
/** A member's constraint on a key it does not declare itself. A `catchall` states one; `false`, an absent `additionalProperties`, and the empty schema a loose object emits state nothing. */
function undeclaredConstraint(member) {
	const extra = member.additionalProperties;
	if (extra === void 0 || extra === false || typeof extra !== "object" || extra === null) return null;
	return Object.keys(extra).length ? extra : null;
}
/** Combines object members into the single object they describe together, or returns `null` if any of them carries a keyword outside {@link FOLDABLE_KEYS}. */
function foldObjects(members) {
	const objects = [];
	for (const member of members) {
		if (typeof member !== "object" || member.type !== "object") return null;
		for (const key in member) if (!FOLDABLE_KEYS.has(key)) return null;
		objects.push(member);
	}
	const properties = {};
	const required = /* @__PURE__ */ new Set();
	for (const object of objects) {
		for (const key in object.properties) {
			if (Object.prototype.hasOwnProperty.call(properties, key)) continue;
			const parts = [];
			for (const other of objects) {
				const part = other.properties?.[key] ?? undeclaredConstraint(other);
				if (part === null || part === void 0) continue;
				if (!parts.some((seen) => JSON.stringify(seen) === JSON.stringify(part))) parts.push(part);
			}
			assignProp(properties, key, parts.length === 1 ? parts[0] : foldObjects(parts) ?? { allOf: parts });
		}
		for (const key of object.required ?? []) required.add(key);
	}
	const folded = {
		type: "object",
		properties
	};
	if (required.size) folded.required = [...required];
	if (objects.every((object) => object.additionalProperties === false)) folded.additionalProperties = false;
	else {
		const constraints = [];
		for (const object of objects) {
			const constraint = undeclaredConstraint(object);
			if (constraint && !constraints.some((seen) => JSON.stringify(seen) === JSON.stringify(constraint))) constraints.push(constraint);
		}
		if (constraints.length === 1) folded.additionalProperties = constraints[0];
		else if (constraints.length > 1) folded.additionalProperties = { allOf: constraints };
	}
	return folded;
}
/** `additionalProperties` in an `allOf` member sees only that member's own `properties`, so two
* closed object members reject each other's keys and the schema validates nothing. Zod's parser
* pools the key sets instead — `handleIntersectionResults` reports a key as unrecognized only when
* *every* side rejects it — so the emitted schema has to pool them too, and folding the members
* into one object is the encoding that says so on every target.
*
* This runs from `finalize`, after `extractDefs`, which is what keeps it clear of the `$ref`
* machinery: a member extracted into `$defs` is already a `$ref` by now and declines to fold, so it
* keeps its reference and its own closedness rather than being inlined as a stale copy. */
function foldIntersection(json) {
	const allOf = json.allOf;
	if (!Array.isArray(allOf) || allOf.length < 2) return;
	for (const key of FOLDABLE_KEYS) if (key in json) return;
	const unions = allOf.filter((m) => UNION_KEYS.some((k) => Array.isArray(m[k])));
	let folded = null;
	if (!unions.length) folded = foldObjects(allOf);
	else {
		const union = unions[0];
		const keyword = UNION_KEYS.find((k) => Array.isArray(union[k]));
		if (Object.keys(union).length !== 1) return;
		const rest = allOf.filter((m) => m !== union);
		const branches = union[keyword].map((branch) => foldObjects([...rest, branch]));
		if (branches.some((b) => !b)) return;
		folded = { [keyword]: branches };
	}
	if (!folded) return;
	delete json.allOf;
	assignProps(json, folded);
}
function finalize(ctx, schema) {
	const root = ctx.seen.get(schema);
	if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
	const flattenRef = (zodSchema) => {
		const seen = ctx.seen.get(zodSchema);
		if (seen.ref === null) return;
		const schema = seen.def ?? seen.schema;
		const _cached = { ...schema };
		const ref = seen.ref;
		seen.ref = null;
		if (ref) {
			flattenRef(ref);
			const refSeen = ctx.seen.get(ref);
			const refSchema = refSeen.schema;
			if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
				schema.allOf = schema.allOf ?? [];
				schema.allOf.push(refSchema);
			} else assignProps(schema, refSchema);
			assignProps(schema, _cached);
			if (zodSchema._zod.parent === ref) for (const key in schema) {
				if (key === "$ref" || key === "allOf") continue;
				if (!(key in _cached)) delete schema[key];
			}
			if (refSchema.$ref && refSeen.def) for (const key in schema) {
				if (key === "$ref" || key === "allOf") continue;
				if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
			}
		}
		const parent = zodSchema._zod.parent;
		if (parent && parent !== ref) {
			flattenRef(parent);
			const parentSeen = ctx.seen.get(parent);
			if (parentSeen?.schema.$ref) {
				schema.$ref = parentSeen.schema.$ref;
				if (parentSeen.def) for (const key in schema) {
					if (key === "$ref" || key === "allOf") continue;
					if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
				}
			}
		}
		ctx.override({
			zodSchema,
			jsonSchema: schema,
			path: seen.path ?? []
		});
	};
	if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) {
		for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
		if (ctx.target !== "openapi-3.0") for (const entry of ctx.seen.entries()) compactTypeUnion(entry[1].def ?? entry[1].schema);
		for (const rewrite of ctx.deferred) rewrite();
		if (ctx.intersections.length) {
			const carriers = /* @__PURE__ */ new Map();
			for (const seen of ctx.seen.values()) for (const json of [seen.schema, seen.def]) {
				const allOf = json?.allOf;
				if (!Array.isArray(allOf)) continue;
				const existing = carriers.get(allOf);
				if (existing) existing.push(json);
				else carriers.set(allOf, [json]);
			}
			for (const allOf of ctx.intersections) for (const json of carriers.get(allOf) ?? []) foldIntersection(json);
		}
	}
	const result = {};
	if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
	else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
	else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
	else if (ctx.target === "openapi-3.0") {}
	if (ctx.external?.uri) {
		const id = ctx.external.registry.get(schema)?.id;
		if (!id) throw new Error("Schema is missing an `id` property");
		result.$id = ctx.external.uri(id);
	}
	assignProps(result, root.defId ? root.schema : root.def ?? root.schema);
	const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
	if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
	const defs = ctx.external?.defs ?? {};
	if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (seen.def && seen.defId) {
			if (seen.def.id === seen.defId) delete seen.def.id;
			assignProp(defs, seen.defId, seen.def);
		}
	}
	if (ctx.external) ctx.sharedEmitDoneFor = ctx.external;
	if (ctx.external) {} else if (Object.keys(defs).length > 0) {
		if (ctx.target === "draft-2020-12") result.$defs = defs;
		else result.definitions = defs;
	}
	try {
		const finalized = JSON.parse(JSON.stringify(result));
		Object.defineProperty(finalized, "~standard", {
			value: {
				...schema["~standard"],
				jsonSchema: {
					input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
					output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
				}
			},
			enumerable: false,
			writable: false
		});
		return finalized;
	} catch (_err) {
		throw new Error("Error converting schema to JSON.");
	}
}
function isTransforming(_schema, _ctx) {
	const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
	if (ctx.seen.has(_schema)) return false;
	ctx.seen.add(_schema);
	const def = _schema._zod.def;
	if (def.type === "transform") return true;
	if (def.type === "array") return isTransforming(def.element, ctx);
	if (def.type === "set") return isTransforming(def.valueType, ctx);
	if (def.type === "lazy") return isTransforming(def.getter(), ctx);
	if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault" || def.type === "catch") return isTransforming(def.innerType, ctx);
	if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
	if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
	if (def.type === "pipe") {
		if (_schema._zod.traits.has("$ZodCodec")) return true;
		return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
	}
	if (def.type === "object") {
		for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
		return false;
	}
	if (def.type === "union") {
		for (const option of def.options) if (isTransforming(option, ctx)) return true;
		return false;
	}
	if (def.type === "tuple") {
		for (const item of def.items) if (isTransforming(item, ctx)) return true;
		if (def.rest && isTransforming(def.rest, ctx)) return true;
		return false;
	}
	return false;
}
/**
* Creates a toJSONSchema method for a schema instance.
* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
*/
const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
	const ctx = initializeContext({
		...params,
		processors
	});
	processSchema(schema, ctx);
	extractDefs(ctx, schema);
	return finalize(ctx, schema);
};
const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
	const { libraryOptions, target } = params ?? {};
	const ctx = initializeContext({
		...libraryOptions ?? {},
		target,
		io,
		processors
	});
	processSchema(schema, ctx);
	extractDefs(ctx, schema);
	return finalize(ctx, schema);
};
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/core/json-schema-processors.js
const narrowMin = (agg, key, value) => {
	if (agg[key] === void 0 || value > agg[key]) agg[key] = value;
};
const narrowMax = (agg, key, value) => {
	if (agg[key] === void 0 || value < agg[key]) agg[key] = value;
};
const narrowBoth = (agg, value) => {
	narrowMin(agg, "minimum", value);
	narrowMax(agg, "maximum", value);
};
const addDivisor = (agg, value) => {
	agg.multipleOf ?? (agg.multipleOf = []);
	if (!agg.multipleOf.includes(value)) agg.multipleOf.push(value);
};
const addPattern = (agg, pattern) => {
	agg.patterns ?? (agg.patterns = /* @__PURE__ */ new Set());
	agg.patterns.add(pattern);
};
const intersectMime = (agg, mime) => {
	agg.mime = agg.mime ? agg.mime.filter((m) => mime.includes(m)) : [...mime];
};
const setFormat = (agg, format) => {
	agg.format = format;
	if (format.includes("int")) agg.isInt = true;
};
const minContributor = (agg, def) => narrowMin(agg, "minimum", def.minimum);
const maxContributor = (agg, def) => narrowMax(agg, "maximum", def.maximum);
const formatContributor = (ranges) => (agg, def) => {
	setFormat(agg, def.format);
	const [minimum, maximum] = ranges[def.format];
	narrowMin(agg, "minimum", minimum);
	narrowMax(agg, "maximum", maximum);
};
const contributors = {
	greater_than: (agg, def) => narrowMin(agg, def.inclusive ? "minimum" : "exclusiveMinimum", def.value),
	less_than: (agg, def) => narrowMax(agg, def.inclusive ? "maximum" : "exclusiveMaximum", def.value),
	multiple_of: (agg, def) => addDivisor(agg, def.value),
	number_format: formatContributor(NUMBER_FORMAT_RANGES),
	bigint_format: formatContributor(BIGINT_FORMAT_RANGES),
	min_length: minContributor,
	max_length: maxContributor,
	length_equals: (agg, def) => narrowBoth(agg, def.length),
	min_size: minContributor,
	max_size: maxContributor,
	size_equals: (agg, def) => narrowBoth(agg, def.size),
	string_format: (agg, def) => {
		setFormat(agg, def.format);
		if (def.pattern) addPattern(agg, def.pattern);
		if (def.format === "base64" || def.format === "base64url") agg.contentEncoding = def.format;
		if (def.local || def.precision === -1) agg.laxFormat = true;
	},
	mime_type: (agg, def) => intersectMime(agg, def.mime)
};
function aggregateChecks(schema) {
	const agg = {};
	const def = schema._zod.def;
	const list = schema._zod.traits.has("$ZodCheck") ? [schema, ...def.checks ?? []] : def.checks ?? [];
	for (const ch of list) contributors[ch._zod.def.check]?.(agg, ch._zod.def);
	const bag = schema._zod.bag;
	if (bag.minimum !== void 0) narrowMin(agg, "minimum", bag.minimum);
	if (bag.exclusiveMinimum !== void 0) narrowMin(agg, "exclusiveMinimum", bag.exclusiveMinimum);
	if (bag.maximum !== void 0) narrowMax(agg, "maximum", bag.maximum);
	if (bag.exclusiveMaximum !== void 0) narrowMax(agg, "exclusiveMaximum", bag.exclusiveMaximum);
	if (bag.multipleOf !== void 0) addDivisor(agg, bag.multipleOf);
	if (bag.format !== void 0) {
		agg.format ?? (agg.format = bag.format);
		if (bag.format.includes("int")) agg.isInt = true;
	}
	if (bag.mime) intersectMime(agg, bag.mime);
	for (const pattern of bag.patterns ?? []) addPattern(agg, pattern);
	return agg;
}
const formatMap = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
};
const exactPatterns = /* @__PURE__ */ new Map([[base64Charset, base64], [base64urlCharset, base64url]]);
const exactPattern = (p) => exactPatterns.get(p) ?? p;
const stringProcessor = (schema, ctx, _json, _params) => {
	const json = _json;
	json.type = "string";
	const { minimum, maximum, format, patterns, contentEncoding, laxFormat } = aggregateChecks(schema);
	if (typeof minimum === "number") json.minLength = minimum;
	if (typeof maximum === "number") json.maxLength = maximum;
	if (format) {
		json.format = formatMap[format] ?? format;
		if (json.format === "") delete json.format;
		if (format === "time" || laxFormat) delete json.format;
	}
	if (contentEncoding) json.contentEncoding = contentEncoding;
	if (patterns && patterns.size > 0) {
		const patternList = [...patterns].map(exactPattern);
		if (patternList.length === 1) json.pattern = patternList[0].source;
		else if (patternList.length > 1) json.allOf = [...patternList.map((regex) => ({
			...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: regex.source
		}))];
	}
};
const numberProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const { minimum, maximum, multipleOf, exclusiveMaximum, exclusiveMinimum, isInt } = aggregateChecks(schema);
	json.type = isInt ? "integer" : "number";
	const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
	const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
	const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
	if (exMin) {
		if (legacy) {
			json.minimum = exclusiveMinimum;
			json.exclusiveMinimum = true;
		} else json.exclusiveMinimum = exclusiveMinimum;
	} else if (typeof minimum === "number") json.minimum = minimum;
	if (exMax) {
		if (legacy) {
			json.maximum = exclusiveMaximum;
			json.exclusiveMaximum = true;
		} else json.exclusiveMaximum = exclusiveMaximum;
	} else if (typeof maximum === "number") json.maximum = maximum;
	if (multipleOf) {
		const divisors = /* @__PURE__ */ new Set();
		for (const divisor of multipleOf) if (Number.isFinite(divisor) && divisor !== 0) divisors.add(Math.abs(divisor));
		else handleUnrepresentable(schema, ctx, json, params, `A multipleOf divisor of ${divisor} cannot be represented in JSON Schema`);
		const [first, ...rest] = divisors;
		if (first !== void 0) json.multipleOf = first;
		if (rest.length) json.allOf = [...json.allOf ?? [], ...rest.map((m) => ({ multipleOf: m }))];
	}
};
const neverProcessor = (_schema, _ctx, json, _params) => {
	json.not = {};
};
const enumProcessor = (schema, _ctx, json, _params) => {
	const def = schema._zod.def;
	const values = getEnumValues(def.entries);
	if (values.length === 0) {
		json.not = {};
		return;
	}
	if (values.every((v) => typeof v === "number")) json.type = "number";
	if (values.every((v) => typeof v === "string")) json.type = "string";
	json.enum = values;
};
const literalProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	if (def.values.length === 0) {
		json.not = {};
		return;
	}
	const vals = [];
	for (const val of def.values) if (val === void 0) {
		if (handleUnrepresentable(schema, ctx, json, params, "Literal `undefined` cannot be represented in JSON Schema")) return;
	} else if (typeof val === "bigint") {
		if (handleUnrepresentable(schema, ctx, json, params, "BigInt literals cannot be represented in JSON Schema")) return;
		vals.push(Number(val));
	} else vals.push(val);
	if (vals.length === 0) {} else if (vals.length === 1) {
		const val = vals[0];
		json.type = val === null ? "null" : typeof val;
		if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") json.enum = [val];
		else json.const = val;
	} else {
		if (vals.every((v) => typeof v === "number")) json.type = "number";
		if (vals.every((v) => typeof v === "string")) json.type = "string";
		if (vals.every((v) => typeof v === "boolean")) json.type = "boolean";
		if (vals.every((v) => v === null)) json.type = "null";
		json.enum = vals;
	}
};
const customProcessor = (schema, ctx, json, params) => {
	handleUnrepresentable(schema, ctx, json, params, "Custom types cannot be represented in JSON Schema");
};
const transformProcessor = (schema, ctx, json, params) => {
	handleUnrepresentable(schema, ctx, json, params, "Transforms cannot be represented in JSON Schema");
};
const arrayProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const def = schema._zod.def;
	const { minimum, maximum } = aggregateChecks(schema);
	if (typeof minimum === "number") json.minItems = minimum;
	if (typeof maximum === "number") json.maxItems = maximum;
	json.type = "array";
	json.items = processSchema(def.element, ctx, {
		...params,
		path: [...params.path, "items"]
	});
};
function inputOptin(schema) {
	const def = schema._zod.def;
	if (def.type === "pipe" && def.in._zod.traits.has("$ZodTransform")) return inputOptin(def.out);
	if (def.type === "catch") return inputOptin(def.innerType);
	return schema._zod.optin;
}
const objectProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const def = schema._zod.def;
	const shape = def.shape;
	if (Object.getOwnPropertySymbols(shape).length && handleUnrepresentable(schema, ctx, json, params, "Symbol keys cannot be represented in JSON Schema")) return;
	json.type = "object";
	json.properties = {};
	for (const key in shape) assignProp(json.properties, key, processSchema(shape[key], ctx, {
		...params,
		path: [
			...params.path,
			"properties",
			key
		]
	}));
	const requiredKeys = [];
	for (const key of Object.keys(shape)) {
		const field = def.shape[key];
		if (ctx.io === "input" ? inputOptin(field) === void 0 : field._zod.optout === void 0) requiredKeys.push(key);
	}
	if (requiredKeys.length > 0) json.required = requiredKeys;
	if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
	else if (!def.catchall) {
		if (ctx.io === "output") json.additionalProperties = false;
	} else if (def.catchall) json.additionalProperties = processSchema(def.catchall, ctx, {
		...params,
		path: [...params.path, "additionalProperties"]
	});
};
const unionProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const isExclusive = def.inclusive === false;
	const options = def.options.map((x, i) => processSchema(x, ctx, {
		...params,
		path: [
			...params.path,
			isExclusive ? "oneOf" : "anyOf",
			i
		]
	}));
	if (isExclusive) json.oneOf = options;
	else json.anyOf = options;
};
const intersectionProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const a = processSchema(def.left, ctx, {
		...params,
		path: [
			...params.path,
			"allOf",
			0
		]
	});
	const b = processSchema(def.right, ctx, {
		...params,
		path: [
			...params.path,
			"allOf",
			1
		]
	});
	const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
	const allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
	json.allOf = allOf;
	ctx.intersections.push(allOf);
};
const nullableProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const inner = processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	if (ctx.target === "openapi-3.0") {
		seen.ref = def.innerType;
		json.nullable = true;
	} else json.anyOf = [inner, { type: "null" }];
};
const nonoptionalProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
};
/** Round-trips a default value through JSON so the emitted schema is guaranteed to be valid JSON.
* A BigInt has no reliable encoding, so it goes through `unrepresentable` like any other
* unrepresentable value. Returns a sentinel when the caller must not write a default of its own. */
const UNREPRESENTABLE_DEFAULT = Symbol();
function serializeDefaultValue(value, schema, ctx, json, params) {
	let unrepresentable = false;
	const serialized = JSON.stringify(value, (_, val) => {
		if (typeof val !== "bigint") return val;
		unrepresentable = true;
		return null;
	});
	if (!unrepresentable) return JSON.parse(serialized);
	handleUnrepresentable(schema, ctx, json, params, "BigInt defaults cannot be represented in JSON Schema");
	return UNREPRESENTABLE_DEFAULT;
}
const defaultProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
	if (value !== UNREPRESENTABLE_DEFAULT) json.default = value;
};
const prefaultProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	if (ctx.io !== "input") return;
	const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
	if (value !== UNREPRESENTABLE_DEFAULT) json._prefault = value;
};
const catchProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	let catchValue;
	try {
		catchValue = def.catchValue(void 0);
	} catch {
		handleUnrepresentable(schema, ctx, json, params, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	json.default = catchValue;
};
const pipeProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	const inIsTransform = def.in._zod.traits.has("$ZodTransform");
	const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
	processSchema(innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = innerType;
};
const readonlyProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	json.readOnly = true;
};
const optionalProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
};
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/classic/errors.js
const _installedErrorProtos = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function _lazyMethod(proto, key, make) {
	Object.defineProperty(proto, key, {
		configurable: true,
		enumerable: false,
		get() {
			const value = make(this);
			Object.defineProperty(this, key, {
				value,
				configurable: true,
				writable: true
			});
			return value;
		},
		set(value) {
			Object.defineProperty(this, key, {
				value,
				configurable: true,
				writable: true
			});
		}
	});
}
const initializer = (inst, issues) => {
	$ZodError.init(inst, issues);
	inst.name = "ZodError";
	const proto = Object.getPrototypeOf(inst);
	if (_installedErrorProtos.has(proto)) return;
	_installedErrorProtos.add(proto);
	_lazyMethod(proto, "format", (self) => (mapper) => formatError(self, mapper));
	_lazyMethod(proto, "flatten", (self) => (mapper) => flattenError(self, mapper));
	_lazyMethod(proto, "addIssue", (self) => (issue) => {
		self.issues.push(issue);
		self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
	});
	_lazyMethod(proto, "addIssues", (self) => (issues) => {
		self.issues.push(...issues);
		self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
	});
	Object.defineProperty(proto, "isEmpty", {
		configurable: true,
		enumerable: false,
		get() {
			return this.issues.length === 0;
		}
	});
};
const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, void 0, { Parent: Error });
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/classic/parse.js
const parse = /* @__PURE__ */ _parse(ZodRealError);
const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
const encode = /* @__PURE__ */ _encode(ZodRealError);
const decode = /* @__PURE__ */ _decode(ZodRealError);
const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
//#endregion
//#region ../../node_modules/.pnpm/zod@4.6.5_patch_hash=5a57d5a4f788c6fe9e15d60e59511c1f901b7fc1d638126eb2b02cafc9e79a86/node_modules/zod/v4/classic/schemas.js
function _ensureDefaultLocale() {
	if (!globalConfig.localeError) config(en_default());
}
function _ensureDefaultMemoizer() {
	if (!globalConfig.memoizer) config({ memoizer: memoizer() });
}
const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
	_ensureDefaultLocale();
	$ZodType.init(inst, def);
	inst.def = def;
	inst.type = def.type;
	return inst;
}, {
	check(...chks) {
		const def = this.def;
		return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
			check: ch,
			def: { check: "custom" },
			onattach: []
		} } : ch)] }), { parent: true });
	},
	with(...chks) {
		return this.check(...chks);
	},
	clone(def, params) {
		return clone(this, def, params);
	},
	brand() {
		return this;
	},
	register(reg, meta) {
		reg.add(this, meta);
		return this;
	},
	refine(check, params) {
		return this.check(refine(check, params));
	},
	superRefine(refinement, params) {
		return this.check(superRefine(refinement, params));
	},
	overwrite(fn) {
		return this.check(/* @__PURE__ */ _overwrite(fn));
	},
	optional() {
		return optional(this);
	},
	exactOptional() {
		return exactOptional(this);
	},
	nullable() {
		return nullable(this);
	},
	nullish() {
		return optional(nullable(this));
	},
	nonoptional(params) {
		return nonoptional(this, params);
	},
	array() {
		return array(this);
	},
	or(arg) {
		return union([this, arg]);
	},
	and(arg) {
		return intersection(this, arg);
	},
	transform(tx) {
		return pipe(this, transform(tx));
	},
	default(d) {
		return _default(this, d);
	},
	prefault(d) {
		return prefault(this, d);
	},
	catch(params) {
		return _catch(this, params);
	},
	pipe(target) {
		return pipe(this, target);
	},
	readonly() {
		return readonly(this);
	},
	describe(description) {
		const cl = this.clone();
		globalRegistry.add(cl, { description });
		return cl;
	},
	meta(...args) {
		if (args.length === 0) return globalRegistry.get(this);
		const cl = this.clone();
		globalRegistry.add(cl, args[0]);
		return cl;
	},
	isOptional() {
		return this.safeParse(void 0).success;
	},
	isNullable() {
		return this.safeParse(null).success;
	},
	apply(fn, ...args) {
		return args.length === 0 ? fn(this) : fn(this, ...args);
	},
	get "~standard"() {
		return hide(this, "~standard", {
			...standardProps(this),
			jsonSchema: {
				input: createStandardJSONSchemaMethod(this, "input"),
				output: createStandardJSONSchemaMethod(this, "output")
			}
		});
	},
	set "~standard"(value) {
		own(this, "~standard", value);
	},
	parse: function _parse(data, params) {
		return parse(this, data, params, { callee: _parse });
	},
	parseAsync: async function _parseAsync(data, params) {
		return await parseAsync(this, data, params, { callee: _parseAsync });
	},
	safeParse(data, params) {
		return safeParse(this, data, params);
	},
	async safeParseAsync(data, params) {
		return safeParseAsync(this, data, params);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(value) {
		own(this, "spa", value);
	},
	validate(data, params) {
		return validate(this, data, params);
	},
	validateAsync(data, params) {
		return validateAsync$1(this, data, params);
	},
	encode: function _encode(data, params) {
		return encode(this, data, params, { callee: _encode });
	},
	decode: function _decode(data, params) {
		return decode(this, data, params, { callee: _decode });
	},
	encodeAsync: async function _encodeAsync(data, params) {
		return await encodeAsync(this, data, params, { callee: _encodeAsync });
	},
	decodeAsync: async function _decodeAsync(data, params) {
		return await decodeAsync(this, data, params, { callee: _decodeAsync });
	},
	safeEncode(data, params) {
		return safeEncode(this, data, params);
	},
	safeDecode(data, params) {
		return safeDecode(this, data, params);
	},
	async safeEncodeAsync(data, params) {
		return safeEncodeAsync(this, data, params);
	},
	async safeDecodeAsync(data, params) {
		return safeDecodeAsync(this, data, params);
	},
	toJSONSchema(params) {
		return createToJSONSchemaMethod(this, {})(params);
	},
	get description() {
		return globalRegistry.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
});
/** @internal */
const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
}, /*@__PURE__*/ derived({
	format: (inst) => aggregateChecks(inst).format ?? null,
	minLength: (inst) => aggregateChecks(inst).minimum ?? null,
	maxLength: (inst) => aggregateChecks(inst).maximum ?? null
}, {
	regex(...args) {
		return this.check(/* @__PURE__ */ _regex(...args));
	},
	includes(...args) {
		return this.check(/* @__PURE__ */ _includes(...args));
	},
	startsWith(...args) {
		return this.check(/* @__PURE__ */ _startsWith(...args));
	},
	endsWith(...args) {
		return this.check(/* @__PURE__ */ _endsWith(...args));
	},
	min(...args) {
		return this.check(/* @__PURE__ */ _minLength(...args));
	},
	max(...args) {
		return this.check(/* @__PURE__ */ _maxLength(...args));
	},
	length(...args) {
		return this.check(/* @__PURE__ */ _length(...args));
	},
	nonempty(...args) {
		return this.check(/* @__PURE__ */ _minLength(1, ...args));
	},
	lowercase(params) {
		return this.check(/* @__PURE__ */ _lowercase(params));
	},
	uppercase(params) {
		return this.check(/* @__PURE__ */ _uppercase(params));
	},
	trim() {
		return this.check(/* @__PURE__ */ _trim());
	},
	normalize(...args) {
		return this.check(/* @__PURE__ */ _normalize(...args));
	},
	toLowerCase() {
		return this.check(/* @__PURE__ */ _toLowerCase());
	},
	toUpperCase() {
		return this.check(/* @__PURE__ */ _toUpperCase());
	},
	slugify() {
		return this.check(/* @__PURE__ */ _slugify());
	}
}));
const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	_ZodString.init(inst, def);
}, {
	email(params) {
		return this.check(/* @__PURE__ */ _email(ZodEmail, params));
	},
	url(params) {
		return this.check(/* @__PURE__ */ _url(ZodURL, params));
	},
	jwt(params) {
		return this.check(/* @__PURE__ */ _jwt(ZodJWT, params));
	},
	emoji(params) {
		return this.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
	},
	guid(params) {
		return this.check(/* @__PURE__ */ _guid(ZodGUID, params));
	},
	uuid(params) {
		return this.check(/* @__PURE__ */ _uuid(ZodUUID, params));
	},
	uuidv4(params) {
		return this.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
	},
	uuidv6(params) {
		return this.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
	},
	uuidv7(params) {
		return this.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
	},
	nanoid(params) {
		return this.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
	},
	cuid(params) {
		return this.check(/* @__PURE__ */ _cuid(ZodCUID, params));
	},
	cuid2(params) {
		return this.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
	},
	ulid(params) {
		return this.check(/* @__PURE__ */ _ulid(ZodULID, params));
	},
	base64(params) {
		return this.check(/* @__PURE__ */ _base64(ZodBase64, params));
	},
	base64url(params) {
		return this.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
	},
	xid(params) {
		return this.check(/* @__PURE__ */ _xid(ZodXID, params));
	},
	ksuid(params) {
		return this.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
	},
	ipv4(params) {
		return this.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
	},
	ipv6(params) {
		return this.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
	},
	cidrv4(params) {
		return this.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
	},
	cidrv6(params) {
		return this.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
	},
	e164(params) {
		return this.check(/* @__PURE__ */ _e164(ZodE164, params));
	},
	datetime(params) {
		return this.check(/* @__PURE__ */ _isoDateTime(ZodISODateTime, params));
	},
	date(params) {
		return this.check(/* @__PURE__ */ _isoDate(ZodISODate, params));
	},
	time(params) {
		return this.check(/* @__PURE__ */ _isoTime(ZodISOTime, params));
	},
	duration(params) {
		return this.check(/* @__PURE__ */ _isoDuration(ZodISODuration, params));
	}
});
function string(params) {
	return /* @__PURE__ */ _string(ZodString, params);
}
const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	_ZodString.init(inst, def);
});
const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
	$ZodISODateTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
	$ZodISODate.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
	$ZodISOTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
	$ZodISODuration.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
	$ZodEmail.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
	$ZodGUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
	$ZodUUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
	$ZodURL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
	$ZodEmoji.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
	$ZodNanoID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
* See https://github.com/paralleldrive/cuid.
*/
const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
	$ZodCUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
	$ZodCUID2.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
	$ZodULID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
	$ZodXID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
	$ZodKSUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
	$ZodIPv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
	$ZodIPv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
	$ZodCIDRv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
	$ZodCIDRv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
	$ZodBase64.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
	$ZodBase64URL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
	$ZodE164.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
	$ZodJWT.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
	$ZodNumber.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
	inst.isFinite = true;
}, /*@__PURE__*/ derived({
	minValue: (inst) => {
		const { minimum, exclusiveMinimum } = aggregateChecks(inst);
		return Math.max(minimum ?? Number.NEGATIVE_INFINITY, exclusiveMinimum ?? Number.NEGATIVE_INFINITY);
	},
	maxValue: (inst) => {
		const { maximum, exclusiveMaximum } = aggregateChecks(inst);
		return Math.min(maximum ?? Number.POSITIVE_INFINITY, exclusiveMaximum ?? Number.POSITIVE_INFINITY);
	},
	isInt: (inst) => {
		const { isInt, multipleOf } = aggregateChecks(inst);
		return !!isInt || !!multipleOf?.some(Number.isSafeInteger);
	},
	format: (inst) => aggregateChecks(inst).format ?? null
}, {
	gt(value, params) {
		return this.check(/* @__PURE__ */ _gt(value, params));
	},
	gte(value, params) {
		return this.check(/* @__PURE__ */ _gte(value, params));
	},
	min(value, params) {
		return this.check(/* @__PURE__ */ _gte(value, params));
	},
	lt(value, params) {
		return this.check(/* @__PURE__ */ _lt(value, params));
	},
	lte(value, params) {
		return this.check(/* @__PURE__ */ _lte(value, params));
	},
	max(value, params) {
		return this.check(/* @__PURE__ */ _lte(value, params));
	},
	int(params) {
		return this.check(int(params));
	},
	safe(params) {
		return this.check(int(params));
	},
	positive(params) {
		return this.check(/* @__PURE__ */ _gt(0, params));
	},
	nonnegative(params) {
		return this.check(/* @__PURE__ */ _gte(0, params));
	},
	negative(params) {
		return this.check(/* @__PURE__ */ _lt(0, params));
	},
	nonpositive(params) {
		return this.check(/* @__PURE__ */ _lte(0, params));
	},
	multipleOf(value, params) {
		return this.check(/* @__PURE__ */ _multipleOf(value, params));
	},
	step(value, params) {
		return this.check(/* @__PURE__ */ _multipleOf(value, params));
	},
	finite() {
		return this;
	}
}));
function number(params) {
	return /* @__PURE__ */ _number(ZodNumber, params);
}
const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
	$ZodNumberFormat.init(inst, def);
	ZodNumber.init(inst, def);
});
function int(params) {
	return /* @__PURE__ */ _int(ZodNumberFormat, params);
}
const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
	$ZodUnknown.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => void 0;
});
function unknown() {
	return /* @__PURE__ */ _unknown(ZodUnknown);
}
const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
	$ZodNever.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
});
function never(params) {
	return /* @__PURE__ */ _never(ZodNever, params);
}
const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
	_ensureDefaultMemoizer();
	$ZodArray.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
	inst.element = def.element;
}, {
	min(n, params) {
		return this.check(/* @__PURE__ */ _minLength(n, params));
	},
	nonempty(params) {
		return this.check(/* @__PURE__ */ _minLength(1, params));
	},
	max(n, params) {
		return this.check(/* @__PURE__ */ _maxLength(n, params));
	},
	length(n, params) {
		return this.check(/* @__PURE__ */ _length(n, params));
	},
	unwrap() {
		return this.element;
	}
});
function array(element, params) {
	return /* @__PURE__ */ _array(ZodArray, element, params);
}
const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
	_ensureDefaultMemoizer();
	$ZodObjectJIT.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
	installLazyProp(inst, "shape", (self) => self._zod.def.shape, false);
}, {
	keyof() {
		return _enum(Object.keys(this._zod.def.shape));
	},
	catchall(catchall) {
		return this.clone(mergeDefs(this._zod.def, { catchall }));
	},
	passthrough() {
		return this.clone(mergeDefs(this._zod.def, { catchall: unknown() }));
	},
	loose() {
		return this.clone(mergeDefs(this._zod.def, { catchall: unknown() }));
	},
	strict() {
		return this.clone(mergeDefs(this._zod.def, { catchall: never() }));
	},
	strip() {
		return this.clone(mergeDefs(this._zod.def, { catchall: void 0 }));
	},
	extend(incoming) {
		return extend(this, incoming);
	},
	safeExtend(incoming) {
		return safeExtend(this, incoming);
	},
	merge(other) {
		return merge(this, other);
	},
	pick(mask) {
		return pick(this, mask);
	},
	omit(mask) {
		return omit(this, mask);
	},
	partial(...args) {
		return partial(ZodOptional, this, args[0]);
	},
	exactPartial(...args) {
		return partial(ZodExactOptional, this, args[0], "exactPartial");
	},
	required(...args) {
		return required(ZodNonOptional, this, args[0]);
	}
});
function object(shape, params) {
	const def = {
		type: "object",
		shape: shape ?? {},
		...normalizeParams(params)
	};
	return new ZodObject(def);
}
const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
	$ZodUnion.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
	inst.options = def.options;
});
function union(options, params) {
	return new ZodUnion({
		type: "union",
		options,
		...normalizeParams(params)
	});
}
const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
	$ZodIntersection.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
	return new ZodIntersection({
		type: "intersection",
		left,
		right
	});
}
const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
	$ZodEnum.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
	inst.enum = def.entries;
	inst.options = [...inst._zod.values];
	const keys = new Set(Object.keys(def.entries));
	inst.extract = (values, params) => {
		const newEntries = {};
		for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
	inst.exclude = (values, params) => {
		const newEntries = { ...def.entries };
		for (const value of values) if (keys.has(value)) delete newEntries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
});
function _enum(values, params) {
	const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
	return new ZodEnum({
		type: "enum",
		entries,
		...normalizeParams(params)
	});
}
const ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
	$ZodLiteral.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
	inst.values = new Set(def.values);
	Object.defineProperty(inst, "value", { get() {
		if (def.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return def.values[0];
	} });
});
function literal(value, params) {
	return new ZodLiteral({
		type: "literal",
		values: Array.isArray(value) ? value : [value],
		...normalizeParams(params)
	});
}
const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
	_ensureDefaultMemoizer();
	$ZodTransform.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
	inst._zod.parse = (payload, _ctx) => {
		if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
		payload.addIssue = (issue$1) => {
			if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
			else {
				const _issue = issue$1;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				if (!("input" in _issue)) _issue.input = payload.value;
				_issue.inst ?? (_issue.inst = inst);
				payload.issues.push(issue(_issue));
			}
		};
		const output = def.transform(payload.value, payload);
		if (output instanceof Promise) return output.then((output) => {
			payload.value = output;
			return payload;
		});
		payload.value = output;
		return payload;
	};
});
function transform(fn) {
	return new ZodTransform({
		type: "transform",
		transform: fn
	});
}
const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
	return new ZodOptional({
		type: "optional",
		innerType
	});
}
const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
	$ZodExactOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
	return new ZodExactOptional({
		type: "optional",
		innerType
	});
}
const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
	$ZodNullable.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
	return new ZodNullable({
		type: "nullable",
		innerType
	});
}
const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
	$ZodDefault.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
	return new ZodDefault({
		type: "default",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
		}
	});
}
const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
	$ZodPrefault.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
	return new ZodPrefault({
		type: "prefault",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
		}
	});
}
const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
	$ZodNonOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
	return new ZodNonOptional({
		type: "nonoptional",
		innerType,
		...normalizeParams(params)
	});
}
const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
	$ZodCatch.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
	return new ZodCatch({
		type: "catch",
		innerType,
		catchValue: typeof catchValue === "function" ? catchValue : constantCatch(catchValue)
	});
}
const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
	$ZodPipe.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
	inst.in = def.in;
	inst.out = def.out;
});
function pipe(in_, out) {
	return new ZodPipe({
		type: "pipe",
		in: in_,
		out
	});
}
const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
	$ZodReadonly.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
	return new ZodReadonly({
		type: "readonly",
		innerType
	});
}
const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
	$ZodCustom.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
function refine(fn, _params = {}) {
	return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
}
function superRefine(fn, params) {
	return /* @__PURE__ */ _superRefine(fn, params);
}
object({
	/** How the log reads; omitted = the app's default (Pretty). */
	mode: _enum([
		"pretty",
		"pretty-raw",
		"raw"
	]).optional().catch(void 0),
	/** The text query over the type and the payload. */
	q: string().optional().catch(void 0),
	/** The event types left ticked; omitted = all. */
	types: array(string()).optional().catch(void 0),
	/** One actor's events only. */
	actor: string().optional().catch(void 0),
	/** The lowest offset shown, inclusive. */
	from: number().int().nonnegative().optional().catch(void 0),
	/** The highest offset shown, inclusive. */
	to: number().int().nonnegative().optional().catch(void 0),
	/** The inspected event's offset — the inspector is open. */
	event: number().int().nonnegative().optional().catch(void 0),
	/** The processors sheet is open. */
	processors: literal(true).optional().catch(void 0),
	/** The filter row is open. */
	filter: literal(true).optional().catch(void 0)
});
/** The filter the rows are narrowed by, from the state's filter keys. */
function contextViewFilterOf(state) {
	return {
		query: state.q || "",
		types: new Set(state.types || []),
		actor: state.actor,
		from: state.from,
		to: state.to
	};
}
/** The patch that drops every filter key (the filter row's "clear"). */
const FILTER_CLEARED = {
	q: void 0,
	types: void 0,
	actor: void 0,
	from: void 0,
	to: void 0
};
/** The keys that claim the view's right edge — an opener clears the others so one sheet shows. */
const RIGHT_EDGE_CLOSED = {
	event: void 0,
	processors: void 0
};
//#endregion
//#region src/components/context-view/renderer-helpers.tsx
const str = (value, fallback = "") => typeof value === "string" ? value : fallback;
/** A plain object (the payload's shape): the `toString` brand, so arrays and class instances are not. */
const isRecord = (value) => Object.prototype.toString.call(value) === "[object Object]";
/** A plain object, else an empty one. */
const record = (value) => isRecord(value) ? value : {};
/** A muted mono span for an id, a path or a name inside a sentence. */
const mono = (text) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
	className: "font-mono text-xs text-muted-foreground",
	children: text
});
//#endregion
//#region src/components/context-view/core-renderers.tsx
/** The platform's housekeeping reads quieter than what people and apps did. */
const quiet = (text) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
	className: "text-muted-foreground",
	children: text
});
/** The platform's HOUSEKEEPING — what the stream does to keep itself running (waking, wiring a
*  client's subscription, a live-state tick, a scheduled append), never what anyone did. Pretty mode
*  folds a run of these into one quiet row; the birth, a pause and a script run are not housekeeping. */
function isHousekeeping(type) {
	return type === "events.iterate.com/itx/woken" || type.startsWith("events.iterate.com/itx/subscription-") || type.startsWith("events.iterate.com/itx/schedule-") || type === "events.iterate.com/itx/live-state-changed";
}
/** One line for a folded run of housekeeping: `woke, subscription ×8, live state` — a kind once,
*  its count only when it repeats. */
function housekeepingSummary(types) {
	const counts = /* @__PURE__ */ new Map();
	for (const type of types) {
		const label = type === "events.iterate.com/itx/woken" ? "woke" : type.startsWith("events.iterate.com/itx/subscription-") ? "subscription" : type === "events.iterate.com/itx/live-state-changed" ? "live state" : "scheduled append";
		counts.set(label, (counts.get(label) || 0) + 1);
	}
	return [...counts.entries()].map(([label, n]) => n > 1 ? `${label} ×${String(n)}` : label).join(", ");
}
/** The inspector's rich bodies for the platform's events: a script run's code, its result. */
const coreEventInspectors = {
	"events.iterate.com/itx/run-requested": (e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
		className: "overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap break-words",
		children: str(record(e.payload).code)
	}),
	"events.iterate.com/itx/run-settled": (e) => {
		const s = record(record(e.payload).settlement);
		return s.status === "succeeded" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap break-words",
			children: JSON.stringify(s.result ?? null, null, 2)
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			"data-type": "error",
			className: "text-sm text-destructive",
			children: [
				str(s.failureKind),
				": ",
				str(s.error)
			]
		});
	}
};
const coreEventRenderers = {
	"events.iterate.com/itx/created": () => quiet("The context was born"),
	"events.iterate.com/itx/woken": (e) => {
		const p = record(e.payload);
		const began = e.source?.cause?.chain.match(/ with (.*) ~[a-z0-9]+$/)?.[1];
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-purple-700",
			children: [
				"Woke · ",
				str(p.cause, "?"),
				typeof p.call === "string" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" ", mono(p.call)] }) : "",
				Array.isArray(p.due) && p.due.length > 0 ? ` (${p.due.map(String).join(", ")})` : "",
				typeof p.caller === "string" ? ` (${p.caller})` : "",
				" · incarnation ",
				String(p.incarnation),
				began ? ` · began with ${began}` : ""
			]
		});
	},
	"events.iterate.com/itx/paused": (e) => quiet(`Paused ${str(record(e.payload).reason)}`),
	"events.iterate.com/itx/resumed": () => quiet("Resumed"),
	"events.iterate.com/itx/child-created": (e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "text-muted-foreground",
		children: [
			"Child context ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextPathText, { path: str(record(e.payload).childPath) }),
			" created"
		]
	}),
	"events.iterate.com/itx/subscription-configured": (e) => {
		const p = record(e.payload);
		const consumes = Array.isArray(p.consumes) ? p.consumes.map(String) : [];
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-muted-foreground",
			children: [
				"Subscription ",
				mono(str(p.name)),
				" configured",
				consumes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" · consumes ", mono(consumes.join(", "))] }) : null
			]
		});
	},
	"events.iterate.com/itx/live-state-changed": () => quiet("Live state changed"),
	"events.iterate.com/itx/run-requested": (e) => {
		const code = str(record(e.payload).code);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Ran a script ", mono((code.split("\n")[0] || "").slice(0, 100))] });
	},
	"events.iterate.com/itx/run-settled": (e) => {
		const p = record(e.payload);
		const s = record(p.settlement);
		return s.status === "succeeded" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			"Script ",
			mono(`#${String(p.requestOffset)}`),
			" returned",
			" ",
			mono(JSON.stringify(s.result ?? null).slice(0, 100))
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			"Script ",
			mono(`#${String(p.requestOffset)}`),
			" failed (",
			str(s.failureKind),
			"):",
			" ",
			str(s.error).slice(0, 140)
		] });
	}
};
//#endregion
//#region ../../node_modules/.pnpm/lucide-react@1.48.0_react@19.3.0/node_modules/lucide-react/dist/esm/icons/arrow-down.mjs
/**
* @license lucide-react v1.48.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const __iconData$8 = {
	name: "arrow-down",
	size: 24,
	node: [["path", {
		d: "M12 5v14",
		key: "s699le"
	}], ["path", {
		d: "m19 12-7 7-7-7",
		key: "1idqje"
	}]]
};
__iconData$8.node;
const ArrowDown = createLucideIcon(__iconData$8);
//#endregion
//#region ../../node_modules/.pnpm/lucide-react@1.48.0_react@19.3.0/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs
/**
* @license lucide-react v1.48.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const __iconData$7 = {
	name: "chevron-down",
	size: 24,
	node: [["path", {
		d: "m6 9 6 6 6-6",
		key: "qrunsl"
	}]]
};
__iconData$7.node;
const ChevronDown = createLucideIcon(__iconData$7);
//#endregion
//#region ../../node_modules/.pnpm/lucide-react@1.48.0_react@19.3.0/node_modules/lucide-react/dist/esm/icons/chevron-left.mjs
/**
* @license lucide-react v1.48.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const __iconData$6 = {
	name: "chevron-left",
	size: 24,
	node: [["path", {
		d: "m15 18-6-6 6-6",
		key: "1wnfg3"
	}]]
};
__iconData$6.node;
const ChevronLeft = createLucideIcon(__iconData$6);
//#endregion
//#region ../../node_modules/.pnpm/lucide-react@1.48.0_react@19.3.0/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs
/**
* @license lucide-react v1.48.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const __iconData$5 = {
	name: "chevron-right",
	size: 24,
	node: [["path", {
		d: "m9 18 6-6-6-6",
		key: "mthhwq"
	}]]
};
__iconData$5.node;
const ChevronRight = createLucideIcon(__iconData$5);
//#endregion
//#region ../../node_modules/.pnpm/lucide-react@1.48.0_react@19.3.0/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs
/**
* @license lucide-react v1.48.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const __iconData$4 = {
	name: "loader-circle",
	size: 24,
	node: [["path", {
		d: "M21 12a9 9 0 1 1-6.219-8.56",
		key: "13zald"
	}]],
	aliases: ["loader-2"]
};
__iconData$4.node;
const LoaderCircle = createLucideIcon(__iconData$4);
//#endregion
//#region ../../node_modules/.pnpm/lucide-react@1.48.0_react@19.3.0/node_modules/lucide-react/dist/esm/icons/plus.mjs
/**
* @license lucide-react v1.48.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const __iconData$3 = {
	name: "plus",
	size: 24,
	node: [["path", {
		d: "M5 12h14",
		key: "1ays0h"
	}], ["path", {
		d: "M12 5v14",
		key: "s699le"
	}]]
};
__iconData$3.node;
const Plus = createLucideIcon(__iconData$3);
//#endregion
//#region ../../node_modules/.pnpm/lucide-react@1.48.0_react@19.3.0/node_modules/lucide-react/dist/esm/icons/search.mjs
/**
* @license lucide-react v1.48.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const __iconData$2 = {
	name: "search",
	size: 24,
	node: [["path", {
		d: "m21 21-4.34-4.34",
		key: "14j7rj"
	}], ["circle", {
		cx: "11",
		cy: "11",
		r: "8",
		key: "4ej97u"
	}]]
};
__iconData$2.node;
const Search = createLucideIcon(__iconData$2);
//#endregion
//#region ../../node_modules/.pnpm/lucide-react@1.48.0_react@19.3.0/node_modules/lucide-react/dist/esm/icons/sparkles.mjs
/**
* @license lucide-react v1.48.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const __iconData$1 = {
	name: "sparkles",
	size: 24,
	node: [
		["path", {
			d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
			key: "1s2grr"
		}],
		["path", {
			d: "M20 2v4",
			key: "1rf3ol"
		}],
		["path", {
			d: "M22 4h-4",
			key: "gwowj6"
		}],
		["circle", {
			cx: "4",
			cy: "20",
			r: "2",
			key: "6kqj1y"
		}]
	],
	aliases: ["stars"]
};
__iconData$1.node;
const Sparkles = createLucideIcon(__iconData$1);
//#endregion
//#region ../../node_modules/.pnpm/lucide-react@1.48.0_react@19.3.0/node_modules/lucide-react/dist/esm/icons/x.mjs
/**
* @license lucide-react v1.48.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const __iconData = {
	name: "x",
	size: 24,
	node: [["path", {
		d: "M18 6 6 18",
		key: "1bl5f8"
	}], ["path", {
		d: "m6 6 12 12",
		key: "d8bk6v"
	}]]
};
__iconData.node;
const X = createLucideIcon(__iconData);
//#endregion
//#region src/components/context-view/folds.tsx
/** The LOCAL calendar day an event fell on — the day the reader's clock says, the same day the
*  separator labels (feed-rows.tsx); grouping by the UTC date would open a second "Today" for an
*  evening anywhere east or west of Greenwich. Remembered per event object: a fold asks it of every
*  event it passes, and a Date per event per fold is most of a 100,000-event fold's time. */
function dayOf(event) {
	let day = daysSeen.get(event);
	if (!day) {
		day = new Date(event.createdAt).toDateString();
		daysSeen.set(event, day);
	}
	return day;
}
const daysSeen = /* @__PURE__ */ new WeakMap();
const factByPayload = (event) => JSON.stringify([event.type, event.payload ?? null]);
/** The words of a rendered sentence — strings and numbers, elements' children walked — so two
*  renderings compare as text. Sentences are small trees of spans and strongs; nothing else is expected. */
function sentenceText(node) {
	if (node === null || node === void 0 || typeof node === "boolean") return "";
	if (typeof node === "string" || typeof node === "number") return String(node);
	if (Array.isArray(node)) return node.map(sentenceText).join("");
	if ((0, import_react.isValidElement)(node)) return sentenceText(node.props.children);
	return "";
}
/** Fold `events` into items. `markedDay` is the day already marked above them (a re-fold of the
*  tail continues the day its first event fell on, so it opens no second separator for it). */
function foldEvents(events, mode, factOf = factByPayload, markedDay = "") {
	const items = [];
	let lastDay = markedDay;
	let i = 0;
	while (i < events.length) {
		const event = events[i];
		const day = dayOf(event);
		if (day !== lastDay) {
			items.push({
				kind: "day",
				key: `day:${day}`,
				date: new Date(event.createdAt)
			});
			lastDay = day;
		}
		if (mode === "pretty") {
			if (isHousekeeping(event.type)) {
				let end = i + 1;
				while (end < events.length && isHousekeeping(events[end].type) && dayOf(events[end]) === day) end += 1;
				const run = events.slice(i, end);
				items.push(run.length === 1 ? {
					kind: "event",
					key: `event:${String(event.offset)}`,
					event
				} : {
					kind: "housekeeping",
					key: `housekeeping:${String(event.offset)}`,
					events: run
				});
				i = end;
				continue;
			}
			const fact = factOf(event);
			let end = i + 1;
			while (end < events.length && dayOf(events[end]) === day && factOf(events[end]) === fact) end += 1;
			if (end - i >= 2) {
				items.push({
					kind: "repeat",
					key: `repeat:${String(event.offset)}`,
					events: events.slice(i, end)
				});
				i = end;
				continue;
			}
		}
		items.push({
			kind: "event",
			key: `event:${String(event.offset)}`,
			event
		});
		i += 1;
	}
	return items;
}
/** Per item, who acted on the last row before it that anyone acted on — "" at the top and after
*  a day mark (a new day names its first actor again, since yesterday may have scrolled off).
*  The rows name who acted only when it changes against this. `before` is who acted last above
*  `items` (a re-fold of the tail carries it on). */
function whoBefore(items, actorOf, before = "") {
	let last = before;
	return items.map((item) => {
		if (item.kind === "day") {
			last = "";
			return "";
		}
		const before = last;
		const event = lastEventOf(item);
		if (event && actorOf(event)) last = actorOf(event);
		return before;
	});
}
/** The last event an item covers — the anchor for the next row's gap. */
function lastEventOf(item) {
	if (!item || item.kind === "day") return void 0;
	return item.kind === "event" ? item.event : item.events.at(-1);
}
/** How many events an item covers. */
const sizeOf = (item) => item.kind === "day" ? 0 : item.kind === "event" ? 1 : item.events.length;
/** How `next` grew from `previous`, both sorted by offset and `next` holding every element of
*  `previous` (the SDK's log, a filter of it): the elements added at the end, or at the start —
*  null when it changed any other way (a filter changed, a window was dropped). Compares the two
*  ends by identity, which is enough for sorted arrays of distinct elements: if `next` keeps
*  `previous`'s last element at `previous`'s last index, nothing was added before it. */
function growthOf(previous, next) {
	if (next === previous) return { end: [] };
	if (next.length < previous.length) return null;
	if (previous.length === 0) return { end: next };
	const added = next.length - previous.length;
	if (next[0] === previous[0] && next[previous.length - 1] === previous.at(-1)) return { end: next.slice(previous.length) };
	if (next.at(-1) === previous.at(-1) && next[added] === previous[0]) return { start: next.slice(0, added) };
	return null;
}
/** `foldEvents` + `whoBefore` of `events`, re-using `previous` where the log only grew at one
*  end: an append re-folds the last item (a run the new events may continue) and the new events;
*  a prepend re-folds the new events and the first item (a run they may extend backwards — the fold
*  is greedy from the top, so the items after it stand). Anything else folds the whole log. */
function refold(previous, events, mode, factOf, actorOf) {
	const growth = previous && previous.mode === mode && previous.factOf === factOf && previous.items.length > 0 ? growthOf(previous.events, events) : null;
	if (previous && growth && "end" in growth) {
		if (growth.end.length === 0) return {
			...previous,
			events
		};
		const last = previous.items.at(-1);
		const start = previous.events.length - sizeOf(last);
		const tail = foldEvents(events.slice(start), mode, factOf, dayOf(events[start]));
		return {
			events,
			mode,
			factOf,
			items: previous.items.slice(0, -1).concat(tail),
			namedBefore: previous.namedBefore.slice(0, -1).concat(whoBefore(tail, actorOf, previous.namedBefore.at(-1)))
		};
	}
	if (previous && growth && "start" in growth) {
		const first = previous.items[1];
		const items = foldEvents(events.slice(0, growth.start.length + sizeOf(first)), mode, factOf).concat(previous.items.slice(2));
		return {
			events,
			mode,
			factOf,
			items,
			namedBefore: whoBefore(items, actorOf)
		};
	}
	const items = foldEvents(events, mode, factOf);
	return {
		events,
		mode,
		factOf,
		items,
		namedBefore: whoBefore(items, actorOf)
	};
}
//#endregion
//#region src/components/context-view/filters.tsx
function filterEvents(events, filter) {
	const query = filter.query.trim().toLowerCase();
	return events.filter((event) => {
		if (filter.types.size > 0 && !filter.types.has(event.type)) return false;
		if (filter.actor && event.source?.principal?.actor !== filter.actor) return false;
		if (filter.from !== void 0 && event.offset < filter.from) return false;
		if (filter.to !== void 0 && event.offset > filter.to) return false;
		if (!query) return true;
		return event.type.toLowerCase().includes(query) || JSON.stringify(event.payload ?? null).toLowerCase().includes(query);
	});
}
/** Whether a filter narrows anything. */
const narrows = (filter) => Boolean(filter.query.trim()) || filter.types.size > 0 || Boolean(filter.actor) || filter.from !== void 0 || filter.to !== void 0;
/** Whether two filters narrow the same way (the view's filter is rebuilt from the URL on every
*  change of it, the inspected event's too). */
function sameFilter(a, b) {
	return a.query.trim() === b.query.trim() && a.actor === b.actor && a.from === b.from && a.to === b.to && a.types.size === b.types.size && [...a.types].every((type) => b.types.has(type));
}
/** `filterEvents`, re-using `previous` where the log only grew at one end and the filter is the
*  same: only the added events are filtered. No filter shows the log itself (the same array, so a
*  fold of it sees the log's own growth). */
function refilter(previous, events, filter) {
	if (!narrows(filter)) return {
		events,
		filter,
		shown: events
	};
	const growth = previous && narrows(previous.filter) && sameFilter(previous.filter, filter) ? growthOf(previous.events, events) : null;
	if (previous && growth && "end" in growth) return {
		events,
		filter,
		shown: growth.end.length === 0 ? previous.shown : previous.shown.concat(filterEvents(growth.end, filter))
	};
	if (previous && growth && "start" in growth) return {
		events,
		filter,
		shown: filterEvents(growth.start, filter).concat(previous.shown)
	};
	return {
		events,
		filter,
		shown: filterEvents(events, filter)
	};
}
/** The type counts of `events`, counting only what was added where the log only grew at one end. */
function recount(previous, events) {
	const growth = previous ? growthOf(previous.events, events) : null;
	if (previous && growth) {
		const added = "end" in growth ? growth.end : growth.start;
		if (added.length === 0) return {
			events,
			counts: previous.counts
		};
		return {
			events,
			counts: countTypes(new Map(previous.counts), added)
		};
	}
	return {
		events,
		counts: countTypes(/* @__PURE__ */ new Map(), events)
	};
}
function countTypes(counts, events) {
	for (const event of events) counts.set(event.type, (counts.get(event.type) ?? 0) + 1);
	return counts;
}
/** Counts by type as the filter row lists them: most frequent first, ties by name. */
function sortedCounts(counts) {
	return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
/** The type chips of the filter row: the log's counts, then every ticked type the loaded log does
*  not hold (a link's `types`, a type only in older pages) with a count of 0 — so a selection that
*  hides everything can still be seen and unticked. */
function typeChips(counts, ticked) {
	const listed = new Set(counts.map(([type]) => type));
	const absent = [...ticked].filter((type) => !listed.has(type)).sort();
	return [...counts, ...absent.map((type) => [type, 0])];
}
/** An offset box's text as a bound: blank = no bound, a number = that offset (a negative clamped to
*  0, a fraction cut), anything else = no change (`null`), so a stray key never empties the feed. */
function offsetBound(text) {
	const trimmed = text.trim();
	if (trimmed === "") return void 0;
	const parsed = Number(trimmed.replace(/^#/, ""));
	return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : null;
}
/** The event type without its `events.iterate.com/` prefix. */
const shortEventType = (type) => type.replace(/^events\.iterate\.com\//, "");
/** The payload as one line, cut to `max` characters — the row's glance at the body. */
function payloadPreview(payload, max = 140) {
	if (payload === void 0) return "";
	const text = JSON.stringify(payload);
	return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
/** The payload's top-level fields as one human line — `key value · key value` — for a type no
*  renderer names: strings to their first line, arrays to their length, objects to their keys. */
function payloadSummary(payload, max = 120) {
	if (payload === void 0) return "";
	if (Array.isArray(payload)) return `${String(payload.length)} item${payload.length === 1 ? "" : "s"}`;
	if (!isRecord(payload)) return valueGlance(payload);
	const parts = [];
	for (const [key, value] of Object.entries(payload)) {
		if (parts.length === 5) {
			parts.push("…");
			break;
		}
		parts.push(`${key} ${valueGlance(value)}`);
	}
	const text = parts.join(" · ");
	return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
/** One value inside the line: a string's first line, an array's length, an object's keys, else JSON. */
function valueGlance(value) {
	if (typeof value === "string") {
		const line = value.split("\n")[0] || "";
		return line.length > 48 ? `${line.slice(0, 47)}…` : line;
	}
	if (Array.isArray(value)) return `[${String(value.length)}]`;
	if (isRecord(value)) {
		const keys = Object.keys(value);
		return `{${keys.slice(0, 3).join(", ")}${keys.length > 3 ? ", …" : ""}}`;
	}
	return String(JSON.stringify(value));
}
/** Who appended: the email when the stamp has one, else the actor id; "" for the platform's own. */
const actorLabel = (event) => event.source?.principal?.email || event.source?.principal?.actor || "";
//#endregion
//#region src/components/context-view/types.tsx
/** The entry of a by-type registry (renderers, inspectors) for a type: the exact type, else the
*  longest prefix pattern (`events.iterate.com/agent/*`) that matches. */
function rendererFor(registry, type) {
	if (!registry) return void 0;
	if (registry[type]) return registry[type];
	let best;
	for (const [pattern, entry] of Object.entries(registry)) {
		if (!pattern.endsWith("*")) continue;
		const prefix = pattern.slice(0, -1);
		if (type.startsWith(prefix) && (!best || prefix.length > best.prefix.length)) best = {
			prefix,
			entry
		};
	}
	return best?.entry;
}
//#endregion
//#region src/components/context-view/event-row.tsx
/** The row's clock: `19:36:58` in the reader's zone, always the 24-hour cycle — eight characters
*  that fit the fixed column in every locale (a 12-hour locale's ` PM` would run into the delta). */
function formatClockTime(ms) {
	return new Date(ms).toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23"
	});
}
/** `+950ms`, `+3.2s`, `+1m40s`, `+2h5m` — the compact gap between two rows. */
function formatDelta(ms) {
	if (ms < 1e3) return `+${String(ms)}ms`;
	if (ms < 6e4) return `+${(Math.floor(ms / 100) / 10).toFixed(1).replace(/\.0$/, "")}s`;
	const seconds = Math.floor(ms / 1e3);
	if (seconds < 3600) return `+${String(Math.floor(seconds / 60))}m${String(seconds % 60)}s`;
	const minutes = Math.floor(seconds / 60);
	return `+${String(Math.floor(minutes / 60))}h${String(minutes % 60)}m`;
}
/** The gap's colour by its size: a second or more is green, then amber, orange, and a pause of
*  ten minutes or more red — where the log went quiet stands out. */
function deltaColor(ms) {
	if (ms < 1e4) return "text-emerald-600";
	if (ms < 6e4) return "text-amber-600";
	if (ms < 6e5) return "text-orange-600";
	return "text-red-600";
}
/** The frame every row shares: full width, the columns on one line from `sm` (a phone wraps the
*  body above the rest), 26px tall, the hover, the inspected row's left bar. Rows are buttons
*  (inspect, or open a fold). */
const rowClass = (selected) => cn("flex w-full min-w-0 flex-wrap items-baseline gap-x-3.5 px-3 sm:px-4 py-[3px] text-left hover:bg-muted/60 max-sm:gap-x-2 max-sm:py-1.5 sm:flex-nowrap", selected && "bg-muted shadow-[inset_2px_0_0_var(--color-foreground)] hover:bg-muted");
const OFFSET = "shrink-0 font-mono text-[11px] text-muted-foreground/60 tabular-nums sm:w-[var(--offset-width,6ch)] sm:text-right";
const CLOCK = "shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums sm:w-[8ch]";
const GAP = "shrink-0 font-mono text-[11px] tabular-nums max-sm:empty:hidden sm:w-[7ch] sm:text-right";
/** `#123`, right-aligned in the gutter the view sizes to its largest offset (`--offset-width`). */
function RowOffset({ offset }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: OFFSET,
		children: ["#", offset]
	});
}
/** The empty columns before the body (the offset, and with `times` the clock and the gap), so a
*  line that is not an event — a day, the top of the log, the composer — starts where they do. */
function RowGutter({ times }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"aria-hidden": true,
		className: cn(OFFSET, "max-sm:hidden")
	}), times ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"aria-hidden": true,
		className: cn(CLOCK, "max-sm:hidden")
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"aria-hidden": true,
		className: cn(GAP, "max-sm:hidden")
	})] }) : null] });
}
/** Who acted, when it changes hands: the right edge on a desktop, the meta line on a phone. */
function RowWho({ who }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "max-w-48 shrink-0 truncate text-xs text-muted-foreground max-sm:font-mono max-sm:text-[11px] sm:ml-auto",
		children: who
	});
}
/** The clock and the gap since the row before (from its LAST moment, so a fold's gap is the idle
*  time between rows, not inside one): two columns, the gap blank under a second. */
function RowTimes({ event, previous }) {
	const at = Date.parse(event.createdAt);
	const gap = previous ? Math.max(0, at - Date.parse(previous.createdAt)) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
		dateTime: event.createdAt,
		title: new Date(at).toISOString(),
		className: CLOCK,
		children: formatClockTime(at)
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(GAP, gap !== void 0 && deltaColor(gap)),
		title: "Since the row before",
		children: gap === void 0 || gap < 1e3 ? "" : formatDelta(gap)
	})] });
}
/** The body column: first on a phone, where it takes the whole first line. */
const rowBody = "min-w-0 flex-1 max-sm:order-first max-sm:basis-full";
/** The raw line: the type and the payload's JSON, one line. */
function RawLine({ event, className }) {
	const glance = payloadPreview(event.payload);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("flex min-w-0 gap-3 font-mono text-xs leading-5 text-muted-foreground", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "w-[26ch] shrink-0 truncate text-foreground/85",
			children: shortEventType(event.type)
		}), glance ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 truncate",
			children: glance
		}) : null]
	});
}
/** The sentence: a renderer's for the type, else the type with a glance at the payload's fields.
*  Every child is forced inline so the line truncates as one — a renderer's <strong> and <span> too. */
function EventSentence({ event, renderers, className }) {
	const rich = rendererFor(renderers, event.type)?.(event) ?? null;
	const glance = payloadSummary(event.payload);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("block max-h-10 min-w-0 overflow-hidden text-sm leading-5 whitespace-normal sm:max-h-none sm:truncate [&_*]:inline", className),
		children: rich ?? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-xs text-foreground/80",
			children: shortEventType(event.type)
		}), glance ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ml-2 text-xs text-muted-foreground",
			children: glance
		}) : null] })
	});
}
const EventRow = (0, import_react.memo)(function EventRow({ event, previous, renderers, mode, showWho, quiet, selected, onOpen }) {
	const who = actorLabel(event);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onOpen(event.offset),
		"data-offset": event.offset,
		className: cn(rowClass(selected), quiet && "text-muted-foreground"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowOffset, { offset: event.offset }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowTimes, {
				event,
				previous
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: rowBody,
				children: [mode === "raw" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RawLine, { event }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventSentence, {
					event,
					renderers
				}), mode === "pretty-raw" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RawLine, {
					event,
					className: "mt-0.5 text-[11px]"
				}) : null]
			}),
			showWho && who ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowWho, { who }) : null
		]
	});
});
//#endregion
//#region src/components/context-view/event-inspector-log.ts
/** Where `offset` sits in `events` (sorted by offset): one binary search, the log can be 100,000
*  long. */
function inspectedPlace(events, offset) {
	let low = 0;
	let high = events.length;
	while (low < high) {
		const middle = low + high >> 1;
		if (events[middle].offset < offset) low = middle + 1;
		else high = middle;
	}
	const found = events[low]?.offset === offset ? events[low] : void 0;
	const previous = events[low - 1];
	const next = events[found ? low + 1 : low];
	if (found) return {
		event: found,
		previous,
		next
	};
	return {
		previous,
		next,
		missing: !next ? "above" : !previous ? "below" : "gap"
	};
}
/** The gap between two events' `createdAt` in the rows' notation (event-row.tsx `formatDelta`), never
*  negative; none when either time does not parse. */
function elapsedBetween(from, to) {
	const ms = Date.parse(to) - Date.parse(from);
	if (Number.isNaN(ms)) return void 0;
	return formatDelta(Math.max(0, ms));
}
/** The raw event's keys, signal first: what happened and its payload before the envelope. */
const EVENT_KEY_ORDER = [
	"type",
	"payload",
	"metadata",
	"idempotencyKey",
	"offset",
	"createdAt"
];
/** The event with its keys in `EVENT_KEY_ORDER`, then the rest (`source`, `path`) as they came. */
function orderEventKeys(event) {
	const fields = event;
	const ordered = {};
	for (const key of EVENT_KEY_ORDER) if (key in fields) ordered[key] = fields[key];
	for (const [key, value] of Object.entries(fields)) if (!EVENT_KEY_ORDER.includes(key)) ordered[key] = value;
	return ordered;
}
/** A keydown whose ← → belong to what has focus (a field, an editor), not to paging the log. */
function isTypingTarget(target) {
	if (!(target instanceof HTMLElement)) return false;
	return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target.isContentEditable;
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/internals/composite/root/CompositeRootContext.mjs
const CompositeRootContext = /*#__PURE__*/ import_react.createContext(void 0);
function useCompositeRootContext(optional = false) {
	const context = import_react.useContext(CompositeRootContext);
	if (context === void 0 && !optional) throw new Error(formatErrorMessage(16));
	return context;
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/utils/useFocusableWhenDisabled.mjs
function useFocusableWhenDisabled(parameters) {
	const { focusableWhenDisabled, disabled, composite = false, tabIndex: tabIndexProp = 0, isNativeButton } = parameters;
	const isFocusableComposite = composite && focusableWhenDisabled !== false;
	const isNonFocusableComposite = composite && focusableWhenDisabled === false;
	return { props: import_react.useMemo(() => {
		const additionalProps = { onKeyDown(event) {
			if (disabled && focusableWhenDisabled && event.key !== "Tab") event.preventDefault();
		} };
		if (!composite) {
			additionalProps.tabIndex = tabIndexProp;
			if (!isNativeButton && disabled) additionalProps.tabIndex = focusableWhenDisabled ? tabIndexProp : -1;
		}
		if (isNativeButton && (focusableWhenDisabled || isFocusableComposite) || !isNativeButton && disabled) additionalProps["aria-disabled"] = disabled;
		if (isNativeButton && (!focusableWhenDisabled || isNonFocusableComposite)) additionalProps.disabled = disabled;
		return additionalProps;
	}, [
		composite,
		disabled,
		focusableWhenDisabled,
		isFocusableComposite,
		isNonFocusableComposite,
		isNativeButton,
		tabIndexProp
	]) };
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/utils/dispatchClickWithModifiers.mjs
/**
* Dispatches a constructed click on the target so it carries the source event's
* modifier state, which `click()` always reports as unpressed. Like `click()`,
* the untrusted click still runs native activation behavior (form submission,
* link navigation).
* `detail` defaults to 0 (the native convention for keyboard-generated clicks);
* pass `detail: 1` when the click represents a mouse gesture so consumers keying
* off `detail === 0` don't classify it as a keyboard activation.
*/
function dispatchClickWithModifiers(target, sourceEvent, { detail = 0 } = {}) {
	target.dispatchEvent(new (getWindow(target)).PointerEvent("click", {
		bubbles: true,
		cancelable: true,
		composed: true,
		detail,
		shiftKey: sourceEvent.shiftKey,
		ctrlKey: sourceEvent.ctrlKey,
		altKey: sourceEvent.altKey,
		metaKey: sourceEvent.metaKey
	}));
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/internals/use-button/useButton.mjs
function useButton(parameters = {}) {
	const { disabled = false, focusableWhenDisabled, tabIndex = 0, native: isNativeButton = true, composite: compositeProp } = parameters;
	const elementRef = import_react.useRef(null);
	const compositeRootContext = useCompositeRootContext(true);
	const isCompositeItem = compositeProp ?? compositeRootContext !== void 0;
	const { props: focusableWhenDisabledProps } = useFocusableWhenDisabled({
		focusableWhenDisabled,
		disabled,
		composite: isCompositeItem,
		tabIndex,
		isNativeButton
	});
	const updateDisabled = import_react.useCallback(() => {
		const element = elementRef.current;
		if (!isButtonElement(element)) return;
		if (isCompositeItem && disabled && focusableWhenDisabledProps.disabled === void 0 && element.disabled) element.disabled = false;
	}, [
		disabled,
		focusableWhenDisabledProps.disabled,
		isCompositeItem
	]);
	useIsoLayoutEffect(updateDisabled, [updateDisabled]);
	return {
		getButtonProps: import_react.useCallback((externalProps = {}) => {
			const { onClick: externalOnClick, onMouseDown: externalOnMouseDown, onKeyUp: externalOnKeyUp, onKeyDown: externalOnKeyDown, onPointerDown: externalOnPointerDown, ...otherExternalProps } = externalProps;
			return mergeProps({
				onClick(event) {
					if (disabled) {
						event.preventDefault();
						return;
					}
					externalOnClick?.(event);
				},
				onMouseDown(event) {
					if (!disabled) externalOnMouseDown?.(event);
				},
				onKeyDown(event) {
					if (disabled) return;
					makeEventPreventable(event);
					externalOnKeyDown?.(event);
					if (event.baseUIHandlerPrevented) return;
					const isCurrentTarget = event.target === event.currentTarget;
					const currentTarget = event.currentTarget;
					const isButton = isButtonElement(currentTarget);
					const isLink = !isNativeButton && isValidLinkElement(currentTarget);
					const shouldClick = isCurrentTarget && (isNativeButton ? isButton : !isLink);
					const isEnterKey = event.key === "Enter";
					const isSpaceKey = event.key === " ";
					const role = currentTarget.getAttribute("role");
					const isTextNavigationRole = role?.startsWith("menuitem") || role === "option" || role === "gridcell";
					if (isCurrentTarget && isCompositeItem && isSpaceKey) {
						if (event.defaultPrevented && isTextNavigationRole) return;
						event.preventDefault();
						if (!isNativeButton || isButton) {
							event.preventBaseUIHandler();
							dispatchClickWithModifiers(currentTarget, event);
						}
						return;
					}
					if (!shouldClick || isNativeButton || !isSpaceKey && !isEnterKey) {
						if (isCurrentTarget && isLink && isSpaceKey) event.preventDefault();
						return;
					}
					if (event.defaultPrevented) return;
					event.preventDefault();
					if (isEnterKey) {
						event.preventBaseUIHandler();
						dispatchClickWithModifiers(currentTarget, event);
					}
				},
				onKeyUp(event) {
					if (disabled) return;
					makeEventPreventable(event);
					externalOnKeyUp?.(event);
					if (event.target === event.currentTarget && isNativeButton && isCompositeItem && isButtonElement(event.currentTarget) && event.key === " ") {
						event.preventDefault();
						return;
					}
					if (event.baseUIHandlerPrevented) return;
					if (event.target === event.currentTarget && !isNativeButton && !isCompositeItem && !event.defaultPrevented && event.key === " ") {
						event.preventBaseUIHandler();
						dispatchClickWithModifiers(event.currentTarget, event);
					}
				},
				onPointerDown(event) {
					if (disabled) {
						event.preventDefault();
						return;
					}
					externalOnPointerDown?.(event);
				}
			}, isNativeButton ? { type: "button" } : { role: "button" }, focusableWhenDisabledProps, otherExternalProps);
		}, [
			disabled,
			focusableWhenDisabledProps,
			isCompositeItem,
			isNativeButton
		]),
		buttonRef: useStableCallback((element) => {
			elementRef.current = element;
			updateDisabled();
		})
	};
}
function isButtonElement(elem) {
	return isHTMLElement(elem) && elem.tagName === "BUTTON";
}
function isValidLinkElement(elem) {
	return isHTMLElement(elem) && elem.tagName === "A" && Boolean(elem.href);
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/button/Button.mjs
/**
* A button component that can be used to trigger actions.
* Renders a `<button>` element.
*
* Documentation: [Base UI Button](https://base-ui.com/react/components/button)
*/
const Button$1 = /*#__PURE__*/ import_react.forwardRef(function Button(componentProps, forwardedRef) {
	const { render, className, disabled = false, focusableWhenDisabled = false, nativeButton = true, style, ...elementProps } = componentProps;
	const { getButtonProps, buttonRef } = useButton({
		disabled,
		focusableWhenDisabled,
		native: nativeButton
	});
	return useRenderElement("button", componentProps, {
		state: { disabled },
		ref: [forwardedRef, buttonRef],
		props: [elementProps, getButtonProps]
	});
});
//#endregion
//#region ../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
function r(e) {
	var t, f, n = "";
	if ("string" == typeof e || "number" == typeof e) n += e;
	else if ("object" == typeof e) if (Array.isArray(e)) {
		var o = e.length;
		for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
	} else for (f in e) e[f] && (n && (n += " "), n += f);
	return n;
}
function clsx() {
	for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
	return n;
}
//#endregion
//#region ../../node_modules/.pnpm/class-variance-authority@0.7.1/node_modules/class-variance-authority/dist/index.mjs
/**
* Copyright 2022 Joe Bell. All rights reserved.
*
* This file is licensed to you under the Apache License, Version 2.0
* (the "License"); you may not use this file except in compliance with the
* License. You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
* WARRANTIES OR REPRESENTATIONS OF ANY KIND, either express or implied. See the
* License for the specific language governing permissions and limitations under
* the License.
*/ const falsyToString = (value) => typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;
const cx = clsx;
const cva = (base, config) => (props) => {
	var _config_compoundVariants;
	if ((config === null || config === void 0 ? void 0 : config.variants) == null) return cx(base, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
	const { variants, defaultVariants } = config;
	const getVariantClassNames = Object.keys(variants).map((variant) => {
		const variantProp = props === null || props === void 0 ? void 0 : props[variant];
		const defaultVariantProp = defaultVariants === null || defaultVariants === void 0 ? void 0 : defaultVariants[variant];
		if (variantProp === null) return null;
		const variantKey = falsyToString(variantProp) || falsyToString(defaultVariantProp);
		return variants[variant][variantKey];
	});
	const propsWithoutUndefined = props && Object.entries(props).reduce((acc, param) => {
		let [key, value] = param;
		if (value === void 0) return acc;
		acc[key] = value;
		return acc;
	}, {});
	const getCompoundVariantClassNames = config === null || config === void 0 ? void 0 : (_config_compoundVariants = config.compoundVariants) === null || _config_compoundVariants === void 0 ? void 0 : _config_compoundVariants.reduce((acc, param) => {
		let { class: cvClass, className: cvClassName, ...compoundVariantOptions } = param;
		return Object.entries(compoundVariantOptions).every((param) => {
			let [key, value] = param;
			return Array.isArray(value) ? value.includes({
				...defaultVariants,
				...propsWithoutUndefined
			}[key]) : {
				...defaultVariants,
				...propsWithoutUndefined
			}[key] === value;
		}) ? [
			...acc,
			cvClass,
			cvClassName
		] : acc;
	}, []);
	return cx(base, getVariantClassNames, getCompoundVariantClassNames, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
};
//#endregion
//#region src/components/ui/button.tsx
const buttonVariants = cva("group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/80",
			outline: "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
			secondary: "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
			ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
			destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
			xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
			sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
			lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
			icon: "size-8",
			"icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
			"icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
			"icon-lg": "size-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant = "default", size = "default", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button$1, {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/dialog/root/DialogRootContext.mjs
const DialogRootContext = /*#__PURE__*/ import_react.createContext(void 0);
function useDialogRootContext(optional) {
	const store = import_react.useContext(DialogRootContext);
	if (!optional && store === void 0) throw new Error(formatErrorMessage(27));
	return store;
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/dialog/backdrop/DialogBackdrop.mjs
/**
* An overlay displayed beneath the popup.
* Renders a `<div>` element.
*
* Documentation: [Base UI Dialog](https://base-ui.com/react/components/dialog)
*/
const DialogBackdrop = /*#__PURE__*/ import_react.forwardRef(function DialogBackdrop(componentProps, forwardedRef) {
	const { render, className, style, forceRender = false, ...elementProps } = componentProps;
	const store = useDialogRootContext();
	const open = store.useState("open");
	const nested = store.useState("nested");
	const mounted = store.useState("mounted");
	const state = {
		open,
		transitionStatus: store.useState("transitionStatus")
	};
	return useRenderElement("div", componentProps, {
		state,
		ref: [store.context.backdropRef, forwardedRef],
		stateAttributesMapping: popupTransitionStateMapping,
		props: [{
			role: "presentation",
			hidden: !mounted,
			style: {
				userSelect: "none",
				WebkitUserSelect: "none"
			}
		}, elementProps],
		enabled: forceRender || !nested
	});
});
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/dialog/close/DialogClose.mjs
/**
* A button that closes the dialog.
* Renders a `<button>` element.
*
* Documentation: [Base UI Dialog](https://base-ui.com/react/components/dialog)
*/
const DialogClose = /*#__PURE__*/ import_react.forwardRef(function DialogClose(componentProps, forwardedRef) {
	const { render, className, style, disabled = false, nativeButton = true, ...elementProps } = componentProps;
	const store = useDialogRootContext();
	const open = store.useState("open");
	const { getButtonProps, buttonRef } = useButton({
		disabled,
		native: nativeButton
	});
	const state = { disabled };
	function handleClick(event) {
		if (open) store.setOpen(false, createChangeEventDetails(closePress, event.nativeEvent));
	}
	return useRenderElement("button", componentProps, {
		state,
		ref: [forwardedRef, buttonRef],
		props: [
			{ onClick: handleClick },
			elementProps,
			getButtonProps
		]
	});
});
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/dialog/description/DialogDescription.mjs
/**
* A paragraph with additional information about the dialog.
* Renders a `<p>` element.
*
* Documentation: [Base UI Dialog](https://base-ui.com/react/components/dialog)
*/
const DialogDescription = /*#__PURE__*/ import_react.forwardRef(function DialogDescription(componentProps, forwardedRef) {
	const { render, className, style, id: idProp, ...elementProps } = componentProps;
	const store = useDialogRootContext();
	const id = useBaseUiId(idProp);
	store.useSyncedValueWithCleanup("descriptionElementId", id);
	return useRenderElement("p", componentProps, {
		ref: forwardedRef,
		props: [{ id }, elementProps]
	});
});
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/floating-ui-react/utils/enqueueFocus.mjs
let rafId = 0;
function enqueueFocus(el, options = {}) {
	const { preventScroll = false, sync = false, shouldFocus } = options;
	cancelAnimationFrame(rafId);
	function exec() {
		if (shouldFocus && !shouldFocus()) return;
		el?.focus({ preventScroll });
	}
	if (sync) {
		exec();
		return NOOP;
	}
	const currentRafId = requestAnimationFrame(exec);
	rafId = currentRafId;
	return () => {
		if (rafId === currentRafId) {
			cancelAnimationFrame(currentRafId);
			rafId = 0;
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/floating-ui-react/utils/markOthers.mjs
const counters = {
	inert: /* @__PURE__ */ new WeakMap(),
	"aria-hidden": /* @__PURE__ */ new WeakMap()
};
const markerName = "data-base-ui-inert";
const uncontrolledElementsSets = {
	inert: /* @__PURE__ */ new WeakSet(),
	"aria-hidden": /* @__PURE__ */ new WeakSet()
};
let markerCounterMap = /* @__PURE__ */ new WeakMap();
let lockCount = 0;
function getUncontrolledElementsSet(controlAttribute) {
	return uncontrolledElementsSets[controlAttribute];
}
function unwrapHost(node) {
	if (!node) return null;
	return isShadowRoot(node) ? node.host : unwrapHost(node.parentNode);
}
const correctElements = (parent, targets) => targets.map((target) => {
	if (parent.contains(target)) return target;
	const correctedTarget = unwrapHost(target);
	if (parent.contains(correctedTarget)) return correctedTarget;
	return null;
}).filter((x) => x != null);
const buildKeepSet = (targets) => {
	const keep = /* @__PURE__ */ new Set();
	targets.forEach((target) => {
		let node = target;
		while (node && !keep.has(node)) {
			keep.add(node);
			node = node.parentNode;
		}
	});
	return keep;
};
const collectOutsideElements = (root, keepElements, stopElements) => {
	const outside = [];
	const walk = (parent) => {
		if (!parent || stopElements.has(parent)) return;
		Array.from(parent.children).forEach((node) => {
			if (getNodeName(node) === "script") return;
			if (keepElements.has(node)) walk(node);
			else outside.push(node);
		});
	};
	walk(root);
	return outside;
};
function applyAttributeToOthers(uncorrectedAvoidElements, body, ariaHidden, inert, { mark = true }) {
	let controlAttribute = null;
	if (inert) controlAttribute = "inert";
	else if (ariaHidden) controlAttribute = "aria-hidden";
	let counterMap = null;
	let uncontrolledElementsSet = null;
	const avoidElements = correctElements(body, uncorrectedAvoidElements);
	const markerTargets = mark ? collectOutsideElements(body, buildKeepSet(avoidElements), new Set(avoidElements)) : [];
	const hiddenElements = [];
	const markedElements = [];
	if (controlAttribute) {
		const map = counters[controlAttribute];
		const currentUncontrolledElementsSet = getUncontrolledElementsSet(controlAttribute);
		uncontrolledElementsSet = currentUncontrolledElementsSet;
		counterMap = map;
		const ariaLiveElements = correctElements(body, Array.from(body.querySelectorAll("[aria-live]")));
		const controlElements = avoidElements.concat(ariaLiveElements);
		collectOutsideElements(body, buildKeepSet(controlElements), new Set(controlElements)).forEach((node) => {
			const attr = node.getAttribute(controlAttribute);
			const alreadyHidden = attr !== null && attr !== "false";
			const counterValue = (map.get(node) || 0) + 1;
			map.set(node, counterValue);
			hiddenElements.push(node);
			if (counterValue === 1 && alreadyHidden) currentUncontrolledElementsSet.add(node);
			if (!alreadyHidden) node.setAttribute(controlAttribute, controlAttribute === "inert" ? "" : "true");
		});
	}
	if (mark) markerTargets.forEach((node) => {
		const markerValue = (markerCounterMap.get(node) || 0) + 1;
		markerCounterMap.set(node, markerValue);
		markedElements.push(node);
		if (markerValue === 1) node.setAttribute(markerName, "");
	});
	lockCount += 1;
	return () => {
		if (counterMap) hiddenElements.forEach((element) => {
			const counterValue = (counterMap.get(element) || 0) - 1;
			counterMap.set(element, counterValue);
			if (!counterValue) {
				if (!uncontrolledElementsSet?.has(element) && controlAttribute) element.removeAttribute(controlAttribute);
				uncontrolledElementsSet?.delete(element);
			}
		});
		if (mark) markedElements.forEach((element) => {
			const markerValue = (markerCounterMap.get(element) || 0) - 1;
			markerCounterMap.set(element, markerValue);
			if (!markerValue) element.removeAttribute(markerName);
		});
		lockCount -= 1;
		if (!lockCount) {
			counters.inert = /* @__PURE__ */ new WeakMap();
			counters["aria-hidden"] = /* @__PURE__ */ new WeakMap();
			uncontrolledElementsSets.inert = /* @__PURE__ */ new WeakSet();
			uncontrolledElementsSets["aria-hidden"] = /* @__PURE__ */ new WeakSet();
			markerCounterMap = /* @__PURE__ */ new WeakMap();
		}
	};
}
function markOthers(avoidElements, options = {}) {
	const { ariaHidden = false, inert = false, mark = true } = options;
	const body = ownerDocument(avoidElements[0]).body;
	return applyAttributeToOthers(avoidElements, body, ariaHidden, inert, { mark });
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/floating-ui-react/components/FloatingFocusManager.mjs
function getEventType(event, lastInteractionType) {
	const win = getWindow(getTarget(event));
	if (event instanceof win.KeyboardEvent) return "keyboard";
	if (event instanceof win.FocusEvent) return lastInteractionType || "keyboard";
	if ("pointerType" in event) return event.pointerType || "keyboard";
	if ("touches" in event) return "touch";
	if (event instanceof win.MouseEvent) return lastInteractionType || (event.detail === 0 ? "keyboard" : "mouse");
	return "";
}
const LIST_LIMIT = 20;
let previouslyFocusedElements = [];
function clearDisconnectedPreviouslyFocusedElements() {
	previouslyFocusedElements = previouslyFocusedElements.filter((entry) => {
		return entry.deref()?.isConnected;
	});
}
function addPreviouslyFocusedElement(element) {
	clearDisconnectedPreviouslyFocusedElements();
	if (element && getNodeName(element) !== "body") {
		previouslyFocusedElements.push(new WeakRef(element));
		if (previouslyFocusedElements.length > LIST_LIMIT) previouslyFocusedElements = previouslyFocusedElements.slice(-20);
	}
}
function getPreviouslyFocusedElement() {
	clearDisconnectedPreviouslyFocusedElements();
	return previouslyFocusedElements[previouslyFocusedElements.length - 1]?.deref();
}
function getFirstTabbableElement(container) {
	if (!container) return null;
	if (isTabbable(container)) return container;
	return tabbable(container)[0] || container;
}
function handleTabIndex(floatingFocusElement) {
	if (floatingFocusElement.hasAttribute("tabindex") && !floatingFocusElement.hasAttribute("data-tabindex")) return;
	if (!floatingFocusElement.getAttribute("role")?.includes("dialog")) return;
	const tabbableContent = focusable(floatingFocusElement).filter((element) => {
		const dataTabIndex = element.getAttribute("data-tabindex") || "";
		return isTabbable(element) || element.hasAttribute("data-tabindex") && !dataTabIndex.startsWith("-");
	});
	const tabIndex = floatingFocusElement.getAttribute("tabindex");
	if (tabbableContent.length === 0) {
		if (tabIndex !== "0") {
			floatingFocusElement.setAttribute("tabindex", "0");
			floatingFocusElement.setAttribute("data-tabindex", "0");
		}
	} else if (tabIndex !== "-1" || floatingFocusElement.hasAttribute("data-tabindex") && floatingFocusElement.getAttribute("data-tabindex") !== "-1") {
		floatingFocusElement.setAttribute("tabindex", "-1");
		floatingFocusElement.setAttribute("data-tabindex", "-1");
	}
}
/**
* Provides focus management for the floating element.
* @see https://floating-ui.com/docs/FloatingFocusManager
* @internal
*/
function FloatingFocusManager(props) {
	const { context, children, disabled = false, initialFocus = true, returnFocus = true, restoreFocus = false, modal = true, closeOnFocusOut = true, openInteractionType = "", nextFocusableElement, previousFocusableElement, beforeContentFocusGuardRef, externalTree, getInsideElements } = props;
	const store = "rootStore" in context ? context.rootStore : context;
	const open = store.useState("open");
	const domReference = store.useState("domReferenceElement");
	const floating = store.useState("floatingElement");
	const { events, dataRef } = store.context;
	const getNodeId = useStableCallback(() => dataRef.current.floatingContext?.nodeId);
	const ignoreInitialFocus = initialFocus === false;
	const isUntrappedTypeableCombobox = isTypeableCombobox(domReference) && ignoreInitialFocus;
	const initialFocusRef = useValueAsRef(initialFocus);
	const returnFocusRef = useValueAsRef(returnFocus);
	const openInteractionTypeRef = useValueAsRef(openInteractionType);
	const openRef = useValueAsRef(open);
	const tree = useFloatingTree(externalTree);
	const portalContext = usePortalContext();
	const preventReturnFocusRef = import_react.useRef(false);
	const isPointerDownRef = import_react.useRef(false);
	const pointerDownOutsideRef = import_react.useRef(false);
	const lastFocusedTabbableRef = import_react.useRef(null);
	const closeTypeRef = import_react.useRef("");
	const lastInteractionTypeRef = import_react.useRef("");
	const beforeGuardRef = import_react.useRef(null);
	const afterGuardRef = import_react.useRef(null);
	const mergedBeforeGuardRef = useMergedRefs(beforeGuardRef, beforeContentFocusGuardRef, portalContext?.beforeInsideRef);
	const mergedAfterGuardRef = useMergedRefs(afterGuardRef, portalContext?.afterInsideRef);
	const blurTimeout = useTimeout();
	const pointerDownTimeout = useTimeout();
	const restoreFocusFrame = useAnimationFrame();
	const isInsidePortal = portalContext != null;
	const floatingFocusElement = getFloatingFocusElement(floating);
	const getTabbableContent = useStableCallback((container = floatingFocusElement) => {
		return container ? tabbable(container) : [];
	});
	const getResolvedInsideElements = useStableCallback(() => getInsideElements?.().filter((element) => element != null) ?? []);
	import_react.useEffect(() => {
		if (disabled || !modal) return;
		function onKeyDown(event) {
			if (event.key === "Tab") {
				if (contains(floatingFocusElement, activeElement(ownerDocument(floatingFocusElement))) && getTabbableContent().length === 0 && !isUntrappedTypeableCombobox) stopEvent(event);
			}
		}
		const doc = ownerDocument(floatingFocusElement);
		return addEventListener(doc, "keydown", onKeyDown);
	}, [
		disabled,
		floatingFocusElement,
		modal,
		isUntrappedTypeableCombobox,
		getTabbableContent
	]);
	import_react.useEffect(() => {
		if (disabled || !open) return;
		const doc = ownerDocument(floatingFocusElement);
		function clearPointerDownOutside() {
			pointerDownOutsideRef.current = false;
		}
		function onPointerDown(event) {
			const target = getTarget(event);
			const insideElements = getResolvedInsideElements();
			const pointerTargetInside = contains(floating, target) || contains(domReference, target) || contains(portalContext?.portalNode, target) || insideElements.some((element) => element === target || contains(element, target));
			pointerDownOutsideRef.current = !pointerTargetInside;
			lastInteractionTypeRef.current = event.pointerType || "keyboard";
			if (target?.closest(`[data-base-ui-click-trigger]`)) {
				isPointerDownRef.current = true;
				pointerDownTimeout.start(0, () => {
					isPointerDownRef.current = false;
				});
			}
		}
		function onKeyDown() {
			lastInteractionTypeRef.current = "keyboard";
		}
		return mergeCleanups(addEventListener(doc, "pointerdown", onPointerDown, true), addEventListener(doc, "pointerup", clearPointerDownOutside, true), addEventListener(doc, "pointercancel", clearPointerDownOutside, true), addEventListener(doc, "keydown", onKeyDown, true), clearPointerDownOutside);
	}, [
		disabled,
		floating,
		domReference,
		floatingFocusElement,
		open,
		portalContext,
		pointerDownTimeout,
		getResolvedInsideElements
	]);
	import_react.useEffect(() => {
		if (disabled || !closeOnFocusOut) return;
		const doc = ownerDocument(floatingFocusElement);
		function handlePointerDown() {
			isPointerDownRef.current = true;
			pointerDownTimeout.start(0, () => {
				isPointerDownRef.current = false;
			});
		}
		function handleFocusIn(event) {
			const target = getTarget(event);
			if (isTabbable(target)) lastFocusedTabbableRef.current = target;
		}
		function handleFocusOutside(event) {
			const relatedTarget = event.relatedTarget;
			const currentTarget = event.currentTarget;
			const target = getTarget(event);
			if (modal && relatedTarget == null && target != null && contains(floating, target)) addPreviouslyFocusedElement(target);
			queueMicrotask(() => {
				const nodeId = getNodeId();
				const triggers = store.context.triggerElements;
				const insideElements = getResolvedInsideElements();
				const isRelatedFocusGuard = relatedTarget?.hasAttribute(createAttribute("focus-guard")) && [
					beforeGuardRef.current,
					afterGuardRef.current,
					portalContext?.beforeInsideRef.current,
					portalContext?.afterInsideRef.current,
					portalContext?.beforeOutsideRef.current,
					portalContext?.afterOutsideRef.current,
					resolveRef(previousFocusableElement),
					resolveRef(nextFocusableElement)
				].includes(relatedTarget);
				const movedToUnrelatedNode = !(contains(domReference, relatedTarget) || contains(floating, relatedTarget) || contains(relatedTarget, floating) || contains(portalContext?.portalNode, relatedTarget) || insideElements.some((element) => element === relatedTarget || contains(element, relatedTarget)) || triggers.hasMatchingElement((trigger) => contains(trigger, relatedTarget)) || isRelatedFocusGuard || tree && (getNodeChildren(tree.nodesRef.current, nodeId).find((node) => contains(node.context?.elements.floating, relatedTarget) || contains(node.context?.elements.domReference, relatedTarget)) || getNodeAncestors(tree.nodesRef.current, nodeId).find((node) => [node.context?.elements.floating, getFloatingFocusElement(node.context?.elements.floating)].includes(relatedTarget) || node.context?.elements.domReference === relatedTarget)));
				if (currentTarget === domReference && floatingFocusElement) handleTabIndex(floatingFocusElement);
				if (restoreFocus && currentTarget !== domReference && !isElementVisible(target) && activeElement(doc) === doc.body) {
					if (isHTMLElement(floatingFocusElement)) {
						floatingFocusElement.focus();
						if (restoreFocus === "popup") {
							restoreFocusFrame.request(() => {
								floatingFocusElement.focus();
							});
							return;
						}
					}
					const tabbableContent = getTabbableContent();
					const prevTabbable = lastFocusedTabbableRef.current;
					const nodeToFocus = (prevTabbable && tabbableContent.includes(prevTabbable) ? prevTabbable : null) || tabbableContent[tabbableContent.length - 1] || floatingFocusElement;
					if (isHTMLElement(nodeToFocus)) nodeToFocus.focus();
				}
				if (dataRef.current.insideReactTree) {
					dataRef.current.insideReactTree = false;
					return;
				}
				if ((isUntrappedTypeableCombobox ? true : !modal) && relatedTarget && movedToUnrelatedNode && !isPointerDownRef.current && (isUntrappedTypeableCombobox || relatedTarget !== getPreviouslyFocusedElement())) {
					preventReturnFocusRef.current = true;
					store.setOpen(false, createChangeEventDetails(focusOut, event));
				}
			});
		}
		function markInsideReactTree() {
			if (pointerDownOutsideRef.current) return;
			dataRef.current.insideReactTree = true;
			blurTimeout.start(0, () => {
				dataRef.current.insideReactTree = false;
			});
		}
		const domReferenceElement = isHTMLElement(domReference) ? domReference : null;
		if (!floating && !domReferenceElement) return;
		return mergeCleanups(domReferenceElement && addEventListener(domReferenceElement, "focusout", handleFocusOutside), domReferenceElement && addEventListener(domReferenceElement, "pointerdown", handlePointerDown), floating && addEventListener(floating, "focusin", handleFocusIn), floating && addEventListener(floating, "focusout", handleFocusOutside), floating && portalContext && addEventListener(floating, "focusout", markInsideReactTree, true));
	}, [
		disabled,
		domReference,
		floating,
		floatingFocusElement,
		modal,
		tree,
		portalContext,
		store,
		closeOnFocusOut,
		restoreFocus,
		getTabbableContent,
		isUntrappedTypeableCombobox,
		getNodeId,
		dataRef,
		blurTimeout,
		pointerDownTimeout,
		restoreFocusFrame,
		nextFocusableElement,
		previousFocusableElement,
		getResolvedInsideElements
	]);
	import_react.useEffect(() => {
		if (disabled || !floating || !open) return;
		const portalNodes = Array.from(portalContext?.portalNode?.querySelectorAll(`[${createAttribute("portal")}]`) || []);
		const rootAncestorComboboxDomReference = (tree ? getNodeAncestors(tree.nodesRef.current, getNodeId()) : []).find((node) => isTypeableCombobox(node.context?.elements.domReference || null))?.context?.elements.domReference;
		const ariaHiddenCleanup = markOthers([
			...[
				floating,
				...portalNodes,
				beforeGuardRef.current,
				afterGuardRef.current,
				portalContext?.beforeOutsideRef.current,
				portalContext?.afterOutsideRef.current,
				...getResolvedInsideElements()
			],
			rootAncestorComboboxDomReference,
			resolveRef(previousFocusableElement),
			resolveRef(nextFocusableElement),
			isUntrappedTypeableCombobox ? domReference : null
		].filter((x) => x != null), {
			ariaHidden: modal || isUntrappedTypeableCombobox,
			mark: false
		});
		const markerCleanup = markOthers([floating, ...portalNodes].filter((x) => x != null));
		return () => {
			markerCleanup();
			ariaHiddenCleanup();
		};
	}, [
		open,
		disabled,
		domReference,
		floating,
		modal,
		portalContext,
		isUntrappedTypeableCombobox,
		tree,
		getNodeId,
		nextFocusableElement,
		previousFocusableElement,
		getResolvedInsideElements
	]);
	useIsoLayoutEffect(() => {
		if (!open || disabled || !isHTMLElement(floatingFocusElement)) return;
		closeTypeRef.current = "";
		lastInteractionTypeRef.current = "";
		const doc = ownerDocument(floatingFocusElement);
		const previouslyFocusedElement = activeElement(doc);
		queueMicrotask(() => {
			const initialFocusValueOrFn = initialFocusRef.current;
			const resolvedInitialFocus = typeof initialFocusValueOrFn === "function" ? initialFocusValueOrFn(openInteractionTypeRef.current || "") : initialFocusValueOrFn;
			if (resolvedInitialFocus === void 0 || resolvedInitialFocus === false) return;
			if (contains(floatingFocusElement, previouslyFocusedElement)) return;
			let focusableElements = null;
			const getDefaultFocusElement = () => {
				if (focusableElements == null) focusableElements = getTabbableContent(floatingFocusElement);
				return focusableElements[0] || floatingFocusElement;
			};
			let elToFocus;
			if (resolvedInitialFocus === true || resolvedInitialFocus === null) elToFocus = getDefaultFocusElement();
			else elToFocus = resolveRef(resolvedInitialFocus);
			elToFocus = elToFocus || getDefaultFocusElement();
			const hadFocusInside = contains(floatingFocusElement, activeElement(doc));
			enqueueFocus(elToFocus, {
				preventScroll: elToFocus === floatingFocusElement,
				shouldFocus() {
					if (!openRef.current) return false;
					if (hadFocusInside) return true;
					const currentActiveElement = activeElement(doc);
					return !(currentActiveElement !== elToFocus && contains(floatingFocusElement, currentActiveElement));
				}
			});
		});
	}, [
		disabled,
		open,
		floatingFocusElement,
		getTabbableContent,
		initialFocusRef,
		openInteractionTypeRef,
		openRef
	]);
	useIsoLayoutEffect(() => {
		if (disabled || !floatingFocusElement) return;
		const doc = ownerDocument(floatingFocusElement);
		const elementFocusedBeforeOpen = activeElement(doc);
		const preferPreviousFocus = openInteractionTypeRef.current == null;
		addPreviouslyFocusedElement(elementFocusedBeforeOpen);
		function onOpenChangeLocal(details) {
			if (!details.open) closeTypeRef.current = getEventType(details.nativeEvent, lastInteractionTypeRef.current);
			if (details.reason === "trigger-hover" && details.nativeEvent.type === "mouseleave") preventReturnFocusRef.current = true;
			if (details.reason !== "outside-press") return;
			if (details.nested) preventReturnFocusRef.current = false;
			else if (isVirtualClick(details.nativeEvent) || isVirtualPointerEvent(details.nativeEvent)) preventReturnFocusRef.current = false;
			else {
				let isPreventScrollSupported = false;
				ownerDocument(floatingFocusElement).createElement("div").focus({ get preventScroll() {
					isPreventScrollSupported = true;
					return false;
				} });
				if (isPreventScrollSupported) preventReturnFocusRef.current = false;
				else preventReturnFocusRef.current = true;
			}
		}
		events.on("openchange", onOpenChangeLocal);
		function getReturnElement(closeType) {
			const returnFocusValueOrFn = returnFocusRef.current;
			let resolvedReturnFocusValue = typeof returnFocusValueOrFn === "function" ? returnFocusValueOrFn(closeType) : returnFocusValueOrFn;
			if (resolvedReturnFocusValue === void 0 || resolvedReturnFocusValue === false) return null;
			if (resolvedReturnFocusValue === null) resolvedReturnFocusValue = true;
			const referenceReturnElement = domReference?.isConnected ? domReference : null;
			const previousReturnElement = elementFocusedBeforeOpen?.isConnected && getNodeName(elementFocusedBeforeOpen) !== "body" ? elementFocusedBeforeOpen : null;
			let defaultReturnElement = preferPreviousFocus ? previousReturnElement || referenceReturnElement : referenceReturnElement || previousReturnElement;
			if (!defaultReturnElement) defaultReturnElement = getPreviouslyFocusedElement() || null;
			if (typeof resolvedReturnFocusValue === "boolean") return defaultReturnElement;
			return resolveRef(resolvedReturnFocusValue) || defaultReturnElement || null;
		}
		return () => {
			events.off("openchange", onOpenChangeLocal);
			const activeEl = activeElement(doc);
			const insideElements = getResolvedInsideElements();
			const isFocusInsideFloatingTree = contains(floating, activeEl) || insideElements.some((element) => element === activeEl || contains(element, activeEl)) || tree && getNodeChildren(tree.nodesRef.current, getNodeId(), false).some((node) => contains(node.context?.elements.floating, activeEl));
			const returnFocusValueOrFn = returnFocusRef.current;
			const closeType = closeTypeRef.current;
			const returnElement = getReturnElement(closeType);
			queueMicrotask(() => {
				const tabbableReturnElement = getFirstTabbableElement(returnElement);
				const hasExplicitReturnFocus = typeof returnFocusValueOrFn !== "boolean";
				if (returnFocusValueOrFn && !preventReturnFocusRef.current && isHTMLElement(tabbableReturnElement) && (!hasExplicitReturnFocus && tabbableReturnElement !== activeEl && activeEl !== doc.body ? isFocusInsideFloatingTree : true)) {
					const focusOptions = { preventScroll: true };
					if (closeType === "keyboard") focusOptions.focusVisible = true;
					tabbableReturnElement.focus(focusOptions);
				}
				preventReturnFocusRef.current = false;
			});
		};
	}, [
		disabled,
		floating,
		floatingFocusElement,
		returnFocusRef,
		openInteractionTypeRef,
		events,
		tree,
		domReference,
		getNodeId,
		getResolvedInsideElements
	]);
	useIsoLayoutEffect(() => {
		if (!webkit || open || !floating) return;
		const activeEl = activeElement(ownerDocument(floating));
		if (!isHTMLElement(activeEl) || !isTypeableElement(activeEl)) return;
		if (contains(floating, activeEl)) activeEl.blur();
	}, [open, floating]);
	useIsoLayoutEffect(() => {
		if (disabled || !portalContext) return;
		portalContext.setFocusManagerState({
			modal,
			closeOnFocusOut,
			open,
			onOpenChange: store.setOpen,
			domReference
		});
		return () => {
			portalContext.setFocusManagerState(null);
		};
	}, [
		disabled,
		portalContext,
		modal,
		open,
		store,
		closeOnFocusOut,
		domReference
	]);
	useIsoLayoutEffect(() => {
		if (disabled || !floatingFocusElement) return;
		handleTabIndex(floatingFocusElement);
		return () => {
			queueMicrotask(clearDisconnectedPreviouslyFocusedElements);
		};
	}, [disabled, floatingFocusElement]);
	const shouldRenderGuards = !disabled && (modal ? !isUntrappedTypeableCombobox : true) && (isInsidePortal || modal);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
		shouldRenderGuards && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusGuard, {
			"data-type": "inside",
			ref: mergedBeforeGuardRef,
			onFocus: (event) => {
				if (modal) {
					const els = getTabbableContent();
					enqueueFocus(els[els.length - 1]);
				} else if (portalContext?.portalNode) {
					preventReturnFocusRef.current = false;
					if (isOutsideEvent(event, portalContext.portalNode)) getNextTabbable(domReference)?.focus();
					else resolveRef(previousFocusableElement ?? portalContext.beforeOutsideRef)?.focus();
				}
			}
		}),
		children,
		shouldRenderGuards && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusGuard, {
			"data-type": "inside",
			ref: mergedAfterGuardRef,
			onFocus: (event) => {
				if (modal) enqueueFocus(getTabbableContent()[0]);
				else if (portalContext?.portalNode) {
					if (closeOnFocusOut) preventReturnFocusRef.current = true;
					if (isOutsideEvent(event, portalContext.portalNode)) getPreviousTabbable(domReference)?.focus();
					else resolveRef(nextFocusableElement ?? portalContext.afterOutsideRef)?.focus();
				}
			}
		})
	] });
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/floating-ui-react/hooks/useClick.mjs
/**
* Opens or closes the floating element when clicking the reference element.
* @see https://floating-ui.com/docs/useClick
*/
function useClick(context, props = {}) {
	const { enabled = true, event: eventOption = "click", toggle = true, ignoreMouse = false, stickIfOpen = true, touchOpenDelay = 0, reason = triggerPress } = props;
	const store = "rootStore" in context ? context.rootStore : context;
	const dataRef = store.context.dataRef;
	const pointerTypeRef = import_react.useRef(void 0);
	const frame = useAnimationFrame();
	const touchOpenTimeout = useTimeout();
	const reference = import_react.useMemo(() => {
		function setOpenWithTouchDelay(nextOpen, nativeEvent, target, pointerType) {
			const details = createChangeEventDetails(reason, nativeEvent, target);
			if (nextOpen && pointerType === "touch" && touchOpenDelay > 0) touchOpenTimeout.start(touchOpenDelay, () => {
				store.setOpen(true, details);
			});
			else store.setOpen(nextOpen, details);
		}
		function getNextOpen(open, currentTarget, isClickLikeOpenEvent) {
			const openEvent = dataRef.current.openEvent;
			const hasClickedOnInactiveTrigger = store.select("domReferenceElement") !== currentTarget;
			if (open && hasClickedOnInactiveTrigger) return true;
			if (!open) return true;
			if (!toggle) return true;
			if (openEvent && stickIfOpen) return !isClickLikeOpenEvent(openEvent.type);
			return false;
		}
		return {
			onPointerDown(event) {
				pointerTypeRef.current = isMouseLikePointerType(event.pointerType, true) && isVirtualPointerEvent(event.nativeEvent) ? "virtual" : event.pointerType;
			},
			onMouseDown(event) {
				const pointerType = pointerTypeRef.current;
				const nativeEvent = event.nativeEvent;
				const open = store.select("open");
				if (event.button !== 0 || eventOption === "click" || isMouseLikePointerType(pointerType, true) && ignoreMouse) return;
				const nextOpen = getNextOpen(open, event.currentTarget, (openEventType) => openEventType === "click" || openEventType === "mousedown");
				const target = getTarget(nativeEvent);
				if (isTypeableElement(target)) {
					setOpenWithTouchDelay(nextOpen, nativeEvent, target, pointerType);
					return;
				}
				const eventCurrentTarget = event.currentTarget;
				frame.request(() => {
					setOpenWithTouchDelay(nextOpen, nativeEvent, eventCurrentTarget, pointerType);
				});
			},
			onClick(event) {
				if (eventOption === "mousedown-only") return;
				const pointerType = pointerTypeRef.current;
				if (eventOption === "mousedown" && pointerType) {
					pointerTypeRef.current = void 0;
					return;
				}
				if (isMouseLikePointerType(pointerType, true) && ignoreMouse) return;
				setOpenWithTouchDelay(getNextOpen(store.select("open"), event.currentTarget, (openEventType) => openEventType === "click" || openEventType === "mousedown" || openEventType === "keydown" || openEventType === "keyup"), event.nativeEvent, event.currentTarget, pointerType);
			},
			onKeyDown() {
				pointerTypeRef.current = void 0;
			}
		};
	}, [
		dataRef,
		eventOption,
		ignoreMouse,
		reason,
		store,
		stickIfOpen,
		toggle,
		frame,
		touchOpenTimeout,
		touchOpenDelay
	]);
	return import_react.useMemo(() => enabled ? { reference } : EMPTY_OBJECT, [enabled, reference]);
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/floating-ui-react/hooks/useListNavigation.mjs
const ESCAPE = "Escape";
function isStationaryWebKitPointer(event) {
	return webkit && event.movementX === 0 && event.movementY === 0;
}
function doSwitch(orientation, vertical, horizontal) {
	switch (orientation) {
		case "vertical": return vertical;
		case "horizontal": return horizontal;
		default: return vertical || horizontal;
	}
}
function isMainOrientationKey(key, orientation) {
	return doSwitch(orientation, key === "ArrowUp" || key === "ArrowDown", key === "ArrowLeft" || key === "ArrowRight");
}
function isMainOrientationToEndKey(key, orientation, rtl) {
	return doSwitch(orientation, key === "ArrowDown", rtl ? key === "ArrowLeft" : key === "ArrowRight") || key === "Enter" || key === " " || key === "";
}
function isCrossOrientationOpenKey(key, orientation, rtl) {
	return doSwitch(orientation, rtl ? key === ARROW_LEFT$1 : key === ARROW_RIGHT$1, key === ARROW_DOWN$1);
}
function isCrossOrientationCloseKey(key, orientation, rtl, grid) {
	const vertical = rtl ? key === ARROW_RIGHT$1 : key === ARROW_LEFT$1;
	const horizontal = key === ARROW_UP$1;
	if (orientation === "both" || orientation === "horizontal" && grid) return key === ESCAPE;
	return doSwitch(orientation, vertical, horizontal);
}
/**
* Adds arrow key-based navigation of a list of items, either using real DOM
* focus or virtual focus.
* @see https://floating-ui.com/docs/useListNavigation
*/
function useListNavigation(context, props) {
	const { listRef, activeIndex, onNavigate: onNavigateProp = () => {}, enabled = true, selectedIndex = null, allowEscape = false, loopFocus = false, nested = false, rtl = false, virtual = false, focusItemOnOpen = "auto", focusItemOnHover = true, openOnArrowKeyDown = true, disabledIndices = void 0, orientation = "vertical", parentOrientation, id, resetOnPointerLeave = true, externalTree, grid: navigateGrid } = props;
	const isGrid = navigateGrid != null;
	const store = "rootStore" in context ? context.rootStore : context;
	const open = store.useState("open");
	const floatingElement = store.useState("floatingElement");
	const domReferenceElement = store.useState("domReferenceElement");
	const dataRef = store.context.dataRef;
	const floatingFocusElement = getFloatingFocusElement(floatingElement);
	const typeableComboboxReference = isTypeableCombobox(domReferenceElement);
	const floatingFocusElementRef = useValueAsRef(floatingFocusElement);
	const parentId = useFloatingParentNodeId();
	const tree = useFloatingTree(externalTree);
	const focusItemOnOpenRef = import_react.useRef(focusItemOnOpen);
	const indexRef = import_react.useRef(selectedIndex ?? -1);
	const keyRef = import_react.useRef(null);
	const isPointerModalityRef = import_react.useRef(true);
	const onNavigate = useStableCallback((event) => {
		onNavigateProp(indexRef.current === -1 ? null : indexRef.current, event);
	});
	const previousMountedRef = import_react.useRef(!!floatingElement);
	const previousOpenRef = import_react.useRef(open);
	const forceSyncFocusRef = import_react.useRef(false);
	const forceScrollIntoViewRef = import_react.useRef(false);
	const cancelQueuedFocusRef = import_react.useRef(null);
	const disabledIndicesRef = useValueAsRef(disabledIndices);
	const latestOpenRef = useValueAsRef(open);
	const selectedIndexRef = useValueAsRef(selectedIndex);
	const resetOnPointerLeaveRef = useValueAsRef(resetOnPointerLeave);
	const focusFrame = useAnimationFrame();
	const waitForListPopulatedFrame = useAnimationFrame();
	const focusItem = useStableCallback(() => {
		function runFocus(item) {
			if (virtual) tree?.events.emit("virtualfocus", item);
			else cancelQueuedFocusRef.current = enqueueFocus(item, {
				sync: forceSyncFocusRef.current,
				preventScroll: true
			});
		}
		const initialItem = listRef.current[indexRef.current];
		const forceScrollIntoView = forceScrollIntoViewRef.current;
		if (initialItem) runFocus(initialItem);
		(forceSyncFocusRef.current ? (callback) => callback() : (callback) => focusFrame.request(callback))(() => {
			const waitedItem = listRef.current[indexRef.current] || initialItem;
			if (!waitedItem) return;
			if (!initialItem) runFocus(waitedItem);
			if (item && (forceScrollIntoView || !isPointerModalityRef.current)) waitedItem.scrollIntoView?.({
				block: "nearest",
				inline: "nearest"
			});
		});
	});
	useIsoLayoutEffect(() => {
		dataRef.current.orientation = orientation;
	}, [dataRef, orientation]);
	useIsoLayoutEffect(() => {
		if (!enabled) return;
		if (open && floatingElement) {
			indexRef.current = selectedIndex ?? -1;
			if (focusItemOnOpenRef.current && selectedIndex != null) {
				forceScrollIntoViewRef.current = true;
				onNavigate();
			}
		} else if (previousMountedRef.current) {
			indexRef.current = -1;
			onNavigate();
		}
	}, [
		enabled,
		open,
		floatingElement,
		selectedIndex,
		onNavigate
	]);
	useIsoLayoutEffect(() => {
		if (!enabled) return;
		if (!open) {
			forceSyncFocusRef.current = false;
			return;
		}
		if (!floatingElement) return;
		if (activeIndex == null) {
			forceSyncFocusRef.current = false;
			if (selectedIndexRef.current != null) return;
			if (previousMountedRef.current) {
				indexRef.current = -1;
				focusItem();
			}
			if ((!previousOpenRef.current || !previousMountedRef.current) && focusItemOnOpenRef.current && (keyRef.current != null || focusItemOnOpenRef.current === true && keyRef.current == null)) {
				let runs = 0;
				const waitForListPopulated = () => {
					if (listRef.current[0] == null) {
						if (runs < 2) (runs ? (callback) => waitForListPopulatedFrame.request(callback) : queueMicrotask)(waitForListPopulated);
						runs += 1;
					} else {
						indexRef.current = keyRef.current == null || isMainOrientationToEndKey(keyRef.current, orientation, rtl) || nested ? getMinListIndex(listRef) : getMaxListIndex(listRef);
						keyRef.current = null;
						onNavigate();
					}
				};
				waitForListPopulated();
			}
		} else if (!isIndexOutOfListBounds(listRef.current, activeIndex)) {
			indexRef.current = activeIndex;
			focusItem();
			forceScrollIntoViewRef.current = false;
		}
	}, [
		enabled,
		open,
		floatingElement,
		activeIndex,
		selectedIndexRef,
		nested,
		listRef,
		orientation,
		rtl,
		onNavigate,
		focusItem,
		waitForListPopulatedFrame
	]);
	useIsoLayoutEffect(() => {
		if (!enabled || floatingElement || !tree || virtual || !previousMountedRef.current) return;
		const nodes = tree.nodesRef.current;
		const parent = nodes.find((node) => node.id === parentId)?.context?.elements.floating;
		const activeEl = activeElement(ownerDocument(domReferenceElement ?? parent ?? null));
		const treeContainsActiveEl = nodes.some((node) => node.context && contains(node.context.elements.floating, activeEl));
		if (parent && !treeContainsActiveEl && isPointerModalityRef.current) parent.focus({ preventScroll: true });
	}, [
		enabled,
		floatingElement,
		domReferenceElement,
		tree,
		parentId,
		virtual
	]);
	useIsoLayoutEffect(() => {
		previousOpenRef.current = open;
		previousMountedRef.current = !!floatingElement;
	});
	useIsoLayoutEffect(() => {
		if (!open) {
			keyRef.current = null;
			focusItemOnOpenRef.current = focusItemOnOpen;
		}
	}, [open, focusItemOnOpen]);
	const hasActiveIndex = activeIndex != null;
	const syncCurrentTarget = useStableCallback((event) => {
		if (!latestOpenRef.current) return;
		const index = listRef.current.indexOf(event.currentTarget);
		if (index !== -1 && (indexRef.current !== index || activeIndex !== index)) {
			indexRef.current = index;
			onNavigate(event);
		}
	});
	const getParentOrientation = useStableCallback(() => {
		return parentOrientation ?? tree?.nodesRef.current.find((node) => node.id === parentId)?.context?.dataRef?.current.orientation;
	});
	const getMinEnabledIndex = useStableCallback(() => {
		return getMinListIndex(listRef, disabledIndicesRef.current);
	});
	const commonOnKeyDown = useStableCallback((event) => {
		isPointerModalityRef.current = false;
		forceSyncFocusRef.current = true;
		if (event.which === 229) return;
		if (!latestOpenRef.current && event.currentTarget === floatingFocusElementRef.current) return;
		if (nested && isCrossOrientationCloseKey(event.key, orientation, rtl, isGrid)) {
			if (!isMainOrientationKey(event.key, getParentOrientation())) stopEvent(event);
			store.setOpen(false, createChangeEventDetails(listNavigation, event.nativeEvent));
			if (isHTMLElement(domReferenceElement)) {
				if (virtual) tree?.events.emit("virtualfocus", domReferenceElement);
				else domReferenceElement.focus();
			}
			return;
		}
		const currentIndex = indexRef.current;
		const minIndex = getMinListIndex(listRef, disabledIndices);
		const maxIndex = getMaxListIndex(listRef, disabledIndices);
		if (!typeableComboboxReference) {
			if (event.key === "Home") {
				stopEvent(event);
				indexRef.current = minIndex;
				onNavigate(event);
			}
			if (event.key === "End") {
				stopEvent(event);
				indexRef.current = maxIndex;
				onNavigate(event);
			}
		}
		if (navigateGrid != null) {
			const index = navigateGrid(event, indexRef.current, listRef, orientation, loopFocus, rtl, disabledIndices, minIndex, maxIndex);
			if (index != null) {
				indexRef.current = index;
				onNavigate(event);
			}
			if (orientation === "both") return;
		}
		if (isMainOrientationKey(event.key, orientation)) {
			stopEvent(event);
			if (open && !virtual && activeElement(event.currentTarget.ownerDocument) === event.currentTarget) {
				indexRef.current = isMainOrientationToEndKey(event.key, orientation, rtl) ? minIndex : maxIndex;
				onNavigate(event);
				return;
			}
			if (isMainOrientationToEndKey(event.key, orientation, rtl)) {
				if (loopFocus) {
					if (currentIndex >= maxIndex) {
						if (allowEscape && currentIndex !== listRef.current.length) indexRef.current = -1;
						else {
							forceSyncFocusRef.current = false;
							indexRef.current = minIndex;
						}
					} else indexRef.current = findNonDisabledListIndex(listRef.current, {
						startingIndex: currentIndex,
						disabledIndices
					});
				} else indexRef.current = Math.min(maxIndex, findNonDisabledListIndex(listRef.current, {
					startingIndex: currentIndex,
					disabledIndices
				}));
			} else if (loopFocus) {
				if (currentIndex <= minIndex) {
					if (allowEscape && currentIndex !== -1) indexRef.current = listRef.current.length;
					else {
						forceSyncFocusRef.current = false;
						indexRef.current = maxIndex;
					}
				} else indexRef.current = findNonDisabledListIndex(listRef.current, {
					startingIndex: currentIndex,
					decrement: true,
					disabledIndices
				});
			} else indexRef.current = Math.max(minIndex, findNonDisabledListIndex(listRef.current, {
				startingIndex: currentIndex,
				decrement: true,
				disabledIndices
			}));
			if (isIndexOutOfListBounds(listRef.current, indexRef.current)) indexRef.current = -1;
			onNavigate(event);
		}
	});
	const item = import_react.useMemo(() => {
		return {
			onFocus(event) {
				forceSyncFocusRef.current = true;
				syncCurrentTarget(event);
			},
			onClick: ({ currentTarget }) => currentTarget.focus({ preventScroll: true }),
			onMouseMove(event) {
				if (isStationaryWebKitPointer(event)) return;
				forceSyncFocusRef.current = true;
				forceScrollIntoViewRef.current = false;
				if (focusItemOnHover) syncCurrentTarget(event);
			},
			onPointerLeave(event) {
				if (!latestOpenRef.current || !isPointerModalityRef.current || event.pointerType === "touch") return;
				forceSyncFocusRef.current = true;
				const relatedTarget = event.relatedTarget;
				if (!focusItemOnHover || listRef.current.includes(relatedTarget)) return;
				if (!resetOnPointerLeaveRef.current) return;
				cancelQueuedFocusRef.current?.();
				cancelQueuedFocusRef.current = null;
				indexRef.current = -1;
				onNavigate(event);
				if (!virtual) {
					const floatingFocusEl = floatingFocusElementRef.current;
					const activeEl = activeElement(ownerDocument(floatingFocusEl));
					if (floatingFocusEl && contains(floatingFocusEl, activeEl)) floatingFocusEl.focus({ preventScroll: true });
				}
			}
		};
	}, [
		syncCurrentTarget,
		latestOpenRef,
		floatingFocusElementRef,
		focusItemOnHover,
		listRef,
		onNavigate,
		resetOnPointerLeaveRef,
		virtual
	]);
	const ariaActiveDescendantProp = import_react.useMemo(() => {
		return virtual && open && hasActiveIndex && { "aria-activedescendant": `${id}-${activeIndex}` };
	}, [
		virtual,
		open,
		hasActiveIndex,
		id,
		activeIndex
	]);
	const floating = import_react.useMemo(() => {
		return {
			...!typeableComboboxReference ? ariaActiveDescendantProp : {},
			onKeyDown(event) {
				if (event.key === "Tab" && event.shiftKey && open && !virtual) {
					const target = getTarget(event.nativeEvent);
					if (target && !contains(floatingFocusElementRef.current, target)) return;
					stopEvent(event);
					store.setOpen(false, createChangeEventDetails(focusOut, event.nativeEvent));
					if (isHTMLElement(domReferenceElement)) domReferenceElement.focus();
					return;
				}
				commonOnKeyDown(event);
			},
			onPointerMove(event) {
				if (isStationaryWebKitPointer(event)) return;
				isPointerModalityRef.current = true;
			}
		};
	}, [
		ariaActiveDescendantProp,
		commonOnKeyDown,
		floatingFocusElementRef,
		typeableComboboxReference,
		store,
		open,
		virtual,
		domReferenceElement
	]);
	const trigger = import_react.useMemo(() => {
		function openOnNavigationKeyDown(event) {
			store.setOpen(true, createChangeEventDetails(listNavigation, event.nativeEvent, event.currentTarget));
		}
		function checkVirtualMouse(event) {
			if (focusItemOnOpen === "auto" && isVirtualClick(event.nativeEvent)) focusItemOnOpenRef.current = !virtual;
		}
		function checkVirtualPointer(event) {
			focusItemOnOpenRef.current = focusItemOnOpen;
			if (focusItemOnOpen === "auto" && isVirtualPointerEvent(event.nativeEvent)) focusItemOnOpenRef.current = true;
		}
		return {
			onKeyDown(event) {
				const currentOpen = store.select("open");
				isPointerModalityRef.current = false;
				const isArrowKey = event.key.startsWith("Arrow");
				const isParentCrossOpenKey = isCrossOrientationOpenKey(event.key, getParentOrientation(), rtl);
				const isMainKey = isMainOrientationKey(event.key, orientation);
				const isNavigationKey = (nested ? isParentCrossOpenKey : isMainKey) || event.key === "Enter" || event.key.trim() === "";
				if (virtual && currentOpen) return commonOnKeyDown(event);
				if (!currentOpen && !openOnArrowKeyDown && isArrowKey) return;
				if (isNavigationKey) {
					const isParentMainKey = isMainOrientationKey(event.key, getParentOrientation());
					keyRef.current = nested && isParentMainKey ? null : event.key;
				}
				if (nested) {
					if (isParentCrossOpenKey) {
						stopEvent(event);
						if (currentOpen) {
							indexRef.current = getMinEnabledIndex();
							onNavigate(event);
						} else openOnNavigationKeyDown(event);
					}
					return;
				}
				if (isMainKey) {
					if (selectedIndexRef.current != null) indexRef.current = selectedIndexRef.current;
					stopEvent(event);
					if (!currentOpen && openOnArrowKeyDown) openOnNavigationKeyDown(event);
					else commonOnKeyDown(event);
					if (currentOpen) onNavigate(event);
				}
			},
			onFocus(event) {
				if (store.select("open") && !virtual) {
					indexRef.current = -1;
					onNavigate(event);
				}
			},
			onPointerDown: checkVirtualPointer,
			onPointerEnter: checkVirtualPointer,
			onMouseDown: checkVirtualMouse,
			onClick: checkVirtualMouse
		};
	}, [
		commonOnKeyDown,
		focusItemOnOpen,
		getMinEnabledIndex,
		nested,
		onNavigate,
		store,
		openOnArrowKeyDown,
		orientation,
		getParentOrientation,
		rtl,
		selectedIndexRef,
		virtual
	]);
	const reference = import_react.useMemo(() => {
		return {
			...ariaActiveDescendantProp,
			...trigger
		};
	}, [ariaActiveDescendantProp, trigger]);
	return import_react.useMemo(() => enabled ? {
		reference,
		floating,
		item,
		trigger
	} : {}, [
		enabled,
		reference,
		floating,
		trigger,
		item
	]);
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/floating-ui-react/hooks/useTypeahead.mjs
/**
* Provides a matching callback that can be used to focus an item as the user
* types, often used in tandem with `useListNavigation()`.
* @see https://floating-ui.com/docs/useTypeahead
*/
function useTypeahead(context, props) {
	const { listRef, elementsRef, activeIndex, onMatch: onMatchProp, disabledIndices, onTyping, enabled = true, resetMs = 750, selectedIndex = null } = props;
	const store = "rootStore" in context ? context.rootStore : context;
	const open = store.useState("open");
	const timeout = useTimeout();
	const stringRef = import_react.useRef("");
	const prevIndexRef = import_react.useRef(selectedIndex ?? activeIndex ?? -1);
	const matchIndexRef = import_react.useRef(null);
	const onKeyDown = useStableCallback((event) => {
		function getElement(index) {
			return elementsRef?.current[index];
		}
		function isItemAvailable(index) {
			const element = getElement(index);
			if (element && !isElementVisible(element) || element?.matches(":disabled")) return false;
			return disabledIndices == null || !isListIndexDisabled(EMPTY_ARRAY, index, disabledIndices);
		}
		function getMatchingIndex(list, string, startIndex = 0) {
			if (list.length === 0) return -1;
			const normalizedStartIndex = (startIndex % list.length + list.length) % list.length;
			const lowerString = string.toLowerCase();
			for (let offset = 0; offset < list.length; offset += 1) {
				const index = (normalizedStartIndex + offset) % list.length;
				if (!list[index]?.toLowerCase().startsWith(lowerString) || !isItemAvailable(index)) continue;
				return index;
			}
			return -1;
		}
		const listContent = listRef.current;
		if (stringRef.current.length > 0 && event.key === " ") {
			stopEvent(event);
			onTyping?.(true);
		}
		if (stringRef.current.length > 0 && stringRef.current[0] !== " ") {
			if (getMatchingIndex(listContent, stringRef.current) === -1 && event.key !== " ") onTyping?.(false);
		}
		if (listContent == null || event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
		if (open && event.key !== " ") {
			stopEvent(event);
			onTyping?.(true);
		}
		const isNewSession = stringRef.current === "";
		if (isNewSession) prevIndexRef.current = selectedIndex ?? activeIndex ?? -1;
		if (listContent.every((text, index) => text && isItemAvailable(index) ? text[0]?.toLowerCase() !== text[1]?.toLowerCase() : true) && stringRef.current === event.key) {
			stringRef.current = "";
			prevIndexRef.current = matchIndexRef.current;
		}
		stringRef.current += event.key;
		timeout.start(resetMs, () => {
			stringRef.current = "";
			prevIndexRef.current = matchIndexRef.current;
			onTyping?.(false);
		});
		const startIndex = ((isNewSession ? selectedIndex ?? activeIndex ?? -1 : prevIndexRef.current) ?? 0) + 1;
		const index = getMatchingIndex(listContent, stringRef.current, startIndex);
		if (index !== -1) {
			onMatchProp?.(index);
			matchIndexRef.current = index;
		} else if (event.key !== " ") {
			stringRef.current = "";
			onTyping?.(false);
		}
	});
	const onBlur = useStableCallback((event) => {
		const next = event.relatedTarget;
		const currentDomReferenceElement = store.select("domReferenceElement");
		const currentFloatingElement = store.select("floatingElement");
		if (contains(currentDomReferenceElement, next) || contains(currentFloatingElement, next)) return;
		timeout.clear();
		stringRef.current = "";
		prevIndexRef.current = matchIndexRef.current;
		onTyping?.(false);
	});
	useIsoLayoutEffect(() => {
		if (!open && selectedIndex !== null) return;
		timeout.clear();
		matchIndexRef.current = null;
		if (stringRef.current !== "") stringRef.current = "";
	}, [
		open,
		selectedIndex,
		timeout
	]);
	const sharedProps = import_react.useMemo(() => ({
		onKeyDown,
		onBlur
	}), [onKeyDown, onBlur]);
	return import_react.useMemo(() => enabled ? {
		reference: sharedProps,
		floating: sharedProps
	} : {}, [enabled, sharedProps]);
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/dialog/portal/DialogPortalContext.mjs
const DialogPortalContext = /*#__PURE__*/ import_react.createContext(void 0);
function useDialogPortalContext() {
	const value = import_react.useContext(DialogPortalContext);
	if (value === void 0) throw new Error(formatErrorMessage(26));
	return value;
}
const COMPOSITE_KEYS = /* @__PURE__ */ new Set([
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"Home",
	"End"
]);
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/dialog/popup/DialogPopupCssVars.mjs
/**
* Indicates how many dialogs are nested within.
* @type {number}
*/
const nestedDialogs = "--nested-dialogs";
/**
* Present when the dialog has other open dialogs nested within it.
*/
const nestedDialogOpen = "data-nested-dialog-open";
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/dialog/utils/stateAttributesMapping.mjs
/**
* Shared by `Dialog.Popup` and `Dialog.Viewport`, whose states have the same shape.
* `nested` is not mapped: unmapped `true` booleans already render as `data-nested`.
*/
const dialogStateAttributesMapping = {
	...popupStateMapping,
	...transitionStatusMapping,
	nestedDialogOpen(value) {
		return value ? { [nestedDialogOpen]: "" } : null;
	}
};
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/dialog/popup/DialogPopup.mjs
/**
* A container for the dialog contents.
* Renders a `<div>` element.
*
* Documentation: [Base UI Dialog](https://base-ui.com/react/components/dialog)
*/
const DialogPopup = /*#__PURE__*/ import_react.forwardRef(function DialogPopup(componentProps, forwardedRef) {
	const { render, className, style, finalFocus, initialFocus, ...elementProps } = componentProps;
	const store = useDialogRootContext();
	const descriptionElementId = store.useState("descriptionElementId");
	const disablePointerDismissal = store.useState("disablePointerDismissal");
	const floatingRootContext = store.useState("floatingRootContext");
	const rootPopupProps = store.useState("popupProps");
	const modal = store.useState("modal");
	const mounted = store.useState("mounted");
	const nested = store.useState("nested");
	const nestedOpenDialogCount = store.useState("nestedOpenDialogCount");
	const open = store.useState("open");
	const openMethod = store.useState("openMethod");
	const titleElementId = store.useState("titleElementId");
	const transitionStatus = store.useState("transitionStatus");
	const role = store.useState("role");
	const floatingId = floatingRootContext.useState("floatingId");
	useDialogPortalContext();
	useOpenChangeComplete({
		open,
		ref: store.context.popupRef,
		onComplete() {
			if (open) store.context.onOpenChangeComplete?.(true);
		}
	});
	const resolvedInitialFocus = initialFocus === void 0 ? createDefaultInitialFocus(store.context.popupRef) : initialFocus;
	const nestedDialogOpen = nestedOpenDialogCount > 0;
	const setPopupElement = store.useStateSetter("popupElement");
	const element = useRenderElement("div", componentProps, {
		state: {
			open,
			nested,
			transitionStatus,
			nestedDialogOpen
		},
		props: [
			rootPopupProps,
			{
				id: floatingId,
				"aria-labelledby": titleElementId,
				"aria-describedby": descriptionElementId,
				role,
				...FOCUSABLE_POPUP_PROPS,
				hidden: !mounted,
				onKeyDown(event) {
					if (COMPOSITE_KEYS.has(event.key)) event.stopPropagation();
				},
				style: { [nestedDialogs]: nestedOpenDialogCount }
			},
			elementProps
		],
		ref: [
			forwardedRef,
			store.context.popupRef,
			setPopupElement
		],
		stateAttributesMapping: dialogStateAttributesMapping
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingFocusManager, {
		context: floatingRootContext,
		openInteractionType: openMethod,
		disabled: !mounted,
		closeOnFocusOut: !disablePointerDismissal,
		initialFocus: resolvedInitialFocus,
		returnFocus: finalFocus,
		modal: modal !== false,
		restoreFocus: "popup",
		children: element
	});
});
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.4.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/utils/inertValue.mjs
function inertValue(value) {
	if (isReactVersionAtLeast(19)) return value;
	return value ? "true" : void 0;
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/utils/InternalBackdrop.mjs
/**
* @internal
*/
const InternalBackdrop = /*#__PURE__*/ import_react.forwardRef(function InternalBackdrop(props, ref) {
	const { cutout, ...otherProps } = props;
	let clipPath;
	if (cutout) {
		const rect = cutout.getBoundingClientRect();
		clipPath = `polygon(0% 0%,100% 0%,100% 100%,0% 100%,0% 0%,${rect.left}px ${rect.top}px,${rect.left}px ${rect.bottom}px,${rect.right}px ${rect.bottom}px,${rect.right}px ${rect.top}px,${rect.left}px ${rect.top}px)`;
	}
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)("div", {
		ref,
		role: "presentation",
		"data-base-ui-inert": "",
		...otherProps,
		style: {
			position: "fixed",
			inset: 0,
			userSelect: "none",
			WebkitUserSelect: "none",
			clipPath
		}
	});
});
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/dialog/portal/DialogPortal.mjs
/**
* A portal element that moves the popup to a different part of the DOM.
* By default, the portal element is appended to `<body>`.
* Renders a `<div>` element.
*
* Documentation: [Base UI Dialog](https://base-ui.com/react/components/dialog)
*/
const DialogPortal = /*#__PURE__*/ import_react.forwardRef(function DialogPortal(props, forwardedRef) {
	const { keepMounted = false, ...portalProps } = props;
	const store = useDialogRootContext();
	const mounted = store.useState("mounted");
	const modal = store.useState("modal");
	const open = store.useState("open");
	if (!(mounted || keepMounted)) return null;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(DialogPortalContext.Provider, {
		value: keepMounted,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(FloatingPortal, {
			ref: forwardedRef,
			...portalProps,
			children: [mounted && modal === true && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(InternalBackdrop, {
				ref: store.context.internalBackdropRef,
				inert: inertValue(!open)
			}), props.children]
		})
	});
});
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.4.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/utils/useScrollLock.mjs
let originalHtmlStyles = {};
let originalBodyStyles = {};
let originalHtmlScrollBehavior = "";
function getViewportScroller(html, body) {
	return isOverflowElement(html) ? html : body;
}
function isPageScrollLocked(win, html, body) {
	return /hidden|clip/.test(win.getComputedStyle(getViewportScroller(html, body)).overflowY);
}
function hasInsetScrollbars(referenceElement) {
	if (typeof document === "undefined") return false;
	const doc = ownerDocument(referenceElement);
	return getWindow(doc).innerWidth - doc.documentElement.clientWidth > 0;
}
function supportsStableScrollbarGutter(referenceElement) {
	if (!(typeof CSS !== "undefined" && CSS.supports && CSS.supports("scrollbar-gutter", "stable")) || typeof document === "undefined") return false;
	const doc = ownerDocument(referenceElement);
	const html = doc.documentElement;
	const body = doc.body;
	const scrollContainer = getViewportScroller(html, body);
	const originalScrollContainerOverflowY = scrollContainer.style.overflowY;
	const originalHtmlStyleGutter = html.style.scrollbarGutter;
	html.style.scrollbarGutter = "stable";
	scrollContainer.style.overflowY = "scroll";
	const before = scrollContainer.offsetWidth;
	scrollContainer.style.overflowY = "hidden";
	const after = scrollContainer.offsetWidth;
	scrollContainer.style.overflowY = originalScrollContainerOverflowY;
	html.style.scrollbarGutter = originalHtmlStyleGutter;
	return before === after;
}
function preventScrollOverlayScrollbars(referenceElement) {
	const doc = ownerDocument(referenceElement);
	const html = doc.documentElement;
	const body = doc.body;
	const elementToLock = getViewportScroller(html, body);
	const originalElementToLockStyles = {
		overflowY: elementToLock.style.overflowY,
		overflowX: elementToLock.style.overflowX
	};
	Object.assign(elementToLock.style, {
		overflowY: "hidden",
		overflowX: "hidden"
	});
	return () => {
		Object.assign(elementToLock.style, originalElementToLockStyles);
	};
}
function preventScrollInsetScrollbars(referenceElement) {
	const doc = ownerDocument(referenceElement);
	const html = doc.documentElement;
	const body = doc.body;
	const win = getWindow(html);
	let scrollTop = 0;
	let scrollLeft = 0;
	let updateGutterOnly = false;
	const resizeFrame = AnimationFrame.create();
	if (webkit && (win.visualViewport?.scale ?? 1) !== 1) return () => {};
	function lockScroll() {
		const htmlStyles = win.getComputedStyle(html);
		const bodyStyles = win.getComputedStyle(body);
		const scrollbarGutterValue = (htmlStyles.scrollbarGutter || "").includes("both-edges") ? "stable both-edges" : "stable";
		scrollTop = html.scrollTop;
		scrollLeft = html.scrollLeft;
		originalHtmlStyles = {
			scrollbarGutter: html.style.scrollbarGutter,
			overflowY: html.style.overflowY,
			overflowX: html.style.overflowX
		};
		originalHtmlScrollBehavior = html.style.scrollBehavior;
		originalBodyStyles = {
			position: body.style.position,
			height: body.style.height,
			width: body.style.width,
			boxSizing: body.style.boxSizing,
			overflowY: body.style.overflowY,
			overflowX: body.style.overflowX,
			scrollBehavior: body.style.scrollBehavior
		};
		const isScrollableY = html.scrollHeight > html.clientHeight;
		const isScrollableX = html.scrollWidth > html.clientWidth;
		const hasConstantOverflowY = htmlStyles.overflowY === "scroll" || bodyStyles.overflowY === "scroll";
		const hasConstantOverflowX = htmlStyles.overflowX === "scroll" || bodyStyles.overflowX === "scroll";
		const scrollbarWidth = Math.max(0, win.innerWidth - body.clientWidth);
		const scrollbarHeight = Math.max(0, win.innerHeight - body.clientHeight);
		const marginY = parseFloat(bodyStyles.marginTop) + parseFloat(bodyStyles.marginBottom);
		const marginX = parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight);
		const elementToLock = getViewportScroller(html, body);
		updateGutterOnly = supportsStableScrollbarGutter(referenceElement);
		if (updateGutterOnly) {
			html.style.scrollbarGutter = scrollbarGutterValue;
			elementToLock.style.overflowY = "hidden";
			elementToLock.style.overflowX = "hidden";
			return;
		}
		Object.assign(html.style, {
			scrollbarGutter: scrollbarGutterValue,
			overflowY: "hidden",
			overflowX: "hidden"
		});
		if (isScrollableY || hasConstantOverflowY) html.style.overflowY = "scroll";
		if (isScrollableX || hasConstantOverflowX) html.style.overflowX = "scroll";
		Object.assign(body.style, {
			position: "relative",
			height: marginY || scrollbarHeight ? `calc(100dvh - ${marginY + scrollbarHeight}px)` : "100dvh",
			width: marginX || scrollbarWidth ? `calc(100vw - ${marginX + scrollbarWidth}px)` : "100vw",
			boxSizing: "border-box",
			overflowY: "hidden",
			overflowX: "hidden",
			scrollBehavior: "unset"
		});
		body.scrollTop = scrollTop;
		body.scrollLeft = scrollLeft;
		html.setAttribute("data-base-ui-scroll-locked", "");
		html.style.scrollBehavior = "unset";
	}
	function cleanup() {
		Object.assign(html.style, originalHtmlStyles);
		Object.assign(body.style, originalBodyStyles);
		if (!updateGutterOnly) {
			html.scrollTop = scrollTop;
			html.scrollLeft = scrollLeft;
			html.removeAttribute("data-base-ui-scroll-locked");
			html.style.scrollBehavior = originalHtmlScrollBehavior;
		}
	}
	function handleResize() {
		cleanup();
		resizeFrame.request(lockScroll);
	}
	lockScroll();
	const unsubscribeResize = addEventListener(win, "resize", handleResize);
	return () => {
		resizeFrame.cancel();
		cleanup();
		if (typeof win.removeEventListener === "function") unsubscribeResize();
	};
}
var ScrollLocker = class {
	lockCount = 0;
	restore = null;
	timeoutLock = Timeout.create();
	timeoutUnlock = Timeout.create();
	acquire(referenceElement) {
		this.lockCount += 1;
		if (this.lockCount === 1 && this.restore === null) this.timeoutLock.start(0, () => this.lock(referenceElement));
		return this.release;
	}
	release = () => {
		this.lockCount -= 1;
		if (this.lockCount === 0 && this.restore) this.timeoutUnlock.start(0, this.unlock);
	};
	unlock = () => {
		if (this.lockCount === 0 && this.restore) {
			this.restore?.();
			this.restore = null;
		}
	};
	lock(referenceElement) {
		if (this.lockCount === 0 || this.restore !== null) return;
		const doc = ownerDocument(referenceElement);
		const html = doc.documentElement;
		const body = doc.body;
		const win = getWindow(html);
		if (isPageScrollLocked(win, html, body)) {
			const observer = new win.MutationObserver(() => {
				if (isPageScrollLocked(win, html, body)) return;
				observer.disconnect();
				this.restore = null;
				this.lock(referenceElement);
			});
			const options = { attributes: true };
			observer.observe(html, options);
			observer.observe(body, options);
			this.restore = () => observer.disconnect();
			return;
		}
		const hasOverlayScrollbars = ios || !hasInsetScrollbars(referenceElement);
		this.restore = hasOverlayScrollbars ? preventScrollOverlayScrollbars(referenceElement) : preventScrollInsetScrollbars(referenceElement);
	}
};
const SCROLL_LOCKER = new ScrollLocker();
/**
* Locks the scroll of the document when enabled.
*
* @param enabled - Whether to enable the scroll lock.
* @param referenceElement - Element to use as a reference for lock calculations.
*/
function useScrollLock(enabled = true, referenceElement = null) {
	useIsoLayoutEffect(() => {
		if (!enabled) return;
		return SCROLL_LOCKER.acquire(referenceElement);
	}, [enabled, referenceElement]);
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/dialog/root/useDialogRoot.mjs
function DialogInteractions({ store, parentContext, isDrawer }) {
	const open = store.useState("open");
	const disablePointerDismissal = store.useState("disablePointerDismissal");
	const modal = store.useState("modal");
	const popupElement = store.useState("popupElement");
	const floatingRootContext = store.useState("floatingRootContext");
	const [ownNestedOpenDialogs, setOwnNestedOpenDialogs] = import_react.useState(0);
	const [ownNestedOpenDrawers, setOwnNestedOpenDrawers] = import_react.useState(0);
	const isTopmost = ownNestedOpenDialogs === 0;
	const dismiss = useDismiss(floatingRootContext, {
		outsidePressEvent() {
			if (store.context.internalBackdropRef.current || store.context.backdropRef.current) return "intentional";
			return {
				mouse: modal === "trap-focus" ? "sloppy" : "intentional",
				touch: "sloppy"
			};
		},
		outsidePress(event) {
			if (!store.context.outsidePressEnabledRef.current) return false;
			if ("button" in event && event.button !== 0) return false;
			if ("touches" in event) {
				if (event.type === "touchend") {
					if (event.changedTouches.length !== 1 || event.touches.length !== 0) return false;
				} else if (event.touches.length !== 1) return false;
			}
			const target = getTarget(event);
			if (isTopmost && !disablePointerDismissal) {
				if (modal) {
					const internalBackdrop = store.context.internalBackdropRef.current;
					const backdrop = store.context.backdropRef.current;
					return internalBackdrop || backdrop ? internalBackdrop === target || backdrop === target || contains(target, popupElement) && !target?.hasAttribute("data-base-ui-portal") : true;
				}
				return true;
			}
			return false;
		},
		escapeKey: isTopmost
	});
	useScrollLock(open && modal === true, popupElement);
	store.useContextCallback("onNestedDialogOpen", (dialogCount, drawerCount) => {
		setOwnNestedOpenDialogs(dialogCount);
		setOwnNestedOpenDrawers(drawerCount);
	});
	useIsoLayoutEffect(() => {
		if (parentContext?.onNestedDialogOpen) {
			if (open) parentContext.onNestedDialogOpen(ownNestedOpenDialogs + 1, ownNestedOpenDrawers + (isDrawer ? 1 : 0));
			else parentContext.onNestedDialogOpen(0, 0);
		}
		return () => {
			if (parentContext?.onNestedDialogOpen && open) parentContext.onNestedDialogOpen(0, 0);
		};
	}, [
		isDrawer,
		open,
		ownNestedOpenDialogs,
		ownNestedOpenDrawers,
		parentContext
	]);
	usePopupInteractionProps(store, {
		activeTriggerProps: dismiss.reference,
		inactiveTriggerProps: dismiss.trigger,
		popupProps: dismiss.floating,
		nestedOpenDialogCount: ownNestedOpenDialogs,
		nestedOpenDrawerCount: ownNestedOpenDrawers
	});
	return null;
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/dialog/store/DialogStore.mjs
const selectors$1 = {
	...popupStoreSelectors,
	modal: (state) => state.modal,
	nested: (state) => state.nested,
	nestedOpenDialogCount: (state) => state.nestedOpenDialogCount,
	nestedOpenDrawerCount: (state) => state.nestedOpenDrawerCount,
	disablePointerDismissal: (state) => state.disablePointerDismissal,
	openMethod: (state) => state.openMethod,
	descriptionElementId: (state) => state.descriptionElementId,
	titleElementId: (state) => state.titleElementId,
	viewportElement: (state) => state.viewportElement,
	role: (state) => state.role
};
/**
* The subset of `DialogStore` that detached handle-backed triggers rely on. Both the real
* `DialogStore` and the inert fallback store satisfy it, so a trigger can read from whichever
* store the handle currently exposes.
*/
var DialogStore = class extends ReactStore {
	constructor(initialState, floatingId, nested) {
		const triggerElements = new PopupTriggerMap();
		const state = createInitialState$1(initialState, triggerElements, floatingId, nested);
		super(state, createInitialContext$1(triggerElements), selectors$1);
	}
	setOpen = (nextOpen, eventDetails) => {
		eventDetails.preventUnmountOnClose = () => {
			this.set("preventUnmountingOnClose", true);
		};
		if (!nextOpen && eventDetails.trigger == null && this.state.activeTriggerId != null) eventDetails.trigger = this.state.activeTriggerElement ?? void 0;
		this.context.onOpenChange?.(nextOpen, eventDetails);
		if (eventDetails.isCanceled) return;
		this.state.floatingRootContext.dispatchOpenChange(nextOpen, eventDetails);
		this.update(createPopupOpenState(this.state, nextOpen, eventDetails.trigger));
	};
};
function createInitialState$1(initialState, triggerElements, floatingId, nested = false) {
	return {
		...createInitialPopupStoreState(triggerElements, floatingId, nested),
		modal: true,
		disablePointerDismissal: false,
		viewportElement: null,
		descriptionElementId: void 0,
		titleElementId: void 0,
		openMethod: null,
		nested: false,
		nestedOpenDialogCount: 0,
		nestedOpenDrawerCount: 0,
		role: "dialog",
		...initialState
	};
}
function createInitialContext$1(triggerElements) {
	return {
		popupRef: /*#__PURE__*/ import_react.createRef(),
		backdropRef: /*#__PURE__*/ import_react.createRef(),
		internalBackdropRef: /*#__PURE__*/ import_react.createRef(),
		outsidePressEnabledRef: { current: true },
		triggerElements,
		onOpenChange: void 0,
		onOpenChangeComplete: void 0
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/dialog/root/useRenderDialogRoot.mjs
function useRenderDialogRoot(mode, props) {
	const { children, open: openProp, defaultOpen = false, onOpenChange, onOpenChangeComplete, disablePointerDismissal: disablePointerDismissalProp = false, modal: modalProp = true, actionsRef, handle, triggerId: triggerIdProp, defaultTriggerId: defaultTriggerIdProp = null } = props;
	const isDrawer = mode === "drawer";
	const isAlertDialog = mode === "alert-dialog";
	const modal = isAlertDialog ? true : modalProp;
	const disablePointerDismissal = isAlertDialog || disablePointerDismissalProp;
	const role = isAlertDialog ? "alertdialog" : "dialog";
	const parentStore = useDialogRootContext(true);
	const rootState = {
		modal,
		disablePointerDismissal,
		nested: parentStore != null,
		role
	};
	const store = usePopupRootStore((floatingId, floatingNested) => new DialogStore({
		open: defaultOpen,
		openProp,
		activeTriggerId: defaultTriggerIdProp,
		triggerIdProp,
		...rootState
	}, floatingId, floatingNested), true);
	store.useControlledProp("openProp", openProp);
	store.useControlledProp("triggerIdProp", triggerIdProp);
	store.useSyncedValues(rootState);
	store.useContextCallback("onOpenChange", onOpenChange);
	store.useContextCallback("onOpenChangeComplete", onOpenChangeComplete);
	const open = store.useState("open");
	const mounted = store.useState("mounted");
	const payload = store.useState("payload");
	usePopupRootSync(store, open);
	useImplicitActiveTrigger(store);
	const { forceUnmount } = useOpenStateTransitions(open, store);
	import_react.useImperativeHandle(actionsRef, () => ({
		unmount: forceUnmount,
		close: () => store.setOpen(false, createChangeEventDetails(imperativeAction))
	}), [forceUnmount, store]);
	const shouldRenderInteractions = open || mounted;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(DialogRootContext.Provider, {
		value: store,
		children: [
			handle && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(PopupHandleAttachment, {
				handle,
				store
			}),
			shouldRenderInteractions && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(DialogInteractions, {
				store,
				parentContext: parentStore?.context,
				isDrawer
			}),
			typeof children === "function" ? children({ payload }) : children
		]
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/dialog/root/DialogRoot.mjs
/**
* Groups all parts of the dialog.
* Doesn't render its own HTML element.
*
* Documentation: [Base UI Dialog](https://base-ui.com/react/components/dialog)
*/
const DialogRoot = fastComponent(function DialogRoot(props) {
	return useRenderDialogRoot("dialog", props);
});
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/dialog/title/DialogTitle.mjs
/**
* A heading that labels the dialog.
* Renders an `<h2>` element.
*
* Documentation: [Base UI Dialog](https://base-ui.com/react/components/dialog)
*/
const DialogTitle = /*#__PURE__*/ import_react.forwardRef(function DialogTitle(componentProps, forwardedRef) {
	const { render, className, style, id: idProp, ...elementProps } = componentProps;
	const store = useDialogRootContext();
	const id = useBaseUiId(idProp);
	store.useSyncedValueWithCleanup("titleElementId", id);
	return useRenderElement("h2", componentProps, {
		ref: forwardedRef,
		props: [{ id }, elementProps]
	});
});
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.4.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/utils/useEnhancedClickHandler.mjs
/**
* Provides a cross-browser way to determine the type of the pointer used to click.
* Safari and Firefox do not provide the PointerEvent to the click handler (they use MouseEvent) yet.
* Additionally, this implementation detects if the click was triggered by the keyboard.
*
* @param handler The function to be called when the button is clicked. The first parameter is the original event and the second parameter is the pointer type.
*/
function useEnhancedClickHandler(handler) {
	const lastClickInteractionTypeRef = import_react.useRef("");
	const handlePointerDown = import_react.useCallback((event) => {
		if (event.defaultPrevented) return;
		lastClickInteractionTypeRef.current = event.pointerType;
		handler(event, event.pointerType);
	}, [handler]);
	return {
		onClick: import_react.useCallback((event) => {
			if (event.detail === 0) {
				handler(event, "keyboard");
				return;
			}
			if ("pointerType" in event) handler(event, event.pointerType);
			else handler(event, lastClickInteractionTypeRef.current);
			lastClickInteractionTypeRef.current = "";
		}, [handler]),
		onPointerDown: handlePointerDown
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/internals/useValueChanged.mjs
function useValueChanged(value, onChange) {
	const valueRef = import_react.useRef(value);
	const onChangeCallback = useStableCallback(onChange);
	useIsoLayoutEffect(() => {
		if (valueRef.current !== value) onChangeCallback(valueRef.current);
		valueRef.current = value;
	}, [value, onChangeCallback]);
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/utils/useOpenInteractionType.mjs
function useOpenMethodTriggerProps(open, setOpenMethod) {
	const { onClick, onPointerDown } = useEnhancedClickHandler(useStableCallback((_, interactionType) => {
		if (!(typeof open === "function" ? open() : open)) setOpenMethod(interactionType || (ios ? "touch" : ""));
	}));
	return import_react.useMemo(() => ({
		onClick,
		onPointerDown
	}), [onClick, onPointerDown]);
}
/**
* Determines the interaction type (keyboard, mouse, touch, etc.) that opened the component.
*
* @param open The open state of the component.
*/
function useOpenInteractionType(open) {
	const [openMethod, setOpenMethod] = import_react.useState(null);
	const triggerProps = useOpenMethodTriggerProps(open, setOpenMethod);
	useValueChanged(open, (previousOpen) => {
		if (previousOpen && !open) setOpenMethod(null);
	});
	return import_react.useMemo(() => ({
		openMethod,
		triggerProps
	}), [openMethod, triggerProps]);
}
//#endregion
//#region src/components/ui/sheet.tsx
function Sheet({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogRoot, {
		"data-slot": "sheet",
		...props
	});
}
function SheetPortal({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogPortal, {
		"data-slot": "sheet-portal",
		...props
	});
}
function SheetOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBackdrop, {
		"data-slot": "sheet-overlay",
		className: cn("fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs", className),
		...props
	});
}
function SheetContent({ className, children, side = "right", showCloseButton = true, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPopup, {
		"data-slot": "sheet-content",
		"data-side": side,
		className: cn("fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm", className),
		...props,
		children: [children, showCloseButton && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			"data-slot": "sheet-close",
			render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				className: "absolute top-3 right-3",
				size: "icon-sm"
			}),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function SheetHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "sheet-header",
		className: cn("flex flex-col gap-0.5 p-4", className),
		...props
	});
}
function SheetTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
		"data-slot": "sheet-title",
		className: cn("text-base font-medium text-foreground", className),
		...props
	});
}
function SheetDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
		"data-slot": "sheet-description",
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
//#endregion
//#region src/components/ui/spinner.tsx
function Spinner({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
		"data-slot": "spinner",
		role: "status",
		"aria-label": "Loading",
		className: cn("size-4 animate-spin", className),
		...props
	});
}
(0, import_react.lazy)(async () => {
	const [{ CodeBlock }, { javascript }, { markdown }] = await Promise.all([
		import("../../code-block.client.mjs"),
		import("../../dist2.mjs").then((n) => n.t),
		import("../../dist3.mjs")
	]);
	const languages = {
		typescript: javascript({
			jsx: true,
			typescript: true
		}),
		markdown: markdown()
	};
	return { default: ({ language, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
		...props,
		language: languages[language]
	}) };
});
const LazySerializedBlock = (0, import_react.lazy)(async () => ({ default: (await import("../../code-block.client.mjs")).SerializedObjectCodeBlock }));
/** Any value as YAML or JSON, with a button to copy each (code-block.client.tsx). */
function SerializedObjectCodeBlock(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlockFallback, { className: props.className }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazySerializedBlock, { ...props })
	});
}
function CodeBlockFallback({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("relative flex min-h-0 flex-col", className),
		"data-spinner": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-16 items-center gap-2 rounded border px-3 py-2 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Loading code block..." })]
		})
	});
}
//#endregion
//#region src/components/context-view/event-inspector.tsx
function EventInspector({ events, offset, older, renderers, inspectors, onNavigate, onClose }) {
	const open = offset !== void 0;
	const [shown, setShown] = (0, import_react.useState)(offset);
	if (offset !== void 0 && offset !== shown) setShown(offset);
	const { event, previous, next, missing } = (0, import_react.useMemo)(() => shown === void 0 ? void 0 : inspectedPlace(events, shown), [events, shown]) || {};
	const olderLeft = !older.exhausted;
	const [steppingBackFrom, setSteppingBackFrom] = (0, import_react.useState)();
	const stepBack = () => {
		if (previous) onNavigate(previous.offset);
		else if (olderLeft && shown !== void 0) {
			setSteppingBackFrom(shown);
			older.loadOlder();
		}
	};
	const stepForward = () => next && onNavigate(next.offset);
	(0, import_react.useEffect)(() => {
		if (steppingBackFrom === void 0) return;
		if (steppingBackFrom !== shown) setSteppingBackFrom(void 0);
		else if (previous) {
			setSteppingBackFrom(void 0);
			onNavigate(previous.offset);
		} else if (older.exhausted) setSteppingBackFrom(void 0);
	}, [
		steppingBackFrom,
		shown,
		previous,
		older.exhausted,
		onNavigate
	]);
	const readingDown = open && missing === "below" && olderLeft;
	(0, import_react.useEffect)(() => {
		if (readingDown && !older.loading) older.loadOlder();
	}, [readingDown, older]);
	const onKey = (0, import_react.useEffectEvent)((key) => {
		if (key.altKey || key.ctrlKey || key.metaKey || key.shiftKey) return;
		if (isTypingTarget(key.target)) return;
		if (key.key === "ArrowLeft" && (previous || olderLeft)) {
			key.preventDefault();
			stepBack();
		} else if (key.key === "ArrowRight" && next) {
			key.preventDefault();
			stepForward();
		}
	});
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const listener = (key) => onKey(key);
		window.addEventListener("keydown", listener, true);
		return () => window.removeEventListener("keydown", listener, true);
	}, [open]);
	const raw = (0, import_react.useMemo)(() => event ? orderEventKeys(event) : void 0, [event]);
	const sentence = event ? rendererFor(renderers, event.type)?.(event) ?? null : null;
	const body = event ? rendererFor(inspectors, event.type)?.(event) ?? null : null;
	const envelope = event ? [
		["Who", actorLabel(event)],
		["From", event.source?.origin || ""],
		["Grant", event.source?.grant || ""],
		["Processor", event.source?.processor ? `${event.source.processor.slug}@${event.source.processor.version}` : ""]
	].filter((row) => Boolean(row[1])) : [];
	const sincePrevious = event && previous && elapsedBetween(previous.createdAt, event.createdAt);
	const untilNext = event && next && elapsedBetween(event.createdAt, next.createdAt);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange: (opened) => !opened && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
			side: "right",
			className: "gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-3xl",
			inert: !open,
			children: shown === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
					className: "shrink-0 pr-12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
						className: "line-clamp-2 text-sm [&_*]:inline",
						title: event?.type,
						children: !event ? `Event #${String(shown)}` : sentence ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono",
							children: shortEventType(event.type)
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetDescription, {
						className: "font-mono text-xs",
						children: [
							"#",
							shown,
							event && sentence ? ` · ${shortEventType(event.type)}` : "",
							" ·",
							" ",
							events.length.toLocaleString(),
							" loaded",
							event ? ` · ${event.createdAt}` : ""
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 flex-wrap items-center gap-2 px-4 pb-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							disabled: !open || !previous && !olderLeft,
							onClick: stepBack,
							children: [steppingBackFrom === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, {}), "Prev"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							disabled: !open || !next,
							onClick: stepForward,
							children: ["Next", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden text-xs text-muted-foreground/70 sm:inline",
							children: "← → page the log"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-auto flex items-center gap-2 font-mono text-[10px] text-muted-foreground",
							children: [
								sincePrevious ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									title: "Since the previous event",
									children: sincePrevious
								}) : null,
								sincePrevious && untilNext ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }) : null,
								untilNext ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									title: "Until the next event",
									children: [untilNext, " to next"]
								}) : null
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto border-t px-4 py-3",
					children: !event ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: readingDown ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, {}),
								" Reading older events to reach #",
								shown,
								"…"
							]
						}) : missing === "above" ? `No event #${String(shown)} yet.` : `No event has offset #${String(shown)}. Prev and Next go to its neighbours.`
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						body ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0",
							children: body
						}) : null,
						envelope.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
							className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs",
							children: envelope.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "contents",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "min-w-0 truncate font-mono",
									title: value,
									children: value
								})]
							}, label))
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SerializedObjectCodeBlock, { data: raw })
						})
					] })
				})
			] })
		})
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+virtual-core@3.17.11/node_modules/@tanstack/virtual-core/dist/esm/lazy-measurements.js
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
function getMeasurementKey(item) {
	return typeof item === "object" ? item.key : item;
}
function createLazyMeasurementsView(cache, flat) {
	const count = cache.length;
	return new Proxy(cache, { get(target, prop, receiver) {
		if (typeof prop === "string") {
			const c = prop.charCodeAt(0);
			if (c >= 48 && c <= 57) {
				const i = +prop;
				if (Number.isInteger(i) && i >= 0 && i < count) {
					let v = target[i];
					if (typeof v !== "object") {
						const s = flat[i * 2];
						v = target[i] = {
							index: i,
							key: v,
							start: s,
							size: flat[i * 2 + 1],
							end: s + flat[i * 2 + 1],
							lane: 0
						};
					}
					return v;
				}
			}
			if (prop === "length") return count;
		}
		return Reflect.get(target, prop, receiver);
	} });
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+virtual-core@3.17.11/node_modules/@tanstack/virtual-core/dist/esm/utils.js
function memo$1(getDeps, fn, opts) {
	let deps = opts.initialDeps ?? [];
	let result;
	let isInitial = true;
	function memoizedFunction() {
		const newDeps = getDeps();
		if (!(newDeps.length !== deps.length || newDeps.some((dep, index) => deps[index] !== dep))) return result;
		deps = newDeps;
		result = fn(...newDeps);
		if ((opts == null ? void 0 : opts.onChange) && !(isInitial && opts.skipInitialOnChange)) opts.onChange(result);
		isInitial = false;
		return result;
	}
	memoizedFunction.updateDeps = (newDeps) => {
		deps = newDeps;
	};
	return memoizedFunction;
}
function notUndefined(value, msg) {
	if (value === void 0) throw new Error(`Unexpected undefined${msg ? `: ${msg}` : ""}`);
	else return value;
}
const approxEqual = (a, b) => Math.abs(a - b) < 1.01;
const debounce = (targetWindow, fn, ms) => {
	let timeoutId;
	return Object.assign(function(...args) {
		targetWindow.clearTimeout(timeoutId);
		timeoutId = targetWindow.setTimeout(() => fn.apply(this, args), ms);
	}, { cancel: () => {
		targetWindow.clearTimeout(timeoutId);
	} });
};
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+virtual-core@3.17.11/node_modules/@tanstack/virtual-core/dist/esm/index.js
let _isIOSResult;
const isIOSWebKit = () => {
	if (_isIOSResult !== void 0) return _isIOSResult;
	if (typeof navigator === "undefined") return _isIOSResult = false;
	if (/iP(hone|od|ad)/.test(navigator.userAgent)) return _isIOSResult = true;
	const mtp = navigator.maxTouchPoints;
	return _isIOSResult = navigator.platform === "MacIntel" && mtp !== void 0 && mtp > 0;
};
const getRect = (element) => {
	const { offsetWidth, offsetHeight } = element;
	return {
		width: offsetWidth,
		height: offsetHeight
	};
};
const defaultKeyExtractor = (index) => index;
const defaultRangeExtractor = (range) => {
	const start = Math.max(range.startIndex - range.overscan, 0);
	const len = Math.min(range.endIndex + range.overscan, range.count - 1) - start + 1;
	const arr = new Array(len);
	for (let i = 0; i < len; i++) arr[i] = start + i;
	return arr;
};
const observeElementRect = (instance, cb) => {
	const element = instance.scrollElement;
	if (!element) return;
	const targetWindow = instance.targetWindow;
	if (!targetWindow) return;
	const handler = (rect) => {
		const { width, height } = rect;
		cb({
			width: Math.round(width),
			height: Math.round(height)
		});
	};
	handler(getRect(element));
	if (!targetWindow.ResizeObserver) return () => {};
	const observer = new targetWindow.ResizeObserver((entries) => {
		const run = () => {
			const entry = entries[0];
			if (entry == null ? void 0 : entry.borderBoxSize) {
				const box = entry.borderBoxSize[0];
				if (box) {
					handler({
						width: box.inlineSize,
						height: box.blockSize
					});
					return;
				}
			}
			handler(getRect(element));
		};
		instance.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(run) : run();
	});
	observer.observe(element, { box: "border-box" });
	return () => {
		observer.unobserve(element);
	};
};
const addEventListenerOptions = { passive: true };
const supportsScrollend = typeof window == "undefined" ? true : "onscrollend" in window;
const observeOffset = (instance, cb, readOffset) => {
	const element = instance.scrollElement;
	if (!element) return;
	const targetWindow = instance.targetWindow;
	if (!targetWindow) return;
	const registerScrollendEvent = instance.options.useScrollendEvent && supportsScrollend;
	let offset = 0;
	const fallback = registerScrollendEvent ? null : debounce(targetWindow, () => cb(readOffset(element), false), instance.options.isScrollingResetDelay);
	const createHandler = (isScrolling) => () => {
		offset = readOffset(element);
		fallback?.();
		cb(offset, isScrolling);
	};
	const handler = createHandler(true);
	const endHandler = createHandler(false);
	element.addEventListener("scroll", handler, addEventListenerOptions);
	if (registerScrollendEvent) element.addEventListener("scrollend", endHandler, addEventListenerOptions);
	return () => {
		element.removeEventListener("scroll", handler);
		if (registerScrollendEvent) element.removeEventListener("scrollend", endHandler);
		fallback?.cancel();
	};
};
const observeElementOffset = (instance, cb) => observeOffset(instance, cb, (el) => {
	const { horizontal, isRtl } = instance.options;
	return horizontal ? el.scrollLeft * (isRtl && -1 || 1) : el.scrollTop;
});
const measureElement = (element, entry, instance) => {
	if (instance.options.useCachedMeasurements) {
		const index = instance.indexFromElement(element);
		const key = instance.options.getItemKey(index);
		return instance.itemSizeCache.get(key) ?? instance.options.estimateSize(index);
	}
	if (entry == null ? void 0 : entry.borderBoxSize) {
		const box = entry.borderBoxSize[0];
		if (box) return Math.round(box[instance.options.horizontal ? "inlineSize" : "blockSize"]);
	}
	if (!entry) {
		const index = instance.indexFromElement(element);
		const key = instance.options.getItemKey(index);
		const cachedSize = instance.itemSizeCache.get(key);
		if (cachedSize !== void 0) return cachedSize;
	}
	return element[instance.options.horizontal ? "offsetWidth" : "offsetHeight"];
};
const scrollWithAdjustments = (offset, { adjustments = 0, behavior }, instance) => {
	var _a, _b;
	(_b = (_a = instance.scrollElement) == null ? void 0 : _a.scrollTo) == null || _b.call(_a, {
		[instance.options.horizontal ? "left" : "top"]: offset + adjustments,
		behavior
	});
};
const elementScroll = scrollWithAdjustments;
function isAppendWithTrim(prevCount, nextCount, getPreviousKey, getNextKey) {
	if (nextCount === 0) return false;
	const firstKey = getNextKey(0);
	const removedKeys = /* @__PURE__ */ new Set();
	let removedCount = 0;
	while (removedCount < prevCount) {
		const key = getPreviousKey(removedCount);
		if (key === firstKey) break;
		removedKeys.add(key);
		removedCount++;
	}
	const retainedCount = prevCount - removedCount;
	if (retainedCount === 0 || retainedCount >= nextCount) return false;
	for (let i = 0; i < retainedCount; i++) if (getNextKey(i) !== getPreviousKey(removedCount + i)) return false;
	for (let i = retainedCount; i < nextCount; i++) if (removedKeys.has(getNextKey(i))) return false;
	return true;
}
var Virtualizer = class {
	constructor(opts) {
		this.unsubs = [];
		this.scrollElement = null;
		this.targetWindow = null;
		this.isScrolling = false;
		this.scrollState = null;
		this.measurementsCache = [];
		this._singleLaneMeasurements = null;
		this.itemSizeCache = /* @__PURE__ */ new Map();
		this.itemSizeCacheVersion = 0;
		this.laneAssignments = /* @__PURE__ */ new Map();
		this.pendingMin = null;
		this.prevLanes = void 0;
		this.lanesChangedFlag = false;
		this.lanesSettling = false;
		this.pendingScrollAnchor = null;
		this.scrollRect = null;
		this.scrollOffset = null;
		this.scrollDirection = null;
		this.scrollAdjustments = 0;
		this._iosDeferredAdjustment = 0;
		this._iosTouching = false;
		this._iosJustTouchEnded = false;
		this._iosTouchEndTimerId = null;
		this._intendedScrollOffset = null;
		this._clampedAdjustment = null;
		this.elementsCache = /* @__PURE__ */ new Map();
		this.now = () => {
			var _a, _b, _c;
			return ((_c = (_b = (_a = this.targetWindow) == null ? void 0 : _a.performance) == null ? void 0 : _b.now) == null ? void 0 : _c.call(_b)) ?? Date.now();
		};
		this.observer = /* @__PURE__ */ (() => {
			let _ro = null;
			const get = () => {
				if (_ro) return _ro;
				if (!this.targetWindow || !this.targetWindow.ResizeObserver) return null;
				return _ro = new this.targetWindow.ResizeObserver((entries) => {
					entries.forEach((entry) => {
						const run = () => {
							const node = entry.target;
							const index = this.indexFromElement(node);
							if (!node.isConnected) {
								this.observer.unobserve(node);
								for (const [cacheKey, cachedNode] of this.elementsCache) if (cachedNode === node) {
									this.elementsCache.delete(cacheKey);
									break;
								}
								return;
							}
							if (!this.isIndexInRange(index)) return;
							if (this.shouldMeasureDuringScroll(index)) this.resizeItem(index, this.options.measureElement(node, entry, this));
						};
						this.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(run) : run();
					});
				});
			};
			return {
				disconnect: () => {
					var _a;
					(_a = get()) == null || _a.disconnect();
					_ro = null;
				},
				observe: (target) => {
					var _a;
					return (_a = get()) == null ? void 0 : _a.observe(target, { box: "border-box" });
				},
				unobserve: (target) => {
					var _a;
					return (_a = get()) == null ? void 0 : _a.unobserve(target);
				}
			};
		})();
		this.range = null;
		this.setOptions = (opts2) => {
			var _a;
			const merged = {
				debug: false,
				initialOffset: 0,
				overscan: 1,
				paddingStart: 0,
				paddingEnd: 0,
				scrollPaddingStart: 0,
				scrollPaddingEnd: 0,
				horizontal: false,
				getItemKey: defaultKeyExtractor,
				rangeExtractor: defaultRangeExtractor,
				onChange: () => {},
				measureElement,
				initialRect: {
					width: 0,
					height: 0
				},
				scrollMargin: 0,
				gap: 0,
				indexAttribute: "data-index",
				initialMeasurementsCache: [],
				lanes: 1,
				anchorTo: "start",
				followOnAppend: false,
				scrollEndThreshold: 1,
				isScrollingResetDelay: 150,
				enabled: true,
				isRtl: false,
				useScrollendEvent: false,
				useAnimationFrameWithResizeObserver: false,
				laneAssignmentMode: "estimate",
				useCachedMeasurements: false
			};
			for (const key in opts2) {
				const v = opts2[key];
				if (v !== void 0) merged[key] = v;
			}
			const prevOptions = this.options;
			let anchor = null;
			let followOnAppend = null;
			let edgeKeysChanged = false;
			if (prevOptions !== void 0 && prevOptions.enabled && merged.enabled && merged.anchorTo === "end" && this.scrollElement !== null) {
				const prevCount = prevOptions.count;
				const nextCount = merged.count;
				const measurements = this.getMeasurements();
				const previousItems = ((_a = this._singleLaneMeasurements) == null ? void 0 : _a.items) ?? measurements;
				const getPreviousKey = (index) => getMeasurementKey(previousItems[index]);
				const prevFirstKey = prevCount > 0 ? getPreviousKey(0) : null;
				const prevLastKey = prevCount > 0 ? getPreviousKey(prevCount - 1) : null;
				if (nextCount !== prevCount || prevCount > 0 && nextCount > 0 && (merged.getItemKey(0) !== prevFirstKey || merged.getItemKey(nextCount - 1) !== prevLastKey)) {
					edgeKeysChanged = true;
					const item = prevCount > 0 ? this.getVirtualItemForOffset(this.getScrollOffset()) ?? measurements[0] : null;
					if (item) anchor = [item.key, this.getScrollOffset() - item.start];
					const behavior = merged.followOnAppend === true ? "auto" : merged.followOnAppend || null;
					if (behavior && nextCount > 0 && this.isAtEnd(prevOptions.scrollEndThreshold) && (prevCount === 0 || merged.getItemKey(nextCount - 1) !== prevLastKey)) {
						if (nextCount > prevCount || isAppendWithTrim(prevCount, nextCount, getPreviousKey, merged.getItemKey)) followOnAppend = behavior;
					}
				}
			}
			this.options = merged;
			if (edgeKeysChanged) {
				this.pendingMin = 0;
				this.itemSizeCacheVersion++;
			}
			let anchorResolved = false;
			let anchorDelta = 0;
			if (anchor && this.scrollOffset !== null) {
				const [anchorKey, anchorOffset] = anchor;
				const newMeasurements = this.getMeasurements();
				const { count, getItemKey } = this.options;
				let idx = 0;
				while (idx < count && getItemKey(idx) !== anchorKey) idx++;
				if (idx < count) {
					const anchorItem = newMeasurements[idx];
					if (anchorItem) {
						const newOffset = Math.max(0, anchorItem.start + anchorOffset);
						if (!followOnAppend && newOffset !== this.scrollOffset) {
							anchorDelta = newOffset - this.scrollOffset;
							this.scrollOffset = newOffset;
							anchorResolved = true;
						}
					}
				}
			}
			if (anchorResolved || followOnAppend) this.pendingScrollAnchor = [
				anchorResolved ? anchor[0] : null,
				anchorResolved ? anchor[1] : 0,
				followOnAppend,
				anchorDelta
			];
		};
		this.notify = (sync) => {
			var _a, _b;
			(_b = (_a = this.options).onChange) == null || _b.call(_a, this, sync);
		};
		this.maybeNotify = memo$1(() => {
			this.calculateRange();
			return [
				this.isScrolling,
				this.range ? this.range.startIndex : null,
				this.range ? this.range.endIndex : null
			];
		}, (isScrolling) => {
			this.notify(isScrolling);
		}, {
			key: false,
			debug: () => this.options.debug,
			initialDeps: [
				this.isScrolling,
				this.range ? this.range.startIndex : null,
				this.range ? this.range.endIndex : null
			]
		});
		this.cleanup = () => {
			this.unsubs.filter(Boolean).forEach((d) => d());
			this.unsubs = [];
			this.observer.disconnect();
			if (this.rafId != null && this.targetWindow) {
				this.targetWindow.cancelAnimationFrame(this.rafId);
				this.rafId = null;
			}
			this.scrollState = null;
			this.isScrolling = false;
			this.scrollDirection = null;
			this._iosDeferredAdjustment = 0;
			this._iosTouching = false;
			this._iosJustTouchEnded = false;
			this._clampedAdjustment = null;
			this.scrollElement = null;
			this.targetWindow = null;
		};
		this._didMount = () => {
			return () => {
				this.cleanup();
			};
		};
		this._willUpdate = () => {
			var _a, _b;
			const scrollElement = this.options.enabled ? this.options.getScrollElement() : null;
			if (this.scrollElement !== scrollElement) {
				this.cleanup();
				if (!scrollElement) {
					this.maybeNotify();
					return;
				}
				this.scrollElement = scrollElement;
				if (this.scrollElement && "ownerDocument" in this.scrollElement) this.targetWindow = this.scrollElement.ownerDocument.defaultView;
				else this.targetWindow = ((_a = this.scrollElement) == null ? void 0 : _a.window) ?? null;
				this.elementsCache.forEach((cached) => {
					this.observer.observe(cached);
				});
				this.unsubs.push(this.options.observeElementRect(this, (rect) => {
					this.scrollRect = rect;
					this.maybeNotify();
				}));
				this.unsubs.push(this.options.observeElementOffset(this, (offset, isScrolling) => {
					if (isScrolling && this._intendedScrollOffset === null && offset === this.scrollOffset) return;
					if (this._intendedScrollOffset !== null && Math.abs(offset - this._intendedScrollOffset) < 1.5) offset = this._intendedScrollOffset;
					this._intendedScrollOffset = null;
					if (this._clampedAdjustment !== null && Math.abs(offset - this._clampedAdjustment.maxAtWrite) >= 1.5) this._clampedAdjustment = null;
					this.scrollAdjustments = 0;
					const prevOffset = this.getScrollOffset();
					this.scrollDirection = isScrolling ? prevOffset === offset ? this.scrollDirection : prevOffset < offset ? "forward" : "backward" : null;
					this.scrollOffset = offset;
					this.isScrolling = isScrolling;
					this._flushIosDeferredIfReady();
					if (this.scrollState) this.scheduleScrollReconcile();
					this.maybeNotify();
				}));
				if ("addEventListener" in this.scrollElement) {
					const scrollEl = this.scrollElement;
					const onTouchStart = () => {
						this._iosTouching = true;
						this._iosJustTouchEnded = false;
						if (this._iosTouchEndTimerId !== null && this.targetWindow != null) {
							this.targetWindow.clearTimeout(this._iosTouchEndTimerId);
							this._iosTouchEndTimerId = null;
						}
					};
					const onTouchEnd = () => {
						this._iosTouching = false;
						if (!isIOSWebKit() || this.targetWindow == null) return;
						this._iosJustTouchEnded = true;
						this._iosTouchEndTimerId = this.targetWindow.setTimeout(() => {
							this._iosJustTouchEnded = false;
							this._iosTouchEndTimerId = null;
							this._flushIosDeferredIfReady();
						}, 150);
					};
					scrollEl.addEventListener("touchstart", onTouchStart, addEventListenerOptions);
					scrollEl.addEventListener("touchend", onTouchEnd, addEventListenerOptions);
					this.unsubs.push(() => {
						scrollEl.removeEventListener("touchstart", onTouchStart);
						scrollEl.removeEventListener("touchend", onTouchEnd);
						if (this._iosTouchEndTimerId !== null && this.targetWindow != null) {
							this.targetWindow.clearTimeout(this._iosTouchEndTimerId);
							this._iosTouchEndTimerId = null;
						}
					});
				}
				this._scrollToOffset(this.getScrollOffset(), {
					adjustments: void 0,
					behavior: void 0
				});
			}
			const anchor = this.pendingScrollAnchor;
			this.pendingScrollAnchor = null;
			if (anchor && this.scrollElement && this.options.enabled) {
				const [key, _offset, followOnAppend, anchorDelta] = anchor;
				if (key !== null && !followOnAppend) {
					if (isIOSWebKit() && (this.isScrolling || this._iosTouching || this._iosJustTouchEnded)) {
						if (anchorDelta !== 0) this._iosDeferredAdjustment += anchorDelta;
					} else if (((_b = this.scrollState) == null ? void 0 : _b.behavior) === "smooth" && !approxEqual(this.getScrollOffset() - anchorDelta, this.scrollState.lastTargetOffset));
					else this._scrollToOffset(this.getScrollOffset(), {
						adjustments: void 0,
						behavior: void 0
					});
				}
				if (followOnAppend) this.scrollToEnd({ behavior: followOnAppend });
			}
			this._retryClampedAdjustment();
		};
		this._retryClampedAdjustment = () => {
			if (this._clampedAdjustment === null || !this.scrollElement || !this.options.enabled) return;
			const { target, maxAtWrite } = this._clampedAdjustment;
			const max = this.getMaxScrollOffset();
			if (max > maxAtWrite + .5) {
				this._clampedAdjustment = target > max + .5 ? {
					target,
					maxAtWrite: max
				} : null;
				this._scrollToOffset(target, {
					adjustments: void 0,
					behavior: void 0
				});
			}
		};
		this._flushIosDeferredIfReady = () => {
			if (this._iosDeferredAdjustment === 0) return;
			if (this.isScrolling) return;
			if (this._iosTouching) return;
			if (this._iosJustTouchEnded) return;
			const cur = this.getScrollOffset();
			const max = this.getMaxScrollOffset();
			if (cur < 0 || cur > max) return;
			if (this._iosDeferredAdjustment < 0 && cur >= max - 1) {
				this._iosDeferredAdjustment = 0;
				return;
			}
			const delta = this._iosDeferredAdjustment;
			this._iosDeferredAdjustment = 0;
			this._scrollToOffset(cur, {
				adjustments: this.scrollAdjustments += delta,
				behavior: void 0
			});
		};
		this.rafId = null;
		this.getSize = () => {
			if (!this.options.enabled) {
				this.scrollRect = null;
				return 0;
			}
			this.scrollRect = this.scrollRect ?? this.options.initialRect;
			return this.scrollRect[this.options.horizontal ? "width" : "height"];
		};
		this.getScrollOffset = () => {
			if (!this.options.enabled) {
				this.scrollOffset = null;
				return 0;
			}
			this.scrollOffset = this.scrollOffset ?? (typeof this.options.initialOffset === "function" ? this.options.initialOffset() : this.options.initialOffset);
			return this.scrollOffset;
		};
		this.getMeasurementOptions = memo$1(() => [
			this.options.count,
			this.options.paddingStart,
			this.options.scrollMargin,
			this.options.getItemKey,
			this.options.enabled,
			this.options.lanes,
			this.options.laneAssignmentMode,
			this.options.gap
		], (count, paddingStart, scrollMargin, getItemKey, enabled, lanes, laneAssignmentMode, gap) => {
			if (this.prevLanes !== void 0 && this.prevLanes !== lanes) this.lanesChangedFlag = true;
			this.prevLanes = lanes;
			this.pendingMin = null;
			return {
				count,
				paddingStart,
				scrollMargin,
				getItemKey,
				enabled,
				lanes,
				laneAssignmentMode,
				gap
			};
		}, { key: false });
		this.isIndexInRange = (index) => index >= 0 && index < this.options.count;
		this.getMeasurements = memo$1(() => [this.getMeasurementOptions(), this.itemSizeCacheVersion], ({ count, paddingStart, scrollMargin, getItemKey, enabled, lanes, laneAssignmentMode, gap }, _itemSizeCacheVersion) => {
			var _a;
			const itemSizeCache = this.itemSizeCache;
			if (!enabled) {
				this.measurementsCache = [];
				this._singleLaneMeasurements = null;
				this.itemSizeCache.clear();
				this.laneAssignments.clear();
				return [];
			}
			if (this.laneAssignments.size > count) {
				for (const index of this.laneAssignments.keys()) if (index >= count) this.laneAssignments.delete(index);
			}
			if (this.lanesChangedFlag) {
				this.lanesChangedFlag = false;
				this.lanesSettling = true;
				this.measurementsCache = [];
				this._singleLaneMeasurements = null;
				this.itemSizeCache.clear();
				this.laneAssignments.clear();
				this.pendingMin = null;
			}
			if (this.measurementsCache.length === 0 && !this.lanesSettling) {
				this.measurementsCache = this.options.initialMeasurementsCache;
				this.measurementsCache.forEach((item) => {
					this.itemSizeCache.set(item.key, item.size);
				});
			}
			const min = this.lanesSettling ? 0 : this.pendingMin ?? 0;
			this.pendingMin = null;
			if (this.lanesSettling && this.measurementsCache.length === count) this.lanesSettling = false;
			if (lanes === 1) {
				const need = count * 2;
				let flat = (_a = this._singleLaneMeasurements) == null ? void 0 : _a.flat;
				if (!flat || flat.length < need) {
					const next = new Float64Array(need);
					if (flat && min > 0) next.set(flat.subarray(0, min * 2));
					flat = next;
				}
				const items = min === 0 ? new Array(count) : this._singleLaneMeasurements.items.slice();
				let runningStart;
				if (min === 0) runningStart = paddingStart + scrollMargin;
				else {
					const prevIdx = min - 1;
					runningStart = flat[prevIdx * 2] + flat[prevIdx * 2 + 1] + gap;
				}
				for (let i = min; i < count; i++) {
					const key = getItemKey(i);
					items[i] = key;
					const measuredSize = itemSizeCache.get(key);
					const size = typeof measuredSize === "number" ? measuredSize : this.options.estimateSize(i);
					flat[i * 2] = runningStart;
					flat[i * 2 + 1] = size;
					runningStart += size + gap;
				}
				this._singleLaneMeasurements = {
					flat,
					items
				};
				const view = createLazyMeasurementsView(items, flat);
				this.measurementsCache = view;
				return view;
			}
			const measurements = this.measurementsCache.slice(0, min);
			const laneLastIndex = new Array(lanes).fill(void 0);
			const laneEnds = new Float64Array(lanes);
			let filledLanes = 0;
			for (let m = 0; m < min; m++) {
				const item = measurements[m];
				if (item) {
					if (laneLastIndex[item.lane] === void 0) filledLanes++;
					laneLastIndex[item.lane] = m;
					laneEnds[item.lane] = item.end;
				}
			}
			for (let i = min; i < count; i++) {
				const key = getItemKey(i);
				const cachedLane = this.laneAssignments.get(i);
				let lane;
				let start;
				const shouldCacheLane = laneAssignmentMode === "estimate" || itemSizeCache.has(key);
				if (cachedLane !== void 0 && this.options.lanes > 1) {
					lane = cachedLane;
					const prevIndex = laneLastIndex[lane];
					const prevInLane = prevIndex !== void 0 ? measurements[prevIndex] : void 0;
					start = prevInLane ? prevInLane.end + gap : paddingStart + scrollMargin;
				} else if (filledLanes === lanes) {
					let bestLane = 0;
					let bestEnd = laneEnds[0];
					let bestIdx = laneLastIndex[0];
					for (let l = 1; l < lanes; l++) {
						const e = laneEnds[l];
						if (e < bestEnd || e === bestEnd && laneLastIndex[l] < bestIdx) {
							bestLane = l;
							bestEnd = e;
							bestIdx = laneLastIndex[l];
						}
					}
					lane = bestLane;
					start = bestEnd + gap;
					if (shouldCacheLane) this.laneAssignments.set(i, lane);
				} else {
					lane = i % this.options.lanes;
					start = paddingStart + scrollMargin;
					if (shouldCacheLane) this.laneAssignments.set(i, lane);
				}
				const measuredSize = itemSizeCache.get(key);
				const size = typeof measuredSize === "number" ? measuredSize : this.options.estimateSize(i);
				const end = start + size;
				measurements[i] = {
					index: i,
					start,
					size,
					end,
					key,
					lane
				};
				if (laneLastIndex[lane] === void 0) filledLanes++;
				laneLastIndex[lane] = i;
				laneEnds[lane] = end;
			}
			this.measurementsCache = measurements;
			return measurements;
		}, {
			key: false,
			debug: () => this.options.debug
		});
		this.calculateRange = memo$1(() => [
			this.getMeasurements(),
			this.getSize(),
			this.getScrollOffset(),
			this.options.lanes
		], (measurements, outerSize, scrollOffset, lanes) => {
			if (measurements.length === 0 || outerSize === 0) {
				this.range = null;
				return null;
			}
			this.range = calculateRangeImpl(measurements, outerSize, scrollOffset, lanes, lanes === 1 && this._singleLaneMeasurements !== null ? this._singleLaneMeasurements.flat : null);
			return this.range;
		}, {
			key: false,
			debug: () => this.options.debug
		});
		this.getVirtualIndexes = memo$1(() => {
			let startIndex = null;
			let endIndex = null;
			const range = this.calculateRange();
			if (range) {
				startIndex = range.startIndex;
				endIndex = range.endIndex;
			}
			this.maybeNotify.updateDeps([
				this.isScrolling,
				startIndex,
				endIndex
			]);
			return [
				this.options.rangeExtractor,
				this.options.overscan,
				this.options.count,
				startIndex,
				endIndex
			];
		}, (rangeExtractor, overscan, count, startIndex, endIndex) => {
			return startIndex === null || endIndex === null ? [] : rangeExtractor({
				startIndex,
				endIndex,
				overscan,
				count
			});
		}, {
			key: false,
			debug: () => this.options.debug
		});
		this.indexFromElement = (node) => {
			const attributeName = this.options.indexAttribute;
			const indexStr = node.getAttribute(attributeName);
			if (!indexStr) {
				console.warn(`Missing attribute name '${attributeName}={index}' on measured element.`);
				return -1;
			}
			return parseInt(indexStr, 10);
		};
		this.shouldMeasureDuringScroll = (index) => {
			var _a;
			if (!this.scrollState || this.scrollState.behavior !== "smooth") return true;
			const scrollIndex = this.scrollState.index ?? ((_a = this.getVirtualItemForOffset(this.scrollState.lastTargetOffset)) == null ? void 0 : _a.index);
			if (scrollIndex !== void 0 && this.range) {
				const bufferSize = Math.max(this.options.overscan, Math.ceil((this.range.endIndex - this.range.startIndex) / 2));
				const minIndex = Math.max(0, scrollIndex - bufferSize);
				const maxIndex = Math.min(this.options.count - 1, scrollIndex + bufferSize);
				return index >= minIndex && index <= maxIndex;
			}
			return true;
		};
		this.measureElement = (node) => {
			if (!node) {
				this.elementsCache.forEach((cached, key2) => {
					if (!cached.isConnected) {
						this.observer.unobserve(cached);
						this.elementsCache.delete(key2);
					}
				});
				return;
			}
			const index = this.indexFromElement(node);
			if (!this.isIndexInRange(index)) return;
			const key = this.options.getItemKey(index);
			const prevNode = this.elementsCache.get(key);
			if (prevNode !== node) {
				if (prevNode) this.observer.unobserve(prevNode);
				this.observer.observe(node);
				this.elementsCache.set(key, node);
			}
			if ((!this.isScrolling || this.scrollState) && this.shouldMeasureDuringScroll(index)) this.resizeItem(index, this.options.measureElement(node, void 0, this));
		};
		this.resizeItem = (index, size) => {
			var _a, _b, _c;
			if (!this.isIndexInRange(index)) return;
			let cachedSize;
			let itemStart;
			let key;
			const flat = (_a = this._singleLaneMeasurements) == null ? void 0 : _a.flat;
			if (this.options.lanes === 1 && flat != null) {
				key = this.options.getItemKey(index);
				itemStart = flat[index * 2];
				cachedSize = flat[index * 2 + 1];
			} else {
				const item = this.measurementsCache[index];
				if (!item) return;
				key = item.key;
				itemStart = item.start;
				cachedSize = item.size;
			}
			const itemSize = this.itemSizeCache.get(key) ?? cachedSize;
			const delta = size - itemSize;
			if (delta !== 0) {
				const wasAtEnd = this.options.anchorTo === "end" && ((_b = this.scrollState) == null ? void 0 : _b.behavior) !== "smooth" && this.getVirtualDistanceFromEnd() <= this.options.scrollEndThreshold;
				const prevTotalSize = wasAtEnd ? this.getTotalSize() : 0;
				const scrollOffsetWithAdj = this.getScrollOffset() + this.scrollAdjustments;
				const defaultShouldAdjust = !this.itemSizeCache.has(key) ? itemStart < scrollOffsetWithAdj : itemStart + itemSize <= scrollOffsetWithAdj && this.scrollDirection !== "backward";
				const shouldAdjustScroll = ((_c = this.scrollState) == null ? void 0 : _c.behavior) !== "smooth" && (this.shouldAdjustScrollPositionOnItemSizeChange !== void 0 ? this.shouldAdjustScrollPositionOnItemSizeChange(this.measurementsCache[index] ?? {
					index,
					key,
					start: itemStart,
					size: cachedSize,
					end: itemStart + cachedSize,
					lane: 0
				}, delta, this) : defaultShouldAdjust);
				if (this.pendingMin === null || index < this.pendingMin) this.pendingMin = index;
				this.itemSizeCache.set(key, size);
				this.itemSizeCacheVersion++;
				let adjustedSync = false;
				if (wasAtEnd) adjustedSync = this.applyScrollAdjustment(this.getTotalSize() - prevTotalSize);
				else if (shouldAdjustScroll) adjustedSync = this.applyScrollAdjustment(delta);
				this.notify(adjustedSync);
				this._retryClampedAdjustment();
			}
		};
		this.getVirtualItems = memo$1(() => [this.getVirtualIndexes(), this.getMeasurements()], (indexes, measurements) => {
			const virtualItems = [];
			for (let k = 0, len = indexes.length; k < len; k++) {
				const measurement = measurements[indexes[k]];
				virtualItems.push(measurement);
			}
			return virtualItems;
		}, {
			key: false,
			debug: () => this.options.debug
		});
		this.getVirtualItemForOffset = (offset) => {
			var _a;
			const measurements = this.getMeasurements();
			if (measurements.length === 0) return;
			const flat = (_a = this._singleLaneMeasurements) == null ? void 0 : _a.flat;
			const useFlat = this.options.lanes === 1 && flat != null;
			return notUndefined(measurements[findNearestBinarySearch(0, measurements.length - 1, useFlat ? (i) => flat[i * 2] : (i) => notUndefined(measurements[i]).start, offset)]);
		};
		this.getMaxScrollOffset = () => {
			if (!this.scrollElement) return 0;
			if ("scrollHeight" in this.scrollElement) return this.options.horizontal ? this.scrollElement.scrollWidth - this.scrollElement.clientWidth : this.scrollElement.scrollHeight - this.scrollElement.clientHeight;
			else {
				const doc = this.scrollElement.document.documentElement;
				return this.options.horizontal ? doc.scrollWidth - this.scrollElement.innerWidth : doc.scrollHeight - this.scrollElement.innerHeight;
			}
		};
		this.getVirtualDistanceFromEnd = () => {
			return Math.max(this.getTotalSize() - this.getSize() - this.getScrollOffset(), 0);
		};
		this.getDistanceFromEnd = () => {
			return Math.max(this.getMaxScrollOffset() - this.getScrollOffset(), 0);
		};
		this.isAtEnd = (threshold = this.options.scrollEndThreshold) => {
			return this.getDistanceFromEnd() <= threshold;
		};
		this.getOffsetForAlignment = (toOffset, align, itemSize = 0) => {
			if (!this.scrollElement) return 0;
			const size = this.getSize();
			const scrollOffset = this.getScrollOffset();
			if (align === "auto") align = toOffset >= scrollOffset + size ? "end" : "start";
			if (align === "center") toOffset += (itemSize - size) / 2;
			else if (align === "end") toOffset -= size;
			const maxOffset = this.getMaxScrollOffset();
			return Math.max(Math.min(maxOffset, toOffset), 0);
		};
		this.getOffsetForIndex = (index, align = "auto") => {
			index = Math.max(0, Math.min(index, this.options.count - 1));
			const size = this.getSize();
			const scrollOffset = this.getScrollOffset();
			const item = this.measurementsCache[index];
			if (!item) return;
			if (align === "auto") {
				if (item.end >= scrollOffset + size - this.options.scrollPaddingEnd) align = "end";
				else if (item.start <= scrollOffset + this.options.scrollPaddingStart) align = "start";
				else return [scrollOffset, align];
			}
			if (align === "end" && index === this.options.count - 1) return [this.getMaxScrollOffset(), align];
			const toOffset = align === "end" ? item.end + this.options.scrollPaddingEnd : item.start - this.options.scrollPaddingStart;
			return [this.getOffsetForAlignment(toOffset, align, item.size), align];
		};
		this.scrollToOffset = (toOffset, { align = "start", behavior = "auto" } = {}) => {
			this._iosDeferredAdjustment = 0;
			const offset = this.getOffsetForAlignment(toOffset, align);
			const now = this.now();
			this.scrollState = {
				index: null,
				align,
				behavior,
				startedAt: now,
				lastTargetOffset: offset,
				stableFrames: 0
			};
			this._scrollToOffset(offset, {
				adjustments: void 0,
				behavior
			});
			this.scheduleScrollReconcile();
		};
		this.scrollToIndex = (index, { align: initialAlign = "auto", behavior = "auto" } = {}) => {
			this._iosDeferredAdjustment = 0;
			index = Math.max(0, Math.min(index, this.options.count - 1));
			const offsetInfo = this.getOffsetForIndex(index, initialAlign);
			if (!offsetInfo) return;
			const [offset, align] = offsetInfo;
			const now = this.now();
			this.scrollState = {
				index,
				align,
				behavior,
				startedAt: now,
				lastTargetOffset: offset,
				stableFrames: 0
			};
			this._scrollToOffset(offset, {
				adjustments: void 0,
				behavior
			});
			this.scheduleScrollReconcile();
		};
		this.scrollBy = (delta, { behavior = "auto" } = {}) => {
			const offset = this.getScrollOffset() + delta;
			const now = this.now();
			this.scrollState = {
				index: null,
				align: "start",
				behavior,
				startedAt: now,
				lastTargetOffset: offset,
				stableFrames: 0
			};
			this._scrollToOffset(offset, {
				adjustments: void 0,
				behavior
			});
			this.scheduleScrollReconcile();
		};
		this.scrollToEnd = ({ behavior = "auto" } = {}) => {
			if (this.options.count > 0) {
				this.scrollToIndex(this.options.count - 1, {
					align: "end",
					behavior
				});
				return;
			}
			this.scrollToOffset(Math.max(this.getTotalSize() - this.getSize(), 0), { behavior });
		};
		this.getTotalSize = () => {
			var _a, _b;
			const measurements = this.getMeasurements();
			let end;
			if (measurements.length === 0) end = this.options.paddingStart;
			else if (this.options.lanes === 1) {
				const lastIdx = measurements.length - 1;
				const flat = (_a = this._singleLaneMeasurements) == null ? void 0 : _a.flat;
				if (flat != null) end = flat[lastIdx * 2] + flat[lastIdx * 2 + 1];
				else end = ((_b = measurements[lastIdx]) == null ? void 0 : _b.end) ?? 0;
			} else {
				const endByLane = Array(this.options.lanes).fill(null);
				let endIndex = measurements.length - 1;
				while (endIndex >= 0 && endByLane.some((val) => val === null)) {
					const item = measurements[endIndex];
					if (endByLane[item.lane] === null) endByLane[item.lane] = item.end;
					endIndex--;
				}
				end = Math.max(...endByLane.filter((val) => val !== null));
			}
			return Math.max(end - this.options.scrollMargin + this.options.paddingEnd, 0);
		};
		this.takeSnapshot = () => {
			const snapshot = [];
			if (this.itemSizeCache.size === 0) return snapshot;
			const m = this.getMeasurements();
			for (const item of m) if (item && this.itemSizeCache.has(item.key)) snapshot.push({
				index: item.index,
				key: item.key,
				start: item.start,
				size: item.size,
				end: item.end,
				lane: item.lane
			});
			return snapshot;
		};
		this._scrollToOffset = (offset, { adjustments, behavior }) => {
			this._intendedScrollOffset = offset + (adjustments ?? 0);
			this.options.scrollToFn(offset, {
				behavior,
				adjustments
			}, this);
		};
		this.measure = () => {
			this.pendingMin = null;
			this.itemSizeCache.clear();
			this.laneAssignments.clear();
			this.itemSizeCacheVersion++;
			this.notify(false);
		};
		this.setOptions(opts);
	}
	applyScrollAdjustment(delta, behavior) {
		if (delta === 0) return false;
		if (isIOSWebKit() && (this.isScrolling || this._iosTouching || this._iosJustTouchEnded)) {
			this._iosDeferredAdjustment += delta;
			return false;
		} else {
			const target = this.getScrollOffset() + this.scrollAdjustments + delta;
			const el = this.scrollElement;
			const maxAtWrite = el !== null && ("scrollHeight" in el || "document" in el) ? this.getMaxScrollOffset() : null;
			this._clampedAdjustment = maxAtWrite !== null && target > maxAtWrite + .5 ? {
				target,
				maxAtWrite
			} : null;
			this._scrollToOffset(this.getScrollOffset(), {
				adjustments: this.scrollAdjustments += delta,
				behavior
			});
			if (this.scrollOffset !== null) {
				this.scrollOffset += this.scrollAdjustments;
				if (this.scrollOffset < 0) this.scrollOffset = 0;
				this.scrollAdjustments = 0;
			}
			return true;
		}
	}
	scheduleScrollReconcile() {
		if (!this.targetWindow) {
			this.scrollState = null;
			return;
		}
		if (this.rafId != null) return;
		this.rafId = this.targetWindow.requestAnimationFrame(() => {
			this.rafId = null;
			this.reconcileScroll();
		});
	}
	reconcileScroll() {
		if (!this.scrollState) return;
		if (!this.scrollElement) return;
		if (this.now() - this.scrollState.startedAt > 5e3) {
			this.scrollState = null;
			return;
		}
		const offsetInfo = this.scrollState.index != null ? this.getOffsetForIndex(this.scrollState.index, this.scrollState.align) : void 0;
		const targetOffset = offsetInfo ? offsetInfo[0] : this.scrollState.lastTargetOffset;
		const STABLE_FRAMES = 1;
		const targetChanged = targetOffset !== this.scrollState.lastTargetOffset;
		if (!targetChanged && approxEqual(targetOffset, this.getScrollOffset())) {
			this.scrollState.stableFrames++;
			if (this.scrollState.stableFrames >= STABLE_FRAMES) {
				if (this.getScrollOffset() !== targetOffset) this._scrollToOffset(targetOffset, {
					adjustments: void 0,
					behavior: "auto"
				});
				this.scrollState = null;
				return;
			}
		} else {
			this.scrollState.stableFrames = 0;
			if (targetChanged) {
				const viewport = this.getSize() || 600;
				const distance = Math.abs(targetOffset - this.getScrollOffset());
				const keepSmooth = this.scrollState.behavior === "smooth" && distance > viewport;
				this.scrollState.lastTargetOffset = targetOffset;
				if (!keepSmooth) this.scrollState.behavior = "auto";
				this._scrollToOffset(targetOffset, {
					adjustments: void 0,
					behavior: keepSmooth ? "smooth" : "auto"
				});
			}
		}
		this.scheduleScrollReconcile();
	}
};
const findNearestBinarySearch = (low, high, getCurrentValue, value) => {
	while (low <= high) {
		const middle = (low + high) / 2 | 0;
		const currentValue = getCurrentValue(middle);
		if (currentValue < value) low = middle + 1;
		else if (currentValue > value) high = middle - 1;
		else return middle;
	}
	if (low > 0) return low - 1;
	else return 0;
};
function findNearestBinarySearchFlat(flat, high, value) {
	let low = 0;
	while (low <= high) {
		const middle = (low + high) / 2 | 0;
		const currentValue = flat[middle * 2];
		if (currentValue < value) low = middle + 1;
		else if (currentValue > value) high = middle - 1;
		else return middle;
	}
	return low > 0 ? low - 1 : 0;
}
function calculateRangeImpl(measurements, outerSize, scrollOffset, lanes, flat) {
	const lastIndex = measurements.length - 1;
	if (measurements.length <= lanes) return {
		startIndex: 0,
		endIndex: lastIndex
	};
	if (lanes === 1 && flat !== null) {
		const startIndex2 = findNearestBinarySearchFlat(flat, lastIndex, scrollOffset);
		let endIndex2 = startIndex2;
		const limit = scrollOffset + outerSize;
		while (endIndex2 < lastIndex && flat[endIndex2 * 2] + flat[endIndex2 * 2 + 1] < limit) endIndex2++;
		return {
			startIndex: startIndex2,
			endIndex: endIndex2
		};
	}
	const getStart = (index) => measurements[index].start;
	let startIndex = findNearestBinarySearch(0, lastIndex, getStart, scrollOffset);
	let endIndex = startIndex;
	if (lanes === 1) while (endIndex < lastIndex && measurements[endIndex].end < scrollOffset + outerSize) endIndex++;
	else if (lanes > 1) {
		const endPerLane = Array(lanes).fill(0);
		while (endIndex < lastIndex && endPerLane.some((pos) => pos < scrollOffset + outerSize)) {
			const item = measurements[endIndex];
			endPerLane[item.lane] = item.end;
			endIndex++;
		}
		const startPerLane = Array(lanes).fill(scrollOffset + outerSize);
		while (startIndex >= 0 && startPerLane.some((pos) => pos >= scrollOffset)) {
			const item = measurements[startIndex];
			startPerLane[item.lane] = item.start;
			startIndex--;
		}
		startIndex = Math.max(0, startIndex - startIndex % lanes);
		endIndex = Math.min(lastIndex, endIndex + (lanes - 1 - endIndex % lanes));
	}
	return {
		startIndex,
		endIndex
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@tanstack+react-virtual@3.14.13_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@tanstack/react-virtual/dist/esm/index.js
const useIsomorphicLayoutEffect = typeof document !== "undefined" ? import_react.useLayoutEffect : import_react.useEffect;
function useVirtualizerBase({ useFlushSync = true, directDomUpdates = false, directDomUpdatesMode = "transform", ...options }) {
	const rerender = import_react.useReducer((x) => x + 1, 0)[1];
	const directRef = import_react.useRef({
		enabled: directDomUpdates,
		mode: directDomUpdatesMode,
		container: null,
		lastSize: null,
		lastPositions: /* @__PURE__ */ new WeakMap(),
		prevRange: null
	});
	directRef.current.enabled = directDomUpdates;
	directRef.current.mode = directDomUpdatesMode;
	const measuringFromRef = import_react.useRef(false);
	const applyContainerSize = (instance2) => {
		const state = directRef.current;
		if (!state.enabled || !state.container) return;
		const totalSize = instance2.getTotalSize();
		if (totalSize !== state.lastSize) {
			state.lastSize = totalSize;
			const sizeAxis = instance2.options.horizontal ? "width" : "height";
			state.container.style[sizeAxis] = `${totalSize}px`;
		}
	};
	const applyDirectStyles = (instance2) => {
		const state = directRef.current;
		if (!state.enabled || !state.container) return;
		applyContainerSize(instance2);
		const horizontal = !!instance2.options.horizontal;
		const useTransform = state.mode === "transform";
		const posAxis = horizontal ? "left" : "top";
		const scrollMargin = instance2.options.scrollMargin;
		const items = instance2.getVirtualItems();
		for (const item of items) {
			const next = item.start - scrollMargin;
			const el = instance2.elementsCache.get(item.key);
			if (!el) continue;
			if (state.lastPositions.get(el) === next) continue;
			state.lastPositions.set(el, next);
			if (useTransform) el.style.transform = horizontal ? `translate3d(${next}px, 0, 0)` : `translate3d(0, ${next}px, 0)`;
			else el.style[posAxis] = `${next}px`;
		}
	};
	const resolvedOptions = {
		...options,
		onChange: (instance2, sync) => {
			var _a;
			const state = directRef.current;
			let shouldRerender = true;
			if (state.enabled) {
				applyDirectStyles(instance2);
				const range = instance2.range;
				const prev = state.prevRange;
				shouldRerender = !prev || prev.isScrolling !== instance2.isScrolling || prev.startIndex !== (range == null ? void 0 : range.startIndex) || prev.endIndex !== (range == null ? void 0 : range.endIndex);
				if (shouldRerender) state.prevRange = range ? {
					startIndex: range.startIndex,
					endIndex: range.endIndex,
					isScrolling: instance2.isScrolling
				} : null;
			}
			if (shouldRerender) {
				if (useFlushSync && sync && !measuringFromRef.current) (0, import_react_dom.flushSync)(rerender);
				else rerender();
			}
			(_a = options.onChange) == null || _a.call(options, instance2, sync);
		}
	};
	const [instance] = import_react.useState(() => {
		const v = new Virtualizer(resolvedOptions);
		const measureElement = v.measureElement;
		v.measureElement = (node) => {
			measuringFromRef.current = true;
			try {
				measureElement(node);
			} finally {
				measuringFromRef.current = false;
			}
		};
		return Object.assign(v, { containerRef: (node) => {
			const state = directRef.current;
			state.container = node;
			state.lastSize = null;
			if (node && state.enabled) {
				const total = v.getTotalSize();
				state.lastSize = total;
				const axis = v.options.horizontal ? "width" : "height";
				node.style[axis] = `${total}px`;
			}
		} });
	});
	instance.setOptions(resolvedOptions);
	useIsomorphicLayoutEffect(() => {
		return instance._didMount();
	}, []);
	useIsomorphicLayoutEffect(() => {
		applyContainerSize(instance);
		return instance._willUpdate();
	});
	useIsomorphicLayoutEffect(() => {
		applyDirectStyles(instance);
	});
	return instance;
}
function useVirtualizer(options) {
	return useVirtualizerBase({
		observeElementRect,
		observeElementOffset,
		scrollToFn: elementScroll,
		...options
	});
}
//#endregion
//#region src/components/context-view/feed-rows.tsx
const DaySeparator = (0, import_react.memo)(function DaySeparator({ date }) {
	const today = /* @__PURE__ */ new Date();
	const yesterday = /* @__PURE__ */ new Date(today.getTime() - 864e5);
	const label = date.toDateString() === today.toDateString() ? "Today" : date.toDateString() === yesterday.toDateString() ? "Yesterday" : date.toLocaleDateString(void 0, {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: date.getFullYear() === today.getFullYear() ? void 0 : "numeric"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline gap-x-3.5 px-3 sm:px-4 pt-3 pb-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowGutter, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-semibold text-foreground/75",
			children: label
		})]
	});
});
function Chevron({ open }) {
	return open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3 shrink-0 self-center text-muted-foreground/70" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3 shrink-0 self-center text-muted-foreground/70" });
}
/** The same fact `events.length` times in a row: its sentence once, the count, the span of time. */
const RepeatRow = (0, import_react.memo)(function RepeatRow({ itemKey, events, previous, renderers, showWho, open, onToggle }) {
	const first = events[0];
	const last = events.at(-1);
	const who = actorLabel(first);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onToggle(itemKey),
		"aria-expanded": open,
		className: rowClass(),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowOffset, { offset: first.offset }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowTimes, {
				event: first,
				previous
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: cn(rowBody, "flex items-baseline gap-1.5"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventSentence, {
						event: first,
						renderers,
						className: "min-w-0"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "shrink-0 text-[11px] text-muted-foreground tabular-nums",
						title: `${String(events.length)} times, ${formatClockTime(Date.parse(first.createdAt))} – ${formatClockTime(Date.parse(last.createdAt))}`,
						children: ["×", events.length]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chevron, { open })
				]
			}),
			showWho && who ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowWho, { who }) : null
		]
	});
});
/** A run of the platform's housekeeping: one quiet line saying how much of what; open for the rows. */
const HousekeepingRow = (0, import_react.memo)(function HousekeepingRow({ itemKey, events, previous, open, onToggle }) {
	const first = events[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onToggle(itemKey),
		"aria-expanded": open,
		className: cn(rowClass(), "text-muted-foreground"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowOffset, { offset: first.offset }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowTimes, {
				event: first,
				previous
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: cn(rowBody, "flex items-baseline gap-1 text-[13px]"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chevron, { open }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "truncate",
					children: [
						events.length,
						" housekeeping · ",
						housekeepingSummary(events.map((e) => e.type))
					]
				})]
			})
		]
	});
});
//#endregion
//#region src/components/context-view/stick-to-bottom.ts
/** How close (px) to the bottom a user scroll must land to re-engage the stick. */
const RESTICK_EPSILON_PX = 2;
function useStickToBottom({ scrollElementRef, contentElementRef }) {
	const stuck = (0, import_react.useRef)(true);
	const [stuckState, setStuckState] = (0, import_react.useState)(true);
	const resizeObserverRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const scroller = scrollElementRef.current;
		if (!scroller) return;
		const restick = () => {
			if (stuck.current) scroller.scrollTop = scroller.scrollHeight;
		};
		const resizeObserver = new ResizeObserver(restick);
		resizeObserverRef.current = resizeObserver;
		resizeObserver.observe(scroller);
		if (contentElementRef.current) resizeObserver.observe(contentElementRef.current);
		const release = (event) => {
			if (!stuck.current) return;
			console.debug(`[stick-to-bottom] released: user-input:${event.type}`);
			stuck.current = false;
			setStuckState(false);
		};
		const onWheel = (event) => {
			if (event.deltaY < 0) release(event);
		};
		const onScroll = () => {
			if (stuck.current) return;
			if (scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop > RESTICK_EPSILON_PX) return;
			stuck.current = true;
			setStuckState(true);
		};
		const releaseEvents = [
			"touchstart",
			"keydown",
			"pointerdown"
		];
		for (const name of releaseEvents) scroller.addEventListener(name, release, { passive: true });
		scroller.addEventListener("wheel", onWheel, { passive: true });
		scroller.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			resizeObserver.disconnect();
			resizeObserverRef.current = null;
			for (const name of releaseEvents) scroller.removeEventListener(name, release);
			scroller.removeEventListener("wheel", onWheel);
			scroller.removeEventListener("scroll", onScroll);
		};
	}, [scrollElementRef, contentElementRef]);
	(0, import_react.useEffect)(() => {
		if (contentElementRef.current) resizeObserverRef.current?.observe(contentElementRef.current);
	});
	return {
		stuckRef: stuck,
		stuck: stuckState,
		stick: (0, import_react.useCallback)(() => {
			stuck.current = true;
			setStuckState(true);
			const scroller = scrollElementRef.current;
			if (scroller) scroller.scrollTop = scroller.scrollHeight;
		}, [scrollElementRef]),
		release: (0, import_react.useCallback)(() => {
			stuck.current = false;
			setStuckState(false);
		}, [])
	};
}
//#endregion
//#region src/components/context-view/feed-list.tsx
/** Older pages are asked for when the top of the view is within this many rows of row 0. */
const LOAD_OLDER_WITHIN_ROWS = 40;
function FeedList({ items, namedBefore, mode, renderers, inspected, onInspect, opened, onToggle, older, followTail, empty }) {
	const { rows, itemIndexOf } = (0, import_react.useMemo)(() => {
		if (opened.size === 0) return {
			rows: items,
			itemIndexOf: null
		};
		const rows = [];
		const itemIndexOf = [];
		items.forEach((item, index) => {
			rows.push(item);
			itemIndexOf.push(index);
			if (item.kind === "day" || item.kind === "event" || !opened.has(item.key)) return;
			item.events.forEach((event, at) => {
				rows.push({
					kind: "member",
					key: `${item.key}/${String(event.offset)}`,
					event,
					previous: at === 0 ? lastEventOf(items[index - 1]) : item.events[at - 1],
					quiet: item.kind === "housekeeping"
				});
				itemIndexOf.push(-1);
			});
		});
		return {
			rows,
			itemIndexOf
		};
	}, [items, opened]);
	const scrollRef = (0, import_react.useRef)(null);
	const contentRef = (0, import_react.useRef)(null);
	const { stuckRef, stuck, stick, release } = useStickToBottom({
		scrollElementRef: scrollRef,
		contentElementRef: contentRef
	});
	(0, import_react.useEffect)(() => {
		if (followTail) stick();
	}, [followTail, stick]);
	const { loadOlder, loading, exhausted } = older;
	const top = exhausted ? 0 : 1;
	const getItemKey = (0, import_react.useCallback)((index) => index < top ? "top" : rows[index - top].key, [rows, top]);
	const estimateSize = (0, import_react.useCallback)((index) => {
		const row = index < top ? void 0 : rows[index - top];
		if (!row) return 28;
		if (row.kind === "day") return 36;
		if (row.kind === "member") return row.quiet ? 26 : 42;
		if (row.kind !== "event") return 26;
		return mode === "pretty-raw" ? 42 : 26;
	}, [
		rows,
		mode,
		top
	]);
	const virtualizer = useVirtualizer({
		count: rows.length + top,
		getScrollElement: () => scrollRef.current,
		estimateSize,
		getItemKey,
		anchorTo: "end",
		followOnAppend: false,
		scrollEndThreshold: 80,
		overscan: 16,
		paddingStart: 4,
		paddingEnd: 8
	});
	const virtualItems = virtualizer.getVirtualItems();
	const revealRef = (0, import_react.useRef)(void 0);
	(0, import_react.useEffect)(() => {
		revealRef.current = inspected;
	}, [inspected]);
	(0, import_react.useEffect)(() => {
		const offset = revealRef.current;
		if (offset === void 0 || rows.length === 0) return;
		revealRef.current = void 0;
		const index = rows.findIndex((row) => rowOffset(row) === offset);
		if (index < 0) return;
		release();
		virtualizer.scrollToIndex(index + top, { align: "auto" });
	});
	const lastOffset = rows.length > 0 ? lastOffsetOf(rows[rows.length - 1]) : 0;
	const leftAtRef = (0, import_react.useRef)(lastOffset);
	if (stuck) leftAtRef.current = lastOffset;
	let arrived = 0;
	if (!stuck) {
		for (let at = rows.length - 1; at >= 0 && lastOffsetOf(rows[at]) > leftAtRef.current; at--) if (rows[at].kind !== "day") arrived += 1;
	}
	const firstInView = virtualItems[0]?.index ?? 0;
	(0, import_react.useEffect)(() => {
		const scroller = scrollRef.current;
		if (!scroller || loading || exhausted || rows.length === 0) return;
		const fits = scroller.scrollHeight <= scroller.clientHeight;
		if (firstInView < LOAD_OLDER_WITHIN_ROWS && (fits || !stuckRef.current)) loadOlder();
	}, [
		firstInView,
		loading,
		exhausted,
		loadOlder,
		rows.length,
		stuckRef
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: scrollRef,
			role: "log",
			"aria-label": "Events",
			className: "min-h-0 flex-1 overflow-y-auto overscroll-contain",
			children: rows.length === 0 ? empty : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: contentRef,
				className: "relative w-full",
				style: { height: virtualizer.getTotalSize() },
				children: virtualItems.map((virtualItem) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-index": virtualItem.index,
					ref: virtualizer.measureElement,
					className: "absolute top-0 left-0 w-full",
					style: { transform: `translateY(${String(virtualItem.start)}px)` },
					children: virtualItem.index < top ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OlderRow, {
						loading,
						onLoad: loadOlder
					}) : renderRow(virtualItem.index - top)
				}, virtualItem.key))
			})
		}), stuck || rows.length === 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: stick,
			className: "absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm hover:text-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-3.5" }),
				"Jump to latest",
				arrived > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "tabular-nums text-foreground",
					children: [
						"· ",
						arrived,
						" new"
					]
				}) : null
			]
		})]
	});
	function renderRow(index) {
		const row = rows[index];
		if (row.kind === "member") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventRow, {
			event: row.event,
			previous: row.previous,
			renderers,
			mode: row.quiet ? "pretty" : "pretty-raw",
			showWho: false,
			quiet: row.quiet,
			selected: inspected === row.event.offset,
			onOpen: onInspect
		});
		if (row.kind === "day") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DaySeparator, { date: row.date });
		const itemIndex = itemIndexOf ? itemIndexOf[index] : index;
		const previous = lastEventOf(items[itemIndex - 1]);
		const first = row.kind === "event" ? row.event : row.events[0];
		const showWho = actorLabel(first) !== namedBefore[itemIndex];
		if (row.kind === "repeat") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RepeatRow, {
			itemKey: row.key,
			events: row.events,
			previous,
			renderers,
			showWho,
			open: opened.has(row.key),
			onToggle
		});
		if (row.kind === "housekeeping") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HousekeepingRow, {
			itemKey: row.key,
			events: row.events,
			previous,
			open: opened.has(row.key),
			onToggle
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventRow, {
			event: row.event,
			previous,
			renderers,
			mode,
			showWho,
			selected: inspected === row.event.offset,
			onOpen: onInspect
		});
	}
}
/** The event a row opens in the inspector: an event's, an opened fold member's; none for a day
*  mark or a fold (they open in place). */
function rowOffset(row) {
	return row.kind === "event" || row.kind === "member" ? row.event.offset : void 0;
}
/** The last offset a row covers (a day mark: 0 — it never ends the list). */
function lastOffsetOf(row) {
	return row.kind === "member" ? row.event.offset : lastEventOf(row)?.offset ?? 0;
}
/** The top of what is loaded, while there is more below it: a way to read the page below, or that
*  page being read — in the body column, one height either way, so the rows below never shift. */
function OlderRow({ loading, onLoad }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-7 items-center gap-x-3.5 px-3 sm:px-4 text-xs text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowGutter, { times: true }), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, {}), " Loading older events…"]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onLoad,
			className: "underline-offset-2 hover:underline",
			children: "Load older events"
		})]
	});
}
//#endregion
//#region src/components/context-view/append-completions.ts
/** Every type a processor here consumes (wildcards name no one type) and every type in the log,
*  each once: consumed first (by name), then the log's by count. */
function knownEventTypes(counts, processors) {
	const consumers = /* @__PURE__ */ new Map();
	for (const processor of processors) for (const type of processor.consumes || []) if (!type.includes("*")) consumers.set(type, [...consumers.get(type) || [], processor.name]);
	const inLog = new Map(counts);
	const known = [...consumers.keys()].sort().map((type) => ({
		type,
		section: "Consumed here",
		detail: `${consumers.get(type).join(", ")}${inLog.has(type) ? ` · ${inLogCount(inLog.get(type))}` : ""}`
	}));
	for (const [type, count] of counts) if (!consumers.has(type)) known.push({
		type,
		section: "In the log",
		detail: inLogCount(count)
	});
	return known;
}
const inLogCount = (count) => `${count.toLocaleString()} in the log`;
const FIELDS$1 = [
	{
		key: "type",
		detail: "the event type"
	},
	{
		key: "payload",
		detail: "a mapping"
	},
	{
		key: "metadata",
		detail: "a mapping"
	},
	{
		key: "idempotencyKey",
		detail: "appends once per key"
	}
];
/** The completions at `pos` in the draft `text`, or null where there are none. `explicit` is a
*  request (Ctrl+Space): a field name is offered on an empty line only then. */
function appendCompletionsAt(text, pos, explicit, known) {
	const lineStart = text.lastIndexOf("\n", pos - 1) + 1;
	const before = text.slice(lineStart, pos);
	const typeValue = /^(?:\s*-\s+|\s*)type:\s*["']?([\w./@-]*)$/.exec(before);
	if (typeValue) return {
		from: pos - typeValue[1].length,
		validFor: /^[\w./@-]*$/,
		options: known.map(({ type, detail, section }, index) => ({
			label: type,
			boost: Math.max(-99, 99 - index),
			displayLabel: shortEventType(type),
			detail,
			section
		}))
	};
	const list = /^\s*-/.test(text);
	const field = (list ? /^(?:- | {2})([A-Za-z]*)$/ : /^([A-Za-z]*)$/).exec(before);
	if (!field || !field[1] && !explicit) return null;
	const indent = list ? "  " : "";
	const written = list ? /* @__PURE__ */ new Set() : new Set(text.match(/^[A-Za-z]+(?=:)/gm));
	return {
		from: pos - field[1].length,
		validFor: /^[A-Za-z]*$/,
		options: FIELDS$1.filter(({ key }) => !written.has(key)).map(({ key, detail }) => ({
			label: key,
			detail,
			apply: key === "payload" || key === "metadata" ? `${key}:\n${indent}  ` : `${key}: `
		}))
	};
}
//#endregion
//#region src/components/context-view/append-events.ts
/** A prefilled draft: a type opaque to the platform (no `events.iterate.com/` prefix — see
*  core/lib/README.md#event-types), so a stray append never reads as one of its facts. */
const DEFAULT_APPEND_YAML = "type: manual/note-added\npayload:\n  text: Hello\n";
const FIELDS = /* @__PURE__ */ new Set([
	"type",
	"payload",
	"metadata",
	"idempotencyKey"
]);
/** The events the YAML names, or why it names none. An empty draft is an error too: nothing to send. */
function parseAppendYaml(text) {
	let parsed;
	try {
		parsed = parse$1(text);
	} catch (error) {
		return { error: `Not YAML: ${error instanceof Error ? error.message : String(error)}` };
	}
	if (parsed == null) return { error: "Nothing to append." };
	const list = Array.isArray(parsed) ? parsed : [parsed];
	if (list.length === 0) return { error: "Nothing to append." };
	const events = [];
	for (const [index, entry] of list.entries()) {
		const where = Array.isArray(parsed) ? `Event ${String(index + 1)}: ` : "";
		if (!isObject(entry)) return { error: `${where}an event is a mapping with a \`type\`.` };
		const unknown = Object.keys(entry).find((key) => !FIELDS.has(key));
		if (unknown) return { error: `${where}unknown field \`${unknown}\`.` };
		const { type, payload, metadata, idempotencyKey } = entry;
		if (typeof type !== "string" || type.trim() === "") return { error: `${where}\`type\` must be a non-empty string.` };
		if (payload !== void 0 && !isObject(payload)) return { error: `${where}\`payload\` must be a mapping.` };
		if (metadata !== void 0 && !isObject(metadata)) return { error: `${where}\`metadata\` must be a mapping.` };
		if (idempotencyKey !== void 0 && typeof idempotencyKey !== "string") return { error: `${where}\`idempotencyKey\` must be a string.` };
		events.push({
			type,
			payload,
			metadata,
			idempotencyKey
		});
	}
	return { events };
}
/** A draft for one type, as the examples load it. */
function exampleYaml(type) {
	return stringify({
		type,
		payload: {}
	});
}
/** The examples a person can load, grouped by the processors that consume them (one group per
*  processor): what some processor here reacts to. Processors that
*  consume the same types share one group (a tab's live-state subscribers are many and alike), named
*  by the first and how many more; a type shows once, in its first group. Wildcards (`*`, `…/*`)
*  name no one type and are left out; a group with no type left is dropped. */
function exampleGroups(processors) {
	const byTypes = /* @__PURE__ */ new Map();
	for (const processor of [...processors].sort((a, b) => a.name.localeCompare(b.name))) {
		const types = [...new Set(processor.consumes || [])].filter((type) => !type.includes("*")).sort();
		const key = types.join("\n");
		const group = byTypes.get(key) || {
			names: [],
			types
		};
		group.names.push(processor.name);
		byTypes.set(key, group);
	}
	const shown = /* @__PURE__ */ new Set();
	const groups = [];
	for (const { names, types } of byTypes.values()) {
		const fresh = types.filter((type) => !shown.has(type));
		for (const type of fresh) shown.add(type);
		if (fresh.length === 0) continue;
		const label = names.length > 1 ? `${names[0]} +${String(names.length - 1)}` : names[0];
		groups.push({
			label,
			types: fresh
		});
	}
	return groups;
}
function isObject(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
//#endregion
//#region src/components/code-editor.tsx
const LazyEditor = (0, import_react.lazy)(async () => {
	return { default: (await import("../../code-editor.client.mjs")).CodeEditor };
});
function CodeEditor(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyEditor, { ...props })
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/positioner/MenuPositionerContext.mjs
const MenuPositionerContext = /*#__PURE__*/ import_react.createContext(void 0);
function useMenuPositionerContext(optional) {
	const context = import_react.useContext(MenuPositionerContext);
	if (context === void 0 && !optional) throw new Error(formatErrorMessage(33));
	return context;
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/root/MenuRootContext.mjs
const MenuRootContext = /*#__PURE__*/ import_react.createContext(void 0);
function useMenuRootContext(optional) {
	const context = import_react.useContext(MenuRootContext);
	if (context === void 0 && !optional) throw new Error(formatErrorMessage(36));
	return context;
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/context-menu/root/ContextMenuRootContext.mjs
const ContextMenuRootContext = /*#__PURE__*/ import_react.createContext(void 0);
function useContextMenuRootContext(optional = true) {
	const context = import_react.useContext(ContextMenuRootContext);
	if (context === void 0 && !optional) throw new Error(formatErrorMessage(25));
	return context;
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+utils@0.4.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/utils/useControlled.mjs
function useControlled({ controlled, default: defaultProp, name, state = "value" }) {
	const { current: isControlled } = import_react.useRef(controlled !== void 0);
	const [valueState, setValue] = import_react.useState(defaultProp);
	return [isControlled && controlled !== void 0 ? controlled : valueState, import_react.useCallback((newValue) => {
		if (!isControlled) setValue(newValue);
	}, [])];
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/item/useMenuItemCommonProps.mjs
/**
* Returns common props shared by all menu item types.
* This hook extracts the shared logic for id, role, tabIndex, onKeyDown,
* onMouseMove, onClick, and onMouseUp handlers.
*/
function useMenuItemCommonProps(params) {
	const { closeOnClick, highlighted, id, nodeId, store, typingRef, itemRef, itemMetadata } = params;
	const { events: menuEvents } = store.useState("floatingTreeRoot");
	const open = store.useState("open");
	const contextMenuContext = useContextMenuRootContext(true);
	const isContextMenu = contextMenuContext !== void 0;
	return import_react.useMemo(() => ({
		id,
		role: "menuitem",
		tabIndex: open && highlighted ? 0 : -1,
		onKeyDown(event) {
			if (event.key === " " && typingRef?.current) event.preventDefault();
		},
		onMouseMove(event) {
			if (!nodeId) return;
			menuEvents.emit("itemhover", {
				nodeId,
				target: event.currentTarget
			});
		},
		onClick(event) {
			if (closeOnClick) menuEvents.emit("close", {
				domEvent: event,
				reason: itemPress
			});
		},
		onMouseUp(event) {
			if (contextMenuContext) {
				const initialCursorPoint = contextMenuContext.initialCursorPointRef.current;
				contextMenuContext.initialCursorPointRef.current = null;
				if (isContextMenu && initialCursorPoint && Math.abs(event.clientX - initialCursorPoint.x) <= 1 && Math.abs(event.clientY - initialCursorPoint.y) <= 1) return;
				if (isContextMenu && !mac && event.button === 2) return;
			}
			if (itemRef.current && store.context.allowMouseUpTriggerRef.current && (!isContextMenu || event.button === 2)) {
				if (itemMetadata.type === "regular-item") dispatchClickWithModifiers(itemRef.current, event, { detail: 1 });
			}
		}
	}), [
		closeOnClick,
		highlighted,
		id,
		menuEvents,
		nodeId,
		open,
		store,
		typingRef,
		itemRef,
		contextMenuContext,
		isContextMenu,
		itemMetadata
	]);
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/item/useMenuItem.mjs
const REGULAR_ITEM = { type: "regular-item" };
function useMenuItem(params) {
	const { closeOnClick, disabled, highlighted, id, store, typingRef = store.context.typingRef, nativeButton, itemMetadata, nodeId } = params;
	const itemRef = import_react.useRef(null);
	const { getButtonProps, buttonRef } = useButton({
		disabled,
		focusableWhenDisabled: true,
		native: nativeButton,
		composite: true
	});
	const commonProps = useMenuItemCommonProps({
		closeOnClick,
		highlighted,
		id,
		nodeId,
		store,
		typingRef,
		itemRef,
		itemMetadata
	});
	const getItemProps = import_react.useCallback((externalProps) => {
		return mergeProps(commonProps, { onMouseEnter() {
			if (itemMetadata.type !== "submenu-trigger") return;
			itemMetadata.setActive();
		} }, externalProps, getButtonProps);
	}, [
		commonProps,
		getButtonProps,
		itemMetadata
	]);
	const mergedRef = useMergedRefs(itemRef, buttonRef);
	return import_react.useMemo(() => ({
		getItemProps,
		itemRef: mergedRef
	}), [getItemProps, mergedRef]);
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/internals/composite/list/CompositeListContext.mjs
const CompositeListContext = /*#__PURE__*/ import_react.createContext({
	register: () => {},
	unregister: () => {},
	subscribeMapChange: () => () => {},
	nextIndexRef: { current: 0 }
});
function useCompositeListContext() {
	return import_react.useContext(CompositeListContext);
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/internals/composite/list/useCompositeListItem.mjs
/**
* Used to register a list item and its index (DOM position) in the `CompositeList`.
*/
function useCompositeListItem(params = {}) {
	const { guess, label, metadata, textRef, index: externalIndex } = params;
	const { register, unregister, subscribeMapChange, nextIndexRef } = useCompositeListContext();
	const indexRef = import_react.useRef(-1);
	const [internalIndex, setInternalIndex] = import_react.useState(externalIndex == null && guess ? () => {
		if (indexRef.current === -1) {
			const newIndex = nextIndexRef.current;
			nextIndexRef.current += 1;
			indexRef.current = newIndex;
		}
		return indexRef.current;
	} : -1);
	const index = externalIndex ?? internalIndex;
	const componentRef = import_react.useRef(null);
	const ref = import_react.useCallback((node) => {
		const previousNode = componentRef.current;
		if (previousNode) unregister(previousNode);
		componentRef.current = node;
		if (node) register(node, {
			metadata: metadata ?? null,
			index: externalIndex ?? null,
			label,
			textRef
		});
	}, [
		externalIndex,
		register,
		unregister,
		metadata,
		label,
		textRef
	]);
	useIsoLayoutEffect(() => {
		if (externalIndex != null) return;
		return subscribeMapChange((map) => {
			const i = componentRef.current ? map.get(componentRef.current)?.index : null;
			if (i != null) setInternalIndex(i);
		});
	}, [externalIndex, subscribeMapChange]);
	return {
		ref,
		index
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/group/MenuGroupContext.mjs
const MenuGroupContext = /*#__PURE__*/ import_react.createContext(void 0);
function useMenuGroupRootContext() {
	const context = import_react.useContext(MenuGroupContext);
	if (context === void 0) throw new Error(formatErrorMessage(31));
	return context;
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/group/MenuGroup.mjs
/**
* Groups related menu items with the corresponding label.
* Renders a `<div>` element.
*
* Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
*/
const MenuGroup = /*#__PURE__*/ import_react.forwardRef(function MenuGroup(componentProps, forwardedRef) {
	const { render, className, style, ...elementProps } = componentProps;
	const [labelId, setLabelId] = import_react.useState(void 0);
	const element = useRenderElement("div", componentProps, {
		ref: forwardedRef,
		props: {
			role: "group",
			"aria-labelledby": labelId,
			...elementProps
		}
	});
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(MenuGroupContext.Provider, {
		value: setLabelId,
		children: element
	});
});
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/group-label/MenuGroupLabel.mjs
/**
* An accessible label that is automatically associated with its parent group.
* Renders a `<div>` element.
*
* Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
*/
const MenuGroupLabel = /*#__PURE__*/ import_react.forwardRef(function MenuGroupLabel(componentProps, forwardedRef) {
	const { render, className, style, id: idProp, ...elementProps } = componentProps;
	const id = useBaseUiId(idProp);
	const setLabelId = useMenuGroupRootContext();
	useIsoLayoutEffect(() => {
		setLabelId(id);
		return () => {
			setLabelId((currentId) => currentId === id ? void 0 : currentId);
		};
	}, [setLabelId, id]);
	return useRenderElement("div", componentProps, {
		ref: forwardedRef,
		props: {
			id,
			"aria-hidden": true,
			...elementProps
		}
	});
});
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/item/MenuItem.mjs
/**
* An individual interactive item in the menu.
* Renders a `<div>` element.
*
* Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
*/
const MenuItem = /*#__PURE__*/ import_react.forwardRef(function MenuItem(componentProps, forwardedRef) {
	const { render, className, id: idProp, label, nativeButton = false, disabled: disabledProp = false, closeOnClick = true, style, ...elementProps } = componentProps;
	const listItem = useCompositeListItem({
		guess: true,
		label
	});
	const menuPositionerContext = useMenuPositionerContext(true);
	const id = useBaseUiId(idProp);
	const { store } = useMenuRootContext();
	const rootDisabled = store.useState("disabled");
	const disabled = disabledProp || rootDisabled;
	const highlighted = store.useState("isActive", listItem.index);
	const itemProps = store.useState("itemProps");
	const { getItemProps, itemRef } = useMenuItem({
		closeOnClick,
		disabled,
		highlighted,
		id,
		store,
		nativeButton,
		nodeId: menuPositionerContext?.context.nodeId,
		itemMetadata: REGULAR_ITEM
	});
	return useRenderElement("div", componentProps, {
		state: {
			disabled,
			highlighted
		},
		props: [
			itemProps,
			elementProps,
			getItemProps
		],
		ref: [
			itemRef,
			forwardedRef,
			listItem.ref
		]
	});
});
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/toolbar/root/ToolbarRootContext.mjs
const ToolbarRootContext = /*#__PURE__*/ import_react.createContext(void 0);
function useToolbarRootContext(optional) {
	const context = import_react.useContext(ToolbarRootContext);
	if (context === void 0 && !optional) throw new Error(formatErrorMessage(69));
	return context;
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/popup/MenuPopup.mjs
/**
* A container for the menu items.
* Renders a `<div>` element.
*
* Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
*/
const MenuPopup = /*#__PURE__*/ import_react.forwardRef(function MenuPopup(componentProps, forwardedRef) {
	const { render, className, style, finalFocus, ...elementProps } = componentProps;
	const { store } = useMenuRootContext();
	const { side, align } = useMenuPositionerContext();
	const insideToolbar = useToolbarRootContext(true) != null;
	const open = store.useState("open");
	const transitionStatus = store.useState("transitionStatus");
	const popupProps = store.useState("popupProps");
	const mounted = store.useState("mounted");
	const instantType = store.useState("instantType");
	const activeTriggerElement = store.useState("activeTriggerElement");
	const parent = store.useState("parent");
	const lastOpenChangeReason = store.useState("lastOpenChangeReason");
	const rootId = store.useState("rootId");
	const floatingContext = store.useState("floatingRootContext");
	const floatingTreeRoot = store.useState("floatingTreeRoot");
	const closeDelay = store.useState("closeDelay");
	const hoverEnabled = store.useState("hoverEnabled");
	const disabled = store.useState("disabled");
	const openMethod = store.useState("openMethod");
	const isContextMenu = parent.type === "context-menu";
	useOpenChangeComplete({
		open,
		ref: store.context.popupRef,
		onComplete() {
			if (open) store.context.onOpenChangeComplete?.(true);
		}
	});
	import_react.useEffect(() => {
		function handleClose(event) {
			store.setOpen(false, createChangeEventDetails(event.reason, event.domEvent));
		}
		floatingTreeRoot.events.on("close", handleClose);
		return () => {
			floatingTreeRoot.events.off("close", handleClose);
		};
	}, [floatingTreeRoot.events, store]);
	useHoverFloatingInteraction(floatingContext, {
		enabled: hoverEnabled && !disabled && !isContextMenu && parent.type !== "menubar",
		closeDelay
	});
	const setPopupElement = store.useStateSetter("popupElement");
	const state = {
		transitionStatus,
		side,
		align,
		open,
		nested: parent.type === "menu",
		instant: instantType
	};
	const element = useRenderElement("div", componentProps, {
		state,
		ref: [
			forwardedRef,
			store.context.popupRef,
			setPopupElement
		],
		stateAttributesMapping: popupTransitionStateMapping,
		props: [
			popupProps,
			{ onKeyDown(event) {
				if (insideToolbar && COMPOSITE_KEYS.has(event.key)) event.stopPropagation();
			} },
			getDisabledMountTransitionStyles(transitionStatus),
			elementProps,
			{ "data-rootownerid": rootId }
		]
	});
	let returnFocus = parent.type === void 0 || isContextMenu;
	if (activeTriggerElement || parent.type === "menubar" && lastOpenChangeReason !== "outside-press") returnFocus = true;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingFocusManager, {
		context: floatingContext,
		openInteractionType: openMethod,
		modal: isContextMenu,
		disabled: !mounted,
		returnFocus: finalFocus === void 0 ? returnFocus : finalFocus,
		initialFocus: parent.type !== "menu",
		restoreFocus: true,
		externalTree: parent.type !== "menubar" ? floatingTreeRoot : void 0,
		previousFocusableElement: activeTriggerElement,
		nextFocusableElement: parent.type === void 0 ? store.context.triggerFocusTargetRef : void 0,
		beforeContentFocusGuardRef: parent.type === void 0 ? store.context.beforeContentFocusGuardRef : void 0,
		children: element
	});
});
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/portal/MenuPortalContext.mjs
const MenuPortalContext = /*#__PURE__*/ import_react.createContext(void 0);
function useMenuPortalContext() {
	const value = import_react.useContext(MenuPortalContext);
	if (value === void 0) throw new Error(formatErrorMessage(32));
	return value;
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/portal/MenuPortal.mjs
/**
* A portal element that moves the popup to a different part of the DOM.
* By default, the portal element is appended to `<body>`.
* Renders a `<div>` element.
*
* Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
*/
const MenuPortal = /*#__PURE__*/ import_react.forwardRef(function MenuPortal(props, forwardedRef) {
	const { keepMounted = false, ...portalProps } = props;
	const { store, parent } = useMenuRootContext();
	if (!(store.useState("mounted") || keepMounted)) return null;
	const portalOwnerRole = parent.type === "menu" || parent.type === "menubar" ? "group" : void 0;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(MenuPortalContext.Provider, {
		value: keepMounted,
		children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingPortal, {
			ref: forwardedRef,
			...portalProps,
			portalOwnerRole
		})
	});
});
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/internals/composite/list/CompositeList.mjs
/**
* Provides context for a list of items in a composite component.
*/
function CompositeList(props) {
	const { children, elementsRef, labelsRef, onMapChange: onMapChangeProp } = props;
	const onMapChange = useStableCallback(onMapChangeProp);
	const [, setMapTick] = import_react.useState(false);
	const listeners = useRefWithInit(createListeners).current;
	const map = useRefWithInit(createMap).current;
	const nextIndexRef = import_react.useRef(0);
	const isDirtyRef = import_react.useRef(true);
	const itemsRef = import_react.useRef(null);
	const mutationObserverRef = import_react.useRef(null);
	const scheduleMapUpdate = useStableCallback(() => {
		if (isDirtyRef.current) return;
		isDirtyRef.current = true;
		setMapTick((tick) => !tick);
	});
	const register = useStableCallback((node, registration) => {
		map.set(node, registration);
		scheduleMapUpdate();
	});
	const unregister = useStableCallback((node) => {
		map.delete(node);
		scheduleMapUpdate();
	});
	const syncRefs = useStableCallback((items) => {
		const nextMap = /* @__PURE__ */ new Map();
		elementsRef.current.length = 0;
		if (labelsRef) labelsRef.current.length = 0;
		items.forEach((item) => {
			nextMap.set(item.element, {
				...item.registration.metadata ?? {},
				index: item.index
			});
			elementsRef.current[item.index] = item.element;
			if (labelsRef) labelsRef.current[item.index] = item.registration.label !== void 0 ? item.registration.label : item.registration.textRef?.current?.textContent ?? item.element.textContent;
		});
		nextIndexRef.current = elementsRef.current.length;
		return nextMap;
	});
	function observe(sortedNodes) {
		mutationObserverRef.current?.disconnect();
		mutationObserverRef.current = null;
		if (typeof MutationObserver !== "function" || sortedNodes.length < 2) return;
		const mutationObserver = new MutationObserver((entries) => {
			if (!hasMovedNode(entries)) return;
			let previousConnectedNode = null;
			for (const node of sortedNodes) {
				if (!node.isConnected) continue;
				if (previousConnectedNode && sortByDocumentPosition(previousConnectedNode, node) > 0) {
					mutationObserver.disconnect();
					scheduleMapUpdate();
					return;
				}
				previousConnectedNode = node;
			}
		});
		mutationObserverRef.current = mutationObserver;
		const roots = /* @__PURE__ */ new Set();
		for (let i = 1; i < sortedNodes.length; i += 1) {
			const root = getCommonAncestor(sortedNodes[i - 1], sortedNodes[i]);
			if (root) roots.add(root);
		}
		roots.forEach((root) => mutationObserver.observe(root, { childList: true }));
	}
	const flush = useStableCallback(() => {
		const [items, automaticNodes] = getCompositeListSnapshot(map);
		const nextMap = syncRefs(items);
		const previousItems = itemsRef.current;
		const changed = !previousItems || previousItems.length !== items.length || items.some((item, index) => {
			const previousItem = previousItems[index];
			return item.index !== previousItem.index || item.element !== previousItem.element || item.registration.index !== previousItem.registration.index || item.registration.metadata !== previousItem.registration.metadata;
		});
		observe(automaticNodes);
		itemsRef.current = items;
		isDirtyRef.current = false;
		if (!changed) return;
		listeners.forEach((listener) => listener(nextMap));
		onMapChange(nextMap);
	});
	useIsoLayoutEffect(() => {
		if (!isDirtyRef.current && itemsRef.current) syncRefs(itemsRef.current);
		return () => {
			elementsRef.current = [];
			if (labelsRef) labelsRef.current = [];
		};
	}, [
		elementsRef,
		labelsRef,
		syncRefs
	]);
	useIsoLayoutEffect(() => {
		if (isDirtyRef.current) flush();
	});
	useIsoLayoutEffect(() => {
		return () => {
			mutationObserverRef.current?.disconnect();
			isDirtyRef.current = true;
		};
	}, []);
	const subscribeMapChange = useStableCallback((fn) => {
		listeners.add(fn);
		return () => {
			listeners.delete(fn);
		};
	});
	const contextValue = import_react.useMemo(() => ({
		register,
		unregister,
		subscribeMapChange,
		nextIndexRef
	}), [
		register,
		unregister,
		subscribeMapChange,
		nextIndexRef
	]);
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeListContext.Provider, {
		value: contextValue,
		children
	});
}
function createMap() {
	return /* @__PURE__ */ new Map();
}
function createListeners() {
	return /* @__PURE__ */ new Set();
}
function getCompositeListSnapshot(map) {
	const reservedIndices = /* @__PURE__ */ new Set();
	const items = [];
	const automaticItems = [];
	map.forEach((registration, node) => {
		if (!node.isConnected) return;
		const index = registration.index;
		const item = {
			index: index ?? -1,
			element: node,
			registration
		};
		if (index === null) automaticItems.push(item);
		else if (index >= 0) {
			reservedIndices.add(index);
			items.push(item);
		}
	});
	let nextAutomaticIndex = 0;
	automaticItems.sort((a, b) => sortByDocumentPosition(a.element, b.element));
	automaticItems.forEach((item) => {
		while (reservedIndices.has(nextAutomaticIndex)) nextAutomaticIndex += 1;
		item.index = nextAutomaticIndex;
		items.push(item);
		nextAutomaticIndex += 1;
	});
	if (reservedIndices.size > 0) items.sort((a, b) => a.index - b.index);
	return [items, automaticItems.map((item) => item.element)];
}
function getCommonAncestor(firstNode, lastNode) {
	let ancestor = firstNode.parentElement;
	while (ancestor && !ancestor.contains(lastNode)) ancestor = ancestor.parentElement;
	return ancestor;
}
function hasMovedNode(entries) {
	for (const entry of entries) for (let i = 0; i < entry.removedNodes.length; i += 1) if (entry.removedNodes[i].isConnected) return true;
	return false;
}
function sortByDocumentPosition(a, b) {
	return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/utils/useAnchoredPopupScrollLock.mjs
const VIEWPORT_WIDTH_TOLERANCE_PX = 20;
/**
* Manages scroll lock for anchored popups. For non-touch opens, scroll lock is applied when
* enabled. For touch opens, scroll lock is applied only when the positioner width is effectively
* viewport-sized.
*/
function useAnchoredPopupScrollLock(enabled, touchOpen, positionerElement, referenceElement) {
	const [touchOpenShouldLockScroll, setTouchOpenShouldLockScroll] = import_react.useState(false);
	useIsoLayoutEffect(() => {
		if (!enabled || !touchOpen || positionerElement == null) {
			setTouchOpenShouldLockScroll(false);
			return;
		}
		const viewportWidth = ownerDocument(positionerElement).documentElement.clientWidth;
		const popupWidth = positionerElement.offsetWidth;
		setTouchOpenShouldLockScroll(viewportWidth > 0 && popupWidth > 0 && popupWidth >= viewportWidth - VIEWPORT_WIDTH_TOLERANCE_PX);
	}, [
		enabled,
		touchOpen,
		positionerElement
	]);
	useScrollLock(enabled && (!touchOpen || touchOpenShouldLockScroll), referenceElement);
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/positioner/MenuPositioner.mjs
/**
* Positions the menu popup against the trigger.
* Renders a `<div>` element.
*
* Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
*/
const MenuPositioner = /*#__PURE__*/ import_react.forwardRef(function MenuPositioner(componentProps, forwardedRef) {
	const { anchor: anchorProp, positionMethod: positionMethodProp = "absolute", className, render, side, align: alignProp, sideOffset: sideOffsetProp = 0, alignOffset: alignOffsetProp = 0, collisionBoundary = "clipping-ancestors", collisionPadding = 5, arrowPadding = 5, sticky = false, disableAnchorTracking = false, collisionAvoidance: collisionAvoidanceProp = DROPDOWN_COLLISION_AVOIDANCE, style, ...elementProps } = componentProps;
	const { store } = useMenuRootContext();
	const keepMounted = useMenuPortalContext();
	const contextMenuContext = useContextMenuRootContext(true);
	const parent = store.useState("parent");
	const floatingRootContext = store.useState("floatingRootContext");
	const floatingTreeRoot = store.useState("floatingTreeRoot");
	const mounted = store.useState("mounted");
	const open = store.useState("open");
	const modal = store.useState("modal");
	const openMethod = store.useState("openMethod");
	const triggerElement = store.useState("activeTriggerElement");
	const transitionStatus = store.useState("transitionStatus");
	const positionerElement = store.useState("positionerElement");
	const instantType = store.useState("instantType");
	const adaptiveOrigin = store.useState("adaptiveOrigin");
	const lastOpenChangeReason = store.useState("lastOpenChangeReason");
	const floatingNodeId = store.useState("floatingNodeId");
	const floatingParentNodeId = store.useState("floatingParentNodeId");
	const domReference = floatingRootContext.useState("domReferenceElement");
	const previousTriggerRef = import_react.useRef(null);
	const runOnceAnimationsFinish = useAnimationsFinished(positionerElement);
	let anchor = anchorProp;
	let sideOffset = sideOffsetProp;
	let alignOffset = alignOffsetProp;
	let align = alignProp;
	let collisionAvoidance = collisionAvoidanceProp;
	if (parent.type === "context-menu") {
		anchor = anchorProp ?? parent.context?.anchor;
		align = align ?? "start";
		if (!side && align !== "center") {
			alignOffset = componentProps.alignOffset ?? 2;
			sideOffset = componentProps.sideOffset ?? -5;
		}
	}
	let computedSide = side;
	let computedAlign = align;
	if (parent.type === "menu") {
		computedSide = computedSide ?? "inline-end";
		computedAlign = computedAlign ?? "start";
		collisionAvoidance = componentProps.collisionAvoidance ?? POPUP_COLLISION_AVOIDANCE;
	} else if (parent.type === "menubar") {
		computedSide = computedSide ?? (parent.context.orientation === "vertical" ? "inline-end" : "bottom");
		computedAlign = computedAlign ?? "start";
	}
	const contextMenu = parent.type === "context-menu";
	const positioner = useAnchorPositioning({
		anchor,
		floatingRootContext,
		positionMethod: contextMenuContext ? "fixed" : positionMethodProp,
		mounted,
		side: computedSide,
		sideOffset,
		align: computedAlign,
		alignOffset,
		arrowPadding: contextMenu ? 0 : arrowPadding,
		collisionBoundary,
		collisionPadding,
		sticky,
		nodeId: floatingNodeId,
		keepMounted,
		disableAnchorTracking,
		collisionAvoidance,
		shift: contextMenu ? {
			crossAxis: !("side" in collisionAvoidance && collisionAvoidance.side === "flip"),
			rootBoundary: "layoutViewport"
		} : void 0,
		externalTree: floatingTreeRoot,
		adaptiveOrigin
	});
	import_react.useEffect(() => {
		function onMenuOpenChange(details) {
			if (details.open) {
				if (details.parentNodeId === floatingNodeId) store.set("hoverEnabled", false);
				if (details.nodeId !== floatingNodeId && details.parentNodeId === store.select("floatingParentNodeId")) store.setOpen(false, createChangeEventDetails(siblingOpen));
			}
		}
		floatingTreeRoot.events.on("menuopenchange", onMenuOpenChange);
		return () => {
			floatingTreeRoot.events.off("menuopenchange", onMenuOpenChange);
		};
	}, [
		store,
		floatingTreeRoot.events,
		floatingNodeId
	]);
	import_react.useEffect(() => {
		if (store.select("floatingParentNodeId") == null) return;
		function onParentClose(details) {
			if (details.open || details.nodeId !== store.select("floatingParentNodeId")) return;
			const reason = details.reason ?? "sibling-open";
			store.setOpen(false, createChangeEventDetails(reason));
		}
		floatingTreeRoot.events.on("menuopenchange", onParentClose);
		return () => {
			floatingTreeRoot.events.off("menuopenchange", onParentClose);
		};
	}, [floatingTreeRoot.events, store]);
	const closeTimeout = useTimeout();
	import_react.useEffect(() => {
		if (!open) closeTimeout.clear();
	}, [open, closeTimeout]);
	import_react.useEffect(() => {
		function onItemHover(event) {
			if (!open || event.nodeId !== store.select("floatingParentNodeId")) return;
			if (event.target && triggerElement && triggerElement !== event.target) {
				const delay = store.select("closeDelay");
				if (delay > 0) {
					if (!closeTimeout.isStarted()) closeTimeout.start(delay, () => {
						store.setOpen(false, createChangeEventDetails(siblingOpen));
					});
				} else store.setOpen(false, createChangeEventDetails(siblingOpen));
			} else closeTimeout.clear();
		}
		floatingTreeRoot.events.on("itemhover", onItemHover);
		return () => {
			floatingTreeRoot.events.off("itemhover", onItemHover);
		};
	}, [
		floatingTreeRoot.events,
		open,
		triggerElement,
		store,
		closeTimeout
	]);
	import_react.useEffect(() => {
		const eventDetails = {
			open,
			nodeId: floatingNodeId,
			parentNodeId: floatingParentNodeId,
			reason: store.select("lastOpenChangeReason")
		};
		floatingTreeRoot.events.emit("menuopenchange", eventDetails);
	}, [
		floatingTreeRoot.events,
		open,
		store,
		floatingNodeId,
		floatingParentNodeId
	]);
	useIsoLayoutEffect(() => {
		const currentTrigger = domReference;
		const previousTrigger = previousTriggerRef.current;
		if (currentTrigger) previousTriggerRef.current = currentTrigger;
		if (previousTrigger && currentTrigger && currentTrigger !== previousTrigger) {
			store.set("instantType", void 0);
			const abortController = new AbortController();
			runOnceAnimationsFinish(() => {
				store.set("instantType", "trigger-change");
			}, abortController.signal);
			return () => {
				abortController.abort();
			};
		}
	}, [
		domReference,
		runOnceAnimationsFinish,
		store
	]);
	const state = {
		open,
		side: positioner.side,
		align: positioner.align,
		anchorHidden: positioner.anchorHidden,
		nested: parent.type === "menu",
		instant: instantType
	};
	const menubarModal = parent.type === "menubar" && parent.context.modal;
	useAnchoredPopupScrollLock(open && (menubarModal || modal && lastOpenChangeReason !== "trigger-hover"), openMethod === "touch", positionerElement, triggerElement);
	const element = usePositioner(componentProps, state, {
		styles: positioner.positionerStyles,
		transitionStatus,
		props: elementProps,
		refs: [forwardedRef, store.useStateSetter("positionerElement")],
		hidden: !mounted,
		inert: !open
	});
	const shouldRenderBackdrop = mounted && parent.type !== "menu" && (parent.type !== "menubar" && modal && lastOpenChangeReason !== "trigger-hover" || parent.type === "menubar" && parent.context.modal);
	let backdropCutout = null;
	if (parent.type === "menubar") backdropCutout = parent.context.contentElement;
	else if (parent.type === void 0) backdropCutout = triggerElement;
	return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(MenuPositionerContext.Provider, {
		value: positioner,
		children: [shouldRenderBackdrop && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(InternalBackdrop, {
			ref: parent.type === "context-menu" || parent.type === "nested-context-menu" ? parent.context.internalBackdropRef : null,
			inert: inertValue(!open),
			cutout: backdropCutout
		}), /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingNode, {
			id: floatingNodeId,
			children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeList, {
				elementsRef: store.context.itemDomElements,
				labelsRef: store.context.itemLabels,
				children: element
			})
		})]
	});
});
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menubar/MenubarContext.mjs
const MenubarContext = /*#__PURE__*/ import_react.createContext(null);
function useMenubarContext(optional) {
	const context = import_react.useContext(MenubarContext);
	if (context === null && !optional) throw new Error(formatErrorMessage(5));
	return context;
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/store/MenuStore.mjs
const selectors = {
	...popupStoreSelectors,
	disabled: (state) => state.parent.type === "menubar" ? state.parent.context.disabled || state.disabled : state.disabled,
	modal: (state) => (state.parent.type === void 0 || state.parent.type === "context-menu") && (state.modal ?? true),
	openMethod: (state) => state.openMethod,
	allowMouseEnter: (state) => state.allowMouseEnter,
	highlightItemOnHover: (state) => state.highlightItemOnHover,
	parent: (state) => state.parent,
	rootId: (state) => {
		if (state.parent.type === "menu") return state.parent.store.select("rootId");
		return state.parent.type !== void 0 ? state.parent.context.rootId : state.rootId;
	},
	activeIndex: (state) => state.activeIndex,
	isActive: (state, itemIndex) => state.activeIndex === itemIndex,
	hoverEnabled: (state) => state.hoverEnabled,
	instantType: (state) => state.instantType,
	lastOpenChangeReason: (state) => state.openChangeReason,
	floatingTreeRoot: (state) => {
		if (state.parent.type === "menu") return state.parent.store.select("floatingTreeRoot");
		return state.floatingTreeRoot;
	},
	floatingNodeId: (state) => state.floatingNodeId,
	floatingParentNodeId: (state) => state.floatingParentNodeId,
	itemProps: (state) => state.itemProps,
	closeDelay: (state) => state.closeDelay,
	adaptiveOrigin: (state) => state.adaptiveOrigin,
	keyboardEventRelay: (state) => {
		if (state.keyboardEventRelay) return state.keyboardEventRelay;
		if (state.parent.type === "menu") return state.parent.store.select("keyboardEventRelay");
	}
};
/**
* The store view that detached handle-backed triggers read from. Both the real `MenuStore` and the
* inert fallback store satisfy it, so a trigger can read from whichever store the handle currently
* exposes. Narrowed to the members a trigger actually uses — the trigger-data members plus `setOpen`
* (called by the focus guards) — so the exposed surface can't bypass the open-change pipeline; on
* the detached fallback store every one of these mutations is a no-op.
*/
var MenuStore = class extends ReactStore {
	constructor(initialState, floatingId, nested = false) {
		const triggerElements = new PopupTriggerMap();
		const state = createInitialState(triggerElements, floatingId, nested, initialState);
		super(state, createInitialContext(triggerElements), selectors);
		this.unsubscribeParentListener = this.observe("parent", (parent) => {
			this.unsubscribeParentListener?.();
			if (parent.type === "menu") {
				let rootId = parent.store.select("rootId");
				let floatingTreeRoot = parent.store.select("floatingTreeRoot");
				let keyboardEventRelay = parent.store.select("keyboardEventRelay");
				this.unsubscribeParentListener = parent.store.subscribe(() => {
					const nextRootId = parent.store.select("rootId");
					const nextFloatingTreeRoot = parent.store.select("floatingTreeRoot");
					const nextKeyboardEventRelay = parent.store.select("keyboardEventRelay");
					if (rootId === nextRootId && floatingTreeRoot === nextFloatingTreeRoot && keyboardEventRelay === nextKeyboardEventRelay) return;
					rootId = nextRootId;
					floatingTreeRoot = nextFloatingTreeRoot;
					keyboardEventRelay = nextKeyboardEventRelay;
					this.notifyAll();
				});
				this.context.allowMouseUpTriggerRef = parent.store.context.allowMouseUpTriggerRef;
				return;
			}
			if (parent.type !== void 0) this.context.allowMouseUpTriggerRef = parent.context.allowMouseUpTriggerRef;
			this.unsubscribeParentListener = null;
		});
	}
	setOpen(open, eventDetails) {
		this.state.floatingRootContext.context.events.emit("setOpen", {
			open,
			eventDetails
		});
	}
	unsubscribeParentListener = null;
};
function createInitialContext(triggerElements) {
	return {
		positionerRef: /*#__PURE__*/ import_react.createRef(),
		popupRef: /*#__PURE__*/ import_react.createRef(),
		typingRef: { current: false },
		itemDomElements: { current: [] },
		itemLabels: { current: [] },
		allowMouseUpTriggerRef: { current: false },
		triggerFocusTargetRef: /*#__PURE__*/ import_react.createRef(),
		beforeContentFocusGuardRef: /*#__PURE__*/ import_react.createRef(),
		onOpenChangeComplete: void 0,
		triggerElements
	};
}
function createInitialState(triggerElements, floatingId, nested = false, initialState) {
	return {
		...createInitialPopupStoreState(triggerElements, floatingId, nested),
		disabled: false,
		modal: true,
		openMethod: null,
		allowMouseEnter: false,
		highlightItemOnHover: true,
		parent: { type: void 0 },
		rootId: void 0,
		activeIndex: null,
		hoverEnabled: true,
		instantType: void 0,
		openChangeReason: null,
		floatingTreeRoot: new FloatingTreeStore(),
		floatingNodeId: void 0,
		floatingParentNodeId: null,
		itemProps: EMPTY_OBJECT,
		keyboardEventRelay: void 0,
		closeDelay: 0,
		adaptiveOrigin: void 0,
		...initialState
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/submenu-root/MenuSubmenuRootContext.mjs
const MenuSubmenuRootContext = /*#__PURE__*/ import_react.createContext(void 0);
function useMenuSubmenuRootContext() {
	return import_react.useContext(MenuSubmenuRootContext);
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/root/MenuRoot.mjs
/**
* Groups all parts of the menu.
* Doesn't render its own HTML element.
*
* Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
*/
const MenuRoot = fastComponent(function MenuRoot(props) {
	const { children, open: openProp, onOpenChange, onOpenChangeComplete, defaultOpen = false, disabled: disabledProp = false, modal: modalProp, loopFocus = true, orientation = "vertical", actionsRef, closeParentOnEsc = false, handle, triggerId: triggerIdProp, defaultTriggerId: defaultTriggerIdProp = null, highlightItemOnHover = true } = props;
	const contextMenuContext = useContextMenuRootContext(true);
	const parentMenuRootContext = useMenuRootContext(true);
	const menubarContext = useMenubarContext(true);
	const isSubmenu = useMenuSubmenuRootContext();
	const parentFromContext = import_react.useMemo(() => {
		if (isSubmenu && parentMenuRootContext) return {
			type: "menu",
			store: parentMenuRootContext.store
		};
		if (menubarContext) return {
			type: "menubar",
			context: menubarContext
		};
		if (contextMenuContext && !parentMenuRootContext) return {
			type: "context-menu",
			context: contextMenuContext
		};
		return { type: void 0 };
	}, [
		contextMenuContext,
		parentMenuRootContext,
		menubarContext,
		isSubmenu
	]);
	const rootId = useId();
	const floatingId = useId();
	const floatingParentNodeIdFromContext = useFloatingParentNodeId();
	const parentMenuStore = parentFromContext.type === "menu" ? parentFromContext.store : void 0;
	const animateInitialOpen = (openProp ?? defaultOpen) && parentMenuStore?.state.transitionStatus === "starting";
	const seededInstantType = useRefWithInit(() => animateInitialOpen ? parentMenuStore?.state.instantType : void 0).current;
	const store = useMenuRootStore({
		open: defaultOpen,
		openProp,
		activeTriggerId: defaultTriggerIdProp,
		triggerIdProp,
		parent: parentFromContext,
		disabled: disabledProp,
		highlightItemOnHover,
		modal: parentFromContext.type === void 0 ? modalProp : void 0,
		rootId,
		instantType: seededInstantType
	}, floatingId, floatingParentNodeIdFromContext != null);
	store.useControlledProp("openProp", openProp);
	store.useControlledProp("triggerIdProp", triggerIdProp);
	store.useContextCallback("onOpenChangeComplete", onOpenChangeComplete);
	const floatingTreeRoot = store.useState("floatingTreeRoot");
	const floatingNodeIdFromContext = useFloatingNodeId(floatingTreeRoot);
	const open = store.useState("open");
	const activeTriggerElement = store.useState("activeTriggerElement");
	const positionerElement = store.useState("positionerElement");
	const hoverEnabled = store.useState("hoverEnabled");
	const disabled = store.useState("disabled");
	const lastOpenChangeReason = store.useState("lastOpenChangeReason");
	const parent = store.useState("parent");
	const activeIndex = store.useState("activeIndex");
	const payload = store.useState("payload");
	const floatingParentNodeId = store.useState("floatingParentNodeId");
	const openEventRef = import_react.useRef(null);
	const allowOutsidePressDismissalRef = import_react.useRef(parent.type !== "context-menu");
	const allowOutsidePressDismissalTimeout = useTimeout();
	const allowTouchToCloseRef = import_react.useRef(true);
	const allowTouchToCloseTimeout = useTimeout();
	const nested = floatingParentNodeId != null;
	const { openMethod, triggerProps: interactionTypeProps } = useOpenInteractionType(open);
	store.useSyncedValues({
		disabled: disabledProp,
		highlightItemOnHover,
		modal: parent.type === void 0 ? modalProp : void 0,
		openMethod,
		rootId
	});
	useImplicitActiveTrigger(store);
	const { forceUnmount, transitionStatus } = useOpenStateTransitions(open, store, () => {
		store.set("allowMouseEnter", false);
	}, animateInitialOpen);
	const runOnceAnimationsFinish = useAnimationsFinished(store.context.popupRef);
	import_react.useEffect(() => {
		if (seededInstantType === void 0) return;
		const clearSeededInstantType = () => {
			if (store.state.instantType === seededInstantType) store.set("instantType", void 0);
		};
		if (!open) {
			clearSeededInstantType();
			return;
		}
		if (transitionStatus !== void 0) return;
		if (store.context.popupRef.current == null) {
			clearSeededInstantType();
			return;
		}
		const abortController = new AbortController();
		runOnceAnimationsFinish(clearSeededInstantType, abortController.signal);
		return () => {
			abortController.abort();
		};
	}, [
		seededInstantType,
		open,
		transitionStatus,
		runOnceAnimationsFinish,
		store
	]);
	useIsoLayoutEffect(() => {
		if (contextMenuContext && !parentMenuRootContext) store.update({
			parent: {
				type: "context-menu",
				context: contextMenuContext
			},
			floatingNodeId: floatingNodeIdFromContext,
			floatingParentNodeId: floatingParentNodeIdFromContext
		});
		else if (parentMenuRootContext) store.update({
			floatingNodeId: floatingNodeIdFromContext,
			floatingParentNodeId: floatingParentNodeIdFromContext
		});
	}, [
		contextMenuContext,
		parentMenuRootContext,
		floatingNodeIdFromContext,
		floatingParentNodeIdFromContext,
		store
	]);
	import_react.useEffect(() => {
		if (!open) openEventRef.current = null;
		if (parent.type !== "context-menu") return;
		if (!open) {
			allowOutsidePressDismissalTimeout.clear();
			allowOutsidePressDismissalRef.current = false;
			return;
		}
		allowOutsidePressDismissalTimeout.start(500, () => {
			allowOutsidePressDismissalRef.current = true;
		});
	}, [
		allowOutsidePressDismissalTimeout,
		open,
		parent.type
	]);
	useIsoLayoutEffect(() => {
		if (!open && !hoverEnabled) store.set("hoverEnabled", true);
	}, [
		open,
		hoverEnabled,
		store
	]);
	const setOpen = useStableCallback((nextOpen, eventDetails) => {
		const reason = eventDetails.reason;
		if (!nextOpen && !store.select("open")) return;
		if (open === nextOpen && eventDetails.trigger === activeTriggerElement && lastOpenChangeReason === reason) return;
		const shouldPreventUnmountOnClose = attachPreventUnmountOnClose(eventDetails);
		if (!nextOpen && eventDetails.trigger == null) eventDetails.trigger = activeTriggerElement ?? void 0;
		onOpenChange?.(nextOpen, eventDetails);
		if (eventDetails.isCanceled) return;
		store.state.floatingRootContext.dispatchOpenChange(nextOpen, eventDetails);
		const nativeEvent = eventDetails.event;
		if (nextOpen === false && nativeEvent?.type === "click" && nativeEvent.pointerType === "touch" && !allowTouchToCloseRef.current) return;
		if (nextOpen && reason === "trigger-focus") {
			allowTouchToCloseRef.current = false;
			allowTouchToCloseTimeout.start(300, () => {
				allowTouchToCloseRef.current = true;
			});
		} else {
			allowTouchToCloseRef.current = true;
			allowTouchToCloseTimeout.clear();
		}
		const isKeyboardClick = (reason === "trigger-press" || reason === "item-press") && nativeEvent.detail === 0;
		const isDismissClose = !nextOpen && (reason === "escape-key" || reason == null);
		openEventRef.current = eventDetails.event;
		const popupOpenState = createPopupOpenState(store.state, nextOpen, eventDetails.trigger, shouldPreventUnmountOnClose());
		popupOpenState.openChangeReason = reason;
		if (parent.type === "menubar" && (reason === "trigger-focus" || reason === "focus-out" || reason === "trigger-hover" || reason === "list-navigation" || reason === "sibling-open")) popupOpenState.instantType = "group";
		else if (isKeyboardClick || isDismissClose) popupOpenState.instantType = isKeyboardClick ? "click" : "dismiss";
		else popupOpenState.instantType = void 0;
		store.update(popupOpenState);
	});
	const floatingRootContext = useSyncedFloatingRootContext({
		popupStore: store,
		floatingRootContext: store.state.floatingRootContext,
		floatingId,
		nested: floatingParentNodeIdFromContext != null,
		onOpenChange: setOpen
	});
	const floatingEvents = floatingRootContext.context.events;
	useIsoLayoutEffect(() => {
		const handleSetOpenEvent = ({ open: nextOpen, eventDetails }) => setOpen(nextOpen, eventDetails);
		floatingEvents.on("setOpen", handleSetOpenEvent);
		return () => {
			floatingEvents?.off("setOpen", handleSetOpenEvent);
		};
	}, [floatingEvents, setOpen]);
	const handleImperativeClose = import_react.useCallback(() => {
		store.setOpen(false, createChangeEventDetails(imperativeAction));
	}, [store]);
	import_react.useImperativeHandle(actionsRef, () => ({
		unmount: forceUnmount,
		close: handleImperativeClose
	}), [forceUnmount, handleImperativeClose]);
	let ctx;
	if (parent.type === "context-menu") ctx = parent.context;
	import_react.useImperativeHandle(ctx?.positionerRef, () => positionerElement, [positionerElement]);
	import_react.useImperativeHandle(ctx?.actionsRef, () => ({ setOpen }), [setOpen]);
	const dismiss = useDismiss(floatingRootContext, {
		enabled: !disabled,
		bubbles: { escapeKey: closeParentOnEsc && parent.type === "menu" },
		outsidePress() {
			if (parent.type !== "context-menu" || openEventRef.current?.type === "contextmenu") return true;
			return allowOutsidePressDismissalRef.current;
		},
		externalTree: nested ? floatingTreeRoot : void 0
	});
	const direction = useDirection();
	const setActiveIndex = import_react.useCallback((index) => {
		if (store.select("activeIndex") === index) return;
		store.set("activeIndex", index);
	}, [store]);
	const listNavigation$1 = useListNavigation(floatingRootContext, {
		enabled: !disabled,
		listRef: store.context.itemDomElements,
		activeIndex,
		nested: parent.type !== void 0,
		loopFocus,
		orientation,
		parentOrientation: parent.type === "menubar" ? parent.context.orientation : void 0,
		rtl: direction === "rtl",
		disabledIndices: EMPTY_ARRAY,
		onNavigate: setActiveIndex,
		openOnArrowKeyDown: parent.type !== "context-menu",
		externalTree: nested ? floatingTreeRoot : void 0,
		focusItemOnHover: highlightItemOnHover
	});
	const onTyping = import_react.useCallback((nextTyping) => {
		store.context.typingRef.current = nextTyping;
	}, [store]);
	const typeahead = useTypeahead(floatingRootContext, {
		enabled: !disabled,
		listRef: store.context.itemLabels,
		elementsRef: store.context.itemDomElements,
		activeIndex,
		resetMs: 500,
		onMatch: (index) => {
			if (open && index !== activeIndex) store.set("activeIndex", index);
		},
		onTyping
	});
	const activeTriggerProps = import_react.useMemo(() => {
		const mergedProps = mergeProps(typeahead.reference, listNavigation$1.reference, dismiss.reference, { onMouseMove() {
			store.set("allowMouseEnter", true);
		} }, interactionTypeProps);
		mergedProps["aria-haspopup"] = "menu";
		mergedProps["aria-expanded"] = open;
		return mergedProps;
	}, [
		store,
		typeahead.reference,
		listNavigation$1.reference,
		dismiss.reference,
		interactionTypeProps,
		open
	]);
	const inactiveTriggerProps = import_react.useMemo(() => {
		const mergedProps = mergeProps(listNavigation$1.trigger, dismiss.trigger, interactionTypeProps);
		mergedProps["aria-haspopup"] = "menu";
		mergedProps["aria-expanded"] = false;
		return mergedProps;
	}, [
		listNavigation$1.trigger,
		dismiss.trigger,
		interactionTypeProps
	]);
	useRefWithInit(() => {
		store.update({ inactiveTriggerProps });
		return null;
	});
	const popupProps = import_react.useMemo(() => mergeProps(FOCUSABLE_POPUP_PROPS, {
		id: floatingId,
		role: "menu",
		"aria-orientation": orientation === "horizontal" ? "horizontal" : void 0,
		"aria-labelledby": activeTriggerElement?.id,
		onMouseMove() {
			store.set("allowMouseEnter", true);
			if (parent.type === "menu") store.set("hoverEnabled", false);
		},
		onClick() {
			if (store.select("hoverEnabled")) store.set("hoverEnabled", false);
		},
		onKeyDown(event) {
			const relay = store.select("keyboardEventRelay");
			if (relay && !event.isPropagationStopped()) relay(event);
		}
	}, typeahead.floating, listNavigation$1.floating, dismiss.floating), [
		activeTriggerElement,
		floatingId,
		orientation,
		parent.type,
		store,
		typeahead.floating,
		listNavigation$1.floating,
		dismiss.floating
	]);
	const itemProps = listNavigation$1.item ?? EMPTY_OBJECT;
	usePopupInteractionProps(store, {
		floatingRootContext,
		activeTriggerProps,
		inactiveTriggerProps,
		popupProps,
		itemProps
	});
	const context = import_react.useMemo(() => ({
		store,
		parent: parentFromContext
	}), [store, parentFromContext]);
	const content = /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(MenuRootContext.Provider, {
		value: context,
		children: [handle && /*#__PURE__*/ (0, import_jsx_runtime.jsx)(PopupHandleAttachment, {
			handle,
			store
		}), typeof children === "function" ? children({ payload }) : children]
	});
	if (parent.type === void 0 || parent.type === "context-menu") return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FloatingTree, {
		externalTree: floatingTreeRoot,
		children: content
	});
	return content;
});
function useMenuRootStore(initialState, floatingId, nested) {
	return useRefWithInit(() => new MenuStore(initialState, floatingId, nested)).current;
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/utils/getPseudoElementBounds.mjs
const BOUNDARY_OFFSET = 5;
/**
* Determines if a mouse event occurred within the bounds of an element
* (including its pseudo-elements), with a small tolerance for pointer drift.
*/
function isMouseWithinBounds(event, element) {
	const bounds = getPseudoElementBounds(element);
	return event.clientX >= bounds.left - BOUNDARY_OFFSET && event.clientX <= bounds.right + BOUNDARY_OFFSET && event.clientY >= bounds.top - BOUNDARY_OFFSET && event.clientY <= bounds.bottom + BOUNDARY_OFFSET;
}
function getPseudoElementBounds(element) {
	const elementRect = element.getBoundingClientRect();
	const win = getWindow(element);
	if (jsdom) return elementRect;
	const beforeStyles = win.getComputedStyle(element, "::before");
	const afterStyles = win.getComputedStyle(element, "::after");
	if (!(beforeStyles.content !== "none" || afterStyles.content !== "none")) return elementRect;
	const beforeWidth = parseFloat(beforeStyles.width) || 0;
	const beforeHeight = parseFloat(beforeStyles.height) || 0;
	const afterWidth = parseFloat(afterStyles.width) || 0;
	const afterHeight = parseFloat(afterStyles.height) || 0;
	const totalWidth = Math.max(elementRect.width, beforeWidth, afterWidth);
	const totalHeight = Math.max(elementRect.height, beforeHeight, afterHeight);
	const widthDiff = totalWidth - elementRect.width;
	const heightDiff = totalHeight - elementRect.height;
	return {
		left: elementRect.left - widthDiff / 2,
		right: elementRect.right + widthDiff / 2,
		top: elementRect.top - heightDiff / 2,
		bottom: elementRect.bottom + heightDiff / 2
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/internals/composite/item/useCompositeItem.mjs
function useCompositeItem(params = {}) {
	const { highlightItemOnHover, highlightedIndex, onHighlightedIndexChange } = useCompositeRootContext();
	const { ref, index } = useCompositeListItem(params);
	const isHighlighted = highlightedIndex === index;
	const itemRef = import_react.useRef(null);
	const mergedRef = useMergedRefs(ref, itemRef);
	return {
		compositeProps: {
			tabIndex: isHighlighted ? 0 : -1,
			onFocus() {
				onHighlightedIndexChange(index);
			},
			onMouseMove() {
				const item = itemRef.current;
				if (!highlightItemOnHover || !item) return;
				const disabled = item.hasAttribute("disabled") || item.ariaDisabled === "true";
				if (!isHighlighted && !disabled) item.focus();
			}
		},
		compositeRef: mergedRef,
		index
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/internals/composite/item/CompositeItem.mjs
function CompositeItem(componentProps) {
	const { render, className, style, state = EMPTY_OBJECT, props = EMPTY_ARRAY, refs = EMPTY_ARRAY, metadata, stateAttributesMapping, tag = "div", ...elementProps } = componentProps;
	const { compositeProps, compositeRef } = useCompositeItem({ metadata });
	return useRenderElement(tag, componentProps, {
		state,
		ref: [compositeRef, ...refs],
		props: [
			compositeProps,
			...props,
			elementProps
		],
		stateAttributesMapping
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/utils/findRootOwnerId.mjs
function findRootOwnerId(node) {
	if (isHTMLElement(node) && node.hasAttribute("data-rootownerid")) return node.getAttribute("data-rootownerid");
	if (isLastTraversableNode(node)) return;
	return findRootOwnerId(getParentNode(node));
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/utils/popups/useTriggerFocusGuards.mjs
/**
* Minimal store interface required by the focus guard hook.
* Both PopoverStore and MenuStore satisfy this interface.
*/
/**
* Provides focus guard handlers for popup triggers (Popover, Menu).
*
* When the popup is open, invisible focus guard elements are placed before and after
* the trigger. These handlers close the popup and move focus to the appropriate
* tabbable element when the guards receive focus (i.e. when the user tabs out).
*/
function useTriggerFocusGuards(store, triggerElementRef) {
	const preFocusGuardRef = import_react.useRef(null);
	function handlePreFocusGuardFocus(event) {
		import_react_dom.flushSync(() => {
			store.setOpen(false, createChangeEventDetails(focusOut, event.nativeEvent, event.currentTarget));
		});
		getTabbableBeforeElement(preFocusGuardRef.current)?.focus();
	}
	function handleFocusTargetFocus(event) {
		const positionerElement = store.select("positionerElement");
		if (positionerElement && isOutsideEvent(event, positionerElement)) store.context.beforeContentFocusGuardRef.current?.focus();
		else {
			import_react_dom.flushSync(() => {
				store.setOpen(false, createChangeEventDetails(focusOut, event.nativeEvent, event.currentTarget));
			});
			let nextTabbable = getTabbableAfterElement(store.context.triggerFocusTargetRef.current || triggerElementRef.current);
			while (nextTabbable !== null && contains(positionerElement, nextTabbable)) {
				const prevTabbable = nextTabbable;
				nextTabbable = getNextTabbable(nextTabbable);
				if (nextTabbable === prevTabbable) break;
			}
			nextTabbable?.focus();
		}
	}
	return {
		preFocusGuardRef,
		handlePreFocusGuardFocus,
		handleFocusTargetFocus
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/utils/useMixedToggleClickHandler.mjs
/**
* Returns `click` and `mousedown` handlers that fix the behavior of triggers of popups that are toggled by different events.
* For example, a button that opens a popup on mousedown and closes it on click.
* This hook prevents the popup from closing immediately after the mouse button is released.
*/
function useMixedToggleClickHandler(params) {
	const { enabled = true, mouseDownAction, open } = params;
	const ignoreClickRef = import_react.useRef(false);
	return import_react.useMemo(() => {
		if (!enabled) return EMPTY_OBJECT;
		return {
			onMouseDown: (event) => {
				if (mouseDownAction === "open" && !open || mouseDownAction === "close" && open) {
					ignoreClickRef.current = true;
					ownerDocument(event.currentTarget).addEventListener("click", () => {
						ignoreClickRef.current = false;
					}, { once: true });
				}
			},
			onClick: (event) => {
				if (ignoreClickRef.current) {
					ignoreClickRef.current = false;
					event.preventBaseUIHandler();
				}
			}
		};
	}, [
		enabled,
		mouseDownAction,
		open
	]);
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/menu/trigger/MenuTrigger.mjs
/**
* A button that opens the menu.
* Renders a `<button>` element.
*
* Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
*/
const MenuTrigger = fastComponentRef(function MenuTrigger(componentProps, forwardedRef) {
	const { render, className, style, disabled: disabledProp = false, nativeButton = true, id: idProp, openOnHover: openOnHoverProp, delay = 100, closeDelay = 0, handle, payload, ...elementProps } = componentProps;
	const rootContext = useMenuRootContext(true);
	const store = usePopupHandleStore(handle) ?? rootContext?.store;
	if (!store) throw new Error(formatErrorMessage(85));
	const thisTriggerId = useBaseUiId(idProp);
	const isTriggerActive = store.useState("isTriggerActive", thisTriggerId);
	const floatingRootContext = store.useState("floatingRootContext");
	const isOpenedByThisTrigger = store.useState("isOpenedByTrigger", thisTriggerId);
	const popupId = store.useState("triggerPopupId", thisTriggerId);
	const triggerElementRef = import_react.useRef(null);
	const parent = useMenuParent();
	const compositeRootContext = useCompositeRootContext(true);
	const floatingTreeRootFromContext = useFloatingTree();
	const floatingTreeRoot = import_react.useMemo(() => {
		return floatingTreeRootFromContext ?? new FloatingTreeStore();
	}, [floatingTreeRootFromContext]);
	const floatingNodeId = useFloatingNodeId(floatingTreeRoot);
	const floatingParentNodeId = useFloatingParentNodeId();
	const { registerTrigger, isMountedByThisTrigger } = useTriggerDataForwarding(thisTriggerId, triggerElementRef, store, {
		payload,
		closeDelay,
		parent,
		floatingTreeRoot,
		floatingNodeId,
		floatingParentNodeId,
		keyboardEventRelay: compositeRootContext?.relayKeyboardEvent
	});
	const isInMenubar = parent.type === "menubar";
	const rootDisabled = store.useState("disabled");
	const disabled = disabledProp || rootDisabled || isInMenubar && parent.context.disabled;
	const { getButtonProps, buttonRef } = useButton({
		disabled,
		native: nativeButton
	});
	import_react.useEffect(() => {
		if (!isOpenedByThisTrigger && parent.type === void 0) store.context.allowMouseUpTriggerRef.current = false;
	}, [
		store,
		isOpenedByThisTrigger,
		parent.type
	]);
	const triggerRef = import_react.useRef(null);
	const allowMouseUpTriggerTimeout = useTimeout();
	const handleDocumentMouseUp = useStableCallback((mouseEvent) => {
		if (!triggerRef.current) return;
		allowMouseUpTriggerTimeout.clear();
		store.context.allowMouseUpTriggerRef.current = false;
		const mouseUpTarget = mouseEvent.target;
		if (contains(triggerRef.current, mouseUpTarget) || contains(store.select("positionerElement"), mouseUpTarget) || mouseUpTarget === triggerRef.current) return;
		if (mouseUpTarget != null && findRootOwnerId(mouseUpTarget) === store.select("rootId")) return;
		if (isMouseWithinBounds(mouseEvent, triggerRef.current)) return;
		floatingTreeRoot.events.emit("close", {
			domEvent: mouseEvent,
			reason: cancelOpen
		});
	});
	import_react.useEffect(() => {
		if (isOpenedByThisTrigger && store.select("lastOpenChangeReason") === "trigger-hover") ownerDocument(triggerRef.current).addEventListener("mouseup", handleDocumentMouseUp, { once: true });
	}, [
		isOpenedByThisTrigger,
		handleDocumentMouseUp,
		store
	]);
	const parentMenubarHasSubmenuOpen = isInMenubar && parent.context.hasSubmenuOpen;
	const hoverProps = useHoverReferenceInteraction(floatingRootContext, {
		enabled: (openOnHoverProp ?? parentMenubarHasSubmenuOpen) && !disabled && (!isInMenubar || parentMenubarHasSubmenuOpen && !isMountedByThisTrigger),
		handleClose: safePolygon({ blockPointerEvents: !isInMenubar }),
		mouseOnly: true,
		move: false,
		restMs: parent.type === void 0 ? delay : void 0,
		delay: { close: closeDelay },
		triggerElementRef,
		externalTree: floatingTreeRoot,
		isActiveTrigger: isTriggerActive,
		isClosing: () => store.select("transitionStatus") === "ending"
	});
	const stickIfOpen = useStickIfOpen(isOpenedByThisTrigger, store.select("lastOpenChangeReason"));
	const click = useClick(floatingRootContext, {
		enabled: !disabled,
		event: isOpenedByThisTrigger && isInMenubar ? "click" : "mousedown",
		toggle: true,
		ignoreMouse: false,
		stickIfOpen: parent.type === void 0 ? stickIfOpen : false
	});
	const focus = useFocus(floatingRootContext, { enabled: !disabled && parentMenubarHasSubmenuOpen });
	const mixedToggleHandlers = useMixedToggleClickHandler({
		open: isOpenedByThisTrigger,
		enabled: isInMenubar,
		mouseDownAction: "open"
	});
	const localInteractionProps = import_react.useMemo(() => mergeProps(focus.reference, click.reference), [focus.reference, click.reference]);
	const rootTriggerProps = store.useState("triggerProps", isMountedByThisTrigger);
	const { preFocusGuardRef, handlePreFocusGuardFocus, handleFocusTargetFocus } = useTriggerFocusGuards(store, triggerElementRef);
	const state = {
		disabled,
		open: isOpenedByThisTrigger
	};
	const ref = [
		triggerRef,
		forwardedRef,
		buttonRef,
		registerTrigger,
		triggerElementRef
	];
	const props = [
		localInteractionProps,
		hoverProps ?? EMPTY_OBJECT,
		rootTriggerProps,
		{
			"aria-haspopup": "menu",
			"aria-controls": popupId,
			id: thisTriggerId,
			onMouseDown: (event) => {
				if (store.select("open")) return;
				allowMouseUpTriggerTimeout.start(200, () => {
					store.context.allowMouseUpTriggerRef.current = true;
				});
				ownerDocument(event.currentTarget).addEventListener("mouseup", handleDocumentMouseUp, { once: true });
			}
		},
		isInMenubar ? { role: "menuitem" } : {},
		mixedToggleHandlers,
		elementProps,
		getButtonProps
	];
	const element = useRenderElement("button", componentProps, {
		enabled: !isInMenubar,
		stateAttributesMapping: pressableTriggerOpenStateMapping,
		state,
		ref,
		props
	});
	if (isInMenubar) return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(CompositeItem, {
		tag: "button",
		render,
		className,
		style,
		state,
		refs: ref,
		props,
		stateAttributesMapping: pressableTriggerOpenStateMapping
	});
	if (isOpenedByThisTrigger) return /*#__PURE__*/ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
		/*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusGuard, {
			ref: preFocusGuardRef,
			onFocus: handlePreFocusGuardFocus
		}, `${thisTriggerId}-pre-focus-guard`),
		/*#__PURE__*/ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: element }, thisTriggerId),
		/*#__PURE__*/ (0, import_jsx_runtime.jsx)(FocusGuard, {
			ref: store.context.triggerFocusTargetRef,
			onFocus: handleFocusTargetFocus
		}, `${thisTriggerId}-post-focus-guard`)
	] });
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: element }, thisTriggerId);
});
/**
* Determines whether to ignore clicks after a hover-open.
*/
function useStickIfOpen(open, openReason) {
	const stickIfOpenTimeout = useTimeout();
	const [stickIfOpen, setStickIfOpen] = import_react.useState(false);
	useIsoLayoutEffect(() => {
		if (open && openReason === "trigger-hover") {
			setStickIfOpen(true);
			stickIfOpenTimeout.start(500, () => {
				setStickIfOpen(false);
			});
		} else if (!open) {
			stickIfOpenTimeout.clear();
			setStickIfOpen(false);
		}
	}, [
		open,
		openReason,
		stickIfOpenTimeout
	]);
	return stickIfOpen;
}
function useMenuParent() {
	const menubarContext = useMenubarContext(true);
	return import_react.useMemo(() => {
		if (menubarContext) return {
			type: "menubar",
			context: menubarContext
		};
		return { type: void 0 };
	}, [menubarContext]);
}
//#endregion
//#region src/components/ui/dropdown-menu.tsx
function DropdownMenu({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuRoot, {
		"data-slot": "dropdown-menu",
		...props
	});
}
function DropdownMenuTrigger({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuTrigger, {
		"data-slot": "dropdown-menu-trigger",
		...props
	});
}
function DropdownMenuContent({ align = "start", alignOffset = 0, side = "bottom", sideOffset = 4, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuPositioner, {
		className: "isolate z-50 outline-none",
		align,
		alignOffset,
		side,
		sideOffset,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuPopup, {
			"data-slot": "dropdown-menu-content",
			className: cn("z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95", className),
			...props
		})
	}) });
}
function DropdownMenuGroup({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuGroup, {
		"data-slot": "dropdown-menu-group",
		...props
	});
}
function DropdownMenuLabel({ className, inset, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuGroupLabel, {
		"data-slot": "dropdown-menu-label",
		"data-inset": inset,
		className: cn("px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7", className),
		...props
	});
}
function DropdownMenuItem({ className, inset, variant = "default", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
		"data-slot": "dropdown-menu-item",
		"data-inset": inset,
		"data-variant": variant,
		className: cn("group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive", className),
		...props
	});
}
//#endregion
//#region src/components/context-view/append-composer.tsx
function AppendComposer({ onAppend, onAppended, events, processors }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)(DEFAULT_APPEND_YAML);
	const [pending, setPending] = (0, import_react.useState)(false);
	/** The last submit's outcome, until the draft changes. */
	const [outcome, setOutcome] = (0, import_react.useState)();
	const examples = (0, import_react.useMemo)(() => exampleGroups(processors), [processors]);
	const countsRef = (0, import_react.useRef)(void 0);
	const known = (0, import_react.useMemo)(() => open ? knownEventTypes(sortedCounts((countsRef.current = recount(countsRef.current, events)).counts), processors) : [], [
		open,
		events,
		processors
	]);
	const edit = (value) => {
		setDraft(value);
		setOutcome(void 0);
	};
	const blank = draft.trim() === "";
	const submit = async () => {
		if (pending || blank) return;
		const parsed = parseAppendYaml(draft);
		if ("error" in parsed) return setOutcome(parsed);
		setPending(true);
		try {
			await onAppend(parsed.events);
			setOutcome({ appended: parsed.events.length });
			onAppended();
		} catch (error) {
			setOutcome({ error: error instanceof Error ? error.message : String(error) });
		} finally {
			setPending(false);
		}
	};
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-x-3.5 px-3 sm:px-4 py-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowGutter, { times: true }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				className: "-ml-2",
				onClick: () => setOpen(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), " Append event"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden text-xs text-muted-foreground sm:inline",
				children: "YAML · ⌘↵"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-x-3.5 border-t px-3 sm:px-4 pt-2 pb-1",
		"data-slot": "append-composer",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowGutter, { times: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 flex-col gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeEditor, {
				value: draft,
				onValueChange: edit,
				onSubmit: () => void submit(),
				language: "yaml",
				label: "Events to append",
				placeholder: "type: manual/note-added  (a YAML list appends several)",
				focusOnMount: true,
				complete: (text, pos, explicit) => appendCompletionsAt(text, pos, explicit, known)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					examples.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuTrigger, {
						render: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm"
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {}), " Examples"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
						align: "start",
						side: "top",
						className: "w-auto max-w-80",
						children: examples.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuGroup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
							className: "truncate",
							children: group.label
						}), group.types.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							title: type,
							onClick: () => edit(exampleYaml(type)),
							className: "font-mono text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: shortEventType(type)
							})
						}, type))] }, group.label))
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0 flex-1 truncate text-xs",
						role: "status",
						children: outcome && "error" in outcome ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-type": "error",
							className: "text-destructive",
							title: outcome.error,
							children: outcome.error
						}) : outcome ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: ["Appended ", outcome.appended === 1 ? "1 event" : `${String(outcome.appended)} events`]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden text-muted-foreground sm:inline",
							children: "YAML or JSON · Tab completes · ⌘↵ appends"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => setOpen(false),
						children: "Close"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => void submit(),
						disabled: pending || blank,
						title: "Append events (⌘↵)",
						children: [pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, {}) : null, " Append"]
					})
				]
			})]
		})]
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/field/control/FieldControlDataAttributes.mjs
/**
* Present when the field is in a valid state.
*/
const valid = "data-valid";
/**
* Present when the field is in an invalid state.
*/
const invalid = "data-invalid";
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/internals/field-constants/constants.mjs
const DEFAULT_VALIDITY_STATE = {
	badInput: false,
	customError: false,
	patternMismatch: false,
	rangeOverflow: false,
	rangeUnderflow: false,
	stepMismatch: false,
	tooLong: false,
	tooShort: false,
	typeMismatch: false,
	valid: null,
	valueMissing: false
};
const DEFAULT_FIELD_ROOT_STATE = {
	disabled: false,
	valid: null,
	touched: false,
	dirty: false,
	filled: false,
	focused: false
};
const fieldValidityMapping = { valid(value) {
	if (value === null) return null;
	if (value) return { [valid]: "" };
	return { [invalid]: "" };
} };
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/internals/field-root-context/FieldRootContext.mjs
const DEFAULT_FIELD_ROOT_CONTEXT = {
	invalid: void 0,
	name: void 0,
	validityData: {
		state: DEFAULT_VALIDITY_STATE,
		errors: [],
		error: "",
		value: "",
		initialValue: null
	},
	setValidityData: NOOP,
	disabled: void 0,
	setTouched: NOOP,
	setDirty: NOOP,
	setFilled: NOOP,
	setFocused: NOOP,
	validationMode: "onSubmit",
	shouldValidateOnChange: () => false,
	state: DEFAULT_FIELD_ROOT_STATE,
	registerFieldControl: NOOP,
	validation: {
		getValidationProps: (_disabled, props = EMPTY_OBJECT) => props,
		inputRef: { current: null },
		registeredInputs: /* @__PURE__ */ new Map(),
		registerInput: NOOP,
		getInputControl: () => null,
		commit: async () => {},
		change: NOOP
	}
};
const FieldRootContext = /*#__PURE__*/ import_react.createContext(DEFAULT_FIELD_ROOT_CONTEXT);
function useFieldRootContext(optional = true) {
	const context = import_react.useContext(FieldRootContext);
	if (context.setValidityData === NOOP && !optional) throw new Error(formatErrorMessage(28));
	return context;
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/internals/form-context/FormContext.mjs
const FormContext = /*#__PURE__*/ import_react.createContext({
	elementRef: { current: null },
	formRef: { current: { fields: /* @__PURE__ */ new Map() } },
	errors: {},
	clearErrors: NOOP,
	validationMode: "onSubmit",
	submitCountRef: { current: 0 }
});
function useFormContext() {
	return import_react.useContext(FormContext);
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/internals/labelable-provider/LabelableContext.mjs
/**
* A context for providing [labelable elements](https://html.spec.whatwg.org/multipage/forms.html#category-label)\
* with an accessible name (label) and description.
*/
const LabelableContext = /*#__PURE__*/ import_react.createContext({
	controlId: void 0,
	registerControlId: NOOP,
	resetControlId: NOOP,
	labelId: void 0,
	setLabelId: NOOP,
	messageIds: [],
	setMessageIds: NOOP,
	getDescriptionProps: (externalProps) => externalProps
});
function useLabelableContext() {
	return import_react.useContext(LabelableContext);
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/internals/labelable-provider/useLabelableId.mjs
function useLabelableId(params = {}) {
	const { id, enabled = true } = params;
	const { controlId, registerControlId, resetControlId } = useLabelableContext();
	const defaultId = useBaseUiId();
	const controlSourceRef = useRefWithInit(() => Symbol());
	const hasRegisteredRef = import_react.useRef(false);
	const hadExplicitIdRef = import_react.useRef(false);
	const unregisterControlId = useStableCallback(() => {
		if (!hasRegisteredRef.current || registerControlId === NOOP) return;
		hasRegisteredRef.current = false;
		registerControlId(controlSourceRef.current, void 0);
	});
	useIsoLayoutEffect(() => {
		if (!enabled || registerControlId === NOOP) {
			unregisterControlId();
			return;
		}
		let nextId;
		if (id !== void 0) {
			hadExplicitIdRef.current = true;
			nextId = id;
		} else if (hadExplicitIdRef.current) nextId = defaultId;
		else {
			resetControlId();
			return;
		}
		if (nextId === void 0) {
			unregisterControlId();
			return;
		}
		hasRegisteredRef.current = true;
		registerControlId(controlSourceRef.current, nextId);
	}, [
		id,
		enabled,
		registerControlId,
		resetControlId,
		defaultId,
		controlSourceRef,
		unregisterControlId
	]);
	useIsoLayoutEffect(() => {
		return unregisterControlId;
	}, [unregisterControlId]);
	return (enabled ? controlId : void 0) ?? id ?? defaultId;
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/internals/field-register-control/useRegisterFieldControl.mjs
function useRegisterFieldControl(controlRef, id, value, getFormValueOverride, enabled = true, name) {
	const { registerFieldControl } = useFieldRootContext();
	const sourceRef = useRefWithInit(() => Symbol());
	useIsoLayoutEffect(() => {
		const source = sourceRef.current;
		if (!enabled) {
			registerFieldControl(source, void 0);
			return;
		}
		registerFieldControl(source, {
			controlRef,
			getValue: getFormValueOverride,
			id,
			name,
			value
		});
	}, [
		controlRef,
		enabled,
		getFormValueOverride,
		id,
		name,
		registerFieldControl,
		sourceRef,
		value
	]);
	useIsoLayoutEffect(() => {
		const source = sourceRef.current;
		return () => {
			registerFieldControl(source, void 0);
		};
	}, [registerFieldControl, sourceRef]);
}
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/field/control/FieldControl.mjs
/**
* The form control to label and validate.
* Renders an `<input>` element.
*
* You can omit this part and use any Base UI input component instead. For example,
* [Input](https://base-ui.com/react/components/input), [Checkbox](https://base-ui.com/react/components/checkbox),
* or [Select](https://base-ui.com/react/components/select), among others, will work with Field out of the box.
*
* Documentation: [Base UI Field](https://base-ui.com/react/components/field)
*/
const FieldControl = /*#__PURE__*/ import_react.forwardRef(function FieldControl(componentProps, forwardedRef) {
	const { render, className, id: idProp, name: nameProp, value: valueProp, disabled: disabledProp = false, onValueChange, defaultValue, autoFocus = false, style, ...elementProps } = componentProps;
	const { state: fieldState, name: fieldName, disabled: fieldDisabled, setTouched, setDirty, validityData, setFocused, setFilled, validationMode, validation } = useFieldRootContext();
	const { clearErrors, elementRef: formElementRef, submitCountRef } = useFormContext();
	const disabled = fieldDisabled || disabledProp;
	const name = fieldName ?? nameProp;
	const state = {
		...fieldState,
		disabled
	};
	const { labelId } = useLabelableContext();
	const id = useLabelableId({ id: idProp });
	const [valueUnwrapped] = useControlled({
		controlled: valueProp,
		default: defaultValue,
		name: "FieldControl",
		state: "value"
	});
	const isControlled = valueProp !== void 0;
	const value = isControlled ? valueUnwrapped : void 0;
	const serializedValue = value == null ? void 0 : String(value);
	const getValueFromInput = useStableCallback(() => validation.inputRef.current?.value);
	useRegisterFieldControl(validation.inputRef, id, serializedValue, getValueFromInput, !disabled, nameProp);
	useIsoLayoutEffect(() => {
		const currentValue = serializedValue ?? validation.inputRef.current?.value;
		if (currentValue !== void 0) setFilled(currentValue !== "");
	}, [
		serializedValue,
		validation.inputRef,
		setFilled
	]);
	useValueChanged(serializedValue, () => {
		if (serializedValue === void 0) return;
		clearErrors(name);
		setDirty(serializedValue !== (validityData.initialValue ?? ""));
		validation.change(serializedValue);
	});
	const inputRef = import_react.useRef(null);
	const enterValidationTimeout = useTimeout();
	useIsoLayoutEffect(() => {
		if (autoFocus && inputRef.current === activeElement(ownerDocument(inputRef.current))) setFocused(true);
	}, [autoFocus, setFocused]);
	return useRenderElement("input", componentProps, {
		ref: [forwardedRef, inputRef],
		state,
		props: [
			{
				id,
				disabled,
				name,
				ref: validation.inputRef,
				"aria-labelledby": labelId,
				autoFocus,
				...isControlled ? { value } : { defaultValue },
				onChange(event) {
					const inputValue = event.currentTarget.value;
					const details = createChangeEventDetails(none, event.nativeEvent);
					onValueChange?.(inputValue, details);
					if (isControlled) return;
					setDirty(inputValue !== (validityData.initialValue ?? ""));
					setFilled(inputValue !== "");
					if (!event.nativeEvent.defaultPrevented && !details.isCanceled) {
						clearErrors(name);
						validation.change(inputValue);
					}
				},
				onFocus() {
					setFocused(true);
				},
				onBlur(event) {
					setTouched(true);
					setFocused(false);
					if (validationMode === "onBlur") {
						const inputValue = event.currentTarget.value;
						validation.commit(inputValue);
						if (isControlled) queueMicrotask(() => {
							const nextValue = validation.inputRef.current?.value;
							if (nextValue !== void 0 && nextValue !== inputValue && nextValue !== (validityData.initialValue ?? "")) validation.commit(nextValue);
						});
					}
				},
				onKeyDown(event) {
					if (event.currentTarget.tagName === "INPUT" && event.key === "Enter") {
						setTouched(true);
						const value = event.currentTarget.value;
						const form = event.currentTarget.form;
						if (form && form === formElementRef.current && !event.defaultPrevented) {
							const input = event.currentTarget;
							const submitCount = submitCountRef.current;
							enterValidationTimeout.start(0, () => {
								if (submitCountRef.current === submitCount) validation.commit(input.value);
							});
						} else validation.commit(value);
					}
				}
			},
			elementProps,
			(props) => validation.getValidationProps(disabled, props)
		],
		stateAttributesMapping: fieldValidityMapping
	});
});
//#endregion
//#region ../../node_modules/.pnpm/@base-ui+react@1.8.0_@types+react@19.3.0_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/@base-ui/react/input/Input.mjs
/**
* A native input element that automatically works with [Field](https://base-ui.com/react/components/field).
* Renders an `<input>` element.
*
* Documentation: [Base UI Input](https://base-ui.com/react/components/input)
*/
const Input$1 = /*#__PURE__*/ import_react.forwardRef(function Input(props, forwardedRef) {
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)(FieldControl, {
		ref: forwardedRef,
		...props
	});
});
//#endregion
//#region src/components/ui/input.tsx
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input$1, {
		type,
		"data-slot": "input",
		className: cn("h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40", className),
		...props
	});
}
//#endregion
//#region src/components/ui/input-group.tsx
function InputGroup({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "input-group",
		role: "group",
		className: cn("group/input-group relative flex h-8 w-full min-w-0 items-center rounded-lg border border-input transition-colors outline-none in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-disabled:bg-input/50 has-disabled:opacity-50 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto dark:bg-input/30 dark:has-disabled:bg-input/80 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5", className),
		...props
	});
}
const inputGroupAddonVariants = cva("flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4", {
	variants: { align: {
		"inline-start": "order-first pl-2 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem]",
		"inline-end": "order-last pr-2 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem]",
		"block-start": "order-first w-full justify-start px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",
		"block-end": "order-last w-full justify-start px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2"
	} },
	defaultVariants: { align: "inline-start" }
});
function InputGroupAddon({ className, align = "inline-start", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "group",
		"data-slot": "input-group-addon",
		"data-align": align,
		className: cn(inputGroupAddonVariants({ align }), className),
		onClick: (e) => {
			if (e.target.closest("button")) return;
			e.currentTarget.parentElement?.querySelector("input")?.focus();
		},
		...props
	});
}
function InputGroupInput({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		"data-slot": "input-group-control",
		className: cn("flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent", className),
		...props
	});
}
//#endregion
//#region src/components/context-view/filter-row.tsx
function FilterRow({ filter, counts, narrowed, partial, loaded, onStateChange }) {
	const focusOnMount = (0, import_react.useCallback)((element) => element?.focus(), []);
	const toggleType = (type) => {
		const next = filter.types.has(type) ? [...filter.types].filter((held) => held !== type) : [...filter.types, type];
		onStateChange({ types: next.length > 0 ? next : void 0 });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		"data-slot": "filter-row",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-x-3 gap-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InputGroup, {
					className: "h-8 min-w-48 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupAddon, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupInput, {
						ref: focusOnMount,
						value: filter.query,
						onChange: (event) => onStateChange({ q: event.target.value || void 0 }),
						onKeyDown: (event) => {
							if (event.key === "Escape" && filter.query) onStateChange({ q: void 0 });
						},
						placeholder: "Search type or payload",
						"aria-label": "Search type or payload",
						className: "text-base sm:text-sm"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 text-xs text-muted-foreground",
					title: "Only the events between these offsets, inclusive",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "from" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OffsetInput, {
							label: "From offset",
							value: filter.from,
							onChange: (from) => onStateChange({ from })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "to" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OffsetInput, {
							label: "To offset",
							value: filter.to,
							onChange: (to) => onStateChange({ to })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex max-h-32 flex-wrap gap-1 overflow-y-auto",
				children: [typeChips(counts, filter.types).map(([type, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => toggleType(type),
					"aria-pressed": filter.types.has(type),
					title: type,
					className: cn("rounded px-1.5 py-0.5 font-mono text-xs hover:bg-muted", filter.types.has(type) ? "bg-muted text-foreground" : "text-muted-foreground"),
					children: [
						shortEventType(type),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: count.toLocaleString()
						})
					]
				}, type)), narrowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onStateChange(FILTER_CLEARED),
					className: "px-1.5 py-0.5 text-xs text-muted-foreground underline-offset-2 hover:underline",
					children: "clear"
				}) : null]
			}),
			partial ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"The filter searches the ",
					loaded,
					" events loaded; scroll up to load older ones."
				]
			}) : null
		]
	});
}
/** One end of the offset range: blank = open, a number = that offset (offsetBound). */
function OffsetInput({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		inputMode: "numeric",
		"aria-label": label,
		placeholder: "#",
		value: value ?? "",
		onChange: (event) => {
			const bound = offsetBound(event.target.value);
			if (bound !== null) onChange(bound);
		},
		className: "h-7 w-16 rounded-md border bg-background px-1.5 text-center font-mono text-base tabular-nums sm:text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
	});
}
//#endregion
//#region src/components/context-view/presence-strip.tsx
/** ` · 12/min`: the events of the last minute, from the tail back (the log is sorted), re-counted
*  every few seconds while there are any so the rate falls when the log goes quiet; nothing when
*  the minute was quiet. */
function EventRate({ events }) {
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	let count = 0;
	for (let at = events.length - 1; at >= 0; at--) {
		if (now - Date.parse(events[at].createdAt) > 6e4) break;
		count += 1;
	}
	(0, import_react.useEffect)(() => {
		if (count === 0) return;
		const timer = setInterval(() => setNow(Date.now()), 5e3);
		return () => clearInterval(timer);
	}, [count]);
	(0, import_react.useEffect)(() => setNow(Date.now()), [events]);
	if (count === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		title: "Events in the last minute",
		children: ` · ${String(count)}/min`
	});
}
function PresenceStrip({ actors, rpcStubs, className, onPick }) {
	const shown = actors.slice(0, 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground", className),
		children: [
			shown.map((who) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "truncate hover:text-foreground",
				title: `${who.actor}${who.grant ? ` via ${who.grant}` : ""} · last ${new Date(who.lastSeenAt).toLocaleString()}`,
				onClick: () => onPick?.(who.actor),
				children: who.email || who.actor
			}, who.actor)),
			actors.length > shown.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["+", actors.length - shown.length] }) : null,
			rpcStubs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				title: rpcStubs.join(", "),
				children: [
					rpcStubs.length,
					" live ",
					rpcStubs.length === 1 ? "stub" : "stubs"
				]
			}) : null
		]
	});
}
//#endregion
//#region src/components/context-view/pretty-state.tsx
/** A state as fields, one line each. */
function PrettyFields({ value, depth = 0 }) {
	if (!isRecord(value)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrettyScalar, { value });
	const entries = Object.entries(value);
	if (entries.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-muted-foreground",
		children: "empty"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
		className: "grid grid-cols-[minmax(0,max-content)_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-xs",
		children: entries.map(([key, field]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrettyField, {
			label: key,
			value: field,
			depth
		}, key))
	});
}
function PrettyField({ label, value, depth }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "truncate font-mono text-muted-foreground",
		title: label,
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "min-w-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrettyFieldValue, {
			value,
			depth
		})
	})] });
}
function PrettyFieldValue({ value, depth }) {
	if (Array.isArray(value)) {
		if (value.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: "none"
		});
		if (value.length <= 8 && value.every((item) => !isRecord(item) && !Array.isArray(item))) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono break-all",
			children: value.map(scalarText).join(", ")
		});
		if (depth > 0 && compactJson(value, 200).length <= 100) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono break-all",
			children: compactJson(value, 100)
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folded, {
			summary: `${value.length.toLocaleString()} ${value.length === 1 ? "item" : "items"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompactLines, { items: value.map((item, index) => [`${index}`, item]) })
		});
	}
	if (isRecord(value)) {
		const size = Object.keys(value).length;
		if (size === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: "{}"
		});
		if (depth === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrettyFields, {
			value,
			depth: 1
		});
		if (compactJson(value, 200).length <= 100) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono break-all",
			children: compactJson(value, 100)
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folded, {
			summary: `${size.toLocaleString()} ${size === 1 ? "field" : "fields"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompactLines, { items: Object.entries(value) })
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrettyScalar, { value });
}
function PrettyScalar({ value }) {
	if (value == null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-muted-foreground",
		children: "—"
	});
	const text = scalarText(value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "font-mono text-xs break-all",
		title: text.length > 200 ? text : void 0,
		children: text.length > 200 ? `${text.slice(0, 199)}…` : text
	});
}
/** A list folded behind its count: opened in place, each entry one compact line. */
function Folded({ summary, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
		className: "cursor-pointer text-muted-foreground hover:text-foreground",
		children: summary
	}), children] });
}
/** Up to 50 entries, each `key  {compact json}` on one line; the rest counted. */
function CompactLines({ items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col py-0.5",
		children: [items.slice(0, 50).map(([key, item]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "truncate font-mono",
			title: compactJson(item, 2e3),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: key
				}),
				" ",
				compactJson(item, 240)
			]
		}, key)), items.length > 50 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-muted-foreground",
			children: [
				"+",
				(items.length - 50).toLocaleString(),
				" more"
			]
		}) : null]
	});
}
/** The core reduce, read: where the context is, the pause, and each of its tables. The
*  subscriptions table is the panel's subscriber list, so it is only counted here. */
function CorePrettyState({ state }) {
	if (!isRecord(state) || !("subscriptions" in state)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrettyFields, { value: state });
	const rules = Object.entries(record(state.itxExpressionRewriteRules));
	const schedules = Object.entries(record(state.schedules));
	const routes = Object.entries(record(state.fetchRoutes));
	const runs = Object.entries(record(state.scriptRuns));
	const empty = [
		["rewrite rules", rules],
		["schedules", schedules],
		["fetch routes", routes],
		["open script runs", runs]
	].filter(([, table]) => table.length === 0).map(([name]) => name);
	const paused = isRecord(state.paused) ? { reason: scalarText(state.paused.reason) } : void 0;
	const facts = [
		["path", state.path],
		["project", state.projectId],
		["created", state.createdAt],
		["incarnation", state.incarnation],
		["ingress", state.ingressTarget ? printExpression(state.ingressTarget) : void 0]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 text-xs",
		children: [
			paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-amber-700",
				children: ["Paused", paused.reason ? `: ${paused.reason}` : ""]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-[minmax(0,max-content)_minmax(0,1fr)] gap-x-3 gap-y-0.5",
				children: [facts.filter(([, value]) => value != null).map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrettyField, {
					label,
					value,
					depth: 1
				}, label)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrettyField, {
					label: "subscriptions",
					value: `${Object.keys(record(state.subscriptions)).length} (listed above)`,
					depth: 1
				})]
			}),
			rules.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoreTable, {
				title: "Rewrite rules",
				count: rules.length,
				children: rules.map(([match, rule]) => {
					const row = record(rule);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono break-all",
						children: [
							match,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "→"
							}),
							" ",
							row.target === null ? "denied" : printExpression(row.target),
							typeof row.description === "string" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 font-sans text-muted-foreground",
								children: row.description
							}) : null
						]
					}, match);
				})
			}) : null,
			schedules.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoreTable, {
				title: "Schedules",
				count: schedules.length,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompactLines, { items: schedules })
			}) : null,
			routes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoreTable, {
				title: "Fetch routes",
				count: routes.length,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompactLines, { items: routes })
			}) : null,
			runs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoreTable, {
				title: "Open script runs",
				count: runs.length,
				children: runs.map(([offset, run]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono",
					children: [
						"#",
						offset,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: ["requested ", scalarText(record(run).requestedAt)]
						})
					]
				}, offset))
			}) : null,
			empty.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-muted-foreground",
				children: [
					"No ",
					empty.join(", "),
					"."
				]
			}) : null
		]
	});
}
function CoreTable({ title, count, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-0.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-muted-foreground",
			children: [
				title,
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums",
					children: count
				})
			]
		}), children]
	});
}
/** A parsed itx expression as the call it spells: `["itx","builtins",["get","x"],"run"]` →
*  `itx.builtins.get("x").run`. Anything else, as compact JSON. */
function printExpression(expression) {
	if (typeof expression === "string") return expression;
	if (!Array.isArray(expression)) return compactJson(expression, 240);
	const steps = [];
	for (const step of expression) if (typeof step === "string") steps.push(step);
	else if (Array.isArray(step) && typeof step[0] === "string") steps.push(`${step[0]}(${step.slice(1).map((arg) => compactJson(arg, 80)).join(", ")})`);
	else return compactJson(expression, 240);
	return steps.join(".");
}
function scalarText(value) {
	return typeof value === "string" ? value : compactJson(value, 400);
}
function compactJson(value, max) {
	let text;
	try {
		text = JSON.stringify(value, (_key, item) => typeof item === "bigint" ? item.toString() : item);
	} catch {
		text = String(value);
	}
	text ||= String(value);
	return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
//#endregion
//#region src/components/context-view/live-state-value.tsx
function LiveStateValue({ state, view, core }) {
	if (state.status === "error") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		"data-type": "error",
		className: "text-xs text-destructive",
		children: ["Live state unavailable: ", state.error]
	});
	if (state.value === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "flex items-center gap-2 text-xs text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, {}), " Connecting…"]
	});
	if (view === "raw") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SerializedObjectCodeBlock, {
		data: state.value,
		showToggle: false,
		className: "max-h-[28rem]"
	});
	return core ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CorePrettyState, { state: state.value }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrettyFields, { value: state.value });
}
//#endregion
//#region src/components/context-view/processors-panel.tsx
function ProcessorsPanel({ open, onClose, processors, presence, liveState, events, head, onPickActor }) {
	const [view, setView] = (0, import_react.useState)("pretty");
	const now = useNow(open);
	const rpcStubs = (0, import_react.useMemo)(() => new Set(presence.rpcStubs), [presence.rpcStubs]);
	const subscribers = (0, import_react.useMemo)(() => [...processors].sort((a, b) => kindRank(kindOf(a)) - kindRank(kindOf(b)) || a.configuredAtOffset - b.configuredAtOffset), [processors]);
	const callbackStubs = new Set(subscribers.flatMap((row) => lentStubKey(row) ?? []));
	const otherStubs = presence.rpcStubs.filter((key) => !callbackStubs.has(key));
	const core = liveState.core || CONNECTING;
	const delivered = subscribers.filter((row) => kindOf(row) !== "callback");
	const liveCallbacks = subscribers.filter((row) => kindOf(row) === "callback" && rpcStubs.has(lentStubKey(row)));
	const orphanedCallbacks = subscribers.filter((row) => kindOf(row) === "callback" && !rpcStubs.has(lentStubKey(row)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange: (next) => !next && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "right",
			className: "overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
				className: "flex-row items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Processors" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Who is here, what subscribes to this context, and what each has folded." })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "tablist",
					"aria-label": "How state reads",
					className: "mr-8 flex shrink-0 rounded-md border p-0.5 text-xs",
					children: ["pretty", "raw"].map((candidate) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						role: "tab",
						"aria-selected": view === candidate,
						onClick: () => setView(candidate),
						className: cn("rounded px-2 py-0.5 capitalize", view === candidate ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"),
						children: candidate
					}, candidate))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-col gap-6 px-4 pb-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Vitals, {
						events,
						head,
						core: core.value,
						now
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Here",
						count: presence.actors.length,
						children: [
							presence.actors.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quiet, { children: "Nobody has acted on this context in the loaded log." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "flex flex-col",
								children: presence.actors.map((who) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => onPickActor(who.actor),
									title: `Show only what ${who.email || who.actor} did`,
									className: "flex w-full min-w-0 items-baseline gap-3 rounded px-1 py-0.5 text-left text-xs hover:bg-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "min-w-0 flex-1 truncate",
											children: [who.email || who.actor, who.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "ml-2 font-mono text-muted-foreground",
												children: who.actor
											}) : null]
										}),
										who.grant ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden truncate font-mono text-muted-foreground sm:inline",
											children: who.grant
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "shrink-0 text-muted-foreground tabular-nums",
											title: who.lastSeenAt,
											children: ago(who.lastSeenAt, now)
										})
									]
								}) }, who.actor))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-1 text-xs text-muted-foreground",
								children: presence.rpcStubs.length === 0 ? "No rpc stub is lent to this context right now." : `${presence.rpcStubs.length} rpc ${presence.rpcStubs.length === 1 ? "stub" : "stubs"} lent right now${otherStubs.length < presence.rpcStubs.length ? `, ${presence.rpcStubs.length - otherStubs.length} of them for the live callbacks below` : ""}.`
							}),
							otherStubs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "flex flex-col px-1",
								children: otherStubs.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "truncate font-mono text-xs",
									title: key,
									children: key
								}, key))
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Subscribers",
						count: subscribers.length,
						children: [subscribers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quiet, { children: "Nothing subscribes to this context." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col divide-y",
							children: delivered.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Subscriber, {
								row,
								head,
								state: row.hostedFacet ? liveState[row.hostedFacet.name] : void 0,
								view
							}, row.name))
						}), liveCallbacks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-0.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Live callbacks: a session's subscription, delivered to the stub it lent"
								}),
								liveCallbacks.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveCallback, {
									row,
									connected: true
								}, row.name)),
								orphanedCallbacks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
									className: "text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
										className: "cursor-pointer text-muted-foreground hover:text-foreground",
										children: [orphanedCallbacks.length, " not connected: their session ended and the row stayed"]
									}), orphanedCallbacks.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveCallback, {
										row,
										connected: false
									}, row.name))]
								}) : null
							]
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "The context",
						aside: typeof core.rev === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums",
							children: ["reduced through #", core.rev.toLocaleString()]
						}) : null,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "The core reduce: rewrite rules, subscriptions, schedules, fetch routes, open runs, the pause."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveStateValue, {
							state: core,
							view,
							core: true
						})]
					})
				]
			})]
		})
	});
}
/** One subscriber: a heading line (name, kind, status), its facts as label / value lines, and a
*  processor's live state under them. */
function Subscriber({ row, head, state, view }) {
	const kind = kindOf(row);
	const status = statusOf(row, kind);
	const lag = row.cursor && head !== void 0 ? Math.max(0, head - row.cursor.confirmedOffset) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex min-w-0 flex-col gap-1.5 py-3 first:pt-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-wrap items-baseline gap-x-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "min-w-0 font-mono text-sm font-medium break-all",
						children: row.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: KIND_LABEL[kind]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("ml-auto text-xs", status.tone),
						children: status.label
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-[minmax(0,max-content)_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						label: "consumes",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono break-all",
							children: consumesText(row.consumes)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						label: "delivers to",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono break-all",
							children: row.target
						})
					}),
					row.hostedFacet ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Fact, {
						label: "hosts",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono break-all",
							children: [row.hostedFacet.className, row.hostedFacet.name === row.name ? "" : ` as ${row.hostedFacet.name}`]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("ml-2", row.hostedFacet.restarts > 0 ? "text-amber-700" : "text-muted-foreground"),
							title: "How often the platform failed the facet at its start and restarted it",
							children: row.hostedFacet.restarts > 0 ? `restarted ${row.hostedFacet.restarts}×` : "never restarted"
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						label: "since",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums",
							children: [
								"configured at #",
								row.configuredAtOffset.toLocaleString(),
								row.afterOffset !== void 0 && row.afterOffset !== row.configuredAtOffset ? `, delivering after #${row.afterOffset.toLocaleString()}` : ""
							]
						})
					}),
					row.cursor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						label: "confirmed",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums",
							children: [
								"#",
								row.cursor.confirmedOffset.toLocaleString(),
								lag === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: cn("ml-2", lag > 0 ? "text-amber-700" : "text-muted-foreground"),
									children: ["lag ", lag.toLocaleString()]
								})
							]
						})
					}) : null,
					row.halted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						label: "halted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-destructive",
							children: [
								"after #",
								row.halted.afterOffset.toLocaleString(),
								", ",
								row.halted.attempts,
								" attempts",
								row.halted.error ? `: ${row.halted.error}` : ""
							]
						})
					}) : null
				]
			}),
			state ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-col gap-1 pt-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Live state"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveStateValue, {
					state,
					view,
					core: false
				})]
			}) : null
		]
	});
}
/** A session's live callback, one line: its name, what it consumes, whether its stub is lent now. */
function LiveCallback({ row, connected }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "flex min-w-0 items-baseline gap-3 text-xs",
		title: row.target,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0 font-mono",
				children: row.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 truncate font-mono text-muted-foreground",
				children: consumesText(row.consumes)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "shrink-0 text-muted-foreground tabular-nums",
				children: ["#", row.configuredAtOffset.toLocaleString()]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("shrink-0", connected ? "text-emerald-700" : "text-muted-foreground"),
				children: connected ? "connected" : "gone"
			})
		]
	});
}
/** The head, the rate, the age and the pause on one line; a sparkline of the last hour under it. */
function Vitals({ events, head, core, now }) {
	const perMinute = (0, import_react.useMemo)(() => appendsPerMinute(events, now), [events, now]);
	const lastFive = perMinute.slice(-5).reduce((sum, count) => sum + count, 0) / 5;
	const state = record(core);
	const paused = state.paused ? record(state.paused) : void 0;
	const peak = Math.max(...perMinute);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-x-6 gap-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "head",
						value: head === void 0 ? "—" : `#${head.toLocaleString()}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "appends / min",
						value: lastFive >= 10 ? String(Math.round(lastFive)) : lastFive.toFixed(1),
						title: "Mean over the last five minutes, from the loaded log"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "age",
						value: typeof state.createdAt === "string" ? ago(state.createdAt, now, "") : "—",
						title: typeof state.createdAt === "string" ? `Created ${state.createdAt}` : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "incarnation",
						value: typeof state.incarnation === "number" ? String(state.incarnation) : "—",
						title: "The Durable Object's wake count: growth across idle is hibernation"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "paused",
						value: paused ? "yes" : "no",
						title: typeof paused?.reason === "string" ? paused.reason : void 0,
						tone: paused ? "text-amber-700" : void 0
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, { counts: perMinute }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] text-muted-foreground",
				children: [
					"Appends per minute over the last hour",
					peak > 0 ? `, peak ${peak}` : "",
					", from the loaded log."
				]
			})
		]
	});
}
function Stat({ label, value, title, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		title,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] tracking-wide text-muted-foreground uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("font-mono text-sm tabular-nums", tone),
			children: value
		})]
	});
}
/** One series as an area and its line, scaled to its own peak (floored at 5, so one event is not
*  a mountain). */
function Sparkline({ counts }) {
	const width = 360;
	const height = 36;
	const max = Math.max(5, ...counts);
	const step = width / Math.max(1, counts.length - 1);
	const points = counts.map((count, index) => `${(index * step).toFixed(1)},${(35 - count / max * 32).toFixed(1)}`).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${width} ${height}`,
		preserveAspectRatio: "none",
		className: "h-9 w-full text-sky-600",
		"aria-hidden": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
			points: `0,${height} ${points} ${width},${height}`,
			className: "fill-sky-500/10"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			points,
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.25",
			strokeLinejoin: "round",
			vectorEffect: "non-scaling-stroke"
		})]
	});
}
function Section({ title, count, aside, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex min-w-0 flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
			className: "flex items-baseline gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase",
			children: [
				title,
				count === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums",
					children: count
				}),
				aside ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-auto text-xs font-normal tracking-normal normal-case",
					children: aside
				}) : null
			]
		}), children]
	});
}
function Fact({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "min-w-0",
		children
	})] });
}
function Quiet({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs text-muted-foreground",
		children
	});
}
const KIND_LABEL = {
	processor: "processor",
	callback: "live callback",
	call: "itx call"
};
const kindRank = (kind) => [
	"processor",
	"call",
	"callback"
].indexOf(kind);
/** A row hosting a facet is a processor; one delivered to a lent stub is a session's live
*  callback; anything else is an itx call the context delivers at-least-once. */
function kindOf(row) {
	if (row.hostedFacet) return "processor";
	return lentStubKey(row) === void 0 ? "call" : "callback";
}
/** The key of the rpc stub a row delivers to (`itx.builtins.rpcStubs.get('<key>')…`), if it does. */
function lentStubKey(row) {
	return /rpcStubs\.get\((["'])(.+?)\1\)/.exec(row.target)?.[2];
}
function statusOf(row, kind) {
	if (row.halted) return {
		label: "halted",
		tone: "text-destructive"
	};
	if (row.cursor?.nextAttemptAtMs !== void 0) return {
		label: `retrying, attempt ${row.cursor.attempt}`,
		tone: "text-amber-700"
	};
	if (kind === "processor") return {
		label: "hosted",
		tone: "text-emerald-700"
	};
	return {
		label: "delivering",
		tone: "text-emerald-700"
	};
}
/** What a row consumes, short: its types without the `events.iterate.com/` prefix; none or `*` is
*  every durable event. */
function consumesText(consumes) {
	if (!consumes?.length || consumes.includes("*")) return "every durable event";
	return consumes.map(shortEventType).join(", ");
}
const CONNECTING = {
	status: "connecting",
	value: void 0
};
/** Appends per minute over the last hour (60 buckets, oldest first), read backwards off the
*  loaded log's tail until an event is older than the window. */
function appendsPerMinute(events, now) {
	const counts = Array.from({ length: 60 }, () => 0);
	const start = now - 36e5;
	for (let index = events.length - 1; index >= 0; index--) {
		const at = Date.parse(events[index].createdAt);
		if (Number.isNaN(at)) continue;
		if (at < start) break;
		counts[Math.min(59, Math.floor((at - start) / 6e4))]++;
	}
	return counts;
}
/** A compact age: `12s`, `5m`, `3.2h`, `4d`, with `suffix` after it. */
function ago(iso, now, suffix = " ago") {
	const seconds = Math.max(0, Math.round((now - Date.parse(iso)) / 1e3));
	if (Number.isNaN(seconds)) return "—";
	if (seconds < 60) return `${seconds}s${suffix}`;
	if (seconds < 3600) return `${Math.round(seconds / 60)}m${suffix}`;
	if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h${suffix}`;
	return `${Math.round(seconds / 86400)}d${suffix}`;
}
/** The clock, ticking every 15 s while `running` (the panel is open). */
function useNow(running) {
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	(0, import_react.useEffect)(() => {
		if (!running) return;
		setNow(Date.now());
		const timer = setInterval(() => setNow(Date.now()), 15e3);
		return () => clearInterval(timer);
	}, [running]);
	return now;
}
//#endregion
//#region src/components/context-view/context-view.tsx
const MODES = [{
	id: "pretty",
	label: "Pretty"
}, {
	id: "raw",
	label: "Raw"
}];
/** The strip's text buttons: a word, muted, the one that is on on a quiet fill — no border. */
const stripButton = (on) => cn("rounded-md px-2 py-0.5 whitespace-nowrap", on ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground");
function ContextView({ title, context, error: callerError, renderers, inspectors, state, onStateChange, onAppend, pathLinks, emptyText = "Nothing has happened on this context yet.", className }) {
	const { events, caughtUp, older = OLDER_EXHAUSTED, head, presence, liveState } = context;
	const processors = context.processors.rows;
	const error = callerError || context.error || context.processors.error;
	const mode = state.mode || "pretty";
	const filter = (0, import_react.useMemo)(() => contextViewFilterOf(state), [state]);
	const filtering = Boolean(state.filter);
	const inspected = state.event;
	/** The folds opened in place, by item key. */
	const [opened, setOpened] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	/** Bumped by each append from here: the feed goes back to its tail to show it land. */
	const [followTail, setFollowTail] = (0, import_react.useState)(0);
	const allRenderers = (0, import_react.useMemo)(() => ({
		...coreEventRenderers,
		...renderers
	}), [renderers]);
	const allInspectors = (0, import_react.useMemo)(() => ({
		...coreEventInspectors,
		...inspectors
	}), [inspectors]);
	const filteredRef = (0, import_react.useRef)(void 0);
	const shown = (0, import_react.useMemo)(() => (filteredRef.current = refilter(filteredRef.current, events, filter)).shown, [events, filter]);
	const factOf = (0, import_react.useMemo)(() => {
		const facts = /* @__PURE__ */ new WeakMap();
		return (event) => {
			let fact = facts.get(event);
			if (!fact) {
				const sentence = rendererFor(allRenderers, event.type)?.(event);
				const text = sentence ? sentenceText(sentence) : "";
				fact = `${event.type}\u0000${text || JSON.stringify(event.payload ?? null)}`;
				facts.set(event, fact);
			}
			return fact;
		};
	}, [allRenderers]);
	const foldRef = (0, import_react.useRef)(void 0);
	const { items, namedBefore } = (0, import_react.useMemo)(() => foldRef.current = refold(foldRef.current, shown, mode, factOf, actorLabel), [
		shown,
		mode,
		factOf
	]);
	const countsRef = (0, import_react.useRef)(void 0);
	const types = (0, import_react.useMemo)(() => filtering ? sortedCounts((countsRef.current = recount(countsRef.current, events)).counts) : [], [events, filtering]);
	const filtered = narrows(filter);
	const toggleOpened = (0, import_react.useCallback)((key) => setOpened((held) => {
		const next = new Set(held);
		if (!next.delete(key)) next.add(key);
		return next;
	}), []);
	const onStateChangeRef = (0, import_react.useRef)(onStateChange);
	onStateChangeRef.current = onStateChange;
	const inspect = (0, import_react.useCallback)((offset) => onStateChangeRef.current({
		...RIGHT_EDGE_CLOSED,
		event: offset
	}), []);
	const loaded = events.length.toLocaleString();
	const count = filtered ? `${shown.length.toLocaleString()} of ${loaded} loaded events` : older.exhausted ? `${loaded} events` : `${loaded} loaded of ~${(head ?? 0).toLocaleString()} events`;
	const gutter = { "--offset-width": `${String(String(events.at(-1)?.offset ?? 0).length + 1)}ch` };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex min-h-0 min-w-0 flex-col", className),
		style: gutter,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-x-4 gap-y-1 px-3 sm:px-4 py-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-baseline gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 truncate text-sm",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "shrink-0 text-xs text-muted-foreground tabular-nums",
							children: [
								count,
								caughtUp ? "" : " · loading",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventRate, { events })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresenceStrip, {
						className: "hidden min-w-0 xl:flex",
						actors: presence.actors,
						rpcStubs: presence.rpcStubs,
						onPick: (actor) => onStateChange({ actor: filter.actor === actor ? void 0 : actor })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-3 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								role: "tablist",
								"aria-label": "How the log reads",
								className: "flex gap-0.5",
								children: MODES.map((candidate) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									role: "tab",
									"aria-selected": mode === candidate.id,
									onClick: () => onStateChange({ mode: candidate.id === "pretty" ? void 0 : candidate.id }),
									className: stripButton(mode === candidate.id),
									children: candidate.label
								}, candidate.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => onStateChange({ filter: filtering ? void 0 : true }),
								"aria-expanded": filtering,
								className: stripButton(filtering || filtered),
								children: "Filter"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onStateChange({
									...RIGHT_EDGE_CLOSED,
									processors: true
								}),
								className: stripButton(false),
								children: ["Processors ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-foreground tabular-nums",
									children: processors.length
								})]
							})
						]
					})
				]
			}),
			filtering ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 sm:px-4 pb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterRow, {
					filter,
					counts: types,
					narrowed: filtered,
					partial: !older.exhausted,
					loaded,
					onStateChange
				})
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-type": "error",
				className: "px-3 sm:px-4 text-sm text-destructive",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextPathLinksContext, {
				value: pathLinks,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedList, {
					items,
					namedBefore,
					mode,
					renderers: allRenderers,
					inspected,
					onInspect: inspect,
					opened,
					onToggle: toggleOpened,
					older,
					followTail,
					empty: error ? null : caughtUp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-3 sm:px-4 py-6 text-sm text-muted-foreground",
						children: filtered ? "No event matches the filter." : emptyText
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 px-3 sm:px-4 py-6 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, {}), " Loading the log…"]
					})
				})
			}),
			onAppend ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppendComposer, {
				onAppend,
				onAppended: () => setFollowTail((count) => count + 1),
				events,
				processors
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventInspector, {
				events,
				offset: inspected,
				older,
				renderers: allRenderers,
				inspectors: allInspectors,
				onNavigate: inspect,
				onClose: () => onStateChange({ event: void 0 })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProcessorsPanel, {
				open: Boolean(state.processors),
				onClose: () => onStateChange({ processors: void 0 }),
				processors,
				presence,
				liveState,
				events,
				head,
				onPickActor: (actor) => onStateChange({
					actor,
					processors: void 0
				})
			})
		]
	});
}
/** The whole log is loaded: nothing older to read. */
const OLDER_EXHAUSTED = {
	loadOlder: () => {},
	loading: false,
	exhausted: true
};
//#endregion
export { ContextView };
