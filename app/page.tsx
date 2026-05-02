"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import ScrollFade from "@/components/ScrollFade";

const Loader      = dynamic(() => import("@/components/Loader"),          { ssr: false });
const Cursor      = dynamic(() => import("@/components/Cursor"),          { ssr: false });
const HeroCanvas  = dynamic(() => import("@/components/HeroCanvas"),      { ssr: false });
const OrbCanvas   = dynamic(() => import("@/components/OrbCanvas"),       { ssr: false });
const Chart       = dynamic(() => import("@/components/Chart"),           { ssr: false });
const TkCanvas    = dynamic(() => import("@/components/TokenomicsCanvas"),{ ssr: false });
const Navbar      = dynamic(() => import("@/components/Navbar"),          { ssr: false });
const TradeFeed   = dynamic(() => import("@/components/TradeFeed"),       { ssr: false });

const CA = "Pumps1XfLYk4DttvL4ai9WsKtqPvoT5DE3AsijSzb2C";
const EXPLORER = `https://explorer.mainnet.x1.xyz/address/${CA}`;
const BUY_URL = "https://app.xdex.xyz/swap?fromTokenAddress=Pumps1XfLYk4DttvL4ai9WsKtqPvoT5DE3AsijSzb2C&toTokenAddress=111111111111111111111111111111111111111111&ammConfigAddress=2eFPWosizV6nSAGeSvi5tRgXLoqhjnSesra23ALA248c";
const WEBSITE = "https://pump-x1.vercel.app/";
const TELEGRAM = "https://t.me/+mYybY1doiaJiNjQ0";

export default function Home() {
  return (
    <>
      <Loader />
      <Cursor />
      <div className="noise" />
      <div className="scan" />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", padding:"120px 5vw 80px", overflow:"hidden" }}>
        <HeroCanvas />
        <div style={{ position:"absolute", width:700, height:700, background:"rgba(0,100,255,.055)", borderRadius:"50%", filter:"blur(90px)", top:-300, left:-200, zIndex:0, pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:500, height:500, background:"rgba(0,180,255,.04)", borderRadius:"50%", filter:"blur(90px)", bottom:-200, right:-150, zIndex:0, pointerEvents:"none" }} />

        <div style={{ maxWidth:1380, margin:"0 auto", width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center", position:"relative", zIndex:2 }}>
          <div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:".7rem", letterSpacing:".3em", color:"var(--cyan)", textTransform:"uppercase", marginBottom:18, display:"flex", alignItems:"center", gap:10, animation:"fadeUp .5s .3s forwards", opacity:0 }}>
              <span style={{ width:20, height:1, background:"var(--cyan)", display:"inline-block" }} />
              X1 Mainnet · Token-2022 Standard
            </div>
            <h1 style={{ fontFamily:"var(--font-bebas)", fontSize:"clamp(4.5rem,9vw,9.5rem)", lineHeight:.9, letterSpacing:".02em", color:"#fff", animation:"fadeUp .6s .4s forwards", opacity:0 }}>
              PUMP<br/>
              <span style={{ background:"linear-gradient(135deg,var(--blue),var(--cyan))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>IT ON X1</span>
            </h1>
            <p style={{ fontSize:"1.05rem", color:"var(--text-dim)", lineHeight:1.75, maxWidth:460, margin:"20px 0 40px", animation:"fadeUp .6s .5s forwards", opacity:0 }}>
              The viral token movement of X1 Mainnet. Fixed supply. Zero inflation. Built for speed on the next-generation SVM blockchain.
            </p>
            <div style={{ display:"flex", gap:14, flexWrap:"wrap", animation:"fadeUp .5s .6s forwards", opacity:0 }}>
              <a href={BUY_URL} target="_blank" className="btn-clip" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 30px", background:"var(--blue)", color:"#fff", fontFamily:"var(--font-syne)", fontWeight:700, fontSize:".78rem", letterSpacing:".12em", textTransform:"uppercase", textDecoration:"none", transition:"all .25s" }}>Buy PUMP ↗</a>
              <a href="#token" className="btn-clip" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 30px", border:"1px solid rgba(0,170,255,.4)", color:"var(--blue)", fontFamily:"var(--font-syne)", fontWeight:700, fontSize:".78rem", letterSpacing:".12em", textTransform:"uppercase", textDecoration:"none", transition:"all .25s", background:"transparent" }}>Token Info</a>
            </div>
            <div style={{ display:"flex", gap:36, marginTop:44, animation:"fadeUp .5s .7s forwards", opacity:0 }}>
              {[["18.4B","Fixed Supply"],["T-2022","Standard"],["X1","Network"]].map(([v,l])=>(
                <div key={l}>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:"1.25rem", color:"#fff", marginBottom:4 }}>{v}</div>
                  <div style={{ fontSize:".68rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--text-dim)" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", position:"relative", animation:"fadeIn .9s .7s forwards", opacity:0 }}>
            <div style={{ position:"relative", display:"inline-block" }}>
              <OrbCanvas />
              {[["TOKEN-2022","8%","-4%","0s"],["18.4B SUPPLY","16%","85%","-1.5s"],["X1 CHAIN","48%","-10%","-3s"]].map(([txt,top,right,delay])=>(
                <div key={txt} className="dp" style={{ position:"absolute", padding:"6px 14px", background:"rgba(4,14,24,.9)", border:"1px solid rgba(0,170,255,.25)", fontFamily:"var(--font-mono)", fontSize:".68rem", color:"var(--blue)", whiteSpace:"nowrap", animation:`dpFloat 4s ease-in-out ${delay} infinite`, top, right }}>
                  {txt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ overflow:"hidden", borderTop:"1px solid rgba(0,170,255,.06)", borderBottom:"1px solid rgba(0,170,255,.06)", background:"rgba(0,170,255,.02)", padding:"12px 0", position:"relative", zIndex:2 }}>
        <div className="ticker-track" style={{ display:"flex", gap:60, width:"max-content" }}>
          {["PUMP/XNT ∞","TOKEN-2022 STANDARD","X1 MAINNET · SVM","FIXED SUPPLY 18,446,744,073","0% INFLATION EVER","PUMP IT ON X1","COMMUNITY 100%","NO MINT AUTHORITY",
            "PUMP/XNT ∞","TOKEN-2022 STANDARD","X1 MAINNET · SVM","FIXED SUPPLY 18,446,744,073","0% INFLATION EVER","PUMP IT ON X1","COMMUNITY 100%","NO MINT AUTHORITY"
          ].map((t,i)=>(
            <span key={i} style={{ fontFamily:"var(--font-mono)", fontSize:".7rem", letterSpacing:".1em", color:"var(--text-dim)", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ color:"rgba(0,170,255,.2)", fontSize:".4rem" }}>◆</span>{t}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ position:"relative", zIndex:2, borderBottom:"1px solid rgba(0,170,255,.07)", background:"rgba(5,13,22,.8)" }}>
        <div style={{ maxWidth:1380, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
          {[["18.4B","Fixed Supply"],["9","Decimals"],["T-2022","Token Standard"],["X1","Network"]].map(([v,l],i)=>(
            <ScrollFade key={l} delay={i*80}>
              <div style={{ padding:"28px 40px", borderRight:"1px solid rgba(0,170,255,.07)", textAlign:"center" }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:"1.5rem", color:"#fff", marginBottom:6 }}>{v}</div>
                <div style={{ fontSize:".68rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--text-dim)" }}>{l}</div>
              </div>
            </ScrollFade>
          ))}
        </div>
      </div>

      {/* ── MARKET ── */}
      <section id="market" style={{ position:"relative", zIndex:2, padding:"110px 5vw" }}>
        <div style={{ maxWidth:1380, margin:"0 auto" }}>
          <ScrollFade><div style={{ fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".25em", color:"var(--blue)", textTransform:"uppercase", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}><span style={{ color:"rgba(0,170,255,.3)", fontSize:".62rem" }}>//</span>Live Market</div></ScrollFade>
          <ScrollFade delay={80}><h2 style={{ fontFamily:"var(--font-bebas)", fontSize:"clamp(2.5rem,5vw,4.5rem)", color:"#fff", lineHeight:1, letterSpacing:".03em", marginBottom:18 }}>PRICE <span style={{ color:"var(--blue)" }}>TERMINAL</span></h2></ScrollFade>
          <ScrollFade delay={160}><p style={{ fontSize:"1rem", color:"var(--text-dim)", maxWidth:540, lineHeight:1.8, marginBottom:56 }}>Real-time PUMP activity on X1 Mainnet. Simulated market feed — live data via xDEX when available.</p></ScrollFade>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20, alignItems:"start" }}>
            <ScrollFade className="fade-left"><Chart /></ScrollFade>
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
                  <a href={EXPLORER} target="_blank" style={{ fontFamily:"var(--font-mono)", fontSize:".8rem", color:"var(--cyan)", textDecoration:"none" }}>View on X1 ↗</a>
                </div>
              </ScrollFade>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE FEED ── */}
      <section style={{ position:"relative", zIndex:2, padding:"0 5vw 80px" }}>
        <div style={{ maxWidth:1380, margin:"0 auto" }}>
          <ScrollFade>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".25em",
              color:"var(--blue)", textTransform:"uppercase", marginBottom:12,
              display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ color:"rgba(0,170,255,.3)", fontSize:".62rem" }}>//</span>
              Live Feed
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

      {/* ── CONTRACT ── */}
      <section id="token" style={{ position:"relative", zIndex:2, padding:"110px 5vw", background:"rgba(5,13,22,.6)" }}>
        <div style={{ maxWidth:1380, margin:"0 auto" }}>
          <ScrollFade><div style={{ fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".25em", color:"var(--blue)", textTransform:"uppercase", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}><span style={{ color:"rgba(0,170,255,.3)" }}>//</span>Token Info</div></ScrollFade>
          <ScrollFade delay={80}><h2 style={{ fontFamily:"var(--font-bebas)", fontSize:"clamp(2.5rem,5vw,4.5rem)", color:"#fff", lineHeight:1, letterSpacing:".03em", marginBottom:40 }}>CONTRACT <span style={{ color:"var(--blue)" }}>DETAILS</span></h2></ScrollFade>
          <ScrollFade delay={160}>
            <div className="ctr-clip" style={{ background:"var(--card)", border:"1px solid var(--border)", padding:"40px 48px", position:"relative", overflow:"hidden", maxWidth:860 }}>
              <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at top left,rgba(0,170,255,.05) 0%,transparent 60%)", pointerEvents:"none" }} />
              <div style={{ float:"right", width:88, height:88, borderRadius:"50%", overflow:"hidden", border:"2px solid rgba(0,170,255,.4)", filter:"drop-shadow(0 0 16px rgba(0,170,255,.7))", marginLeft:28, marginBottom:16, flexShrink:0 }}>
                <Image src="/pump-token.png" alt="PUMP" width={88} height={88} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".2em", color:"var(--blue)", textTransform:"uppercase", marginBottom:24, display:"flex", alignItems:"center", gap:8 }}>
                <div className="blink-dot" />Contract Address — X1 Mainnet
              </div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:"clamp(.72rem,1.3vw,.9rem)", color:"#fff", wordBreak:"break-all", lineHeight:1.7, padding:14, background:"rgba(0,170,255,.03)", border:"1px solid rgba(0,170,255,.08)", marginBottom:20 }}>{CA}</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <CopyBtn ca={CA} />
                <a href={EXPLORER} target="_blank" style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px", border:"1px solid rgba(0,170,255,.3)", color:"var(--blue)", fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".1em", background:"transparent", textDecoration:"none" }}>↗ Explorer</a>
                <a href="https://raw.githubusercontent.com/second2none-1/Pump/main/metadata.json" target="_blank" style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px", border:"1px solid rgba(0,170,255,.3)", color:"var(--blue)", fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".1em", background:"transparent", textDecoration:"none" }}>{"{ }"} Metadata</a>
                <a href="https://github.com/second2none-1/Pump" target="_blank" style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px", border:"1px solid rgba(0,170,255,.3)", color:"var(--blue)", fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".1em", background:"transparent", textDecoration:"none" }}>⌥ GitHub</a>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:1, background:"rgba(0,170,255,.06)", marginTop:32, border:"1px solid var(--border)" }}>
                {[["Name","PUMP"],["Symbol","$PUMP"],["Standard","Token-2022"],["Chain","X1 Mainnet"],["Supply","18,446,744,073.71"],["Decimals","9"],["Mint Auth","Disabled"],["VM","SVM / Solana-compat"]].map(([k,v])=>(
                  <div key={k} style={{ padding:"14px 18px", background:"rgba(5,13,22,.9)", display:"flex", flexDirection:"column", gap:4 }}>
                    <div style={{ fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-dim)" }}>{k}</div>
                    <div style={{ fontFamily:"var(--font-mono)", fontSize:".8rem", color: k==="Mint Auth" ? "var(--blue)" : "#fff" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ position:"relative", zIndex:2, padding:"110px 5vw", background:"var(--bg)" }}>
        <div style={{ maxWidth:1380, margin:"0 auto" }}>
          <ScrollFade><div style={{ fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".25em", color:"var(--blue)", textTransform:"uppercase", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}><span style={{ color:"rgba(0,170,255,.3)" }}>//</span>Why PUMP</div></ScrollFade>
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

      {/* ── TOKENOMICS ── */}
      <section style={{ position:"relative", zIndex:2, padding:"110px 5vw", background:"rgba(5,13,22,.7)" }}>
        <div style={{ maxWidth:1380, margin:"0 auto" }}>
          <ScrollFade><div style={{ fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".25em", color:"var(--blue)", textTransform:"uppercase", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}><span style={{ color:"rgba(0,170,255,.3)" }}>//</span>Tokenomics</div></ScrollFade>
          <ScrollFade delay={80}><h2 style={{ fontFamily:"var(--font-bebas)", fontSize:"clamp(2.5rem,5vw,4.5rem)", color:"#fff", lineHeight:1, letterSpacing:".03em", marginBottom:40 }}>SOUND BY <span style={{ color:"var(--blue)" }}>DESIGN</span></h2></ScrollFade>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>
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

      {/* ── COMMUNITY ── */}
      <section id="community" style={{ position:"relative", zIndex:2, padding:"110px 5vw", textAlign:"center", background:"linear-gradient(135deg,rgba(5,13,22,.9) 0%,var(--bg) 100%)" }}>
        <div style={{ maxWidth:780, margin:"0 auto" }}>
          <ScrollFade>
            <div style={{ width:100, height:100, borderRadius:"50%", overflow:"hidden", margin:"0 auto 28px", border:"2px solid rgba(0,170,255,.4)", animation:"cmPulse 3s ease-in-out infinite" }}>
              <Image src="/pump-token.png" alt="PUMP" width={100} height={100} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            </div>
          </ScrollFade>
          <ScrollFade delay={80}><h2 style={{ fontFamily:"var(--font-bebas)", fontSize:"clamp(3rem,7vw,6rem)", color:"#fff", letterSpacing:".04em", marginBottom:18, background:"linear-gradient(135deg,#fff 20%,var(--blue))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>JOIN THE<br/>MOVEMENT</h2></ScrollFade>
          <ScrollFade delay={160}><p style={{ fontSize:"1rem", color:"var(--text-dim)", lineHeight:1.8, marginBottom:48 }}>PUMP is nothing without the people behind it. Join the growing community of X1 believers.</p></ScrollFade>
          <ScrollFade delay={240}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, maxWidth:540, margin:"0 auto" }}>
              {[{icon:"✈",label:"Telegram",href:TELEGRAM},{icon:"◎",label:"Website",href:WEBSITE},{icon:"◉",label:"Explorer",href:EXPLORER}].map(({icon,label,href})=>(
                <a key={label} href={href} target="_blank" className="soc-clip soc-c" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, padding:"24px 16px", background:"var(--card)", border:"1px solid var(--border)", textDecoration:"none", color:"inherit", transition:"all .3s" }}>
                  <div style={{ fontSize:"1.5rem" }}>{icon}</div>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".14em", color:"var(--text-dim)", textTransform:"uppercase" }}>{label}</div>
                </a>
              ))}
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position:"relative", zIndex:2, borderTop:"1px solid rgba(0,170,255,.07)", padding:"44px 5vw", background:"rgba(3,6,9,.92)" }}>
        <div style={{ maxWidth:1380, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Image src="/pump-token.png" alt="PUMP" width={28} height={28} style={{ borderRadius:"50%", objectFit:"contain", filter:"drop-shadow(0 0 8px rgba(0,170,255,.7))" }} />
            <span style={{ fontFamily:"var(--font-bebas)", fontSize:"1.3rem", letterSpacing:".18em", color:"#fff" }}>PUMP<span style={{ color:"var(--cyan)" }}>.X1</span></span>
          </div>
          <div style={{ fontSize:".74rem", color:"var(--text-dim)", maxWidth:460, lineHeight:1.65, textAlign:"center" }}>PUMP is a community Token-2022 asset on X1 Mainnet. Not financial advice. Always DYOR. Smart contract is unaudited. Trade at your own risk.</div>
          <div style={{ display:"flex", alignItems:"center", gap:7, fontFamily:"var(--font-mono)", fontSize:".7rem", color:"var(--text-dim)" }}>
            <div className="blink-dot" />X1 MAINNET LIVE
          </div>
        </div>
      </footer>
    </>
  );
}

function CopyBtn({ ca }: { ca: string }) {
  "use client";
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => {
      if (typeof navigator !== "undefined") {
        navigator.clipboard.writeText(ca).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }
    }}
      style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px", border:"1px solid rgba(0,170,255,.3)", color: copied ? "#00ffaa" : "var(--blue)", fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".1em", background: copied ? "rgba(0,255,170,.06)" : "transparent", cursor:"pointer", transition:"all .2s" }}>
      {copied ? "✓ Copied!" : "⎘ Copy Address"}
    </button>
  );
}
