// Maps currency symbols and keywords to ISO 4217 codes
// Handles ambiguous symbols like $ based on TLD context

export interface CurrencyPattern {
  symbol: string;
  code: string;
  // regex pattern for matching this currency's price format
  pattern: RegExp;
}

// Symbol → default ISO code mapping
const SYMBOL_TO_CODE: Record<string, string> = {
  $: "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "₹": "INR",
  "৳": "BDT",
  "₩": "KRW",
  "₺": "TRY",
  "₽": "RUB",
  "₱": "PHP",
  "₪": "ILS",
  "₫": "VND",
  "₦": "NGN",
  "₴": "UAH",
  "฿": "THB",
  zł: "PLN",
  Kč: "CZK",
  Ft: "HUF",
  lei: "RON",
  лв: "BGN",
  kr: "SEK", // also NOK, DKK, ISK — disambiguated by TLD
  R$: "BRL",
  "S/.": "PEN",
  RM: "MYR",
  Rp: "IDR",
  "₨": "PKR",
  Rs: "LKR",
  KSh: "KES",
  Fr: "CHF",
};

// Prefixed dollar signs → specific code
const DOLLAR_PREFIX_TO_CODE: Record<string, string> = {
  US$: "USD",
  "US $": "USD",
  A$: "AUD",
  AU$: "AUD",
  C$: "CAD",
  CA$: "CAD",
  HK$: "HKD",
  S$: "SGD",
  NZ$: "NZD",
  MX$: "MXN",
  CL$: "CLP",
  AR$: "ARS",
  NT$: "TWD",
  COL$: "COP",
  "E£": "EGP",
};

// ISO code → code (for "USD 1234" or "1234 USD" patterns)
const CODE_SET = new Set([
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CNY",
  "INR",
  "BDT",
  "AUD",
  "CAD",
  "CHF",
  "HKD",
  "SGD",
  "SEK",
  "KRW",
  "NOK",
  "NZD",
  "MXN",
  "ZAR",
  "BRL",
  "TRY",
  "RUB",
  "PLN",
  "THB",
  "IDR",
  "MYR",
  "PHP",
  "CZK",
  "ILS",
  "CLP",
  "PKR",
  "AED",
  "SAR",
  "TWD",
  "ARS",
  "EGP",
  "VND",
  "NGN",
  "KES",
  "QAR",
  "UAH",
  "COP",
  "RON",
  "PEN",
  "HUF",
  "DKK",
  "BGN",
  "HRK",
  "ISK",
  "LKR",
  "MMK",
]);

// TLD → dollar code (for disambiguating bare $)
const TLD_TO_DOLLAR: Record<string, string> = {
  ".au": "AUD",
  ".com.au": "AUD",
  ".ca": "CAD",
  ".hk": "HKD",
  ".sg": "SGD",
  ".nz": "NZD",
  ".mx": "MXN",
  ".tw": "TWD",
  ".ar": "ARS",
  ".cl": "CLP",
  ".co": "COP",
};

// TLD → krona/krone code
const TLD_TO_KRONE: Record<string, string> = {
  ".se": "SEK",
  ".no": "NOK",
  ".dk": "DKK",
  ".is": "ISK",
};

export function getDollarCode(dollarDefault: string): string {
  const hostname = window.location.hostname;
  for (const [tld, code] of Object.entries(TLD_TO_DOLLAR)) {
    if (hostname.endsWith(tld)) return code;
  }
  return dollarDefault || "USD";
}

export function getKroneCode(): string {
  const hostname = window.location.hostname;
  for (const [tld, code] of Object.entries(TLD_TO_KRONE)) {
    if (hostname.endsWith(tld)) return code;
  }
  return "SEK";
}

// Number pattern: handles 1,234.56  1.234,56  1234.56  1234  1 234,56
const NUM_STANDARD = String.raw`\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?`; // 1,234.56
const NUM_EUROPEAN = String.raw`\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?`; // 1.234,56
const NUM_PLAIN = String.raw`\d+(?:[.,]\d{1,2})?`; // 1234.56 or 1234,56
const NUM_PATTERN = `(?:${NUM_STANDARD}|${NUM_EUROPEAN}|${NUM_PLAIN})`;

// Build the symbol prefix pattern
const escapedSymbols = Object.keys(SYMBOL_TO_CODE)
  .concat(Object.keys(DOLLAR_PREFIX_TO_CODE))
  .sort((a, b) => b.length - a.length) // longest first
  .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

const symbolPrefixPattern = escapedSymbols.join("|");

// Code pattern (before or after number)
const codePattern = Array.from(CODE_SET).join("|");

// Full price regex: (symbol)(space?)(number) or (number)(space?)(symbol/code) or (code)(space)(number)
export const PRICE_REGEX = new RegExp(
  `(?:` +
    // Symbol/prefix before number: $1,234.56 or € 1.234,56
    `(?<prefixSymbol>${symbolPrefixPattern})\\s?(?<prefixNum>${NUM_PATTERN})` +
    `|` +
    // Code before number: USD 1234.56
    `(?<prefixCode>${codePattern})\\s(?<prefixCodeNum>${NUM_PATTERN})` +
    `|` +
    // Number followed by code: 1234.56 USD
    `(?<suffixNum>${NUM_PATTERN})\\s?(?<suffixCode>${codePattern})` +
    `)`,
  "g",
);

export function parseAmount(numStr: string): number {
  // Determine format: if has both . and , check which is last (that's the decimal sep)
  const lastDot = numStr.lastIndexOf(".");
  const lastComma = numStr.lastIndexOf(",");

  if (lastDot > -1 && lastComma > -1) {
    if (lastDot > lastComma) {
      // Standard: 1,234.56 → remove commas
      return parseFloat(numStr.replace(/,/g, ""));
    } else {
      // European: 1.234,56 → remove dots, replace comma with dot
      return parseFloat(numStr.replace(/\./g, "").replace(",", "."));
    }
  }

  if (lastComma > -1 && numStr.indexOf(",") === lastComma) {
    // Single comma: could be 1234,56 (decimal) or 1,234 (thousands)
    const afterComma = numStr.substring(lastComma + 1);
    if (afterComma.length <= 2) {
      // Decimal separator: 1234,56
      return parseFloat(numStr.replace(",", "."));
    }
    // Thousands separator: 1,234
    return parseFloat(numStr.replace(",", ""));
  }

  // Plain number or standard format with dots only
  return parseFloat(numStr.replace(/,/g, ""));
}

export function resolveSymbolToCode(
  symbol: string,
  dollarDefault: string,
): string {
  // Check prefixed dollars first
  if (DOLLAR_PREFIX_TO_CODE[symbol]) {
    return DOLLAR_PREFIX_TO_CODE[symbol];
  }

  // Plain $
  if (symbol === "$") {
    return getDollarCode(dollarDefault);
  }

  // kr → check TLD
  if (symbol === "kr") {
    return getKroneCode();
  }

  return SYMBOL_TO_CODE[symbol] || "USD";
}

export { CODE_SET };
