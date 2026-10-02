//#region src/principal.d.ts
/** Who is acting: a stable actor id (the control plane's user id) and, when known, an email. A
 *  platform admin signed in as someone else is two people (RFC 8693's subject and actor): the
 *  principal is the person, whose access every check reads, and `impersonatedBy` the admin doing
 *  it, stamped beside them on every event. */
type Principal = {
  actor: string;
  email?: string;
  impersonatedBy?: {
    actor: string;
    email: string;
  };
};
/** The header the edge sets on a Request it forwards on a principal's behalf — the ingress after
 *  the cookie check, a session's terminal `fetch` — and strips from every inbound Request. */
declare const ITX_PRINCIPAL_HEADER = "x-itx-principal";
//#endregion
export { Principal as n, ITX_PRINCIPAL_HEADER as t };
//# sourceMappingURL=principal-Blyp_-YV.d.mts.map