import SEO from "@/components/site/SEO";
import { t, useLocale, localized } from "@/lib/i18n";
import { settings, works } from "@/data/content";
import { Link } from "react-router-dom";
import Star from "@/components/site/Starfield";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const { locale } = useLocale();
  const hero = locale === "en-US" ? settings.heroTextEn : settings.heroTextZh;
  const heroRef = useRef<HTMLDivElement>(null);
  const [rects, setRects] = useState<DOMRect[]>([]);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const update = () => setRects([el.getBoundingClientRect()]);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => { ro.disconnect(); window.removeEventListener("resize", update); };
  }, []);

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const idx = Number((e.target as HTMLElement).dataset.idx || 0);
          (e.target as HTMLElement).style.transitionDelay = `${40 + idx * 40}ms`;
          (e.target as HTMLElement).classList.add("reveal-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    items.forEach((el, i) => { el.dataset.idx = String(i); io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden rounded-3xl">
      <SEO title={`${t("brand", locale)} — ${hero}`} description="A minimalist literary website for wandering readers." />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1b3f] to-[#152a5c]" />
      <div className="absolute inset-0" style={{ backgroundImage: "url(https://cdn.builder.io/api/v1/image/assets%2F2ddbc13a7719400ea5b757207fa45062%2F77a486a89e634e55bb83c9295b42763b?format=webp&width=800)", opacity: 0.25, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="absolute inset-0" />
      <div className="pointer-events-none absolute top-0 left-0 w-64 h-40">
        <div className="meteor-line" style={{ animationDelay: '1s' }} />
      </div>
      <div className="pointer-events-none absolute top-0 right-0 w-64 h-40">
        <div className="meteor-line meteor-right" style={{ animationDelay: '2.5s' }} />
      </div>
      <div className="relative mx-auto grid gap-10 md:grid-cols-12 items-center">
        <div className="md:col-span-7">
          <div ref={heroRef} className="bg-black/25 text-white rounded-xl p-4 inline-block" data-reveal>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
              {hero}
            </h1>
          </div>
          <p className="mt-4 text-slate-200/90 max-w-prose" data-reveal>
            Essays, fragments, and quiet experiments. Distraction-free reading with light/dark comfort.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={localized("/works", locale)} className="inline-flex items-center rounded-full bg-white text-slate-900 px-5 py-2.5 text-sm ui-float ui-glow" data-reveal>
              {t("readOnline", locale)}
            </Link>
            <Link to={localized("/checkout/buy-all", locale)} className="inline-flex items-center rounded-full border border-white/50 text-white px-5 py-2.5 text-sm ui-float" data-reveal>
              {t("buyAll", locale)}
            </Link>
          </div>
        </div>
        <div className="md:col-span-5" data-reveal>
          <div className="relative aspect-[4/3] rounded-3xl border border-white/10 overflow-hidden ui-float">
            <img srcSet="https://cdn.builder.io/api/v1/image/assets%2F2ddbc13a7719400ea5b757207fa45062%2Fd7712336ec20410986723c21d95a8aa2?format=webp&width=800 1x" src="https://cdn.builder.io/api/v1/image/assets%2F2ddbc13a7719400ea5b757207fa45062%2Fd7712336ec20410986723c21d95a8aa2?format=webp&width=800" alt="Books" className="absolute inset-0 h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0a1b3f]/40 to-transparent" />
          </div>
        </div>
      </div>

      <div className="relative mt-16 grid gap-6 md:grid-cols-3">
        {["Read quietly","Own your library","Built with care"].map((x,i)=> (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white ui-float" data-reveal data-idx={i}>
            <div className="text-sm font-medium opacity-70">0{i+1}</div>
            <div className="mt-2 font-semibold">{x}</div>
            <p className="text-sm opacity-80 mt-1">Gentle motion, clear type, responsive images. WCAG AA.</p>
          </div>
        ))}
      </div>

      <div className="relative mt-16">
        <h2 className="sr-only">Authors</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from(new Set(works.map(w=>w.author))).map((name)=>{
            const count = works.filter(w=>w.author===name).length;
            return (
              <Link key={name} to={localized(`/works?q=${encodeURIComponent(name)}`, locale)} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white ui-float">
                <div className="text-sm opacity-80">作者</div>
                <div className="mt-1 text-lg font-semibold">{name}</div>
                <div className="text-sm opacity-80 mt-1">作品 {count} 篇</div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
