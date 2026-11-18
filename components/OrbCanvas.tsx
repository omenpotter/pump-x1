"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { BufferGeometry, Material, Texture } from "three";

const imagePath = "/pump-token.png";

// Scene geometry and texture atlas from app/layout.tsx at b416cd55.
export default function OrbCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const surface = canvas;
    let cancelled = false;
    let dispose = () => {};

    async function start() {
      const image = new window.Image();
      image.src = imagePath;
      const [THREE, { RoomEnvironment }] = await Promise.all([
        import("three"),
        import("three/addons/environments/RoomEnvironment.js"),
        image.decode(),
      ]);
      if (cancelled) return;

      const atlas = document.createElement("canvas");
      atlas.width = 2048;
      atlas.height = 1024;
      const context = atlas.getContext("2d");
      if (!context) return;
      context.fillStyle = "#010810";
      context.fillRect(0, 0, atlas.width, atlas.height);
      const tile = atlas.width / 4;
      const padding = tile * .06;
      for (let row = 0; row < 2; row++) {
        for (let column = 0; column < 4; column++) {
          const x = column * tile;
          const y = row * tile;
          const glow = context.createRadialGradient(x + tile / 2, y + tile / 2, 0, x + tile / 2, y + tile / 2, tile * .55);
          glow.addColorStop(0, "rgba(0,100,255,.3)");
          glow.addColorStop(1, "transparent");
          context.fillStyle = glow;
          context.fillRect(x, y, tile, tile);
          context.drawImage(image, x + padding, y + padding / 2, tile - padding * 2, tile - padding);
        }
      }

      const renderer = new THREE.WebGLRenderer({ canvas: surface, alpha: true, antialias: true });
      dispose = () => renderer.dispose();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.5;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, .1, 100);
      camera.position.z = 3.6;
      const texture = new THREE.CanvasTexture(atlas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

      const environment = new RoomEnvironment();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const reflection = pmrem.fromScene(environment, .055);
      environment.dispose();
      pmrem.dispose();

      scene.add(new THREE.AmbientLight(0x001840, 3));
      const key = new THREE.PointLight(0x0088ff, 16, 10);
      key.position.set(2, 2, 3);
      const rim = new THREE.PointLight(0x00ccff, 9, 8);
      rim.position.set(-2, -1, 1);
      const fill = new THREE.PointLight(0xd5f4ff, 10, 8);
      fill.position.set(1, 2, 3);
      const back = new THREE.PointLight(0x003399, 8, 8);
      back.position.set(-1, 1, -3);
      scene.add(key, rim, fill, back);

      const globe = new THREE.Mesh(new THREE.SphereGeometry(1, 80, 80), new THREE.MeshStandardMaterial({
        map: texture, roughness: .05, metalness: .88, emissiveMap: texture,
        emissive: 0x001133, emissiveIntensity: .32, envMap: reflection.texture, envMapIntensity: .34,
      }));
      globe.rotation.set(Math.PI / 4, Math.PI / 4, 0);
      scene.add(globe);

      for (const [radius, color, opacity] of [[1.07, 0x0044bb, .12], [1.28, 0x002266, .045], [1.04, 0x0099ff, .16]]) {
        scene.add(new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), new THREE.MeshBasicMaterial({
          color, transparent: true, opacity, side: THREE.BackSide, depthWrite: false,
          blending: THREE.AdditiveBlending,
        })));
      }

      const orbits = [
        { radius: 1.44, tube: .009, color: 0x0099ff, opacity: .85, angle: [Math.PI / 3, 0, 0], speed: [0, 0, .007] },
        { radius: 1.72, tube: .007, color: 0x00ccff, opacity: .5, angle: [Math.PI / 1.6, Math.PI / 4, 0], speed: [.005, .003, 0] },
        { radius: 1.58, tube: .005, color: 0x0055cc, opacity: .32, angle: [0, 0, Math.PI / 2.5], speed: [.006, 0, -.004] },
        { radius: 1.88, tube: .004, color: 0x003388, opacity: .2, angle: [Math.PI / 2.2, Math.PI / 3, Math.PI / 5], speed: [0, .003, .002] },
        { radius: 2.05, tube: .003, color: 0x0022aa, opacity: .12, angle: [Math.PI / 4, Math.PI / 5, 0], speed: [.002, .003, 0] },
      ].map(({ radius, tube, color, opacity, angle, speed }) => {
        const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 2, 100), new THREE.MeshBasicMaterial({
          color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending,
        }));
        mesh.rotation.set(angle[0], angle[1], angle[2]);
        scene.add(mesh);
        return { mesh, speed, opacity };
      });

      const particleGeometry = new THREE.SphereGeometry(.027, 8, 8);
      const particles = Array.from({ length: 22 }, (_, index) => {
        const mesh = new THREE.Mesh(particleGeometry, new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(.57 + Math.random() * .08, 1, .65),
          transparent: true, opacity: .7, depthWrite: false, blending: THREE.AdditiveBlending,
        }));
        scene.add(mesh);
        return {
          mesh, angle: index / 22 * Math.PI * 2, speed: .006 + Math.random() * .007,
          radius: 1.46 + Math.random() * .22, vertical: Math.random() * .55 - .27, phase: Math.random() * Math.PI * 2,
        };
      });

      const motion = matchMedia("(prefers-reduced-motion: reduce)");
      let frame = 0;
      let previousFrame = 0;
      let time = 0;
      let visible = false;
      let contextLost = false;
      let displayed = false;
      const pointer = new THREE.Vector2();
      const target = new THREE.Vector2();
      const onPointer = (event: PointerEvent) => target.set(
        (event.clientX / innerWidth - .5) * .9, (event.clientY / innerHeight - .5) * .9,
      );

      function draw(now: number) {
        frame = 0;
        if (!visible || document.hidden || contextLost) return;
        const delta = previousFrame && !motion.matches ? Math.min((now - previousFrame) / 1000, .033) : 0;
        previousFrame = now;
        time += delta;
        const step = delta * 60;
        pointer.lerp(target, 1 - Math.exp(-7 * delta));
        globe.rotation.y += (.003 + pointer.x * .005) * step;
        globe.rotation.x += (.0005 + pointer.y * .003) * step;
        orbits.forEach(({ mesh, speed, opacity }, i) => {
          mesh.rotation.x += speed[0] * step;
          mesh.rotation.y += speed[1] * step;
          mesh.rotation.z += speed[2] * step;
          mesh.material.opacity = opacity * (.9 + .1 * Math.cos(time * .9 + i));
        });
        for (const particle of particles) {
          particle.angle += particle.speed * step;
          particle.mesh.position.set(
            Math.cos(particle.angle) * particle.radius,
            Math.sin(particle.angle * 1.3) * particle.vertical + Math.sin(time + particle.phase) * .12,
            Math.sin(particle.angle) * particle.radius * .55,
          );
          particle.mesh.material.opacity = .25 + .6 * Math.abs(Math.sin(time * 1.5 + particle.phase));
        }
        key.position.set(2.2 + Math.sin(time * .5), 2 + Math.cos(time * .4), 3);
        key.intensity = 16 + Math.sin(time * 2) * 3;
        rim.intensity = 9 + Math.cos(time * 1.4) * 2;
        renderer.render(scene, camera);
        if (!displayed) {
          displayed = true;
          setReady(true);
        }
        if (!motion.matches) frame = requestAnimationFrame(draw);
      }

      const update = () => {
        cancelAnimationFrame(frame);
        previousFrame = 0;
        if (visible && !document.hidden && !contextLost) frame = requestAnimationFrame(draw);
      };
      const resize = () => {
        const { clientWidth: width, clientHeight: height } = surface;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        update();
      };
      const resizeObserver = new ResizeObserver(resize);
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        update();
      });
      const onLost = () => {
        contextLost = true;
        displayed = false;
        setReady(false);
        update();
      };
      const onRestored = () => {
        contextLost = false;
        update();
      };
      resize();
      resizeObserver.observe(surface);
      visibilityObserver.observe(surface);
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("visibilitychange", update);
      motion.addEventListener("change", update);
      surface.addEventListener("webglcontextlost", onLost);
      surface.addEventListener("webglcontextrestored", onRestored);

      dispose = () => {
        cancelAnimationFrame(frame);
        visibilityObserver.disconnect();
        resizeObserver.disconnect();
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("visibilitychange", update);
        motion.removeEventListener("change", update);
        surface.removeEventListener("webglcontextlost", onLost);
        surface.removeEventListener("webglcontextrestored", onRestored);
        const resources = new Set<BufferGeometry | Material | Texture>([texture]);
        scene.traverse(object => {
          if (object instanceof THREE.Mesh) {
            resources.add(object.geometry);
            for (const material of Array.isArray(object.material) ? object.material : [object.material]) resources.add(material);
          }
        });
        resources.forEach(resource => resource.dispose());
        reflection.dispose();
        renderer.dispose();
      };
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        void start().catch(() => dispose());
      }
    });
    observer.observe(surface);
    return () => {
      cancelled = true;
      observer.disconnect();
      dispose();
    };
  }, []);

  return (
    <div className="orb-visual" data-globe={ready ? "ready" : "fallback"}>
      <Image src={imagePath} alt="PUMP token logo" width={320} height={320}
        className={ready ? "orb-logo orb-logo--hidden" : "orb-logo"} priority />
      <canvas ref={canvasRef} className="orb-canvas" aria-hidden="true" />
    </div>
  );
}
