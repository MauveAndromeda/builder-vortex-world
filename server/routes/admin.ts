import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// In-memory store (ephemeral)
const store = {
  token: "" as string,
  adminUser: process.env.ADMIN_USER || "admin",
  adminPass: process.env.ADMIN_PASS || "admin123",
  works: [] as any[], // extra works created via admin
  chapters: new Map<string, any[]>(),
  featuredSlugs: new Set<string>(),
  stats: {
    startedAt: Date.now(),
    requests: 0,
    createdWorks: 0,
    deletedWorks: 0,
    optimized: 0,
  },
};

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers["authorization"] || "";
  const token = Array.isArray(hdr) ? hdr[0] : hdr;
  const t = token.replace(/^Bearer\s+/i, "");
  if (!t || t !== store.token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}

export function attachAdmin(app: any) {
  app.use((_: Request, __: Response, next: NextFunction) => {
    store.stats.requests++;
    next();
  });

  app.post("/api/admin/login", (req: Request, res: Response) => {
    const { username, password } = req.body || {};
    if (username === store.adminUser && password === store.adminPass) {
      store.token = crypto.randomBytes(16).toString("hex");
      res.json({ token: store.token, user: { name: username, role: "ADMIN" } });
    } else {
      res.status(401).json({ error: "invalid_credentials" });
    }
  });

  // List admin data
  app.get("/api/admin/list", adminMiddleware, (_req: Request, res: Response) => {
    res.json({ works: store.works, featured: Array.from(store.featuredSlugs) });
  });

  // Stats
  app.get("/api/admin/stats", adminMiddleware, (_req: Request, res: Response) => {
    res.json({ ...store.stats, worksCount: store.works.length, featuredCount: store.featuredSlugs.size });
  });

  // Public home additions endpoint (no auth) for client rendering
  app.get("/api/admin/home-works", (_req: Request, res: Response) => {
    res.json({ works: store.works, featured: Array.from(store.featuredSlugs) });
  });

  // Create / upload work
  app.post("/api/admin/works", adminMiddleware, (req: Request, res: Response) => {
    const { title, slug, cover, excerpt, author, date, tags, price, published, content, featured } = req.body || {};
    if (!title || !slug) return res.status(400).json({ error: "missing_title_or_slug" });
    const exists = store.works.some((w) => w.slug === slug);
    if (exists) return res.status(409).json({ error: "slug_exists" });
    const work = { title, slug, cover: cover || "/placeholder.svg", excerpt: excerpt || "", author: author || "", date: date || new Date().toISOString().slice(0,10), tags: tags || [], price: Number(price ?? 0), published: published !== false };
    store.works.unshift(work);
    if (featured) store.featuredSlugs.add(slug);
    store.stats.createdWorks++;

    // Optional: basic auto split into chapters from content
    let chapters: any[] = [];
    if (content && typeof content === "string") {
      chapters = autoSplit(content, slug);
      store.chapters.set(slug, chapters);
    }
    res.json({ ok: true, work, chapters });
  });

  // Delete
  app.delete("/api/admin/works/:slug", adminMiddleware, (req: Request, res: Response) => {
    const { slug } = req.params;
    const before = store.works.length;
    store.works = store.works.filter((w) => w.slug !== slug);
    store.featuredSlugs.delete(slug);
    const deleted = before !== store.works.length;
    if (deleted) store.stats.deletedWorks++;
    res.json({ ok: true, deleted });
  });

  // Update price / flags
  app.patch("/api/admin/works/:slug", adminMiddleware, (req: Request, res: Response) => {
    const { slug } = req.params;
    const w = store.works.find((x) => x.slug === slug);
    if (!w) return res.status(404).json({ error: "not_found" });
    const { price, featured, cover, content } = req.body || {};
    if (price != null) w.price = Number(price);
    if (cover) w.cover = String(cover);
    if (featured === true) store.featuredSlugs.add(slug);
    if (featured === false) store.featuredSlugs.delete(slug);
    if (typeof content === "string") {
      const chapters = autoSplit(content, slug);
      store.chapters.set(slug, chapters);
    }
    res.json({ ok: true, work: w, chapters: store.chapters.get(slug) || [] });
  });

  // Auto split chapters endpoint
  app.post("/api/admin/chapters/split", adminMiddleware, (req: Request, res: Response) => {
    const { content, workSlug } = req.body || {};
    if (!content) return res.status(400).json({ error: "missing_content" });
    const chapters = autoSplit(String(content), String(workSlug || "work"));
    res.json({ ok: true, chapters });
  });

  // Get chapters for a work (admin-created)
  app.get("/api/admin/chapters/:slug", (req: Request, res: Response) => {
    const slug = String(req.params.slug);
    const ch = store.chapters.get(slug) || [];
    res.json({ ok: true, chapters: ch });
  });

  // Base64 image upload (saves under public/uploads)
  app.post("/api/admin/upload", adminMiddleware, (req: Request, res: Response) => {
    try {
      const { dataUri, filename } = req.body || {};
      if (!dataUri || typeof dataUri !== "string") return res.status(400).json({ error: "missing_dataUri" });
      const m = dataUri.match(/^data:(.+?);base64,(.+)$/);
      if (!m) return res.status(400).json({ error: "invalid_dataUri" });
      const mime = m[1];
      const b64 = m[2];
      const buf = Buffer.from(b64, "base64");
      const extFromMime = mime.split("/")[1] || "bin";
      const ext = (filename?.split(".").pop() || extFromMime).toLowerCase();
      const dir = path.join(process.cwd(), "public", "uploads");
      fs.mkdirSync(dir, { recursive: true });
      const key = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = path.join(dir, key);
      fs.writeFileSync(filePath, buf);
      const url = `/uploads/${key}`;
      res.json({ ok: true, url, mime, size: buf.length });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "upload_failed" });
    }
  });

  // AI optimize endpoint (stub)
  app.post("/api/admin/ai/optimize", adminMiddleware, (req: Request, res: Response) => {
    const { content } = req.body || {};
    if (typeof content !== "string") return res.status(400).json({ error: "missing_content" });
    const optimized = optimizeText(content);
    store.stats.optimized++;
    res.json({ ok: true, optimized });
  });
}

function autoSplit(content: string, slug: string) {
  // Split by double newlines or H1/H2 markers
  const raw = content.split(/\n\s*\n|^# .*$|^## .*$|^第.+章.*$/m).map((s) => s.trim()).filter(Boolean);
  const chapters = raw.map((txt, i) => ({ work: slug, order: i + 1, title: `Chapter ${i + 1}`, content: txt }));
  return chapters;
}

function optimizeText(input: string) {
  // Simple normalization as a stand-in for AI optimization
  return input
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
