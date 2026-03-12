import {
  getOrFetchRates,
  fetchRates,
  getCachedRates,
} from "../lib/exchangeRates";
import { getSettings } from "../lib/storage";
import type {
  MessageRequest,
  MessageResponse,
  CachedRates,
  Settings,
} from "../lib/types";

const ALARM_NAME = "refreshRates";

// Initialize on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    // Open options page for first-time setup
    chrome.tabs.create({
      url: chrome.runtime.getURL("src/options/index.html"),
    });
  }
  await setupAlarm();
});

// Set up periodic rate refresh alarm
async function setupAlarm() {
  const settings = await getSettings(); // Get current settings to determine refresh interval
  await chrome.alarms.clear(ALARM_NAME);
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: settings.refreshInterval,
  });
}

// Handle alarm — refresh rates
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    const settings = await getSettings();
    if (settings.apiKey) {
      try {
        await fetchRates(settings.apiKey);
      } catch (e) {
        console.error("[CurrencyConverter] Failed to refresh rates:", e);
      }
    }
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener(
  (
    message: MessageRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void,
  ) => {
    handleMessage(message)
      .then(sendResponse)
      .catch((err) => {
        sendResponse({ success: false, error: String(err) });
      });
    return true; // keep channel open for async response
  },
);

async function handleMessage(
  message: MessageRequest,
): Promise<MessageResponse> {
  switch (message.type) {
    case "GET_RATES": {
      const settings = await getSettings();
      if (!settings.apiKey) {
        return { success: false, error: "API key not configured" };
      }
      const rates = await getOrFetchRates(
        settings.apiKey,
        settings.refreshInterval,
      );
      return { success: true, data: rates as CachedRates };
    }

    case "REFRESH_RATES": {
      const settings = await getSettings();
      if (!settings.apiKey) {
        return { success: false, error: "API key not configured" };
      }
      const rates = await fetchRates(settings.apiKey);
      return { success: true, data: rates as CachedRates };
    }

    case "GET_SETTINGS": {
      const settings = await getSettings();
      return { success: true, data: settings as unknown as Settings };
    }

    default:
      return { success: false, error: "Unknown message type" };
  }
}

// Listen for settings changes to update alarm interval
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.settings) {
    setupAlarm();
  }
});
