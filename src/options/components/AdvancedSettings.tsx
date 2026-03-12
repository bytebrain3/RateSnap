import { useState } from "react";
import type { Settings } from "../../lib/types";
import { CURRENCY_LIST } from "../../lib/types";

interface Props {
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
}

export default function AdvancedSettings({ settings, onUpdate }: Props) {
  const [newBlacklist, setNewBlacklist] = useState("");

  const addBlacklist = () => {
    const site = newBlacklist.trim().toLowerCase();
    if (site && !settings.blacklistedSites.includes(site)) {
      onUpdate({
        blacklistedSites: [...settings.blacklistedSites, site],
      });
    }
    setNewBlacklist("");
  };

  const removeBlacklist = (site: string) => {
    onUpdate({
      blacklistedSites: settings.blacklistedSites.filter((s) => s !== site),
    });
  };

  return (
    <div className="advanced-settings">
      {/* API Key */}
      <div className="form-group">
        <label className="form-label">API Key</label>
        <input
          type="text"
          className="form-input"
          value={settings.apiKey}
          onChange={(e) => onUpdate({ apiKey: e.target.value })}
          placeholder="Open Exchange Rates app_id"
        />
      </div>

      {/* Convert From */}
      <div className="form-group">
        <label className="form-label">Convert From (Default Currency)</label>
        <select
          className="form-input"
          value={settings.homeCurrency}
          onChange={(e) => onUpdate({ homeCurrency: e.target.value })}
        >
          {CURRENCY_LIST.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Dollar disambiguation */}
      <div className="form-group">
        <label className="form-label">Default $ Currency</label>
        <p className="form-hint">
          When a bare $ symbol is detected and can&apos;t be determined from the
          website domain, use this currency.
        </p>
        <select
          className="form-input"
          value={settings.dollarDefault}
          onChange={(e) => onUpdate({ dollarDefault: e.target.value })}
        >
          {["USD", "AUD", "CAD", "HKD", "SGD", "NZD", "MXN", "TWD"].map(
            (code) => {
              const info = CURRENCY_LIST.find((c) => c.code === code);
              return (
                <option key={code} value={code}>
                  {info?.symbol} {code} — {info?.name}
                </option>
              );
            },
          )}
        </select>
      </div>

      {/* Refresh interval */}
      <div className="form-group">
        <label className="form-label">Refresh Interval</label>
        <select
          className="form-input"
          value={settings.refreshInterval}
          onChange={(e) =>
            onUpdate({ refreshInterval: parseInt(e.target.value) })
          }
        >
          <option value="15">Every 15 minutes</option>
          <option value="30">Every 30 minutes</option>
          <option value="60">Every 1 hour</option>
          <option value="360">Every 6 hours</option>
          <option value="1440">Every 24 hours</option>
        </select>
      </div>

      {/* Blacklisted sites */}
      <div className="form-group">
        <label className="form-label">Blacklisted Sites</label>
        <p className="form-hint">
          The extension won&apos;t run on these sites.
        </p>
        <div className="blacklist-input-row">
          <input
            type="text"
            className="form-input"
            placeholder="e.g. example.com"
            value={newBlacklist}
            onChange={(e) => setNewBlacklist(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addBlacklist()}
          />
          <button className="btn btn-secondary" onClick={addBlacklist}>
            Add
          </button>
        </div>
        {settings.blacklistedSites.length > 0 && (
          <div className="blacklist-tags">
            {settings.blacklistedSites.map((site) => (
              <span key={site} className="tag">
                {site}
                <button
                  className="tag-remove"
                  onClick={() => removeBlacklist(site)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Reset */}
      <div className="form-group">
        <button
          className="btn btn-danger"
          onClick={() => {
            if (confirm("Reset all settings to defaults?")) {
              onUpdate({
                isSetupComplete: false,
                apiKey: "",
                targetCurrencies: ["EUR", "GBP"],
                displayMode: "tooltip",
                refreshInterval: 60,
                dollarDefault: "USD",
                blacklistedSites: [],
                enableHighlight: true,
              });
            }
          }}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
