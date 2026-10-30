export function formatARS(amount: string | number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(typeof amount === "number" ? amount : Number(amount));
}
