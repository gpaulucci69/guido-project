import { describe, expect, it } from "vitest";
import { fallbackAlias, initials } from "./profile-normalization.js";

describe("normalización del perfil", () => {
  it("prioriza alias y construye iniciales", () => {
    expect(
      fallbackAlias({
        firstName: "Super",
        lastName: "Admin",
        alias: "super_admin",
      }),
    ).toBe("super_admin");
    expect(initials({ firstName: "Super", lastName: "Admin" })).toBe("SA");
  });

  it("usa identidad derivada y nunca devuelve un avatar vacío", () => {
    expect(fallbackAlias({ firstName: "Super", lastName: "", alias: "" })).toBe(
      "Super",
    );
    expect(initials({ firstName: "", lastName: "" })).toBe("U");
  });
});
