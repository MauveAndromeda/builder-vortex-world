import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const nav = useNavigate();
  const reduce = useMemo(
    () =>
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    const seen = sessionStorage.getItem("splashSeen");
    if (seen) {
      nav("/", { replace: true });
      return;
    }
    const id = setTimeout(() => {
      try {
        sessionStorage.setItem("splashSeen", "1");
      } catch {}
      nav("/", { replace: true });
    }, 600);
    return () => clearTimeout(id);
  }, [nav]);

  function skip(e: React.MouseEvent) {
    e.preventDefault();
    try {
      sessionStorage.setItem("splashSeen", "1");
    } catch {}
    nav("/", { replace: true });
  }

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1b3f] to-[#152a5c]" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(https://cdn.builder.io/api/v1/image/assets%2F2ddbc13a7719400ea5b757207fa45062%2F77a486a89e634e55bb83c9295b42763b?format=webp&width=800)",
          opacity: 0.25,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {!reduce && <CanvasSky />}
      <img
        alt="silhouette"
        src="https://cdn.builder.io/api/v1/image/assets%2F2ddbc13a7719400ea5b757207fa45062%2Fbb23ddf3d1ea47ce816d2902b98e3562?format=webp&width=800"
        className="absolute left-0 bottom-0 w-[52%] max-w-[640px] opacity-70 select-none pointer-events-none"
      />
      <div className="relative z-10 flex min-h-screen items-center justify-center text-center">
        <div className="text-white animate-in fade-in zoom-in duration-700">
          <h1 className="text-2xl md:text-4xl font-semibold">
            恭喜你发现了伊城的小书屋——你比99%的人更幸运
          </h1>
          <a
            onClick={skip}
            href="/"
            className="mt-6 inline-block rounded-full border border-white/50 px-4 py-2 text-sm opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/80"
          >
            Skip
          </a>
        </div>
      </div>
    </section>
  );
}

function CanvasSky() {
  return (
    <svg className="absolute inset-0 w-full h-full" aria-hidden>
      <defs>
        <radialGradient id="tw" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: 120 }).map((_, i) => (
        <circle
          key={i}
          cx={`${Math.random() * 100}%`}
          cy={`${Math.random() * 100}%`}
          r={Math.random() * 1.5 + 0.3}
          fill="white"
          opacity={Math.random() * 0.9 + 0.1}
        >
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur={`${0.6 + Math.random() * 0.6}s`}
            repeatCount="indefinite"
            begin={`${Math.random()}s`}
          />
        </circle>
      ))}
      <g>
        <circle cx="90%" cy="12%" r="22" fill="rgba(255,255,230,0.9)" />
        <circle cx="93%" cy="11%" r="22" fill="#0a1b3f" opacity="0.7" />
      </g>
      <g>
        <line
          x1="-10%"
          y1="20%"
          x2="20%"
          y2="10%"
          stroke="#fff"
          strokeWidth="2"
        >
          <animate
            attributeName="x1"
            values="-10%;110%"
            dur="22s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y1"
            values="20%;-10%"
            dur="22s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            values="20%;140%"
            dur="22s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            values="10%;-40%"
            dur="22s"
            repeatCount="indefinite"
          />
        </line>
      </g>
    </svg>
  );
}
