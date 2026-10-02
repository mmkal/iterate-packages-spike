import { DurableObject } from "cloudflare:workers";
//#region src/app-session.d.ts
export type BrowserHost = {
  origin: string;
  issuer: string;
  resource: string;
  scopes: string[];
  client?: {
    id?: string;
    name: string;
    logoUri: string;
  };
};
/** Each app binds this same class. Token exchange and logout use the issuer's
 * public protocol, so separately deployed apps need no platform bindings.
 * The input gate serializes refresh and logout across tabs. */
export declare class BrowserSession extends DurableObject {
  #private;
  begin(host: BrowserHost, next: string): Promise<string>;
  /** The issuer's redirect back to `/.auth/callback`, its query string. oauth4webapi validates it
   *  (the state matches this browser's pending flow, the `iss` matches the issuer, no `error`), then
   *  exchanges the code for tokens. */
  complete(callbackQuery: string): Promise<{
    error: string;
    next?: undefined;
  } | {
    error?: undefined;
    next: string;
  }>;
  bearer(): Promise<string | null>;
  /** THE ISSUER THIS SESSION IS BOUND TO and the resource its tokens are for — written once at
   *  `begin`, never steered by a request: the app's `/api` proxy, its login probe and its logout read
   *  them from here, so a browser connected to one issuer can only ever spend its credential there.
   *  Null when no session was begun. */
  host(): Promise<{
    issuer: string;
    resource: string;
  } | null>;
  scopes(): Promise<string[]>;
  /** Public client metadata chosen by the app before consent; never a browser-supplied claim. */
  client(): Promise<{
    id?: string;
    name: string;
    logoUri: string;
  } | undefined>;
  /** A verified 401 means this local credential no longer grants access. */
  discard(): Promise<void>;
  end(): Promise<void>;
  alarm(): Promise<void>;
}
//#endregion
//# sourceMappingURL=app-session.d.mts.map