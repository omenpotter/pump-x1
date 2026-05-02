'use client'
import { useEffect, useRef } from 'react'

export default function OrbCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let animId: number
    const init = async () => {
      const THREE = await import('three')
      const canvas = canvasRef.current
      if (!canvas) return

      // Wait one animation frame so clientWidth is non-zero
      await new Promise<void>(r => requestAnimationFrame(() => r()))

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
      camera.position.z = 3.6

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      // canvas has explicit width:520 height:520 in style — clientWidth = 520 here
      const W = canvas.clientWidth || 520
      const H = canvas.clientHeight || 520
      renderer.setSize(W, H, false)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.5

      scene.add(new THREE.AmbientLight(0x001840, 3))
      const pl1 = new THREE.PointLight(0x0088ff, 6, 10); pl1.position.set(2, 2, 3); scene.add(pl1)
      const pl2 = new THREE.PointLight(0x00ccff, 3, 8);  pl2.position.set(-2, -1, 1); scene.add(pl2)
      scene.add(new THREE.PointLight(0xffffff, 2.5, 6))
      scene.add(new THREE.PointLight(0x003399, 2, 6))

      const tW = 2048, tH = 1024
      const tCvs = document.createElement('canvas')
      tCvs.width = tW; tCvs.height = tH
      const tCtx = tCvs.getContext('2d')!
      const tex = new THREE.CanvasTexture(tCvs)

      const pImg = new Image()
      pImg.src = '/pump-token.png'
      const buildTex = () => {
        tCtx.fillStyle = '#010810'
        tCtx.fillRect(0, 0, tW, tH)
        const cols = 4, rows = 2, cw = tW / cols, ch = tH / rows
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cx = c * cw + cw / 2, cy = r * ch + ch / 2
            const grd = tCtx.createRadialGradient(cx, cy, 0, cx, cy, cw * 0.55)
            grd.addColorStop(0, 'rgba(0,100,255,.3)')
            grd.addColorStop(1, 'transparent')
            tCtx.fillStyle = grd
            tCtx.fillRect(c * cw, r * ch, cw, ch)
            const pad = cw * 0.06
            tCtx.drawImage(pImg, c * cw + pad, r * ch + pad * 0.5, cw - pad * 2, ch - pad)
          }
        }
        tex.needsUpdate = true
      }
      pImg.onload = buildTex

      const geo = new THREE.SphereGeometry(1, 80, 80)
      const mat = new THREE.MeshStandardMaterial({
        map: tex, roughness: 0.05, metalness: 0.88,
        emissiveMap: tex, emissive: new THREE.Color(0x001133), emissiveIntensity: 0.2,
      })
      const sphere = new THREE.Mesh(geo, mat)
      scene.add(sphere)

      scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.07, 32, 32), new THREE.MeshBasicMaterial({ color: 0x0044bb, transparent: true, opacity: 0.09, side: THREE.BackSide })))
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.28, 32, 32), new THREE.MeshBasicMaterial({ color: 0x002266, transparent: true, opacity: 0.04, side: THREE.BackSide })))
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.04, 32, 32), new THREE.MeshBasicMaterial({ color: 0x0099ff, transparent: true, opacity: 0.13, side: THREE.BackSide })))

      const makeRing = (r: number, th: number, col: number, op: number, rx: number, ry: number, rz: number) => {
        const m = new THREE.Mesh(
          new THREE.TorusGeometry(r, th, 2, 100),
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op })
        )
        m.rotation.set(rx, ry, rz)
        scene.add(m)
        return m
      }
      const r1 = makeRing(1.44, 0.009, 0x0099ff, 0.85, Math.PI / 3,   0,           0)
      const r2 = makeRing(1.72, 0.007, 0x00ccff, 0.5,  Math.PI / 1.6, Math.PI / 4, 0)
      const r3 = makeRing(1.58, 0.005, 0x0055cc, 0.32, 0,             0,           Math.PI / 2.5)
      const r4 = makeRing(1.88, 0.004, 0x003388, 0.2,  Math.PI / 2.2, Math.PI / 3, Math.PI / 5)
      const r5 = makeRing(2.05, 0.003, 0x0022aa, 0.12, Math.PI / 4,   Math.PI / 5, 0)

      const dg = new THREE.SphereGeometry(0.027, 8, 8)
      // dots typed as any[] — THREE is a runtime import; avoid namespace type in outer scope
      const dots: any[] = []
      for (let i = 0; i < 22; i++) {
        const dm = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.57 + Math.random() * 0.08, 1, 0.65),
          transparent: true, opacity: 0.7,
        })
        const d = new THREE.Mesh(dg, dm)
        dots.push({ m: d, a: (i / 22) * Math.PI * 2, sp: 0.006 + Math.random() * 0.007, rad: 1.46 + Math.random() * 0.22, yz: Math.random() * 0.55 - 0.27, ph: Math.random() * Math.PI * 2 })
        scene.add(d)
      }

      let omx = 0, omy = 0
      const onMouse = (e: MouseEvent) => {
        omx = (e.clientX / window.innerWidth - 0.5) * 0.9
        omy = (e.clientY / window.innerHeight - 0.5) * 0.9
      }
      window.addEventListener('mousemove', onMouse)

      const clock = new THREE.Clock()
      const animate = () => {
        animId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()
        sphere.rotation.y += 0.003 + omx * 0.005
        sphere.rotation.x += 0.0005 + omy * 0.003
        r1.rotation.z += 0.007
        r2.rotation.x += 0.005; r2.rotation.y += 0.003
        r3.rotation.x += 0.006; r3.rotation.z -= 0.004
        r4.rotation.y += 0.003; r4.rotation.z += 0.002
        r5.rotation.x += 0.002; r5.rotation.y += 0.003
        dots.forEach((d: any) => {
          d.a += d.sp
          d.m.position.x = Math.cos(d.a) * d.rad
          d.m.position.y = Math.sin(d.a * 1.3) * d.yz + Math.sin(t + d.ph) * 0.12
          d.m.position.z = Math.sin(d.a) * d.rad * 0.55
          d.m.material.opacity = 0.25 + 0.6 * Math.abs(Math.sin(t * 1.5 + d.ph))
        })
        pl1.position.x = 2.2 + Math.sin(t * 0.5)
        pl1.position.y = 2 + Math.cos(t * 0.4)
        pl1.intensity = 5 + Math.sin(t * 2) * 1.5
        pl2.intensity = 2.8 + Math.cos(t * 1.4) * 0.9
        renderer.render(scene, camera)
      }
      animate()

      return () => {
        window.removeEventListener('mousemove', onMouse)
        cancelAnimationFrame(animId)
        renderer.dispose()
      }
    }
    init()
    return () => cancelAnimationFrame(animId)
  }, [])

  // KEY FIX: width and height set directly on <canvas> as inline style.
  // canvas.clientWidth = 520 the moment the DOM renders — no layout timing race.
  return (
    <canvas
      ref={canvasRef}
      style={{ width: 520, height: 520, maxWidth: '88vw', display: 'block' }}
    />
  )
}
