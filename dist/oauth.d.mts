import * as oauth from "oauth4webapi";
//#region src/client/oauth.d.ts
/** The platform's issuer as oauth4webapi's authorization server: its endpoints under `/oauth2`, and
 *  the `iss` it adds to every authorization response (RFC 9207), which `validateAuthResponse` then
 *  requires. The same description for an app's browser session and the CLI. */
export declare function authorizationServer(issuer: string): oauth.AuthorizationServer;
/** The same code/PKCE parameters for browser login and a console-minted token. */
export declare function authorizationCodeRequest(input: {
  issuer: string;
  clientId: string;
  redirectUri: string;
  resources: string[];
  scopes?: string[];
}): Promise<{
  url: URL;
  state: string;
  verifier: string;
}>;
//#endregion
//# sourceMappingURL=oauth.d.mts.map