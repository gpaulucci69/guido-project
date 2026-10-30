import { describe, expect, it } from "vitest";
import { ArsMoney } from "./ars-money.js";

describe("ArsMoney", () => {
  it("keeps exact cents", () =>
    expect(
      ArsMoney.parse("80000.10").add(ArsMoney.parse("0.90")).toString(),
    ).toBe("80001.00"));
  it("rejects malformed amounts", () =>
    expect(() => ArsMoney.parse("1.234")).toThrow());
});
