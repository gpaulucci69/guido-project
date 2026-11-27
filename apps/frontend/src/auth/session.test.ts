import { describe, expect, it } from "vitest";
import { identityFromUser } from "./session";
import { TokenManager } from "../lib/auth/token-manager";

describe("frontend session identity", () => {
  it("maps Keycloak profile and authorization claims to the frontend identity", () => {
    const identity = identityFromUser({
      profile: {
        sub: "user-1",
        email: "usuario@example.com",
        authorization: {
          client_id: "guido",
          routes: ["home/welcome"],
          actions: ["/view/customers/all"],
        },
        resource_access: { guido: { roles: ["SUPER_ADMIN"] } },
      },
    } as never);

    expect(identity).toMatchObject({
      sub: "user-1",
      email: "usuario@example.com",
      tenantId: "guido",
      roles: ["SUPER_ADMIN"],
    });
    expect(identity.permissions).toEqual([
      { type: "route", value: "/home/welcome" },
      { type: "action", value: "view/customers/all" },
    ]);
  });

  it("rejects a session without the Keycloak client tenant", () => {
    expect(() =>
      identityFromUser({ profile: { sub: "user-1" } } as never),
    ).toThrow("contexto de identidad");
  });

  it("reads authorization from the access token when the ID token profile omits it", () => {
    const payload = btoa(
      JSON.stringify({
        authorization: {
          client_id: "guido",
          actions: ["/view/customers/all"],
        },
      }),
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const identity = identityFromUser({
      access_token: `header.${payload}.signature`,
      profile: { sub: "user-1" },
    } as never);
    expect(identity.tenantId).toBe("guido");
    expect(identity.permissions).toEqual([
      { type: "action", value: "view/customers/all" },
    ]);
  });

  it("does not reuse a token after a failed renewal", async () => {
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
