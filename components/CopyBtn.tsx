'use client'

import { useState } from 'react'

export default function CopyBtn({ ca }: { ca: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const copied = status === 'copied'
  return (
    <button type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(ca)
          setStatus('copied')
        } catch {
          setStatus('error')
        }
      }}
      style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 18px",
        border:"1px solid rgba(0,170,255,.3)", color: copied ? "#00ffaa" : "var(--blue)",
        fontFamily:"var(--font-mono)", fontSize:".68rem", letterSpacing:".1em",
        background: copied ? "rgba(0,255,170,.06)" : "transparent", cursor:"pointer", transition:"all .2s" }}
    >
      <span role="status">{copied ? '✓ Copied!' : status === 'error' ? 'Select the address to copy' : '⎘ Copy Address'}</span>
    </button>
  )
}
