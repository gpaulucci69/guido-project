import {
  transitionPayment,
  type PaymentSubmission,
} from "../domain/payment.js";
import type { PaymentRepository } from "./payment.service.js";
import type { CreditBalanceService } from "../../credit-balance/application/credit-balance.service.js";
import type { ChangeAuditService } from "../../audit/change-audit.service.js";

export class CancelPaymentService {
  constructor(
    private readonly payments: PaymentRepository,
    private readonly credits: CreditBalanceService,
    private readonly audit?: ChangeAuditService,
  ) {}

  async cancel(
    tenantId: string,
    paymentId: string,
    clientId: string,
    reason: string,
    userId: string,
  ): Promise<PaymentSubmission> {
    const current = await this.payments.find(tenantId, paymentId);
    if (!current) throw new Error("Pago no encontrado");
    if (current.status !== "PENDING_VALIDATION")
      throw new Error("El pago ya fue resuelto");
    const cancelled = transitionPayment(current, "CANCELLED", reason);
    const saved = await this.payments.update(cancelled);
    this.credits.accredit(clientId, current.amount, paymentId, userId);
    await this.audit?.record({
      tenantId,
      entityType: "PaymentSubmission",
      entityId: paymentId,
      action: "CANCELLED",
      performedByUserId: userId,
      oldValue: current.status,
      newValue: saved.status,
      reason,
    });
    return saved;
  }
}
