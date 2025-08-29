import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { t, useLocale, localized } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex items-center gap-2 rounded-full bg-muted px-1 py-1 text-sm">
      {(["en-US", "zh-CN"] as const).map((l) => (
        <button
          key={l}
          aria-pressed={locale === l}
          onClick={() => setLocale(l)}
          className={cn(
            "px-2 py-1 rounded-full transition-colors",
            locale === l ? "bg-background shadow-sm" : "opacity-70 hover:opacity-100"
          )}
        >
          {l === "en-US" ? "EN" : "简体"}
        </button>
      ))}
    </div>
  );
}

export function Search({ onSubmit }: { onSubmit?: (q: string) => void }) {
  const { locale } = useLocale();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (onSubmit) onSubmit(q);
    else nav(localized(`/works?q=${encodeURIComponent(q)}`, locale));
  }
  return (
    <form onSubmit={submit} className="relative w-full max-w-xs">
      <input
        aria-label="Search"
        placeholder={t("searchPlaceholder", locale)}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded-full bg-muted px-4 py-2 pr-9 text-sm outline-none transition focus:bg-background focus:ring-2 focus:ring-ring"
      />
      <button aria-label="Search" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-sm opacity-70 hover:opacity-100 transition">
        ⌘K
      </button>
    </form>
  );
}

export function Header() {
  const { locale } = useLocale();
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/80 border-b border-border">
      <div className="container mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link to={localized("/", locale)} className="font-semibold text-lg tracking-tight">
            {t("brand", locale)}
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link className="hover:opacity-100 opacity-80 transition" to={localized("/", locale)}>{t("home", locale)}</Link>
            <Link className="hover:opacity-100 opacity-80 transition" to={localized("/works", locale)}>{t("works", locale)}</Link>
            <Link className="hover:opacity-100 opacity-80 transition" to={localized("/about", locale)}>{t("about", locale)}</Link>
            <Link className="hover:opacity-100 opacity-80 transition" to={localized("/contact", locale)}>{t("contact", locale)}</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Search />
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}

export function Newsletter() {
  const { locale } = useLocale();
  async function subscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "");
    try {
      await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      form.reset();
    } catch {}
  }
  return (
    <div id="newsletter" className="rounded-2xl border p-6 md:p-8 bg-card">
      <h3 className="text-lg font-semibold">{t("newsletterTitle", locale)}</h3>
      <p className="text-sm text-muted-foreground mt-1">{t("newsletterDesc", locale)}</p>
      <form onSubmit={subscribe} className="mt-4 flex gap-2">
        <input name="email" type="email" required aria-label="Email" placeholder={t("emailPlaceholder", locale)} className="flex-1 rounded-full bg-muted px-4 py-2 text-sm outline-none focus:bg-background focus:ring-2 focus:ring-ring" />
        <button className="rounded-full bg-foreground text-background px-4 py-2 text-sm transition hover:opacity-90">{t("subscribe", locale)}</button>
      </form>
    </div>
  );
}

export function Footer() {
  const { locale } = useLocale();
  return (
    <footer className="border-t border-border mt-16">
      <div className="container mx-auto py-10 grid gap-8 md:grid-cols-2 items-center">
        <Newsletter />
        <div className="flex flex-col items-start gap-2 text-sm">
          <div className="opacity-80">© 2025 yclit.org</div>
          <div className="flex gap-4">
            <a className="opacity-80 hover:opacity-100 transition" href="#newsletter">Newsletter</a>
            <Link className="opacity-80 hover:opacity-100 transition" to={localized("/privacy", locale)}>{t("privacy", locale)}</Link>
            <Link className="opacity-80 hover:opacity-100 transition" to={localized("/terms", locale)}>{t("terms", locale)}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            {it.href ? <Link className="hover:text-foreground transition" to={it.href}>{it.label}</Link> : <span aria-current="page" className="text-foreground">{it.label}</span>}
            {i < items.length - 1 && <span className="opacity-40">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Pagination({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-2">
      {pages.map((p) => (
        <button key={p} onClick={() => onPage(p)} className={cn("h-8 w-8 rounded-full text-sm transition", p === page ? "bg-foreground text-background" : "bg-muted hover:bg-background")}>{p}</button>
      ))}
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((m)=>[...m,{ role:"user", content: input }]);
    setInput("");
    setTimeout(()=>{
      setMessages((m)=>[...m,{ role:"assistant", content: "AI chat coming soon." }]);
    }, 300);
  }
  return (
    <div className="fixed bottom-4 right-4">
      <button onClick={()=>setOpen(!open)} className="rounded-full bg-foreground text-background px-4 py-2 shadow-lg transition hover:opacity-90">AI</button>
      {open && (
        <div className="mt-2 w-80 rounded-2xl border bg-background shadow-2xl overflow-hidden">
          <div className="px-4 py-2 border-b font-medium">Support</div>
          <div className="max-h-64 overflow-auto p-3 space-y-2 text-sm">
            {messages.map((m,i)=>(
              <div key={i} className={cn("px-3 py-2 rounded-xl max-w-[85%]", m.role==='user' ? "ml-auto bg-foreground text-background" : "bg-muted")}>{m.content}</div>
            ))}
            {messages.length===0 && <div className="text-muted-foreground">Ask anything about YCity.</div>}
          </div>
          <form onSubmit={send} className="flex p-2 gap-2 border-t">
            <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Type a message" className="flex-1 rounded-full bg-muted px-3 py-2 text-sm outline-none focus:bg-background focus:ring-2 focus:ring-ring" />
            <button className="rounded-full bg-foreground text-background px-3 text-sm">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const loc = useLocation();
  useEffect(() => {
    // simple analytics: page view counter
    try {
      const k = "analytics:views";
      const current = Number(localStorage.getItem(k) || "0");
      localStorage.setItem(k, String(current + 1));
    } catch {}
  }, [loc.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 md:px-6">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
