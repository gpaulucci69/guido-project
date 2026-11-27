import { describe, expect, it } from "vitest";
import { formatDate } from "./date.js";

describe("formatDate", () => {
  it("formats ISO dates for Argentina", () =>
    expect(formatDate("2026-11-20")).toBe("20/11/2026"));
  it("uses a readable fallback for empty dates", () =>
    expect(formatDate("")).toBe("—"));
});
