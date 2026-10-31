import type { IdentityContext } from "../identity-context";
import { tenantResourceDenied } from "../authorization-errors";
import type { PortfolioClient } from "../../tenants/portfolio-authorization.service";
import { PortfolioAuthorizationService } from "../../tenants/portfolio-authorization.service";

const portfolio = new PortfolioAuthorizationService();

export function requirePortfolioAccess(
  identity: IdentityContext,
  client: PortfolioClient,
): void {
  if (!portfolio.canAccessClient(identity, client))
    throw new Error(tenantResourceDenied().detail);
}
