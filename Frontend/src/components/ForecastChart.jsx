import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts"

// Custom tooltip formatter without any regex
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="chart-tooltip">
      <div className="tooltip-title">Slot Time: {label}</div>
      {payload.map((item) => (
        <div key={item.name} className="tooltip-row">
          <span
            className="tooltip-dot"
            style={{ backgroundColor: item.color }}
          ></span>
          <span className="tooltip-label">{item.name}:</span>
          <span className="tooltip-value">
            {Number(item.value).toLocaleString()} MW
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ForecastChart({ data }) {
  return (
    <section className="card chart-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Wind Generation Profile</h2>
          <p className="card-subtitle">
            Forecast vs Actual wind output (MW) across 48 settlement periods
          </p>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart
            data={data}
            margin={{ top: 12, right: 24, left: 16, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              interval={3}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => Number(val).toLocaleString()}
              unit=" MW"
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 16 }}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 1 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
