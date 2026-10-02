import { z } from "zod";
//#region src/app-config.ts
/** Parse `schema` out of `env` (a worker env, or any record — only `APP_CONFIG` and the
*  `APP_CONFIG_*` keys are read; a blank one is unset). Pure. A malformed field throws naming
*  itself in both spellings (`fieldNameOf`); a key the schema does not name is warned about, named
*  the same way, and dropped. Unknown keys are tolerated because parallel branches add Doppler
*  keys; a key one branch adds must not fail another's deploy — owner decision 2026-09-26. */
function parseAppConfigVars(env, schema) {
	const configEnv = {};
	for (const [key, value] of Object.entries(env)) {
		if (!(key === "APP_CONFIG" || key.startsWith("APP_CONFIG_"))) continue;
		if (typeof value !== "string" || !value.trim()) continue;
		configEnv[key] = value;
	}
	try {
		const raw = deepMerge(objectOf(configEnv.APP_CONFIG), overridesOf(configEnv));
		warnUnknownKeys(raw, schema, []);
		return schema.parse(raw);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const issue = error.issues[0];
			throw new Error(`${fieldNameOf(issue.path)}: ${issue.message}`);
		}
		throw error;
	}
}
/** Where a field came from, for a message: its path in the object and its var spelling —
*  `APP_CONFIG urls.os (APP_CONFIG_URLS__OS)`. */
function fieldNameOf(path) {
	return `APP_CONFIG ${path.map(String).join(".")} (${envVarNameOf(path)})`;
}
/** An HTTP(S) origin with no path or query — `new URL(v).origin === v`. */
const httpOrigin = z.string().trim().refine((value) => {
	if (!URL.canParse(value)) return false;
	const url = new URL(value);
	return url.origin === value && (url.protocol === "https:" || url.protocol === "http:");
}, "expected an HTTP(S) origin without a path");
/** An origin a deployment may leave out (blank ⇒ the field's documented default). */
const optionalOrigin = z.union([z.literal(""), httpOrigin]).default("");
/** A DNS name: lowercase labels, no scheme, no trailing dot, no wildcard — the wildcard is implied. */
const dnsName = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*$/, "expected a DNS name");
/** The override var a schema path answers to — `["urls", "os"]` → `APP_CONFIG_URLS__OS` — the inverse
*  of `overridesOf`, so a message names both spellings a human might have used. */
function envVarNameOf(path) {
	return `APP_CONFIG_${path.map((segment) => String(segment).replace(/([A-Z])/g, "_$1").toUpperCase()).join("__")}`;
}
/** Warn, loudly, once per key, about a key the schema does not name — in the object or an
*  `APP_CONFIG_*` override, checked once on the merged config; the schema's parse then drops it.
*  Walks the plain objects only; a record accepts any key. */
function warnUnknownKeys(raw, schema, path) {
	const object = z.record(z.string(), z.unknown()).safeParse(raw);
	if (!object.success) return;
	let current = schema;
	while (current instanceof z.ZodDefault || current instanceof z.ZodPrefault || current instanceof z.ZodOptional) current = current.unwrap();
	if (!(current instanceof z.ZodObject)) return;
	for (const [key, value] of Object.entries(object.data)) {
		const child = current.shape[key];
		if (!child) {
			console.warn(`${fieldNameOf([...path, key])}: not in the schema, ignored — remove it, or add it to the schema`);
			continue;
		}
		warnUnknownKeys(value, child, [...path, key]);
	}
}
function isPlainObject(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
/** The `APP_CONFIG` object itself; blank ⇒ `{}`. */
function objectOf(appConfig) {
	if (!appConfig?.trim()) return {};
	let parsed;
	try {
		parsed = JSON.parse(appConfig);
	} catch (error) {
		throw new Error("APP_CONFIG must be valid JSON", { cause: error });
	}
	if (!isPlainObject(parsed)) throw new Error("APP_CONFIG must be a JSON object");
	return parsed;
}
/** The `APP_CONFIG_*` overrides as one nested object: `__` separates path segments and each
*  segment's SNAKE_CASE becomes camelCase (`APP_CONFIG_LOGIN__EMAIL_CODE__FROM` → `login.emailCode.from`).
*  A value that reads as JSON (`true`, `false`, `null`, an object, an array, a quoted string) is
*  parsed; anything else is the string itself. */
function overridesOf(configEnv) {
	const overrides = {};
	for (const [key, value] of Object.entries(configEnv)) {
		if (!key.startsWith("APP_CONFIG_")) continue;
		const path = key.slice(11).split("__").map((segment) => segment.toLowerCase().split("_").filter(Boolean).map((word, index) => index === 0 ? word : word[0].toUpperCase() + word.slice(1)).join("")).filter(Boolean);
		const last = path.pop();
		if (!last) continue;
		let target = overrides;
		for (const segment of path) {
			const existing = target[segment];
			const next = isPlainObject(existing) ? existing : {};
			target[segment] = next;
			target = next;
		}
		target[last] = overrideValueOf(value);
	}
	return overrides;
}
function overrideValueOf(value) {
	const trimmed = value.trim();
	if (!([
		"true",
		"false",
		"null"
	].includes(trimmed) || trimmed.startsWith("{") || trimmed.startsWith("[") || trimmed.startsWith("\"") && trimmed.endsWith("\""))) return value;
	try {
		return JSON.parse(trimmed);
	} catch {
		return value;
	}
}
/** `overrides` over `base`, plain objects merged key by key; anything else replaced whole. */
function deepMerge(base, overrides) {
	const merged = { ...base };
	for (const [key, value] of Object.entries(overrides)) {
		const existing = merged[key];
		merged[key] = isPlainObject(existing) && isPlainObject(value) ? deepMerge(existing, value) : value;
	}
	return merged;
}
//#endregion
export { dnsName, fieldNameOf, httpOrigin, optionalOrigin, parseAppConfigVars };

//# sourceMappingURL=app-config.mjs.map