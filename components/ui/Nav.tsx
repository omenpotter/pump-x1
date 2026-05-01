'use client'
import Image from 'next/image'
import Link from 'next/link'

export default function Nav() {
  return (
    <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:500,padding:'0 5vw',height:68,display:'flex',alignItems:'center',justifyContent:'space-between',background:'linear-gradient(180deg,rgba(3,6,9,.96) 0%,transparent 100%)',borderBottom:'1px solid rgba(0,170,255,.07)',backdropFilter:'blur(14px)'}}>
      <Link href="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none'}}>
        <Image src="/pump-token.png" alt="PUMP" width={32} height={32} style={{borderRadius:'50%',objectFit:'contain',filter:'drop-shadow(0 0 8px rgba(0,170,255,.8))'}}/>
        <span style={{fontFamily:'Bebas Neue,sans-serif',fontSize:'1.5rem',letterSpacing:'.2em',color:'#fff'}}>PUMP<span style={{color:'var(--cyan)'}}>.X1</span></span>
      </Link>
      <ul style={{display:'flex',gap:32,listStyle:'none'}}>
        {['Market','Token','Roadmap','Community'].map(item=>(
          <li key={item}><a href={`#${item.toLowerCase()}`} style={{fontSize:'.74rem',letterSpacing:'.18em',textTransform:'uppercase',color:'var(--text-dim)',textDecoration:'none',fontWeight:600,transition:'color .25s'}} onMouseEnter={e=>(e.currentTarget.style.color='var(--blue)')} onMouseLeave={e=>(e.currentTarget.style.color='var(--text-dim)')}>{item}</a></li>
        ))}
      </ul>
      <div style={{display:'flex',alignItems:'center',gap:8,fontFamily:'var(--font-mono)',fontSize:'.7rem',color:'var(--text-dim)'}}>
        <div className="blink-dot"/><span>X1 MAINNET · LIVE</span>
      </div>
    </nav>
  )
}
