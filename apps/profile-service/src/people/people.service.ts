import type {
  AdministrableIdentity,
  PeopleCreate,
  PeopleType,
  PeopleUpdate,
} from "../../../../packages/contracts/people.js";
import {
  requirePeopleAction,
  requirePeopleRoute,
  requirePeopleUpdate,
} from "./people.authorization.js";
import {
  validateEmail,
  validateOptionalText,
  validateRequiredText,
  validateType,
} from "./people.validation.js";
import { KeycloakAdminAdapter } from "./keycloak-admin.adapter.js";

export type PeopleIdentity = {
  sub: string;
  tenantId: string;
  clientId: string;
  permissions: readonly { type: "route" | "action"; value: string }[];
};

export class PeopleService {
  constructor(
    private readonly keycloak = new KeycloakAdminAdapter(),
    private readonly log: (
      event: string,
      context: Record<string, string>,
    ) => void = () => undefined,
  ) {}
  async list(
    identity: PeopleIdentity,
    type: PeopleType,
  ): Promise<AdministrableIdentity[]> {
    requirePeopleRoute(identity.permissions, type);
    return this.keycloak.list(validateType(type), identity.clientId);
  }
  async create(
    identity: PeopleIdentity,
    input: PeopleCreate,
  ): Promise<AdministrableIdentity> {
    const type = validateType(input.type);
    requirePeopleAction(identity.permissions, type, "add");
    const result = await this.keycloak.create({
      type,
      clientId: identity.clientId,
      firstName: validateRequiredText(input.firstName, "El nombre"),
      lastName: validateRequiredText(input.lastName, "El apellido"),
      alias: validateOptionalText(input.alias, "El alias"),
      email: validateEmail(input.email),
    });
    this.log("people-created", {
      tenant_id: identity.tenantId,
      userId: identity.sub,
      identityId: result.id,
      type,
    });
    return result;
  }
  async update(
    identity: PeopleIdentity,
    id: string,
    type: PeopleType,
    input: PeopleUpdate,
  ): Promise<AdministrableIdentity> {
    const current = await this.keycloak.get(id);
    requirePeopleUpdate(identity.permissions, validateType(type));
    if (
      current.identity.type !== type ||
      current.clientId !== identity.clientId
    )
      throw new Error("La identidad no pertenece al cliente Keycloak activo.");
    const result = await this.keycloak.update(id, {
      ...(input.firstName !== undefined
        ? { firstName: validateRequiredText(input.firstName, "El nombre") }
        : {}),
      ...(input.lastName !== undefined
        ? { lastName: validateRequiredText(input.lastName, "El apellido") }
        : {}),
      ...(input.alias !== undefined
        ? { alias: validateOptionalText(input.alias, "El alias") }
        : {}),
      ...(input.email !== undefined
        ? { email: validateEmail(input.email) }
        : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
    });
    this.log("people-updated", {
      tenant_id: identity.tenantId,
      userId: identity.sub,
      identityId: result.id,
      type,
    });
    return result;
  }
  async delete(
    identity: PeopleIdentity,
    id: string,
    type: PeopleType,
  ): Promise<void> {
    requirePeopleAction(identity.permissions, validateType(type), "delete");
    if (id === identity.sub)
      throw new Error("No podés eliminar tu propia identidad.");
    const current = await this.keycloak.get(id);
    if (
      current.identity.type !== type ||
      current.clientId !== identity.clientId
    )
      throw new Error("La identidad no pertenece al cliente Keycloak activo.");
    await this.keycloak.delete(id);
    this.log("people-deleted", {
      tenant_id: identity.tenantId,
      userId: identity.sub,
      identityId: id,
      type,
    });
  }
}
