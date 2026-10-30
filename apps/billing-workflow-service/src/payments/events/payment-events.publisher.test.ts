import { describe, expect, it } from "vitest";
import { PaymentEvents } from "./payment-events.publisher.js";

describe("PaymentEvents", () => {
  it("publishes the required subjects with exact amount strings", async () => {
    const published: Array<{
      subject: string;
      event: { tenantId: string; payload: { amount: string } };
    }> = [];
    const events = new PaymentEvents({
      publish: async (subject, event) => {
        published.push({ subject, event });
      },
    });
    await events.reported("tenant-a", "trace-1", {
      paymentId: "p",
      obligationId: "o",
      amount: "80000.00",
    });
    expect(published[0]).toMatchObject({
      subject: "billing.payment.reported",
      event: { tenantId: "tenant-a", payload: { amount: "80000.00" } },
    });
  });
});
