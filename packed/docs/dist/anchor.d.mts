//#region src/anchor.d.ts
/** What a comment points at: the text, and up to `CONTEXT` characters either side of it. */
export type Quote = {
  exact: string;
  prefix: string;
  suffix: string;
};
/** Where a quote is in a text now; `exact` false for a match by its surroundings alone. */
export type Found = {
  from: number;
  to: number;
  exact: boolean;
};
/** The quote of `text` between `from` and `to`. */
export declare function quoteAt(text: string, from: number, to: number): Quote;
/** Where `quote` is in `text` now, or null (detached). */
export declare function findQuote(text: string, quote: Quote): Found | null;
//#endregion