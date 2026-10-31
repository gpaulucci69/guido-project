import { canAction, canRoute } from "../auth/permission-evaluator";
import type { FrontendPermission } from "../auth/session";

export function protectRoute(
  permissions: readonly FrontendPermission[],
  route: string,
): boolean {
  return canRoute(permissions, route);
}

export function protectAction(
  permissions: readonly FrontendPermission[],
  action: string,
): boolean {
  return canAction(permissions, action);
}
