import type { DisplayMode } from "../../lib/types";

interface Props {
  mode: DisplayMode;
  onChange: (mode: DisplayMode) => void;
}

export default function DisplayToggle({ mode, onChange }: Props) {
  return (
    <div className="display-toggle">
      <button
        className={`toggle-btn ${mode === "tooltip" ? "active" : ""}`}
        onClick={() => onChange("tooltip")}
      >
        <span className="toggle-icon">💬</span>
        <span>Tooltip</span>
      </button>
      <button
        className={`toggle-btn ${mode === "replacement" ? "active" : ""}`}
        onClick={() => onChange("replacement")}
      >
        <span className="toggle-icon">🔄</span>
        <span>Replace</span>
      </button>
    </div>
  );
}
