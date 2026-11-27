import { clientsPath } from "../../../../packages/contracts/clients.js";
import type { IdentityContext } from "../../../identity-sync-service/src/auth/identity-context.js";
import { hasPermission } from "../../../identity-sync-service/src/auth/permission-evaluator.js";

export type ClientAction = "view" | "add" | "edit" | "update" | "status";

export class ClientPermissionError extends Error {}

export function requireClientPermission(
  identity: IdentityContext,
  action: ClientAction,
): void {
  const allowed =
    action === "view"
      ? hasPermission(identity.permissions, "route", clientsPath) ||
        hasPermission(identity.permissions, "route", "/home/customers")
      : hasPermission(identity.permissions, "action", `client/${action}`);
  if (!allowed)
    throw new ClientPermissionError(
      "No tiene permisos para realizar esta operación.",
    );
}
