export default function MetricCards({ mae, rmse, bias }) {
  // Format numbers with commas, zero regex
  const formatMw = (value) => {
    return Number(value).toLocaleString() + " MW"
  }

  const biasPrefix = bias > 0 ? "+" : ""

  return (
    <section className="metrics-grid">
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-name">MAE</span>
          <span className="metric-tag">Mean Absolute Error</span>
        </div>
        <div className="metric-value">{formatMw(mae)}</div>
        <div className="metric-hint">Average magnitude of forecast error across all slots</div>
      </div>

      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-name">RMSE</span>
          <span className="metric-tag">Root Mean Square Error</span>
        </div>
        <div className="metric-value">{formatMw(rmse)}</div>
        <div className="metric-hint">Penalises larger individual forecast misses more heavily</div>
      </div>

      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-name">Bias</span>
          <span className={"metric-tag" + (bias >= 0 ? " tag-positive" : " tag-negative")}>
            {bias >= 0 ? "Overforecast" : "Underforecast"}
          </span>
        </div>
        <div className="metric-value">
          {biasPrefix + formatMw(bias)}
        </div>
        <div className="metric-hint bias-note">
          positive = forecast too high, negative = too low
        </div>
      </div>
    </section>
  )
}
