//#region src/project-ingress.ts
/** THE ROUTING SLUG a project host named (`notes` for `notes--<project>.<hostname>`), as the project's
*  config worker `fetch` reads it; absent on the apex. Written only by the platform: the edge sets or
*  deletes it on every project-host request, and the context DO deletes it from every other
*  expression fetch, so neither a visitor nor loaded code can pick a routing slug. */
const ITERATE_ROUTING_SLUG_HEADER = "x-iterate-routing-slug";
/** THE BASE PATH a project host is served under (`ProjectAddress.basePath`, under paths
*  `/projects/<project>[/<routingSlug>]`): the edge strips it from the URL the config worker sees
*  and says it here, so a site composes the paths the browser addresses (packages/notes base-path.ts).
*  Set or deleted by the edge on every project request, so a visitor's spelling never reaches the
*  project. Absent under subdomains, where each routing slug owns its origin. */
const ITERATE_BASE_PATH_HEADER = "x-iterate-base-path";
/** A DNS label: lowercase letters and digits, single hyphens inside. */
const DNS_LABEL = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** A ROUTING SLUG: a DNS label starting with a letter. It is a convenience: the one address
*  component both ingress modes can express. Paths routing shares one host, so there it is the
*  `/projects/<project>/<routingSlug>` segment; subdomains make it `<routingSlug>--<project>` or
*  `<routingSlug>.<custom hostname>`. If paths routing is removed, the routing slug,
*  `x-iterate-routing-slug` and the `--` host form can be deleted, and a project's code matches
*  hostnames directly. */
const ROUTING_SLUG = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
/** The ONE label `host` has under `hostname` — `site--p.iterate.app` ⇒ `site--p` — lowercased, a
*  trailing dot (a fully-qualified Host, `site--p.base.`) dropped; null when `host` is not under
*  `hostname`, or is more than one label under it: a project host is one label, the one level a
*  wildcard certificate covers. */
function labelUnder(host, hostname) {
	const name = host.toLowerCase().replace(/\.$/, "");
	const suffix = `.${hostname.toLowerCase()}`;
	const label = name.endsWith(suffix) ? name.slice(0, -suffix.length) : null;
	return label?.includes(".") ? null : label;
}
/** The project + routing slug `url` names under `routing`, or null when it names none. Pure. */
function projectAddressOf(routing, url, platformOrigin) {
	if (!routing) return null;
	if (routing.type === "subdomains") {
		const label = labelUnder(url.hostname, routing.hostname);
		if (!label) return null;
		const separator = label.startsWith("xn--") ? -1 : label.indexOf("--");
		const [routingSlug, project] = separator === -1 ? [null, label] : [label.slice(0, separator), label.slice(separator + 2)];
		if (!DNS_LABEL.test(project) || routingSlug !== null && !ROUTING_SLUG.test(routingSlug)) return null;
		return {
			routingSlug,
			project,
			basePath: ""
		};
	}
	if (url.origin !== new URL(platformOrigin).origin) return null;
	const [, prefix, project = "", routingSlug] = url.pathname.split("/");
	if (prefix !== "projects" || !DNS_LABEL.test(project)) return null;
	if (routingSlug === void 0 || routingSlug === "") return {
		routingSlug: null,
		project,
		basePath: `/projects/${project}`
	};
	if (!ROUTING_SLUG.test(routingSlug)) return null;
	return {
		routingSlug,
		project,
		basePath: `/projects/${project}/${routingSlug}`
	};
}
/** A PROJECT WILDCARD — an owned zone served as one project's apex (core/os
*  `urls.projectWildcard`, `{ hostname: "iterate.com", project: "iterate" }`): the zone's apex and
*  every first-level name under it but the excluded ones, in the apex shape, `routingSlug: null`, so the
*  project's config worker `fetch` answers exactly as it does on `<project>.<hostname>`. Null for
*  anything else. Case and a trailing dot are forgiven. Pure. */
function projectWildcardHostOf(hostname, wildcard) {
	if (!wildcard) return null;
	const normalized = hostname.toLowerCase().replace(/\.$/, "");
	if (wildcard.excludedHostnames?.includes(normalized)) return null;
	return normalized === wildcard.hostname || labelUnder(normalized, wildcard.hostname) ? {
		routingSlug: null,
		project: wildcard.project
	} : null;
}
/** A PROJECT'S OWN HOSTNAME — `iterate.example.com`, added by the project (core/os
*  project/custom-hostnames.ts) — is that project's apex, and one label under it names a routing
*  slug: `notes.iterate.example.com` carries `notes`, as `notes--<project>.<hostname>` does. The
*  hostnames a request's host could be a project's own hostname for, most specific first: the host
*  itself (the apex), then its parent with the first label as the routing slug. The caller
*  looks them up in that order; the first a project holds wins. Case and a trailing dot are
*  forgiven. Pure. */
function customHostnameCandidatesOf(host) {
	const hostname = host.toLowerCase().replace(/\.$/, "");
	const dot = hostname.indexOf(".");
	const [routingSlug, parent] = [hostname.slice(0, dot), hostname.slice(dot + 1)];
	return [{
		hostname,
		routingSlug: null
	}, ...dot > 0 && parent.includes(".") && ROUTING_SLUG.test(routingSlug) ? [{
		hostname: parent,
		routingSlug
	}] : []];
}
/** The URL of `routingSlug` (null ⇒ the apex) in `project` under `routing`, at `path` (default "/",
*  must start with "/"). Null when there is no ingress, or when the result would not parse back to
*  the same address (a bad slug; a `path` that climbs out of its routing slug). subdomains: the
*  protocol and port are `platformOrigin`'s (local dev is `http://localhost:8788`, so
*  `http://<routingSlug>--<project>.localhost:8788/…`); paths:
*  `<platformOrigin>/projects/<project>[/<routingSlug>]<path>`. Pure. */
function projectUrlOf(routing, platformOrigin, target) {
	if (!routing) return null;
	const path = target.path || "/";
	if (!path.startsWith("/")) throw new Error(`projectUrlOf: path must start with "/": ${path}`);
	const routingSlug = target.routingSlug || null;
	const origin = new URL(platformOrigin);
	const url = routing.type === "subdomains" ? new URL(path, `${origin.protocol}//${routingSlug ? `${routingSlug}--` : ""}${target.project}.${routing.hostname}${origin.port ? `:${origin.port}` : ""}`) : new URL(`/projects/${target.project}${routingSlug ? `/${routingSlug}` : ""}${path}`, origin.origin);
	const parsed = projectAddressOf(routing, url, platformOrigin);
	return parsed && parsed.project === target.project && parsed.routingSlug === routingSlug ? url : null;
}
/** The URL of `routingSlug` (null ⇒ the apex) at `path` (default "/", must start with "/") on a
*  project's PRIMARY HOSTNAME, one of its own live hostnames (core/os project/contract.ts
*  `primaryHostname`): `https://<routingSlug>.<primaryHostname><path>`, or
*  `https://<primaryHostname><path>` for the apex. Null for a bad routing slug. Pure. */
function primaryHostnameUrlOf(primaryHostname, target) {
	const path = target.path || "/";
	if (!path.startsWith("/")) throw new Error(`primaryHostnameUrlOf: path must start with "/": ${path}`);
	const routingSlug = target.routingSlug || null;
	if (routingSlug && !ROUTING_SLUG.test(routingSlug)) return null;
	const hostname = `${routingSlug ? `${routingSlug}.` : ""}${primaryHostname}`;
	const url = new URL(`https://${hostname}${path}`);
	return url.hostname === hostname ? url : null;
}
/** THE PUBLIC URL of `routingSlug` (null ⇒ the apex) at `path` in `project` — the one rule behind
*  `itx.url` and `itx.whoami().projectUrl`: on the project's `primaryHostname` when it has one
*  (`primaryHostnameUrlOf`), else under the deployment's ingress (`projectUrlOf`). Null as those
*  answer null. Pure. */
function projectPublicUrlOf(routing, platformOrigin, target) {
	return target.primaryHostname ? primaryHostnameUrlOf(target.primaryHostname, target) : projectUrlOf(routing, platformOrigin, target);
}
//#endregion
export { ITERATE_BASE_PATH_HEADER, ITERATE_ROUTING_SLUG_HEADER, ROUTING_SLUG, customHostnameCandidatesOf, primaryHostnameUrlOf, projectAddressOf, projectPublicUrlOf, projectUrlOf, projectWildcardHostOf };

//# sourceMappingURL=project-ingress.mjs.map