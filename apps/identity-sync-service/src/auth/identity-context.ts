import { randomUUID } from "node:crypto";
import type { Permission } from "./permission-context";
import { normalizePermissions } from "./permission-context";

export type IdentityContext = {
  sub: string;
  clientId: string;
  tenantId: string;
  permissions: readonly Permission[];
  roles: readonly string[];
  traceId: string;
  isDemo: boolean;
};

export type IdentityClaims = {
  sub?: unknown;
  tenant_id?: unknown;
  permissions?: unknown;
  authorization?: {
    client_id?: unknown;
    routes?: unknown;
    actions?: unknown;
  };
  roles?: unknown;
  traceId?: unknown;
  isDemo?: unknown;
};

export type TenantIdResolver = (clientId: string) => Promise<string>;

function validatedClaims(claims: IdentityClaims) {
  if (typeof claims.sub !== "string" || claims.sub.trim() === "")
    throw new Error("Credencial incompleta: falta sub");
  const authorizationTenant = claims.authorization?.client_id;
  const clientId =
    typeof authorizationTenant === "string" && authorizationTenant.trim() !== ""
      ? authorizationTenant.trim()
      : undefined;
  if (!clientId)
    throw new Error("Credencial incompleta: falta authorization.client_id");
  return { clientId };
}

function buildContext(
  claims: IdentityClaims,
  tenantId: string,
): IdentityContext {
  if (!tenantId.trim()) throw new Error("tenant_id inválido");
  return {
    sub: claims.sub as string,
    clientId: (claims.authorization?.client_id as string).trim(),
    tenantId,
    permissions: normalizePermissions(
      claims.permissions ?? claims.authorization,
    ),
    roles: Array.isArray(claims.roles)
      ? claims.roles.filter((role): role is string => typeof role === "string")
      : [],
    traceId:
      typeof claims.traceId === "string" && claims.traceId.trim() !== ""
        ? claims.traceId
        : randomUUID(),
    isDemo: claims.isDemo === true,
  };
}

export function identityContextFromClaims(
  claims: IdentityClaims,
): IdentityContext {
  const { clientId } = validatedClaims(claims);
  return buildContext(claims, clientId);
}

/** Resolves the external Keycloak client id before entering business logic. */
export async function identityContextFromClaimsWithTenantLookup(
  claims: IdentityClaims,
  resolveTenantId: TenantIdResolver,
): Promise<IdentityContext> {
  const { clientId } = validatedClaims(claims);
  return buildContext(claims, await resolveTenantId(clientId));
}
