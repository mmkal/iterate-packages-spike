import { CommentThread } from "./comments.mjs";
import { z } from "zod";
//#region src/frames.ts
const EDIT_FRAME = "docs/edit-frame";
const AWARENESS_FRAME = "docs/awareness-frame";
const COMMIT_NOTICED = "docs/commit-noticed";
const DOC_LEFT = "docs/left";
const DOC_OPENED = "docs/opened";
/** `update`: the Yjs update, base64. `client`: the sender's Yjs client id ("processor" for the
*  processor's own), so a sender can skip the echo of its own frames. */
const EditFrame = z.object({
	update: z.string(),
	client: z.union([z.number(), z.literal("processor")])
});
const AwarenessFrame = z.object({
	update: z.string(),
	client: z.number()
});
/** `client`: the Yjs client id of the tab that closed the doc. */
const DocLeft = z.object({ client: z.number() });
/** The context that co-edits `doc`. */
function docContextPath(doc) {
	const name = /^\/repos\/([^/]+)$/.exec(doc.repo)?.[1];
	if (!name) throw new Error(`not a repo Docs edits: ${doc.repo} (a repo is /repos/<name>)`);
	return `/docs/${name}/${doc.path}`;
}
/** The doc a context co-edits. */
function docOf(contextPath) {
	const [, name, path] = /^\/docs\/([^/]+)\/(.+)$/.exec(contextPath) || [];
	if (!name || !path) throw new Error(`not a doc's context: ${contextPath}`);
	return {
		repo: `/repos/${name}`,
		path
	};
}
/** The processor's live state, what the page shows around the editor. `commitOid`: the commit the
*  text was last saved as (or read at); `dirty`: edits since then are waiting to be saved;
*  `savedBy`: whose edits the last save committed; `saveError`: why the last save failed, when it
*  did (the text is kept, and the next edit saves again); `threads`: the doc's comments
*  (comments.ts), in the order they were started. */
const DocLiveState = z.object({
	commitOid: z.string().nullable(),
	dirty: z.boolean(),
	savedBy: z.array(z.string()),
	saveError: z.string().nullable(),
	threads: z.array(CommentThread)
});
function toBase64(bytes) {
	let binary = "";
	for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
	return btoa(binary);
}
function fromBase64(base64) {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}
//#endregion
export { AWARENESS_FRAME, AwarenessFrame, COMMIT_NOTICED, DOC_LEFT, DOC_OPENED, DocLeft, DocLiveState, EDIT_FRAME, EditFrame, docContextPath, docOf, fromBase64, toBase64 };
