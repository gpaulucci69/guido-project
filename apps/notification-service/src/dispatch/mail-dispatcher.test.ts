import { describe, expect, it } from "vitest";
import { MailDispatcher } from "./mail-dispatcher.js";

describe("MailDispatcher", () => {
  it("retries once after a transport failure", async () => {
    let calls = 0;
    const dispatcher = new MailDispatcher({
      send: async () => {
        calls += 1;
        if (calls === 1) throw new Error("SMTP");
      },
    });
    await expect(
      dispatcher.sendWithRetry({
        to: "a@test",
        subject: "Aviso",
        body: "Texto",
      }),
    ).resolves.toEqual({ attempts: 2 });
    expect(calls).toBe(2);
  });
});
