import { formatARS } from "../../lib/formatters/ars.js";
export function paymentStatusLabel(status: string): string {
  return (
    (
      {
        PENDING_VALIDATION: "Pendiente de validación",
        VALIDATED: "Validado",
        REJECTED: "Rechazado",
        CANCELLED: "Cancelado",
      } as Record<string, string>
    )[status] ?? status
  );
}
export function paymentAmountLabel(amount: string): string {
  return formatARS(amount);
}
