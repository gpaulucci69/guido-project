import { describe, expect, it } from "vitest";
import { CreditBalanceService } from "../../credit-balance/application/credit-balance.service.js";
import {
  InMemoryPaymentRepository,
  PaymentService,
} from "./payment.service.js";
import { CancelPaymentService } from "./cancel-payment.service.js";

describe("CancelPaymentService", () => {
  it("cancels pending payment and credits the client without changing obligation data", async () => {
    const payments = new InMemoryPaymentRepository();
    const payment = await new PaymentService(payments).report({
      tenantId: "t1",
      obligationId: "o1",
      amount: "80.00",
      paymentDate: "2026-01-01",
      paymentMethod: "TRANSFER",
      receiptFileName: "r.pdf",
      receiptFileSizeBytes: 10,
      receiptFileMimeType: "application/pdf",
    });
    const credits = new CreditBalanceService();
    await new CancelPaymentService(payments, credits).cancel(
      "t1",
      payment.id,
      "client-1",
      "Obligación cancelada",
      "user-1",
    );
    expect((await payments.find("t1", payment.id))?.status).toBe("CANCELLED");
    expect(credits.get("client-1").availableAmount).toBe("80.00");
  });
});
