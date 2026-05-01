"use client";
import { useEffect, useRef } from "react";

export default function OrbCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const wrap = wrapRef.current!;

    // Hard-code the pixel size so Three.js always gets real numbers
    const SIZE = Math.min(wrap.getBoundingClientRect().width || 520, 520);
    canvas.width  = SIZE;
    canvas.height = SIZE;
    canvas.style.width  = SIZE + "px";
    canvas.style.height = SIZE + "px";

    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 3.6;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(SIZE, SIZE, false); // false = don't touch canvas CSS
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.5;

      // ── Lights ──
      scene.add(new THREE.AmbientLight(0x001840, 3));
      const pl1 = new THREE.PointLight(0x0088ff, 6, 10); pl1.position.set(2, 2, 3); scene.add(pl1);
      const pl2 = new THREE.PointLight(0x00ccff, 3, 8);  pl2.position.set(-2, -1, 1); scene.add(pl2);
      const pl3 = new THREE.PointLight(0xffffff, 2.5, 6); pl3.position.set(0, 0, 4); scene.add(pl3);
      const pl4 = new THREE.PointLight(0x003399, 2, 6);  pl4.position.set(0, -3, -2); scene.add(pl4);

      // ── Canvas texture: PUMP pill tiled 4×2 on equirectangular map ──
      const tW = 2048, tH = 1024;
      const tCvs = document.createElement("canvas");
      tCvs.width = tW; tCvs.height = tH;
      const tCtx = tCvs.getContext("2d")!;
      const tex = new THREE.CanvasTexture(tCvs);

      // Draw dark bg immediately so sphere has *something* while image loads
      tCtx.fillStyle = "#010810";
      tCtx.fillRect(0, 0, tW, tH);

      const pImg = new Image();
      pImg.crossOrigin = "anonymous";
      pImg.src = "/pump-token.png";
      pImg.onload = () => {
        tCtx.fillStyle = "#010810";
        tCtx.fillRect(0, 0, tW, tH);
        const cols = 4, rows = 2, cw = tW / cols, ch = tH / rows;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cx2 = c * cw + cw / 2, cy2 = r * ch + ch / 2;
            const grd = tCtx.createRadialGradient(cx2, cy2, 0, cx2, cy2, cw * .55);
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

      // ── Sphere ──
      const geo = new THREE.SphereGeometry(1, 80, 80);
      const mat = new THREE.MeshStandardMaterial({
        map: tex, roughness: .05, metalness: .88,
        emissiveMap: tex, emissive: new THREE.Color(0x001133), emissiveIntensity: .2,
      });
      const sphere = new THREE.Mesh(geo, mat);
      scene.add(sphere);

      // Atmosphere / rim layers
      const addShell = (r: number, col: number, op: number) =>
        scene.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32),
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, side: THREE.BackSide })));
      addShell(1.07, 0x0044bb, .09);
      addShell(1.28, 0x002266, .04);
      addShell(1.04, 0x0099ff, .13);

      // ── Orbit rings ──
      const addRing = (r: number, th: number, col: number, op: number, rx: number, ry: number, rz: number) => {
        const m = new THREE.Mesh(
          new THREE.TorusGeometry(r, th, 2, 100),
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op })
        );
        m.rotation.set(rx, ry, rz);
        scene.add(m);
        return m;
      };
      const r1 = addRing(1.44, .009, 0x0099ff, .85, Math.PI / 3, 0, 0);
      const r2 = addRing(1.72, .007, 0x00ccff, .5,  Math.PI / 1.6, Math.PI / 4, 0);
      const r3 = addRing(1.58, .005, 0x0055cc, .32, 0, 0, Math.PI / 2.5);
      const r4 = addRing(1.88, .004, 0x003388, .2,  Math.PI / 2.2, Math.PI / 3, Math.PI / 5);
      const r5 = addRing(2.05, .003, 0x0022aa, .12, Math.PI / 4, Math.PI / 5, 0);

      // ── Floating particles ──
      const dg = new THREE.SphereGeometry(.027, 8, 8);
      const dots: { m: THREE.Mesh; a: number; sp: number; rad: number; yz: number; ph: number }[] = [];
      for (let i = 0; i < 22; i++) {
        const dm = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(.57 + Math.random() * .08, 1, .65),
          transparent: true, opacity: .7,
        });
        const d = new THREE.Mesh(dg, dm);
        dots.push({ m: d, a: (i / 22) * Math.PI * 2, sp: .006 + Math.random() * .007, rad: 1.46 + Math.random() * .22, yz: Math.random() * .55 - .27, ph: Math.random() * Math.PI * 2 });
        scene.add(d);
      }

      // ── Mouse reactive tilt ──
      let omx = 0, omy = 0;
      const onMove = (e: MouseEvent) => {
        omx = (e.clientX / innerWidth  - .5) * .9;
        omy = (e.clientY / innerHeight - .5) * .9;
      };
      window.addEventListener("mousemove", onMove);

      // ── Animation loop ──
      const clk = new THREE.Clock();
      let raf = 0;
      const animate = () => {
        raf = requestAnimationFrame(animate);
        const t = clk.getElapsedTime();
        sphere.rotation.y += .003 + omx * .005;
        sphere.rotation.x += .0005 + omy * .003;
        r1.rotation.z += .007;
        r2.rotation.x += .005; r2.rotation.y += .003;
        r3.rotation.x += .006; r3.rotation.z -= .004;
        r4.rotation.y += .003; r4.rotation.z += .002;
        r5.rotation.x += .002; r5.rotation.y += .003;
        dots.forEach(d => {
          d.a += d.sp;
          d.m.position.x = Math.cos(d.a) * d.rad;
          d.m.position.y = Math.sin(d.a * 1.3) * d.yz + Math.sin(t + d.ph) * .12;
          d.m.position.z = Math.sin(d.a) * d.rad * .55;
          (d.m.material as THREE.MeshBasicMaterial).opacity = .25 + .6 * Math.abs(Math.sin(t * 1.5 + d.ph));
        });
        pl1.position.x = 2.2 + Math.sin(t * .5);
        pl1.position.y = 2   + Math.cos(t * .4);
        pl1.intensity  = 5   + Math.sin(t * 2) * 1.5;
        pl2.intensity  = 2.8 + Math.cos(t * 1.4) * .9;
        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("mousemove", onMove);
        renderer.dispose();
      };
    })();

    return () => { cleanup?.(); };
  }, []);

  return (
    <div ref={wrapRef} style={{ width: "min(520px, 88vw)", aspectRatio: "1", position: "relative" }}>
      <canvas ref={ref} style={{ display: "block" }} />
    </div>
  );
}
