// Search metadata and Schema.org structured data for Pump X1.
// Facts here are limited to what is verifiable on-chain or in this repository.
// Self-contained (no imports) so Node's test runner can load it; tests assert these match lib/constants.ts.
export const TOKEN_FACTS = { address: "Pumps1XfLYk4DttvL4ai9WsKtqPvoT5DE3AsijSzb2C", decimals: 9, image: "/pump-token.png" } as const;
const TOKEN = TOKEN_FACTS;

export const SITE_URL = "https://www.pumpx1.xyz";
export const SITE_NAME = "Pump X1";
export const ORG_ID = "https://x1nexus.xyz/#arkbs-labs";
export const OG_IMAGE = { url: "/og-pump-x1.png", width: 1200, height: 630, alt: "PUMP — a Token-2022 community token on X1 Mainnet" };

/** Canonical absolute URL for a route. Routes use trailing slashes (next.config trailingSlash). */
export function absolute(path: string): string {
  const p = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;
  return `${SITE_URL}${p}`;
}

/** Indexable routes, used by the sitemap and tests. Keep in sync with app/. */
export const ROUTES = [
  { path: "/", priority: 1.0 },
  { path: "/token/", priority: 0.9 },
  { path: "/market/", priority: 0.8 },
  { path: "/community/", priority: 0.6 },
] as const;

/**
 * Serialise JSON-LD for a <script> tag. Escapes "<", ">", "&" and line separators so no value
 * can terminate the script element or inject markup.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

const organization = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "ARKBS Labs",
  description: "Builder of X1 ecosystem tools: X1 Space, X1 Nexus, 404X1, Pump X1 and X1 Leader Slot Checker.",
  sameAs: ["https://x.com/rkbehelvi"],
};

const x1 = {
  "@type": "Thing",
  "@id": `${SITE_URL}/#x1`,
  name: "X1 blockchain",
  description: "High-performance layer-1 blockchain compatible with the Solana Virtual Machine (SVM); native token XNT.",
  url: "https://x1.xyz/",
  sameAs: ["https://docs.x1.xyz/"],
};

/** The PUMP token as an entity. Identifier is the mint address (verifiable on X1 Mainnet). */
export const tokenEntity = {
  "@type": "Thing",
  "@id": `${SITE_URL}/#pump-token`,
  name: "PUMP",
  alternateName: "$PUMP",
  description: `PUMP is a Token-2022 (SPL Token Extensions) token on X1 Mainnet with ${TOKEN.decimals} decimals and its mint authority disabled.`,
  identifier: { "@type": "PropertyValue", propertyID: "X1 mint address", value: TOKEN.address },
  url: absolute("/token/"),
  image: `${SITE_URL}${TOKEN.image}`,
  subjectOf: { "@id": `${SITE_URL}/#website` },
};

export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      x1,
      tokenEntity,
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: absolute("/"),
        name: SITE_NAME,
        alternateName: "PUMP X1",
        inLanguage: "en",
        publisher: { "@id": ORG_ID },
        about: { "@id": `${SITE_URL}/#pump-token` },
      },
    ],
  };
}

/** WebPage + BreadcrumbList for a route. */
export function pageGraph({ path, name, description, extra = [] }: { path: string; name: string; description: string; extra?: object[] }) {
  const url = absolute(path);
  const crumbs = path === "/" ? [] : [{ name: SITE_NAME, url: absolute("/") }, { name, url }];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name,
        description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: [{ "@id": `${SITE_URL}/#pump-token` }, { "@id": `${SITE_URL}/#x1` }],
        inLanguage: "en",
        dateModified: "2026-11-20",
      },
      ...(crumbs.length ? [{
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
      }] : []),
      ...extra,
    ],
  };
}
