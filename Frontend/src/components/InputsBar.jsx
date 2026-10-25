export default function InputsBar({
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  cutoffHour,
  onCutoffChange,
  onAnalyze,
  isLoading
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <section className="inputs-bar">
      <div className="input-group">
        <label htmlFor="delivery-date-from" className="input-label">
          Delivery Date From
        </label>
        <input
          id="delivery-date-from"
          type="date"
          className="input-control"
          min="2026-01-02"
          max="2026-02-01"
          value={dateFrom}
          onChange={(e) => {
            const newFrom = e.target.value
            onDateFromChange(newFrom)
            if (dateTo && newFrom > dateTo) {
              onDateToChange(newFrom)
            }
          }}
        />
      </div>

      <div className="input-group">
        <label htmlFor="delivery-date-to" className="input-label">
          Delivery Date To
        </label>
        <input
          id="delivery-date-to"
          type="date"
          className="input-control"
          min={dateFrom && dateFrom >= "2026-01-02" ? dateFrom : "2026-01-02"}
          max="2026-02-01"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label htmlFor="cutoff-hour" className="input-label">
          Cutoff Hour
        </label>
        <select
          id="cutoff-hour"
          className="input-control"
          value={cutoffHour}
          onChange={(e) => onCutoffChange(Number(e.target.value))}
          title="Decision time on previous day"
        >
          {hours.map((h) => {
            const formatted = (h < 10 ? "0" + h : String(h)) + ":00"
            return (
              <option key={h} value={h}>
                {formatted} ({h === 12 ? "Gate Closure" : `${h}h`})
              </option>
            )
          })}
        </select>
      </div>

      <div className="inputs-actions">
        <button
          type="button"
          className="analyze-btn"
          onClick={onAnalyze}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="btn-spinner"></span>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>⚡ Run Analysis</span>
            </>
          )}
        </button>
      </div>
    </section>
  )
}
