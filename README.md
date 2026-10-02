# esm.iterate.com prototype (spike, 2026-10-02)

`prototype/service.ts`: a Worker-shaped handler serving builds in a GitHub repo's `packed/<name>/`
as ES modules (`/<owner>/<repo>/<name>@<ref>[/<subpath>]?external=…`) and npm tarballs
(`/tgz/<owner>/<repo>/<name>@<ref>`). `node prototype/serve.ts` runs it on :8797 with a no-build
demo page at `/demo.html`. `loader.patch` is the change to iterate's
`core/os/src/context/module-resolution.ts` that loads through it; `loader-spike.test.ts` is the run.
Throwaway: see iterate's `tasks/package-builds-on-github.md`.
