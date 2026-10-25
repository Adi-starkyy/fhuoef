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