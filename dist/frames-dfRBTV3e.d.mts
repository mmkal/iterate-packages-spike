import { z } from "zod";
//#region src/frames.d.ts
declare const EDIT_FRAME = "docs/edit-frame";
declare const AWARENESS_FRAME = "docs/awareness-frame";
declare const COMMIT_NOTICED = "docs/commit-noticed";
declare const DOC_LEFT = "docs/left";
declare const DOC_OPENED = "docs/opened";
/** `update`: the Yjs update, base64. `client`: the sender's Yjs client id ("processor" for the
 *  processor's own), so a sender can skip the echo of its own frames. */
declare const EditFrame: z.ZodObject<{
  update: z.ZodString;
  client: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"processor">]>;
}, z.core.$strip>;
declare const AwarenessFrame: z.ZodObject<{
  update: z.ZodString;
  client: z.ZodNumber;
}, z.core.$strip>;
/** `client`: the Yjs client id of the tab that closed the doc. */
declare const DocLeft: z.ZodObject<{
  client: z.ZodNumber;
}, z.core.$strip>;
/** A doc: its repo (`/repos/<name>`) and its path in the repo, `.md` included. */
type DocRef = {
  repo: string;
  path: string;
};
/** The context that co-edits `doc`. */
declare function docContextPath(doc: DocRef): string;
/** The doc a context co-edits. */
declare function docOf(contextPath: string): DocRef;
/** The processor's live state, what the page shows around the editor. `commitOid`: the commit the
 *  text was last saved as (or read at); `dirty`: edits since then are waiting to be saved;
 *  `savedBy`: whose edits the last save committed; `saveError`: why the last save failed, when it
 *  did (the text is kept, and the next edit saves again); `threads`: the doc's comments
 *  (comments.ts), in the order they were started. */
declare const DocLiveState: z.ZodObject<{
  commitOid: z.ZodNullable<z.ZodString>;
  dirty: z.ZodBoolean;
  savedBy: z.ZodArray<z.ZodString>;
  saveError: z.ZodNullable<z.ZodString>;
  threads: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    quote: z.ZodNullable<z.ZodObject<{
      exact: z.ZodString;
      prefix: z.ZodString;
      suffix: z.ZodString;
    }, z.core.$strip>>;
    detached: z.ZodBoolean;
    resolved: z.ZodNullable<z.ZodObject<{
      by: z.ZodString;
      at: z.ZodString;
    }, z.core.$strip>>;
    comments: z.ZodArray<z.ZodObject<{
      id: z.ZodString;
      author: z.ZodString;
      via: z.ZodDefault<z.ZodNullable<z.ZodString>>;
      body: z.ZodString;
      at: z.ZodString;
      edited: z.ZodBoolean;
    }, z.core.$strip>>;
  }, z.core.$strip>>;
}, z.core.$strip>;
type DocLiveState = z.infer<typeof DocLiveState>;
declare function toBase64(bytes: Uint8Array): string;
declare function fromBase64(base64: string): Uint8Array<ArrayBuffer>;
//#endregion
export { DOC_OPENED as a, DocRef as c, docContextPath as d, docOf as f, DOC_LEFT as i, EDIT_FRAME as l, toBase64 as m, AwarenessFrame as n, DocLeft as o, fromBase64 as p, COMMIT_NOTICED as r, DocLiveState as s, AWARENESS_FRAME as t, EditFrame as u };