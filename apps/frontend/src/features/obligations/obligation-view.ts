import { formatARS } from "../../lib/formatters/ars.js";

export type ObligationRow = {
  id: string;
  serviceDescription: string;
  status: string;
  balanceDue: string;
  dueDate: string;
};
export function toObligationRow(value: ObligationRow) {
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    OVERDUE: "Vencida",
    PARTIALLY_PAID: "Pagada parcialmente",
    PAID: "Pagada",
    CANCELLED: "Cancelada",
  };
  return {
    ...value,
    balanceLabel: formatARS(value.balanceDue),
    statusLabel: labels[value.status] ?? value.status,
  };
}
