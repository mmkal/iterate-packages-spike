import { BrowserHost, BrowserSession } from "./app-session.mjs";
//#region src/app-server.d.ts
/** The port separates local apps sharing localhost's cookie jar. */
export declare function sessionCookieName(url: URL): string;
export declare function appSession(namespace: DurableObjectNamespace<BrowserSession>, request: Request): DurableObjectStub<BrowserSession> | null;
/** Start one ordinary app session; the caller publishes its cookie after its own
 * sign-in step succeeds. The issuer uses this same code/PKCE flow internally. */
export declare function startAppSession(sessions: DurableObjectNamespace<BrowserSession>, host: BrowserHost, next: string): Promise<{
  session: DurableObjectStub<BrowserSession>;
  location: string;
  setCookie: string;
}>;
/** What an issuer a person names must be: an https ORIGIN (a path or query is dropped, not refused),
 *  not an IP literal, not loopback, and not under one of this deployment's own zones (`denyZones` —
 *  a project host on our wildcard is userspace and could serve a look-alike issuer) — unless it IS
 *  the deployment's default issuer, which is always allowed as it is. Pure: the discovery check that
 *  the origin really answers as that issuer is `issuerAnswersAt`. */
export declare function issuerOriginOf(candidate: string, options: {
  defaultIssuer: string;
  denyZones?: readonly string[];
}): {
  origin: string;
} | {
  error: string;
};
/** The issuer must say it is the issuer: its discovery document's `issuer` equals the origin
 *  exactly. NOTHING else is read from the document — the endpoints stay hand-built from the origin
 *  (app-session.ts: `/oauth2/token`, and `/api` as the resource), so a document can steer nothing.
 *  Null when it answers as expected, else the reason. */
export declare function issuerAnswersAt(origin: string): Promise<string | null>;
type AppAuth = {
  /** Public app branding; relative logo paths resolve against this app's origin. */
  client?: {
    name: string;
    logoUri: string;
  };
  sessions: DurableObjectNamespace<BrowserSession>;
  /** The deployment's own issuer — where a browser with no session signs in. */
  issuer: string;
  /** Its `/api`. */
  resource: string;
  /** What the app asks for when a login names no `scope` (the shell's Switch account and Stop
   *  impersonating): the same list its `createIterateClient({ scopes })` asks for. `iterate` is
   *  always added. */
  scopes?: readonly string[];
  /** Platform dispatches in process to avoid /api recursion; other apps pass fetch. */
  api: (request: Request) => Promise<Response> | Response;
  /** The issuer proves identity before establishing its own ordinary app session. */
  loginPage?: string;
  /** Zones no connectable issuer may live under (`issuerOriginOf`): this deployment's own, whose
   *  project hosts are userspace. The default issuer is exempt. */
  denyZones?: readonly string[];
};
/** The same OAuth client and /api proxy on a platform host or a separate app worker. */
export declare function appAuth(request: Request, config: AppAuth): Promise<Response | null>;
//#endregion
//# sourceMappingURL=app-server.d.mts.map