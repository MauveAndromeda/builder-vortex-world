import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobalSkyLayer from "@/components/site/GlobalSkyLayer";

function useAdminToken() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    try {
      setToken(localStorage.getItem("admin:token"));
    } catch {}
  }, []);
  function save(t: string) {
    setToken(t);
    try {
      localStorage.setItem("admin:token", t);
    } catch {}
  }
  function clear() {
    setToken(null);
    try {
      localStorage.removeItem("admin:token");
    } catch {}
  }
  return { token, save, clear };
}

export default function Admin() {
  const nav = useNavigate();
  const { token, save, clear } = useAdminToken();
  const [tab, setTab] = useState<"content" | "stats" | "ai">("content");

  if (!token) return <AdminLogin onToken={save} />;

  return (
    <>
      <GlobalSkyLayer />
      <section className="py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Admin</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => nav(-1)} className="rounded border px-3 py-1 text-sm">Back</button>
            <button onClick={clear} className="rounded border px-3 py-1 text-sm">Sign out</button>
          </div>
        </div>
        <div className="mt-4 flex gap-2 text-sm">
          <button onClick={() => setTab("content")} className={`rounded-full px-3 py-1 ${tab==="content"?"bg-foreground text-background":"border"}`}>Content</button>
          <button onClick={() => setTab("stats")} className={`rounded-full px-3 py-1 ${tab==="stats"?"bg-foreground text-background":"border"}`}>Stats</button>
          <button onClick={() => setTab("ai")} className={`rounded-full px-3 py-1 ${tab==="ai"?"bg-foreground text-background":"border"}`}>AI Tools</button>
        </div>
        {tab === "content" && <AdminContent token={token} />}
        {tab === "stats" && <AdminStats token={token} />}
        {tab === "ai" && <AdminAI token={token} />}
      </section>
    </>
  );
}

function AdminLogin({ onToken }: { onToken: (t: string) => void }) {
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!r.ok) {
      setError("Invalid credentials");
      return;
    }
    const j = await r.json();
    onToken(j.token);
    try { localStorage.setItem("auth:user", JSON.stringify({ name: username, role: "ADMIN" })); } catch {}
  }
  return (
    <section className="max-w-sm mx-auto py-16">
      <h1 className="text-2xl font-semibold">Admin Login</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input value={username} onChange={(e)=>setUser(e.target.value)} placeholder="Username" className="w-full rounded border px-3 py-2" />
        <input type="password" value={password} onChange={(e)=>setPass(e.target.value)} placeholder="Password" className="w-full rounded border px-3 py-2" />
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button className="rounded bg-foreground text-background px-4 py-2">Login</button>
      </form>
    </section>
  );
}

function AdminContent({ token }: { token: string }) {
  const [list, setList] = useState<{works:any[]; featured:string[]}>({ works: [], featured: [] });
  const [form, setForm] = useState({ title: "", slug: "", cover: "", excerpt: "", author: "", price: "", content: "", featured: false });

  async function load() {
    const r = await fetch("/api/admin/list", { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) setList(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, price: form.price ? Number(form.price) : 0, published: true };
    const r = await fetch("/api/admin/works", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    if (r.ok) { setForm({ title: "", slug: "", cover: "", excerpt: "", author: "", price: "", content: "", featured: false }); load(); }
  }

  async function del(slug: string) {
    const r = await fetch(`/api/admin/works/${encodeURIComponent(slug)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) load();
  }

  async function setPrice(slug: string, price: number) {
    const r = await fetch(`/api/admin/works/${encodeURIComponent(slug)}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ price }) });
    if (r.ok) load();
  }

  async function toggleFeatured(slug: string, add: boolean) {
    const r = await fetch(`/api/admin/works/${encodeURIComponent(slug)}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ featured: add }) });
    if (r.ok) load();
  }

  async function autoSplit() {
    if (!form.content.trim()) return;
    const r = await fetch("/api/admin/chapters/split", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: form.content, workSlug: form.slug || "work" }) });
    const j = await r.json();
    alert(`Chapters: ${j.chapters?.length ?? 0}`);
  }

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-2">
      <form onSubmit={upload} className="rounded-2xl border p-4 space-y-2">
        <div className="font-medium">Upload / Create Work</div>
        <input value={form.title} onChange={(e)=>setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full rounded border px-3 py-2" required />
        <input value={form.slug} onChange={(e)=>setForm({ ...form, slug: e.target.value })} placeholder="Slug" className="w-full rounded border px-3 py-2" required />
        <input value={form.cover} onChange={(e)=>setForm({ ...form, cover: e.target.value })} placeholder="Cover URL" className="w-full rounded border px-3 py-2" />
        <input value={form.author} onChange={(e)=>setForm({ ...form, author: e.target.value })} placeholder="Author" className="w-full rounded border px-3 py-2" />
        <input value={form.price} onChange={(e)=>setForm({ ...form, price: e.target.value })} placeholder="Price" className="w-full rounded border px-3 py-2" />
        <textarea value={form.excerpt} onChange={(e)=>setForm({ ...form, excerpt: e.target.value })} placeholder="Excerpt" className="w-full rounded border px-3 py-2 h-20" />
        <textarea value={form.content} onChange={(e)=>setForm({ ...form, content: e.target.value })} placeholder="Full content (for auto chapters)" className="w-full rounded border px-3 py-2 h-40" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e)=>setForm({ ...form, featured: e.target.checked })} /> Add to Featured</label>
        <div className="flex gap-2">
          <button className="rounded bg-foreground text-background px-4 py-2">Create</button>
          <button type="button" onClick={autoSplit} className="rounded border px-3 py-2">Auto Split Chapters</button>
        </div>
      </form>
      <div className="rounded-2xl border p-4">
        <div className="font-medium">Manage Works</div>
        <div className="mt-3 space-y-3">
          {list.works.map((w) => (
            <div key={w.slug} className="rounded border p-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="font-medium">{w.title}</div>
                <div className="text-xs opacity-70">{w.slug}</div>
              </div>
              <button onClick={() => toggleFeatured(w.slug, !list.featured.includes(w.slug))} className="rounded border px-2 py-1 text-xs">{list.featured.includes(w.slug)?"Unfeature":"Feature"}</button>
              <button onClick={() => setPrice(w.slug, Number(prompt("New price", String(w.price ?? 0)) || 0))} className="rounded border px-2 py-1 text-xs">Set Price</button>
              <button onClick={() => del(w.slug)} className="rounded border px-2 py-1 text-xs">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminStats({ token }: { token: string }) {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { (async () => { const r = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }); if (r.ok) setStats(await r.json()); })(); }, []);
  if (!stats) return <div className="mt-6">Loading…</div>;
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      {Object.entries(stats).map(([k,v]) => (
        <div key={k} className="rounded-2xl border p-4">
          <div className="text-sm opacity-70">{k}</div>
          <div className="text-xl font-semibold">{String(v)}</div>
        </div>
      ))}
    </div>
  );
}

function AdminAI({ token }: { token: string }) {
  const [content, setContent] = useState("");
  const [optimized, setOptimized] = useState("");
  async function run() {
    const r = await fetch("/api/admin/ai/optimize", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ content }) });
    const j = await r.json();
    setOptimized(j.optimized || "");
  }
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border p-4">
        <div className="font-medium">Optimize Article</div>
        <textarea value={content} onChange={(e)=>setContent(e.target.value)} className="w-full h-64 rounded border px-3 py-2 mt-2" />
        <button onClick={run} className="mt-2 rounded bg-foreground text-background px-4 py-2">Optimize</button>
      </div>
      <div className="rounded-2xl border p-4">
        <div className="font-medium">Result</div>
        <pre className="whitespace-pre-wrap text-sm mt-2">{optimized}</pre>
      </div>
    </div>
  );
}
