import { describe, expect, it } from "vitest";
import { normalizePermissions } from "./permission-context";

describe("normalizePermissions", () => {
  it("normalizes valid route/action permissions and removes duplicates", () => {
    expect(
      normalizePermissions([
        { type: "route", value: "/home" },
        { type: "route", value: "/home" },
        { type: "action", value: "add/customer" },
      ]),
    ).toEqual([
      { type: "route", value: "/home" },
      { type: "action", value: "add/customer" },
    ]);
  });

  it("ignores missing, empty and unsupported permissions", () => {
    expect(
      normalizePermissions([
        undefined,
        { type: "route", value: " " },
        { type: "role", value: "ADMIN" },
        { value: "missing-type" },
      ]),
    ).toEqual([]);
  });

  it("normalizes the authorization claim from the Keycloak bearer token", () => {
    expect(
      normalizePermissions({
        routes: ["home/welcome", "home/customers", "home/customers"],
        actions: ["/view/customers/all"],
      }),
    ).toEqual([
      { type: "route", value: "/home/welcome" },
      { type: "route", value: "/home/customers" },
      { type: "action", value: "view/customers/all" },
    ]);
  });

  it("warns and ignores malformed permissions without affecting valid ones", () => {
    const warnings: string[] = [];
    expect(
      normalizePermissions(
        [
          { type: "route", value: "/home/customers" },
          { type: "route", value: "" },
        ],
        (message) => warnings.push(message),
      ),
    ).toEqual([{ type: "route", value: "/home/customers" }]);
    expect(warnings).toHaveLength(1);
  });
});
