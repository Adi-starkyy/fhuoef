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
import { mockWindData, mockPublishedAt, calculateMetrics } from "./mockData"

export default function App() {
  const [deliveryDate, setDeliveryDate] = useState("2026-01-01")
  const [cutoffHour, setCutoffHour] = useState(12)
  const [viewState, setViewState] = useState("ready")

  const metrics = calculateMetrics(mockWindData)

  return (
    <div className="dashboard-container">
      <Header currentView={viewState} onViewChange={setViewState} />

      <InputsBar
        deliveryDate={deliveryDate}
        onDateChange={setDeliveryDate}
        cutoffHour={cutoffHour}
        onCutoffChange={setCutoffHour}
      />

      {viewState === "loading" && <LoadingState />}

      {viewState === "error" && (
        <ErrorState onRetry={() => setViewState("ready")} />
      )}

      {viewState === "empty" && (
        <EmptyState
          deliveryDate={deliveryDate}
          cutoffHour={cutoffHour}
        />
      )}

      {viewState === "ready" && (
        <>
          <MetricCards
            mae={metrics.mae}
            rmse={metrics.rmse}
            bias={metrics.bias}
          />

          <ForecastChart data={mockWindData} />

          <ErrorChart data={mockWindData} />

          <DataTable
            data={mockWindData}
            publishedAt={mockPublishedAt}
          />
        </>
      )}

      <footer className="dashboard-footer">
        <span>UK National Grid ESO · Day-Ahead Wind Forecast Assessment Model</span>
      </footer>
    </div>
  )
}
