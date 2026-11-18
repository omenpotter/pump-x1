export function getQuoteUrl(params: URLSearchParams, pump: string, xnt: string): URL | null {
  const path = params.get("path");
  const expected = new URLSearchParams({ network: "X1 Mainnet" });
  switch (path) {
    case "/api/token-price/price":
      expected.set("address", pump);
      break;
    case "/api/token-price/prices":
      expected.set("token_addresses", `${pump},${xnt}`);
      break;
    default:
      return null;
  }
  if (Array.from(params.keys()).length !== 3 || params.getAll("path").length !== 1) return null;
  for (const [key, value] of expected) {
    if (params.getAll(key).length !== 1 || params.get(key) !== value) return null;
  }
  const upstream = new URL(path, "https://api.xdex.xyz");
  upstream.search = expected.toString();
  return upstream;
}
export const XNT_MINT = "XNMbEwZFFBKQhqyW3taa8cAUp1xBUHfyzRFJQvZET4m";
export const QUOTE_MAX_AGE_MS = 120_000;

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
}

function positive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function parsePumpQuote(payload: unknown, mint: string, now = Date.now()) {
  const envelope = asRecord(payload);
  if (envelope?.success !== true || !Array.isArray(envelope.data)) return null;
  const matches = envelope.data.map(asRecord).filter(row => row?.token_address === mint);
  const quote = matches[0];
  if (matches.length !== 1 || !quote || quote.network !== "X1 Mainnet" ||
      quote.status !== "ok" || quote.eligible !== true || quote.price_currency !== "USD" ||
      quote.quote_is_xnt !== true || !positive(quote.xnt_usd_price) ||
      typeof quote.price_raw !== "string" || !/^\d{1,20}$/.test(quote.price_raw) ||
      quote.price_scale !== "1000000000000000" ||
      typeof quote.selected_pool !== "string" || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(quote.selected_pool) ||
      !positive(quote.observedTimestamp) || !Number.isSafeInteger(quote.observedTimestamp) ||
      quote.observedTimestamp > now + 5_000 || now - quote.observedTimestamp > QUOTE_MAX_AGE_MS ||
      !Array.isArray(quote.candidates)) return null;

  const pool = quote.candidates.map(asRecord).find(candidate => candidate?.pool === quote.selected_pool);
  if (!pool || pool.quote !== "XNT" || pool.quote_is_xnt !== true || pool.price_raw !== quote.price_raw) return null;
  const usd = Number(quote.price_raw) / Number(quote.price_scale);
  const xnt = usd / quote.xnt_usd_price;
  if (!positive(usd) || !positive(xnt)) return null;
  return {
    usd,
    xnt,
    quoteDepthUsd: positive(pool.usd_depth) ? pool.usd_depth : null,
    pool: quote.selected_pool,
    observedAt: quote.observedTimestamp,
    delayed: quote.freshness !== "fresh" || quote.targetMet === false,
  };
}
