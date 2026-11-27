import { formatARS } from "../../lib/formatters/ars.js";
export type CashFlowMetrics = {
  invoiced: string;
  collected: string;
  pending: string;
  overdue: string;
};
export function formatCashFlow(metrics: CashFlowMetrics) {
  return {
    invoiced: formatARS(metrics.invoiced),
    collected: formatARS(metrics.collected),
    pending: formatARS(metrics.pending),
    overdue: formatARS(metrics.overdue),
  };
}
