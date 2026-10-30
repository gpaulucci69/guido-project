export type HealthResponse = { status: "ok"; service: string };

export function healthResponse(service: string): HealthResponse {
  return { status: "ok", service };
}

export function isHealthPath(pathname: string | undefined): boolean {
  return (
    pathname === "/healthz" || pathname === "/livez" || pathname === "/readyz"
  );
}
