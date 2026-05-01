'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

type Candle = { o:number;h:number;l:number;c:number;vol:number }
function gen(n:number):Candle[]{const d:Candle[]=[]; let p=100;for(let i=n;i>=0;i--){const v=(Math.random()-.45)*.065;const o=p,c=o*(1+v);d.push({o,h:Math.max(o,c)*(1+Math.random()*.025),l:Math.min(o,c)*(1-Math.random()*.025),c,vol:Math.random()*900+200});p=c}return d}

export default function Chart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const [tf, setTf] = useState('1m')
  const allData = useRef<Record<string,Candle[]>>({'1m':gen(60),'5m':gen(60),'1h':gen(60),'1d':gen(60)})
  const [pi, setPi] = useState({price:'—',change:'—',up:true})
  const tfRef = useRef(tf)
  tfRef.current = tf

  const draw = useCallback(() => {
    const cvs=canvasRef.current,box=boxRef.current; if(!cvs||!box)return
    const W=cvs.width=box.clientWidth,H=cvs.height=box.clientHeight
    const ctx=cvs.getContext('2d')!,data=allData.current[tfRef.current]
    ctx.clearRect(0,0,W,H)
    ctx.strokeStyle='rgba(0,120,200,0.06)';ctx.lineWidth=1
    for(let i=0;i<=5;i++){const y=H*i/5;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    for(let i=0;i<=7;i++){const x=W*i/7;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
    const vH=H*.18,cH=H*.76
    const pr=data.flatMap(d=>[d.h,d.l]);const mn=Math.min(...pr),mx=Math.max(...pr),rng=mx-mn||1
    const cw=Math.max(2,(W-20)/data.length-1),mvol=Math.max(...data.map(d=>d.vol))
    data.forEach((d,i)=>{
      const x=10+i*(W-20)/data.length,bull=d.c>=d.o
      const vh=(d.vol/mvol)*(vH*.85);ctx.fillStyle=bull?'rgba(0,150,255,.2)':'rgba(255,70,70,.15)';ctx.fillRect(x,H-vh,cw,vh)
      const oy=cH*(mx-d.o)/rng,cy=cH*(mx-d.c)/rng,by=Math.min(oy,cy),bh=Math.max(Math.abs(oy-cy),1.5)
      if(bull){const gr=ctx.createLinearGradient(0,by,0,by+bh);gr.addColorStop(0,'rgba(0,180,255,.95)');gr.addColorStop(1,'rgba(0,100,200,.55)');ctx.fillStyle=gr}else ctx.fillStyle='rgba(220,60,60,.75)'
      ctx.fillRect(x,by,cw,bh)
      ctx.strokeStyle=bull?'rgba(0,170,255,.6)':'rgba(220,60,60,.5)';ctx.lineWidth=1
      ctx.beginPath();ctx.moveTo(x+cw/2,cH*(mx-d.h)/rng);ctx.lineTo(x+cw/2,cH*(mx-d.l)/rng);ctx.stroke()
    })
    const ld=data[data.length-1],pd=data[data.length-2]
    const lx=10+(data.length-1)*(W-20)/data.length,ly=cH*(mx-ld.c)/rng
    const gg=ctx.createRadialGradient(lx,ly,0,lx,ly,50);gg.addColorStop(0,'rgba(0,170,255,.18)');gg.addColorStop(1,'transparent');ctx.fillStyle=gg;ctx.fillRect(lx-50,ly-50,100,100)
    ctx.strokeStyle='rgba(0,150,255,.4)';ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(0,ly);ctx.lineTo(W,ly);ctx.stroke();ctx.setLineDash([])
    ctx.fillStyle='rgba(0,170,255,.5)';ctx.font='9px monospace'
    for(let i=0;i<=4;i++){const p=mn+(mx-mn)*i/4;ctx.fillText(p.toFixed(2),3,cH*(mx-p)/rng+4)}
    const chg=((ld.c-pd.c)/pd.c*100).toFixed(2)
    setPi({price:ld.c.toFixed(4),change:(parseFloat(chg)>0?'+':'')+chg+'%',up:parseFloat(chg)>=0})
  },[])

  useEffect(()=>{
    draw(); window.addEventListener('resize',draw)
    const tick=setInterval(()=>{Object.values(allData.current).forEach(d=>{const l=d[d.length-1];const v=(Math.random()-.48)*.018;const nc=l.c*(1+v);l.c=nc;l.h=Math.max(l.h,nc);l.l=Math.min(l.l,nc);l.vol+=Math.random()*8});draw()},1100)
    return()=>{window.removeEventListener('resize',draw);clearInterval(tick)}
  },[tf,draw])

  return (
    <div style={{background:'var(--card)',border:'1px solid var(--blue-border)',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,var(--blue),transparent)'}}/>
      <div style={{padding:'18px 22px',borderBottom:'1px solid var(--blue-border)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
        <div>
          <div style={{fontFamily:'var(--font-mono)',fontSize:'1.7rem',color:'#fff',display:'flex',alignItems:'baseline',gap:10}}>
            {pi.price}
            <span style={{fontSize:'.78rem',padding:'3px 10px',background:pi.up?'rgba(0,170,255,.1)':'rgba(255,60,60,.12)',color:pi.up?'var(--blue)':'#ff4444',fontFamily:'var(--font-mono)',letterSpacing:'.05em'}}>{pi.change}</span>
          </div>
          <div style={{fontSize:'.68rem',color:'var(--text-dim)',marginTop:4,fontFamily:'var(--font-mono)'}}>PUMP/XN · Pumps1...Szb2C</div>
        </div>
        <div style={{display:'flex',gap:3}}>
          {['1m','5m','1h','1d'].map(t=>(
            <button key={t} onClick={()=>setTf(t)} style={{padding:'5px 11px',fontFamily:'var(--font-mono)',fontSize:'.63rem',letterSpacing:'.08em',border:'1px solid',borderColor:tf===t?'var(--blue)':'var(--blue-border)',color:tf===t?'var(--blue)':'var(--text-dim)',background:tf===t?'rgba(0,170,255,.1)':'transparent',cursor:'pointer',transition:'all .2s'}}>{t.toUpperCase()}</button>
          ))}
        </div>
      </div>
      <div ref={boxRef} style={{height:340,padding:6}}><canvas ref={canvasRef} style={{width:'100%',height:'100%'}}/></div>
    </div>
  )
}
