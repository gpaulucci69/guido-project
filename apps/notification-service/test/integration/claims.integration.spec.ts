import { describe, expect, it } from "vitest";
import { MailDispatcher } from "../../src/dispatch/mail-dispatcher.js";
describe("claims integration invariants", () =>
  it("retries failed mail", async () => {
    let calls = 0;
    const result = await new MailDispatcher({
      send: async () => {
        calls++;
        if (calls === 1) throw new Error("SMTP");
      },
    }).sendWithRetry({ to: "a", subject: "s", body: "b" });
    expect(result.attempts).toBe(2);
  }));
