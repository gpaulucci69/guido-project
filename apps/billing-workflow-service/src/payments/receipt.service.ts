import { randomUUID } from "node:crypto";
import { validateReceipt } from "./domain/payment.js";
import type { ReceiptStorage } from "../storage/receipt-storage.port.js";

export type ReceiptUpload = {
  tenantId: string;
  paymentId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  body: Uint8Array;
};

export class ReceiptService {
  constructor(private readonly storage: ReceiptStorage) {}

  async upload(input: ReceiptUpload): Promise<{
    key: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }> {
    validateReceipt(input.sizeBytes, input.mimeType);
    if (input.body.byteLength !== input.sizeBytes)
      throw new Error("El tamaño del comprobante no coincide");
    const key = `${input.tenantId}/payments/${input.paymentId}/${randomUUID()}-${input.fileName}`;
    await this.storage.put(key, input.body, input.mimeType);
    return {
      key,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    };
  }

  async download(tenantId: string, key: string): Promise<Uint8Array> {
    if (!key.startsWith(`${tenantId}/`))
      throw new Error("Acceso denegado al comprobante");
    return this.storage.get(key);
  }
}
