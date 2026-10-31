import type { FrontendPermission } from "./session";

export function canRoute(
  permissions: readonly FrontendPermission[],
  route: string,
): boolean {
  return permissions.some(
    (permission) => permission.type === "route" && permission.value === route,
  );
}

export function canAction(
  permissions: readonly FrontendPermission[],
  action: string,
): boolean {
  return permissions.some(
    (permission) => permission.type === "action" && permission.value === action,
  );
}
