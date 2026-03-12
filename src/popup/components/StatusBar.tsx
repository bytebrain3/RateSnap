import type { CachedRates } from "../../lib/types";

interface Props {
  rates: CachedRates | null;
  onRefresh: () => void;
}

export default function StatusBar({ rates, onRefresh }: Props) {
  const getStatusText = () => {
    if (!rates) return "No rates loaded";
    const elapsed = Date.now() - rates.timestamp;
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return "Rates updated just now";
    if (minutes < 60) return `Updated ${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `Updated ${hours}h ago`;
  };

  return (
    <div className="status-bar">
      <span className={`status-dot ${rates ? "online" : "offline"}`} />
      <span className="status-text">{getStatusText()}</span>
      <button className="btn-refresh" onClick={onRefresh} title="Refresh rates">
        🔄
      </button>
    </div>
  );
}
