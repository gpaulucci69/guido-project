import { describe, expect, it } from "vitest";
import { identityContextFromClaims } from "../auth/identity-context";
import { PortfolioAuthorizationService } from "./portfolio-authorization.service";

const service = new PortfolioAuthorizationService();
const client = {
  id: "c1",
  tenantId: "guido",
  representativeAccountantId: "u1",
};

describe("portfolio authorization", () => {
  it("allows all only with the declarative all permission", () => {
    const identity = identityContextFromClaims({
      sub: "u2",
      roles: ["ACCOUNTANT"],
      authorization: { client_id: "guido", actions: ["view/customers/all"] },
    });
    expect(service.canAccessClient(identity, client)).toBe(true);
  });

  it("limits own permission to the assigned accountant and tenant", () => {
    const identity = identityContextFromClaims({
      sub: "u1",
      authorization: { client_id: "guido", actions: ["view/customers/own"] },
    });
    expect(service.canAccessClient(identity, client)).toBe(true);
    expect(
      service.canAccessClient(identity, { ...client, tenantId: "otro" }),
    ).toBe(false);
  });
});
