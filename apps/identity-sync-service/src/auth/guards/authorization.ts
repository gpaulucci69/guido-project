export type AuthenticatedUser = {
  sub: string;
  tenant_id: string;
  roles: readonly string[];
};

export function requireAuthenticated(
  user: AuthenticatedUser | undefined,
): AuthenticatedUser {
  if (!user?.sub || !user.tenant_id) throw new Error("Autenticación requerida");
  return user;
}

export function requireRole(
  user: AuthenticatedUser,
  ...allowed: readonly string[]
): void {
  if (!user.roles.some((role) => allowed.includes(role)))
    throw new Error("No tiene permisos para realizar esta operación");
}

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  STUDIO_ADMIN: "STUDIO_ADMIN",
  ACCOUNTANT: "ACCOUNTANT",
  CLIENT_VIEWER: "CLIENT_VIEWER",
} as const;
