import type { IncomingHttpHeaders } from "node:http";
import { identityContextFromClaimsWithTenantLookup } from "./identity-context";
import { verifyAccessToken } from "./token-verifier";
import { createSecurityEventLogger } from "../../../../packages/observability/src/security-events.js";
import { prisma } from "../../../../packages/database/src/prisma-client.js";
import { TenantLookup } from "../../../../packages/database/src/tenant-lookup.js";

const logSecurityEvent = createSecurityEventLogger();
const tenantLookup = new TenantLookup({
  findUnique: (args) => prisma.tenant.findUnique(args),
});

export async function authenticateHeaders(headers: IncomingHttpHeaders) {
  const authorization = headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    logSecurityEvent({
      event: "invalid-credential",
      traceId: "unknown",
      result: "denied",
    });
    throw new Error("Autenticación requerida");
  }
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    logSecurityEvent({
      event: "invalid-credential",
      traceId: "unknown",
      result: "denied",
    });
    throw new Error("Autenticación requerida");
  }

  let identity;
  try {
    const claims = await verifyAccessToken(token, {
      issuer:
        process.env.OIDC_ISSUER ?? "http://localhost:8080/realms/saas-contable",
      audience: process.env.OIDC_AUDIENCE ?? "account",
      ...(process.env.OIDC_JWKS_URI
        ? { jwksUri: process.env.OIDC_JWKS_URI }
        : {}),
    });
    identity = await identityContextFromClaimsWithTenantLookup(
      claims,
      async (clientId) => (await tenantLookup.resolveByClientId(clientId)).id,
    );
  } catch {
    logSecurityEvent({
      event: "invalid-credential",
      traceId: "unknown",
      result: "denied",
    });
    throw new Error("Autenticación requerida");
  }
  logSecurityEvent({
    event: "authentication",
    sub: identity.sub,
    tenant_id: identity.tenantId,
    traceId: identity.traceId,
    result: "allowed",
  });
  return identity;
}
