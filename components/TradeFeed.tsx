"use client";
import { useEffect, useState } from "react";

const PUMP_CA    = "Pumps1XfLYk4DttvL4ai9WsKtqPvoT5DE3AsijSzb2C";
const XNT_CA     = "XNMbEwZFFBKQhqyW3taa8cAUp1xBUHfyzRFJQvZET4m";
const X1_RPC     = "https://rpc.mainnet.x1.xyz/";
const TOTAL_SUP  = 18_446_744_073;
const LEGACY_PRG = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const T2022_PRG  = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const EXPLORER   = "https://explorer.mainnet.x1.xyz";

interface Trade {
  time:  number;
  xnt:   number;
  tok:   number;
  price: number;
  side:  "BUY" | "SELL";
  maker: string;
  sig:   string;
}
interface Holder { wallet: string; balance: number; }

async function rpc(method: string, params: unknown[]): Promise<any> {
  const res = await fetch(X1_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  return (await res.json()).result;
}

function getUiAmount(entry: any): number {
  if (!entry?.uiTokenAmount) return 0;
  if (entry.uiTokenAmount.uiAmount != null) return entry.uiTokenAmount.uiAmount;
  return parseFloat(entry.uiTokenAmount.amount || "0") / Math.pow(10, entry.uiTokenAmount.decimals ?? 9);
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
    if (Math.abs(xntChange) < 0.000001) {
      const preB = tx.meta?.preBalances || [], postB = tx.meta?.postBalances || [];
      let maxSol = 0;
      for (let i = 0; i < Math.min(preB.length, postB.length); i++) {
        const d = (postB[i] - preB[i]) / 1e9;
        if (Math.abs(d) > Math.abs(maxSol)) maxSol = d;
      }
      xntChange = maxSol;
    }
    if (Math.abs(xntChange) < 0.000001 || Math.abs(tokChange) < 0.000001 || Math.abs(tokChange) < 0.01) return null;
    const price = Math.abs(xntChange / tokChange);
    if (!price || !isFinite(price)) return null;
    return {
      time:  tx.blockTime,
      xnt:   Math.abs(xntChange),
      tok:   Math.abs(tokChange),
      price,
      side:  xntChange < 0 ? "SELL" : "BUY",
      maker: tx.transaction?.message?.accountKeys?.[0]?.pubkey ?? tx.transaction?.message?.accountKeys?.[0] ?? "",
      sig,
    };
  } catch { return null; }
}

async function loadTrades(): Promise<Trade[]> {
  const CACHE = "pump_feed_v2", now = Date.now();
  try {
    const c = JSON.parse(localStorage.getItem(CACHE) || "null");
    if (c && now - c.ts < 5 * 60 * 1000) return c.trades;
  } catch {}
  const sigs: any[] = await rpc("getSignaturesForAddress", [PUMP_CA, { limit: 500 }]) || [];
  const trades: Trade[] = [];
  for (let i = 0; i < sigs.length; i += 20) {
    const batch = sigs.slice(i, i + 20);
    try {
      const res = await fetch(X1_RPC, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch.map((s: any, j: number) => ({
          jsonrpc: "2.0", id: j, method: "getTransaction",
          params: [s.signature, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }],
        }))),
      });
      const results = await res.json();
      if (!Array.isArray(results)) continue;
      for (let k = 0; k < results.length; k++) {
        const t = parseTrade(results[k]?.result, batch[k].signature);
        if (t) trades.push(t);
      }
    } catch { continue; }
  }
  trades.sort((a, b) => a.time - b.time);
  try { localStorage.setItem(CACHE, JSON.stringify({ trades, ts: now })); } catch {}
  return trades;
}

async function loadHolders(): Promise<Holder[]> {
  const [leg, t22] = await Promise.all([
    rpc("getProgramAccounts", [LEGACY_PRG, { encoding: "jsonParsed",
      filters: [{ dataSize: 165 }, { memcmp: { offset: 0, bytes: PUMP_CA } }] }]).catch(() => []),
    rpc("getProgramAccounts", [T2022_PRG, { encoding: "jsonParsed",
      filters: [{ memcmp: { offset: 0, bytes: PUMP_CA } }] }]).catch(() => []),
  ]);
  return [...(leg || []), ...(t22 || [])]
    .map((a: any) => ({
      wallet:  a.account?.data?.parsed?.info?.owner || a.pubkey,
      balance: a.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0,
    }))
    .filter((h: Holder) => h.balance > 0)
    .sort((a: Holder, b: Holder) => b.balance - a.balance)
    .slice(0, 50);
}

const trunc   = (w: string) => w ? `${w.slice(0, 4)}...${w.slice(-4)}` : "";
const fmtTime = (ts: number) => new Date(ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function TradeFeed() {
  const [tab,       setTab]       = useState<"transactions" | "holders">("transactions");
  const [trades,    setTrades]    = useState<Trade[]>([]);
  const [holders,   setHolders]   = useState<Holder[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [hlLoading, setHlLoading] = useState(true);

  useEffect(() => {
    loadTrades().then(t  => { setTrades([...t].reverse().slice(0, 30)); setTxLoading(false); });
    loadHolders().then(h => { setHolders(h); setHlLoading(false); });
  }, []);

  const tabStyle = (active: boolean) => ({
    padding: "12px 24px", background: "none", border: "none",
    cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: ".75rem",
    letterSpacing: ".15em", textTransform: "uppercase" as const,
    color: active ? "var(--blue)" : "rgba(160,210,255,0.4)",
    borderBottom: active ? "2px solid var(--blue)" : "2px solid transparent",
    transition: "all 0.2s",
  });

  const txRowStyle = (buy: boolean) => ({
    display: "grid", gridTemplateColumns: "80px 60px 1fr 1fr 1fr 80px",
    padding: "8px 16px",
    fontSize: ".72rem", fontFamily: "var(--font-mono)",
    borderBottom: "1px solid rgba(0,0,0,0.3)",
    borderLeft: `2px solid ${buy ? "var(--blue)" : "#ff4455"}`,
    textDecoration: "none" as const, color: "inherit",
    transition: "background 0.15s", cursor: "pointer",
  });

  const headerRow = (cols: string) => ({
    display: "grid", gridTemplateColumns: cols,
    padding: "8px 16px",
    fontSize: ".62rem", letterSpacing: ".15em", textTransform: "uppercase" as const,
    color: "rgba(160,210,255,0.35)",
    borderBottom: "1px solid rgba(0,170,255,0.06)",
  });

  const emptyStyle = {
    padding: "28px 16px", textAlign: "center" as const,
    color: "rgba(0,170,255,0.3)", fontFamily: "var(--font-mono)",
    fontSize: ".72rem", letterSpacing: ".1em",
  };

  return (
    <div style={{
      background: "rgba(4,12,22,0.85)",
      border: "1px solid rgba(0,170,255,0.15)",
      margin: "20px 0",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg,transparent,var(--blue),transparent)" }} />

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(0,170,255,0.1)" }}>
        <button style={tabStyle(tab === "transactions")} onClick={() => setTab("transactions")}>
          Transactions
        </button>
        <button style={tabStyle(tab === "holders")} onClick={() => setTab("holders")}>
          Holders
        </button>
        <div style={{ marginLeft: "auto", padding: "12px 16px",
          fontFamily: "var(--font-mono)", fontSize: ".62rem", color: "rgba(0,170,255,0.3)",
          display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--blue)",
            animation: "blinkD 1.4s step-end infinite" }} />
          X1 RPC LIVE
        </div>
      </div>

      {/* Transactions */}
      {tab === "transactions" && (
        <>
          <div style={headerRow("80px 60px 1fr 1fr 1fr 80px")}>
            <div>TIME</div><div>TYPE</div><div>XNT</div>
            <div>PUMP</div><div>PRICE</div><div>MAKER</div>
          </div>
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {txLoading && <div style={emptyStyle}>⟳ Loading transactions from X1 RPC...</div>}
            {!txLoading && trades.length === 0 && <div style={emptyStyle}>No trades found for this token yet</div>}
            {trades.map((tx, i) => (
              <a
                key={i}
                href={`${EXPLORER}/tx/${tx.sig}`}
                target="_blank"
                rel="noopener noreferrer"
                style={txRowStyle(tx.side === "BUY")}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,170,255,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: "rgba(160,210,255,0.4)" }}>{fmtTime(tx.time)}</span>
                <span style={{ color: tx.side === "BUY" ? "var(--blue)" : "#ff4455", fontWeight: 700 }}>
                  {tx.side}
                </span>
                <span style={{ color: "rgba(220,240,255,0.8)" }}>{tx.xnt.toFixed(4)}</span>
                <span style={{ color: "rgba(220,240,255,0.8)" }}>{tx.tok.toFixed(0)}</span>
                <span style={{ color: "var(--cyan)" }}>{tx.price.toFixed(8)}</span>
                <span style={{ color: "rgba(160,210,255,0.4)" }}>{trunc(tx.maker)}</span>
              </a>
            ))}
          </div>
        </>
      )}

      {/* Holders */}
      {tab === "holders" && (
        <>
          <div style={headerRow("50px 1fr 1fr 80px")}>
            <div>RANK</div><div>WALLET</div><div>BALANCE</div><div>SHARE</div>
          </div>
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {hlLoading && <div style={emptyStyle}>⟳ Loading holders from X1 RPC...</div>}
            {!hlLoading && holders.length === 0 && <div style={emptyStyle}>No holder data found</div>}
            {holders.map((h, i) => (
              <a
                key={i}
                href={`${EXPLORER}/address/${h.wallet}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "grid", gridTemplateColumns: "50px 1fr 1fr 80px",
                  padding: "8px 16px",
                  fontSize: ".72rem", fontFamily: "var(--font-mono)",
                  borderBottom: "1px solid rgba(0,0,0,0.3)",
                  textDecoration: "none", color: "inherit",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,170,255,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: "rgba(160,210,255,0.4)" }}>#{i + 1}</span>
                <span style={{ color: "var(--cyan)" }}>{trunc(h.wallet)}</span>
                <span style={{ color: "rgba(220,240,255,0.85)" }}>
                  {Number(h.balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span style={{ color: "var(--blue)" }}>
                  {((h.balance / TOTAL_SUP) * 100).toFixed(4)}%
                </span>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
