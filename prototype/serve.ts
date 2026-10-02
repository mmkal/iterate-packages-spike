// Runs service.ts's Worker-shaped handler on a local port, logging every request, plus a no-build
// demo page at /demo.html.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { handle } from "./service.ts";

const port = Number(process.env.PORT || 8797);
createServer(async (req, res) => {
  const url = new URL(req.url!, `http://localhost:${port}`);
  if (url.pathname === "/demo.html") {
    res.writeHead(200, { "content-type": "text/html" });
    res.end(readFileSync(new URL("./demo.html", import.meta.url)));
    return;
  }
  const started = Date.now();
  const response = await handle(new Request(url, { method: req.method }), fetch);
  console.log(`${response.status} ${req.method} ${url.pathname}${url.search} ${Date.now() - started}ms`);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  if (response.body && req.method !== "HEAD")
    res.end(Buffer.from(await response.arrayBuffer()));
  else res.end();
}).listen(port, () => console.log(`listening on http://localhost:${port}`));
