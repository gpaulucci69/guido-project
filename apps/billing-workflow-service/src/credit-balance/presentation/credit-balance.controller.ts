import { problemFromError } from "../../../../../packages/http/src/problem-details.js";
import type { CreditBalanceService } from "../application/credit-balance.service.js";

export class CreditBalanceController {
  constructor(private readonly service: CreditBalanceService) {}

  get(clientId: string) {
    return { status: 200, body: this.service.get(clientId) };
  }

  apply(
    clientId: string,
    amount: string,
    obligationId: string,
    userId: string,
  ) {
    try {
      return {
        status: 200,
        body: this.service.apply(clientId, amount, obligationId, userId),
      };
    } catch (error) {
      return { status: 400, body: problemFromError(error) };
    }
  }
}
