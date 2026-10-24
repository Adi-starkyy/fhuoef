export default function DataTable({ data, publishedAt }) {
  return (
    <section className="card table-card">
      <div className="table-header-row">
        <div>
          <h2 className="card-title">Settlement Period Breakdown</h2>
          <p className="card-subtitle">
            Granular 30-minute generation volumes and variances
          </p>
        </div>

        {/* Info line requirement */}
        <div className="info-line">
          <span className="info-icon" aria-hidden="true">ℹ</span>
          <span>Forecast used was published at <strong>{publishedAt}</strong></span>
        </div>
      </div>

      <div className="table-responsive-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Slot</th>
              <th scope="col">Time (HH:mm)</th>
              <th scope="col" className="text-right">Forecast (MW)</th>
              <th scope="col" className="text-right">Actual (MW)</th>
              <th scope="col" className="text-right">Error (MW)</th>
              <th scope="col" className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const sign = row.error > 0 ? "+" : ""
              const isOver = row.error > 0
              const isUnder = row.error < 0

              return (
                <tr key={row.slot}>
                  <td className="text-muted">{row.slot}</td>
                  <td className="font-medium">{row.time}</td>
                  <td className="text-right">{Number(row.forecast).toLocaleString()}</td>
                  <td className="text-right">{Number(row.actual).toLocaleString()}</td>
                  <td
                    className={
                      "text-right font-medium " +
                      (isOver ? "error-positive" : isUnder ? "error-negative" : "text-muted")
                    }
                  >
                    {sign + Number(row.error).toLocaleString()}
                  </td>
                  <td className="text-center">
                    <span
                      className={
                        "status-pill " +
                        (isOver ? "status-over" : isUnder ? "status-under" : "status-match")
                      }
                    >
                      {isOver ? "Over" : isUnder ? "Under" : "Exact"}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
