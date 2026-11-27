import { describe, expect, it } from "vitest";
import { formatCashFlow } from "./cash-flow-view.js";

describe("cash flow formatting", () => {
  it("formats every metric as ARS", () => {
    const result = formatCashFlow({
      invoiced: "1000",
      collected: "0",
      pending: "250",
      overdue: "10",
    });
    expect(result.invoiced).toContain("1.000");
    expect(result.pending).toContain("250");
  });
});
