export type LogContext = { traceId: string; tenantId: string; userId?: string };
export type StructuredLogger = {
  info(data: Record<string, unknown>, message: string): void;
  error(data: Record<string, unknown>, message: string): void;
};

export function withContext(
  logger: StructuredLogger,
  context: LogContext,
): StructuredLogger {
  const fields = {
    traceId: context.traceId,
    tenant_id: context.tenantId,
    ...(context.userId ? { userId: context.userId } : {}),
  };
  return {
    info: (data, message) => logger.info({ ...fields, ...data }, message),
    error: (data, message) => logger.error({ ...fields, ...data }, message),
  };
}
