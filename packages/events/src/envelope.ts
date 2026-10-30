import { randomUUID } from "node:crypto";
export type EventEnvelope<T> = {
  eventId: string;
  eventType: string;
  occurredAt: string;
  tenantId: string;
  traceId: string;
  payload: T;
};
export function createEvent<T>(
  eventType: string,
  tenantId: string,
  traceId: string,
  payload: T,
): EventEnvelope<T> {
  return {
    eventId: randomUUID(),
    eventType,
    occurredAt: new Date().toISOString(),
    tenantId,
    traceId,
    payload,
  };
}
