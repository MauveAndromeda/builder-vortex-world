import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type WeatherCondition =
  | "sunny"
  | "cloudy"
  | "overcast"
  | "rain"
  | "snow"
  | "hail"
  | "windy"
  | "storm"
  | "unknown";

export type WeatherState = {
  condition: WeatherCondition;
  windSpeed: number | null; // m/s
  precipitation: number | null; // mm
  cloudCover: number | null; // %
  code: number | null; // WMO weather code
  updatedAt: number | null;
};

function mapWmoToCondition(code: number): WeatherCondition {
  if (code === 0) return "sunny";
  if (code === 1 || code === 2) return "cloudy";
  if (code === 3 || code === 45 || code === 48) return "overcast";
  if ((code >= 51 && code <= 57) || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "snow";
  if (code === 66 || code === 67) return "hail"; // freezing rain / ice pellets
  if (code === 95) return "storm";
  if (code >= 96 && code <= 99) return "storm"; // thunderstorm w/ hail
  return "unknown";
}

export function useWeatherTheme(): WeatherState {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [state, setState] = useState<WeatherState>({
    condition: "unknown",
    windSpeed: null,
    precipitation: null,
    cloudCover: null,
    code: null,
    updatedAt: null,
  });
  const timer = useRef<number | null>(null);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,precipitation,cloud_cover,wind_speed_10m&timezone=auto`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`weather http ${res.status}`);
      const data = await res.json();
      const cur = data?.current ?? {};
      const code = Number(cur.weather_code ?? cur.weathercode ?? NaN);
      const wind = Number(cur.wind_speed_10m ?? cur.windspeed_10m ?? NaN);
      const precip = Number(cur.precipitation ?? NaN);
      const cloud = Number(cur.cloud_cover ?? cur.cloudcover ?? NaN);
      let condition = mapWmoToCondition(code);
      if ((condition === "sunny" || condition === "cloudy" || condition === "unknown") && isFinite(wind) && wind >= 10) {
        condition = "windy";
      }
      if (condition === "unknown" && isFinite(cloud)) {
        condition = cloud >= 85 ? "overcast" : cloud >= 50 ? "cloudy" : "sunny";
      }
      setState({
        condition,
        windSpeed: isFinite(wind) ? wind : null,
        precipitation: isFinite(precip) ? precip : null,
        cloudCover: isFinite(cloud) ? cloud : null,
        code: isFinite(code) ? code : null,
        updatedAt: Date.now(),
      });
    } catch (e) {
      // keep previous; don't throw
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setCoords({ lat, lon });
          fetchWeather(lat, lon);
          if (timer.current) window.clearInterval(timer.current);
          timer.current = window.setInterval(() => fetchWeather(lat, lon), 10 * 60 * 1000) as any;
        },
        () => {
          // permission denied – keep unknown state
        },
        { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 6000 },
      );
    }
    return () => {
      cancelled = true;
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [fetchWeather]);

  return useMemo(() => state, [state]);
}
