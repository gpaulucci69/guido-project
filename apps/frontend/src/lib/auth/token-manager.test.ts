import { describe, expect, it } from "vitest";
import { TokenManager } from "./token-manager.js";

describe("TokenManager", () => {
  it("refreshes expiring tokens and returns the new access token", async () => {
    const manager = new TokenManager(async (refreshToken) => ({
      accessToken: `${refreshToken}-new`,
      expiresAt: 2_000_000,
    }));
    manager.set({
      accessToken: "old",
      refreshToken: "refresh",
      expiresAt: 1_000_000,
    });
    await expect(manager.accessToken(980_000)).resolves.toBe("refresh-new");
  });
});
