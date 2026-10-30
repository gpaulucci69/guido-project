import { randomUUID } from "node:crypto";
import {
  transitionPayment,
  type PaymentSubmission,
  type PaymentStatus,
} from "../domain/payment.js";
import type { ChangeAuditService } from "../../audit/change-audit.service.js";

export interface PaymentRepository {
  create(payment: PaymentSubmission): Promise<PaymentSubmission>;
  find(tenantId: string, id: string): Promise<PaymentSubmission | undefined>;
  list(tenantId: string, obligationId: string): Promise<PaymentSubmission[]>;
  update(payment: PaymentSubmission): Promise<PaymentSubmission>;
}

export class InMemoryPaymentRepository implements PaymentRepository {
  private readonly records = new Map<string, PaymentSubmission>();
  async create(payment: PaymentSubmission) {
    this.records.set(payment.id, payment);
    return payment;
  }
  async find(tenantId: string, id: string) {
    const payment = this.records.get(id);
    return payment?.tenantId === tenantId ? payment : undefined;
  }
  async list(tenantId: string, obligationId: string) {
    return [...this.records.values()].filter(
      (p) => p.tenantId === tenantId && p.obligationId === obligationId,
    );
  }
  async update(payment: PaymentSubmission) {
    this.records.set(payment.id, payment);
    return payment;
  }
}

export type ReportPaymentInput = Omit<PaymentSubmission, "id" | "status">;

export class PaymentService {
  constructor(
    private readonly repository: PaymentRepository,
    private readonly audit?: ChangeAuditService,
  ) {}

  async report(input: ReportPaymentInput): Promise<PaymentSubmission> {
    const payment = await this.repository.create({
      ...input,
      id: randomUUID(),
      status: "PENDING_VALIDATION",
    });
    await this.audit?.record({
      tenantId: payment.tenantId,
      entityType: "PaymentSubmission",
      entityId: payment.id,
      action: "REPORTED",
      performedByUserId: payment.tenantId,
      newValue: payment.status,
    });
    return payment;
  }

  list(tenantId: string, obligationId: string) {
    return this.repository.list(tenantId, obligationId);
  }

  async resolve(
    tenantId: string,
    paymentId: string,
    next: Exclude<PaymentStatus, "PENDING_VALIDATION">,
    reason?: string,
  ) {
    const current = await this.repository.find(tenantId, paymentId);
    if (!current) throw new Error("Pago no encontrado");
    if (current.status !== "PENDING_VALIDATION")
      throw new Error("El pago ya fue resuelto");
    const resolved = await this.repository.update(
      transitionPayment(current, next, reason),
    );
    await this.audit?.record({
      tenantId,
      entityType: "PaymentSubmission",
      entityId: paymentId,
      action: next,
      performedByUserId: tenantId,
      oldValue: current.status,
      newValue: resolved.status,
      ...(reason ? { reason } : {}),
    });
    return resolved;
  }

  validate(tenantId: string, paymentId: string) {
    return this.resolve(tenantId, paymentId, "VALIDATED");
  }
  reject(tenantId: string, paymentId: string, reason: string) {
    return this.resolve(tenantId, paymentId, "REJECTED", reason);
  }
}
