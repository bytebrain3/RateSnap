import { useState, useMemo } from "react";
import type { CachedRates } from "../../lib/types";
import { CURRENCY_LIST } from "../../lib/types";
import { formatCurrency } from "../../content/converter";

interface Props {
  rates: CachedRates | null;
  homeCurrency: string;
  targetCurrencies: string[];
}

export default function QuickConvert({
  rates,
  homeCurrency,
  targetCurrencies,
}: Props) {
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState(homeCurrency);
  const [to, setTo] = useState(targetCurrencies[0] || "EUR");
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const numAmount = parseFloat(amount);
  const isValid = !isNaN(numAmount) && numAmount > 0 && rates;

  const fromInfo = CURRENCY_LIST.find((c) => c.code === from);
  const toInfo = CURRENCY_LIST.find((c) => c.code === to);

  const filteredFrom = useMemo(() => {
    if (!fromSearch.trim()) return CURRENCY_LIST;
    const q = fromSearch.toLowerCase();
    return CURRENCY_LIST.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q),
    );
  }, [fromSearch]);

  const filteredTo = useMemo(() => {
    if (!toSearch.trim()) return CURRENCY_LIST;
    const q = toSearch.toLowerCase();
    return CURRENCY_LIST.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q),
    );
  }, [toSearch]);

  const converted =
    isValid && rates
      ? (() => {
          const fromRate = from === rates.base ? 1 : rates.rates[from] || 1;
          const toRate = to === rates.base ? 1 : rates.rates[to] || 1;
          return (numAmount / fromRate) * toRate;
        })()
      : null;

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="quick-convert">
      {/* Amount */}
      <input
        type="number"
        placeholder="Enter amount..."
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="0"
        step="any"
        className="qc-amount-input"
      />

      <div className="qc-selectors">
        {/* FROM */}
        <div className="qc-select-group">
          <label className="qc-label">From</label>
          <div className="qc-select-wrap">
            <button
              className="qc-select-btn"
              onClick={() => {
                setFromOpen(!fromOpen);
                setToOpen(false);
              }}
            >
              <span className="qc-btn-symbol">{fromInfo?.symbol}</span>
              <span className="qc-btn-code">{from}</span>
              <span className="qc-btn-arrow">{fromOpen ? "▲" : "▼"}</span>
            </button>
            {fromOpen && (
              <div className="qc-dropdown">
                <input
                  type="text"
                  className="qc-dropdown-search"
                  placeholder="Search currency..."
                  value={fromSearch}
                  onChange={(e) => setFromSearch(e.target.value)}
                  autoFocus
                />
                <div className="qc-dropdown-list">
                  {filteredFrom.map((c) => (
                    <button
                      key={c.code}
                      className={`qc-dropdown-item ${c.code === from ? "active" : ""}`}
                      onClick={() => {
                        setFrom(c.code);
                        setFromOpen(false);
                        setFromSearch("");
                      }}
                    >
                      <span className="qc-item-symbol">{c.symbol}</span>
                      <span className="qc-item-code">{c.code}</span>
                      <span className="qc-item-name">{c.name}</span>
                    </button>
                  ))}
                  {filteredFrom.length === 0 && (
                    <div className="qc-dropdown-empty">No match</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Swap button */}
        <button className="qc-swap-btn" onClick={swap} title="Swap currencies">
          ⇄
        </button>

        {/* TO */}
        <div className="qc-select-group">
          <label className="qc-label">To</label>
          <div className="qc-select-wrap">
            <button
              className="qc-select-btn"
              onClick={() => {
                setToOpen(!toOpen);
                setFromOpen(false);
              }}
            >
              <span className="qc-btn-symbol">{toInfo?.symbol}</span>
              <span className="qc-btn-code">{to}</span>
              <span className="qc-btn-arrow">{toOpen ? "▲" : "▼"}</span>
            </button>
            {toOpen && (
              <div className="qc-dropdown">
                <input
                  type="text"
                  className="qc-dropdown-search"
                  placeholder="Search currency..."
                  value={toSearch}
                  onChange={(e) => setToSearch(e.target.value)}
                  autoFocus
                />
                <div className="qc-dropdown-list">
                  {filteredTo.map((c) => (
                    <button
                      key={c.code}
                      className={`qc-dropdown-item ${c.code === to ? "active" : ""}`}
                      onClick={() => {
                        setTo(c.code);
                        setToOpen(false);
                        setToSearch("");
                      }}
                    >
                      <span className="qc-item-symbol">{c.symbol}</span>
                      <span className="qc-item-code">{c.code}</span>
                      <span className="qc-item-name">{c.name}</span>
                    </button>
                  ))}
                  {filteredTo.length === 0 && (
                    <div className="qc-dropdown-empty">No match</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result */}
      {converted !== null && (
        <div className="qc-result">
          <div className="qc-result-from">
            {fromInfo?.symbol}
            {numAmount.toLocaleString()} {from}
          </div>
          <div className="qc-result-equals">=</div>
          <div className="qc-result-to">{formatCurrency(converted, to)}</div>
        </div>
      )}
    </div>
  );
}
