import type { Permission, PermissionType } from "./permission-context";

export function hasPermission(
  permissions: readonly Permission[],
  type: PermissionType,
  value: string,
): boolean {
  return permissions.some(
    (permission) => permission.type === type && permission.value === value,
  );
}

export function canRoute(
  permissions: readonly Permission[],
  route: string,
): boolean {
  return hasPermission(permissions, "route", route);
}

export function canAction(
  permissions: readonly Permission[],
  action: string,
): boolean {
  return hasPermission(permissions, "action", action);
}
