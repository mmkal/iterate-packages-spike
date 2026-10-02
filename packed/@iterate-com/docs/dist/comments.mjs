import { z } from "zod";
//#region src/comments.ts
const COMMENT_ADDED = "docs/comment-added";
const COMMENT_REPLIED = "docs/comment-replied";
const COMMENT_EDITED = "docs/comment-edited";
const COMMENT_DELETED = "docs/comment-deleted";
const COMMENT_RESOLVED = "docs/comment-resolved";
const COMMENT_REOPENED = "docs/comment-reopened";
const COMMENT_REANCHORED = "docs/comment-reanchored";
/** Every comment event, as a doc's processor consumes them. */
const commentEvents = [
	COMMENT_ADDED,
	COMMENT_REPLIED,
	COMMENT_EDITED,
	COMMENT_DELETED,
	COMMENT_RESOLVED,
	COMMENT_REOPENED,
	COMMENT_REANCHORED
];
const Quote = z.object({
	exact: z.string().min(1),
	prefix: z.string(),
	suffix: z.string()
});
/** The agent that wrote a comment on its person's behalf, as it names itself ("Claude Code"). */
const Via = z.string().trim().min(1).max(40).optional();
const CommentAdded = z.object({
	thread: z.string().min(1),
	quote: Quote.nullable(),
	body: z.string().min(1),
	via: Via
});
const CommentReplied = z.object({
	thread: z.string(),
	comment: z.string().min(1),
	body: z.string().min(1),
	via: Via
});
const CommentEdited = z.object({
	thread: z.string(),
	comment: z.string(),
	body: z.string().min(1)
});
const CommentDeleted = z.object({
	thread: z.string(),
	comment: z.string()
});
const ThreadRef = z.object({ thread: z.string() });
const CommentReanchored = z.object({
	thread: z.string(),
	quote: Quote.nullable()
});
const Comment = z.object({
	/** the thread's id for its first comment */
	id: z.string(),
	author: z.string(),
	/** the agent that wrote it for its author, when one did; absent in a build before it, whose
	*  live state a newer page still reads */
	via: z.string().nullable().default(null),
	body: z.string(),
	at: z.string(),
	edited: z.boolean()
});
const CommentThread = z.object({
	id: z.string(),
	/** what it's about; null for the whole doc */
	quote: Quote.nullable(),
	/** its quote matches nothing in the text as last saved */
	detached: z.boolean(),
	resolved: z.object({
		by: z.string(),
		at: z.string()
	}).nullable(),
	comments: z.array(Comment)
});
/** Who wrote an event: the person, or the person a script ran for (an agent over MCP, as them),
*  else the context it was written from (an agent's own). */
function authorOf(event) {
	const person = event.source.principal || event.source.onBehalfOf?.principal;
	return person?.email || person?.actor || event.source.origin;
}
/** The threads after `event`; the same array when it changes nothing (not a comment event, a
*  payload that doesn't parse, an edit by someone else). */
function reduceComments(threads, event) {
	const author = authorOf(event);
	const update = (id, change) => {
		const index = threads.findIndex((thread) => thread.id === id);
		if (index < 0) return threads;
		const next = change(threads[index]);
		if (next === threads[index]) return threads;
		return next ? threads.map((thread, i) => i === index ? next : thread) : threads.filter((_, i) => i !== index);
	};
	switch (event.type) {
		case COMMENT_ADDED: {
			const added = CommentAdded.safeParse(event.payload);
			if (!added.success || threads.some((thread) => thread.id === added.data.thread)) return threads;
			const { thread, quote, body, via } = added.data;
			return [...threads, {
				id: thread,
				quote,
				detached: false,
				resolved: null,
				comments: [{
					id: thread,
					author,
					via: via || null,
					body,
					at: event.createdAt,
					edited: false
				}]
			}];
		}
		case COMMENT_REPLIED: {
			const reply = CommentReplied.safeParse(event.payload);
			if (!reply.success) return threads;
			const { comment, body, via } = reply.data;
			return update(reply.data.thread, (thread) => thread.comments.some((each) => each.id === comment) ? thread : {
				...thread,
				comments: [...thread.comments, {
					id: comment,
					author,
					via: via || null,
					body,
					at: event.createdAt,
					edited: false
				}]
			});
		}
		case COMMENT_EDITED: {
			const edit = CommentEdited.safeParse(event.payload);
			if (!edit.success) return threads;
			return update(edit.data.thread, (thread) => {
				const target = thread.comments.find((each) => each.id === edit.data.comment);
				if (!target || target.author !== author) return thread;
				return {
					...thread,
					comments: thread.comments.map((each) => each === target ? {
						...each,
						body: edit.data.body,
						edited: true
					} : each)
				};
			});
		}
		case COMMENT_DELETED: {
			const deletion = CommentDeleted.safeParse(event.payload);
			if (!deletion.success) return threads;
			return update(deletion.data.thread, (thread) => {
				const target = thread.comments.find((each) => each.id === deletion.data.comment);
				if (!target || target.author !== author) return thread;
				const comments = thread.comments.filter((each) => each !== target);
				return comments.length > 0 ? {
					...thread,
					comments
				} : null;
			});
		}
		case COMMENT_RESOLVED:
		case COMMENT_REOPENED: {
			const ref = ThreadRef.safeParse(event.payload);
			if (!ref.success) return threads;
			return update(ref.data.thread, (thread) => ({
				...thread,
				resolved: event.type === "docs/comment-resolved" ? {
					by: author,
					at: event.createdAt
				} : null
			}));
		}
		case COMMENT_REANCHORED: {
			const anchor = CommentReanchored.safeParse(event.payload);
			if (!anchor.success) return threads;
			return update(anchor.data.thread, (thread) => anchor.data.quote ? {
				...thread,
				quote: anchor.data.quote,
				detached: false
			} : {
				...thread,
				detached: true
			});
		}
		default: return threads;
	}
}
//#endregion
export { COMMENT_ADDED, COMMENT_DELETED, COMMENT_EDITED, COMMENT_REANCHORED, COMMENT_REOPENED, COMMENT_REPLIED, COMMENT_RESOLVED, Comment, CommentAdded, CommentDeleted, CommentEdited, CommentReanchored, CommentReplied, CommentThread, Quote, ThreadRef, authorOf, commentEvents, reduceComments };
