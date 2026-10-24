export default function ErrorState({ onRetry, message }) {
  return (
    <div className="card state-container state-error" role="alert">
      <div className="state-icon error-icon">⚠️</div>
      <h3 className="state-title">Unable to Load Forecast Data</h3>
      <p className="state-description">
        {message ||
          "We encountered an issue fetching National Grid wind generation telemetry. Please check your connection or try again."}
      </p>
      {onRetry && (
        <button type="button" className="retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  )
}
