"use client";

import { useEffect, useState } from "react";
import { TOKEN } from "@/lib/constants";
import { parsePumpQuote, QUOTE_MAX_AGE_MS, XNT_MINT } from "@/lib/xdex-quote";

const query = new URLSearchParams({
  path: "/api/token-price/prices",
  network: "X1 Mainnet",
  token_addresses: `${TOKEN.address},${XNT_MINT}`,
});

export default function Chart() {
  const [quote, setQuote] = useState<ReturnType<typeof parsePumpQuote>>(null);
  useEffect(() => {
    const lifecycle = new AbortController();
    let refresh: number | undefined;
    let expiry: number | undefined;
    async function poll() {
      if (lifecycle.signal.aborted) return;
      if (!document.hidden) {
        try {
          const response = await fetch(`/api/xdex/?${query}`, {
            signal: AbortSignal.any([lifecycle.signal, AbortSignal.timeout(9000)]),
          });
          const next = response.ok ? parsePumpQuote(await response.json(), TOKEN.address) : null;
          if (lifecycle.signal.aborted) return;
          window.clearTimeout(expiry);
          setQuote(next);
          if (next) {
            expiry = window.setTimeout(() => setQuote(null), next.observedAt + QUOTE_MAX_AGE_MS - Date.now());
          }
        } catch {
          if (!lifecycle.signal.aborted) setQuote(null);
        }
      }
      if (!lifecycle.signal.aborted) refresh = window.setTimeout(poll, 30_000);
    }
    void poll();
    return () => {
      lifecycle.abort();
      window.clearTimeout(refresh);
      window.clearTimeout(expiry);
    };
  }, []);

  const unavailable = <span aria-label="Unavailable">—</span>;
  return (
    <div className="market-panel market-overview" aria-labelledby="market-pair">
      <header className="market-panel__bar">
        <h3 id="market-pair">PUMP / XNT</h3>
        <span className="market-status" role="status">{quote ? (quote.delayed ? "XDEX · delayed" : "XDEX quote") : "Market data unavailable"}</span>
      </header>
      <dl className="market-metrics">
        <div><dt>Price in XNT</dt><dd>{quote ? quote.xnt.toPrecision(5) : unavailable}</dd></div>
        <div><dt>Price in USD</dt><dd>{quote ? `$${quote.usd.toPrecision(5)}` : unavailable}</dd></div>
        <div><dt>Pool quote depth</dt><dd>{quote?.quoteDepthUsd ? `$${quote.quoteDepthUsd.toFixed(2)}` : unavailable}</dd></div>
        <div><dt>24h volume</dt><dd>{unavailable}</dd></div>
      </dl>
      <div className="market-chart-empty">
        <div>
          <p>24-hour metrics require a complete trading window.</p>
          {quote && <p><a href={`https://explorer.mainnet.x1.xyz/address/${quote.pool}`} target="_blank" rel="noopener noreferrer">XDEX selected pool ↗</a>
            {" · "}<time dateTime={new Date(quote.observedAt).toISOString()}>{new Date(quote.observedAt).toISOString().slice(0, 19).replace("T", " ")} UTC</time>
          </p>}
        </div>
      </div>
    </div>
  );
}
