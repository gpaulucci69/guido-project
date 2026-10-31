import { describe, expect, it, vi } from "vitest";
import { ProfileService, type ProfileIdentity } from "./profile.service.js";
import type { AvatarStorage } from "./avatar-storage.adapter.js";
import type { KeycloakProfileAdapter } from "./keycloak-profile.adapter.js";

const identity: ProfileIdentity = {
  sub: "user-1",
  tenantId: "guido",
  permissions: [{ type: "action", value: "edit/profile" }],
};
const file = {
  filename: "avatar.png",
  mimeType: "image/png",
  bytes: Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]),
};

describe("ProfileService", () => {
  it("removes the new object when Keycloak update fails", async () => {
    const storage: AvatarStorage = {
      put: vi.fn(),
      delete: vi.fn(),
      signedUrl: vi.fn(),
    };
    const keycloak: KeycloakProfileAdapter = {
      get: vi.fn(),
      update: vi.fn().mockRejectedValue(new Error("upstream")),
    };
    const service = new ProfileService(keycloak, storage);
    await expect(service.update(identity, { avatar: file })).rejects.toThrow(
      "upstream",
    );
    expect(storage.put).toHaveBeenCalled();
    expect(storage.delete).toHaveBeenCalledWith(
      "profiles/guido/user-1/avatar.png",
    );
  });

  it("requires the edit permission", async () => {
    const keycloak: KeycloakProfileAdapter = { get: vi.fn(), update: vi.fn() };
    const service = new ProfileService(keycloak, {
      put: vi.fn(),
      delete: vi.fn(),
      signedUrl: vi.fn(),
    });
    await expect(
      service.update({ ...identity, permissions: [] }, { alias: "nuevo" }),
    ).rejects.toThrow("permisos");
  });
});
