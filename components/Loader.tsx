"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Loader() {
  const [pct, setPct] = useState(0);
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p = Math.min(p + Math.random() * 4 + 1, 100);
      setPct(Math.floor(p));
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => setOut(true), 350);
        setTimeout(() => setGone(true), 1300);
      }
    }, 38);
    return () => clearInterval(iv);
  }, []);

  if (gone) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 10000, background: "var(--bg)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        transition: "opacity .9s, visibility .9s",
        opacity: out ? 0 : 1, visibility: out ? "hidden" : "visible",
      }}
    >
      <div style={{ position: "relative", width: 160, height: 160, marginBottom: 32 }}>
        <Image src="/pump-token.png" alt="PUMP" width={160} height={160}
          style={{ borderRadius: "50%", objectFit: "contain", animation: "ldAssemble 1.2s cubic-bezier(.16,1,.3,1) forwards",
            filter: "drop-shadow(0 0 30px rgba(0,170,255,.9)) drop-shadow(0 0 60px rgba(0,170,255,.4))" }} />
        <div style={{ position: "absolute", inset: -16, border: "1px solid rgba(0,170,255,.3)", borderRadius: "50%", animation: "ldRing 3s linear infinite" }} />
        <div style={{ position: "absolute", inset: -28, border: "1px dashed rgba(0,170,255,.15)", borderRadius: "50%", animation: "ldRing 5s linear infinite reverse" }} />
      </div>
      <div style={{ fontFamily: "var(--font-bebas)", fontSize: "4rem", letterSpacing: ".3em",
        background: "linear-gradient(135deg,var(--blue),var(--cyan))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        animation: "fadeUp .6s .8s forwards", opacity: 0 }}>PUMP</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: ".72rem", letterSpacing: ".4em", color: "var(--cyan)",
        marginTop: 8, animation: "fadeUp .5s 1s forwards", opacity: 0 }}>PUMP IT ON X1</div>
      <div style={{ width: 240, height: 1, background: "rgba(0,170,255,.1)", marginTop: 40, overflow: "hidden" }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg,var(--blue),var(--cyan))",
          boxShadow: "0 0 12px var(--blue)", animation: "ldBar 2.2s .4s cubic-bezier(.4,0,.2,1) forwards", width: "0%" }} />
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: ".68rem", color: "var(--text-dim)", letterSpacing: ".1em", marginTop: 10 }}>{pct}%</div>
    </div>
  );
}
