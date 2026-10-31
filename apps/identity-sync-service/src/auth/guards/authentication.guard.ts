import type { IdentityContext } from "../identity-context";
import {
  identityContextFromClaims,
  type IdentityClaims,
} from "../identity-context";

export function authenticate(
  claims: IdentityClaims | undefined,
): IdentityContext {
  if (!claims) throw new Error("Autenticación requerida");
  try {
    return identityContextFromClaims(claims);
  } catch {
    throw new Error("Autenticación requerida");
  }
}
