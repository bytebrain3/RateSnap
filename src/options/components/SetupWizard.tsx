import { useState } from "react";
import type { Settings } from "../../lib/types";
import { CURRENCY_LIST } from "../../lib/types";
import { validateApiKey } from "../../lib/exchangeRates";

interface Props {
  settings: Settings;
  onComplete: (settings: Partial<Settings>) => void;
}

type Step = "apiKey" | "homeCurrency" | "targetCurrencies" | "displayMode";

const STEPS: Step[] = [
  "apiKey",
  "homeCurrency",
  "targetCurrencies",
  "displayMode",
];

const POPULAR_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "INR",
  "BDT",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
  "KRW",
  "BRL",
  "MXN",
  "SGD",
  "HKD",
];

export default function SetupWizard({ settings, onComplete }: Props) {
  const [step, setStep] = useState<Step>("apiKey");
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [homeCurrencies, setHomeCurrencies] = useState<string[]>(
    settings.homeCurrencies?.length ? settings.homeCurrencies : ["USD"],
  );
  const [targets, setTargets] = useState<string[]>(settings.targetCurrencies);
  const [displayMode, setDisplayMode] = useState(settings.displayMode);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");

  const stepIndex = STEPS.indexOf(step);
  const isLast = stepIndex === STEPS.length - 1;

  const next = async () => {
    if (step === "apiKey") {
      if (!apiKey.trim()) {
        setError("Please enter your API key");
        return;
      }
      setValidating(true);
      setError("");
      const valid = await validateApiKey(apiKey.trim());
      setValidating(false);
      if (!valid) {
        setError("Invalid API key. Please check and try again.");
        return;
      }
    }
    if (step === "homeCurrency" && homeCurrencies.length === 0) {
      setError("Select at least one source currency");
      return;
    }
    if (step === "targetCurrencies" && targets.length === 0) {
      setError("Select at least one target currency");
      return;
    }

    if (isLast) {
      onComplete({
        apiKey: apiKey.trim(),
        homeCurrencies,
        targetCurrencies: targets,
        displayMode,
      });
    } else {
      setError("");
      setStep(STEPS[stepIndex + 1]);
    }
  };

  const back = () => {
    if (stepIndex > 0) {
      setError("");
      setStep(STEPS[stepIndex - 1]);
    }
  };

  const toggleTarget = (code: string) => {
    setError("");
    if (targets.includes(code)) {
      setTargets(targets.filter((c) => c !== code));
    } else {
      setTargets([...targets, code]);
    }
  };

  const toggleHomeCurrency = (code: string) => {
    setError("");
    if (homeCurrencies.includes(code)) {
      // keep at least one selected
      if (homeCurrencies.length > 1)
        setHomeCurrencies(homeCurrencies.filter((c) => c !== code));
    } else {
      setHomeCurrencies([...homeCurrencies, code]);
    }
  };

  return (
    <div className="wizard">
      <div className="wizard-header">
        <h1>💱 Currency Converter Pro</h1>
        <p className="wizard-subtitle">
          Let&apos;s get you set up in a few quick steps
        </p>
        <div className="wizard-progress">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`progress-dot ${i <= stepIndex ? "active" : ""}`}
            />
          ))}
        </div>
      </div>

      <div className="wizard-body">
        {step === "apiKey" && (
          <div className="wizard-step">
            <h2>1. API Key</h2>
            <p>
              Enter your <strong>Open Exchange Rates</strong> API key. Get a
              free one at{" "}
              <a
                href="https://openexchangerates.org/signup/free"
                target="_blank"
                rel="noopener noreferrer"
              >
                openexchangerates.org/signup/free
              </a>
            </p>
            <input
              type="text"
              className="wizard-input"
              placeholder="Your app_id (e.g. abc123def456...)"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError("");
              }}
              autoFocus
            />
          </div>
        )}

        {step === "homeCurrency" && (
          <div className="wizard-step">
            <h2>2. Convert From</h2>
            <p>
              Select one or more currencies you want to convert{" "}
              <strong>from</strong>. Pick all currencies you commonly use.
            </p>
            <div className="wizard-chips">
              <div className="chips-label">Popular:</div>
              <div className="chips-grid">
                {POPULAR_CURRENCIES.map((code) => {
                  const info = CURRENCY_LIST.find((c) => c.code === code);
                  return (
                    <button
                      key={code}
                      className={`chip ${
                        homeCurrencies.includes(code) ? "selected" : ""
                      }`}
                      onClick={() => toggleHomeCurrency(code)}
                    >
                      {info?.symbol} {code}
                    </button>
                  );
                })}
              </div>
              <div className="chips-label" style={{ marginTop: 12 }}>
                All currencies:
              </div>
              <div className="chips-grid chips-all">
                {CURRENCY_LIST.filter(
                  (c) => !POPULAR_CURRENCIES.includes(c.code),
                ).map((c) => (
                  <button
                    key={c.code}
                    className={`chip chip-small ${
                      homeCurrencies.includes(c.code) ? "selected" : ""
                    }`}
                    onClick={() => toggleHomeCurrency(c.code)}
                  >
                    {c.symbol} {c.code}
                  </button>
                ))}
              </div>
            </div>
            {homeCurrencies.length > 0 && (
              <div className="wizard-selection">
                Selected: {homeCurrencies.join(", ")}
              </div>
            )}
          </div>
        )}

        {step === "targetCurrencies" && (
          <div className="wizard-step">
            <h2>3. Convert To</h2>
            <p>
              Select the currencies you want prices converted{" "}
              <strong>to</strong>. You can pick multiple.
            </p>
            <div className="wizard-chips">
              <div className="chips-label">Popular:</div>
              <div className="chips-grid">
                {POPULAR_CURRENCIES.map((code) => {
                  const info = CURRENCY_LIST.find((c) => c.code === code);
                  return (
                    <button
                      key={code}
                      className={`chip ${targets.includes(code) ? "selected" : ""}`}
                      onClick={() => toggleTarget(code)}
                    >
                      {info?.symbol} {code}
                    </button>
                  );
                })}
              </div>
              <div className="chips-label" style={{ marginTop: 12 }}>
                All currencies:
              </div>
              <div className="chips-grid chips-all">
                {CURRENCY_LIST.filter(
                  (c) => !POPULAR_CURRENCIES.includes(c.code),
                ).map((c) => (
                  <button
                    key={c.code}
                    className={`chip chip-small ${targets.includes(c.code) ? "selected" : ""}`}
                    onClick={() => toggleTarget(c.code)}
                  >
                    {c.symbol} {c.code}
                  </button>
                ))}
              </div>
            </div>
            {targets.length > 0 && (
              <div className="wizard-selection">
                Selected: {targets.join(", ")}
              </div>
            )}
          </div>
        )}

        {step === "displayMode" && (
          <div className="wizard-step">
            <h2>4. Display Mode</h2>
            <p>How should converted prices appear on web pages?</p>
            <div className="wizard-mode-cards">
              <label
                className={`mode-card ${displayMode === "tooltip" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="mode"
                  checked={displayMode === "tooltip"}
                  onChange={() => setDisplayMode("tooltip")}
                />
                <div className="mode-card-content">
                  <span className="mode-icon">💬</span>
                  <strong>Tooltip</strong>
                  <span>
                    Hover over a price to see conversions in a popup card
                  </span>
                </div>
              </label>
              <label
                className={`mode-card ${displayMode === "replacement" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="mode"
                  checked={displayMode === "replacement"}
                  onChange={() => setDisplayMode("replacement")}
                />
                <div className="mode-card-content">
                  <span className="mode-icon">🔄</span>
                  <strong>Replacement</strong>
                  <span>
                    Replace original prices with converted values inline
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

        {error && <div className="wizard-error">{error}</div>}

        <div className="wizard-actions">
          {stepIndex > 0 && (
            <button className="btn btn-secondary" onClick={back}>
              ← Back
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={next}
            disabled={validating}
          >
            {validating
              ? "Validating..."
              : isLast
                ? "Finish Setup ✓"
                : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
