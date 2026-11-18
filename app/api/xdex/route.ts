import { NextResponse } from "next/server";
import { TOKEN } from "@/lib/constants";
import { getQuoteUrl, XNT_MINT } from "@/lib/xdex-quote";

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const upstream = getQuoteUrl(params, TOKEN.address, XNT_MINT);
  if (!upstream) return error("Invalid quote request", 400);
  try {
    const response = await fetch(upstream, {
      headers: { Accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 30 },
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
    return NextResponse.json(JSON.parse(payload + decoder.decode()), {
      headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=30" },
    });
  } catch {
    return error("Quote service unavailable", 502);
  }
}
