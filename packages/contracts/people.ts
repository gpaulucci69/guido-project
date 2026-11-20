export type PeopleType = "client" | "user";

export type AdministrableIdentity = {
  id: string;
  type: PeopleType;
  firstName: string;
  lastName: string;
  alias: string;
  email: string;
  enabled: boolean;
  username: string;
  clientRole?: string;
  startDate?: string;
  birthDate?: string;
  avatar?: string;
  avatarUrl?: string;
};

export type PeopleCreate = {
  type: PeopleType;
  firstName: string;
  lastName: string;
  alias?: string;
  email: string;
  clientRole?: string;
};

export type PeopleUpdate = {
  firstName?: string;
  lastName?: string;
  alias?: string;
  email?: string;
  enabled?: boolean;
  clientRole?: string;
  avatar?: { filename: string; mimeType: string; bytes: Uint8Array };
};
