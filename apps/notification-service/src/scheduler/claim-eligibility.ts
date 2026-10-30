import type { Obligation } from '../../../billing-workflow-service/src/obligations/domain/obligation.js';
export function eligibleForClaim(obligation: Obligation, today: string, graceAfterDueDays: number): boolean {
  if (obligation.balanceDue.isPositive() === false || obligation.status === 'CANCELLED' || obligation.status === 'PAID') return false;
  const due = new Date(`${obligation.dueDate}T00:00:00-03:00`).getTime();
  const current = new Date(`${today}T00:00:00-03:00`).getTime();
  return current >= due + graceAfterDueDays * 86_400_000;
}
