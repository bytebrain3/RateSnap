import { useState, useEffect, useCallback } from "react";
import type { Settings, CachedRates, DisplayMode } from "../lib/types";
import { DEFAULT_SETTINGS } from "../lib/types";
import CurrencySelector from "./components/CurrencySelector";
import DisplayToggle from "./components/DisplayToggle";
import StatusBar from "./components/StatusBar";
import QuickConvert from "./components/QuickConvert";

export default function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [rates, setRates] = useState<CachedRates | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      chrome.runtime.sendMessage({ type: "GET_SETTINGS" }),
      chrome.runtime.sendMessage({ type: "GET_RATES" }),
    ]).then(([settingsResp, ratesResp]) => {
      if (settingsResp?.success)
        setSettings({
          ...DEFAULT_SETTINGS,
          ...(settingsResp.data as unknown as Settings),
        });
      if (ratesResp?.success) setRates(ratesResp.data as CachedRates);
      setLoading(false);
    });
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const updated = { ...settings, ...patch };
      setSettings(updated);
      await chrome.storage.sync.set({ settings: updated });
    },
    [settings],
  );

  const refreshRates = useCallback(async () => {
    const resp = await chrome.runtime.sendMessage({ type: "REFRESH_RATES" });
    if (resp?.success) setRates(resp.data as CachedRates);
  }, []);

  if (loading) {
    return (
      <div className="popup-container">
        <div className="popup-loading">Loading...</div>
      </div>
    );
  }

  if (!settings.isSetupComplete) {
    return (
      <div className="popup-container">
        <div className="popup-setup">
          <h2>Welcome!</h2>
          <p>Complete the setup to start converting currencies.</p>
          <button
            className="btn btn-primary"
            onClick={() => chrome.runtime.openOptionsPage()}
          >
            Open Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>💱 Currency Converter</h1>
        <button
          className="btn-icon"
          onClick={() => chrome.runtime.openOptionsPage()}
          title="Settings"
        >
          ⚙️
        </button>
      </header>

      <StatusBar rates={rates} onRefresh={refreshRates} />

      <section className="popup-section">
        <h3>Display Mode</h3>
        <DisplayToggle
          mode={settings.displayMode}
          onChange={(mode: DisplayMode) =>
            updateSettings({ displayMode: mode })
          }
        />
      </section>

      <section className="popup-section">
        <h3>Convert From</h3>
        <CurrencySelector
          selected={settings.homeCurrencies}
          onChange={(currencies: string[]) =>
            updateSettings({ homeCurrencies: currencies })
          }
        />
      </section>

      <section className="popup-section">
        <h3>Convert To</h3>
        <CurrencySelector
          selected={settings.targetCurrencies}
          onChange={(currencies: string[]) =>
            updateSettings({ targetCurrencies: currencies })
          }
        />
      </section>

      <section className="popup-section">
        <h3>Quick Convert</h3>
        <QuickConvert
          rates={rates}
          homeCurrencies={settings.homeCurrencies}
          targetCurrencies={settings.targetCurrencies}
        />
      </section>
    </div>
  );
}
