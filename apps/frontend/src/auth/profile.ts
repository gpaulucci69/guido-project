import type { FrontendIdentity } from "./session";
import { accessToken, sessionIdentity } from "./session";
import { createApiClient } from "../lib/api/client";
export { fallbackAlias, initials } from "./profile-normalization.js";

export type UserProfile = {
  sub: string;
  firstName: string;
  lastName: string;
  alias: string;
  avatar: string | null;
  avatarUrl: string | null;
  email?: string;
};

export type ProfileUpdate = {
  firstName?: string;
  lastName?: string;
  alias?: string;
  avatar?: File;
};

const runtimeConfig =
  (
    globalThis as typeof globalThis & {
      __APP_CONFIG__?: { VITE_PROFILE_API_URL?: string };
    }
  ).__APP_CONFIG__ ?? {};
const profileBaseUrl =
  runtimeConfig.VITE_PROFILE_API_URL ??
  `${window.location.protocol}//${window.location.hostname}:3001/api/v1`;
const api = createApiClient({
  baseUrl: profileBaseUrl,
  getToken: accessToken,
});

export async function loadProfile(): Promise<UserProfile | null> {
  const identity = await sessionIdentity();
  if (!identity) return null;
  try {
    return await api<UserProfile>("/profile");
  } catch {
    return {
      sub: identity.sub,
      firstName: identity.firstName,
      lastName: identity.lastName,
      alias: identity.alias,
      avatar: identity.avatar,
      avatarUrl: null,
    };
  }
}

export async function updateProfile(
  update: ProfileUpdate,
): Promise<UserProfile> {
  const body = new FormData();
  if (update.firstName !== undefined) body.set("firstName", update.firstName);
  if (update.lastName !== undefined) body.set("lastName", update.lastName);
  if (update.alias !== undefined) body.set("alias", update.alias);
  if (update.avatar) body.set("avatar", update.avatar);
  return api<UserProfile>("/profile", { method: "PATCH", body });
}
