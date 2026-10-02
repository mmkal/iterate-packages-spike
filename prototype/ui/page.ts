// SPIKE: what a no-build page needs to render this package's components, from the same React they
// use: htm's `html` tag over React's createElement, `render` into an element, and React's API.
import { createRoot } from "react-dom/client";
import htm from "htm";
import { createElement } from "./react.ts";

export * from "./react.ts";
export const html = htm.bind(createElement);
export function render(node: Parameters<ReturnType<typeof createRoot>["render"]>[0], element: Element) {
  createRoot(element).render(node);
}
