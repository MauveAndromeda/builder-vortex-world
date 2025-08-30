import { useEffect, useRef } from "react";

type Rect = { top: number; bottom: number };

type Mode = "night" | "dawn" | "morning" | "noon" | "afternoon" | "dusk";

export default function Starfield({
  className = "",
  avoidRects = [] as DOMRect[],
  mode = "night",
  starScale = 1,
  showSun = false,
  showMoon = true,
  backgroundGradient,
}: {
  className?: string;
  avoidRects?: DOMRect[];
  mode?: Mode;
  starScale?: number; // 0..1
  showSun?: boolean;
  showMoon?: boolean;
  backgroundGradient?: { from: string; to: string } | null; // if null, Starfield won't paint bg
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let running = true;
    let frames = 0;
    let startTime = performance.now();
    let lowFps = false;
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Generate 3 parallax layers
    const makeStars = (count: number, rMin: number, rMax: number) =>
      Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rMin + Math.random() * (rMax - rMin),
        tw: Math.random() * Math.PI * 2,
      }));
    const total = Math.max(40, Math.floor((w * h) / 7000));
    const layerBack = makeStars(Math.floor(total * 0.3), 0.15, 0.8);
    const layerMid = makeStars(Math.floor(total * 0.45), 0.25, 1.1);
    const layerFront = makeStars(Math.floor(total * 0.25), 0.5, 1.6);

    // Celestial objects (galaxies, clusters, planets)
    type Galaxy = { x: number; y: number; rx: number; ry: number; rot: number; tw: number };
    type Cluster = { x: number; y: number; r: number; tw: number };
    type Planet = { x: number; y: number; r: number; color: string; ring: boolean };

    let galaxies: Galaxy[] = [];
    let clusters: Cluster[] = [];
    let planets: Planet[] = [];

    function seedRandom(seed: number) {
      let t = seed >>> 0;
      return () => {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
      };
    }

    function regenCelestial() {
      const epoch = Math.floor(Date.now() / (1000 * 60 * 30));
      const rnd = seedRandom(epoch + (mode === "night" ? 100 : mode === "dusk" ? 60 : 20));
      const gCount = mode === "night" ? 5 : mode === "dusk" || mode === "dawn" ? 3 : 1;
      const cCount = mode === "night" ? 14 : mode === "dusk" || mode === "dawn" ? 9 : 4;
      const pCount = mode === "night" ? 2 : mode === "dusk" ? 1 : 0;
      galaxies = Array.from({ length: gCount }, () => ({
        x: rnd() * w,
        y: rnd() * h * 0.6,
        rx: 28 + rnd() * 36,
        ry: 12 + rnd() * 22,
        rot: rnd() * Math.PI,
        tw: rnd() * Math.PI * 2,
      }));
      clusters = Array.from({ length: cCount }, () => ({
        x: rnd() * w,
        y: rnd() * h,
        r: 18 + rnd() * 26,
        tw: rnd() * Math.PI * 2,
      }));
      planets = Array.from({ length: pCount }, () => ({
        x: w * (0.2 + rnd() * 0.6),
        y: h * (0.15 + rnd() * 0.35),
        r: 8 + rnd() * 10,
        color: rnd() > 0.5 ? "#9ad1ff" : "#ffd48a",
        ring: rnd() > 0.6,
      }));
    }

    regenCelestial();
    const regenId = setInterval(regenCelestial, 30 * 60 * 1000);

    let scrollY = window.scrollY;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Meteors
    let nextMeteorAt = performance.now() + rand(2500, 6000);
    type Meteor = { x: number; y: number; vx: number; vy: number; life: number };
    let meteors: Meteor[] = [];

    function rand(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    function remapAvoidRects(): Rect[] {
      const canvasRect = canvas.getBoundingClientRect();
      return avoidRects.map((r) => ({
        top: r.top - canvasRect.top,
        bottom: r.bottom - canvasRect.top,
      }));
    }

    function pickSafeY(ranges: Rect[]): number {
      // Exclude avoid ranges (expanded) from [0, h*0.6]
      const limit = h * 0.6;
      const expanded = ranges
        .map((r) => ({
          top: Math.max(0, r.top - 24),
          bottom: Math.min(limit, r.bottom + 24),
        }))
        .filter((r) => r.bottom > 0 && r.top < limit)
        .sort((a, b) => a.top - b.top);
      const holes: [number, number][] = [];
      let cursor = 0;
      for (const r of expanded) {
        if (r.top > cursor) holes.push([cursor, Math.min(r.top, limit)]);
        cursor = Math.max(cursor, r.bottom);
        if (cursor >= limit) break;
      }
      if (cursor < limit) holes.push([cursor, limit]);
      const choice = holes.length
        ? holes[Math.floor(Math.random() * holes.length)]
        : ([0, limit] as [number, number]);
      return rand(choice[0], choice[1]);
    }

    function scheduleMeteor(now: number) {
      const base = mode === "night" ? 6500 : mode === "dusk" || mode === "dawn" ? 9000 : 12000;
      nextMeteorAt = now + rand(base, base + 4000);
    }

    function spawnMeteor() {
      const ranges = remapAvoidRects();
      const y = pickSafeY(ranges);
      const x = rand(0, w * 0.55);
      meteors.push({ x, y, vx: 7, vy: 2.7, life: 1 });
    }

    function drawMeteors() {
      if (!meteors.length) return;
      ctx.lineWidth = 2;
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life *= 0.965;
        ctx.strokeStyle = `rgba(255,255,255,${m.life})`;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - 26, m.y - 10);
        ctx.stroke();
        if (m.life < 0.06 || m.x > w + 40 || m.y > h + 40) meteors.splice(i, 1);
      }
    }

    function drawLayer(
      stars: { x: number; y: number; r: number; tw: number }[],
      t: number,
      parallax: number,
      scale: number,
    ) {
      const offset = Math.min(24, scrollY * parallax);
      for (const s of stars) {
        const base = 0.12 * scale; // lower base to improve readability
        const range = 0.18 * scale;
        const a = base + range * (0.5 + 0.5 * Math.sin(t / 900 + s.tw));
        if (a <= 0.002) continue;
        ctx.globalAlpha = a;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x, s.y + offset, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function drawGalaxy(g: Galaxy, t: number) {
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rot);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, g.rx);
      grad.addColorStop(0, "rgba(255,255,255,0.25)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.35 + 0.25 * (0.5 + 0.5 * Math.sin(t / 1200 + g.tw));
      ctx.beginPath();
      ctx.ellipse(0, 0, g.rx, g.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
      // label
      ctx.save();
      ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.strokeStyle = "rgba(10,27,63,0.6)";
      ctx.lineWidth = 3;
      const lx = g.x;
      const ly = g.y + g.ry + 8;
      (ctx as any).strokeText?.(g.name, lx, ly);
      ctx.fillText(g.name, lx, ly);
      ctx.restore();
    }

    function drawCluster(c: Cluster, t: number) {
      const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
      grad.addColorStop(0, "rgba(255,255,255,0.12)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(t / 1400 + c.tw));
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function drawPlanet(p: Planet) {
      if (p.ring) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(-0.5);
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * 1.7, p.r * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      const grad = ctx.createRadialGradient(p.x - p.r * 0.4, p.y - p.r * 0.6, 0, p.x, p.y, p.r * 1.2);
      grad.addColorStop(0, p.color + "cc");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawMoon() {
      const mx = w * 0.85,
        my = h * 0.15,
        mr = 26;
      ctx.fillStyle = "rgba(255,255,230,0.9)";
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
      // simple moon phase approximation
      const now = new Date();
      const synodic = 29.53058867;
      const ref = new Date("2021-01-13T05:00:00Z").getTime();
      const phase =
        (((now.getTime() - ref) / (86400 * 1000)) % synodic) / synodic; // 0 new, 0.5 full
      const offset = (phase < 0.5 ? 1 - phase * 2 : (phase - 0.5) * 2) * 10; // 0..10
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(mx + offset, my - 2, mr, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    function drawSun() {
      const mx = w * 0.85,
        my = h * 0.15,
        mr = 28;
      const color = mode === "dawn" ? "#ffd7a6" : mode === "dusk" ? "#ffb46b" : "#ffe58a";
      const halo = mode === "noon" ? 0.28 : 0.22;
      // halo
      ctx.globalCompositeOperation = "lighter";
      const rg = ctx.createRadialGradient(mx, my, 0, mx, my, mr * (1 + halo * 2.2));
      rg.addColorStop(0, color + "cc");
      rg.addColorStop(1, "rgba(255,200,120,0)");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(mx, my, mr * (1 + halo * 2), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      // core
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
    }

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      const d = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = w * d;
      canvas.height = h * d;
      ctx.scale(d, d);
    };
    window.addEventListener("resize", onResize);

    const onVisibility = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(loop);
      else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVisibility);

    // lantern mode
    let lx = w * 0.5,
      ly = h * 0.5;
    function onPointer(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      lx = e.clientX - rect.left;
      ly = e.clientY - rect.top;
    }
    window.addEventListener("pointermove", onPointer, { passive: true });

    const loop = (t: number) => {
      if (!running) return;
      frames++;
      if (!lowFps && frames % 60 === 0) {
        const elapsed = (t - startTime) / 1000;
        const fps = frames / Math.max(0.5, elapsed);
        if (fps < 30) {
          lowFps = true;
        }
      }
        // background (optional)
      ctx.clearRect(0, 0, w, h);
      if (backgroundGradient !== null) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        const from = backgroundGradient?.from ?? "#0a1b3f";
        const to = backgroundGradient?.to ?? "#152a5c";
        g.addColorStop(0, from);
        g.addColorStop(1, to);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // stars intensity by mode
      const intensity = Math.max(0, Math.min(1, starScale)) * (
        mode === "night" ? 1 : mode === "dusk" || mode === "dawn" ? 0.35 : 0.08
      );

      drawLayer(layerBack, t, 0.004 * (1 + intensity * 0.2), intensity);
      drawLayer(layerMid, t, 0.007 * (1 + intensity * 0.2), intensity);
      drawLayer(layerFront, t, 0.011 * (1 + intensity * 0.2), intensity);

      if (mode !== "noon") {
        galaxies.forEach((g) => drawGalaxy(g, t));
        clusters.forEach((c) => drawCluster(c, t));
        if (mode === "night" || mode === "dusk") planets.forEach((p) => drawPlanet(p));
      }

      if (showMoon && (mode === "night" || mode === "dusk")) drawMoon();
      if (showSun && (mode !== "night")) drawSun();

      // lantern glow
      ctx.globalCompositeOperation = "lighter";
      const rg = ctx.createRadialGradient(
        lx,
        ly,
        0,
        lx,
        ly,
        Math.min(w, h) * 0.22,
      );
      rg.addColorStop(0, "rgba(255,255,255,0.12)");
      rg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      // meteors timing (reduced)
      if (t >= nextMeteorAt) {
        const maxConcurrent = mode === "night" ? 3 : mode === "dusk" || mode === "dawn" ? 2 : 1;
        const burst = 1;
        for (let i = 0; i < burst; i++) if (meteors.length < maxConcurrent) spawnMeteor();
        scheduleMeteor(t);
      }
      drawMeteors();

      if (lowFps) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    // start after next paint for LCP
    setTimeout(() => {
      raf = requestAnimationFrame(loop);
    }, 0);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll as any);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer as any);
      try { clearInterval(regenId); } catch {}
    };
  }, [reduce, avoidRects, mode]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
