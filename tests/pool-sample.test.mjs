import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { decodePool, parsePoolSwap, summarizePoolSample } from "../lib/pool-sample.ts";

const load = name => JSON.parse(readFileSync(new URL(`../docs/upgrade/evidence/${name}.json`, import.meta.url), "utf8").replace(/^\uFEFF/, ""));
const poolAccount = load("x1-xdex-pool");
const signatures = load("x1-xdex-pool-signatures");
const transactions = load("x1-xdex-pool-transactions");
const quote = load("xdex-paired-quote").data[0];

test("the pool account owner, pair and vaults match the captured swap traces", () => {
  const pool = decodePool(poolAccount);
  assert.equal(pool.address, quote.selected_pool);
  assert.equal(pool.program, poolAccount.result.value.owner);
  assert.equal(pool.pumpVault, "JCevpqonyYnMb7ZLjDist9LC1EfyrVe43QPmFVXWRCeA");
  assert.equal(pool.xntVault, "6mgCwZ4jggBrq4qSZew3Hzjyg9tPpiZ6cESpnTmh34DN");
  const wrongProgram = structuredClone(poolAccount);
  wrongProgram.result.value.owner = pool.pumpVault;
  assert.equal(decodePool(wrongProgram), null);
});

test("all nine successful captured responses reconcile to verified swap legs", () => {
  const result = summarizePoolSample(poolAccount, signatures, transactions);
  assert.equal(result.signatureCount, 25);
  assert.equal(result.successfulCount, 9);
  assert.equal(result.trades.filter(row => row.side === "BUY").length, 2);
  assert.equal(result.trades.filter(row => row.side === "SELL").length, 7);
  assert.equal(result.xntVolumeAtoms, 76784931921n);
  assert.equal(result.trades[0].pumpAtoms, 611249098401796n);
  assert.equal(result.trades[0].xntAtoms, 258751735n);
  assert.equal(result.trades.find(row => row.signature.startsWith("3aCyK6")).xntAtoms, 29000000000n);
});

test("candles use verified prices and vault continuity, independent of transaction input order", () => {
  const a = summarizePoolSample(poolAccount, signatures, transactions).candles;
  const b = summarizePoolSample(poolAccount, signatures, [...transactions].reverse()).candles;
  assert.deepEqual(a, b);
  assert.equal(a.length, 2);
  assert.equal(a[0].open, 36051400000 / 122852195814348326);
  assert.equal(a[0].close, 52055806 / 122792599871547);
  assert.equal(a[1].open, a[1].close);
  assert.equal(a[0].xntAtoms + a[1].xntAtoms, 76784931921n);
});

test("a mismatched vault balance invalidates a swap", () => {
  const tx = structuredClone(transactions[0]);
  const signature = tx.result.transaction.signatures[0];
  const expected = signatures.result.find(row => row.signature === signature);
  const pool = decodePool(poolAccount);
  const index = tx.result.transaction.message.accountKeys.findIndex(key => key.pubkey === pool.pumpVault);
  tx.result.meta.postTokenBalances.find(row => row.accountIndex === index).uiTokenAmount.amount = "0";
  assert.equal(parsePoolSwap(tx, pool, expected), null);
});

test("XDEX quote price and quote-side depth reconcile at quoted reserve precision", () => {
  const pool = quote.candidates.find(candidate => candidate.pool === quote.selected_pool);
  const usd = Number(pool.quote_reserve) / Number(pool.token_reserve) * quote.xnt_usd_price;
  const depth = Number(pool.quote_reserve) / 1e9 * quote.xnt_usd_price;
  assert.ok(Math.abs(usd - quote.price) < 1e-14);
  assert.ok(Math.abs(depth - pool.usd_depth) < 1e-6);
});
