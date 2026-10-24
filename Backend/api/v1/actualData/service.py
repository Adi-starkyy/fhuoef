import json
import urllib.parse
import urllib.request

# Elexon BMRS endpoint for half-hourly generation by fuel type
FUELHH_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream"

def fetch_actual_wind_data(publish_date_time_from: str, publish_date_time_to: str):
    """
    Fetch actual wind generation records from Elexon BMRS.
    
    Query parameters:
      - publishDateTimeFrom: e.g. "2026-01-01T00:00:00Z"
      - publishDateTimeTo:   e.g. "2026-01-02T00:00:00Z"
      - fuelType: Always fixed to "WIND"
    """
    params = {
        "publishDateTimeFrom": publish_date_time_from,
        "publishDateTimeTo": publish_date_time_to,
        "fuelType": "WIND",
    }

    # Encode query string safely
    query_string = urllib.parse.urlencode(params)
    full_url = f"{FUELHH_URL}?{query_string}"

    request = urllib.request.Request(
        full_url,
        headers={
            "Accept": "application/json",
            "User-Agent": "UK-Wind-Forecast-App/1.0",
        },
        method="GET",
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        if response.status != 200:
            raise RuntimeError(f"API returned status {response.status}")
        raw_body = response.read().decode("utf-8")
        return json.loads(raw_body)
