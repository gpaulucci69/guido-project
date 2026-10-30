export type TenantPrismaExecutor = {
  $executeRawUnsafe(query: string, ...values: unknown[]): Promise<number>;
};

export type TenantPrismaClient = TenantPrismaExecutor & {
  $transaction<T>(
    operation: (tx: TenantPrismaExecutor) => Promise<T>,
  ): Promise<T>;
};

export async function setTenantContext<T>(
  db: TenantPrismaExecutor,
  tenantId: string,
  operation: () => Promise<T>,
): Promise<T> {
  if (!/^[0-9a-f-]{36}$/i.test(tenantId)) throw new Error("tenant_id inválido");
  await db.$executeRawUnsafe(
    "SELECT set_config($1, $2, true)",
    "app.current_tenant",
    tenantId,
  );
  try {
    return await operation();
  } finally {
    await db.$executeRawUnsafe(
      "SELECT set_config($1, $2, true)",
      "app.current_tenant",
      "",
    );
  }
}

/** Runs work in a transaction so SET LOCAL cannot leak across requests. */
export function withTenant<T>(
  db: TenantPrismaClient,
  tenantId: string,
  operation: (tx: TenantPrismaExecutor) => Promise<T>,
): Promise<T> {
  if (!/^[0-9a-f-]{36}$/i.test(tenantId)) throw new Error("tenant_id inválido");
  return db.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      "SELECT set_config($1, $2, true)",
      "app.current_tenant",
      tenantId,
    );
    return operation(tx);
  });
}
