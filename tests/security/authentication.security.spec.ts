import { describe, expect, it } from "vitest";
import { identityContextFromClaims } from "../../apps/identity-sync-service/src/auth/identity-context";

describe("authentication security contract", () => {
  it("accepts a token context without roles or permissions", () => {
    expect(
      identityContextFromClaims({
        sub: "user-1",
        authorization: { client_id: "guido" },
      }),
    ).toMatchObject({
      sub: "user-1",
      tenantId: "guido",
      roles: [],
      permissions: [],
    });
  });

  it.each([
    { name: "sub", claims: { authorization: { client_id: "guido" } } },
    { name: "client tenant", claims: { sub: "user-1" } },
  ])("rejects a token without $name", ({ claims }) => {
    expect(() => identityContextFromClaims(claims)).toThrow(
      "Credencial incompleta",
    );
  });
});
