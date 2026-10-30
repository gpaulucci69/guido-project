import { ArsMoney } from "../../../../../packages/money/src/ars-money.js";

export type CreditMovementType =
  "SURPLUS" | "APPLICATION" | "CANCELLATION_REVERSAL";
export type CreditMovement = {
  type: CreditMovementType;
  amount: string;
  sourceId: string;
  createdByUserId: string;
};
export type CreditBalance = {
  clientId: string;
  availableAmount: string;
  movements: readonly CreditMovement[];
};

export function addCredit(
  balance: CreditBalance,
  amount: string,
  sourceId: string,
  userId: string,
): CreditBalance {
  const value = ArsMoney.parse(amount);
  if (!value.isPositive()) throw new Error("El importe debe ser mayor a cero");
  return {
    ...balance,
    availableAmount: ArsMoney.parse(balance.availableAmount)
      .add(value)
      .toString(),
    movements: [
      ...balance.movements,
      { type: "SURPLUS", amount, sourceId, createdByUserId: userId },
    ],
  };
}

export function applyCredit(
  balance: CreditBalance,
  amount: string,
  obligationId: string,
  userId: string,
): CreditBalance {
  const requested = ArsMoney.parse(amount);
  if (!requested.isPositive())
    throw new Error("El importe debe ser mayor a cero");
  const remaining = ArsMoney.parse(balance.availableAmount).subtract(requested);
  if (!remaining.isPositive() && remaining.toString() !== "0.00")
    throw new Error("Saldo a favor insuficiente");
  return {
    ...balance,
    availableAmount: remaining.toString(),
    movements: [
      ...balance.movements,
      {
        type: "APPLICATION",
        amount,
        sourceId: obligationId,
        createdByUserId: userId,
      },
    ],
  };
}
