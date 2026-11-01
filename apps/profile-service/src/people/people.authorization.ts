import type { PeopleType } from "../../../../packages/contracts/people.js";

type Permission = { type: "route" | "action"; value: string };
const routeFor = (type: PeopleType) =>
  type === "client" ? "/home/client/list" : "/home/users/list";
const actionFor = (
  type: PeopleType,
  action: "add" | "edit" | "update" | "delete",
) => `/${type}/${action}`;

function has(
  permissions: readonly Permission[],
  type: Permission["type"],
  value: string,
) {
  return permissions.some(
    (permission) =>
      permission.type === type &&
      permission.value.replace(/^\/+/, "") === value.replace(/^\/+/, ""),
  );
}

export function requirePeopleRoute(
  permissions: readonly Permission[],
  type: PeopleType,
): void {
  if (!has(permissions, "route", routeFor(type)))
    throw new Error("No tiene permisos para consultar esta pantalla.");
}

export function canPeopleAction(
  permissions: readonly Permission[],
  type: PeopleType,
  action: "add" | "edit" | "update" | "delete",
): boolean {
  return has(permissions, "action", actionFor(type, action));
}

export function requirePeopleAction(
  permissions: readonly Permission[],
  type: PeopleType,
  action: "add" | "edit" | "update" | "delete",
): void {
  if (!canPeopleAction(permissions, type, action))
    throw new Error("No tiene permisos para realizar esta operación.");
}

export function requirePeopleUpdate(
  permissions: readonly Permission[],
  type: PeopleType,
): void {
  requirePeopleAction(permissions, type, "edit");
  requirePeopleAction(permissions, type, "update");
}
