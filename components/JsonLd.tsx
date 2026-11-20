import { serializeJsonLd } from "@/lib/seo";

/** Server-rendered JSON-LD. Input is trusted, static data; still serialised safely. */
export default function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
