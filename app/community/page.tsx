import type { Metadata } from "next";
import Image from "next/image";
import ScrollFade from "@/components/ScrollFade";
import { TOKEN } from "@/lib/constants";

const WEBSITE = "https://www.pumpx1.xyz/";
const TELEGRAM = "https://t.me/+mYybY1doiaJiNjQ0";
const EXPLORER = TOKEN.explorerUrl;

export const metadata: Metadata = {
  title: "Community | PUMP X1",
  description: "Find the PUMP community and official links on X1 Mainnet.",
  alternates: { canonical: "/community/" },
};

export default function CommunityPage() {
  return (
    <div className="destination-page">
    <section className="site-section" id="community" style={{ position:"relative", zIndex:2, padding:"110px 5vw", textAlign:"center", background:"linear-gradient(135deg,rgba(5,13,22,.9) 0%,var(--bg) 100%)" }}>
      <div style={{ maxWidth:780, margin:"0 auto" }}>
        <ScrollFade>
          <div style={{ width:100, height:100, borderRadius:"50%", overflow:"hidden", margin:"0 auto 28px", border:"2px solid rgba(0,170,255,.4)", animation:"cmPulse 3s ease-in-out infinite" }}>
            <Image src="/pump-token.png" alt="PUMP" width={100} height={100} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
        </ScrollFade>
        <ScrollFade delay={80}><h1 style={{ fontFamily:"var(--font-bebas)", fontSize:"clamp(3rem,7vw,6rem)", color:"#fff", letterSpacing:".04em", marginBottom:18, background:"linear-gradient(135deg,#fff 20%,var(--blue))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>JOIN THE<br/>MOVEMENT</h1></ScrollFade>
        <ScrollFade delay={160}><p style={{ fontSize:"1rem", color:"var(--text-dim)", lineHeight:1.8, marginBottom:48 }}>PUMP is nothing without the people behind it. Join the growing community of X1 believers.</p></ScrollFade>
        <ScrollFade delay={240}>
          <div className="community-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, maxWidth:540, margin:"0 auto" }}>
            {[{icon:"✈",label:"Telegram",href:TELEGRAM},{icon:"◎",label:"Website",href:WEBSITE},{icon:"◉",label:"Explorer",href:EXPLORER}].map(({icon,label,href})=>(
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="soc-clip soc-c" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, padding:"24px 16px", background:"var(--card)", border:"1px solid var(--border)", textDecoration:"none", color:"inherit", transition:"all .3s" }}>
                <div style={{ fontSize:"1.5rem" }}>{icon}</div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".14em", color:"var(--text-dim)", textTransform:"uppercase" }}>{label}</div>
              </a>
            ))}
          </div>
        </ScrollFade>
      </div>
    </section>
    </div>
  );
}
