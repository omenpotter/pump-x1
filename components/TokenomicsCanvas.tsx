"use client";
import { useEffect, useRef } from "react";

export default function TokenomicsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const resize = () => { c.width = c.clientWidth; c.height = c.clientHeight; };
    resize(); window.addEventListener("resize", resize);
    let prog = 0;
    const pImg = new Image(); pImg.src = "/pump-token.png";
    let raf: number;
    const draw = () => {
      const W = c.width, H = c.height, cx = W / 2, cy = H / 2;
      const r = Math.min(W, H) * .36, thick = Math.min(W, H) * .1;
      const t = Date.now() * .001;
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath(); ctx.arc(cx, cy, r + thick * .7, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,130,255,.04)"; ctx.lineWidth = thick + 24; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,130,255,.07)"; ctx.lineWidth = thick; ctx.stroke();
      const ag = Math.PI * 2 * Math.min(prog, 1);
      const grd = ctx.createConicGradient(-Math.PI / 2, cx, cy);
      grd.addColorStop(0, "#00aaff"); grd.addColorStop(.35, "#00ddff"); grd.addColorStop(.7, "#0066cc"); grd.addColorStop(1, "#00aaff");
      ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + ag);
      ctx.strokeStyle = grd; ctx.lineWidth = thick; ctx.shadowBlur = 22; ctx.shadowColor = "rgba(0,150,255,.7)"; ctx.stroke(); ctx.shadowBlur = 0;
      for (let i = 0; i < 8; i++) {
        const a = t * .6 + i * Math.PI * 2 / 8;
        const dx = cx + Math.cos(a) * (r + thick * .85), dy = cy + Math.sin(a) * (r + thick * .85);
        ctx.beginPath(); ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,200,255,${.25 + .35 * Math.abs(Math.sin(t * 1.8 + i))})`; ctx.fill();
      }
      const ir = r - thick * .6;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, ir, 0, Math.PI * 2); ctx.clip();
      if (pImg.complete && pImg.naturalWidth > 0) ctx.drawImage(pImg, cx - ir, cy - ir, ir * 2, ir * 2);
      else { ctx.fillStyle = "#010810"; ctx.fillRect(cx - ir, cy - ir, ir * 2, ir * 2); }
      ctx.restore();
      ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.beginPath(); ctx.arc(cx, cy, ir * .65, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.95)"; ctx.font = `bold ${Math.min(W, H) * .13}px Bebas Neue,sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("100%", cx, cy - 8);
      ctx.fillStyle = "rgba(0,200,255,.7)"; ctx.font = `${Math.min(W, H) * .042}px DM Mono,monospace`;
      ctx.fillText("COMMUNITY", cx, cy + Math.min(W, H) * .09);
      if (prog < 1) prog += .007;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={ref} style={{ width: "100%", maxWidth: 460, height: 460, display: "block", margin: "0 auto" }} />;
}
