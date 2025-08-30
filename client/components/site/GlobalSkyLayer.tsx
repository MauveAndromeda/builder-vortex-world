import { useEffect, useMemo, useState } from "react";
import Starfield from "./Starfield";

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

  const [mode, setMode] = useState<Mode>(() => resolveModeByHour(new Date().getHours()));
  useEffect(() => {
    const id = setInterval(() => setMode(resolveModeByHour(new Date().getHours())), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const theme = useMemo(() => {
    switch (mode) {
      case "dawn":
        return { grad: { from: "#1a2548", to: "#f6b37b" }, starScale: 0.35, overlay: 0.18, sun: true, moon: true };
      case "morning":
        return { grad: { from: "#5fb0ff", to: "#a2d9ff" }, starScale: 0.08, overlay: 0.08, sun: true, moon: false };
      case "noon":
        return { grad: { from: "#6fc3ff", to: "#d2f0ff" }, starScale: 0.05, overlay: 0.06, sun: true, moon: false };
      case "afternoon":
        return { grad: { from: "#5aa0ff", to: "#bcdfff" }, starScale: 0.07, overlay: 0.08, sun: true, moon: false };
      case "dusk":
        return { grad: { from: "#223058", to: "#ff9361" }, starScale: 0.35, overlay: 0.14, sun: true, moon: true };
      default:
        return { grad: { from: "#0a1b3f", to: "#152a5c" }, starScale: 1, overlay: 0.30, sun: false, moon: true };
    }
  }, [mode]);

  if (!canRender) return null;
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
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${theme.overlay})` }} />
    </div>
  );
}
