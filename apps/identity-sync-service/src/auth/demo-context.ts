import type { IdentityContext } from "./identity-context";
import { identityContextFromClaims } from "./identity-context";

export type DemoClaims = {
  sub: string;
  authorization: { client_id: string; routes?: string[]; actions?: string[] };
  roles?: string[];
};

export function demoEnabled(value = process.env.DEMO_MODE_ENABLED): boolean {
  return value === "true";
}

export function createDemoContext(claims: DemoClaims): IdentityContext {
  if (!demoEnabled()) throw new Error("El modo demo no está habilitado");
  return {
    ...identityContextFromClaims(claims),
    isDemo: true,
  };
}
