import { describe, expect, it } from "vitest";
import { identityContextFromClaims } from "../src/auth/identity-context";
import { PortfolioAuthorizationService } from "../src/tenants/portfolio-authorization.service";

describe("portfolio authorization integration", () => {
  const service = new PortfolioAuthorizationService();
  const client = {
    id: "client-1",
    tenantId: "guido",
    representativeAccountantId: "accountant-1",
  };

  it("supports all and own scopes without crossing tenants", () => {
    const all = identityContextFromClaims({
      sub: "admin",
      authorization: { client_id: "guido", actions: ["view/customers/all"] },
    });
    const own = identityContextFromClaims({
      sub: "accountant-1",
      authorization: { client_id: "guido", actions: ["view/customers/own"] },
    });
    const empty = identityContextFromClaims({
      sub: "accountant-2",
      authorization: { client_id: "guido" },
    });
    expect(service.canAccessClient(all, client)).toBe(true);
    expect(service.canAccessClient(own, client)).toBe(true);
    expect(service.canAccessClient(empty, client)).toBe(false);
    expect(service.canAccessClient(all, { ...client, tenantId: "other" })).toBe(
      false,
    );
  });
});
