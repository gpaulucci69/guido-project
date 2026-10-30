import { describe, expect, it } from "vitest";
import { CreditBalanceService } from "../application/credit-balance.service.js";

describe("CreditBalanceService", () => {
  it("accredits exact surplus and applies it atomically", () => {
    const service = new CreditBalanceService();
    service.accredit("client-a", "5000.00", "payment-a", "user-a");
    expect(
      service.apply("client-a", "3500.00", "obligation-a", "user-a")
        .availableAmount,
    ).toBe("1500.00");
    expect(() =>
      service.apply("client-a", "1500.01", "obligation-b", "user-a"),
    ).toThrow("insuficiente");
    expect(service.get("client-a").availableAmount).toBe("1500.00");
  });
});
