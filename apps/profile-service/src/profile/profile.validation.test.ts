import { describe, expect, it } from "vitest";
import { avatarObjectKey, validateAvatar } from "./profile.validation.js";

const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);

describe("profile validation", () => {
  it("accepts a PNG and builds a tenant-scoped object key", () => {
    expect(
      validateAvatar({
        filename: "avatar.png",
        mimeType: "image/png",
        bytes: png,
      }),
    ).toEqual({ extension: "png" });
    expect(avatarObjectKey("guido", "user/1", "png")).toBe(
      "profiles/guido/user_1/avatar.png",
    );
  });

  it("rejects an invalid magic header", () => {
    expect(() =>
      validateAvatar({
        filename: "avatar.png",
        mimeType: "image/png",
        bytes: Uint8Array.from([1, 2, 3]),
      }),
    ).toThrow("no coincide");
  });
});
