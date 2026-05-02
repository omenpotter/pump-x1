'use client'

import { useState } from 'react'

export default function CopyBtn({ ca }: { ca: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(ca).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
      }}
      style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px",
        border:"1px solid rgba(0,170,255,.3)", color: copied ? "#00ffaa" : "var(--blue)",
        fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".1em",
        background: copied ? "rgba(0,255,170,.06)" : "transparent", cursor:"pointer", transition:"all .2s" }}
    >
      {copied ? '✓ Copied!' : '⎘ Copy Address'}
    </button>
  )
}
