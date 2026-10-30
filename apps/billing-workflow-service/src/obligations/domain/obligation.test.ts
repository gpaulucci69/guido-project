import { describe, expect, it } from "vitest";
import { cancelObligation, createObligation } from "./obligation.js";

const input = {
  id: "o1",
  tenantId: "t1",
  clientId: "c1",
  serviceDescription: "Honorarios",
  periodStartDate: "2026-05-01",
  periodEndDate: "2026-05-31",
  dueDate: "2026-06-10",
};
describe("obligation domain", () => {
  it("creates ARS obligations with the full initial balance", () =>
    expect(
      createObligation({
        ...input,
        totalAmount: "80000.00",
      }).balanceDue.toString(),
    ).toBe("80000.00"));
  it("rejects zero amounts and invalid periods", () => {
    expect(() => createObligation({ ...input, totalAmount: "0.00" })).toThrow();
    expect(() =>
      createObligation({
        ...input,
        periodStartDate: "2026-06-01",
        totalAmount: "1.00",
      }),
    ).toThrow();
  });
  it("cancels only with a reason", () => {
    const obligation = createObligation({ ...input, totalAmount: "1.00" });
    expect(() => cancelObligation(obligation, " ")).toThrow();
    expect(cancelObligation(obligation, "Servicio cancelado").status).toBe(
      "CANCELLED",
    );
  });
});
