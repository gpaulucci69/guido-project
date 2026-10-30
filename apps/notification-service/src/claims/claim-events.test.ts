import { describe, expect, it } from "vitest";
import { ClaimEvents } from "./claim-events.js";

describe("ClaimEvents", () => {
  it("publishes triggered and failed claim events", async () => {
    const subjects: string[] = [];
    const events = new ClaimEvents({
      publish: async (subject) => {
        subjects.push(subject);
      },
    });
    await events.triggered("t1", "trace-1", {
      claimId: "c1",
      obligationId: "o1",
      recipientEmail: "a@test",
      attemptCount: 1,
    });
    await events.failed("t1", "trace-1", {
      claimId: "c1",
      obligationId: "o1",
      recipientEmail: "a@test",
      attemptCount: 2,
      errorMessage: "SMTP",
    });
    expect(subjects).toEqual([
      "billing.claim.triggered",
      "billing.claim.failed",
    ]);
  });
});
