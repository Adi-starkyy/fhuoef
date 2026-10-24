import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell
} from "recharts"

function ErrorTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const errorVal = payload[0].value
  const sign = errorVal > 0 ? "+" : ""

  return (
    <div className="chart-tooltip">
      <div className="tooltip-title">Slot Time: {label}</div>
      <div className="tooltip-row">
        <span className="tooltip-label">Forecast Error:</span>
        <span
          className="tooltip-value"
          style={{ color: errorVal >= 0 ? "#f97316" : "#0284c7" }}
        >
          {sign + Number(errorVal).toLocaleString()} MW
        </span>
      </div>
      <div className="tooltip-sub">
        {errorVal > 0 ? "Overforecast (Too high)" : errorVal < 0 ? "Underforecast (Too low)" : "Exact Match"}
      </div>
    </div>
  )
}

export default function ErrorChart({ data }) {
  return (
    <section className="card chart-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Forecast Error by Half-Hour Slot</h2>
          <p className="card-subtitle">
            Forecast minus Actual generation (MW) per settlement period
          </p>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            margin={{ top: 12, right: 24, left: 16, bottom: 12 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              minTickGap={50}
              interval="preserveStartEnd"
              dy={6}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => Number(val).toLocaleString()}
              unit=" MW"
              width={75}
            />
            <Tooltip content={<ErrorTooltip />} />
            <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.5} />
            <Bar dataKey="error" name="Error (MW)" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={"cell-" + index}
                  fill={entry.error >= 0 ? "#f97316" : "#0284c7"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend-custom">
        <span className="legend-item">
          <span className="legend-box" style={{ backgroundColor: "#f97316" }}></span>
          Positive Error (Overforecast)
        </span>
        <span className="legend-item">
          <span className="legend-box" style={{ backgroundColor: "#0284c7" }}></span>
          Negative Error (Underforecast)
        </span>
      </div>
    </section>
  )
}
