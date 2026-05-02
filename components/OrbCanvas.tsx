'use client'

export default function OrbCanvas() {
  const globeScript = `
(function() {
  function initGlobe() {
    var canvas = document.getElementById('orb-canvas');
    if (!canvas || !window.THREE) return;
    var THREE = window.THREE;

    var W = canvas.clientWidth  || 520;
    var H = canvas.clientHeight || 520;

    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3.6;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;

    scene.add(new THREE.AmbientLight(0x001840, 3));
    var pl1 = new THREE.PointLight(0x0088ff, 6, 10);
    pl1.position.set(2, 2, 3); scene.add(pl1);
    var pl2 = new THREE.PointLight(0x00ccff, 3, 8);
    pl2.position.set(-2, -1, 1); scene.add(pl2);
    scene.add(new THREE.PointLight(0xffffff, 2.5, 6));
    scene.add(new THREE.PointLight(0x003399, 2, 6));

    var tW = 2048, tH = 1024;
    var tCvs = document.createElement('canvas');
    tCvs.width = tW; tCvs.height = tH;
    var tCtx = tCvs.getContext('2d');
    tCtx.fillStyle = '#010810';
    tCtx.fillRect(0, 0, tW, tH);
    var tex = new THREE.CanvasTexture(tCvs);

    var pImg = new Image();
    pImg.src = '/pump-token.png';
    pImg.onload = function() {
      tCtx.fillStyle = '#010810';
      tCtx.fillRect(0, 0, tW, tH);
      var cols = 4, rows = 2;
      var cw = tW / cols, ch = tH / rows;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var cx = c * cw + cw / 2;
          var cy = r * ch + ch / 2;
          var grd = tCtx.createRadialGradient(cx, cy, 0, cx, cy, cw * 0.55);
          grd.addColorStop(0, 'rgba(0,100,255,.3)');
          grd.addColorStop(1, 'transparent');
          tCtx.fillStyle = grd;
          tCtx.fillRect(c * cw, r * ch, cw, ch);
          var pad = cw * 0.06;
          tCtx.drawImage(pImg, c * cw + pad, r * ch + pad * 0.5, cw - pad * 2, ch - pad);
        }
      }
      tex.needsUpdate = true;
    };

    var mat = new THREE.MeshStandardMaterial({
      map:               tex,
      roughness:         0.05,
      metalness:         0.88,
      emissiveMap:       tex,
      emissive:          new THREE.Color(0x001133),
      emissiveIntensity: 0.2,
    });
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 80, 80), mat);
    scene.add(sphere);

    function addShell(r, color, opacity) {
      scene.add(new THREE.Mesh(
        new THREE.SphereGeometry(r, 32, 32),
        new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity, side: THREE.BackSide })
      ));
    }
    addShell(1.07, 0x0044bb, 0.09);
    addShell(1.28, 0x002266, 0.04);
    addShell(1.04, 0x0099ff, 0.13);

    function addRing(r, th, color, opacity, rx, ry, rz) {
      var m = new THREE.Mesh(
        new THREE.TorusGeometry(r, th, 2, 100),
        new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity })
      );
      m.rotation.set(rx, ry, rz);
      scene.add(m);
      return m;
    }
    var r1 = addRing(1.44, 0.009, 0x0099ff, 0.85, Math.PI / 3,   0,           0);
    var r2 = addRing(1.72, 0.007, 0x00ccff, 0.50, Math.PI / 1.6, Math.PI / 4, 0);
    var r3 = addRing(1.58, 0.005, 0x0055cc, 0.32, 0,             0,           Math.PI / 2.5);
    var r4 = addRing(1.88, 0.004, 0x003388, 0.20, Math.PI / 2.2, Math.PI / 3, Math.PI / 5);
    var r5 = addRing(2.05, 0.003, 0x0022aa, 0.12, Math.PI / 4,   Math.PI / 5, 0);

    var dotGeo = new THREE.SphereGeometry(0.027, 8, 8);
    var dots = [];
    for (var i = 0; i < 22; i++) {
      var dotMat = new THREE.MeshBasicMaterial({
        color:       new THREE.Color().setHSL(0.57 + Math.random() * 0.08, 1, 0.65),
        transparent: true,
        opacity:     0.7,
      });
      var mesh = new THREE.Mesh(dotGeo, dotMat);
      dots.push({
        m:   mesh,
        a:   (i / 22) * Math.PI * 2,
        sp:  0.006 + Math.random() * 0.007,
        rad: 1.46  + Math.random() * 0.22,
        yz:  Math.random() * 0.55 - 0.27,
        ph:  Math.random() * Math.PI * 2,
      });
      scene.add(mesh);
    }

    var omx = 0, omy = 0;
    function onMouse(e) {
      omx = (e.clientX / window.innerWidth  - 0.5) * 0.9;
      omy = (e.clientY / window.innerHeight - 0.5) * 0.9;
    }
    window.addEventListener('mousemove', onMouse);

    var clock = new THREE.Clock();
    var animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      sphere.rotation.y += 0.003 + omx * 0.005;
      sphere.rotation.x += 0.0005 + omy * 0.003;

      r1.rotation.z += 0.007;
      r2.rotation.x += 0.005; r2.rotation.y += 0.003;
      r3.rotation.x += 0.006; r3.rotation.z -= 0.004;
      r4.rotation.y += 0.003; r4.rotation.z += 0.002;
      r5.rotation.x += 0.002; r5.rotation.y += 0.003;

      for (var di = 0; di < dots.length; di++) {
        var d = dots[di];
        d.a += d.sp;
        d.m.position.x = Math.cos(d.a) * d.rad;
        d.m.position.y = Math.sin(d.a * 1.3) * d.yz + Math.sin(t + d.ph) * 0.12;
        d.m.position.z = Math.sin(d.a) * d.rad * 0.55;
        d.m.material.opacity = 0.25 + 0.6 * Math.abs(Math.sin(t * 1.5 + d.ph));
      }

      pl1.position.x = 2.2 + Math.sin(t * 0.5);
      pl1.position.y = 2.0 + Math.cos(t * 0.4);
      pl1.intensity  = 5.0 + Math.sin(t * 2.0) * 1.5;
      pl2.intensity  = 2.8 + Math.cos(t * 1.4) * 0.9;

      renderer.render(scene, camera);
    }
    animate();

    canvas.__threeCleanup = function() {
      window.removeEventListener('mousemove', onMouse);
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }

  if (window.THREE) {
    initGlobe();
  } else {
    var tries = 0;
    var interval = setInterval(function() {
      tries++;
      if (window.THREE) { clearInterval(interval); initGlobe(); }
      if (tries > 50)   { clearInterval(interval); }
    }, 100);
  }
})();
`

  return (
    <>
      <canvas id="orb-canvas" />
      <script dangerouslySetInnerHTML={{ __html: globeScript }} />
    </>
  )
}
