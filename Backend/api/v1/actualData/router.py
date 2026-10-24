from fastapi import APIRouter, HTTPException, Query
from api.v1.actualData.service import fetch_actual_wind_data

router = APIRouter(prefix="/api/v1/actual-data", tags=["Actual Wind Data (v1)"])

@router.get("/")
def get_actual_wind_data(
    publishDateTimeFrom: str = Query(
        ...,
        description="Start timestamp in ISO-8601 UTC format, e.g. 2026-01-01T00:00:00Z"
    ),
    publishDateTimeTo: str = Query(
        ...,
        description="End timestamp in ISO-8601 UTC format, e.g. 2026-01-02T00:00:00Z"
    ),
):
    """
    Get actual half-hourly wind generation (FUELHH stream) from Elexon BMRS.
    fuelType is locked to 'WIND'.
    """
    try:
        data = fetch_actual_wind_data(
            publish_date_time_from=publishDateTimeFrom,
            publish_date_time_to=publishDateTimeTo,
        )
        return {
            "success": True,
            "fuelType": "WIND",
            "publishDateTimeFrom": publishDateTimeFrom,
            "publishDateTimeTo": publishDateTimeTo,
            "count": len(data) if isinstance(data, list) else None,
            "data": data,
        }
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch data from Elexon: {str(error)}"
        )
