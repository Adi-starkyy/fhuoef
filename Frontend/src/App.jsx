import { useState } from "react"
import Header from "./components/Header"
import InputsBar from "./components/InputsBar"
import MetricCards from "./components/MetricCards"
import ForecastChart from "./components/ForecastChart"
import ErrorChart from "./components/ErrorChart"
import DataTable from "./components/DataTable"
import LoadingState from "./components/LoadingState"
import ErrorState from "./components/ErrorState"
import EmptyState from "./components/EmptyState"

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV ? "http://localhost:8000" : "")

export default function App() {
  const [dateFrom, setDateFrom] = useState("2026-01-01")
  const [dateTo, setDateTo] = useState("2026-01-01")
  const [cutoffHour, setCutoffHour] = useState(12)
  const [viewState, setViewState] = useState("initial")
  const [errorMessage, setErrorMessage] = useState("")

  // Initially empty data until user runs analysis
  const [dashboardData, setDashboardData] = useState({
    metrics: { mae: 0, rmse: 0, bias: 0, slot_count: 0 },
    rows: [],
    publishedAt: ""
  })

  // Format ISO timestamp without regex for charts and data tables
  const formatSlotLabel = (isoString, isMultiDay) => {
    if (!isoString) return ""
    const parts = isoString.split("T")
    const datePart = parts[0]
    const timePart = parts[1] ? parts[1].slice(0, 5) : ""
    if (isMultiDay) {
      const dateBits = datePart.split("-")
      return `${dateBits[2]}/${dateBits[1]} ${timePart}`
    }
    return timePart
  }

  // Format published timestamp for the info line without regex
  const formatPublishedAt = (isoString) => {
    if (!isoString) return "Pre-gate closure"
    const parts = isoString.split("T")
    const dateBits = parts[0].split("-")
    const timePart = parts[1] ? parts[1].slice(0, 5) : ""
    return `${dateBits[2]}-${dateBits[1]}-${dateBits[0]} at ${timePart} UTC`
  }

  // Live fetch from backend analysis endpoint
  const handleRunAnalysis = async () => {
    setViewState("loading")
    setErrorMessage("")

    try {
      const url = `${API_BASE}/api/v1/analysis/?date_from=${dateFrom}&date_to=${dateTo}&cutoff_hour=${cutoffHour}`
      const response = await fetch(url)

      if (!response.ok) {
        let errDetail = "API returned status " + response.status
        try {
          const errJson = await response.json()
          if (errJson && errJson.detail) {
            errDetail = errJson.detail
          }
        } catch (_) {}
        throw new Error(errDetail)
      }

      const result = await response.json()

      if (!result.rows || result.rows.length === 0) {
        setViewState("empty")
        return
      }

      const isMultiDay = dateFrom !== dateTo

      // Map rows for Recharts & DataTable
      const formattedRows = result.rows.map((row, index) => ({
        slot: index + 1,
        time: formatSlotLabel(row.startTime, isMultiDay),
        rawStartTime: row.startTime,
        forecast: row.forecast,
        actual: row.actual,
        error: row.error,
        publishTime: row.publishTime
      }))

      const pubTime = result.rows[0]?.publishTime
      const formattedPubTime = formatPublishedAt(pubTime)

      setDashboardData({
        metrics: result.metrics || { mae: 0, rmse: 0, bias: 0, slot_count: 0 },
        rows: formattedRows,
        publishedAt: formattedPubTime
      })

      setViewState("ready")
    } catch (err) {
      setErrorMessage(err.message || "Failed to connect to the backend analysis API.")
      setViewState("error")
    }
  }

  return (
    <div className="dashboard-container">
      <Header />

      <InputsBar
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        cutoffHour={cutoffHour}
        onCutoffChange={setCutoffHour}
        onAnalyze={handleRunAnalysis}
        isLoading={viewState === "loading"}
      />

      {viewState === "initial" && (
        <EmptyState isInitial={true} />
      )}

      {viewState === "loading" && <LoadingState />}

      {viewState === "error" && (
        <ErrorState
          onRetry={handleRunAnalysis}
          message={errorMessage}
        />
      )}

      {viewState === "empty" && (
        <EmptyState
          dateFrom={dateFrom}
          dateTo={dateTo}
          cutoffHour={cutoffHour}
          isInitial={false}
        />
      )}

      {viewState === "ready" && (
        <>
          <MetricCards
            mae={dashboardData.metrics.mae}
            rmse={dashboardData.metrics.rmse}
            bias={dashboardData.metrics.bias}
          />

          <ForecastChart data={dashboardData.rows} />

          <ErrorChart data={dashboardData.rows} />

          <DataTable
            data={dashboardData.rows}
            publishedAt={dashboardData.publishedAt}
          />
        </>
      )}

      <footer className="dashboard-footer">
        <span>UK National Grid ESO · Day-Ahead Wind Forecast Assessment Model</span>
      </footer>
    </div>
  )
}
