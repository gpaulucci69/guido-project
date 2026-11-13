import type { ChangeAuditEntry } from "../../../billing-workflow-service/src/audit/change-audit.service.js";

export type ClientAuditInput = Omit<ChangeAuditEntry, "createdAt" | "entityType"> & {
  action: "CREATE" | "UPDATE" | "DEACTIVATE" | "ACTIVATE" | "UPDATE_REJECTED";
};

export function clientAuditEntry(input: ClientAuditInput): ChangeAuditEntry {
  return { ...input, entityType: "AccountingClient", createdAt: new Date().toISOString() };
}
