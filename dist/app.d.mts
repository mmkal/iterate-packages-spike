import { N as IterateSessionApi } from "./api-DYAY3SD8.mjs";
import { RpcStub } from "capnweb";
//#region src/app.d.ts
/** What `authenticate` resolves to: the session as a capnweb stub (pipelined; disposable) and the
 *  bootstrap info it answered with. Declared, so the package's declarations stay serializable. */
export type AuthenticatedApp = {
  api: RpcStub<IterateSessionApi>;
  info: ReturnType<IterateSessionApi["info"]>;
  /** The page names a project this sign-in does not include — its `/projects/<ref>` is absent from
   *  `api.projects.list()`: leave for `/.auth/login`, whose page offers to sign in again (the
   *  project ticked at consent, or another account) and returns to this very URL. Never settles,
   *  like `authenticate`'s own leave for login. */
  signInFor(project: string): Promise<never>;
};
export type IterateClient = {
  authenticate(next?: string): Promise<AuthenticatedApp>;
};
/** Create once per app — a TanStack route's client-only `beforeLoad`, or a plain page's entry.
 *  Every loader and action of the page shares the returned public RPC session.
 *
 *  Connecting tries for a while (client/socket.ts: ≈16 s of attempts) before an error reaches the
 *  page — a phone waking up or a flapping tunnel is not a reason to show "connection failed". And
 *  the `api` the page holds is a proxy to the CURRENT connection: when the socket closes, the next
 *  call opens a fresh one and pipelines onto it, so a dropped connection costs a reconnect, not the
 *  page. A reconnect the platform refuses (the session ended elsewhere) rejects that call; the
 *  page's retry runs `authenticate` again — a fresh one, the socket's close forgot the last — whose
 *  probe sends the browser to log in. */
export declare function createIterateClient(options?: {
  scopes?: string[];
}): IterateClient;
//#endregion
//# sourceMappingURL=app.d.mts.map