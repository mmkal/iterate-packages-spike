// Runs service.ts's Worker-shaped handler on a local port, plus the prototype's pages (*.html in
// this folder) and a log of what the service did for each request (/__log), which the explainer
// page draws.
import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { forget, handle } from "./service.ts";

const port = Number(process.env.PORT || 8797);
type Logged = {
  id: number;
  method: string;
  url: string;
  userAgent: string;
  startedAt: number;
  endedAt?: number;
  status?: number;
  location?: string;
  type?: string;
  bytes?: number;
  steps: { at: number; step: string; detail: Record<string, unknown> }[];
};
const log: Logged[] = [];
let noStore = false;
let next = 1;

createServer(async (req, res) => {
  const url = new URL(req.url!, `http://localhost:${port}`);
  if (url.pathname === "/__log") {
    const since = Number(url.searchParams.get("since") || 0);
    res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
    res.end(JSON.stringify(log.filter((entry) => entry.id > since)));
    return;
  }
  if (url.pathname === "/__save" && req.method === "POST") {
    // the explainer's recorded run, for the published copy that can't reach this server
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    writeFileSync(new URL("./recorded-run.json", import.meta.url), Buffer.concat(chunks));
    res.writeHead(204);
    res.end();
    return;
  }
  if (url.pathname === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
  }
  if (url.pathname === "/__nocache") {
    // the explainer's "load it again": nothing is cached in the browser, so every load reaches here
    noStore = url.searchParams.get("on") === "1";
    res.writeHead(204, { "cache-control": "no-store" });
    res.end();
    return;
  }
  if (url.pathname === "/__forget") {
    forget();
    res.writeHead(204, { "cache-control": "no-store" });
    res.end();
    return;
  }
  if (url.pathname === "/" || /^\/[\w-]+\.html$/.test(url.pathname)) {
    const file = url.pathname === "/" ? "/explainer.html" : url.pathname;
    res.writeHead(200, { "content-type": "text/html", "cache-control": "no-store" });
    const html = readFileSync(new URL(`.${file}`, import.meta.url), "utf8");
    // the explainer is written for the Artifact host, which wraps it in a document of its own
    res.end(html.startsWith("<!doctype") ? html : `<!doctype html><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />${html}`);
    return;
  }
  const entry: Logged = {
    id: next++,
    method: req.method!,
    url: `${url.pathname}${url.search}`,
    userAgent: String(req.headers["user-agent"] || ""),
    startedAt: Date.now(),
    steps: [],
  };
  log.push(entry);
  if (log.length > 2000) log.splice(0, log.length - 2000);
  const response = await handle(
    new Request(url, {
      method: req.method,
      headers: Object.entries(req.headers).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : [])),
    }),
    fetch,
    (step, detail) => entry.steps.push({ at: Date.now(), step, detail }),
  );
  const body = response.body && req.method !== "HEAD" ? Buffer.from(await response.arrayBuffer()) : undefined;
  Object.assign(entry, {
    endedAt: Date.now(),
    status: response.status,
    location: response.headers.get("location") || undefined,
    type: response.headers.get("content-type") || undefined,
    bytes: body?.length,
  });
  console.log(`${response.status} ${req.method} ${entry.url} ${entry.endedAt! - entry.startedAt}ms ${entry.userAgent.slice(0, 40)}`);
  const headers = Object.fromEntries(response.headers);
  if (noStore) headers["cache-control"] = "no-store";
  res.writeHead(response.status, headers);
  res.end(body);
}).listen(port, () => console.log(`listening on http://localhost:${port}`));
