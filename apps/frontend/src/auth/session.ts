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
  firstName: string;
  lastName: string;
  alias: string;
  avatar: string | null;
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

function claimsFromAccessToken(token: string): Record<string, unknown> {
  try {
    const encoded = token.split(".")[1];
    if (!encoded) return {};
    const json = atob(encoded.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(encoded.length / 4) * 4, "="));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function clientRolesFromProfile(
  profile: Record<string, unknown>,
  clientId: string,
): string[] {
  const resourceAccess = profile.resource_access;
  if (!resourceAccess || typeof resourceAccess !== "object") return [];
  const client = (resourceAccess as Record<string, unknown>)[clientId];
  if (!client || typeof client !== "object") return [];
  const clientRoles = (client as { roles?: unknown }).roles;
  return Array.isArray(clientRoles)
    ? clientRoles.filter(
        (role, index, all): role is string =>
          typeof role === "string" &&
          role.trim().length > 0 &&
          all.indexOf(role) === index,
      )
    : [];
}

export function identityFromUser(user: User): FrontendIdentity {
  const profile = user.profile as Record<string, unknown>;
  const tokenClaims = claimsFromAccessToken(user.access_token);
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
    firstName: typeof profile.given_name === "string" ? profile.given_name : "",
    lastName:
      typeof profile.family_name === "string" ? profile.family_name : "",
    alias: typeof profile.alias === "string" ? profile.alias.trim() : "",
    avatar:
      typeof profile.avatar === "string" && profile.avatar.trim()
        ? profile.avatar
        : null,
    permissions: normalizeAuthorization(authorization),
    roles: clientRolesFromProfile({
      resource_access: profile.resource_access ?? tokenClaims.resource_access,
    }, tenantId),
    isDemo: profile.isDemo === true,
  };
}

export async function sessionIdentity(): Promise<FrontendIdentity | null> {
  const user = await currentUser();
  if (!user) return null;
  const token = await accessToken();
  if (!token) return null;
  const refreshedUser = await currentUser();
  return refreshedUser ? identityFromUser(refreshedUser) : null;
}

export {
  accessToken,
  completeLogin,
  login,
  logout,
  oidcUserManager,
  renewAccessToken,
};
