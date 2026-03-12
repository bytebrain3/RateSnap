import type { ConvertedPrice } from "../lib/types";

export function convert(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
  base: string,
): number {
  if (from === to) return amount;

  // All rates are relative to base (usually USD)
  // Convert: amount in `from` → base → `to`
  const fromRate = from === base ? 1 : rates[from];
  const toRate = to === base ? 1 : rates[to];

  if (!fromRate || !toRate) return NaN;

  return (amount / fromRate) * toRate;
}

export function convertToMultiple(
  amount: number,
  from: string,
  targetCurrencies: string[],
  rates: Record<string, number>,
  base: string,
): ConvertedPrice[] {
  return targetCurrencies
    .filter((to) => to !== from)
    .map((to) => {
      const converted = convert(amount, from, to, rates, base);
      return {
        targetCurrency: to,
        amount: converted,
        formatted: formatCurrency(converted, to),
      };
    })
    .filter((p) => !isNaN(p.amount));
}

export function formatCurrency(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback for unsupported currencies
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}
