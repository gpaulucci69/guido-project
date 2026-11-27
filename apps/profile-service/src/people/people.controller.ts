import type {
  PeopleCreate,
  PeopleGroup,
  PeopleType,
  PeopleUpdate,
} from "../../../../packages/contracts/people.js";
import type { PeopleIdentity, PeopleService } from "./people.service.js";

export class PeopleController {
  constructor(private readonly service: PeopleService) {}
  async list(identity: PeopleIdentity, type: PeopleType, group?: PeopleGroup) {
    try {
      return {
        status: 200,
        body: { items: await this.service.list(identity, type, group) },
      };
    } catch (error) {
      return this.failure(error);
    }
  }
  async clientRoles(identity: PeopleIdentity, group?: PeopleGroup) {
    try {
      return {
        status: 200,
        body: { items: await this.service.clientRoles(identity, group) },
      };
    } catch (error) {
      return this.failure(error);
    }
  }
  async create(identity: PeopleIdentity, input: PeopleCreate) {
    try {
      return { status: 201, body: await this.service.create(identity, input) };
    } catch (error) {
      return this.failure(error);
    }
  }
  async update(
    identity: PeopleIdentity,
    id: string,
    type: PeopleType,
    input: PeopleUpdate,
  ) {
    try {
      return {
        status: 200,
        body: await this.service.update(identity, id, type, input),
      };
    } catch (error) {
      return this.failure(error);
    }
  }
  async delete(identity: PeopleIdentity, id: string, type: PeopleType) {
    try {
      await this.service.delete(identity, id, type);
      return { status: 204, body: null };
    } catch (error) {
      return this.failure(error);
    }
  }
  private failure(error: unknown) {
    const detail =
      error instanceof Error
        ? error.message
        : "No se pudo completar la operación.";
    const status = detail.includes("permisos")
      ? 403
      : detail.includes("no disponible")
        ? 502
        : detail.includes("no encontrada")
          ? 404
          : detail.includes("existe")
            ? 409
            : 400;
    return {
      status,
      body: {
        type: `https://httpstatuses.com/${status}`,
        title: status === 403 ? "Acceso denegado" : "Error de identidades",
        status,
        detail,
      },
    };
  }
}
