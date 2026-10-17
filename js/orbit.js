/* Exhibit C: photos and videos orbiting the memory planet. */
import { $, clamp, reduce, small } from './core.js';
import { sfx } from './audio.js';
import { ctex, dotTex, hasGL, makeRenderer } from './gl.js';

/* ================= MEMORY PLANET ================= */
/* Every file in photos/Exhibit C. The card title and the viewer caption are the file name.
   Order matters: the two videos "That Kind Heart" and "No Sun…" sit side by side on the orbit. */
export const MEM_DIR = 'photos/Exhibit C/';
export const MEM = [
  { name: 'That Innocent Face', file: 'That Innocent Face.jpeg', type: 'image', tint: '#F9C9D6' },
  { name: 'That Kind Heart', file: 'That Kind Heart.mp4', type: 'video', tint: '#FBE3AE' },
  { name: 'No Sun can beat the shine from her', file: 'No Sun can beat the shine from her.mp4', type: 'video', tint: '#C6F1EC' },
  { name: 'Most Beautful Expression on Earth', file: 'Most Beautful Expression on Earth.jpeg', type: 'image', tint: '#DCD3FF' },
  { name: 'beautipul girl', file: 'beautipul girl.mp4', type: 'video', tint: '#F9C9D6' },
  { name: 'Engliss Kissuu', file: 'Engliss Kissuu.jpeg', type: 'image', tint: '#FBE3AE' },
  { name: 'What Destiny is Telling You', file: 'What Destiny is Telling You.jpeg', type: 'image', tint: '#C6F1EC' }
];
MEM.forEach(m => { m.src = encodeURI(MEM_DIR + m.file); });
export const memSrc = [];
export const ICON_CAM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
export const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>';
// Wrap a caption into at most two lines, shrinking the font until it fits the card.
export function fitCaption(g, text, maxW){
  for (let s = 52; s >= 26; s -= 2){
    g.font = '700 ' + s + "px 'Caveat', cursive";
    const lines = []; let cur = '';
    text.split(' ').forEach(w => { const t = cur ? cur + ' ' + w : w; if (!cur || g.measureText(t).width <= maxW) cur = t; else { lines.push(cur); cur = w; } });
    if (cur) lines.push(cur);
    if (lines.length <= 2 && lines.every(l => g.measureText(l).width <= maxW)) return { s, lines };
  }
  return { s: 26, lines: [text] };
}
export function drawCard(g, i){
  const m = MEM[i], W = 512, H = 640; g.clearRect(0, 0, W, H); g.fillStyle = '#FFFDF7'; g.fillRect(0, 0, W, H);
  const px = 28, py = 28, pw = W - 56, ph = 456, src = memSrc[i];
  const iw = src && (src.videoWidth || src.naturalWidth), ih = src && (src.videoHeight || src.naturalHeight);
  if (iw && ih && (m.type === 'image' || src.readyState >= 2)){
    // cover-crop, biased toward the top third where faces usually are
    const s = Math.max(pw / iw, ph / ih), sw = pw / s, sh = ph / s;
    g.drawImage(src, (iw - sw) / 2, (ih - sh) * .3, sw, sh, px, py, pw, ph);
  } else {
    const gr = g.createLinearGradient(0, py, 0, py + ph); gr.addColorStop(0, m.tint); gr.addColorStop(1, '#FFFFFF'); g.fillStyle = gr; g.fillRect(px, py, pw, ph);
    g.fillStyle = 'rgba(29,26,44,.45)'; g.font = "600 26px 'Outfit', sans-serif"; g.textAlign = 'center'; g.fillText('loading memory…', W / 2, py + ph / 2);
  }
  if (m.type === 'video'){
    const cx = px + pw - 46, cy = py + 46; g.fillStyle = 'rgba(7,6,22,.72)'; g.beginPath(); g.arc(cx, cy, 30, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(255,111,145,.95)'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#FFF3E0'; g.beginPath(); g.moveTo(cx - 9, cy - 14); g.lineTo(cx + 15, cy); g.lineTo(cx - 9, cy + 14); g.closePath(); g.fill();
  }
  const fc = fitCaption(g, m.name, W - 56), lh = fc.s * .92, y0 = 562 - (fc.lines.length - 1) * lh / 2;
  g.fillStyle = '#1D1A2C'; g.textAlign = 'center'; g.textBaseline = 'middle'; fc.lines.forEach((l, k) => g.fillText(l, W / 2, y0 + k * lh)); g.textBaseline = 'alphabetic';
  g.save(); g.translate(W / 2, 22); g.rotate(-.06); g.fillStyle = 'rgba(245,199,107,.75)'; g.fillRect(-60, -16, 120, 34); g.restore();
}
export function initOrbit(openMem){
  const chips = $('#memChips');
  MEM.forEach((m, i) => { const b = document.createElement('button'); b.type = 'button'; if (m.type === 'video') b.classList.add('is-video'); b.innerHTML = (m.type === 'video' ? ICON_PLAY : ICON_CAM) + '<span></span>'; b.querySelector('span').textContent = m.name; b.setAttribute('aria-label', 'Open ' + (m.type === 'video' ? 'video' : 'photo') + ': ' + m.name); b.addEventListener('click', () => openMem(i)); chips.appendChild(b); });
  if (!hasGL){ $('#orbitStage').hidden = true; return null; }
  const canvas = $('#orbitCanvas'), stage = $('#orbitStage'), renderer = makeRenderer(canvas); if (!renderer){ stage.hidden = true; return null; }
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(42, 1, .1, 100); camera.position.set(0, 2.4, 11);
  scene.add(new THREE.AmbientLight(0x6A5AA8, .55));
  const sun = new THREE.DirectionalLight(0xFFF0DD, 1.3); sun.position.set(-6, 4, 6); scene.add(sun);
  const rimL = new THREE.DirectionalLight(0xFF7AB6, .9); rimL.position.set(6, -2, -6); scene.add(rimL);
  const ptex = ctex(512, 256, g => { const img = g.createImageData(512, 256), d = img.data, cols = [[60, 46, 140], [150, 96, 210], [255, 168, 205], [120, 190, 255], [90, 70, 170]]; for (let y = 0; y < 256; y++) for (let x = 0; x < 512; x++){ const v = Math.sin(y * .09 + Math.sin(x * .025) * 1.8 + Math.sin(x * .011 + y * .03) * 1.2) * .5 + .5, f = v * (cols.length - 1), i0 = Math.floor(f), i1 = Math.min(cols.length - 1, i0 + 1), t = f - i0, n = (Math.random() - .5) * 14, o = (y * 512 + x) * 4; for (let k = 0; k < 3; k++) d[o + k] = clamp(cols[i0][k] * (1 - t) + cols[i1][k] * t + n, 0, 255); d[o + 3] = 255; } g.putImageData(img, 0, 0); });
  const planet = new THREE.Mesh(new THREE.SphereGeometry(1.5, 64, 64), new THREE.MeshStandardMaterial({ map: ptex, roughness: .85 })); planet.rotation.z = .35; scene.add(planet);
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.72, 64, 64), new THREE.ShaderMaterial({ vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }', fragmentShader: 'varying vec3 vN; void main(){ float i = pow(0.72 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(1.0, 0.55, 0.8, 1.0) * i * 1.6; }', side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })));
  const lt = ctex(256, 128, g => { g.fillStyle = '#FFFFFF'; g.font = "700 64px 'Caveat', cursive"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 8; g.fillText('you', 128, 64); });
  const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: lt, transparent: true, depthTest: false })); label.scale.set(1.5, .75, 1); label.position.y = 2.15; label.renderOrder = 5; scene.add(label);
  const rt = ctex(512, 8, g => { for (let x = 0; x < 512; x++){ const a = (Math.sin(x * .09) * .3 + Math.sin(x * .023) * .3 + .45) * (x < 20 || x > 492 ? .2 : 1); g.fillStyle = 'rgba(255,220,240,' + clamp(a, 0, 1) * .55 + ')'; g.fillRect(x, 0, 1, 8); } });
  const ringGeo = new THREE.RingGeometry(2.1, 3.1, 128, 1), uv = ringGeo.attributes.uv, rp = ringGeo.attributes.position, v3 = new THREE.Vector3();
  for (let i = 0; i < uv.count; i++){ v3.fromBufferAttribute(rp, i); uv.setXY(i, (v3.length() - 2.1), .5); }
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ map: rt, side: THREE.DoubleSide, transparent: true, depthWrite: false })); ring.rotation.x = -Math.PI / 2 + .35; ring.rotation.y = .2; scene.add(ring);
  const dot = dotTex(), DN = 1500, dpp = new Float32Array(DN * 3);
  for (let i = 0; i < DN; i++){ const a = Math.random() * 6.283, r = 3.8 + Math.random() * 2.8; dpp[i*3] = Math.cos(a) * r * 1.25; dpp[i*3+1] = (Math.random() - .5) * .6; dpp[i*3+2] = Math.sin(a) * r * .75; }
  const dgg = new THREE.BufferGeometry(); dgg.setAttribute('position', new THREE.BufferAttribute(dpp, 3));
  const dust = new THREE.Points(dgg, new THREE.PointsMaterial({ map: dot, size: .06, color: 0xC9B8FF, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(dust);
  const cards = MEM.map((m, i) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 640; const g = cv.getContext('2d'); drawCard(g, i); const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4; const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 2.19), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0xF5C76B, transparent: true, opacity: .25, blending: THREE.AdditiveBlending, depthWrite: false })); gl.scale.set(3.1, 3.5, 1); gl.position.z = -.05; mesh.add(gl); mesh.userData = { i, g, tex }; scene.add(mesh); return mesh; });
  const redrawAll = () => { cards.forEach(c => { drawCard(c.userData.g, c.userData.i); c.userData.tex.needsUpdate = true; }); lt.userData.redraw(); };
  if (document.fonts && document.fonts.load) Promise.all([document.fonts.load("700 50px 'Caveat'"), document.fonts.load("600 26px 'Outfit'")]).then(redrawAll).catch(() => {});
  // Media loads only when the orbit gets close to the screen. Orbit videos are muted loops (required for autoplay).
  const vids = [];
  let mediaLoaded = false;
  function loadMedia(){
    if (mediaLoaded) return; mediaLoaded = true;
    MEM.forEach((m, i) => {
      const redraw = () => { drawCard(cards[i].userData.g, i); cards[i].userData.tex.needsUpdate = true; };
      if (m.type === 'image'){ const im = new Image(); im.decoding = 'async'; im.onload = () => { memSrc[i] = im; redraw(); }; im.src = m.src; return; }
      const v = document.createElement('video');
      v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
      v.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none;z-index:-1';
      v.addEventListener('loadeddata', () => { memSrc[i] = v; redraw(); });
      v.src = m.src; document.body.appendChild(v); vids.push({ v, i });
      if (visible){ const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    });
  }
  new IntersectionObserver(es => { if (es[0].isIntersecting) loadMedia(); }, { rootMargin: '900px 0px' }).observe(stage);
  let vidClock = 0;
  function size(){ const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.position.z = w < 560 ? 14.5 : 11; camera.lookAt(0, 0, 0); camera.updateProjectionMatrix(); }
  size(); addEventListener('resize', size);
  let base = 0, vel = 0, down = false, lastX = 0, moved = 0;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  stage.addEventListener('pointerdown', e => { down = true; lastX = e.clientX; moved = 0; });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx); vel = dx * .0045; base += vel; });
  addEventListener('pointercancel', () => { down = false; });
  addEventListener('pointerup', e => { if (!down) return; down = false; if (moved > 8 || !stage.contains(e.target)) return; const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(cards, false)[0]; if (hit){ sfx.chime(); openMem(hit.object.userData.i); } });
  let visible = false, raf = null, last = performance.now(), time = 0;
  function frame(now){
    const dt = Math.min((now - last) / 1000, .05); last = now; time += dt;
    if (!down){ vel *= Math.pow(.94, dt * 60); base += vel * dt * 60 + dt * (reduce ? .02 : .11); }
    const n = cards.length, rx = small() ? 4.1 : 5.1, rz = 3.1;
    cards.forEach((c, i) => { const a = base + i / n * Math.PI * 2; c.position.set(Math.cos(a) * rx, Math.sin(a * 2 + time * .6) * .3 + Math.sin(a) * .55, Math.sin(a) * rz); c.lookAt(camera.position); c.rotateZ(Math.sin(time * .8 + i) * .05); });
    planet.rotation.y += dt * .12; dust.rotation.y = -base * .4; ring.rotation.z += dt * .02;
    // repaint the live video cards ~24 times a second (cheaper than every frame, still smooth)
    vidClock += dt;
    if (vidClock > 1 / 24){ vidClock = 0; vids.forEach(({ v, i }) => { if (v.readyState >= 2 && !v.paused){ drawCard(cards[i].userData.g, i); cards[i].userData.tex.needsUpdate = true; } }); }
    renderer.render(scene, camera);
    raf = visible ? requestAnimationFrame(frame) : null;
  }
  new IntersectionObserver(es => {
    visible = es[0].isIntersecting;
    vids.forEach(({ v }) => { if (visible){ const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause(); });
    if (visible && !raf){ size(); last = performance.now(); raf = requestAnimationFrame(frame); }
  }).observe(stage);
  renderer.render(scene, camera);
  return { redraw(i){ const c = cards[i]; drawCard(c.userData.g, i); c.userData.tex.needsUpdate = true; } };
}
