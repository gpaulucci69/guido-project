export type SecurityEvent = {
  event:
    | "authentication"
    | "logout"
    | "invalid-credential"
    | "permission-denied"
    | "cross-tenant"
    | "demo"
    | "renewal-failed";
  sub?: string;
  tenant_id?: string;
  requiredPermission?: string;
  traceId: string;
  result: "allowed" | "denied";
  occurredAt: string;
};

export type SecurityEventSink = (event: SecurityEvent) => void;

export function createSecurityEventLogger(
  sink: SecurityEventSink = (event) => console.info(JSON.stringify(event)),
) {
  return (event: Omit<SecurityEvent, "occurredAt">): SecurityEvent => {
    const complete = { ...event, occurredAt: new Date().toISOString() };
    sink(complete);
    return complete;
  };
}
