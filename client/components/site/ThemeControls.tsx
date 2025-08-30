import { useState, useRef, useEffect } from "react";
import { useThemeOverride, ManualMode, ManualWeather } from "@/hooks/use-theme-override";

export function ThemeControls() {
  const {
    manualMode,
    manualWeather,
    musicEnabled,
    setManualMode,
    setManualWeather,
    setMusicEnabled,
  } = useThemeOverride();

  const [modeOpen, setModeOpen] = useState(false);
  const [weatherOpen, setWeatherOpen] = useState(false);
  const modeRef = useRef<HTMLDivElement>(null);
  const weatherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) {
        setModeOpen(false);
      }
      if (weatherRef.current && !weatherRef.current.contains(e.target as Node)) {
        setWeatherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const modeOptions: { value: ManualMode; label: string; icon: string }[] = [
    { value: null, label: "自动", icon: "⚡" },
    { value: "dawn", label: "黎明", icon: "🌅" },
    { value: "morning", label: "上午", icon: "🌤️" },
    { value: "noon", label: "正午", icon: "☀️" },
    { value: "afternoon", label: "下午", icon: "🌞" },
    { value: "dusk", label: "黄昏", icon: "🌇" },
    { value: "night", label: "夜晚", icon: "🌙" },
  ];

  const weatherOptions: { value: ManualWeather; label: string; icon: string }[] = [
    { value: null, label: "自动", icon: "⚡" },
    { value: "sunny", label: "晴天", icon: "☀️" },
    { value: "cloudy", label: "多云", icon: "⛅" },
    { value: "overcast", label: "阴天", icon: "☁️" },
    { value: "rain", label: "下雨", icon: "🌧️" },
    { value: "snow", label: "下雪", icon: "❄️" },
    { value: "hail", label: "冰雹", icon: "🧊" },
    { value: "windy", label: "大风", icon: "💨" },
    { value: "storm", label: "暴风雨", icon: "⛈️" },
    { value: "blizzard", label: "暴风雪", icon: "🌨️" },
  ];

  const currentMode = modeOptions.find(o => o.value === manualMode) || modeOptions[0];
  const currentWeather = weatherOptions.find(o => o.value === manualWeather) || weatherOptions[0];

  return (
    <div className="flex items-center gap-2">
      {/* Theme Mode Dropdown */}
      <div className="relative" ref={modeRef}>
        <button
          onClick={() => setModeOpen(!modeOpen)}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors"
          aria-label="切换时间模式"
        >
          <span>{currentMode.icon}</span>
          <span className="hidden sm:inline">{currentMode.label}</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {modeOpen && (
          <div className="absolute top-full left-0 mt-1 w-28 bg-background border rounded-lg shadow-lg py-1 z-50">
            {modeOptions.map((option) => (
              <button
                key={option.value || "auto"}
                onClick={() => {
                  setManualMode(option.value);
                  setModeOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors"
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
                {manualMode === option.value && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Weather Dropdown */}
      <div className="relative" ref={weatherRef}>
        <button
          onClick={() => setWeatherOpen(!weatherOpen)}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors"
          aria-label="切换天气场景"
        >
          <span>{currentWeather.icon}</span>
          <span className="hidden sm:inline">{currentWeather.label}</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {weatherOpen && (
          <div className="absolute top-full left-0 mt-1 w-32 bg-background border rounded-lg shadow-lg py-1 z-50">
            {weatherOptions.map((option) => (
              <button
                key={option.value || "auto"}
                onClick={() => {
                  setManualWeather(option.value);
                  setWeatherOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors"
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
                {manualWeather === option.value && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Background Music Toggle */}
      <button
        onClick={() => setMusicEnabled(!musicEnabled)}
        className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
          musicEnabled ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
        }`}
        aria-label="背景音乐"
        title={musicEnabled ? "关闭背景音乐" : "开启背景音乐"}
      >
        <span>{musicEnabled ? "🎵" : "🔇"}</span>
        <span className="hidden sm:inline">{musicEnabled ? "音乐" : "静音"}</span>
      </button>
    </div>
  );
}
