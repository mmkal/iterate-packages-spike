import { A as highlightActiveLineGutter, C as indentOnInput, D as drawSelection, E as crosshairCursor, F as rectangularSelection, I as EditorState, M as keymap, N as lineNumbers, O as dropCursor, R as tags, T as EditorView, _ as HighlightStyle, b as foldGutter, c as history, g as completionKeymap, h as closeBracketsKeymap, i as highlightSelectionMatches, j as highlightSpecialChars, k as highlightActiveLine, l as historyKeymap, m as closeBrackets, o as searchKeymap, p as autocompletion, r as lintKeymap, s as defaultKeymap, v as bracketMatching, w as syntaxHighlighting, x as foldKeymap, y as defaultHighlightStyle } from "./vendor-codemirror.mjs";
//#region ../../node_modules/.pnpm/codemirror@6.0.2/node_modules/codemirror/dist/index.js
/**
This is an extension value that just pulls together a number of
extensions that you might want in a basic editor. It is meant as a
convenient helper to quickly set up CodeMirror without installing
and importing a lot of separate packages.

Specifically, it includes...

- [the default command bindings](https://codemirror.net/6/docs/ref/#commands.defaultKeymap)
- [line numbers](https://codemirror.net/6/docs/ref/#view.lineNumbers)
- [special character highlighting](https://codemirror.net/6/docs/ref/#view.highlightSpecialChars)
- [the undo history](https://codemirror.net/6/docs/ref/#commands.history)
- [a fold gutter](https://codemirror.net/6/docs/ref/#language.foldGutter)
- [custom selection drawing](https://codemirror.net/6/docs/ref/#view.drawSelection)
- [drop cursor](https://codemirror.net/6/docs/ref/#view.dropCursor)
- [multiple selections](https://codemirror.net/6/docs/ref/#state.EditorState^allowMultipleSelections)
- [reindentation on input](https://codemirror.net/6/docs/ref/#language.indentOnInput)
- [the default highlight style](https://codemirror.net/6/docs/ref/#language.defaultHighlightStyle) (as fallback)
- [bracket matching](https://codemirror.net/6/docs/ref/#language.bracketMatching)
- [bracket closing](https://codemirror.net/6/docs/ref/#autocomplete.closeBrackets)
- [autocompletion](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion)
- [rectangular selection](https://codemirror.net/6/docs/ref/#view.rectangularSelection) and [crosshair cursor](https://codemirror.net/6/docs/ref/#view.crosshairCursor)
- [active line highlighting](https://codemirror.net/6/docs/ref/#view.highlightActiveLine)
- [active line gutter highlighting](https://codemirror.net/6/docs/ref/#view.highlightActiveLineGutter)
- [selection match highlighting](https://codemirror.net/6/docs/ref/#search.highlightSelectionMatches)
- [search](https://codemirror.net/6/docs/ref/#search.searchKeymap)
- [linting](https://codemirror.net/6/docs/ref/#lint.lintKeymap)

(You'll probably want to add some language package to your setup
too.)

This extension does not allow customization. The idea is that,
once you decide you want to configure your editor more precisely,
you take this package's source (which is just a bunch of imports
and an array literal), copy it into your own code, and adjust it
as desired.
*/
const basicSetup = /*@__PURE__*/ (() => [
	lineNumbers(),
	highlightActiveLineGutter(),
	highlightSpecialChars(),
	history(),
	foldGutter(),
	drawSelection(),
	dropCursor(),
	EditorState.allowMultipleSelections.of(true),
	indentOnInput(),
	syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
	bracketMatching(),
	closeBrackets(),
	autocompletion(),
	rectangularSelection(),
	crosshairCursor(),
	highlightActiveLine(),
	highlightSelectionMatches(),
	keymap.of([
		...closeBracketsKeymap,
		...defaultKeymap,
		...searchKeymap,
		...historyKeymap,
		...foldKeymap,
		...completionKeymap,
		...lintKeymap
	])
])();
//#endregion
//#region ../../node_modules/.pnpm/@fsegurai+codemirror-theme-vscode-light@6.2.8_@codemirror+language@6.12.4_@codemirror+s_e6f025f6f2e4ef0d463a26515f85f005/node_modules/@fsegurai/codemirror-theme-vscode-light/dist/index.js
const generalContent = {
	fontSize: "14px",
	fontFamily: "JetBrains Mono, Consolas, monospace",
	lineHeight: "1.6"
};
const generalCursor = { borderLeftWidth: "2px" };
const generalDiff = {
	insertedTextDecoration: "none",
	deletedTextDecoration: "line-through",
	insertedLinePadding: "1px 3px",
	borderRadius: "3px"
};
const generalGutter = {
	paddingRight: "8px",
	fontSize: "0.9em",
	fontWeight: "500",
	lineHeight: "1.78"
};
const generalPanel = {
	borderRadius: "4px",
	padding: "2px 10px"
};
const generalLine = { borderRadius: "2px" };
const generalMatching = { borderRadius: "2px" };
const generalPlaceholder = {
	borderRadius: "4px",
	padding: "0 5px",
	margin: "0 2px"
};
const generalScroller = {
	width: "12px",
	height: "12px",
	borderRadius: "6px"
};
const generalSearchField = {
	borderRadius: "4px",
	padding: "2px 6px"
};
const generalTooltip = {
	borderRadius: "4px",
	borderRadiusSelected: "3px",
	lineHeight: "1.3",
	padding: "4px 8px",
	paddingRight: "8px"
};
/**
* Enhanced VSCode Light theme color definitions
* --------------------------------------------
* Colors organized by function with visual color blocks
*/
const base00 = "#ffffff";
const base01 = "#f3f3f3";
const base02 = "#d6d6d6";
const base03 = "#6b6b6b";
const base04 = "#000000";
const base05 = "#383a42";
const base06 = "#1f1f1f";
const base07 = "#f5f5f5";
const base08 = "#0064ff";
const base09 = "#af00db";
const base0A = "#0070c1";
const base0B = "#267f99";
const base0C = "#795e26";
const base0D = "#098658";
const base0E = "#a31515";
const base0F = "#e51400";
const base10 = "#795e26";
const base11 = "#008000";
const invalid = base0F;
const highlightBackground = "#99999926";
const background = base00;
const tooltipBackground = base01;
const selection = "#add6ff";
const selectionMatch = "#a8ac9480";
const cursor = base04;
const activeBracketBg = "#007acc20";
const activeBracketBorder = "#007acc";
const diagnosticWarning = "#bf8803";
const linkColor = "#006ab1";
const visitedLinkColor = "#9e46d0";
const addedBackground = "#ddfbe0";
const removedBackground = "#ffebec";
const addedText = "#22863a";
const removedText = "#e51400";
/**
* Enhanced editor theme styles for VSCode Light
*/
const vsCodeLightTheme = /*@__PURE__*/ EditorView.theme({
	"&": {
		color: base05,
		backgroundColor: background,
		fontSize: generalContent.fontSize,
		fontFamily: generalContent.fontFamily
	},
	".cm-content": {
		caretColor: cursor,
		lineHeight: generalContent.lineHeight
	},
	".cm-cursor, .cm-dropCursor": {
		borderLeftColor: cursor,
		borderLeftWidth: generalCursor.borderLeftWidth
	},
	".cm-fat-cursor": {
		backgroundColor: `${cursor}99`,
		color: background
	},
	"&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": { backgroundColor: selection },
	".cm-selectionLayer": { zIndex: 100 },
	".cm-searchMatch": {
		backgroundColor: "#bbdefb",
		outline: `1px solid ${base0A}90`,
		color: base06,
		borderRadius: generalSearchField.borderRadius
	},
	".cm-searchMatch.cm-searchMatch-selected": {
		backgroundColor: "#90caf9",
		color: base06,
		padding: generalSearchField.padding,
		"& span": { color: base06 }
	},
	".cm-search.cm-panel.cm-textfield": {
		color: base05,
		borderRadius: generalSearchField.borderRadius,
		padding: generalSearchField.padding
	},
	".cm-panels": {
		backgroundColor: base01,
		color: base05,
		borderRadius: "3px",
		boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)"
	},
	".cm-panels.cm-panels-top": { borderBottom: `1px solid ${base02}` },
	".cm-panels.cm-panels-bottom": { borderTop: `1px solid ${base02}` },
	".cm-panel button": {
		backgroundColor: background,
		color: base05,
		border: `1px solid ${base02}`,
		borderRadius: generalPanel.borderRadius,
		padding: generalPanel.padding
	},
	".cm-panel button:hover": {
		backgroundColor: "#e8e8e8",
		border: `1px solid ${base03}80`
	},
	".cm-activeLine": {
		backgroundColor: highlightBackground,
		borderRadius: generalLine.borderRadius,
		zIndex: 1
	},
	".cm-gutters": {
		backgroundColor: base07,
		color: "#237893",
		border: "none",
		borderRight: `1px solid ${base02}`,
		paddingRight: generalGutter.paddingRight
	},
	".cm-activeLineGutter": {
		backgroundColor: highlightBackground,
		color: "#0b216f",
		fontWeight: generalGutter.fontWeight
	},
	".cm-lineNumbers": {
		fontSize: generalGutter.fontSize,
		lineHeight: generalGutter.lineHeight
	},
	".cm-foldGutter": {
		fontSize: generalGutter.fontSize,
		lineHeight: generalGutter.lineHeight
	},
	".cm-foldGutter .cm-gutterElement": {
		color: "#237893",
		cursor: "pointer"
	},
	".cm-foldGutter .cm-gutterElement:hover": { color: "#0b216f" },
	".cm-insertedLine": {
		textDecoration: generalDiff.insertedTextDecoration,
		backgroundColor: addedBackground,
		color: addedText,
		padding: generalDiff.insertedLinePadding,
		borderRadius: generalDiff.borderRadius
	},
	"ins.cm-insertedLine, ins.cm-insertedLine:not(:has(.cm-changedText))": {
		textDecoration: generalDiff.insertedTextDecoration,
		backgroundColor: `${addedBackground} !important`,
		color: addedText,
		padding: generalDiff.insertedLinePadding,
		borderRadius: generalDiff.borderRadius,
		border: `1px solid ${addedText}40`
	},
	"ins.cm-insertedLine .cm-changedText": { background: "transparent !important" },
	".cm-deletedLine": {
		textDecoration: generalDiff.deletedTextDecoration,
		backgroundColor: removedBackground,
		color: removedText,
		padding: generalDiff.insertedLinePadding,
		borderRadius: generalDiff.borderRadius
	},
	"del.cm-deletedLine, del, del:not(:has(.cm-deletedText))": {
		textDecoration: generalDiff.deletedTextDecoration,
		backgroundColor: `${removedBackground} !important`,
		color: removedText,
		padding: generalDiff.insertedLinePadding,
		borderRadius: generalDiff.borderRadius,
		border: `1px solid ${removedText}40`
	},
	"del .cm-deletedText, del .cm-changedText": { background: "transparent !important" },
	".cm-tooltip": {
		backgroundColor: tooltipBackground,
		border: `1px solid ${base02}`,
		borderRadius: generalTooltip.borderRadius,
		padding: generalTooltip.padding,
		boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
	},
	".cm-tooltip-autocomplete": {
		"& > ul": {
			backgroundColor: tooltipBackground,
			border: "none",
			maxHeight: "300px"
		},
		"& > ul > li": {
			padding: generalTooltip.padding,
			lineHeight: generalTooltip.lineHeight
		},
		"& > ul > li[aria-selected]": {
			backgroundColor: "#dcebfc",
			color: base06,
			borderRadius: generalTooltip.borderRadiusSelected
		},
		"& > ul > li > span.cm-completionIcon": {
			color: base03,
			paddingRight: generalTooltip.paddingRight
		},
		"& > ul > li > span.cm-completionDetail": {
			color: base03,
			fontStyle: "italic"
		}
	},
	".cm-tooltip .cm-tooltip-arrow:before": {
		borderTopColor: "transparent",
		borderBottomColor: "transparent"
	},
	".cm-tooltip .cm-tooltip-arrow:after": {
		borderTopColor: tooltipBackground,
		borderBottomColor: tooltipBackground
	},
	".cm-diagnostic": {
		"&-error": { borderLeft: `3px solid ${invalid}` },
		"&-warning": { borderLeft: `3px solid ${diagnosticWarning}` },
		"&-info": { borderLeft: `3px solid ${linkColor}` }
	},
	".cm-lintPoint-error": { borderBottom: `2px wavy ${invalid}` },
	".cm-lintPoint-warning": { borderBottom: `2px wavy ${diagnosticWarning}` },
	".cm-matchingBracket": {
		backgroundColor: activeBracketBg,
		outline: `1px solid ${activeBracketBorder}80`,
		borderRadius: generalMatching.borderRadius
	},
	".cm-nonmatchingBracket": {
		backgroundColor: `${base0F}20`,
		outline: `1px solid ${invalid}`,
		borderRadius: generalMatching.borderRadius
	},
	".cm-selectionMatch": {
		backgroundColor: selectionMatch,
		outline: `1px solid ${base02}70`,
		borderRadius: generalMatching.borderRadius
	},
	".cm-foldPlaceholder": {
		backgroundColor: tooltipBackground,
		color: base03,
		border: `1px dotted ${base03}70`,
		borderRadius: generalPlaceholder.borderRadius,
		padding: generalPlaceholder.padding,
		margin: generalPlaceholder.margin
	},
	"&.cm-focused": {
		outline: "none",
		boxShadow: `0 0 0 1px ${base02}`
	},
	"& .cm-scroller::-webkit-scrollbar": {
		width: generalScroller.width,
		height: generalScroller.height
	},
	"& .cm-scroller::-webkit-scrollbar-track": { background },
	"& .cm-scroller::-webkit-scrollbar-thumb": {
		backgroundColor: "#dadada",
		borderRadius: generalScroller.borderRadius,
		border: `3px solid ${background}`
	},
	"& .cm-scroller::-webkit-scrollbar-thumb:hover": { backgroundColor: "#cccccc" },
	".cm-ghostText": {
		opacity: "0.5",
		color: base03
	}
}, { dark: false });
/**
* Enhanced syntax highlighting for VSCode Light theme
*/
const vsCodeLightHighlightStyle = /*@__PURE__*/ HighlightStyle.define([
	{
		tag: tags.keyword,
		color: base08,
		fontWeight: "bold"
	},
	{
		tag: tags.controlKeyword,
		color: base09,
		fontWeight: "bold"
	},
	{
		tag: tags.moduleKeyword,
		color: base08,
		fontWeight: "bold"
	},
	{
		tag: [
			tags.name,
			tags.deleted,
			tags.character,
			tags.macroName
		],
		color: base05
	},
	{
		tag: [tags.variableName],
		color: base0A
	},
	{
		tag: [tags.propertyName],
		color: base0A,
		fontStyle: "normal"
	},
	{
		tag: [tags.typeName],
		color: base0B
	},
	{
		tag: [tags.className],
		color: base0B,
		fontStyle: "normal"
	},
	{
		tag: [tags.namespace],
		color: base05,
		fontStyle: "normal"
	},
	{
		tag: [tags.operator, tags.operatorKeyword],
		color: base05
	},
	{
		tag: [tags.bracket],
		color: base05
	},
	{
		tag: [tags.brace],
		color: base05
	},
	{
		tag: [tags.punctuation],
		color: base05
	},
	{
		tag: [/*@__PURE__*/ tags.function(tags.variableName)],
		color: base0C
	},
	{
		tag: [tags.labelName],
		color: base0C,
		fontStyle: "normal"
	},
	{
		tag: [/*@__PURE__*/ tags.definition(/*@__PURE__*/ tags.function(tags.variableName))],
		color: base0C
	},
	{
		tag: [/*@__PURE__*/ tags.definition(tags.variableName)],
		color: base0A
	},
	{
		tag: tags.number,
		color: base0D
	},
	{
		tag: tags.changed,
		color: base10
	},
	{
		tag: tags.annotation,
		color: base10,
		fontStyle: "italic"
	},
	{
		tag: tags.modifier,
		color: base08,
		fontStyle: "normal"
	},
	{
		tag: tags.self,
		color: base08
	},
	{
		tag: [
			tags.color,
			/*@__PURE__*/ tags.constant(tags.name),
			/*@__PURE__*/ tags.standard(tags.name)
		],
		color: base0A
	},
	{
		tag: [
			tags.atom,
			tags.bool,
			/*@__PURE__*/ tags.special(tags.variableName)
		],
		color: base08
	},
	{
		tag: [tags.processingInstruction, tags.inserted],
		color: base0E
	},
	{
		tag: [/*@__PURE__*/ tags.special(tags.string), tags.regexp],
		color: base09
	},
	{
		tag: tags.string,
		color: base0E
	},
	{
		tag: /*@__PURE__*/ tags.definition(tags.typeName),
		color: base0B,
		fontWeight: "bold"
	},
	{
		tag: [/*@__PURE__*/ tags.definition(tags.name), tags.separator],
		color: base05
	},
	{
		tag: tags.meta,
		color: base03
	},
	{
		tag: tags.comment,
		fontStyle: "italic",
		color: base11
	},
	{
		tag: tags.docComment,
		fontStyle: "italic",
		color: base11
	},
	{
		tag: [tags.tagName],
		color: base08
	},
	{
		tag: [tags.attributeName],
		color: base0A
	},
	{
		tag: [tags.heading],
		fontWeight: "bold",
		color: base08
	},
	{
		tag: tags.heading1,
		color: base08,
		fontWeight: "bold"
	},
	{
		tag: tags.heading2,
		color: base08
	},
	{
		tag: tags.heading3,
		color: base08
	},
	{
		tag: tags.heading4,
		color: base08
	},
	{
		tag: tags.heading5,
		color: base08
	},
	{
		tag: tags.heading6,
		color: base08
	},
	{
		tag: [tags.strong],
		fontWeight: "bold",
		color: base08
	},
	{
		tag: [tags.emphasis],
		fontStyle: "italic",
		color: base0A
	},
	{
		tag: [tags.link],
		color: visitedLinkColor,
		textDecoration: "underline",
		textUnderlinePosition: "under"
	},
	{
		tag: [tags.url],
		color: linkColor,
		textDecoration: "underline",
		textUnderlineOffset: "2px"
	},
	{
		tag: [tags.invalid],
		color: base05,
		textDecoration: "underline wavy",
		borderBottom: `1px wavy ${invalid}`
	},
	{
		tag: [tags.strikethrough],
		color: invalid,
		textDecoration: "line-through"
	},
	{
		tag: /*@__PURE__*/ tags.constant(tags.name),
		color: base0A
	},
	{
		tag: tags.deleted,
		color: invalid
	},
	{
		tag: tags.squareBracket,
		color: base05
	},
	{
		tag: tags.angleBracket,
		color: base05
	},
	{
		tag: tags.monospace,
		color: base05
	},
	{
		tag: [tags.contentSeparator],
		color: base05
	},
	{
		tag: tags.quote,
		color: base11
	},
	{
		tag: tags.integer,
		color: base0D
	},
	{
		tag: tags.float,
		color: base0D
	},
	{
		tag: tags.null,
		color: base0D
	},
	{
		tag: tags.attributeValue,
		color: base0E
	},
	{
		tag: tags.escape,
		color: base0E
	},
	{
		tag: tags.paren,
		color: base05
	},
	{
		tag: tags.lineComment,
		color: base11,
		fontStyle: "italic"
	},
	{
		tag: tags.blockComment,
		color: base11,
		fontStyle: "italic"
	},
	{
		tag: tags.definitionKeyword,
		color: base08
	},
	{
		tag: tags.arithmeticOperator,
		color: base05
	},
	{
		tag: tags.logicOperator,
		color: base05
	},
	{
		tag: tags.compareOperator,
		color: base05
	},
	{
		tag: tags.bitwiseOperator,
		color: base05
	},
	{
		tag: tags.updateOperator,
		color: base05
	},
	{
		tag: tags.derefOperator,
		color: base05
	},
	{
		tag: /*@__PURE__*/ tags.local(tags.variableName),
		color: base0A
	},
	{
		tag: tags.list,
		color: base08
	},
	{
		tag: tags.unit,
		color: base0D
	}
]);
/**
* Combined VSCode Light theme extension
*/
const vsCodeLight = [vsCodeLightTheme, /*@__PURE__*/ syntaxHighlighting(vsCodeLightHighlightStyle)];
//#endregion
export { basicSetup as n, vsCodeLight as t };
