import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { formatUnits, parseActivity, parseHolders, parseMint, readX1, TOKEN_2022, X1_RPC } from "../lib/chain-data.ts";

const mint = "Pumps1XfLYk4DttvL4ai9WsKtqPvoT5DE3AsijSzb2C";
const owner = "A".repeat(44);
const otherOwner = "B".repeat(44);
const signature = "C".repeat(88);

test("captured X1 mint snapshot keeps exact supply and finalized slot", () => {
  const path = new URL("../docs/upgrade/evidence/x1-mint-finalized.json", import.meta.url);
  const evidence = JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
  assert.deepEqual(parseMint(evidence.result, mint), {
    slot: 94119960, decimals: 9, supply: "18444229684.271747299",
  });
});

function mintSnapshot(supply) {
  return {
    context: { slot: 100 },
    value: {
      owner: TOKEN_2022,
      data: { parsed: { type: "mint", info: { decimals: 9, supply } } },
    },
  };
}

function account(pubkey, accountOwner, amount, tokenMint = mint) {
  return {
    pubkey,
    account: {
      owner: TOKEN_2022,
      data: { parsed: { type: "account", info: { owner: accountOwner, mint: tokenMint, tokenAmount: { amount, decimals: 9 } } } },
    },
  };
}

test("supply uses full unsigned 64-bit precision", () => {
  assert.deepEqual(parseMint(mintSnapshot("18446744073709551615"), mint),
    { decimals: 9, slot: 100, supply: "18446744073.709551615" });
  assert.equal(formatUnits(12n, 3), "0.012");
  assert.equal(formatUnits(1000n, 3), "1");
  assert.equal(formatUnits(42n, 0), "42");
});

test("unexpected mint owner and invalid raw values fail closed", () => {
  const snapshot = mintSnapshot("1");
  snapshot.value.owner = owner;
  assert.throws(() => parseMint(snapshot, mint), /Unexpected mint account/);
  for (const amount of ["1.5", "-1", "18446744073709551616", 100]) {
    assert.throws(() => parseMint(mintSnapshot(amount), mint), /Invalid token amount/);
  }
});

test("successful activity is deduplicated and missing timestamps stay unavailable", () => {
  assert.deepEqual(parseActivity([
    { signature, err: null, blockTime: null },
    { signature, err: null, blockTime: 1_700_000_000 },
    { signature: "D".repeat(87), err: { failure: true }, blockTime: 1_700_000_000 },
    { signature: "bad-path", err: null, blockTime: 1_700_000_000 },
  ]), [{ signature, time: null }]);
  assert.throws(() => parseActivity(null), /Invalid activity response/);
});

test("holders aggregate by owner and distinct owners exclude zero balances", () => {
  const value = [
    account("D".repeat(44), owner, "1000000000"),
    account("E".repeat(44), owner, "123000000"),
    account("F".repeat(44), otherOwner, "900000000"),
    account("G".repeat(44), "H".repeat(44), "0"),
  ];
  assert.deepEqual(parseHolders({ context: { slot: 123 }, value }, mint, 9), {
    slot: 123,
    count: 2,
    top: [{ wallet: owner, balance: "1.123" }, { wallet: otherOwner, balance: "0.9" }],
  });
});

test("holder validation rejects duplicate accounts and other mints", () => {
  const item = account("D".repeat(44), owner, "1");
  for (const value of [[item, item], [account("D".repeat(44), owner, "1", otherOwner)]]) {
    assert.throws(() => parseHolders({ context: { slot: 123 }, value }, mint, 9), /Unexpected token-account record/);
  }
});

test("RPC distinguishes HTTP failures, provider errors, and successful results", async t => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 429 }));
  const signal = new AbortController().signal;
  await assert.rejects(readX1("getAccountInfo", [mint], signal), /X1 RPC unavailable/);
  fetchMock.mock.mockImplementation(async () => Response.json({ id: 1, error: { code: -1 } }));
  await assert.rejects(readX1("getAccountInfo", [mint], signal), /X1 RPC unavailable/);
  fetchMock.mock.mockImplementation(async () => Response.json({ id: 1, result: { value: null } }));
  assert.deepEqual(await readX1("getAccountInfo", [mint], signal), { value: null });
  const [url, options] = fetchMock.mock.calls.at(-1).arguments;
  assert.equal(url, X1_RPC);
  assert.equal(options.redirect, "error");
  assert.deepEqual(JSON.parse(options.body), { jsonrpc: "2.0", id: 1, method: "getAccountInfo", params: [mint] });
});

test("all seven logo digests match the immutable branding manifest", () => {
  const manifest = readFileSync(new URL("../docs/upgrade/02_BRANDING_LOCK_MANIFEST.md", import.meta.url), "utf8");
  const rows = [...manifest.matchAll(/\x60(public\/[^\x60]+)\x60[^\n]+?\x60([a-f0-9]{64})\x60/g)];
  assert.equal(rows.length, 7);
  for (const [, file, digest] of rows) {
    const bytes = readFileSync(new URL(`../${file}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), digest, file);
  }
});
