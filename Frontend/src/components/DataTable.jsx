import { useState, useMemo } from "react"

export default function DataTable({ data, publishedAt }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDirection, setSortDirection] = useState(null) // 'asc' | 'desc' | null

  const handleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDirection("asc")
    } else if (sortDirection === "asc") {
      setSortDirection("desc")
    } else {
      setSortKey(null)
      setSortDirection(null)
    }
  }

  const sortedData = useMemo(() => {
    if (!data || !sortKey || !sortDirection) {
      return data || []
    }

    const copied = [...data]
    copied.sort((a, b) => {
      const valA = Number(a[sortKey])
      const valB = Number(b[sortKey])

      if (sortDirection === "asc") {
        return valA - valB
      } else {
        return valB - valA
      }
    })
    return copied
  }, [data, sortKey, sortDirection])

  const renderSortIndicator = (key) => {
    if (sortKey !== key || !sortDirection) {
      return <span className="sort-icon" aria-hidden="true">↕</span>
    }
    return (
      <span className="sort-icon" aria-hidden="true">
        {sortDirection === "asc" ? "▲" : "▼"}
      </span>
    )
  }

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
              <th scope="col" className="text-right">
                <button
                  type="button"
                  className={"th-sort-btn" + (sortKey === "forecast" ? " active" : "")}
                  onClick={() => handleSort("forecast")}
                  title={`Sort by Forecast (${sortKey === "forecast" && sortDirection === "asc" ? "descending" : "ascending"})`}
                >
                  <span>Forecast (MW)</span>
                  {renderSortIndicator("forecast")}
                </button>
              </th>
              <th scope="col" className="text-right">
                <button
                  type="button"
                  className={"th-sort-btn" + (sortKey === "actual" ? " active" : "")}
                  onClick={() => handleSort("actual")}
                  title={`Sort by Actual (${sortKey === "actual" && sortDirection === "asc" ? "descending" : "ascending"})`}
                >
                  <span>Actual (MW)</span>
                  {renderSortIndicator("actual")}
                </button>
              </th>
              <th scope="col" className="text-right">
                <button
                  type="button"
                  className={"th-sort-btn" + (sortKey === "error" ? " active" : "")}
                  onClick={() => handleSort("error")}
                  title={`Sort by Error (${sortKey === "error" && sortDirection === "asc" ? "descending" : "ascending"})`}
                >
                  <span>Error (MW)</span>
                  {renderSortIndicator("error")}
                </button>
              </th>
              <th scope="col" className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => {
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
