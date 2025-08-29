import SEO from "@/components/site/SEO";
import { t, useLocale, localized } from "@/lib/i18n";
import { settings } from "@/data/content";
import { Link } from "react-router-dom";

export default function Home() {
  const { locale } = useLocale();
  const hero = locale === "en-US" ? settings.heroTextEn : settings.heroTextZh;
  return (
    <section className="py-16 md:py-24">
      <SEO title={`${t("brand", locale)} — ${hero}`} description="A minimalist literary website for wandering readers." />
      <div className="mx-auto grid gap-10 md:grid-cols-12 items-center">
        <div className="md:col-span-7">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            {hero}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-prose">
            Essays, fragments, and quiet experiments. Distraction-free reading with light/dark comfort.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={localized("/works", locale)} className="inline-flex items-center rounded-full bg-foreground text-background px-5 py-2.5 text-sm transition-transform duration-300 hover:scale-[1.015]">
              {t("readOnline", locale)}
            </Link>
            <Link to={localized("/checkout/buy-all", locale)} className="inline-flex items-center rounded-full border px-5 py-2.5 text-sm transition hover:bg-muted">
              {t("buyAll", locale)}
            </Link>
          </div>
        </div>
        <div className="md:col-span-5">
          <div className="relative aspect-[4/3] rounded-3xl border bg-gradient-to-br from-muted to-background overflow-hidden">
            <img srcSet="/placeholder.svg 1x" src="/placeholder.svg" alt="Books" className="absolute inset-0 h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(0,0,0,0.06),_transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.06),_transparent_60%)]" />
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {["Read quietly","Own your library","Built with care"].map((x,i)=> (
          <div key={i} className="rounded-2xl border p-6 transition hover:shadow-sm">
            <div className="text-sm font-medium opacity-70">0{i+1}</div>
            <div className="mt-2 font-semibold">{x}</div>
            <p className="text-sm text-muted-foreground mt-1">Gentle motion, clear type, responsive images. WCAG AA.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
