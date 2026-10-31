import { createPublicKey, verify as verifySignature } from "node:crypto";

type JwtHeader = { alg?: unknown; kid?: unknown; typ?: unknown };

export type VerifiedTokenClaims = {
  iss: string;
  aud: string | string[];
  sub: string;
  typ: string;
  exp: number;
  iat?: number;
  authorization?: {
    client_id?: unknown;
    routes?: unknown;
    actions?: unknown;
  };
  [claim: string]: unknown;
};

type Jwk = JsonWebKey & { kid?: string; alg?: string; use?: string };

function decodePart(value: string): Record<string, unknown> {
  try {
    return JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as Record<string, unknown>;
  } catch {
    throw new Error("Token JWT malformado");
  }
}

function audienceMatches(
  audience: string | string[],
  expected: string,
): boolean {
  return Array.isArray(audience)
    ? audience.includes(expected)
    : audience === expected;
}

export async function verifyAccessToken(
  token: string,
  options: { issuer: string; audience: string; jwksUri?: string; now?: number },
): Promise<VerifiedTokenClaims> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Token JWT malformado");
  const encodedHeader = parts[0]!;
  const encodedClaims = parts[1]!;
  const encodedSignature = parts[2]!;

  const header = decodePart(encodedHeader) as JwtHeader;
  const claims = decodePart(encodedClaims) as Partial<VerifiedTokenClaims>;
  if (header.alg !== "RS256" || typeof header.kid !== "string")
    throw new Error("Algoritmo o clave JWT no soportados");
  if (claims.iss !== options.issuer)
    throw new Error("Issuer del token inválido");
  if (!claims.aud || !audienceMatches(claims.aud, options.audience))
    throw new Error("Audience del token inválido");
  if (claims.typ !== "Bearer")
    throw new Error("El token no es un Bearer token");
  if (typeof claims.sub !== "string" || claims.sub === "")
    throw new Error("Token sin sub");
  if (
    typeof claims.exp !== "number" ||
    claims.exp <= (options.now ?? Math.floor(Date.now() / 1000))
  )
    throw new Error("Token vencido");

  const jwksUri =
    options.jwksUri ?? `${options.issuer}/protocol/openid-connect/certs`;
  const response = await fetch(jwksUri);
  if (!response.ok) throw new Error("No se pudo obtener el JWKS de Keycloak");
  const body = (await response.json()) as { keys?: Jwk[] };
  const jwk = body.keys?.find((key) => key.kid === header.kid);
  if (!jwk) throw new Error("Clave pública del token no encontrada");

  const publicKey = createPublicKey({
    key: jwk as unknown as import("node:crypto").JsonWebKey,
    format: "jwk",
  });
  const valid = verifySignature(
    "RSA-SHA256",
    Buffer.from(`${encodedHeader}.${encodedClaims}`),
    publicKey,
    Buffer.from(encodedSignature, "base64url"),
  );
  if (!valid) throw new Error("Firma del token inválida");
  return claims as VerifiedTokenClaims;
}
