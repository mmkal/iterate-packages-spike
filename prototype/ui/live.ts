// SPIKE: live data for a no-build page on a project host, from the SDK built into this package (so
// its hooks use this package's React): sign in and connect to the host's /api, hold a context, and
// read it live for ContextView.
export { createIterateClient } from "iterate/app";
export { useContextStub, useIterateContext } from "iterate/react";
