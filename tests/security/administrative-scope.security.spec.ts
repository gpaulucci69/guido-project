import { describe, expect, it } from "vitest";
import { identityContextFromClaims } from "../../apps/identity-sync-service/src/auth/identity-context";
import { requirePermission } from "../../apps/identity-sync-service/src/auth/guards/permission.guard";

describe("administrative scope security", () => {
  it("allows only explicitly declared tenant configuration permission", () => {
    const admin = identityContextFromClaims({
      sub: "admin",
      authorization: { client_id: "guido", actions: ["manage/tenant-config"] },
    });
    expect(() =>
      requirePermission(admin, "action", "manage/tenant-config"),
    ).not.toThrow();
    expect(() =>
      requirePermission(admin, "action", "manage/global-tenants"),
    ).toThrow("Acceso denegado");
  });
});
