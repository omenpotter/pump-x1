'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function Loader() {
  const [pct, setPct] = useState(0)
  const [out, setOut] = useState(false)
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    const iv = setInterval(() => {
      setPct(p => {
        const n = Math.min(p + Math.random()*4+1, 100)
        if (n >= 100) { clearInterval(iv); setTimeout(()=>setOut(true),300); setTimeout(()=>setHidden(true),1200) }
        return n
      })
    }, 38)
    return () => clearInterval(iv)
  }, [])
  if (hidden) return null
  return (
    <div style={{position:'fixed',inset:0,zIndex:10000,background:'var(--bg)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',transition:'opacity .9s,visibility .9s',opacity:out?0:1,visibility:out?'hidden':'visible',pointerEvents:out?'none':'all'}}>
      <div style={{position:'relative',width:160,height:160,marginBottom:28}}>
        <div style={{position:'absolute',inset:-16,borderRadius:'50%',border:'1px solid rgba(0,170,255,.3)',animation:'spin 3s linear infinite'}}/>
        <div style={{position:'absolute',inset:-28,borderRadius:'50%',border:'1px dashed rgba(0,170,255,.15)',animation:'spin 5s linear infinite reverse'}}/>
        <Image src="/pump-token.png" alt="PUMP" width={160} height={160} style={{borderRadius:'50%',objectFit:'contain',filter:'drop-shadow(0 0 30px rgba(0,170,255,.9)) drop-shadow(0 0 60px rgba(0,170,255,.4))'}} priority/>
      </div>
      <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'4rem',letterSpacing:'.3em',background:'linear-gradient(135deg,var(--blue),var(--cyan))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>PUMP</div>
      <div style={{fontFamily:'var(--font-mono)',fontSize:'.72rem',letterSpacing:'.4em',color:'var(--cyan)',marginTop:8}}>PUMP IT ON X1</div>
      <div style={{width:240,height:1,background:'rgba(0,170,255,.1)',marginTop:40,overflow:'hidden'}}>
        <div style={{height:'100%',background:'linear-gradient(90deg,var(--blue),var(--cyan))',width:`${pct}%`,boxShadow:'0 0 12px var(--blue)',transition:'width .04s linear'}}/>
      </div>
      <div style={{fontFamily:'var(--font-mono)',fontSize:'.68rem',color:'var(--text-dim)',letterSpacing:'.1em',marginTop:10}}>{Math.floor(pct)}%</div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
