export type PortfolioClient = {
  id: string;
  tenantId: string;
  representativeAccountantId: string | null;
};

export class PortfolioAuthorizationService {
  canAccessClient(
    userId: string,
    roles: readonly string[],
    client: PortfolioClient,
  ): boolean {
    if (roles.includes("SUPER_ADMIN") || roles.includes("STUDIO_ADMIN"))
      return true;
    return (
      roles.includes("ACCOUNTANT") &&
      client.representativeAccountantId === userId
    );
  }

  assertCanAccessClient(
    userId: string,
    roles: readonly string[],
    client: PortfolioClient,
  ): void {
    if (!this.canAccessClient(userId, roles, client))
      throw new Error("El cliente no pertenece a su cartera");
  }
}
