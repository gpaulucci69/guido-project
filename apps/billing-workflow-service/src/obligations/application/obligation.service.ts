import { randomUUID } from "node:crypto";
import {
  cancelObligation,
  createObligation,
  type CreateObligationInput,
  type Obligation,
} from "../domain/obligation.js";
import type {
  ObligationFilter,
  ObligationRepository,
} from "../infrastructure/obligation.repository.js";
import type { ChangeAuditService } from "../../audit/change-audit.service.js";
import { ArsMoney } from "../../../../../packages/money/src/ars-money.js";

export class ObligationService {
  constructor(
    private readonly repository: ObligationRepository,
    private readonly audit?: ChangeAuditService,
  ) {}

  async create(input: Omit<CreateObligationInput, "id">): Promise<Obligation> {
    const obligation = await this.repository.create(
      createObligation({ ...input, id: randomUUID() }),
    );
    await this.audit?.record({
      tenantId: obligation.tenantId,
      entityType: "PaymentObligation",
      entityId: obligation.id,
      action: "CREATED",
      performedByUserId: input.tenantId,
    });
    return obligation;
  }
  list(filter: ObligationFilter) {
    return this.repository.list(filter);
  }
  async get(tenantId: string, id: string): Promise<Obligation> {
    const result = await this.repository.findById(tenantId, id);
    if (!result) throw new Error("Obligación no encontrada");
    return result;
  }
  async cancel(
    tenantId: string,
    id: string,
    reason: string,
  ): Promise<Obligation> {
    const current = await this.get(tenantId, id);
    const cancelled = await this.repository.update(
      cancelObligation(current, reason),
    );
    await this.audit?.record({
      tenantId,
      entityType: "PaymentObligation",
      entityId: id,
      action: "CANCELLED",
      performedByUserId: tenantId,
      reason,
      oldValue: current.status,
      newValue: cancelled.status,
    });
    return cancelled;
  }

  async applyValidatedPayment(
    tenantId: string,
    id: string,
    amount: string,
  ): Promise<Obligation> {
    const current = await this.get(tenantId, id);
    const nextBalance = current.balanceDue.subtract(ArsMoney.parse(amount));
    const updated = await this.repository.update({
      ...current,
      balanceDue: nextBalance.isNegative()
        ? ArsMoney.fromCents(0n)
        : nextBalance,
      status:
        nextBalance.isNegative() || nextBalance.isZero()
          ? "PAID"
          : "PARTIALLY_PAID",
    });
    return updated;
  }
}
