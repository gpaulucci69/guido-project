import { describe, expect, it } from "vitest";
import { transitionPayment } from "../../src/payments/domain/payment.js";
describe("payment cancellation", () =>
  it("requires a reason", () =>
    expect(() =>
      transitionPayment(
        {
          id: "p",
          tenantId: "t",
          obligationId: "o",
          amount: "1.00",
          paymentDate: "2026-01-01",
          paymentMethod: "TRANSFER",
          status: "PENDING_VALIDATION",
          receiptFileName: "r.pdf",
          receiptFileSizeBytes: 1,
          receiptFileMimeType: "application/pdf",
        },
        "CANCELLED",
      ),
    ).toThrow()));
