import type {
  ProfileUpdate,
  UserProfile,
} from "../../../../packages/contracts/profile.js";
import {
  avatarObjectKey,
  validateAvatar,
  validateText,
} from "./profile.validation.js";
import type { AvatarStorage } from "./avatar-storage.adapter.js";
import type { KeycloakProfileAdapter } from "./keycloak-profile.adapter.js";

export type ProfileIdentity = {
  sub: string;
  tenantId: string;
  permissions: readonly { type: "route" | "action"; value: string }[];
};

export class ProfileService {
  constructor(
    private readonly keycloak: KeycloakProfileAdapter,
    private readonly storage: AvatarStorage,
    private readonly log: (
      event: string,
      context: Record<string, string>,
    ) => void = () => undefined,
  ) {}

  async get(identity: ProfileIdentity): Promise<UserProfile> {
    requirePermission(identity, "/view/profile");
    return this.keycloak.get(identity.sub);
  }

  async update(
    identity: ProfileIdentity,
    update: ProfileUpdate,
  ): Promise<UserProfile> {
    requirePermission(identity, "/edit/profile");
    const fields = {
      firstName: validateText(update.firstName, "El nombre"),
      lastName: validateText(update.lastName, "El apellido"),
      alias: validateText(update.alias, "El alias"),
    };
    let key: string | undefined;
    if (update.avatar) {
      const validation = validateAvatar(update.avatar);
      key = avatarObjectKey(
        identity.tenantId,
        identity.sub,
        validation.extension,
      );
      await this.storage.put({
        key,
        mimeType: update.avatar.mimeType,
        bytes: update.avatar.bytes,
      });
    }
    try {
      const normalizedFields = {
        ...(fields.firstName !== undefined
          ? { firstName: fields.firstName }
          : {}),
        ...(fields.lastName !== undefined ? { lastName: fields.lastName } : {}),
        ...(fields.alias !== undefined ? { alias: fields.alias } : {}),
        ...(key ? { avatar: key } : {}),
      };
      const result = await this.keycloak.update(identity.sub, normalizedFields);
      this.log("profile-updated", {
        tenant_id: identity.tenantId,
        userId: identity.sub,
      });
      return result;
    } catch (error) {
      if (key)
        await Promise.resolve(this.storage.delete(key)).catch(() => undefined);
      this.log("profile-update-failed", {
        tenant_id: identity.tenantId,
        userId: identity.sub,
      });
      throw error;
    }
  }
}

function requirePermission(identity: ProfileIdentity, action: string): void {
  if (
    !identity.permissions.some(
      (permission) =>
        permission.type === "action" &&
        permission.value === action.replace(/^\//, ""),
    )
  )
    throw new Error("No tiene permisos para realizar esta operación.");
}
