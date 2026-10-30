import type { Obligation } from "../../../billing-workflow-service/src/obligations/domain/obligation.js";
import { ArsMoney } from "../../../../packages/money/src/ars-money.js";

export function transitionOverdue(
  obligation: Obligation,
  today: string,
): Obligation {
  if (
    obligation.status === "PENDING" &&
    today > obligation.dueDate &&
    ArsMoney.parse(obligation.balanceDue.toString()).isPositive()
  ) {
    return { ...obligation, status: "OVERDUE" };
  }
  return obligation;
}

export class OverdueTransitionService {
  transition(obligations: readonly Obligation[], today: string): Obligation[] {
    return obligations.map((obligation) =>
      transitionOverdue(obligation, today),
    );
  }
}
