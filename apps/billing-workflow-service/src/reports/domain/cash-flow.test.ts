import { describe, expect, it } from "vitest";
import { aggregateCashFlow } from "./cash-flow.js";

describe("cash flow", () => {
  it("aggregates only the requested portfolio and date range", () => {
    const result = aggregateCashFlow(
      [
        {
          clientId: "c1",
          representativeId: "r1",
          dueDate: "2026-06-10",
          totalAmount: "100.00",
          collectedAmount: "40.00",
          status: "PARTIALLY_PAID",
        },
        {
          clientId: "c2",
          representativeId: "r2",
          dueDate: "2026-06-10",
          totalAmount: "500.00",
          collectedAmount: "500.00",
          status: "PAID",
        },
      ],
      { fromDate: "2026-06-01", toDate: "2026-06-30", representativeId: "r1" },
    );
    expect(result).toMatchObject({
      invoiced: "100.00",
      collected: "40.00",
      pending: "60.00",
      count: 1,
    });
  });
});
