export const ARS_CURRENCY = "ARS" as const;
const SCALE = 100n;

export class ArsMoney {
  private constructor(private readonly cents: bigint) {}
  static parse(value: string): ArsMoney {
    if (!/^\d+(\.\d{1,2})?$/.test(value))
      throw new Error("Importe ARS inválido");
    const parts = value.split(".");
    const whole = parts[0] ?? "0";
    const fraction = parts[1] ?? "";
    return new ArsMoney(
      BigInt(whole) * SCALE + BigInt(fraction.padEnd(2, "0")),
    );
  }
  static fromCents(cents: bigint): ArsMoney {
    return new ArsMoney(cents);
  }
  add(other: ArsMoney): ArsMoney {
    return new ArsMoney(this.cents + other.cents);
  }
  subtract(other: ArsMoney): ArsMoney {
    return new ArsMoney(this.cents - other.cents);
  }
  isPositive(): boolean {
    return this.cents > 0n;
  }
  isZero(): boolean {
    return this.cents === 0n;
  }
  isNegative(): boolean {
    return this.cents < 0n;
  }
  greaterThan(other: ArsMoney): boolean {
    return this.cents > other.cents;
  }
  toString(): string {
    return `${this.cents / SCALE}.${(this.cents % SCALE).toString().padStart(2, "0")}`;
  }
  format(locale = "es-AR"): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: ARS_CURRENCY,
    }).format(Number(this.cents) / 100);
  }
}
