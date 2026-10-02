//#region src/anchor.ts
/** How much of each side a quote keeps: enough to tell repeats apart and to bracket an edit. */
const context = 32;
/** The quote of `text` between `from` and `to`. */
function quoteAt(text, from, to) {
	return {
		exact: text.slice(from, to),
		prefix: text.slice(Math.max(0, from - context), from),
		suffix: text.slice(to, to + context)
	};
}
/** Where `quote` is in `text` now, or null (detached). */
function findQuote(text, quote) {
	const exact = occurrences(text, quote.exact);
	if (exact.length > 0) {
		const best = exact.reduce((a, b) => fit(text, quote, b) > fit(text, quote, a) ? b : a);
		return {
			from: best,
			to: best + quote.exact.length,
			exact: true
		};
	}
	return bracketed(text, quote);
}
/** How well the text around `at` matches the quote's surroundings: characters in common, reading
*  outward from the quote on each side. */
function fit(text, quote, at) {
	let score = 0;
	for (let i = 1; i <= quote.prefix.length && text[at - i] === quote.prefix.at(-i); i++) score++;
	const after = at + quote.exact.length;
	for (let i = 0; i < quote.suffix.length && text[after + i] === quote.suffix[i]; i++) score++;
	return score;
}
/** The text between the quote's prefix and suffix, where both are still there, in order and close
*  (no further apart than the quote was long, plus room for the edit), and something is between. */
function bracketed(text, quote) {
	const prefixes = quote.prefix ? occurrences(text, quote.prefix).map((at) => at + quote.prefix.length) : [0];
	const room = quote.exact.length * 2 + 16;
	let best = null;
	for (const from of prefixes) {
		const to = quote.suffix ? text.indexOf(quote.suffix, from) : text.length;
		if (to < 0 || to - from > room || to === from) continue;
		if (!best || to - from < best.to - best.from) best = {
			from,
			to,
			exact: false
		};
	}
	return best;
}
function occurrences(text, part) {
	const found = [];
	for (let at = text.indexOf(part); at >= 0; at = text.indexOf(part, at + 1)) found.push(at);
	return found;
}
//#endregion
export { findQuote, quoteAt };
