import type { FrontendPermission } from "./session";

export function canRoute(
  permissions: readonly FrontendPermission[],
  route: string,
): boolean {
  const normalizedRoute = route.trim().startsWith("/")
    ? route.trim()
    : `/${route.trim()}`;
  return permissions.some(
    (permission) =>
      permission.type === "route" &&
      (permission.value.startsWith("/")
        ? permission.value
        : `/${permission.value}`) === normalizedRoute,
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
