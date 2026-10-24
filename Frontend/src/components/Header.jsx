export default function Header({ currentView, onViewChange }) {
  return (
    <header className="dashboard-header">
      <div className="header-text">
        <h1 className="header-title">Wind Forecast Dashboard</h1>
        <p className="header-subtitle">
          Day-ahead wind generation forecasts and real-time accuracy benchmarks for UK power traders.
        </p>
      </div>

      {/* State toggle to easily review required dashboard states */}
      <div className="state-switcher" role="group" aria-label="Dashboard State Preview">
        <span className="state-switcher-label">View State:</span>
        <button
          type="button"
          className={"state-btn" + (currentView === "ready" ? " active" : "")}
          onClick={() => onViewChange("ready")}
        >
          Ready
        </button>
        <button
          type="button"
          className={"state-btn" + (currentView === "loading" ? " active" : "")}
          onClick={() => onViewChange("loading")}
        >
          Loading
        </button>
        <button
          type="button"
          className={"state-btn" + (currentView === "error" ? " active" : "")}
          onClick={() => onViewChange("error")}
        >
          Error
        </button>
        <button
          type="button"
          className={"state-btn" + (currentView === "empty" ? " active" : "")}
          onClick={() => onViewChange("empty")}
        >
          Empty
        </button>
      </div>
    </header>
  )
}
