import { describe, expect, it } from "vitest";
import { paymentAmountLabel, paymentStatusLabel } from "./payment-view.js";

describe("payment view formatting", () => {
  it("translates payment statuses", () =>
    expect(paymentStatusLabel("VALIDATED")).toBe("Validado"));
  it("formats payment amounts as ARS", () =>
    expect(paymentAmountLabel("1000")).toContain("1.000"));
});
