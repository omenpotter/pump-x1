import assert from "node:assert/strict";
import { test } from "node:test";
import { formatTokenPrice } from "../lib/market-format.ts";

test("prices use plain decimal notation at market and axis precision", () => {
  assert.equal(formatTokenPrice(4.233e-7), "0.0000004233");
  assert.equal(formatTokenPrice(7.6637409e-8), "0.000000076637409");
  assert.equal(formatTokenPrice(0), "0");
  assert.equal(formatTokenPrice(Number.NaN), "—");
  assert.doesNotMatch(formatTokenPrice(1e21), /e/i);
});
