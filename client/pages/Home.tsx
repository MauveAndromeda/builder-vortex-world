import SEO from "@/components/site/SEO";
import { t, useLocale, localized } from "@/lib/i18n";
import { settings, works as allWorks } from "@/data/content";
import { Link } from "react-router-dom";
import Star from "@/components/site/Starfield";
import { useEffect, useMemo, useRef, useState } from "react";

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
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const items = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.idx || 0);
            (e.target as HTMLElement).style.transitionDelay =
              `${40 + idx * 40}ms`;
            (e.target as HTMLElement).classList.add("reveal-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    items.forEach((el, i) => {
      el.dataset.idx = String(i);
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const [favs, setFavs] = useState<Set<string>>(() => {
    try {
      return new Set<string>(JSON.parse(localStorage.getItem("favs") || "[]"));
    } catch {
      return new Set();
    }
  });
  const [onlyFavs, setOnlyFavs] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem("favs", JSON.stringify(Array.from(favs)));
    } catch {}
  }, [favs]);

  const [adminData, setAdminData] = useState<{
    works: typeof allWorks;
    featured: string[];
  }>({ works: [], featured: [] });
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/admin/home-works");
        if (r.ok) setAdminData(await r.json());
      } catch {}
    })();
  }, []);

  const merged = useMemo(() => {
    const bySlug = new Map(allWorks.map((w) => [w.slug, w]));
    const extras = (adminData.works || []).filter(
      (w: any) => !bySlug.has(w.slug),
    );
    return [...allWorks, ...extras].filter((w) => w.published);
  }, [adminData.works]);

  const worksSorted = useMemo(
    () =>
      [...merged].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [merged],
  );

  const featured = useMemo(() => {
    const adminFeatured = (adminData.featured || [])
      .map((slug) => worksSorted.find((w) => w.slug === slug))
      .filter(Boolean) as typeof allWorks;
    const rest = worksSorted.filter(
      (w) => !adminData.featured?.includes(w.slug),
    );
    return [...adminFeatured, ...rest].slice(0, 3);
  }, [worksSorted, adminData.featured]);

  const others = (
    onlyFavs ? worksSorted.filter((w) => favs.has(w.slug)) : worksSorted
  ).slice(3);

  function toggleFav(slug: string) {
    setFavs((prev) => {
      const n = new Set(prev);
      if (n.has(slug)) n.delete(slug);
      else n.add(slug);
      return n;
    });
  }

  return (
    <section className="relative py-16 md:py-24 overflow-hidden rounded-3xl">
      <SEO
        title={`${t("brand", locale)} — ${hero}`}
        description="A minimalist literary website for wandering readers."
      />
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
      <div className="absolute inset-0" />
      <div className="pointer-events-auto absolute top-3 left-1/2 -translate-x-1/2 text-white text-xs">
        <div className="rounded-full bg-white/10 backdrop-blur px-3 py-1 border border-white/20 shadow-sm">
          接受 cookies 并共享位置可获得更好的体验哦
        </div>
      </div>
      <div className="pointer-events-none absolute top-0 left-0 w-64 h-40">
        <div className="meteor-line" style={{ animationDelay: "1s" }} />
      </div>
      <div className="pointer-events-none absolute top-0 right-0 w-64 h-40">
        <div
          className="meteor-line meteor-right"
          style={{ animationDelay: "2.5s" }}
        />
      </div>
      <div className="relative mx-auto grid gap-10 md:grid-cols-12 items-center">
        <div className="md:col-span-7">
          <div
            ref={heroRef}
            className="bg-black/25 text-white rounded-xl p-4 inline-block"
            data-reveal
          >
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
              {hero}
            </h1>
          </div>
          <p className="mt-4 text-slate-200/90 max-w-prose" data-reveal>
            Essays, fragments, and quiet experiments. Distraction-free reading
            with light/dark comfort.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={localized("/works", locale)}
              className="inline-flex items-center rounded-full bg-white text-slate-900 px-5 py-2.5 text-sm ui-float ui-glow"
              data-reveal
            >
              {t("readOnline", locale)}
            </Link>
            <Link
              to={localized("/checkout/buy-all", locale)}
              className="inline-flex items-center rounded-full border border-white/50 text-white px-5 py-2.5 text-sm ui-float"
              data-reveal
            >
              {t("buyAll", locale)}
            </Link>
          </div>
        </div>
        <div className="md:col-span-5" data-reveal>
          <div className="relative aspect-[4/3] rounded-3xl border border-white/10 overflow-hidden ui-float">
            <img
              srcSet="https://cdn.builder.io/api/v1/image/assets%2F2ddbc13a7719400ea5b757207fa45062%2Fd7712336ec20410986723c21d95a8aa2?format=webp&width=800 1x"
              src="https://cdn.builder.io/api/v1/image/assets%2F2ddbc13a7719400ea5b757207fa45062%2Fd7712336ec20410986723c21d95a8aa2?format=webp&width=800"
              alt="Books"
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0a1b3f]/40 to-transparent" />
          </div>
        </div>
      </div>

      <div
        className="relative mt-10 flex items-center gap-4 text-white"
        data-reveal
      >
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F2ddbc13a7719400ea5b757207fa45062%2Fb7c4af3e179d4482957c40ee7f50a174"
          alt="avatar"
          className="h-12 w-12 rounded-full ring-2 ring-white/40"
        />
        <div>
          <div className="font-semibold">YCity Collective</div>
          <div className="text-sm opacity-80">
            夜行文字与城市边角的采集者。写作、策展、以及把白噪声做成诗。
          </div>
        </div>
      </div>

      <div className="relative mt-12">
        <div className="flex items-center justify-between text-white mb-4">
          <h2 className="text-lg font-semibold">精选文章</h2>
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={onlyFavs}
              onChange={(e) => setOnlyFavs(e.target.checked)}
            />
            只看收藏
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((w) => (
            <Link
              key={w.slug}
              to={localized(`/work/${w.slug}`, locale)}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-4 text-white ui-float shine"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold hover:underline underline-offset-4 decoration-white/40">
                    {w.title}
                  </div>
                  <div className="text-xs opacity-80 mt-1">
                    {w.author} · {new Date(w.date).toLocaleDateString()}
                  </div>
                </div>
                <button
                  aria-label="favorite"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFav(w.slug);
                  }}
                  className="ml-auto text-sm px-2 py-1 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 transition"
                >
                  {favs.has(w.slug) ? "♥" : "♡"}
                </button>
              </div>
              <p className="text-sm opacity-90 mt-3 line-clamp-3">
                {w.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="relative mt-10">
        <h3 className="text-white text-base font-semibold mb-3">全部文章</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {others.map((w) => (
            <Link
              key={w.slug}
              to={localized(`/work/${w.slug}`, locale)}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white ui-float"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium hover:underline underline-offset-4 decoration-white/30">
                    {w.title}
                  </div>
                  <div className="text-xs opacity-80 mt-1">{w.author}</div>
                </div>
                <button
                  aria-label="favorite"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFav(w.slug);
                  }}
                  className="ml-auto text-sm px-2 py-1 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 transition"
                >
                  {favs.has(w.slug) ? "♥" : "♡"}
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="relative mt-16 grid gap-6 md:grid-cols-3">
        {["Read quietly", "Own your library", "Built with care"].map((x, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white ui-float"
            data-reveal
            data-idx={i}
          >
            <div className="text-sm font-medium opacity-70">0{i + 1}</div>
            <div className="mt-2 font-semibold">{x}</div>
            <p className="text-sm opacity-80 mt-1">
              Gentle motion, clear type, responsive images. WCAG AA.
            </p>
          </div>
        ))}
      </div>

      <div className="relative mt-16">
        <h2 className="sr-only">Authors</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from(new Set(allWorks.map((w) => w.author))).map((name) => {
            const count = allWorks.filter((w) => w.author === name).length;
            return (
              <Link
                key={name}
                to={localized(`/works?q=${encodeURIComponent(name)}`, locale)}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white ui-float"
              >
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
