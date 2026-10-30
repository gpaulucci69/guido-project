export const MAX_RECEIPT_BYTES = 15_728_640;
export const ALLOWED_RECEIPT_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
] as const;
export type ReceiptStorage = {
  put(key: string, body: Uint8Array, contentType: string): Promise<string>;
  get(key: string): Promise<Uint8Array>;
};
export function receiptKey(
  tenantId: string,
  paymentId: string,
  filename: string,
): string {
  return `${tenantId}/payments/${paymentId}/${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
}
export function validateReceipt(size: number, mime: string): void {
  if (size > MAX_RECEIPT_BYTES)
    throw new Error("El comprobante supera el límite de 15 MB");
  if (!(ALLOWED_RECEIPT_MIME_TYPES as readonly string[]).includes(mime))
    throw new Error("Tipo de comprobante no permitido");
}
