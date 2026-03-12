import { useState, useEffect, useCallback } from "react";
import type { Settings } from "../lib/types";
import { DEFAULT_SETTINGS } from "../lib/types";
import SetupWizard from "./components/SetupWizard";
import CurrencyManager from "./components/CurrencyManager";
import AdvancedSettings from "./components/AdvancedSettings";

export default function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get("settings").then((result) => {
      if (result.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...result.settings });
      }
      setLoading(false);
    });
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const updated = { ...settings, ...patch };
      setSettings(updated);
      await chrome.storage.sync.set({ settings: updated });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    [settings],
  );

  if (loading) {
    return (
      <div className="options-container">
        <div className="loading">Loading settings...</div>
      </div>
    );
  }

  // Show setup wizard on first run
  if (!settings.isSetupComplete) {
    return (
      <div className="options-container">
        <SetupWizard
          settings={settings}
          onComplete={(finalSettings) => {
            updateSettings({ ...finalSettings, isSetupComplete: true });
          }}
        />
      </div>
    );
  }

  return (
    <div className="options-container">
      <header className="options-header">
        <h1>💱 Currency Converter Pro — Settings</h1>
        {saved && <span className="saved-badge">✓ Saved</span>}
      </header>

      <div className="options-grid">
        <section className="options-card">
          <h2>Convert To</h2>
          <p className="card-desc">
            Select one or more currencies to convert prices into.
          </p>
          <CurrencyManager
            selected={settings.targetCurrencies}
            onChange={(currencies) =>
              updateSettings({ targetCurrencies: currencies })
            }
          />
        </section>

        <section className="options-card">
          <h2>Display</h2>
          <p className="card-desc">
            Choose how converted prices appear on pages.
          </p>
          <div className="form-group">
            <label className="form-label">Display Mode</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="displayMode"
                  value="tooltip"
                  checked={settings.displayMode === "tooltip"}
                  onChange={() => updateSettings({ displayMode: "tooltip" })}
                />
                <div>
                  <strong>Tooltip</strong>
                  <span>Show converted prices on hover</span>
                </div>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="displayMode"
                  value="replacement"
                  checked={settings.displayMode === "replacement"}
                  onChange={() =>
                    updateSettings({ displayMode: "replacement" })
                  }
                />
                <div>
                  <strong>Replacement</strong>
                  <span>Replace original prices inline</span>
                </div>
              </label>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={settings.enableHighlight}
                onChange={(e) =>
                  updateSettings({ enableHighlight: e.target.checked })
                }
              />
              <span>Highlight detected prices with underline</span>
            </label>
          </div>
        </section>

        <section className="options-card">
          <h2>Advanced</h2>
          <AdvancedSettings settings={settings} onUpdate={updateSettings} />
        </section>
      </div>
    </div>
  );
}
