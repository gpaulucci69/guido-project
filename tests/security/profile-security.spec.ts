import { describe, expect, it, vi } from "vitest";
import { ProfileService } from "../../apps/profile-service/src/profile/profile.service.js";

describe("seguridad del perfil", () => {
  it("requires the explicit edit permission", async () => {
    const service = new ProfileService(
      { get: vi.fn(), update: vi.fn() },
      { put: vi.fn(), delete: vi.fn(), signedUrl: vi.fn() },
    );
    await expect(
      service.update(
        { sub: "u", tenantId: "guido", permissions: [] },
        { alias: "otro" },
      ),
    ).rejects.toThrow("permisos");
  });

  it("builds storage keys from authenticated tenant and subject", async () => {
    const storage = { put: vi.fn(), delete: vi.fn(), signedUrl: vi.fn() };
    const service = new ProfileService(
      {
        get: vi.fn(),
        update: vi.fn().mockResolvedValue({
          sub: "u",
          firstName: "",
          lastName: "",
          alias: "",
          avatar: "profiles/guido/u/avatar.png",
          avatarUrl: null,
        }),
      },
      storage,
    );
    await service.update(
      {
        sub: "u",
        tenantId: "guido",
        permissions: [{ type: "action", value: "edit/profile" }],
      },
      {
        avatar: {
          filename: "avatar.png",
          mimeType: "image/png",
          bytes: Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]),
        },
      },
    );
    expect(storage.put).toHaveBeenCalledWith(
      expect.objectContaining({ key: "profiles/guido/u/avatar.png" }),
    );
  });
});
