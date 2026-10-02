import { parse } from "es-module-lexer/js";
import { expect, test } from "vitest";
import { resolveModules, type PlatformModules } from "./module-resolution.ts";

const platformEntries = ["iterate/sdk", "iterate/lib", "iterate/expression", "iterate/agents/contract", "iterate/stream/processor", "zod"];
const platform: PlatformModules = {
  modules: Object.fromEntries(platformEntries.map((e) => [`node_modules/${e}.js`, "export {};"])),
  imports: Object.fromEntries(platformEntries.map((e) => [`node_modules/${e}.js`, []])),
};

test("packages at <name>@<encodeURIComponent(pnpm specifier)> load through the esm.iterate.com prototype", { timeout: 120_000 }, async () => {
  const store = new Map<string, string>();
  const { modules } = await resolveModules(
    {
      "package.json": JSON.stringify({
        main: "worker.ts",
        dependencies: {
          "@iterate-com/voice": "http://localhost:8797/@iterate-com/voice@github%3Ammkal%2Fiterate-packages-spike%239d08465d4f273f4be264302901dae3a7718724e3%26path%3Apacked%2F%40iterate-com%2Fvoice",
          "@iterate-com/docs": "http://localhost:8797/@iterate-com/docs@github%3Ammkal%2Fiterate-packages-spike%239d08465d4f273f4be264302901dae3a7718724e3%26path%3Apacked%2F%40iterate-com%2Fdocs",
        },
      }),
      "worker.ts": `import * as voice from "@iterate-com/voice"; import { installVoice } from "@iterate-com/voice/install"; import { findQuote } from "@iterate-com/docs/anchor"; import * as docs from "@iterate-com/docs";
        export default { fetch: () => new Response(String([voice, installVoice, findQuote, docs].length)) };`,
    },
    {
      platform,
      store: { get: async (k) => store.get(k) ?? null, put: async (k, v) => void store.set(k, v) },
      fetch: globalThis.fetch,
      where: "esm-iterate-spike",
    },
  );
  const names = Object.keys(modules).sort();
  console.log(names.filter((n) => !n.includes("lib0")).join("\n"));
  for (const [name, code] of Object.entries(modules)) {
    for (const imp of parse(code)[0]) {
      if (!imp.n || imp.n.startsWith("cloudflare:")) continue;
      const target = new URL(imp.n, `file:///${name}`).pathname.slice(1);
      expect.soft(Object.hasOwn(modules, target), `${name} imports ${imp.n}`).toBe(true);
    }
  }
  // shared chunks load once, whichever entry reaches them
  expect(names.filter((n) => n.includes("install-DuW0NyzX"))).toHaveLength(1);
  expect(names.filter((n) => n.includes("iterate-com/docs@") && n.includes("comments"))).toHaveLength(1);
});
