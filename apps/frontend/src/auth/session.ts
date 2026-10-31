import type { User } from "oidc-client-ts";
import {
  accessToken,
  completeLogin,
  currentUser,
  login,
  logout,
  oidcUserManager,
  renewAccessToken,
} from "./oidc-client";

export type FrontendPermission = {
  type: "route" | "action";
  value: string;
};

export type FrontendIdentity = {
  sub: string;
  tenantId: string;
  permissions: readonly FrontendPermission[];
  roles: readonly string[];
  isDemo: boolean;
};

function normalizeAuthorization(input: unknown): FrontendPermission[] {
  if (!input || typeof input !== "object") return [];
  const authorization = input as { routes?: unknown; actions?: unknown };
  const permissions: FrontendPermission[] = [];
  if (Array.isArray(authorization.routes))
    for (const route of authorization.routes)
      if (typeof route === "string" && route.trim())
        permissions.push({
          type: "route",
          value: route.trim().startsWith("/")
            ? route.trim()
            : `/${route.trim()}`,
        });
  if (Array.isArray(authorization.actions))
    for (const action of authorization.actions)
      if (typeof action === "string" && action.trim())
        permissions.push({
          type: "action",
          value: action.trim().replace(/^\/+/, ""),
        });
  return permissions.filter(
    (permission, index, all) =>
      all.findIndex(
        (candidate) =>
          candidate.type === permission.type &&
          candidate.value === permission.value,
      ) === index,
  );
}

function authorizationFromAccessToken(token: string): unknown {
  try {
    const payload = token.split(".")[1];
    if (!payload) return undefined;
    const encoded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "="));
    return (JSON.parse(json) as { authorization?: unknown }).authorization;
  } catch {
    return undefined;
  }
}

export function identityFromUser(user: User): FrontendIdentity {
  const profile = user.profile as Record<string, unknown>;
  const authorization =
    profile.authorization ?? authorizationFromAccessToken(user.access_token);
  const tenantId =
    authorization &&
    typeof authorization === "object" &&
    typeof (authorization as { client_id?: unknown }).client_id === "string"
      ? (authorization as { client_id: string }).client_id
      : "";
  if (typeof profile.sub !== "string" || !profile.sub || !tenantId)
    throw new Error("Sesión sin contexto de identidad");
  return {
    sub: profile.sub,
    tenantId,
    permissions: normalizeAuthorization(authorization),
    roles: Array.isArray(
      (profile.resource_access as { guido?: { roles?: unknown } })?.guido
        ?.roles,
    )
      ? (
          profile.resource_access as { guido: { roles: unknown[] } }
        ).guido.roles.filter((role): role is string => typeof role === "string")
      : [],
    isDemo: profile.isDemo === true,
  };
}

export async function sessionIdentity(): Promise<FrontendIdentity | null> {
  const user = await currentUser();
  return user ? identityFromUser(user) : null;
}

export {
  accessToken,
  completeLogin,
  login,
  logout,
  oidcUserManager,
  renewAccessToken,
};
