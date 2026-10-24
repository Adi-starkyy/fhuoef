import json
import urllib.parse
import urllib.request

# Elexon BMRS endpoint for wind generation forecast (WINDFOR) stream
WINDFOR_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream"

def fetch_forecast_wind_data(
    publish_date_time_from: str | None = None,
    publish_date_time_to: str | None = None,
):
    """
    Fetch wind generation forecast records from Elexon BMRS.
    
    Parameters are optional:
      - publishDateTimeFrom: e.g. "2026-01-01T00:00:00Z"
      - publishDateTimeTo:   e.g. "2026-01-02T00:00:00Z"
    
    If parameters are omitted, Elexon returns the latest forecast data.
    """
    params = {}
    if publish_date_time_from:
        params["publishDateTimeFrom"] = publish_date_time_from
    if publish_date_time_to:
        params["publishDateTimeTo"] = publish_date_time_to

    # If query parameters are present, attach them to the URL
    if params:
        query_string = urllib.parse.urlencode(params)
        full_url = f"{WINDFOR_URL}?{query_string}"
    else:
        full_url = WINDFOR_URL

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
