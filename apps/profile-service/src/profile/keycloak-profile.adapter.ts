import type {
  ProfileUpdate,
  UserProfile,
} from "../../../../packages/contracts/profile.js";

export interface KeycloakProfileAdapter {
  get(sub: string): Promise<UserProfile>;
  update(
    sub: string,
    update: Omit<ProfileUpdate, "avatar"> & { avatar?: string },
  ): Promise<UserProfile>;
  updatePassword?(sub: string, password: string): Promise<void>;
}

export class HttpKeycloakProfileAdapter implements KeycloakProfileAdapter {
  private readonly base = process.env.KEYCLOAK_URL ?? "http://localhost:8080";
  private readonly realm = process.env.OIDC_REALM ?? "saas-contable";
  private async adminToken(): Promise<string> {
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
    if (!response.ok)
      throw new Error("No se pudo autenticar el adaptador de Keycloak.");
    return String(
      ((await response.json()) as { access_token?: unknown }).access_token ??
        "",
    );
  }
  private async request(
    sub: string,
    init: RequestInit = {},
  ): Promise<Response> {
    const token = await this.adminToken();
    return fetch(
      `${this.base}/admin/realms/${this.realm}/users/${encodeURIComponent(sub)}`,
      {
        ...init,
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
          ...init.headers,
        },
      },
    );
  }
  async get(sub: string): Promise<UserProfile> {
    const user = await this.readUser(sub);
    return this.toProfile(user, sub);
  }

  private async readUser(sub: string) {
    const response = await this.request(sub);
    if (!response.ok)
      throw new Error("No se pudo consultar el perfil en Keycloak.");
    return (await response.json()) as {
      id?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      emailVerified?: boolean;
      enabled?: boolean;
      attributes?: Record<string, string[] | undefined>;
      [key: string]: unknown;
    };
  }

  private toProfile(
    user: {
      id?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      attributes?: Record<string, string[] | undefined>;
    },
    sub: string,
  ): UserProfile {
    const attr = user.attributes ?? {};
    return {
      sub: user.id ?? sub,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      alias: attr.alias?.[0] ?? "",
      avatar: attr.avatar?.[0] ?? null,
      avatarUrl: null,
      ...(user.email ? { email: user.email } : {}),
    };
  }
  async update(
    sub: string,
    update: Omit<ProfileUpdate, "avatar"> & { avatar?: string },
  ): Promise<UserProfile> {
    const currentUser = await this.readUser(sub);
    const current = this.toProfile(currentUser, sub);
    const attributes: Record<string, string[]> = Object.fromEntries(
      Object.entries(currentUser.attributes ?? {}).filter(
        (entry): entry is [string, string[]] => Array.isArray(entry[1]),
      ),
    );
    attributes.alias = [update.alias ?? current.alias];
    if (update.avatar) attributes.avatar = [update.avatar];
    const response = await this.request(sub, {
      method: "PUT",
      body: JSON.stringify({
        ...currentUser,
        firstName: update.firstName ?? current.firstName,
        lastName: update.lastName ?? current.lastName,
        email: currentUser.email ?? "",
        emailVerified: currentUser.emailVerified ?? false,
        attributes,
      }),
    });
    if (!response.ok)
      throw new Error("No se pudo actualizar el perfil en Keycloak.");
    return {
      ...current,
      firstName: update.firstName ?? current.firstName,
      lastName: update.lastName ?? current.lastName,
      alias: update.alias ?? current.alias,
      avatar: update.avatar ?? current.avatar,
      ...(current.email ? { email: current.email } : {}),
    };
  }

  async updatePassword(sub: string, password: string): Promise<void> {
    const token = await this.adminToken();
    const response = await fetch(
      `${this.base}/admin/realms/${this.realm}/users/${encodeURIComponent(sub)}/reset-password`,
      {
      method: "PUT",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ type: "password", value: password, temporary: false }),
      },
    );
    if (!response.ok) throw new Error("No se pudo actualizar la clave en Keycloak.");
  }
}
