import { describe, expect, it } from "vitest";
import { healthResponse, isHealthPath } from "./health-controller.js";

describe("health controller", () => {
  it("recognizes all orchestration probes", () => {
    expect(isHealthPath("/healthz")).toBe(true);
    expect(isHealthPath("/livez")).toBe(true);
    expect(isHealthPath("/readyz")).toBe(true);
    expect(isHealthPath("/unknown")).toBe(false);
    expect(healthResponse("billing-workflow-service")).toEqual({
      status: "ok",
      service: "billing-workflow-service",
    });
  });
});
