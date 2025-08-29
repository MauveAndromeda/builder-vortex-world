import { useParams, Link } from "react-router-dom";
import { works, getChaptersByWork } from "@/data/content";
import { useLocale, t, localized } from "@/lib/i18n";
import SEO from "@/components/site/SEO";

export default function WorkDetail() {
  const { slug } = useParams();
  const { locale } = useLocale();
  const work = works.find((w) => w.slug === slug);
  if (!work) return <section className="py-16"><div>Not found</div></section>;
  const chapters = getChaptersByWork(work.slug);

  return (
    <section className="py-10">
      <SEO title={`${work.title} — ${t("brand", locale)}`} description={work.excerpt} />
      <header className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">{work.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{work.author} · {new Date(work.date).toLocaleDateString()}</p>
        <p className="mt-3 text-muted-foreground">{work.excerpt}</p>
      </header>

      <div className="mt-8 grid gap-10 md:grid-cols-12">
        <article id="reader" className="md:col-span-8 prose prose-neutral dark:prose-invert max-w-none watermark no-copy">
          <h2 className="sr-only">Reader</h2>
          <p>{chapters[0]?.content || "A sample will appear here."}</p>
          <p>— {work.author}</p>
        </article>
        <aside className="md:col-span-4 md:sticky md:top-24 h-fit">
          <div className="rounded-2xl border p-5">
            <div className="font-medium mb-2">{t("chapters", locale)}</div>
            <ol className="space-y-2 text-sm">
              {chapters.map((c)=> (
                <li key={c.order} className="flex items-center justify-between">
                  <span className="truncate">{c.order}. {c.title}</span>
                  {c.price ? <span className="opacity-70">${c.price.toFixed(2)}</span> : <span className="opacity-50">Free</span>}
                </li>
              ))}
            </ol>
            <div className="mt-4 flex gap-2">
              <Link to="#reader" className="flex-1 rounded-full bg-foreground text-background px-4 py-2 text-sm text-center">{t("readOnline", locale)}</Link>
              <Link to={localized(`/checkout/work/${work.slug}`, locale)} className="flex-1 rounded-full border px-4 py-2 text-sm text-center">Buy</Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-4 mx-auto w-full max-w-3xl px-4 md:hidden">
        <div className="rounded-full border bg-background px-3 py-2 shadow-lg flex gap-2">
          <Link to="#reader" className="flex-1 rounded-full bg-foreground text-background px-4 py-2 text-sm text-center">{t("readOnline", locale)}</Link>
          <Link to={localized(`/checkout/work/${work.slug}`, locale)} className="flex-1 rounded-full border px-4 py-2 text-sm text-center">Buy</Link>
        </div>
      </div>
    </section>
  );
}
