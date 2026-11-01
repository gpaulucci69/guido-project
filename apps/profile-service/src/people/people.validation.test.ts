import { describe, expect, it } from "vitest";
import {
  validateEmail,
  validateRequiredText,
  validateType,
} from "./people.validation.js";

describe("validación de personas", () => {
  it("acepta tipos y datos válidos", () => {
    expect(validateType("client")).toBe("client");
    expect(validateRequiredText(" Ana ", "El nombre")).toBe("Ana");
    expect(validateEmail("ana@example.com")).toBe("ana@example.com");
  });
  it("rechaza valores inválidos", () => {
    expect(() => validateType("other")).toThrow();
    expect(() => validateRequiredText("", "El nombre")).toThrow();
    expect(() => validateEmail("invalid")).toThrow();
  });
});
