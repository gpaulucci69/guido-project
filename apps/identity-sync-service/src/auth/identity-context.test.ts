import { describe, expect, it } from "vitest";
import {
  identityContextFromClaims,
  identityContextFromClaimsWithTenantLookup,
} from "./identity-context";

describe("identityContextFromClaims", () => {
  it("resuelve client_id externo al tenant UUID antes de crear el contexto", async () => {
    const context = await identityContextFromClaimsWithTenantLookup(
      { sub: "user-1", authorization: { client_id: "guido" } },
      async (clientId) => {
        expect(clientId).toBe("guido");
        return "11111111-1111-4111-8111-111111111111";
      },
    );
    expect(context.tenantId).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("uses authorization.client_id as tenant when tenant_id is absent", () => {
    const context = identityContextFromClaims({
      sub: "user-1",
      authorization: {
        client_id: "guido",
        routes: ["/home/welcome"],
        actions: ["/view/customers/all"],
      },
    });

    expect(context.tenantId).toBe("guido");
    expect(context.permissions).toEqual([
      { type: "route", value: "/home/welcome" },
      { type: "action", value: "view/customers/all" },
    ]);
  });

  it("does not accept tenant_id without the Keycloak client identifier", () => {
    expect(() =>
      identityContextFromClaims({
        sub: "user-1",
        tenant_id: "tenant-explicit",
      }),
    ).toThrow("authorization.client_id");
  });
});
