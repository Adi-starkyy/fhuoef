export default function InputsBar({
  deliveryDate,
  onDateChange,
  cutoffHour,
  onCutoffChange
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <section className="inputs-bar">
      <div className="input-group">
        <label htmlFor="delivery-date" className="input-label">
          Delivery Date
        </label>
        <input
          id="delivery-date"
          type="date"
          className="input-control"
          min="2026-01-01"
          max="2026-01-31"
          value={deliveryDate}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label htmlFor="cutoff-hour" className="input-label">
          Decision time on previous day
        </label>
        <select
          id="cutoff-hour"
          className="input-control"
          value={cutoffHour}
          onChange={(e) => onCutoffChange(Number(e.target.value))}
        >
          {hours.map((h) => {
            const formatted = (h < 10 ? "0" + h : String(h)) + ":00"
            return (
              <option key={h} value={h}>
                {formatted} ({h === 12 ? "Gate Closure baseline" : h + "h"})
              </option>
            )
          })}
        </select>
      </div>

      <div className="inputs-summary-badge">
        <span className="badge-dot"></span>
        <span>Day-Ahead Market Horizon</span>
      </div>
    </section>
  )
}
