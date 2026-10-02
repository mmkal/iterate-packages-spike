import { z } from "zod";
//#region src/oauth-scopes.d.ts
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
declare const OAuthScope: z.ZodEnum<{
  account: "account";
  admin: "admin";
  iterate: "iterate";
  "organizations:write": "organizations:write";
}>;
type OAuthScope = z.infer<typeof OAuthScope>;
declare const OAuthScopes: z.ZodPipe<z.ZodArray<z.ZodEnum<{
  account: "account";
  admin: "admin";
  iterate: "iterate";
  "organizations:write": "organizations:write";
}>>, z.ZodTransform<string[], ("account" | "admin" | "iterate" | "organizations:write")[]>>;
/** A requested scope as the consent page shows it: its name, what it means to the person, and
 *  whether they may untick it (`iterate` never). */
interface ConsentScope {
  name: OAuthScope;
  title: string;
  note: string;
  required: boolean;
}
/** What each scope means to the person — the consent page's copy, sent with `consent.describe` so
 *  the page renders what it is given: a scope added to `OAuthScope` is described here or it does
 *  not compile. */
declare const OAuthScopeDescriptions: Record<OAuthScope, Omit<ConsentScope, "name">>;
//#endregion
export { OAuthScopes as i, OAuthScope as n, OAuthScopeDescriptions as r, ConsentScope as t };
//# sourceMappingURL=oauth-scopes-C39GcUVJ.d.mts.map