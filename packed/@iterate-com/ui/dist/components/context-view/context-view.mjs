import { r as __toESM } from "../../rolldown-runtime.mjs";
import { i as require_react, r as require_react_dom, t as require_jsx_runtime } from "../../vendor-react.mjs";
import { a as object, i as number, n as array, o as string, r as literal, t as _enum } from "../../schemas.mjs";
import { t as cn } from "../../dist.mjs";
import { n as stringify, r as createLucideIcon, t as parse } from "../../browser.mjs";
import { C as Button$1, S as DialogBackdrop, _ as DialogRoot, b as DialogDescription, c as MenuTrigger, d as MenuPortal, f as MenuPopup, g as DialogTitle, h as MenuGroup, l as MenuRoot, m as MenuGroupLabel, p as MenuItem, s as Input$1, u as MenuPositioner, v as DialogPortal, x as DialogClose, y as DialogPopup } from "../../vendor-base-ui.mjs";
//#region src/lib/plain-left-click.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/** A plain left click — not a modified one (cmd/ctrl/shift/alt: a new tab or window), not the
*  middle button, not one something else already handled. */
function plainLeftClick(event) {
	return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}
//#endregion
//#region src/components/context-view/context-path.tsx
var import_jsx_runtime = /* @__PURE__ */ __toESM(require_jsx_runtime(), 1);
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
		import("../../vendor-codemirror.mjs").then((n) => n.d),
		import("../../vendor-codemirror.mjs").then((n) => n.u)
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
		parsed = parse(text);
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
