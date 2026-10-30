import {
  aggregateCashFlow,
  type CashFlowMetrics,
  type CashFlowQuery,
  type CashFlowRow,
} from "../domain/cash-flow.js";

export class CashFlowService {
  constructor(private readonly rows: readonly CashFlowRow[]) {}
  report(query: CashFlowQuery): CashFlowMetrics {
    return aggregateCashFlow(this.rows, query);
  }
}
