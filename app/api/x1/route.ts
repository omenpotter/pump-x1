import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { TOKEN } from "@/lib/constants";
import { parseActivity, parseHolders, parseMint, readX1, TOKEN_2022 } from "@/lib/chain-data";
import { decodePool, summarizePoolSample } from "@/lib/pool-sample";
import { poolMarket } from "@/lib/pool-market";
import capturedPool from "@/docs/upgrade/evidence/x1-xdex-pool.json";

const finalized = { commitment: "finalized" };
const address = TOKEN.address;
const pinnedPool = decodePool(capturedPool);
const kinds = ["mint", "activity", "holders", "pool"] as const;
type Kind = typeof kinds[number];

async function loadPool() {
  if (!pinnedPool) throw new Error("Unverified pool");
  const timeout = AbortSignal.timeout(8500);
  const [account, signatures] = await Promise.all([
    readX1("getAccountInfo", [pinnedPool.address, { ...finalized, encoding: "base64" }], timeout),
    readX1("getSignaturesForAddress", [pinnedPool.address, { ...finalized, limit: 25 }], timeout),
  ]);
  const decoded = decodePool({ result: account });
  if (!decoded || JSON.stringify(decoded) !== JSON.stringify(pinnedPool)) throw new Error("Pool changed");
  const candidates = parseActivity(signatures).slice(0, 12);
  const results = await Promise.allSettled(candidates.map(({ signature }) => readX1("getTransaction", [
    signature, { ...finalized, encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
  ], timeout)));
  const sample = summarizePoolSample({ result: account }, { result: signatures },
    results.flatMap(result => result.status === "fulfilled" ? [{ result: result.value }] : []));
  if (!sample?.trades.length) throw new Error("No verified trades");
  return { ...poolMarket(sample), checkedAt: Date.now() };
}

const cachedPool = unstable_cache(loadPool, ["pump-verified-pool-v1"], { revalidate: 45 });

async function load(kind: Kind) {
  const signal = AbortSignal.timeout(8500);
  if (kind === "pool") return cachedPool();
  if (kind === "mint") {
    const result = await readX1("getAccountInfo", [address, { ...finalized, encoding: "jsonParsed" }], signal);
    parseMint(result, address);
    return result;
  }
  if (kind === "activity") {
    const result = await readX1("getSignaturesForAddress", [address, { ...finalized, limit: 25 }], signal);
    parseActivity(result);
    return result;
  }
  const result = await readX1("getProgramAccounts", [TOKEN_2022, {
    ...finalized, encoding: "jsonParsed", withContext: true, filters: [{ memcmp: { offset: 0, bytes: address } }],
  }], signal);
  return parseHolders(result, address, TOKEN.decimals);
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const kind = params.get("kind");
  if (Array.from(params.keys()).length !== 1 || !kinds.some(value => value === kind)) {
    return NextResponse.json({ error: "Invalid X1 request" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  try {
    return NextResponse.json(await load(kind as Kind), {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=20" },
    });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return NextResponse.json({ error: "X1 data unavailable" }, {
      status: timedOut ? 504 : 502, headers: { "Cache-Control": "no-store", "Retry-After": "10" },
    });
  }
}
