export type NotificationAuditEntry = Readonly<{
  action: string;
  entityId: string;
  actorId: string;
  createdAt: string;
  details?: string;
}>;
export class NotificationAudit {
  private readonly entries: NotificationAuditEntry[] = [];
  append(input: Omit<NotificationAuditEntry, "createdAt">) {
    const entry = Object.freeze({
      ...input,
      createdAt: new Date().toISOString(),
    });
    this.entries.push(entry);
    return entry;
  }
  list(): readonly NotificationAuditEntry[] {
    return this.entries;
  }
}
