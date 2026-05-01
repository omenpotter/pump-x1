'use client'
import { useEffect } from 'react'

export default function Cursor() {
  useEffect(() => {
    const cur = document.getElementById('cur') as HTMLElement
    const cur2 = document.getElementById('cur2') as HTMLElement
    let mx = 0, my = 0, cx = 0, cy = 0
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; cur.style.left = mx+'px'; cur.style.top = my+'px' }
    document.addEventListener('mousemove', onMove)
    let raf: number
    const lerp = () => { cx+=(mx-cx)*.13; cy+=(my-cy)*.13; cur2.style.left=cx+'px'; cur2.style.top=cy+'px'; raf=requestAnimationFrame(lerp) }
    raf = requestAnimationFrame(lerp)
    const grow = () => { cur.style.width='20px'; cur.style.height='20px'; cur2.style.width='56px'; cur2.style.height='56px' }
    const shrink = () => { cur.style.width='12px'; cur.style.height='12px'; cur2.style.width='36px'; cur2.style.height='36px' }
    document.querySelectorAll('a,button,.card-hover').forEach(el => { el.addEventListener('mouseenter', grow); el.addEventListener('mouseleave', shrink) })
    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])
  return (
    <>
      <div id="cur" style={{position:'fixed',borderRadius:'50%',pointerEvents:'none',zIndex:9999,transform:'translate(-50%,-50%)',mixBlendMode:'screen',width:12,height:12,background:'var(--blue)',transition:'width .15s,height .15s'}}/>
      <div id="cur2" style={{position:'fixed',borderRadius:'50%',pointerEvents:'none',zIndex:9998,transform:'translate(-50%,-50%)',width:36,height:36,border:'1px solid rgba(0,170,255,0.5)',opacity:.5,transition:'all .1s'}}/>
    </>
  )
}
