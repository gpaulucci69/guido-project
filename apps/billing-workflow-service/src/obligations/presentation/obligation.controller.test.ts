import { describe, expect, it } from "vitest";
import { ObligationService } from "../application/obligation.service.js";
import { InMemoryObligationRepository } from "../infrastructure/obligation.repository.js";
import { ObligationController } from "./obligation.controller.js";

describe("ObligationController", () => {
  it("exposes creation, lookup, cancellation and tenant isolation", async () => {
    const controller = new ObligationController(
      new ObligationService(new InMemoryObligationRepository()),
    );
    const created = await controller.create({
      tenantId: "tenant-a",
      clientId: "client-a",
      serviceDescription: "Honorarios",
      periodStartDate: "2026-01-01",
      periodEndDate: "2026-01-31",
      dueDate: "2026-02-10",
      totalAmount: "100.00",
    });
    expect(created.status).toBe(201);
    const id = (created.body as { id: string }).id;
    expect((await controller.detail("tenant-b", id)).status).toBe(404);
    expect(
      (await controller.cancel("tenant-a", id, "Baja solicitada")).status,
    ).toBe(200);
  });
});
