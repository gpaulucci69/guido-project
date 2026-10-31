import { describe, expect, it } from "vitest";
import { identityContextFromClaims } from "../../apps/identity-sync-service/src/auth/identity-context";

describe("identity edge cases", () => {
  it("accepts an identity without permissions but gives it no access", () => {
    const identity = identityContextFromClaims({
      sub: "u1",
      authorization: { client_id: "guido" },
    });
    expect(identity.permissions).toEqual([]);
  });

  it("deduplicates permissions from multiple claims", () => {
    const identity = identityContextFromClaims({
      sub: "u1",
      authorization: {
        client_id: "guido",
        actions: ["/view/customers/all", "view/customers/all"],
      },
    });
    expect(identity.permissions).toEqual([
      { type: "action", value: "view/customers/all" },
    ]);
  });
});
