import { useMemo } from "react";

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
      style={{ zIndex: -1 }}
    >
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #0a1b3f 0%, #152a5c 100%)",
        opacity: 0.5,
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage:
          "radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.7) 0, rgba(255,255,255,0) 60%)," +
          "radial-gradient(1.5px 1.5px at 80% 20%, rgba(255,255,255,0.6) 0, rgba(255,255,255,0) 60%)," +
          "radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.5) 0, rgba(255,255,255,0) 60%)," +
          "radial-gradient(1.2px 1.2px at 35% 80%, rgba(255,255,255,0.5) 0, rgba(255,255,255,0) 60%)",
        backgroundRepeat: "no-repeat",
        opacity: 0.4,
        animation: "twinkle 4s ease-in-out infinite alternate",
      }} />
      <style>{`
        @keyframes twinkle { from { opacity: .25 } to { opacity: .5 } }
        @media (prefers-reduced-motion: reduce) { #global-sky-layer div { animation: none !important; } }
      `}</style>
    </div>
  );
}
