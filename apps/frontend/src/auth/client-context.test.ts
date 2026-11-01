import { describe, expect, it } from "vitest";
import { clientContextLabel } from "./client-context.js";

describe("contexto del cliente", () => {
  it("prioriza el nombre descriptivo", () => {
    expect(
      clientContextLabel({
        clientId: "guido",
        name: "Guido Estudio Contable",
        description: "",
        logoUrl: "",
        tenantId: "t",
      }),
    ).toBe("Guido Estudio Contable");
  });
  it("usa client id como fallback", () => {
    expect(
      clientContextLabel({
        clientId: "guido",
        name: "",
        description: "",
        logoUrl: "",
        tenantId: "t",
      }),
    ).toBe("guido");
  });
});
