from datetime import datetime, date, time, timedelta, timezone
import math
from api.v1.actualData.service import fetch_actual_wind_data
from api.v1.forecastData.service import fetch_forecast_wind_data

def parse_date(date_str: str) -> date:
    """Parse YYYY-MM-DD string into a date object without regex."""
    parts = date_str.split("T")[0].split("-")
    year = int(parts[0])
    month = int(parts[1])
    day = int(parts[2])
    return date(year, month, day)

def parse_iso_datetime(dt_str: str) -> datetime:
    """Parse standard ISO timestamp without regex, ensuring UTC timezone awareness."""
    clean_str = dt_str.replace("Z", "+00:00")
    dt = datetime.fromisoformat(clean_str)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt

def format_iso_utc(dt: datetime) -> str:
    """Format datetime as UTC ISO-8601 string without regex."""
    utc_dt = dt.astimezone(timezone.utc)
    return utc_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

def calculate_metrics(rows: list[dict]) -> dict:
    """
    Compute standard statistical forecast evaluation metrics.
    
    1. Mean Absolute Error (MAE):
       MAE = (1 / N) * sum(|forecast_i - actual_i|)
       Average magnitude of the errors without direction.
       
    2. Root Mean Square Error (RMSE):
       RMSE = sqrt((1 / N) * sum((forecast_i - actual_i)^2))
       Penalizes larger outliers more severely than MAE.
       
    3. Mean Bias / Mean Error (Bias):
       Bias = (1 / N) * sum(forecast_i - actual_i)
       Positive (> 0) means systematic overforecasting (forecast too high).
       Negative (< 0) means systematic underforecasting (forecast too low).
    """
    n = len(rows)
    if n == 0:
        return {
            "mae": 0.0,
            "rmse": 0.0,
            "bias": 0.0,
            "slot_count": 0,
        }

    # Use raw float values to avoid cumulative intermediate rounding errors
    errors = [float(r["forecast"]) - float(r["actual"]) for r in rows]

    mae = sum(abs(e) for e in errors) / n
    rmse = math.sqrt(sum(e * e for e in errors) / n)
    bias = sum(errors) / n

    return {
        "mae": round(mae, 1),
        "rmse": round(rmse, 1),
        "bias": round(bias, 1),
        "slot_count": n,
    }

def get_wind_analysis(date_from: str, date_to: str, cutoff_hour: int | None = None):
    """
    Fetch and combine actual wind generation (FUELHH - 30-min settlement intervals)
    and day-ahead forecast data (WINDFOR - published hourly or half-hourly).
    
    Ensures all 48 half-hourly settlement periods per day (00:00, 00:30, 01:00...)
    are represented. If WINDFOR provides hourly forecast intervals, the hourly forecast
    natively covers both 30-minute settlement slots within that hour.
    """
    start_d = parse_date(date_from)
    end_d = parse_date(date_to)

    if start_d > end_d:
        raise ValueError("date_from must not be after date_to")

    # Range for actual delivery slots
    actual_from_str = f"{start_d.isoformat()}T00:00:00Z"
    actual_to_str = f"{end_d.isoformat()}T23:59:59Z"

    # Forecasts for day-ahead are published on prior days, so fetch starting 2 days earlier
    forecast_start_d = start_d - timedelta(days=2)
    forecast_from_str = f"{forecast_start_d.isoformat()}T00:00:00Z"
    forecast_to_str = actual_to_str

    # Call the two upstream services
    actual_records = fetch_actual_wind_data(actual_from_str, actual_to_str)
    forecast_records = fetch_forecast_wind_data(forecast_from_str, forecast_to_str)

    # 1. Map actual half-hourly generation by parsed UTC datetime
    # Elexon FUELHH record has: 'startTime', 'generation', etc.
    actuals_by_dt = {}
    if isinstance(actual_records, list):
        for item in actual_records:
            slot_time_str = item.get("startTime")
            gen = item.get("generation")
            if slot_time_str and gen is not None:
                slot_dt = parse_iso_datetime(slot_time_str)
                actuals_by_dt[slot_dt] = float(gen)

    # 2. Select the most relevant forecast for each forecast startTime
    # Elexon WINDFOR record has: 'startTime', 'publishTime', 'quantity' (or 'generation')
    forecasts_by_dt = {}
    if isinstance(forecast_records, list):
        for item in forecast_records:
            slot_time_str = item.get("startTime")
            pub_time_str = item.get("publishTime")
            quantity = item.get("quantity")
            if quantity is None:
                quantity = item.get("generation")

            if not slot_time_str or not pub_time_str or quantity is None:
                continue

            slot_dt = parse_iso_datetime(slot_time_str)
            pub_dt = parse_iso_datetime(pub_time_str)

            # Apply cutoff logic if cutoff_hour is provided
            # Cutoff = (delivery_date - 1 day) at cutoff_hour:00:00 UTC
            if cutoff_hour is not None:
                cutoff_dt = datetime.combine(
                    slot_dt.date() - timedelta(days=1),
                    time(cutoff_hour, 0, 0),
                    tzinfo=timezone.utc,
                )
                # Skip forecasts published after the decision cutoff
                if pub_dt > cutoff_dt:
                    continue
            else:
                # Default: forecast must have been published prior to delivery
                if pub_dt > slot_dt:
                    continue

            # Keep the latest eligible forecast published before the cutoff
            existing = forecasts_by_dt.get(slot_dt)
            if existing is None or pub_dt > existing["publish_dt"]:
                forecasts_by_dt[slot_dt] = {
                    "publishTime": pub_time_str,
                    "publish_dt": pub_dt,
                    "forecast": float(quantity),
                }

    # 3. Combine actuals and forecasts for every half-hourly settlement slot
    rows = []
    sorted_actual_dts = sorted(actuals_by_dt.keys())

    for slot_dt in sorted_actual_dts:
        # Filter within target date range
        if not (start_d <= slot_dt.date() <= end_d):
            continue

        # Look for exact 30-min forecast match first
        fc_data = forecasts_by_dt.get(slot_dt)

        # If WINDFOR is published hourly, map the :30 slot to its hour start (:00)
        if fc_data is None and slot_dt.minute == 30:
            hour_start_dt = slot_dt.replace(minute=0, second=0)
            fc_data = forecasts_by_dt.get(hour_start_dt)

        # If forecast exists for this slot, build the row
        if fc_data is not None:
            actual_val = actuals_by_dt[slot_dt]
            forecast_val = fc_data["forecast"]
            err = forecast_val - actual_val

            rows.append({
                "startTime": format_iso_utc(slot_dt),
                "publishTime": fc_data["publishTime"],
                "forecast": round(forecast_val, 1),
                "actual": round(actual_val, 1),
                "error": round(err, 1),
            })

    # 4. Calculate evaluation metrics across all matched 30-minute slots
    metrics = calculate_metrics(rows)

    return {
        "date_from": date_from,
        "date_to": date_to,
        "cutoff_hour": cutoff_hour,
        "metrics": metrics,
        "rows": rows,
    }
