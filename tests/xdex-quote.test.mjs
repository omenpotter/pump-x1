import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { getQuoteUrl, parsePumpQuote, QUOTE_MAX_AGE_MS } from "../lib/xdex-quote.ts";

const pump = "Pumps1XfLYk4DttvL4ai9WsKtqPvoT5DE3AsijSzb2C";
const xnt = "XNMbEwZFFBKQhqyW3taa8cAUp1xBUHfyzRFJQvZET4m";

const captured = JSON.parse(readFileSync(new URL("../docs/upgrade/evidence/xdex-paired-quote.json", import.meta.url), "utf8").replace(/^\uFEFF/, ""));
const observationTime = captured.data.find(entry => entry.token_address === pump).observedTimestamp;

test("captured XDEX quote uses the reported native XNT conversion and selected pool", () => {
  const quote = parsePumpQuote(captured, pump, observationTime + 1255);
  assert.equal(quote.usd, 7.6637409e-8);
  assert.ok(Math.abs(quote.xnt - 4.2399012129528605e-7) < 1e-15);
  assert.equal(quote.quoteDepthUsd, 38.592955);
  assert.equal(quote.pool, "J9iYHaqqgBt2AM4mmri45ccBcTbfUXi9bE3sW5CsdhAj");
  assert.equal(quote.delayed, true);
});

test("stale, ambiguous and mismatched captured quotes are rejected", () => {
  assert.equal(parsePumpQuote(captured, pump, observationTime + QUOTE_MAX_AGE_MS + 1), null);
  const duplicate = { ...captured, data: [...captured.data, captured.data[0]] };
  assert.equal(parsePumpQuote(duplicate, pump, observationTime), null);
  const mismatched = { ...captured, data: [{ ...captured.data[0], candidates: [] }] };
  assert.equal(parsePumpQuote(mismatched, pump, observationTime), null);
});

test("the single and paired quote contracts map to the canonical XDEX endpoint", () => {
  for (const [path, pair] of [
    ["/api/token-price/price", { address: pump }],
    ["/api/token-price/prices", { token_addresses: `${pump},${xnt}` }],
  ]) {
    const params = new URLSearchParams({ ...pair, path, network: "X1 Mainnet" });
    const url = getQuoteUrl(params, pump, xnt);
    assert.equal(url.origin, "https://api.xdex.xyz");
    assert.equal(url.pathname, path);
    assert.deepEqual(Object.fromEntries(url.searchParams), { network: "X1 Mainnet", ...pair });
  }
});

test("unsupported operations, missing fields and noncanonical parameters are declined", () => {
  const normal = new URLSearchParams({ path: "/api/token-price/price", network: "X1 Mainnet", address: pump });
  for (const change of [
    query => query.set("path", "/api/pools"),
    query => query.delete("network"),
    query => query.set("address", xnt),
    query => query.append("address", pump),
    query => query.append("extra", "1"),
  ]) {
    const params = new URLSearchParams(normal);
    change(params);
    assert.equal(getQuoteUrl(params, pump, xnt), null);
  }
});
