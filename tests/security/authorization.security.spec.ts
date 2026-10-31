import { describe, expect, it } from "vitest";
import { authenticate } from "../../apps/identity-sync-service/src/auth/guards/authentication.guard";
import { requirePermission } from "../../apps/identity-sync-service/src/auth/guards/permission.guard";

describe("authorization security contract", () => {
  it("rejects missing identity context as authentication failure", () => {
    expect(() => authenticate(undefined)).toThrow("Autenticación requerida");
  });

  it("denies absent permissions by default", () => {
    const identity = authenticate({
      sub: "u1",
      authorization: { client_id: "guido" },
    });
    expect(() =>
      requirePermission(identity, "action", "view/customers/all"),
    ).toThrow("Acceso denegado");
  });
});
