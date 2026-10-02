import { findQuote, quoteAt } from "./anchor.mjs";
import { COMMENT_REANCHORED, CommentThread, commentEvents, reduceComments } from "./comments.mjs";
import { COMMIT_NOTICED, DOC_LEFT, DOC_OPENED, DocLeft, EDIT_FRAME, EditFrame, docContextPath, docOf, fromBase64, toBase64 } from "./frames.mjs";
import { StreamProcessorDurableObject } from "iterate/sdk";
import * as Y from "yjs";
import { StreamProcessor, defineProcessorContract } from "iterate/stream/processor";
import { z } from "zod";
import { diffChars } from "diff";
//#region src/contract.ts
const DocContract = defineProcessorContract({
	slug: "doc",
	version: "2",
	description: "Holds an open doc's text as Yjs, applies its editors' edits, autosaves it to its repo, and reduces its comments.",
	stateSchema: z.object({ threads: z.array(CommentThread).default([]) }),
	consumes: [
		EDIT_FRAME,
		COMMIT_NOTICED,
		DOC_LEFT,
		...commentEvents
	],
	emits: [EDIT_FRAME, COMMENT_REANCHORED]
});
const DocsContract = defineProcessorContract({
	slug: "docs",
	version: "1",
	description: "Tells each opened doc's processor when a commit to its repo changed its doc.",
	stateSchema: z.object({ opened: z.array(z.string()).default([]) }),
	consumes: ["events.iterate.com/repo/commit-completed", DOC_OPENED],
	emits: [COMMIT_NOTICED]
});
//#endregion
//#region ../../node_modules/.pnpm/node-diff3@3.2.1/node_modules/node-diff3/dist/diff3.mjs
function LCS(buffer1, buffer2) {
	let equivalenceClasses = Object.create(null);
	for (let j = 0; j < buffer2.length; j++) {
		const item = buffer2[j];
		if (equivalenceClasses[item]) equivalenceClasses[item].push(j);
		else equivalenceClasses[item] = [j];
	}
	let candidates = [{
		buffer1index: -1,
		buffer2index: -1,
		chain: null
	}];
	for (let i = 0; i < buffer1.length; i++) {
		const buffer2indices = equivalenceClasses[buffer1[i]] || [];
		let r = 0;
		let c = candidates[0];
		for (const j of buffer2indices) {
			let s;
			for (s = r; s < candidates.length; s++) if (candidates[s].buffer2index < j && (s === candidates.length - 1 || candidates[s + 1].buffer2index > j)) break;
			if (s < candidates.length) {
				const newCandidate = {
					buffer1index: i,
					buffer2index: j,
					chain: candidates[s]
				};
				if (r === candidates.length) candidates.push(c);
				else candidates[r] = c;
				r = s + 1;
				c = newCandidate;
				if (r === candidates.length) break;
			}
		}
		candidates[r] = c;
	}
	return candidates[candidates.length - 1];
}
function diffIndices(buffer1, buffer2) {
	const lcs = LCS(buffer1, buffer2);
	let result = [];
	let tail1 = buffer1.length;
	let tail2 = buffer2.length;
	for (let candidate = lcs; candidate !== null; candidate = candidate.chain) {
		const mismatchLength1 = tail1 - candidate.buffer1index - 1;
		const mismatchLength2 = tail2 - candidate.buffer2index - 1;
		tail1 = candidate.buffer1index;
		tail2 = candidate.buffer2index;
		if (mismatchLength1 || mismatchLength2) result.push({
			buffer1: [tail1 + 1, mismatchLength1],
			buffer1Content: buffer1.slice(tail1 + 1, tail1 + 1 + mismatchLength1),
			buffer2: [tail2 + 1, mismatchLength2],
			buffer2Content: buffer2.slice(tail2 + 1, tail2 + 1 + mismatchLength2)
		});
	}
	result.reverse();
	return result;
}
function diff3MergeRegions(a, o, b) {
	let hunks = [];
	function addHunk(h, ab) {
		hunks.push({
			ab,
			oStart: h.buffer1[0],
			oLength: h.buffer1[1],
			abStart: h.buffer2[0],
			abLength: h.buffer2[1]
		});
	}
	diffIndices(o, a).forEach((item) => addHunk(item, "a"));
	diffIndices(o, b).forEach((item) => addHunk(item, "b"));
	hunks.sort((x, y) => x.oStart - y.oStart);
	let results = [];
	let currOffset = 0;
	function advanceTo(endOffset) {
		if (endOffset > currOffset) {
			results.push({
				stable: true,
				buffer: "o",
				bufferStart: currOffset,
				bufferLength: endOffset - currOffset,
				bufferContent: o.slice(currOffset, endOffset)
			});
			currOffset = endOffset;
		}
	}
	while (hunks.length) {
		let hunk = hunks.shift();
		let regionStart = hunk.oStart;
		let regionEnd = hunk.oStart + hunk.oLength;
		let regionHunks = [hunk];
		advanceTo(regionStart);
		while (hunks.length) {
			const nextHunk = hunks[0];
			const nextHunkStart = nextHunk.oStart;
			if (nextHunkStart > regionEnd) break;
			regionEnd = Math.max(regionEnd, nextHunkStart + nextHunk.oLength);
			regionHunks.push(hunks.shift());
		}
		if (regionHunks.length === 1) {
			if (hunk.abLength > 0) {
				const buffer = hunk.ab === "a" ? a : b;
				results.push({
					stable: true,
					buffer: hunk.ab,
					bufferStart: hunk.abStart,
					bufferLength: hunk.abLength,
					bufferContent: buffer.slice(hunk.abStart, hunk.abStart + hunk.abLength)
				});
			}
		} else {
			let bounds = {
				a: [
					a.length,
					-1,
					o.length,
					-1
				],
				b: [
					b.length,
					-1,
					o.length,
					-1
				]
			};
			while (regionHunks.length) {
				hunk = regionHunks.shift();
				const oStart = hunk.oStart;
				const oEnd = oStart + hunk.oLength;
				const abStart = hunk.abStart;
				const abEnd = abStart + hunk.abLength;
				let b2 = bounds[hunk.ab];
				b2[0] = Math.min(abStart, b2[0]);
				b2[1] = Math.max(abEnd, b2[1]);
				b2[2] = Math.min(oStart, b2[2]);
				b2[3] = Math.max(oEnd, b2[3]);
			}
			const aStart = bounds.a[0] + (regionStart - bounds.a[2]);
			const aEnd = bounds.a[1] + (regionEnd - bounds.a[3]);
			const bStart = bounds.b[0] + (regionStart - bounds.b[2]);
			const bEnd = bounds.b[1] + (regionEnd - bounds.b[3]);
			let result = {
				stable: false,
				aStart,
				aLength: aEnd - aStart,
				aContent: a.slice(aStart, aEnd),
				oStart: regionStart,
				oLength: regionEnd - regionStart,
				oContent: o.slice(regionStart, regionEnd),
				bStart,
				bLength: bEnd - bStart,
				bContent: b.slice(bStart, bEnd)
			};
			results.push(result);
		}
		currOffset = regionEnd;
	}
	advanceTo(o.length);
	return results;
}
function diff3Merge(a, o, b, options) {
	options = Object.assign({
		excludeFalseConflicts: true,
		stringSeparator: /\s+/
	}, options);
	if (typeof a === "string") a = a.split(options.stringSeparator);
	if (typeof o === "string") o = o.split(options.stringSeparator);
	if (typeof b === "string") b = b.split(options.stringSeparator);
	let results = [];
	const regions = diff3MergeRegions(a, o, b);
	let okBuffer = [];
	function flushOk() {
		if (okBuffer.length) results.push({ ok: okBuffer });
		okBuffer = [];
	}
	function isFalseConflict(a2, b2) {
		if (a2.length !== b2.length) return false;
		for (let i = 0; i < a2.length; i++) if (a2[i] !== b2[i]) return false;
		return true;
	}
	regions.forEach((region) => {
		if (region.stable) okBuffer.push(...region.bufferContent);
		else if (options.excludeFalseConflicts && isFalseConflict(region.aContent, region.bContent)) okBuffer.push(...region.aContent);
		else {
			flushOk();
			results.push({ conflict: {
				a: region.aContent,
				aIndex: region.aStart,
				o: region.oContent,
				oIndex: region.oStart,
				b: region.bContent,
				bIndex: region.bStart
			} });
		}
	});
	flushOk();
	return results;
}
//#endregion
//#region src/merge.ts
/** ours + theirs over base, line by line. Where both changed the same lines, ours stays: a doc
*  never shows conflict markers. `conflicts` says how many places that happened. */
function mergeText(ours, base, theirs) {
	const regions = diff3Merge(ours.split("\n"), base.split("\n"), theirs.split("\n"), { excludeFalseConflicts: true });
	return {
		text: regions.flatMap((region) => region.ok || region.conflict.a).join("\n"),
		conflicts: regions.filter((region) => region.conflict).length
	};
}
/** The edits that turn `from` into `to`, in order, each position in the text as the edits before
*  it left it: what a `Y.Text` applies one by one. */
function textEdits(from, to) {
	const edits = [];
	let at = 0;
	for (const part of diffChars(from, to)) if (part.added) {
		edits.push({
			at,
			insert: part.value
		});
		at += part.value.length;
	} else if (part.removed) edits.push({
		at,
		delete: part.value.length
	});
	else at += part.value.length;
	return edits;
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
//#region src/processor.ts
var DocProcessor = class extends StreamProcessor {
	contract = DocContract;
	#deps;
	#doc = null;
	/** The doc's repo and path, from the context's own path as the doc loads. */
	#ref = {
		repo: "",
		path: ""
	};
	/** The tabs with the doc open, by Yjs client id; when the last one leaves, the doc saves. */
	#present = /* @__PURE__ */ new Set();
	#loading = null;
	/** The commit the text last matched, and its copy of the doc. */
	#base = {
		oid: "",
		text: ""
	};
	/** Who has edited since the last save, by email, in the order they started. */
	#editors = /* @__PURE__ */ new Set();
	#savedBy = [];
	#saveError = null;
	/** The threads as last reduced, for re-anchoring after a save. */
	#threads = [];
	#firstEditAt = 0;
	#lastEditAt = 0;
	#saveScheduled = false;
	/** Saves and catch-ups run one at a time: each reads `base` before an await and writes it after. */
	#serial = Promise.resolve();
	constructor(deps) {
		super();
		this.#deps = deps;
		deps.sql.exec("CREATE TABLE IF NOT EXISTS doc_updates (seq INTEGER PRIMARY KEY AUTOINCREMENT, data BLOB NOT NULL)");
		deps.sql.exec("CREATE TABLE IF NOT EXISTS doc_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
	}
	reduce({ event, state }) {
		const threads = reduceComments(state.threads, event);
		if (threads !== state.threads) return {
			...state,
			threads
		};
	}
	projectLiveState(state) {
		return {
			commitOid: this.#base.oid || null,
			dirty: this.#dirty(),
			savedBy: this.#savedBy,
			saveError: this.#saveError,
			threads: state.threads
		};
	}
	processEvent({ event, state, delivery, blockProcessorWhile, runInBackground }) {
		this.#threads = state.threads;
		if (delivery.caughtUp) blockProcessorWhile(async () => {
			await this.#load();
			if (this.#dirty() && !this.#saveScheduled) this.#scheduleSave(runInBackground);
		});
		if (!event) return;
		if (event.type === "docs/commit-noticed") {
			blockProcessorWhile(async () => {
				await this.#load();
				await this.#exclusive(() => this.#catchUp());
			});
			return;
		}
		if (event.type === "docs/left") {
			const left = DocLeft.safeParse(event.payload);
			if (!left.success) return;
			this.#present.delete(left.data.client);
			if (this.#present.size === 0) runInBackground(async () => {
				await this.#load();
				await this.#exclusive(() => this.#save());
			});
			return;
		}
		if (event.type !== "docs/edit-frame") return;
		const frame = EditFrame.safeParse(event.payload);
		if (!frame.success || frame.data.client === "processor") return;
		this.#present.add(frame.data.client);
		const editor = event.source.principal?.email;
		blockProcessorWhile(async () => {
			const doc = await this.#load();
			Y.applyUpdate(doc, fromBase64(frame.data.update), "browser");
			if (!this.#dirty()) return;
			if (editor && !this.#editors.has(editor)) {
				this.#editors.add(editor);
				this.#writeMeta();
			}
			this.#scheduleSave(runInBackground);
		});
	}
	/** A browser joining, or syncing again: `client` (its Yjs client id) is here until it sends
	*  `docs/left`. Answers the processor's state past `stateVector` (base64), after taking in any
	*  commit made since the last sync, and its own state vector, for the browser to send back what
	*  the processor lacks. */
	async sync(stateVector, client) {
		this.#present.add(client);
		const doc = await this.#load();
		await this.#exclusive(() => this.#catchUp());
		return {
			update: toBase64(Y.encodeStateAsUpdate(doc, fromBase64(stateVector))),
			stateVector: toBase64(Y.encodeStateVector(doc)),
			commitOid: this.#base.oid
		};
	}
	#text() {
		return this.#doc ? this.#doc.getText("file").toString() : this.#base.text;
	}
	#dirty() {
		return this.#text() !== this.#base.text;
	}
	#load() {
		this.#loading ||= this.#loadOnce();
		return this.#loading;
	}
	async #loadOnce() {
		const { sql } = this.#deps;
		try {
			var _usingCtx$2 = _usingCtx();
			const itx = _usingCtx$2.u(this.#deps.getItx());
			this.#ref = docOf((await itx.whoami()).path);
		} catch (_) {
			_usingCtx$2.e = _;
		} finally {
			_usingCtx$2.d();
		}
		const doc = new Y.Doc();
		const updates = sql.exec("SELECT data FROM doc_updates ORDER BY seq").toArray();
		for (const row of updates) Y.applyUpdate(doc, new Uint8Array(row.data));
		doc.on("update", (update) => {
			sql.exec("INSERT INTO doc_updates (data) VALUES (?)", update);
		});
		const meta = Object.fromEntries(sql.exec("SELECT key, value FROM doc_meta").toArray().map((row) => [row.key, row.value]));
		if (updates.length > 0) {
			this.#base = {
				oid: meta.baseOid || "",
				text: meta.baseText || ""
			};
			this.#editors = new Set(JSON.parse(meta.editors || "[]"));
			this.#savedBy = JSON.parse(meta.savedBy || "[]");
		} else try {
			var _usingCtx3 = _usingCtx();
			const repo = _usingCtx3.u(this.#deps.getItx()).cd("/").repos.get(this.#ref.repo);
			const tip = await repo.tip();
			const text = tip ? await repo.readFile(this.#ref.path, { commitOid: tip }) : null;
			this.#base = {
				oid: tip || "",
				text: text || ""
			};
			doc.getText("file").insert(0, this.#base.text);
			this.#writeMeta();
		} catch (_) {
			_usingCtx3.e = _;
		} finally {
			_usingCtx3.d();
		}
		this.#doc = doc;
		return doc;
	}
	#writeMeta() {
		const entries = {
			baseOid: this.#base.oid,
			baseText: this.#base.text,
			editors: JSON.stringify([...this.#editors]),
			savedBy: JSON.stringify(this.#savedBy)
		};
		for (const [key, value] of Object.entries(entries)) this.#deps.sql.exec("INSERT INTO doc_meta (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value", key, value);
	}
	#exclusive(work) {
		const run = this.#serial.then(work);
		this.#serial = run.catch(() => {});
		return run;
	}
	#scheduleSave(runInBackground) {
		const now = Date.now();
		this.#lastEditAt = now;
		this.#firstEditAt ||= now;
		if (this.#saveScheduled) return;
		this.#saveScheduled = true;
		this.#deps.publishLiveState();
		runInBackground(async () => {
			const { idleMs, maxMs } = this.#deps.autosave;
			try {
				for (let wait = idleMs; wait > 0; wait = Math.min(this.#lastEditAt + idleMs, this.#firstEditAt + maxMs) - Date.now()) await new Promise((resolve) => setTimeout(resolve, wait));
			} finally {
				this.#saveScheduled = false;
				this.#firstEditAt = 0;
			}
			await this.#exclusive(() => this.#save());
		});
	}
	/** Commit the text with `base` as its parent; refused because someone else committed, take
	*  their commit in and commit the merge on top of it. */
	async #save() {
		const text = this.#text();
		if (text === this.#base.text) return;
		const editors = [...this.#editors];
		const { repo, path } = this.#ref;
		try {
			try {
				var _usingCtx4 = _usingCtx();
				const result = await _usingCtx4.u(this.#deps.getItx()).cd("/").repos.get(repo).commitFiles({
					message: [
						`docs: edit ${path}`,
						...editors.length > 1 ? [""] : [],
						...editors.slice(1).map((editor) => `Co-authored-by: ${editor} <${editor}>`)
					].join("\n"),
					changes: [{
						path,
						content: text
					}],
					parent: this.#base.oid || null,
					author: editors[0] ? {
						name: editors[0],
						email: editors[0]
					} : void 0
				});
				this.#base = {
					oid: result.commitOid || this.#base.oid,
					text
				};
				this.#savedBy = editors;
				this.#saveError = null;
				for (const editor of editors) this.#editors.delete(editor);
				this.#compact();
			} catch (_) {
				_usingCtx4.e = _;
			} finally {
				_usingCtx4.d();
			}
		} catch (error) {
			if (!await this.#catchUp()) {
				this.#saveError = error instanceof Error ? error.message : String(error);
				throw error;
			}
			return this.#save();
		} finally {
			this.#writeMeta();
			this.#deps.publishLiveState();
		}
		await this.#reanchor(text);
	}
	/** Take in the repo's tip when it moved past `base`: ours (the live text) and theirs (the tip's
	*  copy) merged over base, applied as small edits and sent to the open browsers. False when the
	*  tip is `base`. */
	async #catchUp() {
		const { path } = this.#ref;
		let tip;
		let theirs = null;
		try {
			var _usingCtx5 = _usingCtx();
			const repo = _usingCtx5.u(this.#deps.getItx()).cd("/").repos.get(this.#ref.repo);
			tip = await repo.tip();
			if (tip && tip !== this.#base.oid) theirs = await repo.readFile(path, { commitOid: tip });
		} catch (_) {
			_usingCtx5.e = _;
		} finally {
			_usingCtx5.d();
		}
		if (!tip || tip === this.#base.oid) return false;
		const ours = this.#text();
		const unsaved = ours !== this.#base.text;
		const deleted = theirs === null;
		const theirsText = deleted ? ours : theirs || "";
		const merged = unsaved ? mergeText(ours, this.#base.text, theirsText).text : theirsText;
		const update = this.#replaceText(ours, merged);
		this.#base = {
			oid: tip,
			text: deleted && unsaved ? "" : theirsText
		};
		this.#writeMeta();
		if (update) try {
			var _usingCtx6 = _usingCtx();
			await _usingCtx6.u(this.#deps.getItx()).append({
				type: EDIT_FRAME,
				ephemeral: true,
				payload: {
					update: toBase64(update),
					client: "processor"
				}
			});
		} catch (_) {
			_usingCtx6.e = _;
		} finally {
			_usingCtx6.d();
		}
		this.#deps.publishLiveState();
		await this.#reanchor(merged);
		return true;
	}
	/** Each thread's quote found in `text`: refreshed where only its surroundings matched, detached
	*  where nothing did, attached again where a detached one matches. An exact match changes nothing. */
	async #reanchor(text) {
		try {
			var _usingCtx7 = _usingCtx();
			const events = this.#threads.flatMap((thread) => {
				if (!thread.quote) return [];
				const found = findQuote(text, thread.quote);
				if (found?.exact && !thread.detached) return [];
				if (!found && thread.detached) return [];
				const quote = found && quoteAt(text, found.from, found.to);
				return [{
					type: COMMENT_REANCHORED,
					payload: {
						thread: thread.id,
						quote
					}
				}];
			});
			if (events.length === 0) return;
			await _usingCtx7.u(this.#deps.getItx()).append(...events);
		} catch (_) {
			_usingCtx7.e = _;
		} finally {
			_usingCtx7.d();
		}
	}
	/** Turn the live text from `from` into `to` in one transaction; the update it made, if any. */
	#replaceText(from, to) {
		const doc = this.#doc;
		const text = doc.getText("file");
		const edits = textEdits(from, to);
		if (edits.length === 0) return null;
		let made = null;
		const keep = (update) => {
			made = update;
		};
		doc.on("update", keep);
		doc.transact(() => {
			for (const edit of edits) if ("insert" in edit) text.insert(edit.at, edit.insert);
			else text.delete(edit.at, edit.delete);
		}, "processor");
		doc.off("update", keep);
		return made;
	}
	/** After a save: the updates table as one update, the whole doc. */
	#compact() {
		const state = Y.encodeStateAsUpdate(this.#doc);
		this.#deps.sql.exec("DELETE FROM doc_updates");
		this.#deps.sql.exec("INSERT INTO doc_updates (data) VALUES (?)", state);
	}
};
//#endregion
//#region src/root.ts
const DocOpened = z.object({
	repo: z.string(),
	path: z.string()
});
const CommitCompleted = z.object({
	path: z.string(),
	commitOid: z.string(),
	changedPaths: z.array(z.string())
});
var DocsProcessor = class extends StreamProcessor {
	contract = DocsContract;
	#getItx;
	constructor(getItx) {
		super();
		this.#getItx = getItx;
	}
	reduce({ event, state }) {
		if (event.type !== "docs/opened") return;
		const opened = DocOpened.safeParse(event.payload);
		if (!opened.success) return;
		const context = docContextPath(opened.data);
		if (!state.opened.includes(context)) return { opened: [...state.opened, context] };
	}
	processEvent({ event, state, blockProcessorWhile }) {
		if (event?.type !== "events.iterate.com/repo/commit-completed") return;
		const commit = CommitCompleted.safeParse(event.payload);
		if (!commit.success || !/^\/repos\/[^/]+$/.test(commit.data.path)) return;
		const repo = commit.data.path;
		const changed = commit.data.changedPaths.map((path) => docContextPath({
			repo,
			path
		})).filter((context) => state.opened.includes(context));
		if (changed.length === 0) return;
		blockProcessorWhile(async () => {
			try {
				var _usingCtx$1 = _usingCtx();
				const itx = _usingCtx$1.u(this.#getItx());
				await Promise.all(changed.map((context) => itx.cd(context).append({
					type: COMMIT_NOTICED,
					ephemeral: true,
					payload: { commitOid: commit.data.commitOid }
				})));
			} catch (_) {
				_usingCtx$1.e = _;
			} finally {
				_usingCtx$1.d();
			}
		});
	}
};
//#endregion
//#region src/durable-object.ts
var DocDurableObject = class extends StreamProcessorDurableObject {
	static publicMethods = [...super.publicMethods, "sync"];
	processor = new DocProcessor({
		sql: this.ctx.storage.sql,
		getItx: () => this.getItx(),
		publishLiveState: () => this.publishLiveState(),
		autosave: {
			idleMs: 6e4,
			maxMs: 6e4
		}
	});
	sync(stateVector, client) {
		return this.processor.sync(stateVector, client);
	}
};
var DocsDurableObject = class extends StreamProcessorDurableObject {
	processor = new DocsProcessor(() => this.getItx());
};
//#endregion
export { DocDurableObject, DocsDurableObject };
