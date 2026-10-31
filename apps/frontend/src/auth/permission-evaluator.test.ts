import { describe, expect, it } from "vitest";
import { canAction, canRoute } from "./permission-evaluator";

const permissions = [
  { type: "route" as const, value: "/home/customers" },
  { type: "action" as const, value: "view/customers/all" },
];

describe("frontend permission evaluator", () => {
  it("allows declared routes and actions", () => {
    expect(canRoute(permissions, "/home/customers")).toBe(true);
    expect(canAction(permissions, "view/customers/all")).toBe(true);
  });

  it("denies undeclared permissions", () => {
    expect(canRoute(permissions, "/home/admin")).toBe(false);
    expect(canAction(permissions, "add/customer")).toBe(false);
  });
});
