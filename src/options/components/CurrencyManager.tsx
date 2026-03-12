import { useState, useMemo } from "react";
import { CURRENCY_LIST } from "../../lib/types";

interface Props {
  selected: string[];
  onChange: (currencies: string[]) => void;
}

export default function CurrencyManager({ selected, onChange }: Props) {
  const [search, setSearch] = useState("");

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

  const moveUp = (i: number) => {
    if (i === 0) return;
    const arr = [...selected];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    onChange(arr);
  };

  const moveDown = (i: number) => {
    if (i >= selected.length - 1) return;
    const arr = [...selected];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    onChange(arr);
  };

  return (
    <div className="currency-manager">
      {/* Active currencies — reorderable */}
      {selected.length > 0 && (
        <div className="active-currencies">
          {selected.map((code, i) => {
            const info = CURRENCY_LIST.find((c) => c.code === code);
            return (
              <div key={code} className="currency-row active">
                <span className="currency-info">
                  <span className="currency-symbol">{info?.symbol}</span>
                  <strong>{code}</strong>
                  <span className="currency-name">{info?.name}</span>
                </span>
                <span className="currency-actions">
                  <button
                    className="btn-sm"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                  >
                    ▲
                  </button>
                  <button
                    className="btn-sm"
                    onClick={() => moveDown(i)}
                    disabled={i === selected.length - 1}
                  >
                    ▼
                  </button>
                  <button
                    className="btn-sm btn-remove"
                    onClick={() => toggle(code)}
                  >
                    ✕
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Add currencies */}
      <input
        type="text"
        className="search-input"
        placeholder="Search to add currencies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="available-currencies">
        {filtered
          .filter((c) => !selected.includes(c.code))
          .map((c) => (
            <div
              key={c.code}
              className="currency-row available"
              onClick={() => toggle(c.code)}
            >
              <span className="currency-info">
                <span className="currency-symbol">{c.symbol}</span>
                <strong>{c.code}</strong>
                <span className="currency-name">{c.name}</span>
              </span>
              <button className="btn-sm btn-add">+ Add</button>
            </div>
          ))}
      </div>
    </div>
  );
}
