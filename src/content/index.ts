import type { CachedRates, Settings, DisplayMode } from "../lib/types";
import { detectPrices, detectPricesInContainers } from "./priceDetector";
import { displayConversions, clearConversions } from "./display";

let currentSettings: Settings | null = null;
let currentRates: CachedRates | null = null;
let observer: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

async function init() {
  // Load settings
  const settingsResp = await chrome.runtime.sendMessage({
    type: "GET_SETTINGS",
  });
  if (!settingsResp?.success || !settingsResp.data) return;

  currentSettings = settingsResp.data as unknown as Settings;
  if (!currentSettings.isSetupComplete) return;

  // Check if site is blacklisted
  const hostname = window.location.hostname;
  if (currentSettings.blacklistedSites.some((s) => hostname.includes(s)))
    return;

  // Load rates
  const ratesResp = await chrome.runtime.sendMessage({ type: "GET_RATES" });
  if (!ratesResp?.success || !ratesResp.data) return;

  currentRates = ratesResp.data as CachedRates;

  // Run initial scan
  scanAndConvert(document.body);

  // Watch for dynamic content
  startObserver();
}

function scanAndConvert(root: Node) {
  if (!currentSettings || !currentRates) return;
  if (currentSettings.targetCurrencies.length === 0) return;

  const { dollarDefault, targetCurrencies, displayMode } = currentSettings;
  const { rates, base } = currentRates;

  // Pass 1 — container scan (must run first so it claims split-price elements
  // before the text-node walker processes hidden accessibility siblings inside them)
  const containerPrices = detectPricesInContainers(root, dollarDefault);
  if (containerPrices.length > 0) {
    displayConversions(
      containerPrices,
      targetCurrencies,
      rates,
      base,
      displayMode,
    );
  }

  // Pass 2 — text-node scan (skips nodes inside already-processed containers)
  const textPrices = detectPrices(root, dollarDefault);
  if (textPrices.length > 0) {
    displayConversions(textPrices, targetCurrencies, rates, base, displayMode);
  }
}

function startObserver() {
  if (observer) observer.disconnect();

  observer = new MutationObserver((mutations) => {
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      const addedNodes = new Set<Node>();

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (
            node.nodeType === Node.ELEMENT_NODE ||
            node.nodeType === Node.TEXT_NODE
          ) {
            // Skip our own elements
            if (
              node instanceof Element &&
              (node.classList.contains("cc-ext-tooltip") ||
                node.classList.contains("cc-ext-converted") ||
                node.classList.contains("cc-ext-price-wrapper"))
            ) {
              continue;
            }
            addedNodes.add(node);
          }
        }
      }

      for (const node of addedNodes) {
        const root =
          node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
        if (root) scanAndConvert(root);
      }
    }, 300);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Listen for settings/rate changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.settings) {
    const newSettings = changes.settings.newValue as Settings;
    const needsRescan =
      !currentSettings ||
      newSettings.displayMode !== currentSettings.displayMode ||
      newSettings.targetCurrencies.join(",") !==
        currentSettings.targetCurrencies.join(",") ||
      newSettings.dollarDefault !== currentSettings.dollarDefault;

    currentSettings = newSettings;

    if (needsRescan) {
      clearConversions();
      scanAndConvert(document.body);
    }
  }
});

// Boot
init().catch((err) => {
  console.error("[CurrencyConverter] Init failed:", err);
});
