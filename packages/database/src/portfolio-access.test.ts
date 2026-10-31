import { describe, expect, it, vi } from "vitest";
import { PostgresPortfolioAccess } from "./portfolio-access.js";
import { identityContextFromClaims } from "../../../apps/identity-sync-service/src/auth/identity-context.js";

const identity = (sub: string, action: string) =>
  identityContextFromClaims({
    sub,
    authorization: { client_id: "guido", actions: [`/${action}`] },
  });

describe("PostgresPortfolioAccess", () => {
  it("permite all dentro del tenant y consulta por tenantId", async () => {
    const findFirst = vi.fn().mockResolvedValue({
      id: "client-1",
      tenantId: "guido",
      representativeAccountantId: null,
    });
    const access = new PostgresPortfolioAccess({ findFirst });
    await expect(
      access.canAccessClient(
        identity("accountant-1", "view/customers/all"),
        "client-1",
      ),
    ).resolves.toBe(true);
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: "client-1", tenantId: "guido" },
      select: { id: true, tenantId: true, representativeAccountantId: true },
    });
  });

  it("permite own solo al contador asignado", async () => {
    const access = new PostgresPortfolioAccess({
      findFirst: vi.fn().mockResolvedValue({
        id: "client-1",
        tenantId: "guido",
        representativeAccountantId: "accountant-1",
      }),
    });
    await expect(
      access.canAccessClient(
        identity("accountant-1", "view/customers/own"),
        "client-1",
      ),
    ).resolves.toBe(true);
    await expect(
      access.canAccessClient(
        identity("accountant-2", "view/customers/own"),
        "client-1",
      ),
    ).resolves.toBe(false);
  });

  it("deniega cliente inexistente o de otro tenant", async () => {
    const access = new PostgresPortfolioAccess({
      findFirst: vi.fn().mockResolvedValue(null),
    });
    await expect(
      access.assertCanAccessClient(
        identity("accountant-1", "view/customers/all"),
        "other",
      ),
    ).rejects.toThrow("no pertenece");
  });
});
