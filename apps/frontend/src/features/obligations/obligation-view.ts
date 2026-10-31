import { formatARS } from "../../lib/formatters/ars.js";

export type ObligationRow = {
  id: string;
  serviceDescription: string;
  status: string;
  balanceDue: string;
  dueDate: string;
};
export function toObligationRow(value: ObligationRow) {
  return {
    ...value,
    balanceLabel: formatARS(value.balanceDue),
    statusLabel:
      value.status === "PENDING"
        ? "Pendiente"
        : value.status === "PAID"
          ? "Pagada"
          : value.status === "CANCELLED"
            ? "Cancelada"
            : value.status,
  };
}
