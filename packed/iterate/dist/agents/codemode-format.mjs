//#region src/agents/codemode-format.ts
/** A line that OPENS a codemode tag: `<codemode>` or `<codemode status="...">` alone on its line. */
const OPEN_LINE_RE = /^[ \t]*<codemode(\s[^>]*)?>[ \t]*$/;
const CLOSE_LINE_RE = /^[ \t]*<\/codemode>[ \t]*$/;
const STATUS_ATTR_RE = /\bstatus="([^"]*)"/;
/** A body that is already a complete async function and must not be wrapped. */
const ASYNC_FUNCTION_BODY_RE = /^(?:async\s*(?:function|\()|\(?async\s*\()/;
const GRAMMAR_REMINDER = "Format reminder — `<codemode status=\"...\">` on its own line, JavaScript statements (top-level `await`/`return` allowed), then `</codemode>` on its own line. Markdown outside the tag is sent to the user; the status attribute is shown while the code runs.";
function parseCodemodeResponse(content) {
	const lines = content.split("\n");
	const openIndexes = lines.flatMap((line, index) => OPEN_LINE_RE.test(line) ? [index] : []);
	const closeIndexes = lines.flatMap((line, index) => CLOSE_LINE_RE.test(line) ? [index] : []);
	if (openIndexes.length === 0) {
		if (closeIndexes.length > 0) return {
			kind: "malformed",
			feedback: `Your code did NOT run: the response has a </codemode> line with no opening <codemode> line before it. ${GRAMMAR_REMINDER}`
		};
		const prose = content.trim();
		return prose === "" ? { kind: "none" } : {
			kind: "none",
			prose
		};
	}
	if (openIndexes.length > 1) return {
		kind: "multiple",
		feedback: `Your response contained ${String(openIndexes.length)} <codemode> tags, so NOTHING was executed. Use at most ONE <codemode> tag per turn — your script's return value arrives as your next input and you write the next step then. Resend just the FIRST step as a single tag.`
	};
	const openIndex = openIndexes[0];
	const closersAfterOpen = closeIndexes.filter((index) => index > openIndex);
	if (closeIndexes.some((index) => index < openIndex) || closersAfterOpen.length === 0) return {
		kind: "malformed",
		feedback: `Your code did NOT run: the <codemode> tag was never closed (or a stray </codemode> line appeared before it). ${GRAMMAR_REMINDER}`
	};
	const closeIndex = closersAfterOpen[closersAfterOpen.length - 1];
	const body = lines.slice(openIndex + 1, closeIndex).join("\n").trim();
	if (body === "") return {
		kind: "malformed",
		feedback: `Your code did NOT run: the <codemode> tag was empty. ${GRAMMAR_REMINDER}`
	};
	const status = (lines[openIndex].match(STATUS_ATTR_RE)?.[1] || "").trim() || void 0;
	const prose = [lines.slice(0, openIndex).join("\n").trim(), lines.slice(closeIndex + 1).join("\n").trim()].filter((part) => part !== "").join("\n\n");
	return {
		kind: "script",
		code: ASYNC_FUNCTION_BODY_RE.test(body) ? body : `async (itx) => {\n${body}\n}`,
		status,
		prose: prose || void 0
	};
}
//#endregion
export { parseCodemodeResponse };

//# sourceMappingURL=codemode-format.mjs.map