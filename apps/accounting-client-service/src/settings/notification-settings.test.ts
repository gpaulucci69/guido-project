import { describe, expect, it } from "vitest";
import { validateNotificationSettings } from "./notification-settings.js";

describe("notification settings", () => {
  it("enforces global ranges", () => {
    expect(() =>
      validateNotificationSettings({
        graceAfterDueDays: 31,
        reminderIntervalDays: 7,
        updatedByUserId: "u",
      }),
    ).toThrow("0 y 30");
    expect(
      validateNotificationSettings({
        graceAfterDueDays: 1,
        reminderIntervalDays: 7,
        updatedByUserId: "u",
      }),
    ).toMatchObject({ reminderIntervalDays: 7 });
  });
});
