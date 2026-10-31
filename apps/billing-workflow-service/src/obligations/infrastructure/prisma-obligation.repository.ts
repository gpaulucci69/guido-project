import type { Obligation } from "../domain/obligation.js";
import type {
  ObligationFilter,
  ObligationRepository,
} from "./obligation.repository.js";
export type ObligationRecordDelegate = {
  create(args: { data: Obligation }): Promise<Obligation>;
  findFirst(args: {
    where: { id: string; tenantId: string };
  }): Promise<Obligation | null>;
  update(args: {
    where: { id: string };
    data: Obligation;
  }): Promise<Obligation>;
  findMany(args: {
    where: Record<string, unknown>;
    take: number;
    cursor?: { id: string };
    orderBy: { id: "asc" };
  }): Promise<Obligation[]>;
};
export class PrismaObligationRepository implements ObligationRepository {
  constructor(private readonly delegate: ObligationRecordDelegate) {}
  create(obligation: Obligation) {
    return this.delegate.create({ data: obligation });
  }
  async findById(tenantId: string, id: string) {
    return (
      (await this.delegate.findFirst({ where: { id, tenantId } })) ?? undefined
    );
  }
  async list(filter: ObligationFilter) {
    const items = await this.delegate.findMany({
      where: {
        tenantId: filter.tenantId,
        ...(filter.clientId ? { clientId: filter.clientId } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      take: Math.min(filter.limit ?? 25, 100),
      ...(filter.cursor ? { cursor: { id: filter.cursor } } : {}),
      orderBy: { id: "asc" },
    });
    const last = items.at(-1)?.id;
    return last && items.length === (filter.limit ?? 25)
      ? { items, nextCursor: last }
      : { items };
  }
  update(obligation: Obligation) {
    return this.delegate.update({
      where: { id: obligation.id },
      data: obligation,
    });
  }
}
