import { describe, expect, it } from "vitest";
import { renderClaimTemplate } from "./claim-template.js";

describe("claim template", () => {
  it("renders Spanish debt details and action link", () => {
    const result = renderClaimTemplate({
      clientName: "Ana",
      obligationDescription: "Honorarios",
      amountDue: "80000.00",
      dueDate: "2026-06-10",
      actionUrl: "https://example.test/action",
    });
    expect(result).toMatchObject({
      subject: expect.stringContaining("deuda"),
      body: expect.stringContaining("https://example.test/action"),
    });
  });
});
