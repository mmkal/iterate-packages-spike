import { z } from "zod";
//#region src/oauth-scopes.ts
/** The platform's OAuth scopes — what an app may ask for and what a consent grants:
*   - `iterate`             — reach the projects the person grants (every app; implied, always granted)
*   - `account`             — manage the person's sessions and personal access tokens
*   - `organizations:write` — the person's organizations: list every one they belong to, create new ones
*   - `admin`               — operate the platform: every project and person. Granted only to an
*                             email the deployment's `admins` lists (core/os consent.ts), and only
*                             while it lists it (oauth.ts). Signing a client in as someone else is
*                             no scope: the issuer offers it to a listed admin at consent
*  Consent is task-based (the shape Cloudflare's own OAuth consent took in August 2026: a client
*  requests a set, the person may deselect the optional ones, the token carries what was granted):
*  `iterate` is required, every other requested scope is optional on the consent page, and an app
*  reads the granted set from `session.info().scopes` rather than assuming its request. */
const OAuthScope = z.enum([
	"iterate",
	"account",
	"organizations:write",
	"admin"
]);
const OAuthScopes = z.array(OAuthScope).transform((scopes) => [.../* @__PURE__ */ new Set(["iterate", ...scopes])]);
/** What each scope means to the person — the consent page's copy, sent with `consent.describe` so
*  the page renders what it is given: a scope added to `OAuthScope` is described here or it does
*  not compile. */
const OAuthScopeDescriptions = {
	iterate: {
		title: "Read and make changes in the projects you grant it",
		note: "Required — what the app is for.",
		required: true
	},
	account: {
		title: "See and end your sessions, and mint personal access tokens",
		note: "Optional.",
		required: false
	},
	"organizations:write": {
		title: "See all your organizations and create new ones",
		note: "Optional.",
		required: false
	},
	admin: {
		title: "Operate this platform: every project and every person",
		note: "Optional. For platform admins; ends 12 hours after you allow it.",
		required: false
	}
};
//#endregion
export { OAuthScope, OAuthScopeDescriptions, OAuthScopes };

//# sourceMappingURL=oauth-scopes.mjs.map