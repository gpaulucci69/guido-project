import { describe, expect, it } from "vitest";
import { welcomeName } from "./welcome-view.js";

describe("bienvenida", () => {
  it("usa nombre y apellido", () =>
    expect(welcomeName("Super", "Admin")).toBe("Super Admin"));
  it("usa fallback cuando faltan datos", () =>
    expect(welcomeName("", "")).toBe("Usuario"));
});
