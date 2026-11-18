"use client";

import { useEffect, useState } from "react";
import HistoricalCandles from "@/components/HistoricalCandles";
import { formatTokenPrice } from "@/lib/market-format";
import { refreshVisible } from "@/lib/market-refresh";
import type { PoolMarket } from "@/lib/pool-market";

const utc = (time: number) => new Date(time * 1000).toISOString().slice(0, 19).replace("T", " ") + " UTC";
type Recent = PoolMarket & { checkedAt: number };

export default function PoolHistory({ captured }: { captured: PoolMarket }) {
  const [recent, setRecent] = useState<Recent | null>(null);
  const [delayed, setDelayed] = useState(false);
  useEffect(() => refreshVisible(async signal => {
    const response = await fetch("/api/x1/?kind=pool", {
      signal: AbortSignal.any([signal, AbortSignal.timeout(22000)]),
    });
    if (!response.ok) throw new Error("Recent pool activity unavailable");
    const update: Recent = await response.json();
    if (!update.trades.length || !Number.isSafeInteger(update.checkedAt) ||
      update.checkedAt > Date.now() + 5000 || Date.now() - update.checkedAt > 120_000) {
      throw new Error("Recent pool check is stale");
    }
    if (!signal.aborted) {
      setRecent(previous => !previous || update.checkedAt >= previous.checkedAt ? update : previous);
      setDelayed(false);
    }
  }, () => setDelayed(true), 60_000), []);
  const data = recent ?? captured;
  const { trades } = data;
  return (
    <section className="market-panel pool-sample" aria-labelledby="pool-sample-title">
      <header className="market-panel__bar">
        <h3 id="pool-sample-title">Verified pool activity</h3>
        <span className="market-status">{recent ? (delayed ? "X1 RPC · refresh delayed" : "Recent finalized sample") : "Historical sample"}</span>
      </header>
      <div className="market-panel__body">
        <p>{trades.length} verified swaps · <strong>{data.volume} XNT</strong> sample volume</p>
        <p>{utc(trades[trades.length - 1].time)} to {utc(trades[0].time)}. {recent ? "Only verified swaps from the recent RPC window are included." : "Only captured swaps are included."}</p>
        {recent && <p>Last verified check · {utc(Math.floor(recent.checkedAt / 1000))}</p>}
        <HistoricalCandles key={recent ? "recent" : "capture"} series={data.series} />
        <div className="pool-table" tabIndex={0} role="region" aria-label="Verified pool swaps">
          <table>
            <thead><tr><th scope="col">Transaction</th><th scope="col">Side</th><th scope="col">PUMP</th><th scope="col">XNT</th><th scope="col">XNT per PUMP</th><th scope="col">Time</th></tr></thead>
            <tbody>{trades.map(trade => <tr key={trade.signature}>
              <th scope="row"><a href={`https://explorer.mainnet.x1.xyz/tx/${trade.signature}`} target="_blank" rel="noopener noreferrer">{trade.signature.slice(0, 8)}… ↗</a></th>
              <td>{trade.side}</td><td>{trade.pump}</td><td>{trade.xnt}</td>
              <td>{formatTokenPrice(trade.price)}</td><td>{utc(trade.time)}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
