import type { ProfileUpdate } from "../../../../packages/contracts/profile.js";
import type { ProfileIdentity, ProfileService } from "./profile.service.js";

export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  async get(identity: ProfileIdentity) {
    try {
      return { status: 200, body: await this.service.get(identity) };
    } catch (error) {
      return this.failure(error);
    }
  }

  async update(identity: ProfileIdentity, update: ProfileUpdate) {
    try {
      return { status: 200, body: await this.service.update(identity, update) };
    } catch (error) {
      return this.failure(error);
    }
  }

  private failure(error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo completar la operación.";
    const status = message.includes("permisos")
      ? 403
      : message.includes("autenticar") || message.includes("Autenticación")
        ? 401
        : message.includes("conflict") || message.includes("conflicto")
          ? 409
          : message.includes("MinIO") || message.includes("Keycloak")
            ? 502
            : 400;
    return {
      status,
      body: {
        type: `https://httpstatuses.com/${status}`,
        title: status === 403 ? "Acceso denegado" : "Error de perfil",
        status,
        detail: message,
      },
    };
  }
}
