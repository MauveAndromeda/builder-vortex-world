import { useParams, Link } from "react-router-dom";
import { works, getChaptersByWork } from "@/data/content";
import { useLocale, t, localized } from "@/lib/i18n";
import SEO from "@/components/site/SEO";
import { useEffect, useMemo, useRef, useState } from "react";

export default function WorkDetail() {
  const { slug } = useParams();
  const { locale } = useLocale();
  const work = works.find((w) => w.slug === slug);
  if (!work)
    return (
      <section className="py-16">
        <div>Not found</div>
      </section>
    );
  const [chaptersState, setChaptersState] = useState(() => getChaptersByWork(work.slug));
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/admin/chapters/${encodeURIComponent(work.slug)}`);
        if (r.ok) {
          const j = await r.json();
          if (Array.isArray(j.chapters) && j.chapters.length) setChaptersState(j.chapters);
        }
      } catch {}
    })();
  }, [work.slug]);

  const [fontSize, setFontSize] = useState<number>(() =>
    Number(localStorage.getItem("reader:font") || "18"),
  );
  const [line, setLine] = useState<number>(() =>
    Number(localStorage.getItem("reader:line") || "30"),
  );
  const [owned, setOwned] = useState<boolean>(
    () => localStorage.getItem(`owned:${work.slug}`) === "1",
  );
  const email = localStorage.getItem("user:email") || "guest@yclit.org";
  const readerRef = useRef<HTMLDivElement>(null);
  const [human, setHuman] = useState(false);
  const [wmOffset, setWmOffset] = useState(0);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [progress, setProgress] = useState(0);
  const [readSet, setReadSet] = useState<Set<number>>(
    () =>
      new Set<number>(
        chapters
          .filter(
            (c) => localStorage.getItem(`read:${work.slug}:${c.order}`) === "1",
          )
          .map((c) => c.order),
      ),
  );

  useEffect(() => {
    localStorage.setItem("reader:font", String(fontSize));
  }, [fontSize]);
  useEffect(() => {
    localStorage.setItem("reader:line", String(line));
  }, [line]);
  useEffect(() => {
    const key = `scroll:${work.slug}`;
    const saved = Number(localStorage.getItem(key) || "0");
    if (readerRef.current) readerRef.current.scrollTop = saved;
    const onScroll = () => {
      const el = readerRef.current;
      if (!el) return;
      localStorage.setItem(key, String(el.scrollTop));
      const max = Math.max(1, el.scrollHeight - el.clientHeight);
      const p = Math.min(1, el.scrollTop / max);
      setProgress(p);
      setWmOffset((el.scrollTop || 0) % 120);
      if (p > 0.8 && chaptersState[0]) {
        const rk = `read:${work.slug}:${chaptersState[0].order}`;
        if (localStorage.getItem(rk) !== "1") {
          localStorage.setItem(rk, "1");
          setReadSet(
            (prev) =>
              new Set<number>([...Array.from(prev), chapters[0]!.order]),
          );
        }
      }
    };
    readerRef.current?.addEventListener("scroll", onScroll);
    return () => readerRef.current?.removeEventListener("scroll", onScroll);
  }, [work.slug]);

  const ctaLabel = owned ? "Donate" : "Buy";
  const ctaHref = owned
    ? localized(`/checkout/donation`, locale)
    : localized(`/checkout/work/${work.slug}`, locale);

  return (
    <section className="py-10">
      <div className="fixed left-0 right-0 top-0 h-0.5 z-50 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-sky-300 to-indigo-400"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <SEO
        title={`${work.title} — ${t("brand", locale)}`}
        description={work.excerpt}
      />
      <header className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">{work.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {work.author} · {new Date(work.date).toLocaleDateString()}
        </p>
        <p className="mt-3 text-muted-foreground">{work.excerpt}</p>
      </header>

      <div className="mt-8 grid gap-10 md:grid-cols-12">
        <article
          id="reader"
          className="md:col-span-8 max-h-[70vh] overflow-auto rounded-2xl border p-6 bg-[#f8f5e7] text-black relative no-copy"
          onCopy={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          ref={readerRef}
          style={{ fontSize, lineHeight: `${line / 10}` }}
        >
          <h2 className="sr-only">Reader</h2>
          {!human && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-background/80">
              <label className="bg-card rounded-2xl border p-4 text-sm flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={human}
                  onChange={(e) => setHuman(e.target.checked)}
                />
                我不是机器人 / I am human
              </label>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-3 text-[10px] opacity-40 select-none">
            <span>
              {email} · {new Date().toLocaleString()}
            </span>
          </div>
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent 0, transparent 120px, rgba(0,0,0,0.03) 120px, rgba(0,0,0,0.03) 121px)`,
              transform: `translateY(${wmOffset * 0.2}px)`,
              mixBlendMode: "multiply",
            }}
          />
          <div className="relative z-10 prose prose-neutral max-w-none text-black">
            <p>{chaptersState[0]?.content || "A sample will appear here."}</p>
            <p>— {work.author}</p>
          </div>
        </article>
        <aside className="md:col-span-4 md:sticky md:top-24 h-fit">
          <div className="rounded-2xl border p-5">
            <div className="font-medium mb-2">{t("chapters", locale)}</div>
            <ol className="space-y-2 text-sm">
              {chapters.map((c) => (
                <li key={c.order} className="flex items-center justify-between">
                  <span className="truncate flex items-center gap-2">
                    {readSet.has(c.order) && (
                      <span
                        aria-label="read"
                        title="Read"
                        className="inline-block h-3.5 w-3.5 rounded-full bg-emerald-500"
                      />
                    )}
                    <span>
                      {c.order}. {c.title}
                    </span>
                  </span>
                  {c.price ? (
                    <span className="opacity-70">${c.price.toFixed(2)}</span>
                  ) : (
                    <span className="opacity-50">Free</span>
                  )}
                </li>
              ))}
            </ol>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <label className="col-span-1">
                A
                <input
                  type="range"
                  min={14}
                  max={22}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </label>
              <label className="col-span-2">
                Line
                <input
                  type="range"
                  min={20}
                  max={36}
                  value={line}
                  onChange={(e) => setLine(Number(e.target.value))}
                  className="w-full"
                />
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <a
                href="#reader"
                className="flex-1 rounded-full bg-foreground text-background px-4 py-2 text-sm text-center"
              >
                {t("readOnline", locale)}
              </a>
              <Link
                to={ctaHref}
                className="flex-1 rounded-full border px-4 py-2 text-sm text-center"
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-4 mx-auto w-full max-w-3xl px-4 md:hidden">
        <div className="rounded-full border bg-background px-3 py-2 shadow-lg flex gap-2">
          <a
            href="#reader"
            className="flex-1 rounded-full bg-foreground text-background px-4 py-2 text-sm text-center"
          >
            {t("readOnline", locale)}
          </a>
          <Link
            to={ctaHref}
            className="flex-1 rounded-full border px-4 py-2 text-sm text-center"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
      <div className="mt-8 max-w-3xl">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: work.slug, rating, note }),
              });
            } catch {}
          }}
          className="rounded-2xl border p-4 grid gap-3"
        >
          <div className="text-sm font-medium">读后感 / Feedback</div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`h-8 w-8 rounded-full ${rating >= n ? "bg-amber-400" : "bg-muted"}`}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="One-line thought"
            className="rounded-md border px-3 py-2 bg-background text-sm"
          />
          <div className="flex gap-2">
            <button className="rounded-full bg-foreground text-background px-4 py-2 text-sm">
              Submit
            </button>
            <button
              type="button"
              onClick={() => {
                const c = document.createElement("canvas");
                c.width = 800;
                c.height = 418;
                const x = c.getContext("2d")!;
                x.fillStyle = "#0a1b3f";
                x.fillRect(0, 0, c.width, c.height);
                x.fillStyle = "#fff";
                x.font = "bold 28px Inter";
                x.fillText(work.title, 28, 60);
                x.font = "16px Inter";
                x.fillText(note || "—", 28, 120);
                x.font = "12px Inter";
                const tag =
                  (email.slice(-2) || "**") + " " + new Date().toLocaleString();
                x.fillText(tag, 28, 380);
                const url = c.toDataURL("image/png");
                const a = document.createElement("a");
                a.href = url;
                a.download = "yclit-card.png";
                a.click();
              }}
              className="rounded-full border px-4 py-2 text-sm"
            >
              Save image
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
