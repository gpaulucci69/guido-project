import { describe, expect, it } from "vitest";
import { createDemoContext, demoEnabled } from "./demo-context";

const claims = { sub: "demo-user", authorization: { client_id: "guido" } };

describe("demo context", () => {
  it("requires an explicit flag", () => {
    expect(demoEnabled("false")).toBe(false);
    expect(() => createDemoContext(claims)).toThrow("no está habilitado");
  });

  it("creates an explicitly identified demo context", () => {
    const previous = process.env.DEMO_MODE_ENABLED;
    process.env.DEMO_MODE_ENABLED = "true";
    expect(createDemoContext(claims)).toMatchObject({
      isDemo: true,
      tenantId: "guido",
    });
    if (previous === undefined) delete process.env.DEMO_MODE_ENABLED;
    else process.env.DEMO_MODE_ENABLED = previous;
  });
});
