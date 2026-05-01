'use client'
import { useEffect, useRef } from 'react'
export default function HeroBackground() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!
    let W=0,H=0
    const resize=()=>{W=c.width=c.offsetWidth;H=c.height=c.offsetHeight}
    resize(); window.addEventListener('resize',resize)
    const pts=Array.from({length:90},()=>({x:Math.random()*2000-1000,y:Math.random()*1200-600,z:Math.random()*900+100,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,vz:-(Math.random()*.6+.3),s:Math.random()*2+.4}))
    let omx=0,omy=0
    const onMouse=(e:MouseEvent)=>{omx=e.clientX/innerWidth-.5;omy=e.clientY/innerHeight-.5}
    window.addEventListener('mousemove',onMouse)
    const fov=380; let raf:number
    const draw=()=>{
      ctx.clearRect(0,0,W,H)
      const hz=H*.52; ctx.strokeStyle='rgba(0,130,255,0.045)'; ctx.lineWidth=1
      for(let r=0;r<=18;r++){const z=r/18,y=hz+z*H*.6,xs=(1-z*.88)*W;ctx.beginPath();ctx.moveTo(W/2-xs/2,y);ctx.lineTo(W/2+xs/2,y);ctx.stroke()}
      for(let col=-14;col<=14;col++){ctx.beginPath();for(let r=0;r<=18;r++){const z=r/18,xs=1-z*.88,px=W/2+col*(W/28)*xs,py=hz+z*H*.6;r===0?ctx.moveTo(px,py):ctx.lineTo(px,py)}ctx.stroke()}
      const t=Date.now()*.0004,lx=W/2+Math.sin(t*.6)*W*.35
      const g=ctx.createRadialGradient(lx,H*.28,0,lx,H*.28,W*.45)
      g.addColorStop(0,'rgba(0,100,255,.05)');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)
      pts.forEach(p=>{p.z+=p.vz;p.x+=p.vx;p.y+=p.vy;if(p.z<1)p.z=900;const px=W/2+(p.x/p.z)*fov+omx*40,py=H/2+(p.y/p.z)*fov+omy*25,sz=p.s*(fov/p.z),al=Math.min(1,(900-p.z)/600)*.6;ctx.beginPath();ctx.arc(px,py,sz,0,Math.PI*2);ctx.fillStyle=`rgba(0,180,255,${al})`;ctx.fill()})
      raf=requestAnimationFrame(draw)
    }
    draw()
    return()=>{window.removeEventListener('resize',resize);window.removeEventListener('mousemove',onMouse);cancelAnimationFrame(raf)}
  },[])
  return <canvas ref={ref} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}}/>
}
