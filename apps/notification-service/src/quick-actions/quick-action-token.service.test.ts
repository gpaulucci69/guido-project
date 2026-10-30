import { describe, expect, it } from "vitest";
import { QuickActionTokenService } from "./quick-action-token.service.js";

describe("QuickActionTokenService", () => {
  it("expires after 24 hours and is single-use", () => {
    const service = new QuickActionTokenService();
    const now = new Date("2026-10-30T12:00:00Z");
    const token = service.create("tenant-a", "obligation-a", now);
    expect(
      service.consume(token.jti, "tenant-a", new Date("2026-10-30T13:00:00Z"))
        .usedAt,
    ).toEqual(new Date("2026-10-30T13:00:00Z"));
    expect(() =>
      service.consume(token.jti, "tenant-a", new Date("2026-10-30T14:00:00Z")),
    ).toThrow("expiró");
    const expired = service.create("tenant-a", "obligation-b", now);
    expect(() =>
      service.consume(
        expired.jti,
        "tenant-a",
        new Date("2026-10-31T12:00:01Z"),
      ),
    ).toThrow("expiró");
  });
});
