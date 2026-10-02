# esm.iterate.com prototype (spike, 2026-10-02)

- `prototype/service.ts`: a Worker-shaped handler serving builds in an iterate repo's
  `packed/<name>/`. One URL per build, `/<owner>/<repo>/<name>@<ref>[/<subpath>]`: npm, pnpm, yarn
  and bun (by User-Agent) get the npm tarball, everyone else an ES module. `node prototype/serve.ts`
  runs it on :8797 with the demo pages (`/demo.html`, `/ui-demo.html`).
- `prototype/ui/`: the tsdown config and the `page` and `react` entries that build iterate's
  packages/ui for no-build pages (npm dependencies bundled, split across entries).
- `prototype/loader.patch`: the change to iterate's `core/os/src/context/module-resolution.ts`
  that loads through it; `loader-spike.test.ts` is the run.

Throwaway: see iterate's `tasks/package-builds-on-github.md`.
