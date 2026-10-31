import { describe, expect, it } from "vitest";
import {
  createDemoContext,
  demoEnabled,
} from "../../apps/identity-sync-service/src/auth/demo-context";

describe("demo mode security", () => {
  it("is disabled unless explicitly enabled", () => {
    expect(demoEnabled(undefined)).toBe(false);
    expect(() =>
      createDemoContext({ sub: "demo", authorization: { client_id: "guido" } }),
    ).toThrow();
  });

  it("marks an explicitly enabled context as demo", () => {
    const previous = process.env.DEMO_MODE_ENABLED;
    process.env.DEMO_MODE_ENABLED = "true";
    expect(
      createDemoContext({ sub: "demo", authorization: { client_id: "guido" } })
        .isDemo,
    ).toBe(true);
    if (previous === undefined) delete process.env.DEMO_MODE_ENABLED;
    else process.env.DEMO_MODE_ENABLED = previous;
  });
});
