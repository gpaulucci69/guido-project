import { describe, expect, it } from "vitest";
import { InMemoryObligationRepository } from "../infrastructure/obligation.repository.js";
import { ObligationService } from "./obligation.service.js";
import {
  ChangeAuditService,
  InMemoryAuditSink,
} from "../../audit/change-audit.service.js";

describe("ObligationService", () => {
  it("keeps tenant isolation and supports logical cancellation", async () => {
    const audit = new InMemoryAuditSink();
    const service = new ObligationService(
      new InMemoryObligationRepository(),
      new ChangeAuditService(audit),
    );
    const obligation = await service.create({
      tenantId: "tenant-a",
      clientId: "client-a",
      serviceDescription: "Honorarios",
      periodStartDate: "2026-01-01",
      periodEndDate: "2026-01-31",
      dueDate: "2026-02-10",
      totalAmount: "100.00",
    });
    await expect(service.get("tenant-b", obligation.id)).rejects.toThrow(
      "no encontrada",
    );
    await expect(
      service.cancel("tenant-a", obligation.id, "Servicio cancelado"),
    ).resolves.toMatchObject({ status: "CANCELLED" });
    expect(audit.entries.map((entry) => entry.action)).toEqual([
      "CREATED",
      "CANCELLED",
    ]);
    expect(audit.entries[1]).toMatchObject({
      reason: "Servicio cancelado",
      oldValue: "PENDING",
      newValue: "CANCELLED",
    });
  });
});
