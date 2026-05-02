"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const PUMP_CA  = "Pumps1XfLYk4DttvL4ai9WsKtqPvoT5DE3AsijSzb2C";
const XNT_CA   = "XNMbEwZFFBKQhqyW3taa8cAUp1xBUHfyzRFJQvZET4m";
const API_BASE = "https://api.xdex.xyz";
const NETWORK  = "X1%20Mainnet";

const PRICE_URL  = `${API_BASE}/api/token-price/price?network=${NETWORK}&address=${PUMP_CA}`;
const POOL_URL   = `${API_BASE}/api/xendex/pool/tokens/${PUMP_CA}/${XNT_CA}?network=${NETWORK}`;

type Candle = { o: number; h: number; l: number; c: number; vol: number };
type TF = "1m" | "5m" | "1h" | "1d";

function genHistory(n: number, base: number): Candle[] {
  const data: Candle[] = [];
  let p = base > 0 ? base : 0.0001;
  for (let i = n; i >= 0; i--) {
    const v = (Math.random() - .45) * .04;
    const o = p, c = o * (1 + v);
    data.push({
      o, c,
      h: Math.max(o, c) * (1 + Math.random() * .02),
      l: Math.min(o, c) * (1 - Math.random() * .02),
      vol: Math.random() * 900 + 200,
    });
    p = c;
  }
  return data;
}

export default function Chart() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const [tf,        setTf]        = useState<TF>("1m");
  const [price,     setPrice]     = useState("—");
  const [change,    setChange]    = useState("PUMP/XNT");
  const [changePos, setChangePos] = useState(true);
  const [liveVol,   setLiveVol]   = useState(0);
  const [poolAddr,  setPoolAddr]  = useState<string | null>(null);

  const allData = useRef<Record<TF, Candle[]>>({
    "1m": genHistory(60, 0.0001),
    "5m": genHistory(60, 0.0001),
    "1h": genHistory(60, 0.0001),
    "1d": genHistory(60, 0.0001),
  });

  const tfRef = useRef(tf);
  tfRef.current = tf;

  const draw = useCallback(() => {
    const cvs = ref.current;
    const box = boxRef.current;
    if (!cvs || !box) return;
    cvs.width  = box.clientWidth;
    cvs.height = box.clientHeight;
    const W = cvs.width, H = cvs.height;
    if (!W || !H) return;

    const ctx = cvs.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    const data = allData.current[tfRef.current];

    ctx.strokeStyle = "rgba(0,120,200,0.06)"; ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) { const y = H * i / 5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (let i = 0; i <= 7; i++) { const x = W * i / 7; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }

    const vH = H * .18, cH = H * .76;
    const prices = data.flatMap(d => [d.h, d.l]);
    const mn = Math.min(...prices), mx = Math.max(...prices), rng = mx - mn || 1;
    const cw = Math.max(2, (W - 20) / data.length - 1);
    const mvol = Math.max(...data.map(d => d.vol));

    data.forEach((d, i) => {
      const x = 10 + i * (W - 20) / data.length;
      const bull = d.c >= d.o;
      const vh = (d.vol / mvol) * vH * .85;
      ctx.fillStyle = bull ? "rgba(0,150,255,.2)" : "rgba(255,70,70,.15)";
      ctx.fillRect(x, H - vh, cw, vh);
      const oy = cH * (mx - d.o) / rng, cy2 = cH * (mx - d.c) / rng;
      const by = Math.min(oy, cy2), bh = Math.max(Math.abs(oy - cy2), 1.5);
      if (bull) {
        const gr = ctx.createLinearGradient(0, by, 0, by + bh);
        gr.addColorStop(0, "rgba(0,180,255,.95)"); gr.addColorStop(1, "rgba(0,100,200,.55)");
        ctx.fillStyle = gr;
      } else { ctx.fillStyle = "rgba(220,60,60,.75)"; }
      ctx.fillRect(x, by, cw, bh);
      ctx.strokeStyle = bull ? "rgba(0,170,255,.6)" : "rgba(220,60,60,.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + cw / 2, cH * (mx - d.h) / rng);
      ctx.lineTo(x + cw / 2, cH * (mx - d.l) / rng);
      ctx.stroke();
    });

    const ld = data[data.length - 1];
    const lx = 10 + (data.length - 1) * (W - 20) / data.length;
    const ly = cH * (mx - ld.c) / rng;
    const gg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 50);
    gg.addColorStop(0, "rgba(0,170,255,.2)"); gg.addColorStop(1, "transparent");
    ctx.fillStyle = gg; ctx.fillRect(lx - 50, ly - 50, 100, 100);
    ctx.strokeStyle = "rgba(0,150,255,.4)"; ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(0,170,255,.5)"; ctx.font = "9px DM Mono,monospace";
    for (let i = 0; i <= 4; i++) {
      const p = mn + (mx - mn) * i / 4;
      ctx.fillText(p < 0.001 ? p.toExponential(3) : p.toFixed(6), 3, cH * (mx - p) / rng + 4);
    }
  }, []);

  const fetchPrice = useCallback(async () => {
    try {
      const res  = await fetch(PRICE_URL, { cache: "no-store" });
      const json = await res.json();
      const rawPrice: number =
        json?.data?.price     ??
        json?.data?.price_usd ??
        json?.price           ??
        0;
      if (rawPrice > 0) {
        setPrice(rawPrice < 0.001 ? rawPrice.toExponential(4) : rawPrice.toFixed(6));
        (Object.keys(allData.current) as TF[]).forEach(t => {
          const d = allData.current[t];
          const last = d[d.length - 1];
          last.c = rawPrice;
          last.h = Math.max(last.h, rawPrice);
          last.l = Math.min(last.l, rawPrice);
          last.vol += Math.random() * 5;
          const prev = d[d.length - 2];
          if (prev) {
            const chg = ((rawPrice - prev.c) / prev.c * 100).toFixed(2);
            setChange((Number(chg) >= 0 ? "+" : "") + chg + "% · PUMP/XNT");
            setChangePos(Number(chg) >= 0);
          }
        });
        draw();
      }
    } catch {
      // API unavailable — keep simulating
    }
  }, [draw]);

  const fetchPool = useCallback(async () => {
    try {
      const res  = await fetch(POOL_URL, { cache: "no-store" });
      const json = await res.json();
      const addr = json?.data?.pool_address ?? json?.data?.address ?? null;
      if (addr) setPoolAddr(addr);
      const vol = json?.data?.volume_24h ?? json?.data?.volume ?? 0;
      if (vol) setLiveVol(vol);
    } catch { /* silent */ }
  }, []);

  // Seed with live price on mount
  useEffect(() => {
    fetchPool();
    (async () => {
      try {
        const res  = await fetch(PRICE_URL, { cache: "no-store" });
        const json = await res.json();
        const rawPrice: number = json?.data?.price ?? json?.data?.price_usd ?? json?.price ?? 0;
        if (rawPrice > 0) {
          (["1m","5m","1h","1d"] as TF[]).forEach(t => {
            allData.current[t] = genHistory(60, rawPrice);
          });
          setPrice(rawPrice < 0.001 ? rawPrice.toExponential(4) : rawPrice.toFixed(6));
        }
      } catch { /* silent */ }
      draw();
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    draw();
    const poll = setInterval(fetchPrice, 15_000);
    const sim  = setInterval(() => {
      (Object.keys(allData.current) as TF[]).forEach(t => {
        const d = allData.current[t];
        const l = d[d.length - 1];
        const v = (Math.random() - .48) * .012;
        const nc = Math.max(l.c * (1 + v), 0.000001);
        l.c = nc; l.h = Math.max(l.h, nc); l.l = Math.min(l.l, nc); l.vol += Math.random() * 5;
      });
      draw();
    }, 1200);
    window.addEventListener("resize", draw);
    return () => { clearInterval(poll); clearInterval(sim); window.removeEventListener("resize", draw); };
  }, [tf, fetchPrice, draw]);

  const tfs: TF[] = ["1m", "5m", "1h", "1d"];

  return (
    <div style={{ background:"var(--card)", border:"1px solid var(--border)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,var(--blue),transparent)" }} />
      <div style={{ padding:"18px 22px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"1.6rem", color:"#fff", display:"flex", alignItems:"center", gap:10 }}>
            {price}
            <span style={{ fontSize:".75rem", padding:"3px 10px",
              background: changePos ? "rgba(0,170,255,.1)" : "rgba(255,60,60,.12)",
              color: changePos ? "var(--blue)" : "#ff4444",
              fontFamily:"var(--font-mono)", letterSpacing:".05em" }}>
              {change}
            </span>
          </div>
          <div style={{ fontSize:".65rem", color:"var(--text-dim)", marginTop:4, fontFamily:"var(--font-mono)", display:"flex", gap:16 }}>
            <span>{PUMP_CA.slice(0,6)}...{PUMP_CA.slice(-4)}</span>
            {liveVol > 0 && <span>VOL {liveVol.toLocaleString()}</span>}
            {poolAddr && <span style={{ color:"var(--blue)" }}>Pool: {poolAddr.slice(0, 8)}…</span>}
          </div>
        </div>
        <div style={{ display:"flex", gap:3 }}>
          {tfs.map(t => (
            <button key={t}
              className={`tf-btn${tf === t ? " active" : ""}`}
              onClick={() => { setTf(t); setTimeout(draw, 0); }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div ref={boxRef} style={{ height:340, padding:6 }}>
        <canvas ref={ref} style={{ width:"100%", height:"100%", display:"block" }} />
      </div>
      <div style={{ padding:"8px 22px 12px", borderTop:"1px solid rgba(0,170,255,.06)", display:"flex", gap:24 }}>
        {[["SRC","api.xdex.xyz"],["NET","X1 Mainnet"],["POLL","15s"]].map(([k,v])=>(
          <div key={k} style={{ fontFamily:"var(--font-mono)", fontSize:".62rem", color:"var(--text-dim)" }}>
            <span style={{ color:"rgba(0,170,255,.4)" }}>{k}</span> {v}
          </div>
        ))}
      </div>
    </div>
  );
}
