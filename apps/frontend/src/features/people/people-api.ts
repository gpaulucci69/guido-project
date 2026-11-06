import type {
  AdministrableIdentity,
  PeopleCreate,
  PeopleType,
  PeopleUpdate,
} from "../../../../../packages/contracts/people.js";
import { accessToken } from "../../auth/session";
import { createApiClient } from "../../lib/api/client";

const api = createApiClient({
  baseUrl: `${window.location.protocol}//${window.location.hostname}:3001/api/v1`,
  getToken: accessToken,
});

export function peopleRoute(type: PeopleType): string {
  return type === "client" ? "/home/client/list" : "/home/users/list";
}

export async function listPeople(
  type: PeopleType,
): Promise<AdministrableIdentity[]> {
  return (await api<{ items: AdministrableIdentity[] }>(`/people?type=${type}`))
    .items;
}

export async function createPerson(
  input: PeopleCreate,
): Promise<AdministrableIdentity> {
  return api<AdministrableIdentity>("/people", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updatePerson(
  id: string,
  type: PeopleType,
  input: PeopleUpdate,
): Promise<AdministrableIdentity> {
  return api<AdministrableIdentity>(
    `/people/${encodeURIComponent(id)}?type=${type}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export async function updatePersonStatus(
  id: string,
  type: PeopleType,
  enabled: boolean,
): Promise<AdministrableIdentity> {
  return updatePerson(id, type, { enabled });
}
