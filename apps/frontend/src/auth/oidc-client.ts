import {
  Log,
  UserManager,
  WebStorageStateStore,
  type User,
  type UserManagerSettings,
} from "oidc-client-ts";

type RuntimeConfig = {
  VITE_OIDC_ISSUER?: string;
  VITE_KEYCLOAK_URL?: string;
  VITE_KEYCLOAK_REALM?: string;
  VITE_KEYCLOAK_CLIENT_ID?: string;
};

const runtimeConfig =
  (globalThis as typeof globalThis & { __APP_CONFIG__?: RuntimeConfig })
    .__APP_CONFIG__ ?? {};
const origin =
  typeof window === "undefined"
    ? "http://localhost:5173"
    : window.location.origin;
const browserHost =
  typeof window === "undefined" ? "localhost" : window.location.hostname;
const issuer =
  runtimeConfig.VITE_OIDC_ISSUER ??
  `${runtimeConfig.VITE_KEYCLOAK_URL ?? `http://${browserHost}:8080`}/realms/${runtimeConfig.VITE_KEYCLOAK_REALM ?? "saas-contable"}`;

const settings: UserManagerSettings = {
  authority: issuer,
  client_id: runtimeConfig.VITE_KEYCLOAK_CLIENT_ID ?? "guido",
  redirect_uri: `${origin}/auth/callback`,
  post_logout_redirect_uri: origin,
  response_type: "code",
  scope: "openid profile email",
  automaticSilentRenew: true,
  loadUserInfo: false,
  ...(typeof window === "undefined"
    ? {}
    : {
        userStore: new WebStorageStateStore({ store: window.localStorage }),
      }),
};

Log.setLogger(console);
Log.setLevel(Log.INFO);

export const oidcUserManager = new UserManager(settings);

export function login(): Promise<void> {
  return oidcUserManager.signinRedirect();
}

export async function completeLogin(): Promise<User> {
  return oidcUserManager.signinRedirectCallback();
}

export function logout(): Promise<void> {
  return oidcUserManager.signoutRedirect();
}

export function currentUser(): Promise<User | null> {
  return oidcUserManager.getUser();
}

export function accessToken(): Promise<string | undefined> {
  return currentUser().then((user) => user?.access_token);
}

export async function renewAccessToken(): Promise<string> {
  try {
    const user = await oidcUserManager.signinSilent();
    if (!user) throw new Error("No se pudo renovar la sesión");
    return user.access_token;
  } catch (error) {
    await oidcUserManager.removeUser();
    throw new Error("La sesión expiró. Iniciá sesión nuevamente.", {
      cause: error,
    });
  }
}
