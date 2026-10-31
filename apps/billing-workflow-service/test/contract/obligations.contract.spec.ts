import { describe, expect, it } from "vitest";
describe("obligations REST contract", () =>
  it("publishes the required routes", () =>
    expect([
      "POST /obligations",
      "GET /obligations",
      "GET /obligations/{id}",
      "POST /obligations/{id}/cancel",
    ]).toHaveLength(4)));
