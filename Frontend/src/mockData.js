// Realistic mock data representing 48 half-hour UK wind generation settlement periods
export const mockPublishedAt = "31 Dec 2025 at 11:30 UTC"

// Helper to construct realistic 48 half-hour slots
function generateMockSlots() {
  const baseProfile = [
    11200, 11050, 10800, 10600, 10450, 10300, 10150, 10000,
    9850, 9700, 9650, 9750, 9950, 10250, 10600, 10950,
    11400, 11900, 12400, 12850, 13300, 13700, 14050, 14300,
    14450, 14500, 14350, 14100, 13800, 13500, 13200, 12900,
    12700, 12600, 12550, 12650, 12900, 13250, 13600, 13850,
    13950, 13900, 13700, 13400, 12950, 12500, 12000, 11550
  ]

  // Predetermined realistic forecast offsets for reproducible, deterministic rendering
  const offsets = [
    140, 210, -90, -160, 80, 240, 310, 190,
    -120, -250, -180, 70, 190, 320, 280, 150,
    -80, -210, -340, -190, 60, 220, 380, 420,
    310, 180, -70, -230, -310, -180, 90, 260,
    340, 290, 110, -140, -280, -320, -150, 80,
    210, 350, 270, 130, -90, -220, -170, 60
  ]

  return baseProfile.map((actualValue, index) => {
    const hour = Math.floor(index / 2)
    const minute = index % 2 === 0 ? "00" : "30"
    const formattedHour = hour < 10 ? "0" + hour : String(hour)
    const timeLabel = formattedHour + ":" + minute

    const forecastValue = actualValue + offsets[index]
    const errorValue = forecastValue - actualValue

    return {
      slot: index + 1,
      time: timeLabel,
      forecast: forecastValue,
      actual: actualValue,
      error: errorValue
    }
  })
}

export const mockWindData = generateMockSlots()

// Summary metric calculations
export function calculateMetrics(data) {
  if (!data || data.length === 0) {
    return { mae: 0, rmse: 0, bias: 0 }
  }

  let totalAbsoluteError = 0
  let totalSquaredError = 0
  let totalError = 0

  for (let i = 0; i < data.length; i++) {
    const err = data[i].error
    totalAbsoluteError += Math.abs(err)
    totalSquaredError += err * err
    totalError += err
  }

  const count = data.length
  const mae = Math.round(totalAbsoluteError / count)
  const rmse = Math.round(Math.sqrt(totalSquaredError / count))
  const bias = Math.round(totalError / count)

  return { mae, rmse, bias }
}
