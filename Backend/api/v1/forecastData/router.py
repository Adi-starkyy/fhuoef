from fastapi import APIRouter, HTTPException, Query
from api.v1.forecastData.service import fetch_forecast_wind_data

router = APIRouter(prefix="/api/v1/forecast-data", tags=["Forecast Wind Data (v1)"])

@router.get("/")
def get_forecast_wind_data(
    publishDateTimeFrom: str | None = Query(
        None,
        description="Optional start timestamp in ISO-8601 UTC format, e.g. 2026-01-01T00:00:00Z"
    ),
    publishDateTimeTo: str | None = Query(
        None,
        description="Optional end timestamp in ISO-8601 UTC format, e.g. 2026-01-02T00:00:00Z"
    ),
):
    """
    Get wind generation forecast (WINDFOR stream) from Elexon BMRS.
    If no date parameters are provided, it fetches the latest forecast.
    """
    try:
        data = fetch_forecast_wind_data(
            publish_date_time_from=publishDateTimeFrom,
            publish_date_time_to=publishDateTimeTo,
        )
        return {
            "success": True,
            "publishDateTimeFrom": publishDateTimeFrom,
            "publishDateTimeTo": publishDateTimeTo,
            "isLatest": publishDateTimeFrom is None and publishDateTimeTo is None,
            "count": len(data) if isinstance(data, list) else None,
            "data": data,
        }
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch forecast data from Elexon: {str(error)}"
        )
