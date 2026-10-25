import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from api.v1.actualData.router import router as actual_data_router
from api.v1.forecastData.router import router as forecast_data_router
from api.v1.analysis.router import router as analysis_router

app = FastAPI(title="Wind Forecast API & Dashboard", version="1.0.0")

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(actual_data_router)
app.include_router(forecast_data_router)
app.include_router(analysis_router)

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# Mount frontend build if static directory exists (single container mode)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        target_file = os.path.join(static_dir, full_path)
        if full_path and os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(static_dir, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {"message": "Backend API is running. Run frontend separately in dev or build static files."}
