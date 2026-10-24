from fastapi import APIRouter, HTTPException, Query
from api.v1.analysis.service import get_wind_analysis

router = APIRouter(prefix="/api/v1/analysis", tags=["Wind Analysis (v1)"])

@router.get("/")
def get_analysis(
    date_from: str = Query(
        ...,
        description="Delivery start date in YYYY-MM-DD format (required), e.g. 2026-01-05"
    ),
    date_to: str = Query(
        ...,
        description="Delivery end date in YYYY-MM-DD format (required), e.g. 2026-01-07"
    ),
    cutoff_hour: int | None = Query(
        None,
        ge=0,
        le=23,
        description="Optional decision time on previous day (0-23, e.g. 12)"
    ),
):
    """
    Combined analysis endpoint.
    Aligns actual wind generation (FUELHH) and forecast data (WINDFOR),
    evaluates errors against the decision cutoff_hour, and computes MAE, RMSE, and Bias.
    """
    try:
        return get_wind_analysis(
            date_from=date_from,
            date_to=date_to,
            cutoff_hour=cutoff_hour,
        )
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to generate analysis from Elexon data: {str(error)}"
        )
