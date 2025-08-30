import { createContext, useContext, useEffect, useState } from "react";

export type ManualMode = "dawn" | "morning" | "noon" | "afternoon" | "dusk" | "night" | null;
export type ManualWeather = "sunny" | "cloudy" | "overcast" | "rain" | "snow" | "hail" | "windy" | "storm" | "blizzard" | null;

export type ThemeOverrideState = {
  manualMode: ManualMode;
  manualWeather: ManualWeather;
  musicEnabled: boolean;
  setManualMode: (mode: ManualMode) => void;
  setManualWeather: (weather: ManualWeather) => void;
  setMusicEnabled: (enabled: boolean) => void;
};

export const ThemeOverrideContext = createContext<ThemeOverrideState>({
  manualMode: null,
  manualWeather: null,
  musicEnabled: false,
  setManualMode: () => {},
  setManualWeather: () => {},
  setMusicEnabled: () => {},
});

export function useThemeOverride(): ThemeOverrideState {
  const context = useContext(ThemeOverrideContext);
  if (!context) {
    throw new Error("useThemeOverride must be used within ThemeOverrideProvider");
  }
  return context;
}

export function useThemeOverrideState(): ThemeOverrideState {
  const [manualMode, setManualMode] = useState<ManualMode>(() => {
    try {
      return (localStorage.getItem("theme:manualMode") as ManualMode) || null;
    } catch {
      return null;
    }
  });

  const [manualWeather, setManualWeather] = useState<ManualWeather>(() => {
    try {
      return (localStorage.getItem("theme:manualWeather") as ManualWeather) || null;
    } catch {
      return null;
    }
  });

  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("theme:music") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (manualMode) {
        localStorage.setItem("theme:manualMode", manualMode);
      } else {
        localStorage.removeItem("theme:manualMode");
      }
    } catch {}
  }, [manualMode]);

  useEffect(() => {
    try {
      if (manualWeather) {
        localStorage.setItem("theme:manualWeather", manualWeather);
      } else {
        localStorage.removeItem("theme:manualWeather");
      }
    } catch {}
  }, [manualWeather]);

  useEffect(() => {
    try {
      localStorage.setItem("theme:music", String(musicEnabled));
    } catch {}
  }, [musicEnabled]);

  return {
    manualMode,
    manualWeather,
    musicEnabled,
    setManualMode,
    setManualWeather,
    setMusicEnabled,
  };
}
