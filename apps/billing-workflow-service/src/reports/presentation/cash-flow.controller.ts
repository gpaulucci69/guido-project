import { problemFromError } from "../../../../../packages/http/src/problem-details.js";
import type { CashFlowService } from "../application/cash-flow.service.js";
import type { CashFlowQuery } from "../domain/cash-flow.js";

export class CashFlowController {
  constructor(private readonly service: CashFlowService) {}

  get(query: CashFlowQuery) {
    try {
      return { status: 200, body: this.service.report(query) };
    } catch (error) {
      return { status: 400, body: problemFromError(error) };
    }
  }
}
