import { describe, expect, it } from "vitest";
import { CashFlowService } from "../application/cash-flow.service.js";
import { CashFlowController } from "./cash-flow.controller.js";

describe("CashFlowController", () => {
  it("returns metrics and rejects an invalid date range", () => {
    const controller = new CashFlowController(new CashFlowService([]));
    expect(
      controller.get({ fromDate: "2026-06-01", toDate: "2026-06-30" }).status,
    ).toBe(200);
    expect(
      controller.get({ fromDate: "2026-07-01", toDate: "2026-06-30" }),
    ).toMatchObject({ status: 400, body: { status: 400 } });
  });
});
