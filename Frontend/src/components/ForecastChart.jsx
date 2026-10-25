import { useMemo } from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot
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
  const slotCount = data ? data.length : 0

  // Calculate the maximum generation peak point across forecast and actual
  const peakPoint = useMemo(() => {
    if (!data || data.length === 0) return null
    let maxItem = data[0]
    let maxVal = Math.max(Number(data[0].actual || 0), Number(data[0].forecast || 0))

    for (let i = 1; i < data.length; i++) {
      const itemVal = Math.max(Number(data[i].actual || 0), Number(data[i].forecast || 0))
      if (itemVal > maxVal) {
        maxVal = itemVal
        maxItem = data[i]
      }
    }

    return {
      time: maxItem.time,
      value: maxVal
    }
  }, [data])

  return (
    <section className="card chart-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Wind Generation Profile</h2>
          <p className="card-subtitle">
            Forecast vs Actual wind output (MW) across {slotCount} settlement periods
          </p>
        </div>

        {peakPoint && (
          <div className="peak-badge">
            <span className="peak-badge-dot"></span>
            <span>
              Max Peak: <strong>{Number(peakPoint.value).toLocaleString()} MW</strong> ({peakPoint.time})
            </span>
          </div>
        )}
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={370}>
          <LineChart
            data={data}
            margin={{ top: 24, right: 24, left: 16, bottom: 12 }}
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

            {peakPoint && (
              <ReferenceDot
                x={peakPoint.time}
                y={peakPoint.value}
                r={6}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={2}
                label={{
                  value: `▲ Peak: ${Number(peakPoint.value).toLocaleString()} MW`,
                  position: "top",
                  fill: "#0f172a",
                  fontSize: 11,
                  fontWeight: 700,
                  offset: 10
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
