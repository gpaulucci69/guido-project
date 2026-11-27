import { describe, expect, it } from "vitest";
import {
  canAction,
  canRoute,
} from "../../apps/frontend/src/auth/permission-evaluator";
import { identityContextFromClaims } from "../../apps/identity-sync-service/src/auth/identity-context";
import { requirePermission } from "../../apps/identity-sync-service/src/auth/guards/permission.guard";
import {
  ClientPermissionError,
  requireClientPermission,
} from "../../apps/accounting-client-service/src/clients/client.authorization.js";
import { clientsPath } from "../../packages/contracts/clients.js";

describe("role attribute authorization E2E contract", () => {
  it("accepts the Clientes menu route in the accounting client API", () => {
    const identity = identityContextFromClaims({
      sub: "accountant",
      authorization: { client_id: "guido", routes: [clientsPath] },
    });

    expect(canRoute(identity.permissions, clientsPath)).toBe(true);
    expect(() => requireClientPermission(identity, "view")).not.toThrow();
    expect(() => requireClientPermission(identity, "add")).toThrow(
      ClientPermissionError,
    );
    expect(() =>
      requireClientPermission({ ...identity, permissions: [] }, "view"),
    ).toThrow(ClientPermissionError);
  });

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
    expect(() => requireClientPermission(identity, "view")).not.toThrow();
    expect(canAction(identity.permissions, "view/customers/all")).toBe(true);
    expect(canRoute(identity.permissions, "/home/users")).toBe(false);
    expect(canAction(identity.permissions, "add/user")).toBe(false);
    expect(() => requirePermission(identity, "action", "add/user")).toThrow(
      "Acceso denegado",
    );
  });
});
