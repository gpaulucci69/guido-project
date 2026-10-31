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

  it("clears the local session when renewal fails", async () => {
    const manager = new TokenManager(async () => {
      throw new Error("renovación fallida");
    });
    manager.set({
      accessToken: "expired",
      expiresAt: 0,
      refreshToken: "refresh",
    });
    await expect(manager.accessToken(1_000)).rejects.toThrow(
      "renovación fallida",
    );
    await expect(manager.accessToken(1_000)).resolves.toBeUndefined();
  });
});
