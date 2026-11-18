"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function OrbCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let dispose = () => {};
    const start = async () => {
      const THREE = await import("three");
      if (cancelled) return;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
      camera.position.z = 4.8;
      const texture = new THREE.TextureLoader().load("/pump-token.png", () => {
        if (!cancelled) setReady(true);
      });
      texture.colorSpace = THREE.SRGBColorSpace;
      const sphereGeometry = new THREE.SphereGeometry(1, 48, 32);
      const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
      const globe = new THREE.Mesh(sphereGeometry, sphereMaterial);
      scene.add(globe);
      const ringGeometry = new THREE.TorusGeometry(1.32, 0.006, 4, 72);
      const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.52 });
      const rings = new THREE.Group();
      for (const angle of [-0.9, 0.24, 1.1]) {
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.set(angle, 0.4, angle);
        rings.add(ring);
      }
      scene.add(rings);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      const resize = new ResizeObserver(() => renderer.setSize(canvas.clientWidth, canvas.clientHeight, false));
      resize.observe(canvas);
      const motion = matchMedia("(prefers-reduced-motion: reduce)");
      let visible = false;
      let frame = 0;
      const render = (time: number) => {
        globe.rotation.y = time * 0.00023;
        rings.rotation.y = time * 0.00012;
        renderer.render(scene, camera);
        frame = requestAnimationFrame(render);
      };
      const update = () => {
        cancelAnimationFrame(frame);
        if (visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(render);
        else if (visible && !document.hidden) renderer.render(scene, camera);
      };
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        update();
      });
      observer.observe(canvas);
      document.addEventListener("visibilitychange", update);
      motion.addEventListener("change", update);
      dispose = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        resize.disconnect();
        document.removeEventListener("visibilitychange", update);
        motion.removeEventListener("change", update);
        texture.dispose();
        sphereGeometry.dispose();
        sphereMaterial.dispose();
        ringGeometry.dispose();
        ringMaterial.dispose();
        renderer.dispose();
      };
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        void start().catch(() => {});
      }
    });
    observer.observe(canvas);
    return () => {
      cancelled = true;
      observer.disconnect();
      dispose();
    };
  }, []);
  return (
    <div className="orb-visual">
      <Image src="/pump-token.png" alt="PUMP token logo" width={320} height={320}
        className={ready ? "orb-logo orb-logo--hidden" : "orb-logo"} priority />
      <canvas ref={canvasRef} className="orb-canvas" aria-hidden="true" />
    </div>
  );
}
