import type { Obligation, ObligationStatus } from "../domain/obligation.js";

export type ObligationFilter = {
  tenantId: string;
  clientId?: string;
  status?: ObligationStatus;
  cursor?: string;
  limit?: number;
};

export interface ObligationRepository {
  create(obligation: Obligation): Promise<Obligation>;
  findById(tenantId: string, id: string): Promise<Obligation | undefined>;
  list(
    filter: ObligationFilter,
  ): Promise<{ items: Obligation[]; nextCursor?: string }>;
  update(obligation: Obligation): Promise<Obligation>;
}

/** In-memory adapter used by the domain service and easily replaced by Prisma. */
export class InMemoryObligationRepository implements ObligationRepository {
  private readonly records = new Map<string, Obligation>();

  async create(obligation: Obligation): Promise<Obligation> {
    this.records.set(obligation.id, obligation);
    return obligation;
  }
  async findById(
    tenantId: string,
    id: string,
  ): Promise<Obligation | undefined> {
    const value = this.records.get(id);
    return value?.tenantId === tenantId ? value : undefined;
  }
  async list(filter: ObligationFilter) {
    const items = [...this.records.values()]
      .filter((item) => item.tenantId === filter.tenantId)
      .filter((item) => !filter.clientId || item.clientId === filter.clientId)
      .filter((item) => !filter.status || item.status === filter.status)
      .sort((a, b) => a.id.localeCompare(b.id));
    const start = filter.cursor
      ? Math.max(0, items.findIndex((item) => item.id === filter.cursor) + 1)
      : 0;
    const page = items.slice(start, start + Math.min(filter.limit ?? 25, 100));
    if (start + page.length < items.length)
      return { items: page, nextCursor: page.at(-1)?.id ?? "" };
    return { items: page };
  }
  async update(obligation: Obligation) {
    if (!this.records.has(obligation.id))
      throw new Error("Obligación inexistente");
    this.records.set(obligation.id, obligation);
    return obligation;
  }
}
