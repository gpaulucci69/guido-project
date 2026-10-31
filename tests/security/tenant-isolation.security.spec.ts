import { describe, expect, it } from "vitest";
import { identityContextFromClaims } from "../../apps/identity-sync-service/src/auth/identity-context";

describe("tenant isolation security", () => {
  it("binds the context to the Keycloak client tenant", () => {
    expect(
      identityContextFromClaims({
        sub: "u1",
        authorization: { client_id: "guido" },
      }).tenantId,
    ).toBe("guido");
  });

  it("does not accept a client-controlled tenant claim", () => {
    expect(() =>
      identityContextFromClaims({ sub: "u1", tenant_id: "other-tenant" }),
    ).toThrow("authorization.client_id");
  });
});
