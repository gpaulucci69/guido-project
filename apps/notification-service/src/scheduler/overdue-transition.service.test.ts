import { describe, expect, it } from "vitest";
import { createObligation } from "../../../billing-workflow-service/src/obligations/domain/obligation.js";
import { OverdueTransitionService } from "./overdue-transition.service.js";

describe("OverdueTransitionService", () => {
  it("transitions once after due date and leaves paid obligations unchanged", () => {
    const pending = createObligation({
      id: "o1",
      tenantId: "t1",
      clientId: "c1",
      serviceDescription: "Servicio",
      periodStartDate: "2026-01-01",
      periodEndDate: "2026-01-31",
      dueDate: "2026-02-10",
      totalAmount: "100.00",
    });
    const service = new OverdueTransitionService();
    const first = service.transition([pending], "2026-02-11");
    expect(first[0]?.status).toBe("OVERDUE");
    expect(service.transition(first, "2026-02-12")[0]?.status).toBe("OVERDUE");
  });
});
