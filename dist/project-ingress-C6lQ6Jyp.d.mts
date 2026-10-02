//#region src/project-ingress.d.ts
/** THE ROUTING SLUG a project host named (`notes` for `notes--<project>.<hostname>`), as the project's
 *  config worker `fetch` reads it; absent on the apex. Written only by the platform: the edge sets or
 *  deletes it on every project-host request, and the context DO deletes it from every other
 *  expression fetch, so neither a visitor nor loaded code can pick a routing slug. */
declare const ITERATE_ROUTING_SLUG_HEADER = "x-iterate-routing-slug";
/** THE BASE PATH a project host is served under (`ProjectAddress.basePath`, under paths
 *  `/projects/<project>[/<routingSlug>]`): the edge strips it from the URL the config worker sees
 *  and says it here, so a site composes the paths the browser addresses (packages/notes base-path.ts).
 *  Set or deleted by the edge on every project request, so a visitor's spelling never reaches the
 *  project. Absent under subdomains, where each routing slug owns its origin. */
declare const ITERATE_BASE_PATH_HEADER = "x-iterate-base-path";
/** How projects are reached over HTTP; null ⇒ no ingress (`/api` and `/mcp` still answer). */
type IngressRouting = {
  type: "subdomains";
  hostname: string;
} | {
  type: "paths";
} | null;
/** What a request names: the project (its slug, as written — whether it EXISTS is the directory's
 *  answer), the routing slug (null ⇒ the apex; either way the project's config worker answers), and
 *  the path prefix the edge strips before the config worker sees the URL ("" under subdomains;
 *  "/projects/<project>" or "/projects/<project>/<routingSlug>" under paths). */
type ProjectAddress = {
  project: string;
  routingSlug: string | null;
  basePath: string;
};
/** A ROUTING SLUG: a DNS label starting with a letter. It is a convenience: the one address
 *  component both ingress modes can express. Paths routing shares one host, so there it is the
 *  `/projects/<project>/<routingSlug>` segment; subdomains make it `<routingSlug>--<project>` or
 *  `<routingSlug>.<custom hostname>`. If paths routing is removed, the routing slug,
 *  `x-iterate-routing-slug` and the `--` host form can be deleted, and a project's code matches
 *  hostnames directly. */
declare const ROUTING_SLUG: RegExp;
/** The project + routing slug `url` names under `routing`, or null when it names none. Pure. */
declare function projectAddressOf(routing: IngressRouting, url: URL, platformOrigin: string): ProjectAddress | null;
/** A PROJECT WILDCARD — an owned zone served as one project's apex (core/os
 *  `urls.projectWildcard`, `{ hostname: "iterate.com", project: "iterate" }`): the zone's apex and
 *  every first-level name under it but the excluded ones, in the apex shape, `routingSlug: null`, so the
 *  project's config worker `fetch` answers exactly as it does on `<project>.<hostname>`. Null for
 *  anything else. Case and a trailing dot are forgiven. Pure. */
declare function projectWildcardHostOf(hostname: string, wildcard: {
  hostname: string;
  project: string;
  excludedHostnames?: string[];
} | undefined): {
  routingSlug: null;
  project: string;
} | null;
/** A PROJECT'S OWN HOSTNAME — `iterate.example.com`, added by the project (core/os
 *  project/custom-hostnames.ts) — is that project's apex, and one label under it names a routing
 *  slug: `notes.iterate.example.com` carries `notes`, as `notes--<project>.<hostname>` does. The
 *  hostnames a request's host could be a project's own hostname for, most specific first: the host
 *  itself (the apex), then its parent with the first label as the routing slug. The caller
 *  looks them up in that order; the first a project holds wins. Case and a trailing dot are
 *  forgiven. Pure. */
declare function customHostnameCandidatesOf(host: string): {
  hostname: string;
  routingSlug: string | null;
}[];
/** The URL of `routingSlug` (null ⇒ the apex) in `project` under `routing`, at `path` (default "/",
 *  must start with "/"). Null when there is no ingress, or when the result would not parse back to
 *  the same address (a bad slug; a `path` that climbs out of its routing slug). subdomains: the
 *  protocol and port are `platformOrigin`'s (local dev is `http://localhost:8788`, so
 *  `http://<routingSlug>--<project>.localhost:8788/…`); paths:
 *  `<platformOrigin>/projects/<project>[/<routingSlug>]<path>`. Pure. */
declare function projectUrlOf(routing: IngressRouting, platformOrigin: string, target: {
  project: string;
  routingSlug?: string | null;
  path?: string;
}): URL | null;
/** The URL of `routingSlug` (null ⇒ the apex) at `path` (default "/", must start with "/") on a
 *  project's PRIMARY HOSTNAME, one of its own live hostnames (core/os project/contract.ts
 *  `primaryHostname`): `https://<routingSlug>.<primaryHostname><path>`, or
 *  `https://<primaryHostname><path>` for the apex. Null for a bad routing slug. Pure. */
declare function primaryHostnameUrlOf(primaryHostname: string, target: {
  routingSlug?: string | null;
  path?: string;
}): URL | null;
/** THE PUBLIC URL of `routingSlug` (null ⇒ the apex) at `path` in `project` — the one rule behind
 *  `itx.url` and `itx.whoami().projectUrl`: on the project's `primaryHostname` when it has one
 *  (`primaryHostnameUrlOf`), else under the deployment's ingress (`projectUrlOf`). Null as those
 *  answer null. Pure. */
declare function projectPublicUrlOf(routing: IngressRouting, platformOrigin: string, target: {
  project: string;
  primaryHostname: string | null;
  routingSlug?: string | null;
  path?: string;
}): URL | null;
//#endregion
export { ROUTING_SLUG as a, projectAddressOf as c, projectWildcardHostOf as d, ProjectAddress as i, projectPublicUrlOf as l, ITERATE_ROUTING_SLUG_HEADER as n, customHostnameCandidatesOf as o, IngressRouting as r, primaryHostnameUrlOf as s, ITERATE_BASE_PATH_HEADER as t, projectUrlOf as u };
//# sourceMappingURL=project-ingress-C6lQ6Jyp.d.mts.map