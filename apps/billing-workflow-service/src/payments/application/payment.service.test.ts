import { describe, expect, it } from "vitest";
import {
  InMemoryPaymentRepository,
  PaymentService,
} from "./payment.service.js";
import {
  ChangeAuditService,
  InMemoryAuditSink,
} from "../../audit/change-audit.service.js";

const input = {
  tenantId: "tenant-a",
  obligationId: "obligation-a",
  amount: "80.00",
  paymentDate: "2026-06-01",
  paymentMethod: "TRANSFER" as const,
  receiptFileName: "r.pdf",
  receiptFileSizeBytes: 10,
  receiptFileMimeType: "application/pdf" as const,
};

describe("PaymentService", () => {
  it("keeps submissions pending until explicit validation", async () => {
    const audit = new InMemoryAuditSink();
    const service = new PaymentService(
      new InMemoryPaymentRepository(),
      new ChangeAuditService(audit),
    );
    const payment = await service.report(input);
    expect(payment.status).toBe("PENDING_VALIDATION");
    expect(await service.list("tenant-a", "obligation-a")).toHaveLength(1);
    await expect(
      service.validate("tenant-a", payment.id),
    ).resolves.toMatchObject({ status: "VALIDATED" });
    await expect(
      service.reject("tenant-a", payment.id, "Duplicado"),
    ).rejects.toThrow("ya fue resuelto");
    expect(audit.entries[1]).toMatchObject({
      action: "VALIDATED",
      oldValue: "PENDING_VALIDATION",
      newValue: "VALIDATED",
    });
  });
});
