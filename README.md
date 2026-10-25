# Wind Forecast Dashboard

A full-stack web application designed for UK energy utilities and power traders. It assesses and compares day-ahead renewable wind generation forecasts against actual grid delivery outturn to quantify decision risks before purchasing power on the day-ahead wholesale market.

---

## 🔗 Live Application Link

- **Live Frontend App:** [https://fhuoef-frontend.vercel.app/](https://fhuoef-frontend.vercel.app/)

> **Note:** AI tools were used to assist in building, structuring, and accelerating the development of this project.

---

## 📁 Project Structure & File Details

```
fhuoef/
├── docker-compose.yml              # Single-container orchestration for the full app
├── Dockerfile                      # Multi-stage Dockerfile (Node builds UI, Python serves both)
├── .dockerignore                   # Docker build exclusions
├── README.md                       # Documentation & setup guide
│
├── Backend/                        # FastAPI Python service
│   ├── main.py                     # Entry point, CORS setup, router mounting, static SPA serving
│   ├── requirements.txt            # Python dependencies (FastAPI, Uvicorn, httpx, etc.)
│   ├── .gitignore                  # Python & venv gitignore
│   └── api/
│       └── v1/
│           ├── actualData/
│           │   ├── router.py       # GET /api/v1/actual-data/ endpoint
│           │   └── service.py      # Elexon BMRS FUELHH stream integration (fuelType=WIND)
│           ├── forecastData/
│           │   ├── router.py       # GET /api/v1/forecast-data/ endpoint
│           │   └── service.py      # Elexon BMRS WINDFOR forecast stream integration
│           └── analysis/
│               ├── router.py       # GET /api/v1/analysis/ combined endpoint
│               └── service.py      # 30-min slot alignment, cutoff logic, MAE, RMSE, & Bias
│
└── Frontend/                       # React (Vite) Single Page Application
    ├── index.html                  # HTML template entry
    ├── package.json                # Frontend dependencies (React, Recharts, etc.)
    ├── vite.config.js              # Vite configuration
    ├── .gitignore                  # Node modules & build exclusions
    └── src/
        ├── main.jsx                # React DOM root entry
        ├── App.jsx                 # Main dashboard container & live data fetching
        ├── index.css               # Clean plain CSS styling (light mode, responsive cards)
        ├── mockData.js             # Initial mock data and formula references
        └── components/
            ├── Header.jsx          # Dashboard header and summary text
            ├── InputsBar.jsx       # Delivery date range pickers, cutoff hour & "Run Analysis"
            ├── MetricCards.jsx     # Quantitative MAE, RMSE, and Bias cards
            ├── ForecastChart.jsx   # Recharts Line chart (forecast vs actual) with peak pointer
            ├── ErrorChart.jsx      # Recharts Bar chart (errors) with max deviation pointer
            ├── DataTable.jsx       # Sortable 48-slot breakdown table with publication info line
            ├── LoadingState.jsx    # Animated loading spinner view
            ├── ErrorState.jsx      # Friendly error feedback banner with retry action
            └── EmptyState.jsx      # Zero-data fallback display
```

---

## 🔌 API Endpoints Reference

The FastAPI backend exposes RESTful endpoints for raw market data extraction, upstream BMRS stream ingestion, and consolidated benchmark analysis.

### 1. `GET /api/v1/analysis/`
The primary analytical endpoint powering the dashboard. It ingests both actual generation (`FUELHH`) and day-ahead forecast records (`WINDFOR`), applies prior-day gate closure filtering according to the selected `cutoff_hour`, aligns datasets across 30-minute settlement periods, and calculates statistical accuracy benchmarks.

- **Parameters:**
  | Parameter | Type | Required / Optional | Description |
  | :--- | :--- | :--- | :--- |
  | `date_from` | `string` (Query) | **Required** | Delivery start date in `YYYY-MM-DD` format (e.g. `2026-01-05`). |
  | `date_to` | `string` (Query) | **Required** | Delivery end date in `YYYY-MM-DD` format (e.g. `2026-01-07`). |
  | `cutoff_hour` | `integer` (Query) | Optional | Prior-day decision cutoff hour (`0`–`23`, e.g. `12` for 12:00 UTC). Forecasts published after $(D-1)$ at `cutoff_hour:00 UTC` are excluded. |

- **Response Type:** `application/json`
- **Example Success Response (`200 OK`):**
  ```json
  {
    "date_from": "2026-01-05",
    "date_to": "2026-01-07",
    "cutoff_hour": 12,
    "metrics": {
      "mae": 348.6,
      "rmse": 452.1,
      "bias": 115.4,
      "slot_count": 144
    },
    "rows": [
      {
        "startTime": "2026-01-05T00:00:00Z",
        "publishTime": "2026-01-04T11:45:00Z",
        "forecast": 11250.0,
        "actual": 10980.5,
        "error": 269.5
      }
    ]
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: If `date_from` is chronologically after `date_to` or date format is invalid.
  - `502 Bad Gateway`: If the upstream Elexon BMRS service fails or times out.

---

### 2. `GET /api/v1/actual-data/`
Fetches raw half-hourly actual wind generation outturn records directly from the Elexon BMRS `FUELHH` dataset stream, with `fuelType` pre-filtered to `WIND`.

- **Parameters:**
  | Parameter | Type | Required / Optional | Description |
  | :--- | :--- | :--- | :--- |
  | `publishDateTimeFrom` | `string` (Query) | **Required** | Start timestamp in ISO-8601 UTC format (e.g. `2026-01-01T00:00:00Z`). |
  | `publishDateTimeTo` | `string` (Query) | **Required** | End timestamp in ISO-8601 UTC format (e.g. `2026-01-02T00:00:00Z`). |

- **Response Type:** `application/json`
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "fuelType": "WIND",
    "publishDateTimeFrom": "2026-01-01T00:00:00Z",
    "publishDateTimeTo": "2026-01-02T00:00:00Z",
    "count": 48,
    "data": [
      {
        "dataset": "FUELHH",
        "publishTime": "2026-01-01T00:30:00Z",
        "startTime": "2026-01-01T00:00:00Z",
        "settlementDate": "2026-01-01",
        "settlementPeriod": 1,
        "fuelType": "WIND",
        "generation": 11450.5
      }
    ]
  }
  ```
- **Error Responses:**
  - `502 Bad Gateway`: If communication with Elexon BMRS fails.

---

### 3. `GET /api/v1/forecast-data/`
Fetches raw national wind generation forecast records from the Elexon BMRS `WINDFOR` dataset stream.

- **Parameters:**
  | Parameter | Type | Required / Optional | Description |
  | :--- | :--- | :--- | :--- |
  | `publishDateTimeFrom` | `string` (Query) | Optional | Optional start timestamp in ISO-8601 UTC format (e.g. `2026-01-01T00:00:00Z`). |
  | `publishDateTimeTo` | `string` (Query) | Optional | Optional end timestamp in ISO-8601 UTC format (e.g. `2026-01-02T00:00:00Z`). |

  *If parameters are omitted, the endpoint queries the latest available forecast snapshot from Elexon.*

- **Response Type:** `application/json`
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "publishDateTimeFrom": "2026-01-01T00:00:00Z",
    "publishDateTimeTo": "2026-01-02T00:00:00Z",
    "isLatest": false,
    "count": 24,
    "data": [
      {
        "dataset": "WINDFOR",
        "publishTime": "2025-12-31T11:45:00Z",
        "startTime": "2026-01-01T00:00:00Z",
        "generation": 11800.0
      }
    ]
  }
  ```
- **Error Responses:**
  - `502 Bad Gateway`: If communication with Elexon BMRS fails.

---

### 4. `GET /api/health`
Lightweight health check endpoint for monitoring container readiness, uptime, and deployment status.

- **Parameters:** None
- **Response Type:** `application/json`
- **Example Success Response (`200 OK`):**
  ```json
  {
    "status": "healthy"
  }
  ```

---

## 🚀 How to Start the Application

### Option 1: Docker (Single Container — Recommended)

The easiest way to run the complete stack (both Frontend and Backend served together on a single port):

```bash
# 1. Build and start the container
docker compose up --build -d

# 2. View live logs
docker compose logs -f

# 3. Stop the container
docker compose down
```

Once started, open your browser to:
- **Dashboard UI & API:** [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Local Development (Run Separately)

#### 1. Start the Backend

```powershell
cd Backend

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# (If needed) Install dependencies
pip install -r requirements.txt

# Start Uvicorn development server
uvicorn main:app --reload --port 8000
```
*Backend runs at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.*

#### 2. Start the Frontend

Open a second terminal window:

```powershell
cd Frontend

# Install dependencies (first time only)
npm install

# Start Vite dev server
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 📊 Core Features & Methodologies

1. **Gate Closure & Cutoff Hour Logic**:
   - For any delivery day $D$, day-ahead power purchasing decisions occur on day $D-1$ before gate closure.
   - The analysis engine automatically fetches forecasts published at or before the previous day's `cutoff_hour:00 UTC` and discards any forecast published after that decision moment.
2. **30-Minute Settlement Period Resolution**:
   - Matches actual half-hourly generation records (`FUELHH`) with National Grid wind forecasts (`WINDFOR`).
   - Maps hourly forecasts onto both 30-minute settlement periods (`:00` and `:30`) to ensure all 48 slots per day (or 144 slots across 3 days) are fully represented.
3. **Rigorous Accuracy Benchmarks**:
   - **MAE (Mean Absolute Error):** $\frac{1}{N} \sum |f_i - a_i|$ (Average error magnitude).
   - **RMSE (Root Mean Square Error):** $\sqrt{\frac{1}{N} \sum (f_i - a_i)^2}$ (Heavily penalizes volatile misses).
   - **Bias (Mean Error):** $\frac{1}{N} \sum (f_i - a_i)$ (Positive = Overforecast, Negative = Underforecast).
4. **Interactive Sorting & Peak Pointers**:
   - Dynamic maximum generation and peak error deviation pointers on charts.
   - Ascending / descending column sorting on Forecast, Actual, and Error table data.

---

## 🔮 Future Improvements & Scalability Roadmap

Here are key enhancements planned to scale and extend the capabilities of this project:

1. **Redis Caching Layer**:
   - **Problem:** Repeatedly querying live third-party BMRS API endpoints over and over for the same date ranges introduces unnecessary network latency, slows down dashboard rendering, and risks upstream rate-limiting.
   - **Solution:** Introduce a Redis in-memory cache to store fetched BMRS responses. Completed past historical delivery days (which are immutable) can be cached with extended TTLs (e.g., 24–48 hours), while near-real-time data uses shorter invalidation windows. This provides sub-millisecond query responses and guarantees high uptime even during upstream API outages.

2. **Persistent Time-Series Database & Scheduled Ingestion Worker**:
   - **Problem:** On-demand fetching over HTTP limits analysis to short date windows (e.g. 1–3 days) because querying months of half-hourly records synchronously would trigger HTTP request timeouts.
   - **Solution:** Deploy a persistent time-series database (e.g., TimescaleDB or PostgreSQL with hypertable partitioning) alongside a background worker (such as Celery, ARQ, or a cron scheduler). The worker will continuously poll and persist both `FUELHH` outturn and all incremental `WINDFOR` forecast revisions, enabling deep multi-month backtesting, seasonal trend analytics, and instant zero-latency historical queries.

3. **Financial Imbalance Cost Modeling & Risk Alerting**:
   - **Problem:** While physical MW forecast deviations provide volumetric insight, energy traders and balance responsible parties (BRPs) ultimately need to evaluate cash-out exposure and trading penalties.
   - **Solution:** Integrate Elexon Cash-out / System Price data (System Sell Price [SSP] and System Buy Price [SBP]) to calculate the actual monetary imbalance penalty (£/MWh) incurred by forecast misses. Additionally, add automated alerting (via Slack webhooks, email, or WebSockets) triggered when forecasted generation diverges beyond defined volatility thresholds (e.g. >1,000 MW swing or unexpected steep ramps).