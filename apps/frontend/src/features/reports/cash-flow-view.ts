import { formatARS } from '../../lib/formatters/ars.js';
export type CashFlowMetrics = { committed: string; collected: string; pending: string; overdue: string };
export function formatCashFlow(metrics: CashFlowMetrics) { return Object.fromEntries(Object.entries(metrics).map(([key, value]) => [key, formatARS(value)])); }
