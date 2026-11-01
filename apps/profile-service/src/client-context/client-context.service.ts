import type { ClientContext } from "../../../../packages/contracts/navigation.js";

export type ClientContextIdentity = { tenantId: string; clientId: string };

export class ClientContextService {
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
    if (!response.ok) throw new Error("Keycloak no disponible.");
    return String(
      ((await response.json()) as { access_token?: unknown }).access_token ??
        "",
    );
  }

  async get(identity: ClientContextIdentity): Promise<ClientContext> {
    const token = await this.adminToken();
    const response = await fetch(
      `${this.base}/admin/realms/${this.realm}/clients?clientId=${encodeURIComponent(identity.clientId)}`,
      { headers: { authorization: `Bearer ${token}` } },
    );
    if (!response.ok)
      throw new Error("No se pudo resolver el cliente Keycloak.");
    const clients = (await response.json()) as Array<{
      clientId?: string;
      name?: string;
      description?: string;
      attributes?: Record<string, string | undefined>;
    }>;
    const client = clients.find(
      (candidate) => candidate.clientId === identity.clientId,
    );
    if (!client) throw new Error("Cliente Keycloak no encontrado.");
    return {
      clientId: identity.clientId,
      name: client.name?.trim() || identity.clientId,
      description: client.description?.trim() || "",
      logoUrl: client.attributes?.logoUri?.trim() || "",
      tenantId: identity.tenantId,
    };
  }
}
