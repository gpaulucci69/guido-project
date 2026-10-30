import type { CreditBalanceService } from './credit-balance.service.js';

export class AccreditSurplusService {
  constructor(private readonly credits: CreditBalanceService) {}

  execute(input: { clientId: string; paymentId: string; surplus: string; userId: string }) {
    return this.credits.accredit(input.clientId, input.surplus, input.paymentId, input.userId);
  }
}
