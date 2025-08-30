import { useEffect, useMemo, useState } from "react";
import Starfield from "./Starfield";
import { useWeatherTheme } from "../../hooks/use-weather";
import { useThemeOverride } from "../../hooks/use-theme-override";
import { useBackgroundMusic } from "../../hooks/use-background-music";

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
          {/* Heavy rain */}
          {Array.from({ length: wc === "storm" ? 80 : 60 }).map((_, i) => (
            <div key={`rain-${i}`} className="absolute" style={{
              top: `-${Math.random() * 30}vh`,
              left: `${(i * 71) % 100}%`,
              width: wc === "storm" ? 3 : 2,
              height: wc === "storm" ? 18 : 14,
              background: wc === "storm" ?
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,1) 100%)" :
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 60%, rgba(255,255,255,0.9) 100%)",
              transform: `rotate(${wc === "storm" ? 8 + Math.random() * 8 : 12}deg)`,
              opacity: wc === "storm" ? 0.85 : 0.7,
              animation: `rain-fall ${wc === "storm" ? 0.8 + (i % 8) * 0.1 : 1 + (i % 10) * 0.12}s linear ${(i % 20) * 0.1}s infinite` as any,
            }} />
          ))}
          {/* Rain splash effect for storm */}
          {wc === "storm" && Array.from({ length: 15 }).map((_, i) => (
            <div key={`splash-${i}`} className="absolute" style={{
              bottom: "0%",
              left: `${(i * 83) % 100}%`,
              width: 8,
              height: 2,
              background: "rgba(255,255,255,0.6)",
              borderRadius: "50%",
              animation: `rain-splash ${2 + (i % 6) * 0.3}s ease-out ${(i % 12) * 0.2}s infinite` as any,
            }} />
          ))}
        </div>
      )}

      {(wc === "snow" || wc === "blizzard") && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Snowflakes */}
          {Array.from({ length: wc === "blizzard" ? 120 : 80 }).map((_, i) => {
            const size = wc === "blizzard" ? 2 + Math.random() * 4 : 3 + Math.random() * 3;
            return (
              <div key={`snow-${i}`} className="absolute" style={{
                top: `-${Math.random() * 30}vh`,
                left: `${(i * 47) % 100}%`,
                width: size,
                height: size,
                borderRadius: 9999,
                background: "rgba(255,255,255,0.95)",
                boxShadow: `0 0 ${size * 2}px rgba(255,255,255,0.8)`,
                animation: wc === "blizzard" ?
                  `blizzard-fall ${3 + (i % 8) * 0.5}s linear ${(i % 25) * 0.15}s infinite` :
                  `snow-fall ${5 + (i % 10) * 0.8}s linear ${(i % 30) * 0.25}s infinite`,
              } as any} />
            );
          })}
          {/* Larger snowflakes for depth */}
          {Array.from({ length: wc === "blizzard" ? 25 : 15 }).map((_, i) => (
            <div key={`bigsnow-${i}`} className="absolute" style={{
              top: `-${Math.random() * 25}vh`,
              left: `${(i * 79) % 100}%`,
              width: wc === "blizzard" ? 6 + Math.random() * 4 : 7,
              height: wc === "blizzard" ? 6 + Math.random() * 4 : 7,
              borderRadius: 9999,
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 0 12px rgba(255,255,255,0.9)",
              opacity: 0.8,
              animation: wc === "blizzard" ?
                `blizzard-fall ${2.5 + (i % 6) * 0.4}s linear ${(i % 20) * 0.18}s infinite` :
                `snow-fall ${4 + (i % 8) * 0.6}s linear ${(i % 25) * 0.22}s infinite`,
            } as any} />
          ))}
        </div>
      )}

      {wc === "hail" && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Hailstones */}
          {Array.from({ length: 50 }).map((_, i) => {
            const size = 4 + Math.random() * 6;
            return (
              <div key={`hail-${i}`} className="absolute" style={{
                top: `-${Math.random() * 25}vh`,
                left: `${(i * 67) % 100}%`,
                width: size,
                height: size,
                borderRadius: 9999,
                background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,1), rgba(200,220,255,0.9))",
                boxShadow: "0 0 4px rgba(255,255,255,0.8), inset 1px 1px 2px rgba(255,255,255,0.9)",
                animation: `hail-fall ${1.2 + (i % 8) * 0.15}s ease-in ${(i % 20) * 0.1}s infinite` as any,
              }} />
            );
          })}
          {/* Hail bounce effect */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`hail-bounce-${i}`} className="absolute" style={{
              bottom: "0%",
              left: `${(i * 91) % 100}%`,
              width: 3,
              height: 3,
              borderRadius: 9999,
              background: "rgba(255,255,255,0.7)",
              animation: `hail-bounce ${1.8 + (i % 6) * 0.3}s ease-out ${(i % 15) * 0.15}s infinite` as any,
            }} />
          ))}
        </div>
      )}

      {wc === "windy" && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Wind streaks */}
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={`wind-${i}`} className="absolute" style={{
              top: `${5 + (i * 5.5) % 90}%`,
              left: "-25%",
              width: `${80 + (i % 4) * 40}px`,
              height: i % 3 === 0 ? 3 : 2,
              background: i % 3 === 0 ?
                "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.8), rgba(255,255,255,0.3), rgba(255,255,255,0))" :
                "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.6), rgba(255,255,255,0))",
              opacity: 0.4,
              filter: "blur(0.8px)",
              transform: `skewX(-15deg)`,
              animation: `wind-swish ${4 + (i % 5) * 1}s ease-in-out ${(i % 8) * 0.5}s infinite` as any,
            }} />
          ))}
          {/* Dust particles */}
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={`dust-${i}`} className="absolute" style={{
              top: `${20 + (i * 3) % 60}%`,
              left: "-10%",
              width: 2 + Math.random() * 2,
              height: 2 + Math.random() * 2,
              borderRadius: 9999,
              background: "rgba(255,255,255,0.5)",
              opacity: 0.6,
              animation: `wind-dust ${3 + (i % 6) * 0.8}s linear ${(i % 10) * 0.3}s infinite` as any,
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
        @keyframes rain-fall { 0% { transform: translateY(-15vh) translateX(0); } 100% { transform: translateY(115vh) translateX(8vw);} }
        @keyframes rain-splash { 0% { opacity: 0; transform: scaleX(0.5) scaleY(2); } 50% { opacity: 1; transform: scaleX(2) scaleY(0.5); } 100% { opacity: 0; transform: scaleX(3) scaleY(0.2); } }
        @keyframes snow-fall { 0% { transform: translateY(-15vh) translateX(0) rotate(0deg); } 25% { transform: translateX(2vw) rotate(90deg); } 50% { transform: translateY(50vh) translateX(4vw) rotate(180deg);} 75% { transform: translateX(7vw) rotate(270deg); } 100% { transform: translateY(115vh) translateX(10vw) rotate(360deg);} }
        @keyframes blizzard-fall { 0% { transform: translateY(-20vh) translateX(0) rotate(0deg); } 25% { transform: translateX(-5vw) rotate(90deg); } 50% { transform: translateY(50vh) translateX(15vw) rotate(180deg);} 75% { transform: translateX(20vw) rotate(270deg); } 100% { transform: translateY(120vh) translateX(25vw) rotate(360deg);} }
        @keyframes hail-fall { 0% { transform: translateY(-15vh) scale(1); } 80% { transform: scale(1.1); } 100% { transform: translateY(115vh) scale(1);} }
        @keyframes hail-bounce { 0% { opacity: 0; transform: translateY(0) scale(0.5); } 50% { opacity: 1; transform: translateY(-8px) scale(1); } 100% { opacity: 0; transform: translateY(0) scale(0.5); } }
        @keyframes wind-swish { 0% { transform: translateX(-25%) skewX(-15deg); opacity: 0; } 15% {opacity: .4;} 85% {opacity:.4;} 100% { transform: translateX(150%) skewX(-15deg); opacity: 0; } }
        @keyframes wind-dust { 0% { transform: translateX(-10%) rotate(0deg); opacity: 0; } 20% {opacity: .6;} 80% {opacity:.6;} 100% { transform: translateX(130%) rotate(360deg); opacity: 0; } }
        @keyframes lightning-flash { 0%, 92%, 100% { background: rgba(255,255,255,0); } 93% { background: rgba(255,255,255,0.55);} 94% { background: rgba(255,255,255,0);} 95% { background: rgba(255,255,255,0.35);} 96% { background: rgba(255,255,255,0);} 98% { background: rgba(255,255,255,0.2);} }
      `}</style>
    </div>
  );
}
