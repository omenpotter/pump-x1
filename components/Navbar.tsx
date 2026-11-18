"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { path: "/", label: "Home" },
  { path: "/market", label: "Market" },
  { path: "/token", label: "Token" },
  { path: "/community", label: "Community" },
];

export default function Navbar() {
  const current = usePathname().replace(/\/$/, "") || "/";
  return (
    <nav aria-label="Main" className="site-nav" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
      padding: "0 5vw", height: 68,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "linear-gradient(180deg,rgba(3,6,9,.96) 0%,transparent 100%)",
      borderBottom: "1px solid rgba(0,170,255,.07)", backdropFilter: "blur(14px)",
    }}>
      <Link href="/" aria-label="PUMP X1 home"
        style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <Image src="/pump-token.png" alt="PUMP" width={32} height={32}
          style={{ borderRadius: "50%", objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(0,170,255,.8))" }} />
        <span style={{ fontFamily: "var(--font-bebas)", fontSize: "1.5rem", letterSpacing: ".2em", color: "#fff" }}>
          PUMP<span style={{ color: "var(--cyan)" }}>.X1</span>
        </span>
      </Link>
      <ul className="site-nav__links" style={{ display: "flex", listStyle: "none" }}>
        {tabs.map(({ path, label }) => (
          <li key={path}>
            <Link href={path === "/" ? path : `${path}/`} aria-current={current === path ? "page" : undefined}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="site-nav__network">
        <span aria-hidden="true" />X1 MAINNET
      </div>
    </nav>
  );
}
