import { ArsMoney } from "../../../../../packages/money/src/ars-money.js";

export type ObligationStatus =
  "PENDING" | "OVERDUE" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
export type Obligation = {
  id: string;
  tenantId: string;
  clientId: string;
  serviceDescription: string;
  periodStartDate: string;
  periodEndDate: string;
  dueDate: string;
  currency: "ARS";
  totalAmount: ArsMoney;
  balanceDue: ArsMoney;
  status: ObligationStatus;
};

export type CreateObligationInput = Omit<
  Obligation,
  "currency" | "balanceDue" | "status" | "totalAmount"
> & { totalAmount: string };
export function createObligation(input: CreateObligationInput): Obligation {
  const totalAmount = ArsMoney.parse(input.totalAmount);
  if (!totalAmount.isPositive())
    throw new Error("El importe debe ser mayor a cero");
  if (input.periodStartDate > input.periodEndDate)
    throw new Error("El período es inválido");
  if (input.dueDate < input.periodEndDate)
    throw new Error("El vencimiento no puede preceder al período");
  return {
    ...input,
    currency: "ARS",
    totalAmount,
    balanceDue: totalAmount,
    status: "PENDING",
  };
}

export function cancelObligation(
  obligation: Obligation,
  reason: string,
): Obligation {
  if (!reason.trim())
    throw new Error("El motivo de cancelación es obligatorio");
  if (obligation.status === "CANCELLED" || obligation.status === "PAID")
    throw new Error("La obligación no puede cancelarse");
  return { ...obligation, status: "CANCELLED" };
}
