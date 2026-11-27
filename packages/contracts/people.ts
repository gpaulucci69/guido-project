export type PeopleType = "client" | "user";
export type PeopleGroup = "associates" | "users";

export const associatesPermission = "/home/contributors/list";
export const usersPermission = "/home/users/list";

export type AdministrableIdentity = {
  id: string;
  type: PeopleType;
  firstName: string;
  lastName: string;
  alias: string;
  email: string;
  lastLoginAt?: string;
  enabled: boolean;
  username: string;
  clientRole?: string;
  clientRoles?: string[];
  startDate?: string;
  birthDate?: string;
  avatar?: string;
  avatarUrl?: string;
};

export function isAssociateRole(role: string): boolean {
  const name = role.trim().toUpperCase();
  return name === "COLABORADOR" || name === "ASOCIADO";
}

export function personRoles(person: AdministrableIdentity): readonly string[] {
  return person.clientRoles ?? (person.clientRole ? [person.clientRole] : []);
}

export function belongsToPeopleGroup(
  person: AdministrableIdentity,
  group: PeopleGroup,
): boolean {
  const roles = personRoles(person);
  return (
    roles.some((role) => role.trim()) &&
    roles.some(isAssociateRole) === (group === "associates")
  );
}

export type PeopleCreate = {
  type: PeopleType;
  firstName: string;
  lastName: string;
  alias?: string;
  email: string;
  clientRole?: string;
  startDate?: string;
  birthDate?: string;
};

export type PeopleUpdate = {
  firstName?: string;
  lastName?: string;
  alias?: string;
  email?: string;
  enabled?: boolean;
  clientRole?: string;
  startDate?: string;
  birthDate?: string;
  avatar?: { filename: string; mimeType: string; bytes: Uint8Array };
};
