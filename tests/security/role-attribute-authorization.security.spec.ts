import { describe, expect, it } from "vitest";
import {
  canAction,
  canRoute,
} from "../../apps/frontend/src/auth/permission-evaluator";
import { identityContextFromClaims } from "../../apps/identity-sync-service/src/auth/identity-context";
import { requirePermission } from "../../apps/identity-sync-service/src/auth/guards/permission.guard";

describe("role attribute authorization E2E contract", () => {
  it("keeps frontend visibility and backend authorization aligned", () => {
    const identity = identityContextFromClaims({
      sub: "super-admin",
      authorization: {
        client_id: "guido",
        routes: ["/home/customers"],
        actions: ["/view/customers/all"],
      },
    });

    expect(canRoute(identity.permissions, "/home/customers")).toBe(true);
    expect(canAction(identity.permissions, "view/customers/all")).toBe(true);
    expect(canRoute(identity.permissions, "/home/users")).toBe(false);
    expect(canAction(identity.permissions, "add/user")).toBe(false);
    expect(() => requirePermission(identity, "action", "add/user")).toThrow(
      "Acceso denegado",
    );
  });
});
