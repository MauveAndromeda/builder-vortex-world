import { useMemo } from "react";
import Starfield from "./Starfield";

export default function GlobalSkyLayer() {
  const canRender = useMemo(() => {
    if (typeof document === "undefined") return true;
    return !document.getElementById("global-sky-layer");
  }, []);
  if (!canRender) return null;
  return (
    <div
      id="global-sky-layer"
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0 }}
    >
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #0a1b3f 0%, #152a5c 100%)",
        opacity: 1,
      }} />
      <div className="absolute inset-0">
        <Starfield className="block w-full h-full" />
      </div>
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
