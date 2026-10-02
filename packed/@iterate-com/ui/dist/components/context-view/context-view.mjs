import { Suspense, createContext, isValidElement, lazy, memo, useCallback, useContext, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { cn } from "cn";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { z } from "zod";
import { ArrowDownIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, Loader2Icon, PlusIcon, SearchIcon, SparklesIcon, XIcon } from "lucide-react";
import { Button } from "@base-ui/react/button";
import { cva } from "class-variance-authority";
import { Dialog } from "@base-ui/react/dialog";
import { useVirtualizer } from "@tanstack/react-virtual";
import { parse, stringify } from "yaml";
import { Menu } from "@base-ui/react/menu";
import { Input } from "@base-ui/react/input";
//#region src/lib/plain-left-click.ts
/** A plain left click — not a modified one (cmd/ctrl/shift/alt: a new tab or window), not the
*  middle button, not one something else already handled. */
function plainLeftClick(event) {
	return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}
//#endregion
//#region src/components/context-view/context-path.tsx
/** The links a context view's rows use for the paths they name (a child context's): provided by
*  `ContextView` from its `pathLinks`, absent where the app gave none. */
const ContextPathLinksContext = createContext(void 0);
/** An anchor to a context path: a plain click goes through the app's router, a modified or middle
*  click is the browser's. */
function PathLink({ path, links, className, children, ...rest }) {
	const href = links.hrefOf(path);
	return /* @__PURE__ */ jsx("a", {
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
	const links = useContext(ContextPathLinksContext);
	if (!links) return /* @__PURE__ */ jsx("span", {
		className: "font-mono",
		children: path
	});
	return /* @__PURE__ */ jsx(PathLink, {
		path,
		links,
		className: "font-mono underline decoration-border underline-offset-2 hover:decoration-foreground",
		children: path
	});
}
z.object({
	/** How the log reads; omitted = the app's default (Pretty). */
	mode: z.enum([
		"pretty",
		"pretty-raw",
		"raw"
	]).optional().catch(void 0),
	/** The text query over the type and the payload. */
	q: z.string().optional().catch(void 0),
	/** The event types left ticked; omitted = all. */
	types: z.array(z.string()).optional().catch(void 0),
	/** One actor's events only. */
	actor: z.string().optional().catch(void 0),
	/** The lowest offset shown, inclusive. */
	from: z.number().int().nonnegative().optional().catch(void 0),
	/** The highest offset shown, inclusive. */
	to: z.number().int().nonnegative().optional().catch(void 0),
	/** The inspected event's offset — the inspector is open. */
	event: z.number().int().nonnegative().optional().catch(void 0),
	/** The processors sheet is open. */
	processors: z.literal(true).optional().catch(void 0),
	/** The filter row is open. */
	filter: z.literal(true).optional().catch(void 0)
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
const mono = (text) => /* @__PURE__ */ jsx("span", {
	className: "font-mono text-xs text-muted-foreground",
	children: text
});
//#endregion
//#region src/components/context-view/core-renderers.tsx
/** The platform's housekeeping reads quieter than what people and apps did. */
const quiet = (text) => /* @__PURE__ */ jsx("span", {
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
	"events.iterate.com/itx/run-requested": (e) => /* @__PURE__ */ jsx("pre", {
		className: "overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap break-words",
		children: str(record(e.payload).code)
	}),
	"events.iterate.com/itx/run-settled": (e) => {
		const s = record(record(e.payload).settlement);
		return s.status === "succeeded" ? /* @__PURE__ */ jsx("pre", {
			className: "overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap break-words",
			children: JSON.stringify(s.result ?? null, null, 2)
		}) : /* @__PURE__ */ jsxs("p", {
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
		return /* @__PURE__ */ jsxs("span", {
			className: "text-purple-700",
			children: [
				"Woke · ",
				str(p.cause, "?"),
				typeof p.call === "string" ? /* @__PURE__ */ jsxs(Fragment, { children: [" ", mono(p.call)] }) : "",
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
	"events.iterate.com/itx/child-created": (e) => /* @__PURE__ */ jsxs("span", {
		className: "text-muted-foreground",
		children: [
			"Child context ",
			/* @__PURE__ */ jsx(ContextPathText, { path: str(record(e.payload).childPath) }),
			" created"
		]
	}),
	"events.iterate.com/itx/subscription-configured": (e) => {
		const p = record(e.payload);
		const consumes = Array.isArray(p.consumes) ? p.consumes.map(String) : [];
		return /* @__PURE__ */ jsxs("span", {
			className: "text-muted-foreground",
			children: [
				"Subscription ",
				mono(str(p.name)),
				" configured",
				consumes.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [" · consumes ", mono(consumes.join(", "))] }) : null
			]
		});
	},
	"events.iterate.com/itx/live-state-changed": () => quiet("Live state changed"),
	"events.iterate.com/itx/run-requested": (e) => {
		const code = str(record(e.payload).code);
		return /* @__PURE__ */ jsxs(Fragment, { children: ["Ran a script ", mono((code.split("\n")[0] || "").slice(0, 100))] });
	},
	"events.iterate.com/itx/run-settled": (e) => {
		const p = record(e.payload);
		const s = record(p.settlement);
		return s.status === "succeeded" ? /* @__PURE__ */ jsxs(Fragment, { children: [
			"Script ",
			mono(`#${String(p.requestOffset)}`),
			" returned",
			" ",
			mono(JSON.stringify(s.result ?? null).slice(0, 100))
		] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
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
	if (isValidElement(node)) return sentenceText(node.props.children);
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
	return /* @__PURE__ */ jsxs("span", {
		className: OFFSET,
		children: ["#", offset]
	});
}
/** The empty columns before the body (the offset, and with `times` the clock and the gap), so a
*  line that is not an event — a day, the top of the log, the composer — starts where they do. */
function RowGutter({ times }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
		"aria-hidden": true,
		className: cn(OFFSET, "max-sm:hidden")
	}), times ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
		"aria-hidden": true,
		className: cn(CLOCK, "max-sm:hidden")
	}), /* @__PURE__ */ jsx("span", {
		"aria-hidden": true,
		className: cn(GAP, "max-sm:hidden")
	})] }) : null] });
}
/** Who acted, when it changes hands: the right edge on a desktop, the meta line on a phone. */
function RowWho({ who }) {
	return /* @__PURE__ */ jsx("span", {
		className: "max-w-48 shrink-0 truncate text-xs text-muted-foreground max-sm:font-mono max-sm:text-[11px] sm:ml-auto",
		children: who
	});
}
/** The clock and the gap since the row before (from its LAST moment, so a fold's gap is the idle
*  time between rows, not inside one): two columns, the gap blank under a second. */
function RowTimes({ event, previous }) {
	const at = Date.parse(event.createdAt);
	const gap = previous ? Math.max(0, at - Date.parse(previous.createdAt)) : void 0;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("time", {
		dateTime: event.createdAt,
		title: new Date(at).toISOString(),
		className: CLOCK,
		children: formatClockTime(at)
	}), /* @__PURE__ */ jsx("span", {
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
	return /* @__PURE__ */ jsxs("span", {
		className: cn("flex min-w-0 gap-3 font-mono text-xs leading-5 text-muted-foreground", className),
		children: [/* @__PURE__ */ jsx("span", {
			className: "w-[26ch] shrink-0 truncate text-foreground/85",
			children: shortEventType(event.type)
		}), glance ? /* @__PURE__ */ jsx("span", {
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
	return /* @__PURE__ */ jsx("span", {
		className: cn("block max-h-10 min-w-0 overflow-hidden text-sm leading-5 whitespace-normal sm:max-h-none sm:truncate [&_*]:inline", className),
		children: rich ?? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
			className: "font-mono text-xs text-foreground/80",
			children: shortEventType(event.type)
		}), glance ? /* @__PURE__ */ jsx("span", {
			className: "ml-2 text-xs text-muted-foreground",
			children: glance
		}) : null] })
	});
}
const EventRow = memo(function EventRow({ event, previous, renderers, mode, showWho, quiet, selected, onOpen }) {
	const who = actorLabel(event);
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onClick: () => onOpen(event.offset),
		"data-offset": event.offset,
		className: cn(rowClass(selected), quiet && "text-muted-foreground"),
		children: [
			/* @__PURE__ */ jsx(RowOffset, { offset: event.offset }),
			/* @__PURE__ */ jsx(RowTimes, {
				event,
				previous
			}),
			/* @__PURE__ */ jsxs("span", {
				className: rowBody,
				children: [mode === "raw" ? /* @__PURE__ */ jsx(RawLine, { event }) : /* @__PURE__ */ jsx(EventSentence, {
					event,
					renderers
				}), mode === "pretty-raw" ? /* @__PURE__ */ jsx(RawLine, {
					event,
					className: "mt-0.5 text-[11px]"
				}) : null]
			}),
			showWho && who ? /* @__PURE__ */ jsx(RowWho, { who }) : null
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
function Button$1({ className, variant = "default", size = "default", ...props }) {
	return /* @__PURE__ */ jsx(Button, {
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
	return /* @__PURE__ */ jsx(Dialog.Root, {
		"data-slot": "sheet",
		...props
	});
}
function SheetPortal({ ...props }) {
	return /* @__PURE__ */ jsx(Dialog.Portal, {
		"data-slot": "sheet-portal",
		...props
	});
}
function SheetOverlay({ className, ...props }) {
	return /* @__PURE__ */ jsx(Dialog.Backdrop, {
		"data-slot": "sheet-overlay",
		className: cn("fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs", className),
		...props
	});
}
function SheetContent({ className, children, side = "right", showCloseButton = true, ...props }) {
	return /* @__PURE__ */ jsxs(SheetPortal, { children: [/* @__PURE__ */ jsx(SheetOverlay, {}), /* @__PURE__ */ jsxs(Dialog.Popup, {
		"data-slot": "sheet-content",
		"data-side": side,
		className: cn("fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm", className),
		...props,
		children: [children, showCloseButton && /* @__PURE__ */ jsxs(Dialog.Close, {
			"data-slot": "sheet-close",
			render: /* @__PURE__ */ jsx(Button$1, {
				variant: "ghost",
				className: "absolute top-3 right-3",
				size: "icon-sm"
			}),
			children: [/* @__PURE__ */ jsx(XIcon, {}), /* @__PURE__ */ jsx("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function SheetHeader({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "sheet-header",
		className: cn("flex flex-col gap-0.5 p-4", className),
		...props
	});
}
function SheetTitle({ className, ...props }) {
	return /* @__PURE__ */ jsx(Dialog.Title, {
		"data-slot": "sheet-title",
		className: cn("text-base font-medium text-foreground", className),
		...props
	});
}
function SheetDescription({ className, ...props }) {
	return /* @__PURE__ */ jsx(Dialog.Description, {
		"data-slot": "sheet-description",
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
//#endregion
//#region src/components/ui/spinner.tsx
function Spinner({ className, ...props }) {
	return /* @__PURE__ */ jsx(Loader2Icon, {
		"data-slot": "spinner",
		role: "status",
		"aria-label": "Loading",
		className: cn("size-4 animate-spin", className),
		...props
	});
}
lazy(async () => {
	const [{ CodeBlock }, { javascript }, { markdown }] = await Promise.all([
		import("../../code-block.client.mjs"),
		import("@codemirror/lang-javascript"),
		import("@codemirror/lang-markdown")
	]);
	const languages = {
		typescript: javascript({
			jsx: true,
			typescript: true
		}),
		markdown: markdown()
	};
	return { default: ({ language, ...props }) => /* @__PURE__ */ jsx(CodeBlock, {
		...props,
		language: languages[language]
	}) };
});
const LazySerializedBlock = lazy(async () => ({ default: (await import("../../code-block.client.mjs")).SerializedObjectCodeBlock }));
/** Any value as YAML or JSON, with a button to copy each (code-block.client.tsx). */
function SerializedObjectCodeBlock(props) {
	return /* @__PURE__ */ jsx(Suspense, {
		fallback: /* @__PURE__ */ jsx(CodeBlockFallback, { className: props.className }),
		children: /* @__PURE__ */ jsx(LazySerializedBlock, { ...props })
	});
}
function CodeBlockFallback({ className }) {
	return /* @__PURE__ */ jsx("div", {
		className: cn("relative flex min-h-0 flex-col", className),
		"data-spinner": "true",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex min-h-16 items-center gap-2 rounded border px-3 py-2 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ jsx(Spinner, { className: "size-3.5" }), /* @__PURE__ */ jsx("span", { children: "Loading code block..." })]
		})
	});
}
//#endregion
//#region src/components/context-view/event-inspector.tsx
function EventInspector({ events, offset, older, renderers, inspectors, onNavigate, onClose }) {
	const open = offset !== void 0;
	const [shown, setShown] = useState(offset);
	if (offset !== void 0 && offset !== shown) setShown(offset);
	const { event, previous, next, missing } = useMemo(() => shown === void 0 ? void 0 : inspectedPlace(events, shown), [events, shown]) || {};
	const olderLeft = !older.exhausted;
	const [steppingBackFrom, setSteppingBackFrom] = useState();
	const stepBack = () => {
		if (previous) onNavigate(previous.offset);
		else if (olderLeft && shown !== void 0) {
			setSteppingBackFrom(shown);
			older.loadOlder();
		}
	};
	const stepForward = () => next && onNavigate(next.offset);
	useEffect(() => {
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
	useEffect(() => {
		if (readingDown && !older.loading) older.loadOlder();
	}, [readingDown, older]);
	const onKey = useEffectEvent((key) => {
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
	useEffect(() => {
		if (!open) return;
		const listener = (key) => onKey(key);
		window.addEventListener("keydown", listener, true);
		return () => window.removeEventListener("keydown", listener, true);
	}, [open]);
	const raw = useMemo(() => event ? orderEventKeys(event) : void 0, [event]);
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
	return /* @__PURE__ */ jsx(Sheet, {
		open,
		onOpenChange: (opened) => !opened && onClose(),
		children: /* @__PURE__ */ jsx(SheetContent, {
			side: "right",
			className: "gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-3xl",
			inert: !open,
			children: shown === void 0 ? null : /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsxs(SheetHeader, {
					className: "shrink-0 pr-12",
					children: [/* @__PURE__ */ jsx(SheetTitle, {
						className: "line-clamp-2 text-sm [&_*]:inline",
						title: event?.type,
						children: !event ? `Event #${String(shown)}` : sentence ?? /* @__PURE__ */ jsx("span", {
							className: "font-mono",
							children: shortEventType(event.type)
						})
					}), /* @__PURE__ */ jsxs(SheetDescription, {
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
				/* @__PURE__ */ jsxs("div", {
					className: "flex shrink-0 flex-wrap items-center gap-2 px-4 pb-3",
					children: [
						/* @__PURE__ */ jsxs(Button$1, {
							size: "sm",
							variant: "outline",
							disabled: !open || !previous && !olderLeft,
							onClick: stepBack,
							children: [steppingBackFrom === void 0 ? /* @__PURE__ */ jsx(ChevronLeftIcon, {}) : /* @__PURE__ */ jsx(Spinner, {}), "Prev"]
						}),
						/* @__PURE__ */ jsxs(Button$1, {
							size: "sm",
							variant: "outline",
							disabled: !open || !next,
							onClick: stepForward,
							children: ["Next", /* @__PURE__ */ jsx(ChevronRightIcon, {})]
						}),
						/* @__PURE__ */ jsx("span", {
							className: "hidden text-xs text-muted-foreground/70 sm:inline",
							children: "← → page the log"
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "ml-auto flex items-center gap-2 font-mono text-[10px] text-muted-foreground",
							children: [
								sincePrevious ? /* @__PURE__ */ jsx("span", {
									title: "Since the previous event",
									children: sincePrevious
								}) : null,
								sincePrevious && untilNext ? /* @__PURE__ */ jsx("span", { children: "·" }) : null,
								untilNext ? /* @__PURE__ */ jsxs("span", {
									title: "Until the next event",
									children: [untilNext, " to next"]
								}) : null
							]
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto border-t px-4 py-3",
					children: !event ? /* @__PURE__ */ jsx("p", {
						className: "text-sm text-muted-foreground",
						children: readingDown ? /* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ jsx(Spinner, {}),
								" Reading older events to reach #",
								shown,
								"…"
							]
						}) : missing === "above" ? `No event #${String(shown)} yet.` : `No event has offset #${String(shown)}. Prev and Next go to its neighbours.`
					}) : /* @__PURE__ */ jsxs(Fragment, { children: [
						body ? /* @__PURE__ */ jsx("div", {
							className: "min-w-0",
							children: body
						}) : null,
						envelope.length > 0 ? /* @__PURE__ */ jsx("dl", {
							className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs",
							children: envelope.map(([label, value]) => /* @__PURE__ */ jsxs("div", {
								className: "contents",
								children: [/* @__PURE__ */ jsx("dt", {
									className: "text-muted-foreground",
									children: label
								}), /* @__PURE__ */ jsx("dd", {
									className: "min-w-0 truncate font-mono",
									title: value,
									children: value
								})]
							}, label))
						}) : null,
						/* @__PURE__ */ jsx("div", {
							className: "min-w-0",
							children: /* @__PURE__ */ jsx(SerializedObjectCodeBlock, { data: raw })
						})
					] })
				})
			] })
		})
	});
}
//#endregion
//#region src/components/context-view/feed-rows.tsx
const DaySeparator = memo(function DaySeparator({ date }) {
	const today = /* @__PURE__ */ new Date();
	const yesterday = /* @__PURE__ */ new Date(today.getTime() - 864e5);
	const label = date.toDateString() === today.toDateString() ? "Today" : date.toDateString() === yesterday.toDateString() ? "Yesterday" : date.toLocaleDateString(void 0, {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: date.getFullYear() === today.getFullYear() ? void 0 : "numeric"
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-baseline gap-x-3.5 px-3 sm:px-4 pt-3 pb-1",
		children: [/* @__PURE__ */ jsx(RowGutter, {}), /* @__PURE__ */ jsx("span", {
			className: "text-xs font-semibold text-foreground/75",
			children: label
		})]
	});
});
function Chevron({ open }) {
	return open ? /* @__PURE__ */ jsx(ChevronDownIcon, { className: "size-3 shrink-0 self-center text-muted-foreground/70" }) : /* @__PURE__ */ jsx(ChevronRightIcon, { className: "size-3 shrink-0 self-center text-muted-foreground/70" });
}
/** The same fact `events.length` times in a row: its sentence once, the count, the span of time. */
const RepeatRow = memo(function RepeatRow({ itemKey, events, previous, renderers, showWho, open, onToggle }) {
	const first = events[0];
	const last = events.at(-1);
	const who = actorLabel(first);
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onClick: () => onToggle(itemKey),
		"aria-expanded": open,
		className: rowClass(),
		children: [
			/* @__PURE__ */ jsx(RowOffset, { offset: first.offset }),
			/* @__PURE__ */ jsx(RowTimes, {
				event: first,
				previous
			}),
			/* @__PURE__ */ jsxs("span", {
				className: cn(rowBody, "flex items-baseline gap-1.5"),
				children: [
					/* @__PURE__ */ jsx(EventSentence, {
						event: first,
						renderers,
						className: "min-w-0"
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "shrink-0 text-[11px] text-muted-foreground tabular-nums",
						title: `${String(events.length)} times, ${formatClockTime(Date.parse(first.createdAt))} – ${formatClockTime(Date.parse(last.createdAt))}`,
						children: ["×", events.length]
					}),
					/* @__PURE__ */ jsx(Chevron, { open })
				]
			}),
			showWho && who ? /* @__PURE__ */ jsx(RowWho, { who }) : null
		]
	});
});
/** A run of the platform's housekeeping: one quiet line saying how much of what; open for the rows. */
const HousekeepingRow = memo(function HousekeepingRow({ itemKey, events, previous, open, onToggle }) {
	const first = events[0];
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onClick: () => onToggle(itemKey),
		"aria-expanded": open,
		className: cn(rowClass(), "text-muted-foreground"),
		children: [
			/* @__PURE__ */ jsx(RowOffset, { offset: first.offset }),
			/* @__PURE__ */ jsx(RowTimes, {
				event: first,
				previous
			}),
			/* @__PURE__ */ jsxs("span", {
				className: cn(rowBody, "flex items-baseline gap-1 text-[13px]"),
				children: [/* @__PURE__ */ jsx(Chevron, { open }), /* @__PURE__ */ jsxs("span", {
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
	const stuck = useRef(true);
	const [stuckState, setStuckState] = useState(true);
	const resizeObserverRef = useRef(null);
	useEffect(() => {
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
	useEffect(() => {
		if (contentElementRef.current) resizeObserverRef.current?.observe(contentElementRef.current);
	});
	return {
		stuckRef: stuck,
		stuck: stuckState,
		stick: useCallback(() => {
			stuck.current = true;
			setStuckState(true);
			const scroller = scrollElementRef.current;
			if (scroller) scroller.scrollTop = scroller.scrollHeight;
		}, [scrollElementRef]),
		release: useCallback(() => {
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
	const { rows, itemIndexOf } = useMemo(() => {
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
	const scrollRef = useRef(null);
	const contentRef = useRef(null);
	const { stuckRef, stuck, stick, release } = useStickToBottom({
		scrollElementRef: scrollRef,
		contentElementRef: contentRef
	});
	useEffect(() => {
		if (followTail) stick();
	}, [followTail, stick]);
	const { loadOlder, loading, exhausted } = older;
	const top = exhausted ? 0 : 1;
	const getItemKey = useCallback((index) => index < top ? "top" : rows[index - top].key, [rows, top]);
	const estimateSize = useCallback((index) => {
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
	const revealRef = useRef(void 0);
	useEffect(() => {
		revealRef.current = inspected;
	}, [inspected]);
	useEffect(() => {
		const offset = revealRef.current;
		if (offset === void 0 || rows.length === 0) return;
		revealRef.current = void 0;
		const index = rows.findIndex((row) => rowOffset(row) === offset);
		if (index < 0) return;
		release();
		virtualizer.scrollToIndex(index + top, { align: "auto" });
	});
	const lastOffset = rows.length > 0 ? lastOffsetOf(rows[rows.length - 1]) : 0;
	const leftAtRef = useRef(lastOffset);
	if (stuck) leftAtRef.current = lastOffset;
	let arrived = 0;
	if (!stuck) {
		for (let at = rows.length - 1; at >= 0 && lastOffsetOf(rows[at]) > leftAtRef.current; at--) if (rows[at].kind !== "day") arrived += 1;
	}
	const firstInView = virtualItems[0]?.index ?? 0;
	useEffect(() => {
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
	return /* @__PURE__ */ jsxs("div", {
		className: "relative flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ jsx("div", {
			ref: scrollRef,
			role: "log",
			"aria-label": "Events",
			className: "min-h-0 flex-1 overflow-y-auto overscroll-contain",
			children: rows.length === 0 ? empty : /* @__PURE__ */ jsx("div", {
				ref: contentRef,
				className: "relative w-full",
				style: { height: virtualizer.getTotalSize() },
				children: virtualItems.map((virtualItem) => /* @__PURE__ */ jsx("div", {
					"data-index": virtualItem.index,
					ref: virtualizer.measureElement,
					className: "absolute top-0 left-0 w-full",
					style: { transform: `translateY(${String(virtualItem.start)}px)` },
					children: virtualItem.index < top ? /* @__PURE__ */ jsx(OlderRow, {
						loading,
						onLoad: loadOlder
					}) : renderRow(virtualItem.index - top)
				}, virtualItem.key))
			})
		}), stuck || rows.length === 0 ? null : /* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: stick,
			className: "absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm hover:text-foreground",
			children: [
				/* @__PURE__ */ jsx(ArrowDownIcon, { className: "size-3.5" }),
				"Jump to latest",
				arrived > 0 ? /* @__PURE__ */ jsxs("span", {
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
		if (row.kind === "member") return /* @__PURE__ */ jsx(EventRow, {
			event: row.event,
			previous: row.previous,
			renderers,
			mode: row.quiet ? "pretty" : "pretty-raw",
			showWho: false,
			quiet: row.quiet,
			selected: inspected === row.event.offset,
			onOpen: onInspect
		});
		if (row.kind === "day") return /* @__PURE__ */ jsx(DaySeparator, { date: row.date });
		const itemIndex = itemIndexOf ? itemIndexOf[index] : index;
		const previous = lastEventOf(items[itemIndex - 1]);
		const first = row.kind === "event" ? row.event : row.events[0];
		const showWho = actorLabel(first) !== namedBefore[itemIndex];
		if (row.kind === "repeat") return /* @__PURE__ */ jsx(RepeatRow, {
			itemKey: row.key,
			events: row.events,
			previous,
			renderers,
			showWho,
			open: opened.has(row.key),
			onToggle
		});
		if (row.kind === "housekeeping") return /* @__PURE__ */ jsx(HousekeepingRow, {
			itemKey: row.key,
			events: row.events,
			previous,
			open: opened.has(row.key),
			onToggle
		});
		return /* @__PURE__ */ jsx(EventRow, {
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
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-7 items-center gap-x-3.5 px-3 sm:px-4 text-xs text-muted-foreground",
		children: [/* @__PURE__ */ jsx(RowGutter, { times: true }), loading ? /* @__PURE__ */ jsxs("span", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ jsx(Spinner, {}), " Loading older events…"]
		}) : /* @__PURE__ */ jsx("button", {
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
const LazyEditor = lazy(async () => {
	return { default: (await import("../../code-editor.client.mjs")).CodeEditor };
});
function CodeEditor(props) {
	return /* @__PURE__ */ jsx(Suspense, {
		fallback: null,
		children: /* @__PURE__ */ jsx(LazyEditor, { ...props })
	});
}
//#endregion
//#region src/components/ui/dropdown-menu.tsx
function DropdownMenu({ ...props }) {
	return /* @__PURE__ */ jsx(Menu.Root, {
		"data-slot": "dropdown-menu",
		...props
	});
}
function DropdownMenuTrigger({ ...props }) {
	return /* @__PURE__ */ jsx(Menu.Trigger, {
		"data-slot": "dropdown-menu-trigger",
		...props
	});
}
function DropdownMenuContent({ align = "start", alignOffset = 0, side = "bottom", sideOffset = 4, className, ...props }) {
	return /* @__PURE__ */ jsx(Menu.Portal, { children: /* @__PURE__ */ jsx(Menu.Positioner, {
		className: "isolate z-50 outline-none",
		align,
		alignOffset,
		side,
		sideOffset,
		children: /* @__PURE__ */ jsx(Menu.Popup, {
			"data-slot": "dropdown-menu-content",
			className: cn("z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95", className),
			...props
		})
	}) });
}
function DropdownMenuGroup({ ...props }) {
	return /* @__PURE__ */ jsx(Menu.Group, {
		"data-slot": "dropdown-menu-group",
		...props
	});
}
function DropdownMenuLabel({ className, inset, ...props }) {
	return /* @__PURE__ */ jsx(Menu.GroupLabel, {
		"data-slot": "dropdown-menu-label",
		"data-inset": inset,
		className: cn("px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7", className),
		...props
	});
}
function DropdownMenuItem({ className, inset, variant = "default", ...props }) {
	return /* @__PURE__ */ jsx(Menu.Item, {
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
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState(DEFAULT_APPEND_YAML);
	const [pending, setPending] = useState(false);
	/** The last submit's outcome, until the draft changes. */
	const [outcome, setOutcome] = useState();
	const examples = useMemo(() => exampleGroups(processors), [processors]);
	const countsRef = useRef(void 0);
	const known = useMemo(() => open ? knownEventTypes(sortedCounts((countsRef.current = recount(countsRef.current, events)).counts), processors) : [], [
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
	if (!open) return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-x-3.5 px-3 sm:px-4 py-1",
		children: [
			/* @__PURE__ */ jsx(RowGutter, { times: true }),
			/* @__PURE__ */ jsxs(Button$1, {
				variant: "ghost",
				size: "sm",
				className: "-ml-2",
				onClick: () => setOpen(true),
				children: [/* @__PURE__ */ jsx(PlusIcon, {}), " Append event"]
			}),
			/* @__PURE__ */ jsx("span", {
				className: "hidden text-xs text-muted-foreground sm:inline",
				children: "YAML · ⌘↵"
			})
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "flex gap-x-3.5 border-t px-3 sm:px-4 pt-2 pb-1",
		"data-slot": "append-composer",
		children: [/* @__PURE__ */ jsx(RowGutter, { times: true }), /* @__PURE__ */ jsxs("div", {
			className: "flex min-w-0 flex-1 flex-col gap-2",
			children: [/* @__PURE__ */ jsx(CodeEditor, {
				value: draft,
				onValueChange: edit,
				onSubmit: () => void submit(),
				language: "yaml",
				label: "Events to append",
				placeholder: "type: manual/note-added  (a YAML list appends several)",
				focusOnMount: true,
				complete: (text, pos, explicit) => appendCompletionsAt(text, pos, explicit, known)
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					examples.length > 0 ? /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsxs(DropdownMenuTrigger, {
						render: /* @__PURE__ */ jsx(Button$1, {
							variant: "ghost",
							size: "sm"
						}),
						children: [/* @__PURE__ */ jsx(SparklesIcon, {}), " Examples"]
					}), /* @__PURE__ */ jsx(DropdownMenuContent, {
						align: "start",
						side: "top",
						className: "w-auto max-w-80",
						children: examples.map((group) => /* @__PURE__ */ jsxs(DropdownMenuGroup, { children: [/* @__PURE__ */ jsx(DropdownMenuLabel, {
							className: "truncate",
							children: group.label
						}), group.types.map((type) => /* @__PURE__ */ jsx(DropdownMenuItem, {
							title: type,
							onClick: () => edit(exampleYaml(type)),
							className: "font-mono text-xs",
							children: /* @__PURE__ */ jsx("span", {
								className: "truncate",
								children: shortEventType(type)
							})
						}, type))] }, group.label))
					})] }) : null,
					/* @__PURE__ */ jsx("span", {
						className: "min-w-0 flex-1 truncate text-xs",
						role: "status",
						children: outcome && "error" in outcome ? /* @__PURE__ */ jsx("span", {
							"data-type": "error",
							className: "text-destructive",
							title: outcome.error,
							children: outcome.error
						}) : outcome ? /* @__PURE__ */ jsxs("span", {
							className: "text-muted-foreground",
							children: ["Appended ", outcome.appended === 1 ? "1 event" : `${String(outcome.appended)} events`]
						}) : /* @__PURE__ */ jsx("span", {
							className: "hidden text-muted-foreground sm:inline",
							children: "YAML or JSON · Tab completes · ⌘↵ appends"
						})
					}),
					/* @__PURE__ */ jsx(Button$1, {
						variant: "ghost",
						size: "sm",
						onClick: () => setOpen(false),
						children: "Close"
					}),
					/* @__PURE__ */ jsxs(Button$1, {
						size: "sm",
						onClick: () => void submit(),
						disabled: pending || blank,
						title: "Append events (⌘↵)",
						children: [pending ? /* @__PURE__ */ jsx(Spinner, {}) : null, " Append"]
					})
				]
			})]
		})]
	});
}
//#endregion
//#region src/components/ui/input.tsx
function Input$1({ className, type, ...props }) {
	return /* @__PURE__ */ jsx(Input, {
		type,
		"data-slot": "input",
		className: cn("h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40", className),
		...props
	});
}
//#endregion
//#region src/components/ui/input-group.tsx
function InputGroup({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
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
	return /* @__PURE__ */ jsx("div", {
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
cva("flex items-center gap-2 text-sm shadow-none", {
	variants: { size: {
		xs: "h-6 gap-1 rounded-[calc(var(--radius)-3px)] px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
		sm: "",
		"icon-xs": "size-6 rounded-[calc(var(--radius)-3px)] p-0 has-[>svg]:p-0",
		"icon-sm": "size-8 p-0 has-[>svg]:p-0"
	} },
	defaultVariants: { size: "xs" }
});
function InputGroupInput({ className, ...props }) {
	return /* @__PURE__ */ jsx(Input$1, {
		"data-slot": "input-group-control",
		className: cn("flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent", className),
		...props
	});
}
//#endregion
//#region src/components/context-view/filter-row.tsx
function FilterRow({ filter, counts, narrowed, partial, loaded, onStateChange }) {
	const focusOnMount = useCallback((element) => element?.focus(), []);
	const toggleType = (type) => {
		const next = filter.types.has(type) ? [...filter.types].filter((held) => held !== type) : [...filter.types, type];
		onStateChange({ types: next.length > 0 ? next : void 0 });
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-2",
		"data-slot": "filter-row",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center gap-x-3 gap-y-2",
				children: [/* @__PURE__ */ jsxs(InputGroup, {
					className: "h-8 min-w-48 flex-1",
					children: [/* @__PURE__ */ jsx(InputGroupAddon, { children: /* @__PURE__ */ jsx(SearchIcon, {}) }), /* @__PURE__ */ jsx(InputGroupInput, {
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
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1 text-xs text-muted-foreground",
					title: "Only the events between these offsets, inclusive",
					children: [
						/* @__PURE__ */ jsx("span", { children: "from" }),
						/* @__PURE__ */ jsx(OffsetInput, {
							label: "From offset",
							value: filter.from,
							onChange: (from) => onStateChange({ from })
						}),
						/* @__PURE__ */ jsx("span", { children: "to" }),
						/* @__PURE__ */ jsx(OffsetInput, {
							label: "To offset",
							value: filter.to,
							onChange: (to) => onStateChange({ to })
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex max-h-32 flex-wrap gap-1 overflow-y-auto",
				children: [typeChips(counts, filter.types).map(([type, count]) => /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => toggleType(type),
					"aria-pressed": filter.types.has(type),
					title: type,
					className: cn("rounded px-1.5 py-0.5 font-mono text-xs hover:bg-muted", filter.types.has(type) ? "bg-muted text-foreground" : "text-muted-foreground"),
					children: [
						shortEventType(type),
						" ",
						/* @__PURE__ */ jsx("span", {
							className: "tabular-nums",
							children: count.toLocaleString()
						})
					]
				}, type)), narrowed ? /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => onStateChange(FILTER_CLEARED),
					className: "px-1.5 py-0.5 text-xs text-muted-foreground underline-offset-2 hover:underline",
					children: "clear"
				}) : null]
			}),
			partial ? /* @__PURE__ */ jsxs("p", {
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
	return /* @__PURE__ */ jsx("input", {
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
	const [now, setNow] = useState(() => Date.now());
	let count = 0;
	for (let at = events.length - 1; at >= 0; at--) {
		if (now - Date.parse(events[at].createdAt) > 6e4) break;
		count += 1;
	}
	useEffect(() => {
		if (count === 0) return;
		const timer = setInterval(() => setNow(Date.now()), 5e3);
		return () => clearInterval(timer);
	}, [count]);
	useEffect(() => setNow(Date.now()), [events]);
	if (count === 0) return null;
	return /* @__PURE__ */ jsx("span", {
		title: "Events in the last minute",
		children: ` · ${String(count)}/min`
	});
}
function PresenceStrip({ actors, rpcStubs, className, onPick }) {
	const shown = actors.slice(0, 5);
	return /* @__PURE__ */ jsxs("div", {
		className: cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground", className),
		children: [
			shown.map((who) => /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "truncate hover:text-foreground",
				title: `${who.actor}${who.grant ? ` via ${who.grant}` : ""} · last ${new Date(who.lastSeenAt).toLocaleString()}`,
				onClick: () => onPick?.(who.actor),
				children: who.email || who.actor
			}, who.actor)),
			actors.length > shown.length ? /* @__PURE__ */ jsxs("span", { children: ["+", actors.length - shown.length] }) : null,
			rpcStubs.length > 0 ? /* @__PURE__ */ jsxs("span", {
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
	if (!isRecord(value)) return /* @__PURE__ */ jsx(PrettyScalar, { value });
	const entries = Object.entries(value);
	if (entries.length === 0) return /* @__PURE__ */ jsx("span", {
		className: "text-xs text-muted-foreground",
		children: "empty"
	});
	return /* @__PURE__ */ jsx("dl", {
		className: "grid grid-cols-[minmax(0,max-content)_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-xs",
		children: entries.map(([key, field]) => /* @__PURE__ */ jsx(PrettyField, {
			label: key,
			value: field,
			depth
		}, key))
	});
}
function PrettyField({ label, value, depth }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("dt", {
		className: "truncate font-mono text-muted-foreground",
		title: label,
		children: label
	}), /* @__PURE__ */ jsx("dd", {
		className: "min-w-0",
		children: /* @__PURE__ */ jsx(PrettyFieldValue, {
			value,
			depth
		})
	})] });
}
function PrettyFieldValue({ value, depth }) {
	if (Array.isArray(value)) {
		if (value.length === 0) return /* @__PURE__ */ jsx("span", {
			className: "text-muted-foreground",
			children: "none"
		});
		if (value.length <= 8 && value.every((item) => !isRecord(item) && !Array.isArray(item))) return /* @__PURE__ */ jsx("span", {
			className: "font-mono break-all",
			children: value.map(scalarText).join(", ")
		});
		if (depth > 0 && compactJson(value, 200).length <= 100) return /* @__PURE__ */ jsx("span", {
			className: "font-mono break-all",
			children: compactJson(value, 100)
		});
		return /* @__PURE__ */ jsx(Folded, {
			summary: `${value.length.toLocaleString()} ${value.length === 1 ? "item" : "items"}`,
			children: /* @__PURE__ */ jsx(CompactLines, { items: value.map((item, index) => [`${index}`, item]) })
		});
	}
	if (isRecord(value)) {
		const size = Object.keys(value).length;
		if (size === 0) return /* @__PURE__ */ jsx("span", {
			className: "text-muted-foreground",
			children: "{}"
		});
		if (depth === 0) return /* @__PURE__ */ jsx(PrettyFields, {
			value,
			depth: 1
		});
		if (compactJson(value, 200).length <= 100) return /* @__PURE__ */ jsx("span", {
			className: "font-mono break-all",
			children: compactJson(value, 100)
		});
		return /* @__PURE__ */ jsx(Folded, {
			summary: `${size.toLocaleString()} ${size === 1 ? "field" : "fields"}`,
			children: /* @__PURE__ */ jsx(CompactLines, { items: Object.entries(value) })
		});
	}
	return /* @__PURE__ */ jsx(PrettyScalar, { value });
}
function PrettyScalar({ value }) {
	if (value == null) return /* @__PURE__ */ jsx("span", {
		className: "text-xs text-muted-foreground",
		children: "—"
	});
	const text = scalarText(value);
	return /* @__PURE__ */ jsx("span", {
		className: "font-mono text-xs break-all",
		title: text.length > 200 ? text : void 0,
		children: text.length > 200 ? `${text.slice(0, 199)}…` : text
	});
}
/** A list folded behind its count: opened in place, each entry one compact line. */
function Folded({ summary, children }) {
	return /* @__PURE__ */ jsxs("details", { children: [/* @__PURE__ */ jsx("summary", {
		className: "cursor-pointer text-muted-foreground hover:text-foreground",
		children: summary
	}), children] });
}
/** Up to 50 entries, each `key  {compact json}` on one line; the rest counted. */
function CompactLines({ items }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col py-0.5",
		children: [items.slice(0, 50).map(([key, item]) => /* @__PURE__ */ jsxs("p", {
			className: "truncate font-mono",
			title: compactJson(item, 2e3),
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "text-muted-foreground",
					children: key
				}),
				" ",
				compactJson(item, 240)
			]
		}, key)), items.length > 50 ? /* @__PURE__ */ jsxs("p", {
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
	if (!isRecord(state) || !("subscriptions" in state)) return /* @__PURE__ */ jsx(PrettyFields, { value: state });
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
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 text-xs",
		children: [
			paused ? /* @__PURE__ */ jsxs("p", {
				className: "text-amber-700",
				children: ["Paused", paused.reason ? `: ${paused.reason}` : ""]
			}) : null,
			/* @__PURE__ */ jsxs("dl", {
				className: "grid grid-cols-[minmax(0,max-content)_minmax(0,1fr)] gap-x-3 gap-y-0.5",
				children: [facts.filter(([, value]) => value != null).map(([label, value]) => /* @__PURE__ */ jsx(PrettyField, {
					label,
					value,
					depth: 1
				}, label)), /* @__PURE__ */ jsx(PrettyField, {
					label: "subscriptions",
					value: `${Object.keys(record(state.subscriptions)).length} (listed above)`,
					depth: 1
				})]
			}),
			rules.length > 0 ? /* @__PURE__ */ jsx(CoreTable, {
				title: "Rewrite rules",
				count: rules.length,
				children: rules.map(([match, rule]) => {
					const row = record(rule);
					return /* @__PURE__ */ jsxs("p", {
						className: "font-mono break-all",
						children: [
							match,
							" ",
							/* @__PURE__ */ jsx("span", {
								className: "text-muted-foreground",
								children: "→"
							}),
							" ",
							row.target === null ? "denied" : printExpression(row.target),
							typeof row.description === "string" ? /* @__PURE__ */ jsx("span", {
								className: "ml-2 font-sans text-muted-foreground",
								children: row.description
							}) : null
						]
					}, match);
				})
			}) : null,
			schedules.length > 0 ? /* @__PURE__ */ jsx(CoreTable, {
				title: "Schedules",
				count: schedules.length,
				children: /* @__PURE__ */ jsx(CompactLines, { items: schedules })
			}) : null,
			routes.length > 0 ? /* @__PURE__ */ jsx(CoreTable, {
				title: "Fetch routes",
				count: routes.length,
				children: /* @__PURE__ */ jsx(CompactLines, { items: routes })
			}) : null,
			runs.length > 0 ? /* @__PURE__ */ jsx(CoreTable, {
				title: "Open script runs",
				count: runs.length,
				children: runs.map(([offset, run]) => /* @__PURE__ */ jsxs("p", {
					className: "font-mono",
					children: [
						"#",
						offset,
						" ",
						/* @__PURE__ */ jsxs("span", {
							className: "text-muted-foreground",
							children: ["requested ", scalarText(record(run).requestedAt)]
						})
					]
				}, offset))
			}) : null,
			empty.length > 0 ? /* @__PURE__ */ jsxs("p", {
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
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-0.5",
		children: [/* @__PURE__ */ jsxs("p", {
			className: "text-muted-foreground",
			children: [
				title,
				" ",
				/* @__PURE__ */ jsx("span", {
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
	if (state.status === "error") return /* @__PURE__ */ jsxs("p", {
		"data-type": "error",
		className: "text-xs text-destructive",
		children: ["Live state unavailable: ", state.error]
	});
	if (state.value === void 0) return /* @__PURE__ */ jsxs("p", {
		className: "flex items-center gap-2 text-xs text-muted-foreground",
		children: [/* @__PURE__ */ jsx(Spinner, {}), " Connecting…"]
	});
	if (view === "raw") return /* @__PURE__ */ jsx(SerializedObjectCodeBlock, {
		data: state.value,
		showToggle: false,
		className: "max-h-[28rem]"
	});
	return core ? /* @__PURE__ */ jsx(CorePrettyState, { state: state.value }) : /* @__PURE__ */ jsx(PrettyFields, { value: state.value });
}
//#endregion
//#region src/components/context-view/processors-panel.tsx
function ProcessorsPanel({ open, onClose, processors, presence, liveState, events, head, onPickActor }) {
	const [view, setView] = useState("pretty");
	const now = useNow(open);
	const rpcStubs = useMemo(() => new Set(presence.rpcStubs), [presence.rpcStubs]);
	const subscribers = useMemo(() => [...processors].sort((a, b) => kindRank(kindOf(a)) - kindRank(kindOf(b)) || a.configuredAtOffset - b.configuredAtOffset), [processors]);
	const callbackStubs = new Set(subscribers.flatMap((row) => lentStubKey(row) ?? []));
	const otherStubs = presence.rpcStubs.filter((key) => !callbackStubs.has(key));
	const core = liveState.core || CONNECTING;
	const delivered = subscribers.filter((row) => kindOf(row) !== "callback");
	const liveCallbacks = subscribers.filter((row) => kindOf(row) === "callback" && rpcStubs.has(lentStubKey(row)));
	const orphanedCallbacks = subscribers.filter((row) => kindOf(row) === "callback" && !rpcStubs.has(lentStubKey(row)));
	return /* @__PURE__ */ jsx(Sheet, {
		open,
		onOpenChange: (next) => !next && onClose(),
		children: /* @__PURE__ */ jsxs(SheetContent, {
			side: "right",
			className: "overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-2xl",
			children: [/* @__PURE__ */ jsxs(SheetHeader, {
				className: "flex-row items-start gap-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ jsx(SheetTitle, { children: "Processors" }), /* @__PURE__ */ jsx(SheetDescription, { children: "Who is here, what subscribes to this context, and what each has folded." })]
				}), /* @__PURE__ */ jsx("div", {
					role: "tablist",
					"aria-label": "How state reads",
					className: "mr-8 flex shrink-0 rounded-md border p-0.5 text-xs",
					children: ["pretty", "raw"].map((candidate) => /* @__PURE__ */ jsx("button", {
						type: "button",
						role: "tab",
						"aria-selected": view === candidate,
						onClick: () => setView(candidate),
						className: cn("rounded px-2 py-0.5 capitalize", view === candidate ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"),
						children: candidate
					}, candidate))
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex min-w-0 flex-col gap-6 px-4 pb-8",
				children: [
					/* @__PURE__ */ jsx(Vitals, {
						events,
						head,
						core: core.value,
						now
					}),
					/* @__PURE__ */ jsxs(Section, {
						title: "Here",
						count: presence.actors.length,
						children: [
							presence.actors.length === 0 ? /* @__PURE__ */ jsx(Quiet, { children: "Nobody has acted on this context in the loaded log." }) : /* @__PURE__ */ jsx("ul", {
								className: "flex flex-col",
								children: presence.actors.map((who) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => onPickActor(who.actor),
									title: `Show only what ${who.email || who.actor} did`,
									className: "flex w-full min-w-0 items-baseline gap-3 rounded px-1 py-0.5 text-left text-xs hover:bg-muted",
									children: [
										/* @__PURE__ */ jsxs("span", {
											className: "min-w-0 flex-1 truncate",
											children: [who.email || who.actor, who.email ? /* @__PURE__ */ jsx("span", {
												className: "ml-2 font-mono text-muted-foreground",
												children: who.actor
											}) : null]
										}),
										who.grant ? /* @__PURE__ */ jsx("span", {
											className: "hidden truncate font-mono text-muted-foreground sm:inline",
											children: who.grant
										}) : null,
										/* @__PURE__ */ jsx("span", {
											className: "shrink-0 text-muted-foreground tabular-nums",
											title: who.lastSeenAt,
											children: ago(who.lastSeenAt, now)
										})
									]
								}) }, who.actor))
							}),
							/* @__PURE__ */ jsx("p", {
								className: "px-1 text-xs text-muted-foreground",
								children: presence.rpcStubs.length === 0 ? "No rpc stub is lent to this context right now." : `${presence.rpcStubs.length} rpc ${presence.rpcStubs.length === 1 ? "stub" : "stubs"} lent right now${otherStubs.length < presence.rpcStubs.length ? `, ${presence.rpcStubs.length - otherStubs.length} of them for the live callbacks below` : ""}.`
							}),
							otherStubs.length > 0 ? /* @__PURE__ */ jsx("ul", {
								className: "flex flex-col px-1",
								children: otherStubs.map((key) => /* @__PURE__ */ jsx("li", {
									className: "truncate font-mono text-xs",
									title: key,
									children: key
								}, key))
							}) : null
						]
					}),
					/* @__PURE__ */ jsxs(Section, {
						title: "Subscribers",
						count: subscribers.length,
						children: [subscribers.length === 0 ? /* @__PURE__ */ jsx(Quiet, { children: "Nothing subscribes to this context." }) : /* @__PURE__ */ jsx("div", {
							className: "flex flex-col divide-y",
							children: delivered.map((row) => /* @__PURE__ */ jsx(Subscriber, {
								row,
								head,
								state: row.hostedFacet ? liveState[row.hostedFacet.name] : void 0,
								view
							}, row.name))
						}), liveCallbacks.length > 0 ? /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-0.5",
							children: [
								/* @__PURE__ */ jsx("p", {
									className: "text-xs text-muted-foreground",
									children: "Live callbacks: a session's subscription, delivered to the stub it lent"
								}),
								liveCallbacks.map((row) => /* @__PURE__ */ jsx(LiveCallback, {
									row,
									connected: true
								}, row.name)),
								orphanedCallbacks.length > 0 ? /* @__PURE__ */ jsxs("details", {
									className: "text-xs",
									children: [/* @__PURE__ */ jsxs("summary", {
										className: "cursor-pointer text-muted-foreground hover:text-foreground",
										children: [orphanedCallbacks.length, " not connected: their session ended and the row stayed"]
									}), orphanedCallbacks.map((row) => /* @__PURE__ */ jsx(LiveCallback, {
										row,
										connected: false
									}, row.name))]
								}) : null
							]
						}) : null]
					}),
					/* @__PURE__ */ jsxs(Section, {
						title: "The context",
						aside: typeof core.rev === "number" ? /* @__PURE__ */ jsxs("span", {
							className: "tabular-nums",
							children: ["reduced through #", core.rev.toLocaleString()]
						}) : null,
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-xs text-muted-foreground",
							children: "The core reduce: rewrite rules, subscriptions, schedules, fetch routes, open runs, the pause."
						}), /* @__PURE__ */ jsx(LiveStateValue, {
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
	return /* @__PURE__ */ jsxs("section", {
		className: "flex min-w-0 flex-col gap-1.5 py-3 first:pt-1",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex min-w-0 flex-wrap items-baseline gap-x-2",
				children: [
					/* @__PURE__ */ jsx("h4", {
						className: "min-w-0 font-mono text-sm font-medium break-all",
						children: row.name
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-xs text-muted-foreground",
						children: KIND_LABEL[kind]
					}),
					/* @__PURE__ */ jsx("span", {
						className: cn("ml-auto text-xs", status.tone),
						children: status.label
					})
				]
			}),
			/* @__PURE__ */ jsxs("dl", {
				className: "grid grid-cols-[minmax(0,max-content)_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-xs",
				children: [
					/* @__PURE__ */ jsx(Fact, {
						label: "consumes",
						children: /* @__PURE__ */ jsx("span", {
							className: "font-mono break-all",
							children: consumesText(row.consumes)
						})
					}),
					/* @__PURE__ */ jsx(Fact, {
						label: "delivers to",
						children: /* @__PURE__ */ jsx("span", {
							className: "font-mono break-all",
							children: row.target
						})
					}),
					row.hostedFacet ? /* @__PURE__ */ jsxs(Fact, {
						label: "hosts",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "font-mono break-all",
							children: [row.hostedFacet.className, row.hostedFacet.name === row.name ? "" : ` as ${row.hostedFacet.name}`]
						}), /* @__PURE__ */ jsx("span", {
							className: cn("ml-2", row.hostedFacet.restarts > 0 ? "text-amber-700" : "text-muted-foreground"),
							title: "How often the platform failed the facet at its start and restarted it",
							children: row.hostedFacet.restarts > 0 ? `restarted ${row.hostedFacet.restarts}×` : "never restarted"
						})]
					}) : null,
					/* @__PURE__ */ jsx(Fact, {
						label: "since",
						children: /* @__PURE__ */ jsxs("span", {
							className: "tabular-nums",
							children: [
								"configured at #",
								row.configuredAtOffset.toLocaleString(),
								row.afterOffset !== void 0 && row.afterOffset !== row.configuredAtOffset ? `, delivering after #${row.afterOffset.toLocaleString()}` : ""
							]
						})
					}),
					row.cursor ? /* @__PURE__ */ jsx(Fact, {
						label: "confirmed",
						children: /* @__PURE__ */ jsxs("span", {
							className: "tabular-nums",
							children: [
								"#",
								row.cursor.confirmedOffset.toLocaleString(),
								lag === void 0 ? null : /* @__PURE__ */ jsxs("span", {
									className: cn("ml-2", lag > 0 ? "text-amber-700" : "text-muted-foreground"),
									children: ["lag ", lag.toLocaleString()]
								})
							]
						})
					}) : null,
					row.halted ? /* @__PURE__ */ jsx(Fact, {
						label: "halted",
						children: /* @__PURE__ */ jsxs("span", {
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
			state ? /* @__PURE__ */ jsxs("div", {
				className: "flex min-w-0 flex-col gap-1 pt-1",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-xs text-muted-foreground",
					children: "Live state"
				}), /* @__PURE__ */ jsx(LiveStateValue, {
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
	return /* @__PURE__ */ jsxs("p", {
		className: "flex min-w-0 items-baseline gap-3 text-xs",
		title: row.target,
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "shrink-0 font-mono",
				children: row.name
			}),
			/* @__PURE__ */ jsx("span", {
				className: "min-w-0 flex-1 truncate font-mono text-muted-foreground",
				children: consumesText(row.consumes)
			}),
			/* @__PURE__ */ jsxs("span", {
				className: "shrink-0 text-muted-foreground tabular-nums",
				children: ["#", row.configuredAtOffset.toLocaleString()]
			}),
			/* @__PURE__ */ jsx("span", {
				className: cn("shrink-0", connected ? "text-emerald-700" : "text-muted-foreground"),
				children: connected ? "connected" : "gone"
			})
		]
	});
}
/** The head, the rate, the age and the pause on one line; a sparkline of the last hour under it. */
function Vitals({ events, head, core, now }) {
	const perMinute = useMemo(() => appendsPerMinute(events, now), [events, now]);
	const lastFive = perMinute.slice(-5).reduce((sum, count) => sum + count, 0) / 5;
	const state = record(core);
	const paused = state.paused ? record(state.paused) : void 0;
	const peak = Math.max(...perMinute);
	return /* @__PURE__ */ jsxs("section", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap gap-x-6 gap-y-2",
				children: [
					/* @__PURE__ */ jsx(Stat, {
						label: "head",
						value: head === void 0 ? "—" : `#${head.toLocaleString()}`
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "appends / min",
						value: lastFive >= 10 ? String(Math.round(lastFive)) : lastFive.toFixed(1),
						title: "Mean over the last five minutes, from the loaded log"
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "age",
						value: typeof state.createdAt === "string" ? ago(state.createdAt, now, "") : "—",
						title: typeof state.createdAt === "string" ? `Created ${state.createdAt}` : void 0
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "incarnation",
						value: typeof state.incarnation === "number" ? String(state.incarnation) : "—",
						title: "The Durable Object's wake count: growth across idle is hibernation"
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "paused",
						value: paused ? "yes" : "no",
						title: typeof paused?.reason === "string" ? paused.reason : void 0,
						tone: paused ? "text-amber-700" : void 0
					})
				]
			}),
			/* @__PURE__ */ jsx(Sparkline, { counts: perMinute }),
			/* @__PURE__ */ jsxs("p", {
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
	return /* @__PURE__ */ jsxs("div", {
		title,
		children: [/* @__PURE__ */ jsx("div", {
			className: "text-[10px] tracking-wide text-muted-foreground uppercase",
			children: label
		}), /* @__PURE__ */ jsx("div", {
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
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: `0 0 ${width} ${height}`,
		preserveAspectRatio: "none",
		className: "h-9 w-full text-sky-600",
		"aria-hidden": true,
		children: [/* @__PURE__ */ jsx("polygon", {
			points: `0,${height} ${points} ${width},${height}`,
			className: "fill-sky-500/10"
		}), /* @__PURE__ */ jsx("polyline", {
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
	return /* @__PURE__ */ jsxs("section", {
		className: "flex min-w-0 flex-col gap-2",
		children: [/* @__PURE__ */ jsxs("h3", {
			className: "flex items-baseline gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase",
			children: [
				title,
				count === void 0 ? null : /* @__PURE__ */ jsx("span", {
					className: "tabular-nums",
					children: count
				}),
				aside ? /* @__PURE__ */ jsx("span", {
					className: "ml-auto text-xs font-normal tracking-normal normal-case",
					children: aside
				}) : null
			]
		}), children]
	});
}
function Fact({ label, children }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("dt", {
		className: "text-muted-foreground",
		children: label
	}), /* @__PURE__ */ jsx("dd", {
		className: "min-w-0",
		children
	})] });
}
function Quiet({ children }) {
	return /* @__PURE__ */ jsx("p", {
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
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
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
	const filter = useMemo(() => contextViewFilterOf(state), [state]);
	const filtering = Boolean(state.filter);
	const inspected = state.event;
	/** The folds opened in place, by item key. */
	const [opened, setOpened] = useState(() => /* @__PURE__ */ new Set());
	/** Bumped by each append from here: the feed goes back to its tail to show it land. */
	const [followTail, setFollowTail] = useState(0);
	const allRenderers = useMemo(() => ({
		...coreEventRenderers,
		...renderers
	}), [renderers]);
	const allInspectors = useMemo(() => ({
		...coreEventInspectors,
		...inspectors
	}), [inspectors]);
	const filteredRef = useRef(void 0);
	const shown = useMemo(() => (filteredRef.current = refilter(filteredRef.current, events, filter)).shown, [events, filter]);
	const factOf = useMemo(() => {
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
	const foldRef = useRef(void 0);
	const { items, namedBefore } = useMemo(() => foldRef.current = refold(foldRef.current, shown, mode, factOf, actorLabel), [
		shown,
		mode,
		factOf
	]);
	const countsRef = useRef(void 0);
	const types = useMemo(() => filtering ? sortedCounts((countsRef.current = recount(countsRef.current, events)).counts) : [], [events, filtering]);
	const filtered = narrows(filter);
	const toggleOpened = useCallback((key) => setOpened((held) => {
		const next = new Set(held);
		if (!next.delete(key)) next.add(key);
		return next;
	}), []);
	const onStateChangeRef = useRef(onStateChange);
	onStateChangeRef.current = onStateChange;
	const inspect = useCallback((offset) => onStateChangeRef.current({
		...RIGHT_EDGE_CLOSED,
		event: offset
	}), []);
	const loaded = events.length.toLocaleString();
	const count = filtered ? `${shown.length.toLocaleString()} of ${loaded} loaded events` : older.exhausted ? `${loaded} events` : `${loaded} loaded of ~${(head ?? 0).toLocaleString()} events`;
	const gutter = { "--offset-width": `${String(String(events.at(-1)?.offset ?? 0).length + 1)}ch` };
	return /* @__PURE__ */ jsxs("div", {
		className: cn("flex min-h-0 min-w-0 flex-col", className),
		style: gutter,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center gap-x-4 gap-y-1 px-3 sm:px-4 py-1.5",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex min-w-0 items-baseline gap-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "min-w-0 truncate text-sm",
							children: title
						}), /* @__PURE__ */ jsxs("span", {
							className: "shrink-0 text-xs text-muted-foreground tabular-nums",
							children: [
								count,
								caughtUp ? "" : " · loading",
								/* @__PURE__ */ jsx(EventRate, { events })
							]
						})]
					}),
					/* @__PURE__ */ jsx(PresenceStrip, {
						className: "hidden min-w-0 xl:flex",
						actors: presence.actors,
						rpcStubs: presence.rpcStubs,
						onPick: (actor) => onStateChange({ actor: filter.actor === actor ? void 0 : actor })
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "ml-auto flex items-center gap-3 text-xs",
						children: [
							/* @__PURE__ */ jsx("div", {
								role: "tablist",
								"aria-label": "How the log reads",
								className: "flex gap-0.5",
								children: MODES.map((candidate) => /* @__PURE__ */ jsx("button", {
									type: "button",
									role: "tab",
									"aria-selected": mode === candidate.id,
									onClick: () => onStateChange({ mode: candidate.id === "pretty" ? void 0 : candidate.id }),
									className: stripButton(mode === candidate.id),
									children: candidate.label
								}, candidate.id))
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => onStateChange({ filter: filtering ? void 0 : true }),
								"aria-expanded": filtering,
								className: stripButton(filtering || filtered),
								children: "Filter"
							}),
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => onStateChange({
									...RIGHT_EDGE_CLOSED,
									processors: true
								}),
								className: stripButton(false),
								children: ["Processors ", /* @__PURE__ */ jsx("span", {
									className: "text-foreground tabular-nums",
									children: processors.length
								})]
							})
						]
					})
				]
			}),
			filtering ? /* @__PURE__ */ jsx("div", {
				className: "px-3 sm:px-4 pb-2",
				children: /* @__PURE__ */ jsx(FilterRow, {
					filter,
					counts: types,
					narrowed: filtered,
					partial: !older.exhausted,
					loaded,
					onStateChange
				})
			}) : null,
			error ? /* @__PURE__ */ jsx("p", {
				"data-type": "error",
				className: "px-3 sm:px-4 text-sm text-destructive",
				children: error
			}) : null,
			/* @__PURE__ */ jsx(ContextPathLinksContext, {
				value: pathLinks,
				children: /* @__PURE__ */ jsx(FeedList, {
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
					empty: error ? null : caughtUp ? /* @__PURE__ */ jsx("p", {
						className: "px-3 sm:px-4 py-6 text-sm text-muted-foreground",
						children: filtered ? "No event matches the filter." : emptyText
					}) : /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 px-3 sm:px-4 py-6 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ jsx(Spinner, {}), " Loading the log…"]
					})
				})
			}),
			onAppend ? /* @__PURE__ */ jsx(AppendComposer, {
				onAppend,
				onAppended: () => setFollowTail((count) => count + 1),
				events,
				processors
			}) : null,
			/* @__PURE__ */ jsx(EventInspector, {
				events,
				offset: inspected,
				older,
				renderers: allRenderers,
				inspectors: allInspectors,
				onNavigate: inspect,
				onClose: () => onStateChange({ event: void 0 })
			}),
			/* @__PURE__ */ jsx(ProcessorsPanel, {
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
