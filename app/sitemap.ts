import type { MetadataRoute } from "next";
import { ROUTES, absolute } from "@/lib/seo";

const LAST_MODIFIED = new Date("2026-11-20T00:00:00Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({ url: absolute(r.path), lastModified: LAST_MODIFIED, priority: r.priority }));
}
