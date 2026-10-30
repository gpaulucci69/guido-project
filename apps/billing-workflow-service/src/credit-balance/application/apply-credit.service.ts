import { ArsMoney } from '../../../../../packages/money/src/ars-money.js';
import type { ObligationRepository } from '../../obligations/infrastructure/obligation.repository.js';
import type { CreditBalanceService } from './credit-balance.service.js';

export class ApplyCreditService {
  constructor(
    private readonly obligations: ObligationRepository,
    private readonly credits: CreditBalanceService,
  ) {}

  async execute(input: { tenantId: string; obligationId: string; amount: string; userId: string }) {
    const obligation = await this.obligations.findById(input.tenantId, input.obligationId);
    if (!obligation) throw new Error('Obligación no encontrada');
    const amount = ArsMoney.parse(input.amount);
    const balance = obligation.balanceDue;
    if (amount.isZero() || amount.isNegative()) throw new Error('El importe debe ser mayor a cero');
    if (amount.greaterThan(balance)) throw new Error('El importe supera el saldo de la obligación');
    const nextCredit = this.credits.apply(obligation.clientId, input.amount, obligation.id, input.userId);
    const nextBalance = balance.subtract(amount);
    const updated = await this.obligations.update({
      ...obligation,
      balanceDue: nextBalance,
      status: nextBalance.isZero() ? 'PAID' : 'PARTIALLY_PAID',
    });
    return { obligation: updated, credit: nextCredit };
  }
}
