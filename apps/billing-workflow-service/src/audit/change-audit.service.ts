export type ChangeAuditEntry = {
  tenantId: string;
  entityType: string;
  entityId: string;
  action: string;
  performedByUserId: string;
  reason?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
};

export interface AuditSink {
  append(entry: ChangeAuditEntry): Promise<void>;
}

export class InMemoryAuditSink implements AuditSink {
  readonly entries: ChangeAuditEntry[] = [];
  async append(entry: ChangeAuditEntry): Promise<void> {
    this.entries.push(Object.freeze({ ...entry }));
  }
}

export class ChangeAuditService {
  constructor(private readonly sink: AuditSink) {}

  record(input: Omit<ChangeAuditEntry, "createdAt">): Promise<void> {
    return this.sink.append({ ...input, createdAt: new Date().toISOString() });
  }
}
