import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "cn";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Check, Copy } from "lucide-react";
import { stringify } from "yaml";
import { EditorView, basicSetup } from "codemirror";
import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { foldService } from "@codemirror/language";
import { search, searchKeymap } from "@codemirror/search";
import { keymap } from "@codemirror/view";
import { vsCodeLight } from "@fsegurai/codemirror-theme-bundle";
import { toast } from "sonner";
import { Tooltip } from "@base-ui/react/tooltip";
//#region src/components/ui/tooltip.tsx
function Tooltip$1({ ...props }) {
	return /* @__PURE__ */ jsx(Tooltip.Root, {
		"data-slot": "tooltip",
		...props
	});
}
function TooltipTrigger({ ...props }) {
	return /* @__PURE__ */ jsx(Tooltip.Trigger, {
		"data-slot": "tooltip-trigger",
		...props
	});
}
function TooltipContent({ className, side = "top", sideOffset = 4, align = "center", alignOffset = 0, children, ...props }) {
	return /* @__PURE__ */ jsx(Tooltip.Portal, { children: /* @__PURE__ */ jsx(Tooltip.Positioner, {
		align,
		alignOffset,
		side,
		sideOffset,
		className: "isolate z-50",
		children: /* @__PURE__ */ jsxs(Tooltip.Popup, {
			"data-slot": "tooltip-content",
			className: cn("z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className),
			...props,
			children: [children, /* @__PURE__ */ jsx(Tooltip.Arrow, { className: "z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" })]
		})
	}) });
}
//#endregion
//#region src/components/code-block.client.tsx
/** Read-only code with search, folding and a copy button: the agents app's scripts and model
*  responses (code-block.tsx gives it their grammars), and {@link SerializedObjectCodeBlock}'s data. */
function CodeBlock({ code, language, className, showLineNumbers = true, toolbar = /* @__PURE__ */ jsx(CopyButton, {
	label: "Copy code",
	text: () => code
}) }) {
	const extensions = useMemo(() => [
		basicSetup,
		vsCodeLight,
		search({ top: true }),
		foldPromptBlocks(),
		language,
		keymap.of(searchKeymap),
		EditorView.editable.of(false),
		EditorView.contentAttributes.of({ tabindex: "0" }),
		EditorView.lineWrapping,
		showLineNumbers ? [] : EditorView.theme({ ".cm-gutters": { display: "none" } })
	], [language, showLineNumbers]);
	return /* @__PURE__ */ jsxs("div", {
		className: cn("relative flex min-h-0 flex-col", className),
		children: [/* @__PURE__ */ jsx("div", {
			className: "min-h-0 flex-1 overflow-hidden overflow-y-auto rounded border",
			children: /* @__PURE__ */ jsx(ReadOnlyCodeMirror, {
				value: code,
				extensions
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "absolute top-1 right-1 flex items-center gap-0.5 rounded bg-background px-1 py-0.5 text-xs opacity-40 transition-opacity hover:opacity-90",
			children: toolbar
		})]
	});
}
/** Any value as YAML or JSON, with a button to copy each. */
function SerializedObjectCodeBlock({ data, className, showToggle = true }) {
	const [format, setFormat] = useState("yaml");
	const code = useMemo(() => serializeData(data, format), [data, format]);
	return /* @__PURE__ */ jsx(CodeBlock, {
		code,
		language: dataLanguages[format],
		className,
		toolbar: /* @__PURE__ */ jsxs(Fragment, { children: [
			showToggle ? /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setFormat((value) => value === "yaml" ? "json" : "yaml"),
				className: "rounded px-1.5 py-0.5 text-xs font-medium hover:bg-muted",
				children: format === "yaml" ? "YAML" : "JSON"
			}) : null,
			/* @__PURE__ */ jsx(CopyButton, {
				label: "Copy YAML",
				text: () => serializeData(data, "yaml")
			}),
			/* @__PURE__ */ jsx(CopyButton, {
				label: "Copy JSON",
				text: () => serializeData(data, "json")
			})
		] })
	});
}
/** A read-only view of `value`, rebuilt when `extensions` change. A new `value` is swapped into the
*  existing view instead, so a streaming model response does not rebuild it on every token. */
function ReadOnlyCodeMirror({ value, extensions }) {
	const containerRef = useRef(null);
	const viewRef = useRef(null);
	const valueRef = useRef(value);
	useEffect(() => {
		valueRef.current = value;
	}, [value]);
	useEffect(() => {
		if (!containerRef.current) return;
		const view = new EditorView({
			doc: valueRef.current,
			extensions,
			parent: containerRef.current
		});
		viewRef.current = view;
		return () => {
			view.destroy();
			viewRef.current = null;
		};
	}, [extensions]);
	useEffect(() => {
		const view = viewRef.current;
		if (!view || view.state.doc.toString() === value) return;
		view.dispatch({ changes: {
			from: 0,
			to: view.state.doc.length,
			insert: value
		} });
	}, [value]);
	return /* @__PURE__ */ jsx("div", { ref: containerRef });
}
function CopyButton({ label, text }) {
	const [copied, setCopied] = useState(false);
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(text());
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2e3);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Failed to copy");
		}
	};
	return /* @__PURE__ */ jsxs(Tooltip$1, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
		render: /* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: () => void copy(),
			className: "flex h-3 w-3 items-center justify-center rounded"
		}),
		children: copied ? /* @__PURE__ */ jsx(Check, { className: "h-2 w-2 text-green-500" }) : /* @__PURE__ */ jsx(Copy, { className: "h-2 w-2" })
	}), /* @__PURE__ */ jsx(TooltipContent, { children: /* @__PURE__ */ jsx("p", { children: label }) })] });
}
const dataLanguages = {
	yaml: [yaml(), foldBracketsAndDocComments()],
	json: [json(), foldBracketsAndDocComments()]
};
function serializeData(data, format) {
	try {
		if (data === void 0) return format === "yaml" ? "undefined" : "\"undefined\"";
		if (data === null) return "null";
		return format === "yaml" ? stringify(data) : JSON.stringify(data, null, 2);
	} catch (error) {
		return format === "yaml" ? `# Error serializing data\n# ${error instanceof Error ? error.message : "Unknown error"}` : JSON.stringify({
			error: "Failed to serialize data",
			message: error instanceof Error ? error.message : "Unknown error"
		}, null, 2);
	}
}
/** Folds a prompt's blocks: an `<tag>` line to its `</tag>`, a fence to its close, and a markdown
*  heading to the next heading or dedent. */
function foldPromptBlocks() {
	return foldService.of((state, lineStart, lineEnd) => {
		const line = state.doc.lineAt(lineStart);
		if (line.text.match(/^\s*<\S+>$/)) {
			const closeTag = line.text.replace("<", "</");
			for (let i = line.number + 1; i <= state.doc.lines; i++) {
				const nextLine = state.doc.line(i);
				if (nextLine.text === closeTag) return foldTo(lineEnd, nextLine);
			}
		}
		if (line.text.match(/^\s*```\w*\s*$/)) {
			const closeTag = line.text.slice(0, line.text.lastIndexOf("`") + 1);
			for (let i = line.number + 1; i <= state.doc.lines; i++) {
				const nextLine = state.doc.line(i);
				if (nextLine.text === closeTag) return foldTo(lineEnd, nextLine);
			}
		}
		const markdownHeadingRegex = /^\s*#+ \w/;
		if (markdownHeadingRegex.test(line.text)) {
			const startIndent = line.text.match(/^\s*/)?.[0] || "";
			for (let i = line.number + 1; i <= state.doc.lines; i++) {
				const { text } = state.doc.line(i);
				const lessIndentedThanStart = text.trim() && !text.startsWith(startIndent);
				if (markdownHeadingRegex.test(text) || lessIndentedThanStart || i === state.doc.lines) return {
					from: lineEnd,
					to: state.doc.line(i - 1).from - 1
				};
			}
		}
		return null;
	});
}
/** Serialized data's extra folds, tried after {@link foldPromptBlocks}: a `/**` line to its `*\/`,
*  and a line ending `{` or `[` to the `}` or `]` at its own indent. */
function foldBracketsAndDocComments() {
	return foldService.of((state, lineStart, lineEnd) => {
		const line = state.doc.lineAt(lineStart);
		if (line.text.endsWith("/**")) for (let i = line.number + 1; i <= state.doc.lines; i++) {
			const nextLine = state.doc.line(i);
			if (nextLine.text.includes("*/")) return foldTo(lineEnd, nextLine);
		}
		for (const pair of ["{}", "[]"]) if (line.text.trimEnd().endsWith(pair[0])) {
			const indent = line.text.match(/^\s*/)?.[0] || "";
			for (let i = line.number + 1; i <= state.doc.lines; i++) {
				const nextLine = state.doc.line(i);
				if (nextLine.text === indent + pair[1]) return foldTo(lineEnd, nextLine);
			}
		}
		return null;
	});
}
/** A fold from the end of the opening line to the closing line's first non-blank character. */
function foldTo(lineEnd, closing) {
	return {
		from: lineEnd,
		to: closing.from + closing.text.split(/\S/)[0].length
	};
}
//#endregion
export { CodeBlock, SerializedObjectCodeBlock };
