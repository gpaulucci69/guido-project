import type {
  AdministrableIdentity,
  PeopleCreate,
  PeopleType,
  PeopleUpdate,
} from "../../../../packages/contracts/people.js";

type KeycloakUser = {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  enabled?: boolean;
  attributes?: Record<string, string[] | undefined>;
  [key: string]: unknown;
};
type PeopleCreateInput = PeopleCreate & { clientId: string };

export class KeycloakAdminAdapter {
  private readonly base = process.env.KEYCLOAK_URL ?? "http://localhost:8080";
  private readonly realm = process.env.OIDC_REALM ?? "saas-contable";

  private async token(): Promise<string> {
    const body = new URLSearchParams({
      client_id: "admin-cli",
      grant_type: "password",
      username: process.env.KEYCLOAK_ADMIN_USERNAME ?? "admin",
      password: process.env.KEYCLOAK_ADMIN_PASSWORD ?? "admin",
    });
    const response = await fetch(
      `${this.base}/realms/master/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      },
    );
    if (!response.ok) throw new Error("Keycloak no disponible.");
    return String(
      ((await response.json()) as { access_token?: unknown }).access_token ??
        "",
    );
  }

  private async request(path: string, init: RequestInit = {}) {
    const token = await this.token();
    return fetch(`${this.base}/admin/realms/${this.realm}${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        ...init.headers,
      },
    });
  }

  private map(
    user: KeycloakUser,
  ): (AdministrableIdentity & { clientId: string }) | null {
    const type = user.attributes?.type?.[0];
    if (type !== "client" && type !== "user") return null;
    return {
      id: String(user.id ?? ""),
      username: String(user.username ?? ""),
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      alias: user.attributes?.alias?.[0] ?? "",
      email: user.email ?? "",
      enabled: user.enabled !== false,
      type,
      clientId: user.attributes?.client_id?.[0] ?? "",
    };
  }

  async list(
    type: PeopleType,
    clientId: string,
  ): Promise<AdministrableIdentity[]> {
    const response = await this.request("/users?max=1000");
    if (!response.ok)
      throw new Error("No se pudieron consultar las identidades en Keycloak.");
    return ((await response.json()) as KeycloakUser[])
      .map((user) => this.map(user))
      .filter(
        (user): user is AdministrableIdentity & { clientId: string } =>
          user?.type === type && user.clientId === clientId,
      )
      .map(({ clientId: _clientId, ...identity }) => identity);
  }

  async get(id: string): Promise<{
    raw: KeycloakUser;
    identity: AdministrableIdentity;
    clientId: string;
  }> {
    const response = await this.request(`/users/${encodeURIComponent(id)}`);
    if (response.status === 404) throw new Error("Identidad no encontrada.");
    if (!response.ok)
      throw new Error("No se pudo consultar la identidad en Keycloak.");
    const raw = (await response.json()) as KeycloakUser;
    const identity = this.map(raw);
    if (!identity)
      throw new Error("La identidad no tiene un tipo administrable.");
    return { raw, identity, clientId: raw.attributes?.client_id?.[0] ?? "" };
  }

  async create(input: PeopleCreateInput): Promise<AdministrableIdentity> {
    const attributes = {
      type: [input.type],
      client_id: [input.clientId],
      alias: [input.alias ?? ""],
    };
    const response = await this.request("/users", {
      method: "POST",
      body: JSON.stringify({
        username: input.email,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        enabled: true,
        attributes,
      }),
    });
    if (response.status === 409)
      throw new Error("Ya existe una identidad con ese email.");
    if (!response.ok)
      throw new Error("No se pudo crear la identidad en Keycloak.");
    const location = response.headers.get("location");
    if (!location) throw new Error("Keycloak no devolvió la identidad creada.");
    return (await this.get(location.split("/").pop() ?? "")).identity;
  }

  async update(
    id: string,
    input: PeopleUpdate,
  ): Promise<AdministrableIdentity> {
    const current = await this.get(id);
    const attributes = {
      ...(current.raw.attributes ?? {}),
      type: [current.identity.type],
      alias: [input.alias ?? current.identity.alias],
    };
    const response = await this.request(`/users/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({
        ...current.raw,
        firstName: input.firstName ?? current.identity.firstName,
        lastName: input.lastName ?? current.identity.lastName,
        email: input.email ?? current.identity.email,
        enabled: input.enabled ?? current.identity.enabled,
        attributes,
      }),
    });
    if (response.status === 409)
      throw new Error("Ya existe una identidad con ese email.");
    if (!response.ok)
      throw new Error("No se pudo actualizar la identidad en Keycloak.");
    return (await this.get(id)).identity;
  }

  async delete(id: string): Promise<void> {
    const response = await this.request(`/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (response.status === 404) throw new Error("Identidad no encontrada.");
    if (!response.ok)
      throw new Error("No se pudo eliminar la identidad en Keycloak.");
  }
}
