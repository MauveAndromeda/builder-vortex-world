import { useEffect, useRef } from "react";

export default function Starfield({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = w * dpr; canvas.height = h * dpr; ctx.scale(dpr, dpr);

    const stars = Array.from({ length: Math.floor((w*h)/8000) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      tw: Math.random() * Math.PI * 2,
    }));
    let meteorT = 0;

    const draw = (t: number) => {
      ctx.clearRect(0,0,w,h);
      // gradient sky
      const g = ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0,"#0a1b3f");
      g.addColorStop(1,"#152a5c");
      ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

      // subtle texture overlay via image
      // handled by CSS background on parent

      // stars
      for (const s of stars) {
        const a = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t/900 + s.tw));
        ctx.globalAlpha = a;
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // moon
      const mx = w*0.85, my = h*0.15, mr = 26;
      ctx.fillStyle = "rgba(255,255,230,0.9)";
      ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI*2); ctx.fill();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath(); ctx.arc(mx+8, my-2, mr, 0, Math.PI*2); ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      // meteor every 20–40s
      meteorT += 1/60;
      if (meteorT > 20 + Math.random()*20) { meteorT = 0; shoot(); }

      raf = requestAnimationFrame(draw);
    };

    let shooting: {x:number;y:number;vx:number;vy:number;life:number}|null = null;
    function shoot(){
      shooting = { x: Math.random()*w*0.3, y: Math.random()*h*0.3, vx: 6, vy: 2, life: 0.9 };
    }

    function drawMeteor(){
      if (!shooting) return;
      const s = shooting; s.x += s.vx; s.y += s.vy; s.life *= 0.96;
      ctx.strokeStyle = `rgba(255,255,255,${s.life})`;
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x-20, s.y-8); ctx.stroke();
      if (s.life < 0.05) shooting = null;
    }

    const loop = (t:number)=>{ draw(t); drawMeteor(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);

    const onResize = () => { w = (canvas.width = canvas.offsetWidth); h = (canvas.height = canvas.offsetHeight); const d = Math.min(2, window.devicePixelRatio||1); canvas.width = w*d; canvas.height = h*d; ctx.scale(d,d); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, [reduce]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
