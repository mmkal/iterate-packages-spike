import { newHttpBatchRpcSession } from "@iterate-com/capnweb";
//#region src/index.ts
/** The deployed pet shop. */
const PETSHOP_BASE_URL = "https://dummy-petshop.iterate.workers.dev";
/**
* The shop's API for the account `token` belongs to, as one capnweb HTTP batch: every call made
* before the first `await` rides one request (`api.listPets()` and `api.getPet("pet-1")` together
* cost one round trip). A batch serves one round of calls, so connect again for the next.
*/
function connectPetshop(options) {
	const baseUrl = (options.baseUrl || "https://dummy-petshop.iterate.workers.dev").replace(/\/$/, "");
	return newHttpBatchRpcSession(new Request(`${baseUrl}/capnweb`, { headers: { Authorization: `Bearer ${options.token}` } }));
}
//#endregion
export { PETSHOP_BASE_URL, connectPetshop };
