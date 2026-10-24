export default function LoadingState() {
  return (
    <div className="card state-container" role="status" aria-live="polite">
      <div className="loading-spinner"></div>
      <h3 className="state-title">Loading Wind Forecast Data</h3>
      <p className="state-description">
        Retrieving day-ahead generation forecasts and settlement actuals...
      </p>
    </div>
  )
}
