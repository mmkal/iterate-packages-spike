import { StreamEvent } from "iterate/stream/processor";
import { z } from "zod";
//#region src/comments.d.ts
export declare const COMMENT_ADDED = "docs/comment-added";
export declare const COMMENT_REPLIED = "docs/comment-replied";
export declare const COMMENT_EDITED = "docs/comment-edited";
export declare const COMMENT_DELETED = "docs/comment-deleted";
export declare const COMMENT_RESOLVED = "docs/comment-resolved";
export declare const COMMENT_REOPENED = "docs/comment-reopened";
export declare const COMMENT_REANCHORED = "docs/comment-reanchored";
/** Every comment event, as a doc's processor consumes them. */
export declare const commentEvents: string[];
export declare const Quote: z.ZodObject<{
  exact: z.ZodString;
  prefix: z.ZodString;
  suffix: z.ZodString;
}, z.core.$strip>;
export declare const CommentAdded: z.ZodObject<{
  thread: z.ZodString;
  quote: z.ZodNullable<z.ZodObject<{
    exact: z.ZodString;
    prefix: z.ZodString;
    suffix: z.ZodString;
  }, z.core.$strip>>;
  body: z.ZodString;
  via: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const CommentReplied: z.ZodObject<{
  thread: z.ZodString;
  comment: z.ZodString;
  body: z.ZodString;
  via: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const CommentEdited: z.ZodObject<{
  thread: z.ZodString;
  comment: z.ZodString;
  body: z.ZodString;
}, z.core.$strip>;
export declare const CommentDeleted: z.ZodObject<{
  thread: z.ZodString;
  comment: z.ZodString;
}, z.core.$strip>;
export declare const ThreadRef: z.ZodObject<{
  thread: z.ZodString;
}, z.core.$strip>;
export declare const CommentReanchored: z.ZodObject<{
  thread: z.ZodString;
  quote: z.ZodNullable<z.ZodObject<{
    exact: z.ZodString;
    prefix: z.ZodString;
    suffix: z.ZodString;
  }, z.core.$strip>>;
}, z.core.$strip>;
export declare const Comment: z.ZodObject<{
  id: z.ZodString;
  author: z.ZodString;
  via: z.ZodDefault<z.ZodNullable<z.ZodString>>;
  body: z.ZodString;
  at: z.ZodString;
  edited: z.ZodBoolean;
}, z.core.$strip>;
export type Comment = z.infer<typeof Comment>;
export declare const CommentThread: z.ZodObject<{
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
}, z.core.$strip>;
export type CommentThread = z.infer<typeof CommentThread>;
/** Who wrote an event: the person, or the person a script ran for (an agent over MCP, as them),
 *  else the context it was written from (an agent's own). */
export declare function authorOf(event: Pick<StreamEvent, "source">): string;
/** The threads after `event`; the same array when it changes nothing (not a comment event, a
 *  payload that doesn't parse, an edit by someone else). */
export declare function reduceComments(threads: CommentThread[], event: StreamEvent): CommentThread[];
//#endregion