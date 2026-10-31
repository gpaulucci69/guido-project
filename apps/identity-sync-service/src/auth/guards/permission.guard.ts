import type { IdentityContext } from "../identity-context";
import { hasPermission } from "../permission-evaluator";
import type { PermissionType } from "../permission-context";

export function requirePermission(
  identity: IdentityContext,
  type: PermissionType,
  value: string,
): void {
  if (!hasPermission(identity.permissions, type, value))
    throw new Error("Acceso denegado");
}
