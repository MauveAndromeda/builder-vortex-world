import { useEffect, useRef } from "react";

type Rect = { top: number; bottom: number };

export default function Starfield({
  className = "",
  avoidRects = [] as DOMRect[],
}: {
  className?: string;
  avoidRects?: DOMRect[];
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

    let scrollY = window.scrollY;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Meteors
    let nextMeteorAt = performance.now() + rand(15000, 30000);
    let meteor: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    } | null = null;

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
      nextMeteorAt = now + rand(15000, 30000);
    }

    function startMeteor() {
      const ranges = remapAvoidRects();
      const y = pickSafeY(ranges);
      const x = rand(0, w * 0.35);
      meteor = { x, y, vx: 7, vy: 2.7, life: 1 };
    }

    function drawMeteor() {
      if (!meteor) return;
      const m = meteor;
      m.x += m.vx;
      m.y += m.vy;
      m.life *= 0.965;
      ctx.strokeStyle = `rgba(255,255,255,${m.life})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - 26, m.y - 10);
      ctx.stroke();
      if (m.life < 0.06 || m.x > w + 40 || m.y > h + 40) meteor = null;
    }

    function drawLayer(
      stars: { x: number; y: number; r: number; tw: number }[],
      t: number,
      parallax: number,
    ) {
      const offset = Math.min(24, scrollY * parallax);
      for (const s of stars) {
        const a = 0.16 + 0.24 * (0.5 + 0.5 * Math.sin(t / 900 + s.tw));
        ctx.globalAlpha = a;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x, s.y + offset, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
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
      // background
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#0a1b3f");
      g.addColorStop(1, "#152a5c");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      drawLayer(layerBack, t, 0.004);
      drawLayer(layerMid, t, 0.007);
      drawLayer(layerFront, t, 0.011);
      drawMoon();

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

      // meteors timing
      if (t >= nextMeteorAt) {
        startMeteor();
        scheduleMeteor(t);
      }
      drawMeteor();

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
    };
  }, [reduce, avoidRects]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
