import type { CachedRates } from "./types";

const CACHE_KEY = "exchangeRates";
const RATES_URL = "https://openexchangerates.org/api/latest.json";

export async function fetchRates(apiKey: string): Promise<CachedRates> {
  const url = `${RATES_URL}?app_id=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch rates: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  const cachedRates: CachedRates = {
    rates: data.rates,
    timestamp: Date.now(),
    base: data.base || "USD",
  };

  await chrome.storage.local.set({ [CACHE_KEY]: cachedRates });
  return cachedRates;
}

export async function getCachedRates(): Promise<CachedRates | null> {
  const result = await chrome.storage.local.get(CACHE_KEY);
  return result[CACHE_KEY] || null;
}

export function isStale(timestamp: number, maxAgeMinutes: number): boolean {
  const maxAgeMs = maxAgeMinutes * 60 * 1000;
  return Date.now() - timestamp > maxAgeMs;
}

export async function getOrFetchRates(
  apiKey: string,
  maxAgeMinutes: number,
): Promise<CachedRates> {
  const cached = await getCachedRates();
  if (cached && !isStale(cached.timestamp, maxAgeMinutes)) {
    return cached;
  }
  return fetchRates(apiKey);
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const url = `${RATES_URL}?app_id=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}
