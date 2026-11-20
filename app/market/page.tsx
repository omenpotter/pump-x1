import type { Metadata } from "next";
import Chart from "@/components/Chart";
import PoolSample from "@/components/PoolSample";
import ScrollFade from "@/components/ScrollFade";
import TradeFeed from "@/components/TradeFeed";
import { TOKEN } from "@/lib/constants";
import JsonLd from "@/components/JsonLd";
import { OG_IMAGE, pageGraph } from "@/lib/seo";

const EXPLORER = TOKEN.explorerUrl;

export const metadata: Metadata = {
  title: "PUMP Price and Market Data on XDEX",
  description: "PUMP/XNT spot quotes from XDEX and verified PUMP pool swaps on X1 Mainnet, read from the chain. Market data only — not financial advice.",
  alternates: { canonical: "/market/" },
  openGraph: { title: "PUMP Price and Market Data on XDEX | Pump X1", description: "PUMP/XNT spot quotes from XDEX and verified PUMP pool swaps on X1 Mainnet, read from the chain. Market data only — not financial advice.", url: "/market/", images: [OG_IMAGE] },
};

const PAGE = { path: "/market/", name: "PUMP market data", description: "PUMP/XNT spot quotes from XDEX and verified PUMP pool swaps on X1 Mainnet, read from the chain. Market data only — not financial advice." };

export default function MarketPage() {
  return (
    <div className="destination-page">
    <JsonLd data={pageGraph(PAGE)} />
    <section className="site-section" id="market" style={{ position:"relative", zIndex:2, padding:"110px 5vw" }}>
      <div style={{ maxWidth:1380, margin:"0 auto" }}>
        <ScrollFade><div style={{ fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".25em", color:"var(--blue)", textTransform:"uppercase", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}><span style={{ color:"rgba(0,170,255,.3)", fontSize:".62rem" }}>{"//"}</span>Live Market</div></ScrollFade>
        <ScrollFade delay={80}><h1 style={{ fontFamily:"var(--font-bebas)", fontSize:"clamp(2.5rem,5vw,4.5rem)", color:"#fff", lineHeight:1, letterSpacing:".03em", marginBottom:18 }}>PRICE <span style={{ color:"var(--blue)" }}>TERMINAL</span></h1></ScrollFade>
        <ScrollFade delay={160}><p style={{ fontSize:"1rem", color:"var(--text-dim)", maxWidth:540, lineHeight:1.8, marginBottom:56 }}>XDEX spot quotes and verified X1 pool trades.</p></ScrollFade>
        <div className="market-grid" style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20, alignItems:"start" }}>
          <ScrollFade className="fade-left"><Chart /><PoolSample /></ScrollFade>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[["Total Supply","18,446,744,073","FIXED"],["Standard","Token-2022","SPL EXT"],["Decimals","9","NATIVE"],["Network","X1 Mainnet","SVM"],["Mint Authority","DISABLED","LOCKED",true],["Inflation","0%","NONE",true]].map(([lbl,val,badge,blue],i)=>(
              <ScrollFade key={String(lbl)} delay={i*60}>
                <div style={{ background:"var(--card)", border:"1px solid var(--border)", padding:"16px 18px" }}>
                  <div style={{ fontSize:".63rem", letterSpacing:".18em", textTransform:"uppercase", color:"var(--text-dim)", marginBottom:5 }}>{lbl}</div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:"1rem", color: blue ? "var(--blue)" : "#fff", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    {val}
                    <span style={{ fontSize:".58rem", padding:"2px 7px", border:"1px solid rgba(0,170,255,.25)", color:"var(--blue)", letterSpacing:".06em" }}>{badge}</span>
                  </div>
                </div>
              </ScrollFade>
            ))}
            <ScrollFade delay={360}>
              <div style={{ background:"var(--card)", border:"1px solid var(--border)", padding:"16px 18px" }}>
                <div style={{ fontSize:".63rem", letterSpacing:".18em", textTransform:"uppercase", color:"var(--text-dim)", marginBottom:5 }}>Explorer</div>
                <a href={EXPLORER} target="_blank" rel="noopener noreferrer" style={{ fontFamily:"var(--font-mono)", fontSize:".8rem", color:"var(--cyan)", textDecoration:"none" }}>View on X1 ↗</a>
              </div>
            </ScrollFade>
          </div>
        </div>
      </div>
    </section>
    <section style={{ position:"relative", zIndex:2, padding:"0 5vw 80px" }}>
      <div style={{ maxWidth:1380, margin:"0 auto" }}>
        <ScrollFade>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".25em",
            color:"var(--blue)", textTransform:"uppercase", marginBottom:12,
            display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ color:"rgba(0,170,255,.3)", fontSize:".62rem" }}>{"//"}</span>
            X1 Activity
          </div>
        </ScrollFade>
        <ScrollFade delay={80}>
          <h2 style={{ fontFamily:"var(--font-bebas)", fontSize:"clamp(2.5rem,5vw,4.5rem)",
            color:"#fff", lineHeight:1, letterSpacing:".03em", marginBottom:40 }}>
            TRANSACTIONS <span style={{ color:"var(--blue)" }}>&amp; HOLDERS</span>
          </h2>
        </ScrollFade>
        <TradeFeed />
      </div>
    </section>
    </div>
  );
}
