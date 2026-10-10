/** Card processing fee shown before checkout. The backend's CARD_FEE_PERCENT is the source of truth at payment. */
export const CARD_FEE_PERCENT = Number(process.env.NEXT_PUBLIC_CARD_FEE_PERCENT ?? "2.5");

export function formatMoney(value: number | string, currency = "NZD") {
  const amount = typeof value === "string" ? Number(value) : value;
  try {
    return new Intl.NumberFormat("en-NZ", { style: "currency", currency }).format(Number.isFinite(amount) ? amount : 0);
  } catch {
    return `$${(Number.isFinite(amount) ? amount : 0).toFixed(2)}`;
  }
}

/** Mirrors the backend rounding (half up to the cent). */
export function cardFee(subtotal: number, percent = CARD_FEE_PERCENT) {
  return Math.round((subtotal * percent) / 100 * 100 + Number.EPSILON) / 100;
}
