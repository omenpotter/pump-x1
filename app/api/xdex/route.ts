import { NextResponse } from "next/server";
import { TOKEN } from "@/lib/constants";
import { getQuoteUrl, parsePumpQuote, QUOTE_LAST_KNOWN_MS, XNT_MINT } from "@/lib/xdex-quote";

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, {
    status, headers: { "Cache-Control": "no-store", ...(status >= 500 ? { "Retry-After": "5" } : {}) },
  });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const upstream = getQuoteUrl(params, TOKEN.address, XNT_MINT);
  if (!upstream) return error("Invalid quote request", 400);
  const timeout = AbortSignal.timeout(7000);
  try {
    const response = await fetch(upstream, {
      headers: { Accept: "application/json" },
      redirect: "error",
      signal: timeout,
      cache: "no-store",
    });
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json") || !response.body) {
      return error("Quote service unavailable", 502);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0;
    let payload = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 64 * 1024) {
        await reader.cancel();
        return error("Quote response too large", 502);
      }
      payload += decoder.decode(value, { stream: true });
    }
    const quote = JSON.parse(payload + decoder.decode());
    if (quote?.success !== true || (upstream.pathname.endsWith("/prices") &&
      !parsePumpQuote(quote, TOKEN.address, Date.now(), QUOTE_LAST_KNOWN_MS))) {
      return error("Quote service returned no verified price", 502);
    }
    return NextResponse.json(quote, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=20" },
    });
  } catch {
    return timeout.aborted ? error("Quote service timed out", 504) : error("Quote service unavailable", 502);
  }
}
