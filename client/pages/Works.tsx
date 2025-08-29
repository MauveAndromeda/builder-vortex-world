import { works as allWorks } from "@/data/content";
import { Breadcrumbs, Pagination } from "@/components/site/Layout";
import SEO from "@/components/site/SEO";
import { useLocale, t, localized } from "@/lib/i18n";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

export default function Works() {
  const { locale } = useLocale();
  const loc = useLocation();
  const nav = useNavigate();
  const params = new URLSearchParams(loc.search);
  const q = params.get("q")?.toLowerCase() ?? "";
  const pageParam = Number(params.get("page") || 1);

  const filtered = useMemo(() => allWorks.filter(w => w.published && (!q || w.title.toLowerCase().includes(q) || w.excerpt.toLowerCase().includes(q))), [q]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(totalPages, Math.max(1, pageParam));
  const pageWorks = filtered.slice((page-1)*pageSize, page*pageSize);

  function onPage(p: number) {
    const next = new URLSearchParams(loc.search);
    next.set("page", String(p));
    nav(loc.pathname + "?" + next.toString());
  }

  return (
    <section className="py-10">
      <SEO title={`${t("works", locale)} — ${t("brand", locale)}`} description="Browse published works." />
      <Breadcrumbs items={[{ href: localized("/", locale), label: t("home", locale) }, { label: t("works", locale) }]} />

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {pageWorks.map(w => (
          <article key={w.slug} className="group rounded-2xl border overflow-hidden transition hover:shadow-sm">
            <Link to={localized(`/works/${w.slug}`, locale)} className="block">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={w.cover} alt={w.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold leading-snug">{w.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{w.excerpt}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="opacity-70">${w.price?.toFixed(2)}</span>
                  <span className="rounded-full border px-3 py-1 transition group-hover:bg-muted">{t("readOnline", locale)}</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{filtered.length} items</div>
        <Pagination page={page} total={totalPages} onPage={onPage} />
      </div>
    </section>
  );
}
