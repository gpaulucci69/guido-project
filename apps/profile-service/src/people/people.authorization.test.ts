import { describe, expect, it } from "vitest";
import {
  canPeopleAction,
  requirePeopleRoute,
  requirePeopleUpdate,
} from "./people.authorization.js";

const permissions = (values: string[]) =>
  values.map((value) => ({
    type:
      value.startsWith("/") && value.includes("home")
        ? ("route" as const)
        : ("action" as const),
    value,
  }));

describe("autorización de personas", () => {
  it("separa las rutas y acciones por tipo", () => {
    const granted = permissions([
      "/home/client/list",
      "/client/edit",
      "/client/update",
    ]);
    expect(() => requirePeopleRoute(granted, "client")).not.toThrow();
    expect(canPeopleAction(granted, "client", "edit")).toBe(true);
    expect(canPeopleAction(granted, "user", "edit")).toBe(false);
    expect(() => requirePeopleUpdate(granted, "client")).not.toThrow();
  });
  it("requiere edit y update para guardar", () => {
    expect(() =>
      requirePeopleUpdate(permissions(["/client/edit"]), "client"),
    ).toThrow();
  });
});
