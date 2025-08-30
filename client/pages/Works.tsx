import { works as allWorks } from "@/data/content";
import { Breadcrumbs, Pagination } from "@/components/site/Layout";
import SEO from "@/components/site/SEO";
import { useLocale, t, localized } from "@/lib/i18n";
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import BookCard from "@/components/site/BookCard";

export default function Works() {
  const { locale } = useLocale();
  const loc = useLocation();
  const nav = useNavigate();
  const params = new URLSearchParams(loc.search);
  const q = params.get("q")?.toLowerCase() ?? "";
  const author = params.get("author") ?? "";
  const tag = params.get("tag") ?? "";
  const pageParam = Number(params.get("page") || 1);

  const authors = Array.from(new Set(allWorks.map((w) => w.author)));
  const tags = Array.from(new Set(allWorks.flatMap((w) => w.tags || [])));

  const filtered = useMemo(
    () =>
      allWorks.filter(
        (w) =>
          w.published &&
          (!q ||
            w.title.toLowerCase().includes(q) ||
            w.excerpt.toLowerCase().includes(q) ||
            w.author.toLowerCase().includes(q)) &&
          (!author || w.author === author) &&
          (!tag || (w.tags || []).includes(tag)),
      ),
    [q, author, tag],
  );

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(totalPages, Math.max(1, pageParam));
  const pageWorks = filtered.slice((page - 1) * pageSize, page * pageSize);

  function onPage(p: number) {
    const next = new URLSearchParams(loc.search);
    next.set("page", String(p));
    nav(loc.pathname + "?" + next.toString());
  }

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(loc.search);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    nav(loc.pathname + "?" + next.toString());
  }

  return (
    <section className="py-10">
      <SEO
        title={`${t("works", locale)} — ${t("brand", locale)}`}
        description="Browse published works."
      />
      <Breadcrumbs
        items={[
          { href: localized("/", locale), label: t("home", locale) },
          { label: t("works", locale) },
        ]}
      />

      <div className="mt-6 flex items-center gap-3 flex-wrap">
        <label className="text-sm">
          Author
          <select
            value={author}
            onChange={(e) => setFilter("author", e.target.value)}
            className="ml-2 rounded-full border bg-background px-3 py-1 text-sm"
          >
            <option value="">All</option>
            {authors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Tag
          <select
            value={tag}
            onChange={(e) => setFilter("tag", e.target.value)}
            className="ml-2 rounded-full border bg-background px-3 py-1 text-sm"
          >
            <option value="">All</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <div className="text-sm text-muted-foreground">Search: “{q}”</div>
      </div>

      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {pageWorks.map((w) => (
          <BookCard key={w.slug} work={w} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filtered.length} items
        </div>
        <Pagination page={page} total={totalPages} onPage={onPage} />
      </div>
    </section>
  );
}
