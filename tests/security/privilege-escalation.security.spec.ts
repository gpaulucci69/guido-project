import { describe, expect, it } from "vitest";
import { authenticate } from "../../apps/identity-sync-service/src/auth/guards/authentication.guard";
import { requirePermission } from "../../apps/identity-sync-service/src/auth/guards/permission.guard";

describe("privilege escalation security", () => {
  it("does not grant access when a role name changes without permissions", () => {
    const identity = authenticate({
      sub: "u1",
      roles: ["SUPER_ADMIN"],
      authorization: { client_id: "guido" },
    });
    expect(() =>
      requirePermission(identity, "action", "view/customers/all"),
    ).toThrow("Acceso denegado");
  });
});
