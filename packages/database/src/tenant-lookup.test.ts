import { describe, expect, it, vi } from "vitest";
import { TenantLookup } from "./tenant-lookup.js";

describe("TenantLookup", () => {
  it("resuelve el client_id externo al UUID interno", async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      clientId: "guido",
      name: "Guido",
    });
    const result = await new TenantLookup({ findUnique }).resolveByClientId(
      " guido ",
    );
    expect(result.id).toBe("11111111-1111-4111-8111-111111111111");
    expect(findUnique).toHaveBeenCalledWith({
      where: { clientId: "guido" },
      select: { id: true, clientId: true, name: true },
    });
  });

  it("rechaza un client_id inexistente", async () => {
    await expect(
      new TenantLookup({
        findUnique: vi.fn().mockResolvedValue(null),
      }).resolveByClientId("guido"),
    ).rejects.toThrow("tenant no encontrado");
  });
});
