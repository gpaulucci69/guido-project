import type { ClientContext } from "../../../../packages/contracts/navigation.js";
import { accessToken } from "./session";
import { createApiClient } from "../lib/api/client";

const runtimeConfig =
  (
    globalThis as typeof globalThis & {
      __APP_CONFIG__?: { VITE_PROFILE_API_URL?: string };
    }
  ).__APP_CONFIG__ ?? {};

export async function loadClientContext(): Promise<ClientContext | null> {
  try {
    const api = createApiClient({
      baseUrl:
        runtimeConfig.VITE_PROFILE_API_URL ??
        (typeof import.meta.env?.VITE_PROFILE_API_URL === "string"
          ? import.meta.env.VITE_PROFILE_API_URL
          : undefined) ??
        (typeof window === "undefined"
          ? "http://localhost:3001/api/v1"
          : `${window.location.protocol}//${window.location.hostname}:3001/api/v1`),
      getToken: accessToken,
    });
    return await api<ClientContext>("/client-context");
  } catch (error) {
    console.warn("No se pudo resolver el cliente de Keycloak", error);
    return null;
  }
}

export function clientContextLabel(context: ClientContext | null): string {
  return (
    context?.name?.trim() || context?.clientId?.trim() || "Contexto actual"
  );
}
