export const BILLING_STREAM = {
  name: "SAAS_BILLING",
  subjects: ["billing.>"] as const,
  maxAgeMs: 30 * 24 * 60 * 60 * 1000,
  maxBytes: 10 * 1024 * 1024 * 1024,
  maxMessageBytes: 1024 * 1024,
};

export function assertEventEnvelope(value: unknown): asserts value is {
  eventId: string;
  eventType: string;
  occurredAt: string;
  tenantId: string;
  traceId: string;
  payload: unknown;
} {
  if (!value || typeof value !== "object")
    throw new Error("Envelope de evento inválido");
  const event = value as Record<string, unknown>;
  for (const field of [
    "eventId",
    "eventType",
    "occurredAt",
    "tenantId",
    "traceId",
  ])
    if (typeof event[field] !== "string" || !event[field])
      throw new Error(`Campo de evento inválido: ${field}`);
  if (!("payload" in event)) throw new Error("El evento requiere payload");
}
