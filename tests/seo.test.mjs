import assert from "node:assert/strict";
import { test } from "node:test";
import { readdirSync, statSync, existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { TOKEN } from "../lib/constants.ts";
import { TOKEN_FACTS, serializeJsonLd, absolute, ROUTES, siteGraph, pageGraph, SITE_URL } from "../lib/seo.ts";

test("JSON-LD serialiser cannot break out of a script element", () => {
  const out = serializeJsonLd({ x: "</script><script>alert(1)</script>", y: "a&b " });
  assert.doesNotMatch(out, /<|>/);
  assert.match(out, /\\u003c\/script\\u003e/);
  assert.deepEqual(JSON.parse(out), { x: "</script><script>alert(1)</script>", y: "a&b " });
});

test("canonical URLs are absolute, www, https and trailing-slashed", () => {
  assert.equal(absolute("/"), "https://www.pumpx1.xyz/");
  assert.equal(absolute("token"), "https://www.pumpx1.xyz/token/");
  assert.equal(absolute("/market/"), "https://www.pumpx1.xyz/market/");
});

test("sitemap routes match the app router pages exactly", () => {
  const pages = ["/", ...readdirSync("app").filter((d) => statSync(`app/${d}`).isDirectory() && d !== "api" && existsSync(`app/${d}/page.tsx`)).map((d) => `/${d}/`)].sort();
  assert.deepEqual(ROUTES.map((r) => r.path).sort(), pages);
});

test("structured data: entities, publisher reference, no ratings", () => {
  const g = siteGraph()["@graph"];
  const types = g.map((n) => n["@type"]);
  for (const t of ["Organization", "WebSite"]) assert.ok(types.includes(t));
  const token = g.find((n) => n["@id"] === `${SITE_URL}/#pump-token`);
  assert.equal(token.identifier.value, "Pumps1XfLYk4DttvL4ai9WsKtqPvoT5DE3AsijSzb2C");
  const p = pageGraph({ path: "/token/", name: "T", description: "D" })["@graph"];
  assert.equal(p[0].url, "https://www.pumpx1.xyz/token/");
  assert.equal(p[1]["@type"], "BreadcrumbList");
  assert.doesNotMatch(JSON.stringify([g, p]), /aggregateRating|"review"/i);
});

test("branding lock: the seven locked image files are byte-identical", () => {
  const manifest = readFileSync("docs/upgrade/02_BRANDING_LOCK_MANIFEST.md", "utf8");
  const rows = [...manifest.matchAll(/\| `(public\/[^`]+)` \|.*\| `([0-9a-f]{64})` \|/g)];
  assert.equal(rows.length, 7);
  for (const [, path, sha] of rows) assert.equal(createHash("sha256").update(readFileSync(path)).digest("hex"), sha, path);
});

test("seo token facts match lib/constants.ts", () => {
  assert.equal(TOKEN_FACTS.address, TOKEN.address);
  assert.equal(TOKEN_FACTS.decimals, TOKEN.decimals);
  assert.equal(TOKEN_FACTS.image, TOKEN.image);
});
