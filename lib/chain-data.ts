export const X1_RPC = "https://rpc.mainnet.x1.xyz/";
export const TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const addressPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const signaturePattern = /^[1-9A-HJ-NP-Za-km-z]{64,88}$/;

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid X1 response");
  return value as Record<string, unknown>;
}

function rawAmount(value: unknown): bigint {
  if (typeof value !== "string" || !/^\d{1,20}$/.test(value)) throw new Error("Invalid token amount");
  const amount = BigInt(value);
  if (amount > BigInt("18446744073709551615")) throw new Error("Invalid token amount");
  return amount;
}

export function formatUnits(amount: bigint, decimals: number): string {
  const digits = amount.toString().padStart(decimals + 1, "0");
  if (!decimals) return digits;
  const remainder = digits.slice(-decimals).replace(/0+$/, "");
  return remainder ? `${digits.slice(0, -decimals)}.${remainder}` : digits.slice(0, -decimals);
}

export function parseMint(value: unknown, mint: string) {
  const snapshot = record(value);
  const account = record(snapshot.value);
  const data = record(account.data);
  const parsed = record(data.parsed);
  const mintInfo = record(parsed.info);
  const slot = record(snapshot.context).slot;
  const decimals = mintInfo.decimals;
  if (!addressPattern.test(mint) || account.owner !== TOKEN_2022 || parsed.type !== "mint" ||
      typeof slot !== "number" || !Number.isSafeInteger(slot) || slot < 1 ||
      typeof decimals !== "number" || !Number.isInteger(decimals) || decimals < 0 || decimals > 255) {
    throw new Error("Unexpected mint account");
  }
  return { slot, decimals, supply: formatUnits(rawAmount(mintInfo.supply), decimals) };
}

export function parseActivity(value: unknown) {
  if (!Array.isArray(value)) throw new Error("Invalid activity response");
  const seen = new Set<string>();
  return value.flatMap(item => {
    const { signature, blockTime, err } = record(item);
    if (err !== null || typeof signature !== "string" || !signaturePattern.test(signature) || seen.has(signature)) return [];
    seen.add(signature);
    const time = typeof blockTime === "number" && Number.isSafeInteger(blockTime) && blockTime > 0 && blockTime < 10_000_000_000
      ? blockTime
      : null;
    return [{ signature, time }];
  });
}

export function parseHolders(value: unknown, mint: string, decimals: number) {
  const { value: accounts, context } = record(value);
  const slot = record(context).slot;
  if (!Array.isArray(accounts) || typeof slot !== "number" || !Number.isSafeInteger(slot) || slot < 1) {
    throw new Error("Invalid token-account snapshot");
  }
  const owners = new Map<string, bigint>();
  const seen = new Set<string>();
  for (const item of accounts) {
    const { pubkey, account: rawAccount } = record(item);
    const account = record(rawAccount);
    const parsed = record(record(account.data).parsed);
    const info = record(parsed.info);
    const amount = record(info.tokenAmount);
    if (typeof pubkey !== "string" || !addressPattern.test(pubkey) || seen.has(pubkey) ||
        account.owner !== TOKEN_2022 || parsed.type !== "account" || info.mint !== mint ||
        typeof info.owner !== "string" || !addressPattern.test(info.owner) || amount.decimals !== decimals) {
      throw new Error("Unexpected token-account record");
    }
    seen.add(pubkey);
    const balance = rawAmount(amount.amount);
    if (balance > BigInt(0)) owners.set(info.owner, (owners.get(info.owner) ?? BigInt(0)) + balance);
  }
  const top = [...owners].sort((a, b) => a[1] === b[1] ? a[0].localeCompare(b[0]) : a[1] > b[1] ? -1 : 1).slice(0, 50);
  return { slot, count: owners.size, top: top.map(([wallet, amount]) => ({ wallet, balance: formatUnits(amount, decimals) })) };
}

export async function readX1(
  method: "getAccountInfo" | "getSignaturesForAddress" | "getProgramAccounts",
  params: unknown[],
  signal: AbortSignal,
) {
  const response = await fetch(X1_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    redirect: "error",
    signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]),
  });
  if (!response.ok) throw new Error("X1 RPC unavailable");
  const payload = record(await response.json());
  if (payload.id !== 1 || payload.error || !("result" in payload)) throw new Error("X1 RPC unavailable");
  return payload.result;
}
