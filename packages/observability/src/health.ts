export type HealthCheck = () => Promise<boolean>;
export async function readiness(
  checks: readonly HealthCheck[],
): Promise<{ status: "ok" | "error" }> {
  const results = await Promise.all(checks.map((check) => check()));
  return { status: results.every(Boolean) ? "ok" : "error" };
}
