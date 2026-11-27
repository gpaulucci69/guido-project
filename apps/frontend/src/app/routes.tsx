import type { ReactNode } from "react";
import { useSession } from "./session-context.js";
import { canRoute } from "../auth/permission-evaluator.js";
import { canAction } from "../auth/permission-evaluator.js";
import type { FrontendPermission } from "../auth/session.js";
import { clientsPath } from "../../../../packages/contracts/clients.js";
import {
  associatesPermission,
  usersPermission,
} from "../../../../packages/contracts/people.js";

export const associatesPath = "/home/users/list";
export const usersPath = "/home/users/management";

export const appRoutes = [
  { path: "/home/welcome", label: "Inicio" },
  { path: "/home/client/services", label: "Estado de cuenta" },
  { path: clientsPath, label: "Clientes" },
  { path: associatesPath, label: "Asociados" },
  { path: usersPath, label: "Usuarios" },
  { path: "/home/reports/cash-flow", label: "Flujo de fondos" },
] as const;

export function canOpenRoute(
  permissions: readonly FrontendPermission[],
  route: string,
) {
  if (route === "/home/welcome") return true;
  const permission =
    route === associatesPath
      ? associatesPermission
      : route === usersPath
        ? usersPermission
        : route;
  if (!canRoute(permissions, permission)) return false;
  return (
    route !== "/home/reports/cash-flow" || canAction(permissions, "report/view")
  );
}

export function ProtectedRoute({
  route,
  children,
}: {
  route: string;
  children: ReactNode;
}) {
  const { status, identity } = useSession();
  if (status === "loading") return <p role="status">Cargando…</p>;
  if (status !== "authenticated" || !identity)
    return <p role="alert">Iniciá sesión para continuar.</p>;
  if (!canOpenRoute(identity.permissions, route))
    return <p role="alert">No tenés permisos para consultar esta pantalla.</p>;
  return <>{children}</>;
}
