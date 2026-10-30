import { describe, expect, it } from "vitest";
import {
  transitionPayment,
  validateReceipt,
  type PaymentSubmission,
} from "./payment.js";

const pending: PaymentSubmission = {
  id: "p1",
  tenantId: "t1",
  obligationId: "o1",
  amount: "100.00",
  paymentDate: "2026-06-01",
  paymentMethod: "TRANSFER",
  status: "PENDING_VALIDATION",
  receiptFileName: "receipt.pdf",
  receiptFileSizeBytes: 100,
  receiptFileMimeType: "application/pdf",
};

describe("payment domain", () => {
  it("requires a reason and supports logical cancellation", () => {
    expect(() => transitionPayment(pending, "CANCELLED")).toThrow(
      "obligatorio",
    );
    expect(
      transitionPayment(pending, "CANCELLED", "Obligación cancelada"),
    ).toMatchObject({
      status: "CANCELLED",
      cancellationReason: "Obligación cancelada",
    });
  });
  it("enforces receipt limits", () => {
    expect(() => validateReceipt(15_728_641, "application/pdf")).toThrow(
      "15 MB",
    );
    expect(() => validateReceipt(100, "text/plain")).toThrow("permitido");
  });
});
