import { formatARS } from "../../lib/formatters/ars.js";
export function creditWarning(availableAmount: string): string | undefined {
  return availableAmount !== "0.00"
    ? `Saldo a favor disponible: ${formatARS(availableAmount)}`
    : undefined;
}
