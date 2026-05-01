'use client'
import { useEffect, useRef } from 'react'

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let animId: number
    const init = async () => {
      const THREE = await import('three')
      const canvas = canvasRef.current
      if (!canvas) return

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
      camera.position.z = 3.6
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.5

      scene.add(new THREE.AmbientLight(0x001840, 3))
      const pl1 = new THREE.PointLight(0x0088ff, 6, 10); pl1.position.set(2,2,3); scene.add(pl1)
      const pl2 = new THREE.PointLight(0x00ccff, 3, 8); pl2.position.set(-2,-1,1); scene.add(pl2)
      const pl3 = new THREE.PointLight(0xffffff, 2.5, 6); pl3.position.set(0,0,4); scene.add(pl3)
      const pl4 = new THREE.PointLight(0x003399, 2, 6); pl4.position.set(0,-3,-2); scene.add(pl4)

      // Build equirectangular texture with PUMP image tiled 4x2
      const tW=2048, tH=1024
      const tCvs = document.createElement('canvas'); tCvs.width=tW; tCvs.height=tH
      const tCtx = tCvs.getContext('2d')!
      const tex = new THREE.CanvasTexture(tCvs)

      const pImg = new Image()
      pImg.src = '/pump-token.png'
      const buildTex = () => {
        tCtx.fillStyle = '#010810'; tCtx.fillRect(0,0,tW,tH)
        const cols=4, rows=2, cw=tW/cols, ch=tH/rows
        for (let r=0; r<rows; r++) {
          for (let c=0; c<cols; c++) {
            const cx=c*cw+cw/2, cy=r*ch+ch/2
            const grd = tCtx.createRadialGradient(cx,cy,0,cx,cy,cw*.55)
            grd.addColorStop(0,'rgba(0,100,255,.3)'); grd.addColorStop(1,'transparent')
            tCtx.fillStyle=grd; tCtx.fillRect(c*cw,r*ch,cw,ch)
            const pad=cw*.06
            tCtx.drawImage(pImg, c*cw+pad, r*ch+pad*.5, cw-pad*2, ch-pad)
          }
        }
        tex.needsUpdate = true
      }
      pImg.onload = buildTex

      const geo = new THREE.SphereGeometry(1, 80, 80)
      const mat = new THREE.MeshStandardMaterial({
        map: tex, roughness: .05, metalness: .88, envMapIntensity: 3,
        emissiveMap: tex, emissive: new THREE.Color(0x001133), emissiveIntensity: .2,
      })
      const sphere = new THREE.Mesh(geo, mat); scene.add(sphere)

      scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.07,32,32), new THREE.MeshBasicMaterial({color:0x0044bb,transparent:true,opacity:.09,side:THREE.BackSide})))
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.28,32,32), new THREE.MeshBasicMaterial({color:0x002266,transparent:true,opacity:.04,side:THREE.BackSide})))
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.04,32,32), new THREE.MeshBasicMaterial({color:0x0099ff,transparent:true,opacity:.13,side:THREE.BackSide})))

      const makeRing = (r:number,th:number,col:number,op:number,rx:number,ry:number,rz:number) => {
        const m = new THREE.Mesh(new THREE.TorusGeometry(r,th,2,100), new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op}))
        m.rotation.set(rx,ry,rz); scene.add(m); return m
      }
      const r1=makeRing(1.44,.009,0x0099ff,.85,Math.PI/3,0,0)
      const r2=makeRing(1.72,.007,0x00ccff,.5,Math.PI/1.6,Math.PI/4,0)
      const r3=makeRing(1.58,.005,0x0055cc,.32,0,0,Math.PI/2.5)
      const r4=makeRing(1.88,.004,0x003388,.2,Math.PI/2.2,Math.PI/3,Math.PI/5)
      const r5=makeRing(2.05,.003,0x0022aa,.12,Math.PI/4,Math.PI/5,0)

      const dg = new THREE.SphereGeometry(.027,8,8)
      const dots: {m:import("three").Mesh;a:number;sp:number;rad:number;yz:number;ph:number}[] = []
      for (let i=0; i<22; i++) {
        const dm = new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(.57+Math.random()*.08,1,.65),transparent:true,opacity:.7})
        const d = new THREE.Mesh(dg, dm)
        dots.push({m:d,a:(i/22)*Math.PI*2,sp:.006+Math.random()*.007,rad:1.46+Math.random()*.22,yz:Math.random()*.55-.27,ph:Math.random()*Math.PI*2})
        scene.add(d)
      }

      let omx=0,omy=0
      const onMouse=(e:MouseEvent)=>{omx=(e.clientX/window.innerWidth-.5)*.9;omy=(e.clientY/window.innerHeight-.5)*.9}
      window.addEventListener('mousemove',onMouse)

      const clock = new THREE.Clock()
      const animate = () => {
        animId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()
        sphere.rotation.y += .003+omx*.005; sphere.rotation.x += .0005+omy*.003
        r1.rotation.z+=.007; r2.rotation.x+=.005; r2.rotation.y+=.003
        r3.rotation.x+=.006; r3.rotation.z-=.004
        r4.rotation.y+=.003; r4.rotation.z+=.002
        r5.rotation.x+=.002; r5.rotation.y+=.003
        dots.forEach(d=>{
          d.a+=d.sp
          d.m.position.x=Math.cos(d.a)*d.rad
          d.m.position.y=Math.sin(d.a*1.3)*d.yz+Math.sin(t+d.ph)*.12
          d.m.position.z=Math.sin(d.a)*d.rad*.55
          ;(d.m.material as import("three").MeshBasicMaterial).opacity=.25+.6*Math.abs(Math.sin(t*1.5+d.ph))
        })
        pl1.position.x=2.2+Math.sin(t*.5); pl1.position.y=2+Math.cos(t*.4)
        pl1.intensity=5+Math.sin(t*2)*1.5; pl2.intensity=2.8+Math.cos(t*1.4)*.9
        renderer.render(scene,camera)
      }
      animate()
      return () => { window.removeEventListener('mousemove',onMouse); cancelAnimationFrame(animId); renderer.dispose() }
    }
    init()
    return () => cancelAnimationFrame(animId)
  }, [])

  return <canvas ref={canvasRef} style={{width:520,height:520,maxWidth:'88vw',display:'block'}}/>
}
