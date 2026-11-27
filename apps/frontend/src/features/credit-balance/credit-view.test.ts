import { describe, expect, it } from "vitest";
import { creditWarning } from "./credit-view.js";

describe("credit balance", () => {
  it("shows a warning for available credit", () =>
    expect(creditWarning("1000")).toContain("Saldo a favor disponible"));
  it("does not warn when the balance is zero", () =>
    expect(creditWarning("0.00")).toBeUndefined());
});
