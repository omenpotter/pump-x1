import type { Metadata } from "next";
import Image from "next/image";
import CopyBtn from "@/components/CopyBtn";
import ScrollFade from "@/components/ScrollFade";
import TkCanvas from "@/components/TokenomicsCanvas";
import { TOKEN } from "@/lib/constants";

const CA = TOKEN.address;
const EXPLORER = TOKEN.explorerUrl;

export const metadata: Metadata = {
  title: "Token | PUMP X1",
  description: "The PUMP Token-2022 contract and tokenomics on X1 Mainnet.",
  alternates: { canonical: "/token/" },
};

export default function TokenPage() {
  return (
    <div className="destination-page">
    <section className="site-section" id="token" style={{ position:"relative", zIndex:2, padding:"110px 5vw", background:"rgba(5,13,22,.6)" }}>
      <div style={{ maxWidth:1380, margin:"0 auto" }}>
        <ScrollFade><div style={{ fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".25em", color:"var(--blue)", textTransform:"uppercase", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}><span style={{ color:"rgba(0,170,255,.3)" }}>{"//"}</span>Token Info</div></ScrollFade>
        <ScrollFade delay={80}><h1 style={{ fontFamily:"var(--font-bebas)", fontSize:"clamp(2.5rem,5vw,4.5rem)", color:"#fff", lineHeight:1, letterSpacing:".03em", marginBottom:40 }}>CONTRACT <span style={{ color:"var(--blue)" }}>DETAILS</span></h1></ScrollFade>
        <ScrollFade delay={160}>
          <div className="ctr-clip contract-card">
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at top left,rgba(0,170,255,.05) 0%,transparent 60%)", pointerEvents:"none" }} />
            <div style={{ float:"right", width:88, height:88, borderRadius:"50%", overflow:"hidden", border:"2px solid rgba(0,170,255,.4)", filter:"drop-shadow(0 0 16px rgba(0,170,255,.7))", marginLeft:28, marginBottom:16, flexShrink:0 }}>
              <Image src="/pump-token.png" alt="PUMP" width={88} height={88} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            </div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".2em", color:"var(--blue)", textTransform:"uppercase", marginBottom:24, display:"flex", alignItems:"center", gap:8 }}>
              <div className="blink-dot" />Contract Address — X1 Mainnet
            </div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:"clamp(.72rem,1.3vw,.9rem)", color:"#fff", wordBreak:"break-all", lineHeight:1.7, padding:14, background:"rgba(0,170,255,.03)", border:"1px solid rgba(0,170,255,.08)", marginBottom:20 }}><span className="contract-address">{CA}</span></div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <CopyBtn ca={CA} />
              <a href={EXPLORER} target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px", border:"1px solid rgba(0,170,255,.3)", color:"var(--blue)", fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".1em", background:"transparent", textDecoration:"none" }}>↗ Explorer</a>
              <a href="https://raw.githubusercontent.com/second2none-1/Pump/main/metadata.json" target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px", border:"1px solid rgba(0,170,255,.3)", color:"var(--blue)", fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".1em", background:"transparent", textDecoration:"none" }}>{"{ }"} Metadata</a>
              <a href="https://github.com/second2none-1/Pump" target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px", border:"1px solid rgba(0,170,255,.3)", color:"var(--blue)", fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".1em", background:"transparent", textDecoration:"none" }}>⌥ GitHub</a>
            </div>
            <dl className="contract-grid" aria-label="Contract information">
              {[["Name","PUMP"],["Symbol","$PUMP"],["Standard","Token-2022"],["Chain","X1 Mainnet"],["Supply","18,446,744,073.71"],["Decimals","9"],["Mint Auth","Disabled"],["VM","SVM / Solana-compat"]].map(([k,v])=>(
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </ScrollFade>
      </div>
    </section>
    <section style={{ position:"relative", zIndex:2, padding:"110px 5vw", background:"var(--bg)" }}>
      <div style={{ maxWidth:1380, margin:"0 auto" }}>
        <ScrollFade><div style={{ fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".25em", color:"var(--blue)", textTransform:"uppercase", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}><span style={{ color:"rgba(0,170,255,.3)" }}>{"//"}</span>Why PUMP</div></ScrollFade>
        <ScrollFade delay={80}><h2 style={{ fontFamily:"var(--font-bebas)", fontSize:"clamp(2.5rem,5vw,4.5rem)", color:"#fff", lineHeight:1, letterSpacing:".03em", marginBottom:18 }}>BUILT <span style={{ color:"var(--blue)" }}>DIFFERENT</span></h2></ScrollFade>
        <ScrollFade delay={160}><p style={{ fontSize:"1rem", color:"var(--text-dim)", maxWidth:540, lineHeight:1.8, marginBottom:56 }}>Every aspect of PUMP is designed with one goal — momentum on X1.</p></ScrollFade>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:18 }}>
          {[
            { icon: <Image src="/pump-token.png" alt="PUMP" width={48} height={48} style={{ borderRadius:"50%", objectFit:"contain", filter:"drop-shadow(0 0 8px rgba(0,170,255,.5))" }} />, title:"FAST", desc:"X1 processes at SVM speed. Sub-second finality, ultra-low fees. Built for traders who don't wait." },
            { icon:"🔒", title:"FIXED SUPPLY", desc:"18.4 billion tokens. Minted once. Mint authority disabled forever. No dilution, no schedules." },
            { icon:"◈", title:"TOKEN-2022", desc:"Next-generation Solana token standard with metadata extensions and future-proof architecture." },
            { icon:"◎", title:"COMMUNITY", desc:"100% community owned. No VC allocation. No insider unlock. PUMP belongs to X1 believers." },
            { icon:"⛓", title:"X1 ECOSYSTEM", desc:"Native to X1 — the fastest-growing SVM-compatible network with real validator infrastructure." },
          ].map(({icon,title,desc},i)=>(
            <ScrollFade key={title} delay={i*80}>
              <div className="card-clip fc" style={{ background:"var(--card)", border:"1px solid var(--border)", padding:"30px 26px", position:"relative", overflow:"hidden", transition:"all .35s cubic-bezier(.16,1,.3,1)" }}>
                <div style={{ marginBottom:18 }}>{typeof icon==="string" ? <div style={{ width:48, height:48, border:"1px solid rgba(0,170,255,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", color:"var(--blue)" }}>{icon}</div> : icon}</div>
                <div style={{ fontFamily:"var(--font-bebas)", fontSize:"1.45rem", letterSpacing:".05em", color:"#fff", marginBottom:8 }}>{title}</div>
                <div style={{ fontSize:".88rem", color:"var(--text-dim)", lineHeight:1.7 }}>{desc}</div>
              </div>
            </ScrollFade>
          ))}
        </div>
      </div>
    </section>
    <section style={{ position:"relative", zIndex:2, padding:"110px 5vw", background:"rgba(5,13,22,.7)" }}>
      <div style={{ maxWidth:1380, margin:"0 auto" }}>
        <ScrollFade><div style={{ fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".25em", color:"var(--blue)", textTransform:"uppercase", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}><span style={{ color:"rgba(0,170,255,.3)" }}>{"//"}</span>Tokenomics</div></ScrollFade>
        <ScrollFade delay={80}><h2 style={{ fontFamily:"var(--font-bebas)", fontSize:"clamp(2.5rem,5vw,4.5rem)", color:"#fff", lineHeight:1, letterSpacing:".03em", marginBottom:40 }}>SOUND BY <span style={{ color:"var(--blue)" }}>DESIGN</span></h2></ScrollFade>
        <div className="tokenomics-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>
          <ScrollFade><TkCanvas /></ScrollFade>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[
              { clr:"var(--blue)", label:"Community Circulation", pct:"100% — 18,446,744,073 PUMP", w:100, op:1 },
              { clr:"rgba(0,170,255,.2)", label:"Team Allocation", pct:"0% — None reserved", w:0, op:.3 },
              { clr:"rgba(0,200,255,.15)", label:"VC / Investors", pct:"0% — No seed rounds", w:0, op:.2 },
              { clr:"rgba(255,255,255,.1)", label:"Inflation", pct:"0% — Fixed forever", w:0, op:.15 },
            ].map(({clr,label,pct,w,op},i)=>(
              <ScrollFade key={label} delay={i*80}>
                <div style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", background:"var(--card)", border:"1px solid var(--border)", transition:"all .3s" }}>
                  <div style={{ width:4, alignSelf:"stretch", borderRadius:2, background:clr, flexShrink:0 }} />
                  <div style={{ width:36, height:36, borderRadius:"50%", overflow:"hidden", border:"1px solid rgba(0,170,255,.3)", filter:"drop-shadow(0 0 6px rgba(0,170,255,.4))", flexShrink:0 }}>
                    <Image src="/pump-token.png" alt="PUMP" width={36} height={36} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:op }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:".88rem", color:"#fff", marginBottom:3 }}>{label}</div>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:".72rem", color:"var(--text-dim)" }}>{pct}</div>
                  </div>
                  <div style={{ width:70, height:2, background:"rgba(255,255,255,.07)", flexShrink:0 }}>
                    <div style={{ height:"100%", borderRadius:2, background:clr, width:`${w}%` }} />
                  </div>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}
