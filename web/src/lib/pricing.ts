/** Numeric values used for sorting only; public-facing prices keep their original text. */
export type ParsedVehiclePrice = {
  amount: number;
  currency: 'ARS' | 'USD';
};

/**
 * Accept Argentine integer price formats (e.g. "$ 28.500.000",
 * "U$D 19.900", "USD $ 19,900") and reject ambiguous free-form text.
 * A price written without a currency is treated as ARS.
 */
export function parseVehiclePrice(value: string | null | undefined): ParsedVehiclePrice | null {
  if (!value) return null;
  const text = value.trim();
  const isUsd = /^(?:U\$D|U\$S|USD|US\$)\s*/i.test(text);
  const numericText = text
    .replace(/^(?:U\$D|U\$S|USD|US\$|ARS|AR\$)\s*/i, '')
    .replace(/^\$\s*/, '')
    .trim();

  // Whole-number pesos/dollars; grouping separators must be valid thousands.
  if (!/^(?:\d+|\d{1,3}(?:[.,]\d{3})+)$/.test(numericText)) return null;
  const amount = Number(numericText.replace(/[.,]/g, ''));
  if (!Number.isSafeInteger(amount) || amount <= 0) return null;
  return { amount, currency: isUsd ? 'USD' : 'ARS' };
}

export function comparableVehiclePrice(value: string | null, blueDollarRate: number | null): number | null {
  const parsed = parseVehiclePrice(value);
  if (!parsed) return null;
  if (parsed.currency === 'ARS') return parsed.amount;
  if (blueDollarRate === null || !Number.isFinite(blueDollarRate) || blueDollarRate <= 0) return null;
  return parsed.amount * blueDollarRate;
}

export const MAX_QUOTE_AGE_MS = 24 * 60 * 60 * 1000;

export function isRecentBlueQuote(rate: number, fetchedAt: number, now: number): boolean {
  return Number.isFinite(rate) && rate > 0 && rate < 100000
    && Number.isFinite(fetchedAt) && fetchedAt <= now
    && now - fetchedAt <= MAX_QUOTE_AGE_MS;
}
