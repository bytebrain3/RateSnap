import type { Settings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const SETTINGS_KEY = "settings";

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...result[SETTINGS_KEY] };
}

export async function saveSettings(
  settings: Partial<Settings>,
): Promise<Settings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await chrome.storage.sync.set({ [SETTINGS_KEY]: updated });
  return updated;
}
