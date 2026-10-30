import { describe, expect, it } from "vitest";
import { CreditBalanceService } from "../application/credit-balance.service.js";
import { CreditBalanceController } from "./credit-balance.controller.js";

describe("CreditBalanceController", () => {
  it("returns balance and RFC 7807 on insufficient funds", () => {
    const service = new CreditBalanceService();
    service.accredit("client-a", "100.00", "payment-a", "user-a");
    const controller = new CreditBalanceController(service);
    expect(controller.get("client-a")).toMatchObject({
      status: 200,
      body: { availableAmount: "100.00" },
    });
    expect(
      controller.apply("client-a", "100.01", "obligation-a", "user-a"),
    ).toMatchObject({ status: 400, body: { status: 400 } });
  });
});
