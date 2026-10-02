# esm.iterate.com prototype (spike, 2026-10-02)

- `prototype/service.ts`: a Worker-shaped handler serving packages from iterate GitHub repos (the
  builds in `packed/<name>/`). An address is a pnpm dependency:
  `/<name>@<encodeURIComponent(specifier)>[/<subpath>][?external=a,b]`, e.g.
  `/@iterate-com/ui@github%3Aiterate%2Fpackages%23main%26path%3Apacked%2F%40iterate-com%2Fui/page`.
  npm, pnpm, yarn and bun (by User-Agent) asking for a package get its npm tarball, everyone else
  an ES module; npm specifiers redirect to esm.sh. `prototype/specifier.ts` is the grammar
  (`node --test prototype/specifier.test.ts`). `node prototype/serve.ts` runs it on :8797: `/` is
  the live explainer, `/importmap-demo.html` the one-line import map, `/demo.html` docs and voice.
- `prototype/ui/`: the tsdown config and the `page`, `react`, `react/jsx-runtime`,
  `react-dom/client` and `live` entries that build iterate's
  packages/ui for no-build pages (npm dependencies bundled, split across entries).
- `prototype/loader.patch`: the change to iterate's `core/os/src/context/module-resolution.ts`
  that loads through it; `loader-spike.test.ts` is the run.

Throwaway: see iterate's `tasks/package-builds-on-github.md`.
