import { describe, expect, it } from "vitest";
import {
  InMemoryPaymentRepository,
  PaymentService,
} from "../application/payment.service.js";
import { PaymentController } from "./payment.controller.js";

describe("PaymentController", () => {
  it("reports and resolves payments with HTTP semantics", async () => {
    const controller = new PaymentController(
      new PaymentService(new InMemoryPaymentRepository()),
    );
    const created = await controller.report({
      tenantId: "t1",
      obligationId: "o1",
      amount: "10.00",
      paymentDate: "2026-01-01",
      paymentMethod: "TRANSFER",
      receiptFileName: "r.pdf",
      receiptFileSizeBytes: 10,
      receiptFileMimeType: "application/pdf",
    });
    expect(created.status).toBe(201);
    const id = (created.body as { id: string }).id;
    expect((await controller.validate("t1", id)).status).toBe(200);
    expect((await controller.reject("t1", id, "Duplicado")).status).toBe(409);
  });
});
