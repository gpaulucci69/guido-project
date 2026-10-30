import { describe, expect, it } from "vitest";
import { ReceiptService } from "./receipt.service.js";
import type { ReceiptStorage } from "../storage/receipt-storage.port.js";

class MemoryStorage implements ReceiptStorage {
  readonly files = new Map<string, Uint8Array>();
  async put(key: string, body: Uint8Array) {
    this.files.set(key, body);
    return key;
  }
  async get(key: string) {
    const body = this.files.get(key);
    if (!body) throw new Error("No encontrado");
    return body;
  }
}

describe("ReceiptService", () => {
  it("stores tenant-scoped receipts and denies cross-tenant access", async () => {
    const storage = new MemoryStorage();
    const service = new ReceiptService(storage);
    const body = new Uint8Array([1, 2]);
    const receipt = await service.upload({
      tenantId: "tenant-a",
      paymentId: "payment-1",
      fileName: "a.pdf",
      mimeType: "application/pdf",
      sizeBytes: 2,
      body,
    });
    await expect(service.download("tenant-b", receipt.key)).rejects.toThrow(
      "denegado",
    );
    await expect(service.download("tenant-a", receipt.key)).resolves.toEqual(
      body,
    );
  });
});
