import { z } from "zod";
//#region src/app-config.d.ts
/** Parse `schema` out of `env` (a worker env, or any record — only `APP_CONFIG` and the
 *  `APP_CONFIG_*` keys are read; a blank one is unset). Pure. A malformed field throws naming
 *  itself in both spellings (`fieldNameOf`); a key the schema does not name is warned about, named
 *  the same way, and dropped. Unknown keys are tolerated because parallel branches add Doppler
 *  keys; a key one branch adds must not fail another's deploy — owner decision 2026-09-26. */
export declare function parseAppConfigVars<Schema extends z.ZodTypeAny>(env: object, schema: Schema): z.output<Schema>;
/** Where a field came from, for a message: its path in the object and its var spelling —
 *  `APP_CONFIG urls.os (APP_CONFIG_URLS__OS)`. */
export declare function fieldNameOf(path: readonly PropertyKey[]): string;
/** An HTTP(S) origin with no path or query — `new URL(v).origin === v`. */
export declare const httpOrigin: z.ZodString;
/** An origin a deployment may leave out (blank ⇒ the field's documented default). */
export declare const optionalOrigin: z.ZodDefault<z.ZodUnion<readonly [z.ZodLiteral<"">, z.ZodString]>>;
/** A DNS name: lowercase labels, no scheme, no trailing dot, no wildcard — the wildcard is implied. */
export declare const dnsName: z.ZodString;
//#endregion
//# sourceMappingURL=app-config.d.mts.map