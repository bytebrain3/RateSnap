import { useState, useMemo } from "react";
import { CURRENCY_LIST } from "../../lib/types";

interface Props {
  selected: string[];
  onChange: (currencies: string[]) => void;
}

export default function CurrencySelector({ selected, onChange }: Props) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return CURRENCY_LIST;
    const q = search.toLowerCase();
    return CURRENCY_LIST.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q),
    );
  }, [search]);

  const toggle = (code: string) => {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  const remove = (code: string) => {
    onChange(selected.filter((c) => c !== code));
  };

  return (
    <div className="currency-selector">
      {/* Selected tags */}
      <div className="selected-tags">
        {selected.map((code) => {
          const info = CURRENCY_LIST.find((c) => c.code === code);
          return (
            <span key={code} className="tag">
              {info?.symbol} {code}
              <button className="tag-remove" onClick={() => remove(code)}>
                ×
              </button>
            </span>
          );
        })}
      </div>

      {/* Search input */}
      <div className="selector-input-wrap">
        <input
          type="text"
          placeholder="Search currencies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="selector-input"
        />
        <button className="selector-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "▲" : "▼"}
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="selector-dropdown">
          {filtered.map((c) => (
            <label key={c.code} className="selector-option">
              <input
                type="checkbox"
                checked={selected.includes(c.code)}
                onChange={() => toggle(c.code)}
              />
              <span className="option-symbol">{c.symbol}</span>
              <span className="option-code">{c.code}</span>
              <span className="option-name">{c.name}</span>
            </label>
          ))}
          {filtered.length === 0 && (
            <div className="selector-empty">No currencies found</div>
          )}
        </div>
      )}
    </div>
  );
}
