import { NextRequest, NextResponse } from "next/server";

const XDEX_BASE = "https://api.xdex.xyz";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";
  // Rebuild query string without the `path` param
  const forward = new URLSearchParams();
  searchParams.forEach((v, k) => { if (k !== "path") forward.append(k, v); });
  const qs = forward.toString();
  const url = `${XDEX_BASE}${path}${qs ? "?" + qs : ""}`;

  try {
    const res  = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 10 },
    });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
