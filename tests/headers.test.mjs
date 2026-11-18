import assert from "node:assert/strict";
import { test } from "node:test";
import config from "../next.config.js";

test("production configuration disables framing and emits a scoped policy", async () => {
  const previousEnvironment = process.env.NODE_ENV;
  const previousVercel = process.env.VERCEL_ENV;
  try {
    process.env.NODE_ENV = "production";
    process.env.VERCEL_ENV = "preview";
    const [rule] = await config.headers();
    const headers = Object.fromEntries(rule.headers.map(entry => [entry.key, entry.value]));
    assert.equal(config.poweredByHeader, false);
    assert.equal(headers["X-Frame-Options"], "DENY");
    assert.equal(headers["X-Content-Type-Options"], "nosniff");
    assert.equal(headers["X-Robots-Tag"], "noindex");
    assert.match(headers["Strict-Transport-Security"], /^max-age=/);
    assert.match(headers["Content-Security-Policy"], /frame-ancestors 'none'/);
    assert.match(headers["Content-Security-Policy"], /connect-src 'self' https:\/\/rpc\.mainnet\.x1\.xyz/);
    assert.doesNotMatch(headers["Content-Security-Policy"], /unsafe-eval/);
  } finally {
    if (previousEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousEnvironment;
    if (previousVercel === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previousVercel;
  }
});
