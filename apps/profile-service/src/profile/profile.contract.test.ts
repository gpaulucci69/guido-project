import { describe, expect, it, vi } from "vitest";
import { ProfileController } from "./profile.controller.js";
import type { ProfileService } from "./profile.service.js";

describe("profile contract controller", () => {
  it("returns normalized profile with 200", async () => {
    const service = {
      get: vi.fn().mockResolvedValue({
        sub: "u",
        firstName: "A",
        lastName: "B",
        alias: "ab",
        avatar: null,
        avatarUrl: null,
      }),
    } as unknown as ProfileService;
    const result = await new ProfileController(service).get({
      sub: "u",
      tenantId: "guido",
      permissions: [{ type: "action", value: "view/profile" }],
    });
    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({ sub: "u", alias: "ab" });
  });

  it("maps permission errors to 403", async () => {
    const service = {
      get: vi
        .fn()
        .mockRejectedValue(
          new Error("No tiene permisos para realizar esta operación."),
        ),
    } as unknown as ProfileService;
    const result = await new ProfileController(service).get({
      sub: "u",
      tenantId: "guido",
      permissions: [],
    });
    expect(result.status).toBe(403);
  });
});
