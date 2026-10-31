import type { IdentityContext } from "../auth/identity-context";
import { canAction } from "../auth/permission-evaluator";

export type PortfolioClient = {
  id: string;
  tenantId: string;
  representativeAccountantId: string | null;
};

export class PortfolioAuthorizationService {
  canAccessClient(identity: IdentityContext, client: PortfolioClient): boolean {
    if (client.tenantId !== identity.tenantId) return false;
    if (canAction(identity.permissions, "view/customers/all")) return true;
    return (
      canAction(identity.permissions, "view/customers/own") &&
      client.representativeAccountantId === identity.sub
    );
  }

  assertCanAccessClient(
    identity: IdentityContext,
    client: PortfolioClient,
  ): void {
    if (!this.canAccessClient(identity, client))
      throw new Error("El cliente no pertenece a su cartera");
  }
}
