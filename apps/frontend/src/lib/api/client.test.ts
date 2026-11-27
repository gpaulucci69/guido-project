import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "./client.js";

describe("createApiClient", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("preserves the backend message for a conflict response", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json(
            { error: "Ya existe un cliente con ese CUIT." },
            { status: 409 },
          ),
        ),
    );
    await expect(
      createApiClient({ baseUrl: "http://api" })("/clients"),
    ).rejects.toMatchObject({
      message: "Ya existe un cliente con ese CUIT.",
      problem: { status: 409 },
    });
  });
  it("returns undefined for an empty successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );
    await expect(
      createApiClient({ baseUrl: "http://api" })("/empty"),
    ).resolves.toBeUndefined();
  });

  it("converts an empty error response into ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(null, { status: 502, statusText: "Bad Gateway" }),
        ),
    );
    await expect(
      createApiClient({ baseUrl: "http://api" })("/broken"),
    ).rejects.toEqual(
      expect.objectContaining({
        name: "Error",
        problem: expect.objectContaining({ status: 502 }),
      } satisfies Partial<ApiError>),
    );
  });
});
