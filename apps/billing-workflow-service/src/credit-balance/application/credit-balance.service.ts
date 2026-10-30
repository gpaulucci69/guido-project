import {
  addCredit,
  applyCredit,
  type CreditBalance,
} from "../domain/credit-balance.js";

export class CreditBalanceService {
  constructor(private balances = new Map<string, CreditBalance>()) {}

  get(clientId: string): CreditBalance {
    return (
      this.balances.get(clientId) ?? {
        clientId,
        availableAmount: "0.00",
        movements: [],
      }
    );
  }
  accredit(
    clientId: string,
    amount: string,
    sourceId: string,
    userId: string,
  ): CreditBalance {
    const next = addCredit(this.get(clientId), amount, sourceId, userId);
    this.balances.set(clientId, next);
    return next;
  }
  apply(
    clientId: string,
    amount: string,
    obligationId: string,
    userId: string,
  ): CreditBalance {
    const next = applyCredit(this.get(clientId), amount, obligationId, userId);
    this.balances.set(clientId, next);
    return next;
  }
}
