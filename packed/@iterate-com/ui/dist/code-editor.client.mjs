import { r as __toESM } from "./rolldown-runtime.mjs";
import { i as require_react, t as require_jsx_runtime } from "./vendor-react.mjs";
import { t as cn } from "./dist.mjs";
import { L as Prec, M as keymap, P as placeholder, T as EditorView, f as acceptCompletion, n as json, p as autocompletion, t as yaml } from "./vendor-codemirror.mjs";
import { n as basicSetup, t as vsCodeLight } from "./dist2.mjs";
//#region src/components/code-editor.client.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
/**
* The editable sibling of `CodeBlock`: a controlled CodeMirror
* surface used as a composer input. The editor instance is created once and
* kept alive — the callbacks reach it as Effect Events, so a parent re-render
* never tears it down, and external `value` changes (e.g. loading an example)
* are dispatched as edits rather than remounting the view, the caret at the end.
* Completions are styled with the page's tokens, Tab accepts one, text is 16px
* on a phone (iOS zooms into a smaller focused field), and the selection takes
* the page's colour.
*/
function CodeEditor({ value, onValueChange, onSubmit, language = "yaml", placeholder: placeholder$1, label, className, focusOnMount = false, complete }) {
	const containerRef = (0, import_react.useRef)(null);
	const viewRef = (0, import_react.useRef)(null);
	const emitValueChange = (0, import_react.useEffectEvent)(onValueChange);
	const emitSubmit = (0, import_react.useEffectEvent)(() => onSubmit?.());
	const completeAt = (0, import_react.useEffectEvent)((text, pos, explicit) => complete ? complete(text, pos, explicit) : null);
	const completes = Boolean(complete);
	(0, import_react.useEffect)(() => {
		if (!containerRef.current) return;
		const view = new EditorView({
			doc: value,
			parent: containerRef.current,
			extensions: [
				keymap.of([{
					key: "Mod-Enter",
					run: () => {
						emitSubmit();
						return true;
					}
				}]),
				basicSetup,
				vsCodeLight,
				(language === "json" ? json : yaml)(),
				EditorView.lineWrapping,
				placeholder$1 ? placeholder(placeholder$1) : [],
				label ? EditorView.contentAttributes.of({ "aria-label": label }) : [],
				completes ? [autocompletion({
					activateOnTyping: true,
					interactionDelay: 0,
					icons: false,
					maxRenderedOptions: 100,
					override: [(context) => completeAt(context.state.doc.toString(), context.pos, context.explicit)]
				}), Prec.high(keymap.of([{
					key: "Tab",
					run: acceptCompletion
				}]))] : [],
				EditorView.updateListener.of((update) => {
					if (update.docChanged) emitValueChange(update.state.doc.toString());
				}),
				Prec.highest(EditorView.theme({
					"&": {
						backgroundColor: "transparent",
						fontSize: "inherit",
						maxHeight: "12rem",
						minHeight: "3.5rem"
					},
					"&.cm-focused": { outline: "none" },
					".cm-scroller": {
						fontFamily: "var(--font-mono, monospace)",
						fontSize: "inherit",
						overflow: "auto"
					},
					".cm-content": {
						padding: "2px 0",
						caretColor: "var(--foreground)"
					},
					".cm-gutters": { display: "none" },
					".cm-activeLine, .cm-activeLineGutter, .cm-selectionMatch": { backgroundColor: "transparent" },
					".cm-selectionBackground, &.cm-focused .cm-selectionBackground": { backgroundColor: "color-mix(in oklab, var(--primary) 20%, transparent) !important" },
					".cm-tooltip.cm-tooltip-autocomplete": {
						backgroundColor: "var(--popover)",
						border: "1px solid var(--border)",
						borderRadius: "var(--radius-md)",
						color: "var(--popover-foreground)",
						maxWidth: "min(42rem, calc(100vw - 1rem))",
						overflow: "hidden",
						zIndex: "50"
					},
					".cm-tooltip-autocomplete > ul": {
						backgroundColor: "var(--popover)",
						fontFamily: "var(--font-mono, monospace)",
						maxHeight: "min(18rem, 50svh)"
					},
					".cm-tooltip-autocomplete > ul > li": {
						backgroundColor: "transparent",
						padding: "3px 8px"
					},
					".cm-tooltip-autocomplete > ul > li[aria-selected]": {
						backgroundColor: "color-mix(in oklab, var(--primary) 10%, transparent)",
						color: "var(--foreground)"
					},
					".cm-tooltip-autocomplete completion-section": {
						color: "var(--muted-foreground)",
						fontFamily: "var(--font-sans, sans-serif)",
						fontSize: "0.7rem",
						padding: "4px 8px 2px"
					},
					".cm-tooltip-autocomplete .cm-completionDetail": {
						color: "var(--muted-foreground)",
						fontFamily: "var(--font-sans, sans-serif)",
						fontStyle: "normal",
						marginLeft: "1.5em"
					},
					".cm-completionMatchedText": {
						textDecoration: "none",
						fontWeight: "600"
					}
				}))
			]
		});
		viewRef.current = view;
		if (focusOnMount) view.focus();
		return () => {
			view.destroy();
			viewRef.current = null;
		};
	}, [
		language,
		placeholder$1,
		label,
		focusOnMount,
		completes
	]);
	(0, import_react.useEffect)(() => {
		const view = viewRef.current;
		if (!view) return;
		const current = view.state.doc.toString();
		if (current === value) return;
		view.dispatch({
			changes: {
				from: 0,
				to: current.length,
				insert: value
			},
			selection: { anchor: value.length }
		});
	}, [value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: containerRef,
		className: cn("text-base sm:text-xs", className)
	});
}
//#endregion
export { CodeEditor };
