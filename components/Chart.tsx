"use client";

import { useEffect, useState } from "react";
import { TOKEN } from "@/lib/constants";
import { formatTokenPrice } from "@/lib/market-format";
import { parsePumpQuote, QUOTE_LAST_KNOWN_MS, QUOTE_MAX_AGE_MS, XNT_MINT } from "@/lib/xdex-quote";

const query = new URLSearchParams({
  path: "/api/token-price/prices",
  network: "X1 Mainnet",
  token_addresses: `${TOKEN.address},${XNT_MINT}`,
});
const storageKey = "pump-xdex-verified-quote-v1";

export default function Chart() {
  const [state, setState] = useState<{
    quote: NonNullable<ReturnType<typeof parsePumpQuote>>;
    fallback: boolean;
  } | null>(null);
  useEffect(() => {
    const lifecycle = new AbortController();
    let refresh: number | undefined;
    let transition: number | undefined;
    let expires: number | undefined;
    let retry = 0;
    let inFlight = false;
    let retained: ReturnType<typeof parsePumpQuote> = null;

    function show(fallback: boolean) {
      window.clearTimeout(transition);
      window.clearTimeout(expires);
      const retainedQuote = retained;
      const age = retainedQuote ? Date.now() - retainedQuote.observedAt : Infinity;
      if (!retainedQuote || age >= QUOTE_LAST_KNOWN_MS) {
        setState(null);
        return;
      }
      setState({ quote: retainedQuote, fallback: fallback || age >= QUOTE_MAX_AGE_MS });
      if (!fallback && age < QUOTE_MAX_AGE_MS) {
        transition = window.setTimeout(() => show(true), QUOTE_MAX_AGE_MS - age);
      }
      expires = window.setTimeout(() => show(true), QUOTE_LAST_KNOWN_MS - age);
    }

    async function poll() {
      if (lifecycle.signal.aborted || inFlight) return;
      if (!document.hidden) {
        inFlight = true;
        try {
          const response = await fetch(`/api/xdex/?${query}`, {
            signal: AbortSignal.any([lifecycle.signal, AbortSignal.timeout(10000)]),
          });
          const payload = response.ok ? await response.json() : null;
          const next = parsePumpQuote(payload, TOKEN.address, Date.now(), QUOTE_LAST_KNOWN_MS);
          if (lifecycle.signal.aborted) return;
          if (!next || (retained && next.observedAt < retained.observedAt)) throw new Error("Quote unavailable");
          retained = next;
          try {
            localStorage.setItem(storageKey, JSON.stringify(payload));
          } catch { /* Storage is optional. */ }
          retry = 0;
          show(false);
        } catch {
          if (!lifecycle.signal.aborted) {
            retry++;
            show(true);
          }
        } finally {
          inFlight = false;
        }
      }
      if (!lifecycle.signal.aborted) refresh = window.setTimeout(poll, retry ? Math.min(60_000, 5_000 * 2 ** Math.min(retry - 1, 4)) : 30_000);
    }
    function resume() {
      if (document.hidden) return;
      if (retained && Date.now() - retained.observedAt >= QUOTE_MAX_AGE_MS) show(true);
      if (inFlight) return;
      window.clearTimeout(refresh);
      void poll();
    }
    const initialize = window.setTimeout(() => {
      try {
        retained = parsePumpQuote(JSON.parse(localStorage.getItem(storageKey) ?? "null"), TOKEN.address, Date.now(), QUOTE_LAST_KNOWN_MS);
      } catch { /* Storage is optional. */ }
      if (retained) show(true);
      void poll();
    }, 0);
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    return () => {
      lifecycle.abort();
      window.clearTimeout(initialize);
      window.clearTimeout(refresh);
      window.clearTimeout(transition);
      window.clearTimeout(expires);
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("online", resume);
    };
  }, []);

  const quote = state?.quote;
  const unavailable = <span aria-label="Unavailable">—</span>;
  return (
    <div className="market-panel market-overview" aria-labelledby="market-pair">
      <header className="market-panel__bar">
        <h3 id="market-pair">PUMP / XNT</h3>
        <span className="market-status" role="status">{state?.fallback ? "Last verified quote · delayed" : quote ? (quote.delayed ? "XDEX · delayed" : "XDEX quote") : "Market data unavailable"}</span>
      </header>
      <dl className="market-metrics">
        <div><dt>Price in XNT</dt><dd>{quote ? formatTokenPrice(quote.xnt) : unavailable}</dd></div>
        <div><dt>Price in USD</dt><dd>{quote ? `$${formatTokenPrice(quote.usd)}` : unavailable}</dd></div>
        <div><dt>Pool quote depth</dt><dd>{quote?.quoteDepthUsd ? `$${quote.quoteDepthUsd.toFixed(2)}` : unavailable}</dd></div>
        <div><dt>24h volume</dt><dd>{unavailable}</dd></div>
      </dl>
      <div className="market-quote-note">
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
