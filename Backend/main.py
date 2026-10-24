from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.actualData.router import router as actual_data_router

app = FastAPI(title="Backend API", version="1.0.0")

# Enable CORS for the frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers directly
app.include_router(actual_data_router)

@app.get("/")
def read_root():
    return {"message": "Backend API is running"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
