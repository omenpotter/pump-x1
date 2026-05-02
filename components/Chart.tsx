"use client";
import { useEffect, useRef, useState, useCallback } from "react";

// ── Constants ──────────────────────────────────────────────────────────────
const PUMP_CA  = "Pumps1XfLYk4DttvL4ai9WsKtqPvoT5DE3AsijSzb2C";
const XNT_CA   = "XNMbEwZFFBKQhqyW3taa8cAUp1xBUHfyzRFJQvZET4m";
const X1_RPC   = "https://rpc.mainnet.x1.xyz/";
const XDEX_API = "https://api.xdex.xyz";
const NETWORK  = "X1%20Mainnet";

type TF = 1 | 5 | 15 | 60 | 240 | 1440;
type Trade = { time: number; xnt: number; tok: number; price: number; side: "BUY" | "SELL"; sig: string };
type OHLCV = { o: number; h: number; l: number; c: number; v: number; active: boolean };

// ── X1 RPC helper ──────────────────────────────────────────────────────────
async function rpc(method: string, params: unknown[]): Promise<any> {
  const res = await fetch(X1_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  return (await res.json()).result;
}

// ── Parse a single transaction into a trade ────────────────────────────────
function getUiAmount(entry: any): number {
  if (!entry?.uiTokenAmount) return 0;
  if (entry.uiTokenAmount.uiAmount != null) return entry.uiTokenAmount.uiAmount;
  const decimals = entry.uiTokenAmount.decimals ?? 9;
  return parseFloat(entry.uiTokenAmount.amount || "0") / Math.pow(10, decimals);
}

function parseTrade(tx: any, sig: string): Trade | null {
  try {
    const pre  = tx.meta?.preTokenBalances  || [];
    const post = tx.meta?.postTokenBalances || [];
    let xntChange = 0, tokChange = 0;

    for (const p of post) {
      const pr = pre.find((x: any) => x.accountIndex === p.accountIndex);
      if (!pr) continue;
      const diff = getUiAmount(p) - getUiAmount(pr);
      if (p.mint === XNT_CA)  xntChange = diff;
      if (p.mint === PUMP_CA) tokChange = diff;
    }

    // Fallback: use native XNT balance delta if no wrapped-XNT token account moved
    if (Math.abs(xntChange) < 0.000001) {
      const preB  = tx.meta?.preBalances  || [];
      const postB = tx.meta?.postBalances || [];
      let maxSol = 0;
      for (let i = 0; i < Math.min(preB.length, postB.length); i++) {
        const diff = (postB[i] - preB[i]) / 1e9;
        if (Math.abs(diff) > Math.abs(maxSol)) maxSol = diff;
      }
      xntChange = maxSol;
    }

    if (Math.abs(xntChange) < 0.000001 || Math.abs(tokChange) < 0.000001) return null;
    if (Math.abs(tokChange) < 0.01) return null;

    const price = Math.abs(xntChange / tokChange);
    if (price <= 0 || !isFinite(price)) return null;

    return {
      time:  tx.blockTime,
      xnt:   Math.abs(xntChange),
      tok:   Math.abs(tokChange),
      price,
      side:  xntChange < 0 ? "SELL" : "BUY",
      sig,
    };
  } catch { return null; }
}

// ── Fetch all trades from X1 RPC ───────────────────────────────────────────
async function fetchTradesFromRpc(): Promise<Trade[]> {
  const CACHE_KEY = "pump_chart_trades_v1";
  const now = Date.now();

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (cached && now - cached.timestamp < 5 * 60 * 1000) return cached.trades;
  } catch {}

  const sigs: any[] = await rpc("getSignaturesForAddress", [PUMP_CA, { limit: 1000 }]) || [];
  if (!sigs.length) return [];

  const trades: Trade[] = [];

  for (let i = 0; i < sigs.length; i += 20) {
    const batch = sigs.slice(i, i + 20);
    const reqs  = batch.map((s: any, j: number) => ({
      jsonrpc: "2.0", id: j,
      method: "getTransaction",
      params: [s.signature, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }],
    }));
    try {
      const resp    = await fetch(X1_RPC, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reqs) });
      const results = await resp.json();
      if (!Array.isArray(results)) continue;
      for (let k = 0; k < results.length; k++) {
        const tx = results[k]?.result;
        if (!tx) continue;
        const t = parseTrade(tx, batch[k].signature);
        if (t) trades.push(t);
      }
    } catch { continue; }
  }

  trades.sort((a, b) => a.time - b.time);
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ trades, timestamp: now })); } catch {}
  return trades;
}

// ── Fetch live price from XDEX API ─────────────────────────────────────────
async function fetchXdexPrice(): Promise<number> {
  try {
    const res  = await fetch(`${XDEX_API}/api/token-price/prices?network=${NETWORK}&token_addresses=${PUMP_CA},${XNT_CA}`);
    const json = await res.json();
    const prices = json?.data || json || {};
    const extract = (entry: any) => parseFloat(entry?.price ?? entry ?? 0);
    const pPump = extract(prices[PUMP_CA]);
    const pXnt  = extract(prices[XNT_CA]);
    if (pPump > 0 && pXnt > 0) return pPump / pXnt;
  } catch {}

  try {
    const res  = await fetch(`${XDEX_API}/api/token-price/price?network=${NETWORK}&address=${PUMP_CA}`);
    const json = await res.json();
    const p = parseFloat(json?.data?.price ?? json?.price ?? 0);
    if (p > 0) return p;
  } catch {}

  return 0;
}

const TF_LABELS: Record<TF, string> = { 1:"1m", 5:"5m", 15:"15m", 60:"1h", 240:"4h", 1440:"1d" };

const fmt = (n: number) => {
  if (!n || n <= 0) return "0.000000";
  if (n >= 1)      return n.toFixed(4);
  if (n >= 0.01)   return n.toFixed(6);
  if (n >= 0.0001) return n.toFixed(8);
  return n.toFixed(10);
};

// ── Chart Component ────────────────────────────────────────────────────────
export default function Chart() {
  const iframeRef     = useRef<HTMLIFrameElement>(null);
  const chartReadyRef = useRef(false);
  const pendingRef    = useRef<any>(null);
  const tradesRef     = useRef<Trade[]>([]);

  const [tf,        setTf]        = useState<TF>(60);
  const [price,     setPrice]     = useState("—");
  const [change,    setChange]    = useState("PUMP/XNT");
  const [changePos, setChangePos] = useState(true);
  const [ohlcv,     setOhlcv]     = useState<OHLCV>({ o:0, h:0, l:0, c:0, v:0, active:false });
  const [loading,   setLoading]   = useState(true);
  const [showVol,   setShowVol]   = useState(false);

  const sendTrades = useCallback((trades: Trade[], currentTf: TF) => {
    const msg = { type: "trades", trades, tf: currentTf };
    if (chartReadyRef.current && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(msg, "*");
    } else {
      pendingRef.current = msg;
    }
  }, []);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === "chartReady") {
        chartReadyRef.current = true;
        if (pendingRef.current && iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(pendingRef.current, "*");
          pendingRef.current = null;
        }
      } else if (msg.type === "ohlcv") {
        setOhlcv({ o: msg.o, h: msg.h, l: msg.l, c: msg.cl, v: msg.v, active: true });
      } else if (msg.type === "ohlcv_clear") {
        setOhlcv(prev => ({ ...prev, active: false }));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const tfRef = useRef(tf);
  tfRef.current = tf;

  useEffect(() => {
    (async () => {
      try {
        const trades = await fetchTradesFromRpc();
        tradesRef.current = trades;
        setLoading(false);
        if (trades.length) {
          sendTrades(trades, tfRef.current);
          const latest = trades[trades.length - 1];
          if (latest?.price > 0) setPrice(fmt(latest.price));
        }
      } catch {
        setLoading(false);
      }

      const xdexPrice = await fetchXdexPrice();
      if (xdexPrice > 0) setPrice(fmt(xdexPrice));
    })();

    const priceIv = setInterval(async () => {
      const p = await fetchXdexPrice();
      if (p > 0) setPrice(fmt(p));
    }, 30_000);

    const tradesIv = setInterval(async () => {
      try {
        const trades = await fetchTradesFromRpc();
        if (trades.length) {
          tradesRef.current = trades;
          sendTrades(trades, tfRef.current);
        }
      } catch {}
    }, 60_000);

    return () => { clearInterval(priceIv); clearInterval(tradesIv); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTf = (newTf: TF) => {
    setTf(newTf);
    tfRef.current = newTf;
    if (iframeRef.current?.contentWindow && tradesRef.current.length) {
      iframeRef.current.contentWindow.postMessage({ type: "setTF", tf: newTf }, "*");
    }
  };

  const handleVol = () => {
    const next = !showVol;
    setShowVol(next);
    iframeRef.current?.contentWindow?.postMessage({ type: "setVol", vol: next }, "*");
  };

  const TFS: TF[] = [1, 5, 15, 60, 240, 1440];

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,var(--blue),transparent)" }} />

      {/* Header */}
      <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.6rem", color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
            {price}
            <span style={{
              fontSize: ".75rem", padding: "3px 10px",
              background: changePos ? "rgba(0,170,255,.1)" : "rgba(255,60,60,.12)",
              color: changePos ? "var(--blue)" : "#ff4444",
              fontFamily: "var(--font-mono)", letterSpacing: ".05em",
            }}>
              {change}
            </span>
          </div>
          <div style={{ fontSize: ".65rem", color: "var(--text-dim)", marginTop: 4, fontFamily: "var(--font-mono)", display: "flex", gap: 16 }}>
            <span>Pumps1...Szb2C</span>
            <span style={{ color: "var(--blue)" }}>· X1 RPC + XDEX</span>
            {loading && <span style={{ color: "rgba(0,170,255,.4)" }}>Loading trades...</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {TFS.map(t => (
            <button key={t} className={`tf-btn${tf === t ? " active" : ""}`} onClick={() => handleTf(t)}>
              {TF_LABELS[t]}
            </button>
          ))}
          <button className={`tf-btn${showVol ? " active" : ""}`} onClick={handleVol}>Vol</button>
        </div>
      </div>

      {/* OHLCV row */}
      <div style={{ padding: "8px 22px", borderBottom: "1px solid rgba(0,170,255,.06)", display: "flex", gap: 16, fontFamily: "var(--font-mono)", fontSize: ".65rem" }}>
        {ohlcv.active ? (
          <>
            <span style={{ color: "var(--text-dim)" }}>O <span style={{ color: "#fff" }}>{fmt(ohlcv.o)}</span></span>
            <span style={{ color: "var(--text-dim)" }}>H <span style={{ color: "var(--blue)" }}>{fmt(ohlcv.h)}</span></span>
            <span style={{ color: "var(--text-dim)" }}>L <span style={{ color: "#ff4444" }}>{fmt(ohlcv.l)}</span></span>
            <span style={{ color: "var(--text-dim)" }}>C <span style={{ color: "#fff" }}>{fmt(ohlcv.c)}</span></span>
            <span style={{ color: "var(--text-dim)" }}>Vol <span style={{ color: "#fff" }}>{Math.round(ohlcv.v).toLocaleString()}</span></span>
          </>
        ) : (
          <span style={{ color: "rgba(0,170,255,.3)" }}>Hover a candle to see OHLCV</span>
        )}
      </div>

      {/* Chart iframe */}
      <div style={{ height: 380, position: "relative" }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(0,170,255,.4)", fontFamily: "var(--font-mono)", fontSize: ".75rem", zIndex: 1, pointerEvents: "none" }}>
            Fetching trades from X1 RPC...
          </div>
        )}
        <iframe
          ref={iframeRef}
          src="/chart.html"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
        />
      </div>

      {/* Footer */}
      <div style={{ padding: "8px 22px 12px", borderTop: "1px solid rgba(0,170,255,.06)", display: "flex", gap: 20, fontFamily: "var(--font-mono)", fontSize: ".6rem", color: "var(--text-dim)" }}>
        <span><span style={{ color: "rgba(0,170,255,.4)" }}>SRC</span> X1 RPC + api.xdex.xyz</span>
        <span><span style={{ color: "rgba(0,170,255,.4)" }}>NET</span> X1 Mainnet</span>
        <span><span style={{ color: "rgba(0,170,255,.4)" }}>PRICE POLL</span> 30s</span>
      </div>
    </div>
  );
}
