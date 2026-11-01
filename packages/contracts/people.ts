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
};

export type PeopleCreate = {
  type: PeopleType;
  firstName: string;
  lastName: string;
  alias?: string;
  email: string;
};

export type PeopleUpdate = {
  firstName?: string;
  lastName?: string;
  alias?: string;
  email?: string;
  enabled?: boolean;
};
