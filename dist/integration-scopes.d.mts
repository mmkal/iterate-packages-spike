//#region src/integration-scopes.d.ts
/** The scopes `asked` that `granted` does not hold, in the order asked — none means the account is
 *  connected at once, any means an incremental consent on the person's own connection first. Google
 *  spells `email` and `profile` two ways; every other scope is compared as written. */
export declare function missingScopes(provider: string, granted: readonly string[], asked: readonly string[]): string[];
//#endregion
//# sourceMappingURL=integration-scopes.d.mts.map