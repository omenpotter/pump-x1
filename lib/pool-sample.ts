const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const poolAddress = "J9iYHaqqgBt2AM4mmri45ccBcTbfUXi9bE3sW5CsdhAj";
const program = "sEsYH97wqmfnkzHedjNcw3zyJdPvUmsa9AixhS4b4fN";
const pump = "Pumps1XfLYk4DttvL4ai9WsKtqPvoT5DE3AsijSzb2C";
const native = "So11111111111111111111111111111111111111112";
const token2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const legacyToken = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const atoms = (value: unknown) => typeof value === "string" && /^\d{1,20}$/.test(value) ? BigInt(value) : null;

function base58(value: Buffer) {
  let number = BigInt("0x" + value.toString("hex"));
  let out = "";
  while (number > BigInt(0)) {
    out = alphabet[Number(number % BigInt(58))] + out;
    number /= BigInt(58);
  }
  for (const byte of value) {
    if (byte !== 0) break;
    out = "1" + out;
  }
  return out;
}

function decodeInstruction(value: unknown) {
  if (typeof value !== "string" || value.length > 34 || value.startsWith("1")) return null;
  let number = BigInt(0);
  for (const char of value) {
    const digit = alphabet.indexOf(char);
    if (digit < 0) return null;
    number = number * BigInt(58) + BigInt(digit);
  }
  const body = Buffer.from(number.toString(16).padStart(48, "0"), "hex");
  return body.length === 24 && body.subarray(0, 8).toString("hex") === "8fbe5adac41e33de" ? body : null;
}

export function decodePool(response: unknown) {
  const result = record(record(response).result);
  const account = record(result.value);
  const data = list(account.data);
  if (account.owner !== program || account.executable !== false || data[1] !== "base64" || typeof data[0] !== "string") return null;
  const bytes = Buffer.from(data[0], "base64");
  if (bytes.length !== 637 || bytes.subarray(0, 8).toString("hex") !== "f7ede3f5d7c3de46") return null;
  const key = (index: number) => base58(bytes.subarray(8 + index * 32, 40 + index * 32));
  if (key(5) !== pump || key(6) !== native || key(7) !== token2022 || key(8) !== legacyToken ||
      bytes[331] !== 9 || bytes[332] !== 9) return null;
  return { address: poolAddress, program, config: key(0), pumpVault: key(2), xntVault: key(3), observation: key(9) };
}

type Pool = NonNullable<ReturnType<typeof decodePool>>;

function tokenBalance(items: unknown, index: number, mint: string) {
  const matches = list(items).map(record).filter(item => item.accountIndex === index && item.mint === mint);
  const amount = record(matches[0]?.uiTokenAmount);
  return matches.length === 1 && amount.decimals === 9 ? atoms(amount.amount) : null;
}

function transfer(instructions: RecordValue[], source: unknown, destination: unknown, mint: string, tokenProgram: string) {
  const matches = instructions.filter(ix => {
    const parsed = record(ix.parsed);
    const info = record(parsed.info);
    return ix.programId === tokenProgram && parsed.type === "transferChecked" &&
      info.source === source && info.destination === destination && info.mint === mint;
  });
  const amount = record(record(record(matches[0]?.parsed).info).tokenAmount);
  return matches.length === 1 && amount.decimals === 9 ? atoms(amount.amount) : null;
}

export function parsePoolSwap(response: unknown, pool: Pool, expected: RecordValue) {
  const tx = record(record(response).result);
  const meta = record(tx.meta);
  const transaction = record(tx.transaction);
  const message = record(transaction.message);
  const signature = list(transaction.signatures)[0];
  const slot = tx.slot;
  const time = tx.blockTime;
  if (meta.err !== null || expected.err !== null || signature !== expected.signature ||
      typeof signature !== "string" || !/^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(signature) ||
      typeof slot !== "number" || !Number.isSafeInteger(slot) || slot !== expected.slot ||
      typeof time !== "number" || !Number.isSafeInteger(time) || time <= 0 || time !== expected.blockTime) return null;

  const groups = list(meta.innerInstructions).map(record);
  const candidates = list(message.instructions).map((item, index) => {
    const inner = list(groups.find(group => group.index === index)?.instructions).map(record);
    return [
      { ix: record(item), children: inner.filter(ix => ix.stackHeight === 2) },
      ...inner.map((ix, position) => {
        const height = ix.stackHeight;
        if (typeof height !== "number") return { ix, children: [] };
        const descendants = inner.slice(position + 1);
        const end = descendants.findIndex(next => typeof next.stackHeight !== "number" || next.stackHeight <= height);
        return { ix, children: descendants.slice(0, end < 0 ? undefined : end).filter(child => child.stackHeight === height + 1) };
      }),
    ];
  }).flat().filter(({ ix }) => ix.programId === pool.program && list(ix.accounts).includes(pool.address));
  if (candidates.length !== 1) return null;
  const { ix, children } = candidates[0];
  const instruction = decodeInstruction(ix.data);
  const accounts = list(ix.accounts);
  if (!instruction || accounts.length !== 13 || accounts[2] !== pool.config ||
      accounts[3] !== pool.address || accounts[12] !== pool.observation) return null;

  const buy = accounts[6] === pool.xntVault && accounts[7] === pool.pumpVault;
  if (!buy && (accounts[6] !== pool.pumpVault || accounts[7] !== pool.xntVault)) return null;
  const inputMint = buy ? native : pump;
  const outputMint = buy ? pump : native;
  const inputProgram = buy ? legacyToken : token2022;
  const outputProgram = buy ? token2022 : legacyToken;
  if (accounts[8] !== inputProgram || accounts[9] !== outputProgram ||
      accounts[10] !== inputMint || accounts[11] !== outputMint) return null;
  const input = transfer(children, accounts[4], accounts[6], inputMint, inputProgram);
  const output = transfer(children, accounts[7], accounts[5], outputMint, outputProgram);
  if (input === null || output === null || input <= BigInt(0) || output <= BigInt(0) ||
      input !== instruction.readBigUInt64LE(8) || output < instruction.readBigUInt64LE(16)) return null;

  const keys = list(message.accountKeys).map(key => typeof key === "string" ? key : record(key).pubkey);
  const vaults = [[pool.pumpVault, pump], [pool.xntVault, native]];
  const before = vaults.map(([vault, mint]) => tokenBalance(meta.preTokenBalances, keys.indexOf(vault), mint));
  const after = vaults.map(([vault, mint]) => tokenBalance(meta.postTokenBalances, keys.indexOf(vault), mint));
  const [beforePump, beforeXnt] = before;
  const [afterPump, afterXnt] = after;
  if (beforePump === null || beforeXnt === null || afterPump === null || afterXnt === null) return null;
  const pumpAtoms = buy ? output : input;
  const xntAtoms = buy ? input : output;
  if (afterPump - beforePump !== (buy ? -pumpAtoms : pumpAtoms) ||
      afterXnt - beforeXnt !== (buy ? xntAtoms : -xntAtoms)) return null;
  return {
    signature, slot, time, side: buy ? "BUY" as const : "SELL" as const,
    pumpAtoms, xntAtoms, price: Number(xntAtoms) / Number(pumpAtoms),
    before: before.join(":"), after: after.join(":"),
  };
}

type VerifiedSwap = NonNullable<ReturnType<typeof parsePoolSwap>>;

export const CANDLE_TIMEFRAMES = [
  { label: "1m", seconds: 60 },
  { label: "5m", seconds: 300 },
  { label: "15m", seconds: 900 },
  { label: "1H", seconds: 3600 },
  { label: "4H", seconds: 14400 },
  { label: "1D", seconds: 86400 },
] as const;

export function buildPoolCandles(trades: VerifiedSwap[], seconds: number) {
  const from = Math.min(...trades.map(row => row.time));
  const to = Math.max(...trades.map(row => row.time));
  if (!trades.length || !Number.isSafeInteger(seconds) || seconds <= 0 || to - from < seconds) return [];

  const buckets = new Map<number, typeof trades>();
  for (const row of trades) {
    const time = Math.floor(row.time / seconds) * seconds;
    buckets.set(time, [...(buckets.get(time) ?? []), row]);
  }
  return [...buckets].sort(([a], [b]) => a - b).flatMap(([time, rows]) => {
    const remaining = [...rows];
    const ordered: typeof trades = [];
    while (remaining.length) {
      const slot = Math.min(...remaining.map(row => row.slot));
      const earliest = remaining.filter(row => row.slot === slot &&
        !remaining.some(other => other !== row && other.slot === slot && other.after === row.before));
      if (earliest.length !== 1) return [];
      ordered.push(earliest[0]);
      remaining.splice(remaining.indexOf(earliest[0]), 1);
    }
    const prices = ordered.map(row => row.price);
    return [{
      time, open: prices[0], high: Math.max(...prices), low: Math.min(...prices), close: prices[prices.length - 1],
      partial: time < from || time + seconds > to,
      xntAtoms: ordered.reduce((total, row) => total + row.xntAtoms, BigInt(0)),
    }];
  });
}

export function summarizePoolSample(poolResponse: unknown, signatureResponse: unknown, transactions: unknown) {
  const pool = decodePool(poolResponse);
  if (!pool) return null;
  const window = list(record(signatureResponse).result).map(record);
  const rows = list(transactions).flatMap(response => {
    const signature = list(record(record(record(response).result).transaction).signatures)[0];
    const expected = window.find(entry => entry.signature === signature);
    const row = expected ? parsePoolSwap(response, pool, expected) : null;
    return row ? [row] : [];
  });
  const trades = [...new Map(rows.map(row => [row.signature, row])).values()];
  return {
    pool, trades: trades.sort((a, b) => b.slot - a.slot), candles: buildPoolCandles(trades, 300),
    signatureCount: window.length,
    successfulCount: window.filter(row => row.err === null).length,
    xntVolumeAtoms: trades.reduce((total, row) => total + row.xntAtoms, BigInt(0)),
  };
}
