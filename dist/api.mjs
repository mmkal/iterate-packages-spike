//#region src/api.ts
/** EVERY PROVIDER AN INTEGRATION CONNECTS, spelled once: a connection to one is the log
*  `/integrations/<provider>/<connection>` and the secret `/secrets/<provider>-<connection>`. The
*  kinds below are read off it. */
const INTEGRATION_PROVIDERS = [
	"slack",
	"google",
	"cloudflare",
	"github",
	"x"
];
/** Each provider's name as a person reads it, wherever a page or a message names one. */
const INTEGRATION_PROVIDER_NAMES = {
	slack: "Slack",
	google: "Google",
	cloudflare: "Cloudflare",
	github: "GitHub",
	x: "X"
};
//#endregion
export { INTEGRATION_PROVIDERS, INTEGRATION_PROVIDER_NAMES };

//# sourceMappingURL=api.mjs.map