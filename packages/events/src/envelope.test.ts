import { describe, expect, it } from "vitest";
import { assertEventEnvelope, BILLING_STREAM } from "./stream.js";
import { createEvent } from "./envelope.js";

describe("event contracts", () => {
  it("creates and validates tenant-correlated envelopes", () => {
    const event = createEvent(
      "billing.payment.reported",
      "00000000-0000-0000-0000-000000000001",
      "trace-1",
      { amount: "10.00" },
    );
    expect(() => assertEventEnvelope(event)).not.toThrow();
    expect(BILLING_STREAM.maxMessageBytes).toBe(1024 * 1024);
  });
  it("rejects envelopes without required metadata", () => {
    expect(() => assertEventEnvelope({ payload: {} })).toThrow(
      "Campo de evento inválido",
    );
  });
});
