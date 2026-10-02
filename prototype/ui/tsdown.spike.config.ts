// SPIKE: packages/ui for no-build pages. Everything is bundled, split across the entries, so React,
// Base UI and CodeMirror each load once whichever components a page imports, and nothing comes
// from esm.sh.
export default {
  entry: {
    page: "src/page.ts",
    react: "src/react.ts",
    "components/context-view/context-view": "src/components/context-view/context-view.tsx",
  },
  format: "esm",
  fixedExtension: true,
  platform: "browser",
  target: "es2022",
  hash: false,
  dts: false,
  clean: true,
  // the source is written for Vite, which sets this; a browser build never renders on a server
  define: { "import.meta.env.SSR": "false", "process.env.NODE_ENV": JSON.stringify("production") },
  deps: { alwaysBundle: [/./], onlyBundle: false },
};
