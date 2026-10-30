export type PaymentStatus =
  "PENDING_VALIDATION" | "VALIDATED" | "REJECTED" | "CANCELLED";
export type PaymentMethod = "TRANSFER" | "DEPOSIT" | "CASH" | "OTHER";

export type PaymentSubmission = {
  id: string;
  tenantId: string;
  obligationId: string;
  amount: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  receiptFileName: string;
  receiptFileSizeBytes: number;
  receiptFileMimeType: "application/pdf" | "image/png" | "image/jpeg";
  rejectionReason?: string;
  cancellationReason?: string;
};

const transitions: Record<PaymentStatus, readonly PaymentStatus[]> = {
  PENDING_VALIDATION: ["VALIDATED", "REJECTED", "CANCELLED"],
  VALIDATED: [],
  REJECTED: [],
  CANCELLED: [],
};

export function transitionPayment(
  payment: PaymentSubmission,
  next: PaymentStatus,
  reason?: string,
): PaymentSubmission {
  if (!transitions[payment.status].includes(next))
    throw new Error("El pago ya fue resuelto o no admite esta transición");
  if ((next === "REJECTED" || next === "CANCELLED") && !reason?.trim())
    throw new Error("El motivo es obligatorio");
  const result = { ...payment, status: next };
  if (next === "REJECTED")
    return { ...result, rejectionReason: reason as string };
  if (next === "CANCELLED")
    return { ...result, cancellationReason: reason as string };
  return result;
}

export function validateReceipt(sizeBytes: number, mimeType: string): void {
  if (sizeBytes > 15_728_640)
    throw new Error("El comprobante supera el límite de 15 MB");
  if (!["application/pdf", "image/png", "image/jpeg"].includes(mimeType))
    throw new Error("El tipo de comprobante no está permitido");
}
