import { useParams, Link } from "react-router-dom";
import { works, getChaptersByWork } from "@/data/content";
import { useLocale, t, localized } from "@/lib/i18n";
import SEO from "@/components/site/SEO";
import { useEffect, useMemo, useRef, useState } from "react";

export default function WorkDetail() {
  const { slug } = useParams();
  const { locale } = useLocale();
  const work = works.find((w) => w.slug === slug);
  if (!work) return <section className="py-16"><div>Not found</div></section>;
  const chapters = getChaptersByWork(work.slug);

  const [fontSize, setFontSize] = useState<number>(()=> Number(localStorage.getItem("reader:font")||"18"));
  const [line, setLine] = useState<number>(()=> Number(localStorage.getItem("reader:line")||"30"));
  const [owned, setOwned] = useState<boolean>(()=> localStorage.getItem(`owned:${work.slug}`)==="1");
  const email = localStorage.getItem("user:email") || "guest@yclit.org";
  const readerRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ localStorage.setItem("reader:font", String(fontSize)); },[fontSize]);
  useEffect(()=>{ localStorage.setItem("reader:line", String(line)); },[line]);
  useEffect(()=>{
    const key = `scroll:${work.slug}`;
    const saved = Number(localStorage.getItem(key)||"0");
    if (readerRef.current) readerRef.current.scrollTop = saved;
    const onScroll = () => { if (readerRef.current) localStorage.setItem(key, String(readerRef.current.scrollTop)); };
    readerRef.current?.addEventListener("scroll", onScroll);
    return () => readerRef.current?.removeEventListener("scroll", onScroll);
  },[work.slug]);

  const ctaLabel = owned ? "Donate" : "Buy";
  const ctaHref = owned ? localized(`/checkout/donation`, locale) : localized(`/checkout/work/${work.slug}`, locale);

  return (
    <section className="py-10">
      <SEO title={`${work.title} — ${t("brand", locale)}`} description={work.excerpt} />
      <header className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">{work.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{work.author} · {new Date(work.date).toLocaleDateString()}</p>
        <p className="mt-3 text-muted-foreground">{work.excerpt}</p>
      </header>

      <div className="mt-8 grid gap-10 md:grid-cols-12">
        <article id="reader" className="md:col-span-8 max-h-[70vh] overflow-auto rounded-2xl border p-6 bg-card relative no-copy" onCopy={(e)=>e.preventDefault()} onContextMenu={(e)=>e.preventDefault()} ref={readerRef} style={{ fontSize, lineHeight: `${line/10}` }}>
          <h2 className="sr-only">Reader</h2>
          <div className="absolute inset-0 -z-0">
            <div className="absolute inset-0" style={{
              backgroundImage: `url(${work.cover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(8px)',
              opacity: 0.35
            }} />
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-3 text-[10px] opacity-40 select-none">
            <span>{email} · {new Date().toLocaleString()}</span>
          </div>
          <div className="relative z-10 prose prose-neutral dark:prose-invert max-w-none">
            <p>{chapters[0]?.content || "A sample will appear here."}</p>
            <p>— {work.author}</p>
          </div>
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
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <label className="col-span-1">A
                <input type="range" min={14} max={22} value={fontSize} onChange={(e)=>setFontSize(Number(e.target.value))} className="w-full" />
              </label>
              <label className="col-span-2">Line
                <input type="range" min={20} max={36} value={line} onChange={(e)=>setLine(Number(e.target.value))} className="w-full" />
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <a href="#reader" className="flex-1 rounded-full bg-foreground text-background px-4 py-2 text-sm text-center">{t("readOnline", locale)}</a>
              <Link to={ctaHref} className="flex-1 rounded-full border px-4 py-2 text-sm text-center">{ctaLabel}</Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-4 mx-auto w-full max-w-3xl px-4 md:hidden">
        <div className="rounded-full border bg-background px-3 py-2 shadow-lg flex gap-2">
          <a href="#reader" className="flex-1 rounded-full bg-foreground text-background px-4 py-2 text-sm text-center">{t("readOnline", locale)}</a>
          <Link to={ctaHref} className="flex-1 rounded-full border px-4 py-2 text-sm text-center">{ctaLabel}</Link>
        </div>
      </div>
    </section>
  );
}
