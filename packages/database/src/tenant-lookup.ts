export type TenantIdentity = {
  id: string;
  clientId: string;
  name?: string;
};

export type TenantLookupDelegate = {
  findUnique(args: {
    where: { clientId: string };
    select: { id: true; clientId: true; name: true };
  }): Promise<TenantIdentity | null>;
};

/** Resolves the external Keycloak client id to the internal PostgreSQL UUID. */
export class TenantLookup {
  constructor(private readonly tenants: TenantLookupDelegate) {}

  async resolveByClientId(clientId: string): Promise<TenantIdentity> {
    const normalized = clientId.trim();
    if (!normalized) throw new Error("client_id inválido");

    const tenant = await this.tenants.findUnique({
      where: { clientId: normalized },
      select: { id: true, clientId: true, name: true },
    });
    if (!tenant) throw new Error("tenant no encontrado");
    return tenant;
  }
}
