import { afterEach, describe, expect, it, vi } from "vitest";
import { KeycloakAdminAdapter } from "./keycloak-admin.adapter.js";

afterEach(() => vi.unstubAllGlobals());

describe("Keycloak login events", () => {
  it("uses the latest successful login per user and client and skips missing events", async () => {
    const login = "2026-11-27T12:45:00.000Z";
    const fetch = vi.fn(async (resource: string) => {
      const url = new URL(resource);
      if (url.pathname.endsWith("/token"))
        return Response.json({ access_token: "test-admin-token" });
      const user = url.searchParams.get("user");
      if (user === "unavailable") return new Response(null, { status: 403 });
      return Response.json(
        user === "known" ? [{ time: Date.parse(login) }] : [],
      );
    });
    vi.stubGlobal("fetch", fetch);

    const logins = await new KeycloakAdminAdapter().lastSuccessfulLogins(
      ["known", "missing", "unavailable"],
      "test-client",
    );

    expect(logins).toEqual(new Map([["known", login]]));
    const requests = fetch.mock.calls.map(([url]) => new URL(url));
    expect(
      requests.filter(({ pathname }) => pathname.endsWith("/token")),
    ).toHaveLength(1);
    const eventRequests = requests.filter(({ pathname }) =>
      pathname.endsWith("/events"),
    );
    expect(
      eventRequests.map(({ searchParams }) => Object.fromEntries(searchParams)),
    ).toEqual(
      ["known", "missing", "unavailable"].map((user) => ({
        type: "LOGIN",
        client: "test-client",
        user,
        max: "1",
      })),
    );
  });
});
