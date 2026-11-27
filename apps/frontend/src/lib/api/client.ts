import type { ProblemDetails } from "../../../../../packages/http/src/problem-details.js";

export class ApiError extends Error {
  constructor(readonly problem: ProblemDetails) {
    super(problem.detail);
  }
}

export type ApiClientOptions = {
  baseUrl: string;
  getToken?: () => Promise<string | undefined>;
  onSessionExpired?: () => void;
};

export function createApiClient(options: ApiClientOptions) {
  return async function request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    let token: string | undefined;
    try {
      token = await options.getToken?.();
    } catch (error) {
      options.onSessionExpired?.();
      throw error;
    }
    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");
    if (init.body && !(init.body instanceof FormData))
      headers.set("content-type", "application/json");
    if (token) headers.set("authorization", `Bearer ${token}`);
    const response = await fetch(`${options.baseUrl}${path}`, {
      ...init,
      headers,
    });
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    let payload: unknown;
    try {
      payload = text.trim() ? JSON.parse(text) : undefined;
    } catch {
      throw new ApiError({
        type: "about:blank",
        title: "Error de API",
        status: response.status,
        detail: "La respuesta del servidor no tiene un formato válido.",
      });
    }
    if (response.ok) return payload as T;
    const body =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : {};
    const detail = [body.detail, body.message, body.error].find(
      (value): value is string =>
        typeof value === "string" && Boolean(value.trim()),
    );
    throw new ApiError({
      ...body,
      type: typeof body.type === "string" ? body.type : "about:blank",
      title: typeof body.title === "string" ? body.title : "Error de API",
      status: response.status,
      detail: detail ?? "La solicitud no pudo completarse.",
    });
  };
}
