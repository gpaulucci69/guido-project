import { describe, expect, it } from "vitest";
import { normalizeCuit, validateCreate } from "./client.validation.js";

describe("validación de clientes", () => {
  it("normaliza y valida un CUIT argentino", () => {
    expect(normalizeCuit("20-12345678-6")).toBe("20123456786");
  });

  it("rechaza CUIT inválido", () => {
    expect(() => normalizeCuit("201234567890")).toThrow("CUIT");
  });

  it("exige nombre y apellido para persona física", () => {
    expect(() => validateCreate({ type: "INDIVIDUAL", firstName: "", lastName: "Pérez", cuit: "20123456789" })).toThrow("nombre");
  });

  it("exige juntos los datos del representante legal", () => {
    expect(() => validateCreate({ type: "LEGAL_ENTITY", legalName: "Acme", cuit: "30712345671", legalRepresentativeName: "Ana" })).toThrow("juntos");
  });
});
