import type { PeopleType } from "../../../../packages/contracts/people.js";

export function validateType(value: unknown): PeopleType {
  if (value === "client" || value === "user") return value;
  throw new Error("El tipo de identidad debe ser client o user.");
}

export function validateRequiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${field} es obligatorio.`);
  const normalized = value.trim();
  if (normalized.length > 120)
    throw new Error(`${field} no puede superar los 120 caracteres.`);
  return normalized;
}

export function validateOptionalText(value: unknown, field: string): string {
  if (value === undefined) return "";
  if (typeof value !== "string") throw new Error(`${field} no es válido.`);
  const normalized = value.trim();
  if (normalized.length > 120)
    throw new Error(`${field} no puede superar los 120 caracteres.`);
  return normalized;
}

export function validateEmail(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  )
    throw new Error("El email no es válido.");
  return value.trim();
}
