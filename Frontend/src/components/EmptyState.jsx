export default function EmptyState({ deliveryDate, cutoffHour }) {
  return (
    <div className="card state-container state-empty">
      <div className="state-icon empty-icon">💨</div>
      <h3 className="state-title">No Forecast Data Available</h3>
      <p className="state-description">
        No wind generation records found for delivery date{" "}
        <strong>{deliveryDate}</strong> at cutoff hour{" "}
        <strong>{cutoffHour}:00</strong>. Please adjust your input filters.
      </p>
    </div>
  )
}
