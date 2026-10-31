import type { ProblemDetails } from "../../../../../packages/http/src/problem-details.js";

export class ApiError extends Error {
  constructor(readonly problem: ProblemDetails) {
    super(problem.detail);
  }
}

export type ApiClientOptions = {
  baseUrl: string;
  getToken?: () => Promise<string | undefined>;
};

export function createApiClient(options: ApiClientOptions) {
  return async function request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const token = await options.getToken?.();
    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");
    if (init.body && !(init.body instanceof FormData))
      headers.set("content-type", "application/json");
    if (token) headers.set("authorization", `Bearer ${token}`);
    const response = await fetch(`${options.baseUrl}${path}`, {
      ...init,
      headers,
    });
    if (response.ok) return (await response.json()) as T;
    const problem = (await response.json()) as ProblemDetails;
    throw new ApiError(problem);
  };
}
