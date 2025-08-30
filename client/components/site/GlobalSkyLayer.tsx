import { useEffect, useMemo, useState } from "react";
import Starfield from "./Starfield";
import { useWeatherTheme } from "../../hooks/use-weather";
import { useThemeOverride } from "../../hooks/use-theme-override";

type Mode = "night" | "dawn" | "morning" | "noon" | "afternoon" | "dusk";

function resolveModeByHour(h: number): Mode {
  if (h >= 5 && h < 7) return "dawn";
  if (h >= 7 && h < 11) return "morning";
  if (h >= 11 && h < 14) return "noon";
  if (h >= 14 && h < 17) return "afternoon";
  if (h >= 17 && h < 20) return "dusk";
  return "night";
}

export default function GlobalSkyLayer() {
  const canRender = useMemo(() => {
    if (typeof document === "undefined") return true;
    return !document.getElementById("global-sky-layer");
  }, []);

  const { manualMode, manualWeather } = useThemeOverride();

  const [autoMode, setAutoMode] = useState<Mode>(() => resolveModeByHour(new Date().getHours()));
  useEffect(() => {
    const id = setInterval(() => setAutoMode(resolveModeByHour(new Date().getHours())), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const mode = manualMode || autoMode;

  const theme = useMemo(() => {
    switch (mode) {
      case "dawn":
        return { grad: { from: "#f6c79d", to: "#ffe1c4" }, starScale: 0.22, overlay: 0.08, sun: false, moon: true };
      case "morning":
        return { grad: { from: "#9ecdf5", to: "#e9f6ff" }, starScale: 0, overlay: 0.03, sun: false, moon: false };
      case "noon":
        return { grad: { from: "#8fc4f3", to: "#f1f9ff" }, starScale: 0, overlay: 0.02, sun: false, moon: false };
      case "afternoon":
        return { grad: { from: "#7ab6e8", to: "#e6f3ff" }, starScale: 0, overlay: 0.03, sun: false, moon: false };
      case "dusk":
        return { grad: { from: "#ffb089", to: "#ffd2a6" }, starScale: 0.26, overlay: 0.08, sun: false, moon: true };
      default:
        return { grad: { from: "#1b2f6f", to: "#27407f" }, starScale: 1, overlay: 0.20, sun: false, moon: true };
    }
  }, [mode]);

  if (!canRender) return null;
  const isDay = mode === "morning" || mode === "noon" || mode === "afternoon";
  const isGolden = mode === "dawn" || mode === "dusk";

  const weather = useWeatherTheme();
  const wc = manualWeather || weather.condition;
  const cloudCount = isDay ? (wc === "overcast" ? 12 : wc === "storm" ? 10 : wc === "cloudy" ? 9 : 6) : 0;
  const cloudOpacity = isDay ? (wc === "overcast" ? 0.5 : wc === "storm" ? 0.55 : wc === "cloudy" ? 0.42 : 0.35) : 0.35;
  const tint = (() => {
    switch (wc) {
      case "storm":
        return "rgba(60,80,110,0.28)";
      case "rain":
        return "rgba(70,100,130,0.22)";
      case "snow":
        return "rgba(230,240,255,0.18)";
      case "hail":
        return "rgba(180,200,220,0.22)";
      case "overcast":
        return "rgba(150,165,185,0.22)";
      case "cloudy":
        return "rgba(180,200,220,0.14)";
      case "windy":
        return "rgba(170,190,210,0.10)";
      default:
        return null;
    }
  })();

  return (
    <div
      id="global-sky-layer"
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -1 }}
    >
      <div className="absolute inset-0" style={{
        background: `linear-gradient(180deg, ${theme.grad.from} 0%, ${theme.grad.to} 100%)`,
      }} />
      <div className="absolute inset-0">
        <Starfield
          className="block w-full h-full"
          mode={mode}
          starScale={theme.starScale}
          showSun={theme.sun}
          showMoon={theme.moon}
          backgroundGradient={null}
        />
      </div>

      {/* Daytime clouds */}
      {isDay && (
        <div className="absolute inset-0">
          {Array.from({ length: cloudCount }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: `${10 + i * 12}%`,
                left: `${-20 - (i % 3) * 10}%`,
                width: `${140 + (i % 3) * 40}px`,
                height: `${60 + (i % 2) * 20}px`,
                opacity: cloudOpacity,
                filter: "blur(0.5px)",
                animation: `cloud-move ${70 + (i % 4) * 15}s linear ${i * 4}s infinite` as any,
                background:
                  "radial-gradient(closest-side, rgba(255,255,255,.9), rgba(255,255,255,0)) 20% 60%/50% 80% no-repeat, " +
                  "radial-gradient(closest-side, rgba(255,255,255,.85), rgba(255,255,255,0)) 60% 50%/60% 90% no-repeat, " +
                  "radial-gradient(closest-side, rgba(255,255,255,.8), rgba(255,255,255,0)) 35% 40%/40% 70% no-repeat",
              }}
            />
          ))}
        </div>
      )}

      {/* Daytime motion: airplane + birds */}
      {isDay && (
        <>
          <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            <g style={{ opacity: 0.25, animation: "plane 45s linear infinite" as any }}>
              <path d="M-10 20 L10 22 L30 20 L10 18 Z" fill="#fff" />
              <rect x="6" y="19.2" width="8" height="1.6" fill="#e6f6ff" />
            </g>
          </svg>
          <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {Array.from({ length: 4 }).map((_, i) => (
              <g key={i} style={{ opacity: 0.22, animation: `birds ${38 + (i % 3) * 8}s linear ${i * 5}s infinite` as any }}>
                <g transform={`translate(-10, ${18 + i * 18}) scale(${0.8 + (i % 3) * 0.25})`}>
                  <path d="M0 0 C 3 -3, 6 -3, 9 0 M9 0 C 12 -3, 15 -3, 18 0" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" />
                  <path d="M22 2 C 25 -1, 28 -1, 31 2 M31 2 C 34 -1, 37 -1, 40 2" fill="none" stroke="#ffffff" strokeWidth="0.7" strokeLinecap="round" />
                  <path d="M44 -1 C 47 -4, 50 -4, 53 -1 M53 -1 C 56 -4, 59 -4, 62 -1" fill="none" stroke="#ffffff" strokeWidth="0.7" strokeLinecap="round" />
                </g>
              </g>
            ))}
          </svg>
        </>
      )}

      {/* Golden hour skyline and whale */}
      {isGolden && (
        <div className="absolute inset-0">
          {/* skyline */}
          <svg className="absolute left-0 right-0" style={{ bottom: 0, height: "18%" }} viewBox="0 0 100 20" preserveAspectRatio="none">
            <linearGradient id="cityg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,0,0,0.35)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
            <path d="M0 20 L0 12 L4 12 L4 9 L7 9 L7 14 L12 14 L12 10 L15 10 L15 16 L21 16 L21 7 L24 7 L24 15 L30 15 L30 11 L35 11 L35 18 L42 18 L42 9 L46 9 L46 17 L53 17 L53 12 L58 12 L58 19 L66 19 L66 10 L72 10 L72 16 L80 16 L80 12 L86 12 L86 18 L94 18 L94 13 L100 13 L100 20 Z" fill="url(#cityg)" />
          </svg>
          {/* whale */}
          <svg className="absolute left-1/2" style={{ bottom: "12%", width: 200, height: 80, transform: "translateX(-50%)" }} viewBox="0 0 200 80" aria-hidden>
            <g style={{ opacity: 0.25, animation: "whale 6s ease-in-out infinite" as any }}>
              <path d="M10 50 C40 20, 100 20, 150 40 C170 45, 185 50, 190 60 C170 52, 150 55, 130 60 C100 70, 60 70, 30 60 Z" fill="#ffffff" />
              <circle cx="38" cy="48" r="2" fill="#0a1b3f" />
            </g>
          </svg>
        </div>
      )}

      {tint && <div className="absolute inset-0" style={{ backgroundColor: tint }} />}

      {(wc === "rain" || wc === "storm") && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="absolute" style={{
              top: `-${Math.random() * 20}vh`,
              left: `${(i * 97) % 100}%`,
              width: 2,
              height: 14,
              background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 60%, rgba(255,255,255,0.9) 100%)",
              transform: "rotate(12deg)",
              opacity: wc === "storm" ? 0.75 : 0.6,
              animation: `rain-fall ${1 + (i % 10) * 0.12}s linear ${(i % 20) * 0.15}s infinite` as any,
            }} />
          ))}
        </div>
      )}

      {wc === "snow" && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="absolute" style={{
              top: `-${Math.random() * 20}vh`,
              left: `${(i * 61) % 100}%`,
              width: 4,
              height: 4,
              borderRadius: 9999,
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 0 6px rgba(255,255,255,0.8)",
              animation: `snow-fall ${5 + (i % 10) * 0.8}s linear ${(i % 30) * 0.25}s infinite` as any,
            }} />
          ))}
        </div>
      )}

      {wc === "hail" && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="absolute" style={{
              top: `-${Math.random() * 20}vh`,
              left: `${(i * 83) % 100}%`,
              width: 6,
              height: 6,
              borderRadius: 9999,
              background: "rgba(255,255,255,0.95)",
              animation: `hail-fall ${1.4 + (i % 8) * 0.1}s linear ${(i % 20) * 0.12}s infinite` as any,
            }} />
          ))}
        </div>
      )}

      {wc === "windy" && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute" style={{
              top: `${10 + (i * 7) % 80}%`,
              left: "-20%",
              width: `${60 + (i % 3) * 30}px`,
              height: 2,
              background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.7), rgba(255,255,255,0))",
              opacity: 0.35,
              filter: "blur(0.5px)",
              animation: `wind-swish ${6 + (i % 4) * 1.2}s linear ${(i % 6) * 0.7}s infinite` as any,
            }} />
          ))}
        </div>
      )}

      {wc === "storm" && (
        <div className="absolute inset-0" style={{ animation: "lightning-flash 7s infinite" as any }} />
      )}

      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${theme.overlay})` }} />

      <style>{`
        @keyframes cloud-move { from { transform: translateX(0); } to { transform: translateX(140vw); } }
        @keyframes plane { 0% { transform: translate(-10%, 0) rotate(2deg); } 50% { transform: translate(55%, -2%) rotate(-1deg);} 100% { transform: translate(120%, -4%) rotate(2deg);} }
        @keyframes whale { 0%, 100% { transform: translateX(-50%) translateY(0);} 50% { transform: translateX(-50%) translateY(-3px);} }
        @keyframes birds { from { transform: translate(-10%, 0); } to { transform: translate(110%, 0); } }
        @keyframes rain-fall { 0% { transform: translateY(-10vh) translateX(0) rotate(12deg); } 100% { transform: translateY(110vh) translateX(8vw) rotate(12deg);} }
        @keyframes snow-fall { 0% { transform: translateY(-10vh) translateX(0); } 50% { transform: translateY(50vh) translateX(5vw);} 100% { transform: translateY(110vh) translateX(10vw);} }
        @keyframes hail-fall { 0% { transform: translateY(-10vh); } 100% { transform: translateY(110vh);} }
        @keyframes wind-swish { 0% { transform: translateX(-20%); opacity: 0; } 10% {opacity: .35;} 90% {opacity:.35;} 100% { transform: translateX(140%); opacity: 0; } }
        @keyframes lightning-flash { 0%, 92%, 100% { background: rgba(255,255,255,0); } 93% { background: rgba(255,255,255,0.55);} 94% { background: rgba(255,255,255,0);} 95% { background: rgba(255,255,255,0.35);} 96% { background: rgba(255,255,255,0);} 98% { background: rgba(255,255,255,0.2);} }
      `}</style>
    </div>
  );
}
