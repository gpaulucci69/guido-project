import type {
  AdministrableIdentity,
  PeopleCreate,
  PeopleGroup,
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
export function listClientRoles(
  group: PeopleGroup,
): Promise<{ items: string[] }> {
  return api<{ items: string[] }>(`/people/client-roles?group=${group}`);
}

export async function listPeople(
  type: PeopleType,
  group?: PeopleGroup,
): Promise<AdministrableIdentity[]> {
  const params = new URLSearchParams({ type });
  if (group) params.set("group", group);
  return (await api<{ items: AdministrableIdentity[] }>(`/people?${params}`))
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
  input: Omit<PeopleUpdate, "avatar"> & { avatar?: File },
): Promise<AdministrableIdentity> {
  const { avatar, ...fields } = input;
  if (avatar) {
    const body = new FormData();
    for (const [key, value] of Object.entries(fields))
      if (value !== undefined) body.set(key, String(value));
    body.set("avatar", avatar);
    return api<AdministrableIdentity>(
      `/people/${encodeURIComponent(id)}?type=${type}`,
      { method: "PATCH", body },
    );
  }
  return api<AdministrableIdentity>(
    `/people/${encodeURIComponent(id)}?type=${type}`,
    { method: "PATCH", body: JSON.stringify(fields) },
  );
}

export async function updatePersonStatus(
  id: string,
  type: PeopleType,
  enabled: boolean,
): Promise<AdministrableIdentity> {
  return updatePerson(id, type, { enabled });
}
