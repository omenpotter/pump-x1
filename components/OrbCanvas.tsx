"use client";
import { useEffect, useRef } from "react";

export default function OrbCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const wrap   = wrapRef.current!;

    // Measure real pixel size BEFORE Three.js touches the canvas.
    // clientWidth is 0 during Vercel SSR/static phase — getBoundingClientRect fixes that.
    const SIZE = Math.round(Math.min(wrap.getBoundingClientRect().width || 520, 520));
    canvas.width  = SIZE;
    canvas.height = SIZE;

    // All Three.js objects are typed as `any` because THREE is a dynamic import.
    // TypeScript cannot resolve its namespace at compile time.
    let raf = 0;
    let dispose: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");

      const scene    = new THREE.Scene();
      const camera   = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 3.6;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(SIZE, SIZE, false); // false = don't touch canvas CSS size
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.5;

      // ── Lights ──
      scene.add(new THREE.AmbientLight(0x001840, 3));
      const pl1: any = new THREE.PointLight(0x0088ff, 6, 10); pl1.position.set(2, 2, 3);   scene.add(pl1);
      const pl2: any = new THREE.PointLight(0x00ccff, 3, 8);  pl2.position.set(-2, -1, 1); scene.add(pl2);
      scene.add(new THREE.PointLight(0xffffff, 2.5, 6));
      scene.add(new THREE.PointLight(0x003399, 2, 6));

      // ── Sphere texture: PUMP pill image tiled 4×2 equirectangular map ──
      const tW = 2048, tH = 1024;
      const tCvs = document.createElement("canvas");
      tCvs.width = tW; tCvs.height = tH;
      const tCtx = tCvs.getContext("2d")!;
      tCtx.fillStyle = "#010810";
      tCtx.fillRect(0, 0, tW, tH);
      const tex: any = new THREE.CanvasTexture(tCvs);

      const pImg = new Image();
      pImg.crossOrigin = "anonymous";
      pImg.src = "/pump-token.png";
      pImg.onload = () => {
        tCtx.fillStyle = "#010810";
        tCtx.fillRect(0, 0, tW, tH);
        const cols = 4, rows = 2, cw = tW / cols, ch = tH / rows;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cx = c * cw + cw / 2, cy = r * ch + ch / 2;
            const grd = tCtx.createRadialGradient(cx, cy, 0, cx, cy, cw * .55);
            grd.addColorStop(0, "rgba(0,100,255,.3)");
            grd.addColorStop(1, "transparent");
            tCtx.fillStyle = grd;
            tCtx.fillRect(c * cw, r * ch, cw, ch);
            const pad = cw * .06;
            tCtx.drawImage(pImg, c * cw + pad, r * ch + pad * .5, cw - pad * 2, ch - pad);
          }
        }
        tex.needsUpdate = true;
      };

      // ── Main sphere ──
      const geo: any = new THREE.SphereGeometry(1, 80, 80);
      const mat: any = new THREE.MeshStandardMaterial({
        map: tex, roughness: .05, metalness: .88,
        emissiveMap: tex, emissive: new THREE.Color(0x001133), emissiveIntensity: .2,
      });
      const sphere: any = new THREE.Mesh(geo, mat);
      scene.add(sphere);

      // ── Atmosphere shells ──
      const shell = (r: number, col: number, op: number) =>
        scene.add(new THREE.Mesh(
          new THREE.SphereGeometry(r, 32, 32),
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, side: THREE.BackSide })
        ));
      shell(1.07, 0x0044bb, .09);
      shell(1.28, 0x002266, .04);
      shell(1.04, 0x0099ff, .13);

      // ── Orbit rings ──
      const addRing = (r: number, th: number, col: number, op: number, rx: number, ry: number, rz: number): any => {
        const m: any = new THREE.Mesh(
          new THREE.TorusGeometry(r, th, 2, 100),
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op })
        );
        m.rotation.set(rx, ry, rz);
        scene.add(m);
        return m;
      };
      const r1 = addRing(1.44, .009, 0x0099ff, .85, Math.PI / 3,   0,           0);
      const r2 = addRing(1.72, .007, 0x00ccff, .5,  Math.PI / 1.6, Math.PI / 4, 0);
      const r3 = addRing(1.58, .005, 0x0055cc, .32, 0,             0,           Math.PI / 2.5);
      const r4 = addRing(1.88, .004, 0x003388, .2,  Math.PI / 2.2, Math.PI / 3, Math.PI / 5);
      const r5 = addRing(2.05, .003, 0x0022aa, .12, Math.PI / 4,   Math.PI / 5, 0);

      // ── Floating particles — all typed as any[] ──
      const dg: any = new THREE.SphereGeometry(.027, 8, 8);
      const dots: any[] = [];
      for (let i = 0; i < 22; i++) {
        const dm: any = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(.57 + Math.random() * .08, 1, .65),
          transparent: true, opacity: .7,
        });
        const d: any = new THREE.Mesh(dg, dm);
        dots.push({
          m: d,
          a:   (i / 22) * Math.PI * 2,
          sp:  .006 + Math.random() * .007,
          rad: 1.46 + Math.random() * .22,
          yz:  Math.random() * .55 - .27,
          ph:  Math.random() * Math.PI * 2,
        });
        scene.add(d);
      }

      // ── Mouse reactive tilt ──
      let omx = 0, omy = 0;
      const onMove = (e: MouseEvent) => {
        omx = (e.clientX / innerWidth  - .5) * .9;
        omy = (e.clientY / innerHeight - .5) * .9;
      };
      window.addEventListener("mousemove", onMove);

      // ── Render loop ──
      const clk: any = new THREE.Clock();
      const animate = () => {
        raf = requestAnimationFrame(animate);
        const t: number = clk.getElapsedTime();
        sphere.rotation.y += .003 + omx * .005;
        sphere.rotation.x += .0005 + omy * .003;
        r1.rotation.z += .007;
        r2.rotation.x += .005; r2.rotation.y += .003;
        r3.rotation.x += .006; r3.rotation.z -= .004;
        r4.rotation.y += .003; r4.rotation.z += .002;
        r5.rotation.x += .002; r5.rotation.y += .003;
        dots.forEach((d: any) => {
          d.a += d.sp;
          d.m.position.x = Math.cos(d.a) * d.rad;
          d.m.position.y = Math.sin(d.a * 1.3) * d.yz + Math.sin(t + d.ph) * .12;
          d.m.position.z = Math.sin(d.a) * d.rad * .55;
          d.m.material.opacity = .25 + .6 * Math.abs(Math.sin(t * 1.5 + d.ph));
        });
        pl1.position.x = 2.2 + Math.sin(t * .5);
        pl1.position.y = 2   + Math.cos(t * .4);
        pl1.intensity  = 5   + Math.sin(t * 2) * 1.5;
        pl2.intensity  = 2.8 + Math.cos(t * 1.4) * .9;
        renderer.render(scene, camera);
      };
      animate();

      dispose = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("mousemove", onMove);
        renderer.dispose();
      };
    })();

    return () => { dispose?.(); };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{ width: "min(520px, 88vw)", aspectRatio: "1 / 1", position: "relative" }}
    >
      <canvas
        ref={ref}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
