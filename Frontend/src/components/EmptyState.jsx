export default function EmptyState({ dateFrom, dateTo, cutoffHour }) {
  return (
    <div className="card state-container state-empty">
      <div className="state-icon empty-icon">💨</div>
      <h3 className="state-title">No Forecast Data Available</h3>
      <p className="state-description">
        No wind generation records found for delivery range{" "}
        <strong>{dateFrom}</strong> to <strong>{dateTo}</strong> at cutoff hour{" "}
        <strong>{cutoffHour}:00</strong>. Please adjust your input filters.
      </p>
    </div>
  )
}
