import { ArsMoney } from "../../../../../packages/money/src/ars-money.js";

export type CashFlowRow = {
  clientId: string;
  representativeId?: string;
  dueDate: string;
  totalAmount: string;
  collectedAmount: string;
  status: "PENDING" | "OVERDUE" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
};
export type CashFlowQuery = {
  fromDate: string;
  toDate: string;
  representativeId?: string;
};
export type CashFlowMetrics = {
  invoiced: string;
  collected: string;
  pending: string;
  overdue: string;
  count: number;
};

export function validateCashFlowQuery(query: CashFlowQuery): void {
  if (query.fromDate > query.toDate)
    throw new Error("El rango de fechas es inválido");
}

export function aggregateCashFlow(
  rows: readonly CashFlowRow[],
  query: CashFlowQuery,
): CashFlowMetrics {
  validateCashFlowQuery(query);
  const selected = rows
    .filter(
      (row) => row.dueDate >= query.fromDate && row.dueDate <= query.toDate,
    )
    .filter(
      (row) =>
        !query.representativeId ||
        row.representativeId === query.representativeId,
    );
  let invoiced = ArsMoney.parse("0.00");
  let collected = ArsMoney.parse("0.00");
  let pending = ArsMoney.parse("0.00");
  let overdue = ArsMoney.parse("0.00");
  for (const row of selected) {
    const total = ArsMoney.parse(row.totalAmount);
    const paid = ArsMoney.parse(row.collectedAmount);
    invoiced = invoiced.add(total);
    collected = collected.add(paid);
    const due = total.subtract(paid);
    if (row.status === "OVERDUE") overdue = overdue.add(due);
    if (["PENDING", "OVERDUE", "PARTIALLY_PAID"].includes(row.status))
      pending = pending.add(due);
  }
  return {
    invoiced: invoiced.toString(),
    collected: collected.toString(),
    pending: pending.toString(),
    overdue: overdue.toString(),
    count: selected.length,
  };
}
