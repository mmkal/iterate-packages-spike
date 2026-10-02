import { RpcStub } from "@iterate-com/capnweb";
//#region src/index.d.ts
/** One pet in the shop's catalogue. */
export type Pet = {
  id: string;
  name: string;
  species: string;
};
/** The shop's capnweb API for one authenticated account. */
export interface PetshopApi {
  /** The account's pets, and whose they are. */
  listPets(): {
    owner: string;
    pets: Pet[];
  };
  /** One pet by id; an unknown id throws. */
  getPet(id: string): Pet;
  /** Add a pet to the account. */
  createPet(input: {
    name: string;
    species: string;
  }): Pet;
}
/** The deployed pet shop. */
export declare const PETSHOP_BASE_URL = "https://dummy-petshop.iterate.workers.dev";
/**
 * The shop's API for the account `token` belongs to, as one capnweb HTTP batch: every call made
 * before the first `await` rides one request (`api.listPets()` and `api.getPet("pet-1")` together
 * cost one round trip). A batch serves one round of calls, so connect again for the next.
 */
export declare function connectPetshop(options: {
  token: string;
  baseUrl?: string;
}): RpcStub<PetshopApi>;
//#endregion