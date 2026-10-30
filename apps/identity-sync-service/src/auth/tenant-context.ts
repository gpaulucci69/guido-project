import { randomUUID } from "node:crypto";
export type TenantContext = {
  tenantId: string;
  userId: string;
  roles: readonly string[];
  traceId: string;
};
export function tenantContextFromRequest(request: {
  headers?: Record<string, string | string[] | undefined>;
  user?: { sub?: string; tenant_id?: string; roles?: string[] };
}): TenantContext {
  const tenantId = request.user?.tenant_id;
  const userId = request.user?.sub;
  if (!tenantId || !userId) throw new Error("JWT sin tenant_id o sub");
  const raw = request.headers?.["x-trace-id"];
  const traceId = Array.isArray(raw)
    ? (raw[0] ?? randomUUID())
    : (raw ?? randomUUID());
  return { tenantId, userId, roles: request.user?.roles ?? [], traceId };
}
