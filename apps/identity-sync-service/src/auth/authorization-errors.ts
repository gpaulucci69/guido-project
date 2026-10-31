import { problem } from "../../../../packages/http/src/problem-details.js";

export function authenticationRequired() {
  return problem(
    401,
    "Autenticación requerida",
    "Debe iniciar sesión para continuar.",
  );
}

export function permissionDenied() {
  return problem(
    403,
    "Acceso denegado",
    "No tiene permisos para realizar esta operación.",
  );
}

export function tenantResourceDenied() {
  return problem(
    403,
    "Acceso denegado",
    "No puede acceder al recurso solicitado.",
  );
}
