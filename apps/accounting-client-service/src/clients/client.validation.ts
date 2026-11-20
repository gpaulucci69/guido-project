import type { ClientCreate, ClientType, ClientUpdate } from "../../../../packages/contracts/clients.js";

const CUIT_LENGTH = 11;

export function normalizeCuit(value: unknown): string {
  if (typeof value !== "string") throw new Error("El CUIT es obligatorio.");
  const normalized = value.replace(/[-\s]/g, "");
  if (!/^\d{11}$/.test(normalized) || !isValidCuit(normalized))
    throw new Error("El CUIT no es válido para Argentina.");
  return normalized;
}

function isValidCuit(value: string): boolean {
  if (value.length !== CUIT_LENGTH) return false;
  const digits = value.split("").map(Number);
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((total, weight, index) => total + weight * (digits[index] ?? 0), 0);
  const remainder = 11 - (sum % 11);
  const check = remainder === 11 ? 0 : remainder === 10 ? 9 : remainder;
  return check === digits[10];
}

export function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} es obligatorio.`);
  const result = value.trim();
  if (result.length > 200) throw new Error(`${field} no puede superar los 200 caracteres.`);
  return result;
}

export function optionalText(value: unknown, field: string): string | undefined {
  if (value === undefined || value === "") return undefined;
  if (typeof value !== "string") throw new Error(`${field} no es válido.`);
  const result = value.trim();
  if (result.length > 200) throw new Error(`${field} no puede superar los 200 caracteres.`);
  return result;
}

function optionalEmail(value: unknown): string | undefined {
  const result = optionalText(value, "El email");
  if (result && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new Error("El email no es válido.");
  return result;
}

export function validateCreate(input: ClientCreate): ClientCreate {
  validateType(input.type);
  if (input.type === "INDIVIDUAL") {
    return {
      type: input.type,
      firstName: requiredText(input.firstName, "El nombre"),
      lastName: requiredText(input.lastName, "El apellido"),
      cuit: normalizeCuit(input.cuit),
      email: optionalEmail(input.email),
      phone: optionalText(input.phone, "El teléfono"),
      taxAddress: optionalText(input.taxAddress, "El domicilio fiscal"),
    };
  }
  const common = {
    cuit: normalizeCuit(input.cuit),
    email: optionalEmail(input.email),
    phone: optionalText(input.phone, "El teléfono"),
    taxAddress: optionalText(input.taxAddress, "El domicilio fiscal"),
  };
  const representativeName = optionalText(input.legalRepresentativeName, "El representante legal");
  const representativeTaxId = input.legalRepresentativeTaxId ? normalizeCuit(input.legalRepresentativeTaxId) : undefined;
  if (Boolean(representativeName) !== Boolean(representativeTaxId)) throw new Error("El representante legal y su CUIT deben completarse juntos.");
  return { type: input.type, legalName: requiredText(input.legalName, "La razón social"), tradeName: optionalText(input.tradeName, "El nombre comercial"), legalRepresentativeName: representativeName, legalRepresentativeTaxId: representativeTaxId, ...common };
}

export function validateUpdate(input: ClientUpdate): ClientUpdate {
  if (!input.updatedAt) throw new Error("La versión del cliente es obligatoria.");
  return {
    ...input,
    firstName: optionalText(input.firstName, "El nombre"),
    lastName: optionalText(input.lastName, "El apellido"),
    legalName: optionalText(input.legalName, "La razón social"),
    tradeName: optionalText(input.tradeName, "El nombre comercial"),
    email: optionalEmail(input.email),
    phone: optionalText(input.phone, "El teléfono"),
    taxAddress: optionalText(input.taxAddress, "El domicilio fiscal"),
    legalRepresentativeName: optionalText(input.legalRepresentativeName, "El representante legal"),
    legalRepresentativeTaxId: input.legalRepresentativeTaxId ? normalizeCuit(input.legalRepresentativeTaxId) : undefined,
  };
}

export function validateType(value: unknown): ClientType {
  if (value === "INDIVIDUAL" || value === "LEGAL_ENTITY") return value;
  throw new Error("El tipo de cliente no es válido.");
}
