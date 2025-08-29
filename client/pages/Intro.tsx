import { useEffect, useMemo } from "react";
import { useLocale, localized } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";

const KEY = "introSeen";

function seenRecently(): boolean {
  try {
    const v = localStorage.getItem(KEY);
    if (!v) return false;
    const ts = Number(v);
    return Date.now() - ts < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function Intro() {
  const { locale } = useLocale();
  const nav = useNavigate();
  const reduce = useMemo(() => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  useEffect(() => {
    if (reduce || seenRecently()) {
      nav(localized("/", locale), { replace: true });
      return;
    }
    const id = setTimeout(() => {
      try { localStorage.setItem(KEY, String(Date.now())); } catch {}
      nav(localized("/", locale), { replace: true });
    }, 1100);
    return () => clearTimeout(id);
  }, [locale, nav, reduce]);

  function skip(e: React.MouseEvent) {
    e.preventDefault();
    try { localStorage.setItem(KEY, String(Date.now())); } catch {}
    nav(localized("/", locale), { replace: true });
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(ellipse_at_center,rgba(0,0,0,0.06),transparent_60%)] dark:[background:radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_60%)]" />
      <div className="absolute inset-0 opacity-30 mix-blend-multiply" aria-hidden>
        <div className="grain" />
      </div>
      <div className="absolute inset-0" aria-hidden>
        {[...Array(16)].map((_,i)=> (
          <span key={i} className="paper animate-float" style={{left: `${(i*7)%100}%`, top: `${(i*13)%100}%`, animationDelay: `${(i%6)*0.1}s`}} />
        ))}
      </div>
      <div className="text-center px-6">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight animate-in fade-in zoom-in duration-700">
          You found YCity’s little bookroom
        </h1>
        <p className="mt-3 text-lg text-muted-foreground animate-in fade-in duration-700 delay-150">恭喜你发现了伊城的小书屋</p>
        <a onClick={skip} href={localized("/", locale)} className="mt-8 inline-block rounded-full border px-4 py-2 text-sm opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">Skip</a>
      </div>
      <style>{`
        @keyframes float { from { transform: translateY(0) translateX(0);} to { transform: translateY(-30px) translateX(10px);} }
        .animate-float { animation: float 1.2s ease-in-out infinite alternate; }
        .grain { position: absolute; inset: 0; background-image: url('data:image/svg+xml;utf8,\
          <svg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\' viewBox=\'0 0 160 160\'>\
            <filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\'/></filter>\
            <rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.05\'/>\
          </svg>'); background-size: 220px 220px; }
        .paper { position: absolute; width: 6px; height: 6px; border-radius: 9999px; background: rgba(0,0,0,0.12); }
        .dark .paper { background: rgba(255,255,255,0.18); }
        @media (prefers-reduced-motion: reduce) {
          .animate-float { animation: none; }
        }
      `}</style>
    </section>
  );
}
