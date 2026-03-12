export interface DetectedPrice {
  node: Text;
  currency: string;
  amount: number;
  originalText: string;
  startOffset: number;
  endOffset: number;
}

export interface ConvertedPrice {
  targetCurrency: string;
  amount: number;
  formatted: string;
}

export interface CachedRates {
  rates: Record<string, number>;
  timestamp: number;
  base: string;
}

export type DisplayMode = "tooltip" | "replacement";

export interface Settings {
  apiKey: string;
  homeCurrencies: string[];
  targetCurrencies: string[];
  displayMode: DisplayMode;
  refreshInterval: number; // minutes
  dollarDefault: string; // ISO code for ambiguous $
  blacklistedSites: string[];
  enableHighlight: boolean;
  isSetupComplete: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
  homeCurrencies: ["USD"],
  targetCurrencies: ["EUR", "GBP"],
  displayMode: "tooltip",
  refreshInterval: 60,
  dollarDefault: "USD",
  blacklistedSites: [],
  enableHighlight: true,
  isSetupComplete: false,
};

export interface MessageRequest {
  type: "GET_RATES" | "REFRESH_RATES" | "GET_SETTINGS";
}

export interface MessageResponse {
  success: boolean;
  data?: CachedRates | Settings;
  error?: string;
}

export const CURRENCY_LIST: { code: string; name: string; symbol: string }[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
  { code: "CLP", name: "Chilean Peso", symbol: "CL$" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$" },
  { code: "ARS", name: "Argentine Peso", symbol: "AR$" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "QAR", name: "Qatari Riyal", symbol: "QR" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴" },
  { code: "COP", name: "Colombian Peso", symbol: "COL$" },
  { code: "RON", name: "Romanian Leu", symbol: "lei" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/." },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв" },
  { code: "HRK", name: "Croatian Kuna", symbol: "kn" },
  { code: "ISK", name: "Icelandic Krona", symbol: "kr" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
  { code: "MMK", name: "Myanmar Kyat", symbol: "K" },
];
