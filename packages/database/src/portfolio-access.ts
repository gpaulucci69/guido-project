import type { IdentityContext } from "../../../apps/identity-sync-service/src/auth/identity-context.js";
import { canAction } from "../../../apps/identity-sync-service/src/auth/permission-evaluator.js";

export type PortfolioClientRecord = {
  id: string;
  tenantId: string;
  representativeAccountantId: string | null;
};

export type PortfolioClientDelegate = {
  findFirst(args: {
    where: { id: string; tenantId: string };
    select: { id: true; tenantId: true; representativeAccountantId: true };
  }): Promise<PortfolioClientRecord | null>;
};

export class PostgresPortfolioAccess {
  constructor(private readonly clients: PortfolioClientDelegate) {}

  async canAccessClient(
    identity: IdentityContext,
    clientId: string,
  ): Promise<boolean> {
    const client = await this.clients.findFirst({
      where: { id: clientId, tenantId: identity.tenantId },
      select: { id: true, tenantId: true, representativeAccountantId: true },
    });
    if (!client) return false;
    if (canAction(identity.permissions, "view/customers/all")) return true;
    return (
      canAction(identity.permissions, "view/customers/own") &&
      client.representativeAccountantId === identity.sub
    );
  }

  async assertCanAccessClient(
    identity: IdentityContext,
    clientId: string,
  ): Promise<void> {
    if (!(await this.canAccessClient(identity, clientId)))
      throw new Error("El cliente no pertenece a su cartera");
  }
}
