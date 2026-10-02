import { createElement } from "react";
import { createRoot } from "react-dom/client";
import htm from "htm";
export * from "react";
//#region src/page.ts
const html = htm.bind(createElement);
function render(node, element) {
	createRoot(element).render(node);
}
//#endregion
export { html, render };
