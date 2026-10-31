import { describe, expect, it } from "vitest";
import { canAction, canRoute } from "./permission-evaluator";

const permissions = [
  { type: "route" as const, value: "/home/clients" },
  { type: "action" as const, value: "view/customers/own" },
];

describe("permission evaluator", () => {
  it("allows explicitly declared routes and actions", () => {
    expect(canRoute(permissions, "/home/clients")).toBe(true);
    expect(canAction(permissions, "view/customers/own")).toBe(true);
  });

  it("denies absent permissions by default", () => {
    expect(canRoute(permissions, "/home/admin")).toBe(false);
    expect(canAction(permissions, "view/customers/all")).toBe(false);
  });
});
