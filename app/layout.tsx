import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://pump-x1.vercel.app'),
  title: 'PUMP — Pump It On X1',
  description: 'The viral token movement of X1 Mainnet. Token-2022 standard. Fixed supply. Community-first.',
  keywords: ['PUMP', 'X1', 'X1 Mainnet', 'Token-2022', 'crypto', 'SVM'],
  openGraph: {
    title: 'PUMP — Pump It On X1',
    description: 'The viral token movement of X1 Mainnet.',
    url: 'https://pump-x1.vercel.app',
    siteName: 'PUMP X1',
    images: [{ url: '/pump-token.png', width: 1200, height: 630, alt: 'PUMP Token on X1' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PUMP — Pump It On X1',
    description: 'The viral token movement of X1 Mainnet.',
    images: ['/pump-token.png'],
  },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
}

const globeScript = `
(function() {
  function initGlobe() {
    var canvas = document.getElementById('orb-canvas');
    if (!canvas || canvas.__threeStarted) return;
    if (!window.THREE) return;
    canvas.__threeStarted = true;
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
    var pl1 = new THREE.PointLight(0x0088ff, 6, 10); pl1.position.set(2, 2, 3); scene.add(pl1);
    var pl2 = new THREE.PointLight(0x00ccff, 3, 8);  pl2.position.set(-2,-1, 1); scene.add(pl2);
    scene.add(new THREE.PointLight(0xffffff, 2.5, 6));
    scene.add(new THREE.PointLight(0x003399, 2, 6));

    var tW = 2048, tH = 1024;
    var tCvs = document.createElement('canvas');
    tCvs.width = tW; tCvs.height = tH;
    var tCtx = tCvs.getContext('2d');
    tCtx.fillStyle = '#010810'; tCtx.fillRect(0,0,tW,tH);
    var tex = new THREE.CanvasTexture(tCvs);
    var pImg = new Image();
    pImg.src = '/pump-token.png';
    pImg.onload = function() {
      tCtx.fillStyle='#010810'; tCtx.fillRect(0,0,tW,tH);
      var cols=4,rows=2,cw=tW/cols,ch=tH/rows;
      for(var r=0;r<rows;r++){for(var c=0;c<cols;c++){
        var cx=c*cw+cw/2,cy=r*ch+ch/2;
        var grd=tCtx.createRadialGradient(cx,cy,0,cx,cy,cw*.55);
        grd.addColorStop(0,'rgba(0,100,255,.3)');grd.addColorStop(1,'transparent');
        tCtx.fillStyle=grd;tCtx.fillRect(c*cw,r*ch,cw,ch);
        var pad=cw*.06;tCtx.drawImage(pImg,c*cw+pad,r*ch+pad*.5,cw-pad*2,ch-pad);
      }}
      tex.needsUpdate=true;
    };

    var mat = new THREE.MeshStandardMaterial({map:tex,roughness:.05,metalness:.88,emissiveMap:tex,emissive:new THREE.Color(0x001133),emissiveIntensity:.2});
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(1,80,80), mat);
    scene.add(sphere);

    function sh(r,col,op){scene.add(new THREE.Mesh(new THREE.SphereGeometry(r,32,32),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,side:THREE.BackSide})));}
    sh(1.07,0x0044bb,.09);sh(1.28,0x002266,.04);sh(1.04,0x0099ff,.13);

    function rng(r,th,col,op,rx,ry,rz){var m=new THREE.Mesh(new THREE.TorusGeometry(r,th,2,100),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op}));m.rotation.set(rx,ry,rz);scene.add(m);return m;}
    var r1=rng(1.44,.009,0x0099ff,.85,Math.PI/3,0,0);
    var r2=rng(1.72,.007,0x00ccff,.5,Math.PI/1.6,Math.PI/4,0);
    var r3=rng(1.58,.005,0x0055cc,.32,0,0,Math.PI/2.5);
    var r4=rng(1.88,.004,0x003388,.2,Math.PI/2.2,Math.PI/3,Math.PI/5);
    var r5=rng(2.05,.003,0x0022aa,.12,Math.PI/4,Math.PI/5,0);

    var dg=new THREE.SphereGeometry(.027,8,8);var dots=[];
    for(var i=0;i<22;i++){
      var dm=new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(.57+Math.random()*.08,1,.65),transparent:true,opacity:.7});
      var d=new THREE.Mesh(dg,dm);
      dots.push({m:d,a:(i/22)*Math.PI*2,sp:.006+Math.random()*.007,rad:1.46+Math.random()*.22,yz:Math.random()*.55-.27,ph:Math.random()*Math.PI*2});
      scene.add(d);
    }

    var omx=0,omy=0;
    window.addEventListener('mousemove',function(e){omx=(e.clientX/window.innerWidth-.5)*.9;omy=(e.clientY/window.innerHeight-.5)*.9;});

    var clk=new THREE.Clock();
    function animate(){
      requestAnimationFrame(animate);
      var t=clk.getElapsedTime();
      sphere.rotation.y+=.003+omx*.005;sphere.rotation.x+=.0005+omy*.003;
      r1.rotation.z+=.007;r2.rotation.x+=.005;r2.rotation.y+=.003;
      r3.rotation.x+=.006;r3.rotation.z-=.004;r4.rotation.y+=.003;r4.rotation.z+=.002;r5.rotation.x+=.002;r5.rotation.y+=.003;
      for(var i=0;i<dots.length;i++){var d=dots[i];d.a+=d.sp;
        d.m.position.x=Math.cos(d.a)*d.rad;
        d.m.position.y=Math.sin(d.a*1.3)*d.yz+Math.sin(t+d.ph)*.12;
        d.m.position.z=Math.sin(d.a)*d.rad*.55;
        d.m.material.opacity=.25+.6*Math.abs(Math.sin(t*1.5+d.ph));
      }
      pl1.position.x=2.2+Math.sin(t*.5);pl1.position.y=2+Math.cos(t*.4);
      pl1.intensity=5+Math.sin(t*2)*1.5;pl2.intensity=2.8+Math.cos(t*1.4)*.9;
      renderer.render(scene,camera);
    }
    animate();
  }

  var tries = 0;
  var iv = setInterval(function() {
    tries++;
    var canvas = document.getElementById('orb-canvas');
    if (canvas && window.THREE) {
      clearInterval(iv);
      initGlobe();
    }
    if (tries > 100) clearInterval(iv);
  }, 100);
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" />
        <style>{`#orb-canvas{width:520px;height:520px;max-width:88vw;display:block;}`}</style>
      </head>
      <body>
        {children}
        <Analytics />
        {/*
          Globe init lives here in layout — NOT inside a dynamic() component.
          Scripts inside dynamic() components are stripped by React during hydration.
          The interval polls until THREE is loaded AND the canvas is in the DOM.
        */}
        <script dangerouslySetInnerHTML={{ __html: globeScript }} />
      </body>
    </html>
  )
}
