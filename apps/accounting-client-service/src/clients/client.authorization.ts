import type { IdentityContext } from "../../../identity-sync-service/src/auth/identity-context.js";
import { hasPermission } from "../../../identity-sync-service/src/auth/permission-evaluator.js";

export type ClientAction = "view" | "add" | "edit" | "update" | "status";

export function requireClientPermission(identity: IdentityContext, action: ClientAction): void {
  const permission = action === "view" ? "/home/customers" : `client/${action}`;
  const type = action === "view" ? "route" : "action";
  if (!hasPermission(identity.permissions, type, permission)) throw new Error("No tiene permisos para realizar esta operación.");
}
