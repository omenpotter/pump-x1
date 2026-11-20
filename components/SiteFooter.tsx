import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer style={{ position:"relative", zIndex:2, borderTop:"1px solid rgba(0,170,255,.07)", padding:"44px 5vw", background:"rgba(3,6,9,.92)" }}>
      <div style={{ maxWidth:1380, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:20 }}>
        <Link href="/" aria-label="PUMP X1 home" style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Image src="/pump-token.png" alt="PUMP" width={28} height={28} style={{ borderRadius:"50%", objectFit:"contain", filter:"drop-shadow(0 0 8px rgba(0,170,255,.7))" }} />
          <span style={{ fontFamily:"var(--font-bebas)", fontSize:"1.3rem", letterSpacing:".18em", color:"#fff" }}>PUMP<span style={{ color:"var(--cyan)" }}>.X1</span></span>
        </Link>
        <div style={{ fontSize:".74rem", color:"var(--text-dim)", maxWidth:460, lineHeight:1.65, textAlign:"center" }}>PUMP is a community Token-2022 asset on X1 Mainnet. Not financial advice. Always DYOR. Smart contract is unaudited. Trade at your own risk.</div>
        <div style={{ display:"flex", alignItems:"center", gap:7, fontFamily:"var(--font-mono)", fontSize:".7rem", color:"var(--text-dim)" }}>
          <div className="blink-dot" />X1 MAINNET
        </div>
      </div>
      <nav aria-label="X1 ecosystem" style={{ maxWidth:1380, margin:"22px auto 0", display:"flex", flexWrap:"wrap", gap:"6px 18px", justifyContent:"center", fontSize:".72rem", color:"var(--text-dim)" }}>
        <span>An ARKBS Labs X1 ecosystem site</span>
        <a href="https://x1space.xyz/TokenExplorer?mint=Pumps1XfLYk4DttvL4ai9WsKtqPvoT5DE3AsijSzb2C" target="_blank" rel="noopener noreferrer" style={{ color:"var(--text-dim)" }}>Verify PUMP on X1 Space ↗</a>
        <a href="https://x1nexus.xyz/" target="_blank" rel="noopener noreferrer" style={{ color:"var(--text-dim)" }}>X1 Nexus fair launches ↗</a>
      </nav>
    </footer>
  );
}
