/* The 3D birthday cake with blow-out-able candles. */
import { $, reduce } from './core.js';
import { ctex, hasGL, radialTex } from './gl.js';

/* ================= CAKE ================= */
export function initCake(){
  if (!hasGL) return null;
  const canvas = $('#cakeCanvas'), stage = $('#cakeStage');
  let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch(e){ return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  const lin = h => new THREE.Color(h).convertSRGBToLinear();
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(34, 1, .1, 100); camera.position.set(0, 4.4, 9.4); camera.lookAt(0, 1.75, 0);
  try { const env = new THREE.Scene(), et = ctex(16, 256, g => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#FFE6C8'); gr.addColorStop(.45, '#6A54B8'); gr.addColorStop(1, '#0B0A1F'); g.fillStyle = gr; g.fillRect(0, 0, 16, 256); }); env.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.MeshBasicMaterial({ map: et, side: THREE.BackSide }))); const sb = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })); sb.position.set(-5, 6, 4); sb.lookAt(0, 0, 0); env.add(sb); const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(env, .04).texture; pm.dispose(); } catch(e){}
  scene.add(new THREE.AmbientLight(lin('#9C8CD8'), .35));
  const key = new THREE.DirectionalLight(lin('#FFF2E0'), 1.2); key.position.set(-4, 8, 6); scene.add(key);
  const rimL = new THREE.DirectionalLight(lin('#FF7AB6'), .9); rimL.position.set(5, 3, -6); scene.add(rimL);
  const warm = new THREE.PointLight(lin('#FFA040'), 2, 7, 2); warm.position.set(0, 4.4, .4); scene.add(warm);
  const C = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: lin(c), roughness: .55 }, o || {}));
  const cake = new THREE.Group(); scene.add(cake);
  const silver = C('#EDE8F5', { metalness: 1, roughness: .18 });
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(2.55, 2.45, .1, 96), silver); plate.position.y = 1.0; cake.add(plate);
  const lipm = new THREE.Mesh(new THREE.TorusGeometry(2.52, .05, 12, 96), silver); lipm.rotation.x = Math.PI / 2; lipm.position.y = 1.04; cake.add(lipm);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.32, .55, .9, 48), silver); stem.position.y = .5; cake.add(stem);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.25, .1, 64), silver); foot.position.y = .05; cake.add(foot);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: radialTex([[0, 'rgba(0,0,0,.55)'], [1, 'rgba(0,0,0,0)']], 64), transparent: true, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = .001; cake.add(sh);
  const pearlM = C('#FFF6EE', { roughness: .15, metalness: .3 });
  const pearls = (r, y, n, s) => { const im = new THREE.InstancedMesh(new THREE.SphereGeometry(s, 10, 8), pearlM, n), d = new THREE.Object3D(); for (let i = 0; i < n; i++){ const a = i / n * 6.283; d.position.set(Math.cos(a) * r, y, Math.sin(a) * r); d.updateMatrix(); im.setMatrixAt(i, d.matrix); } cake.add(im); };
  const ros = (r, y, n, col, s) => { const geo = new THREE.TorusKnotGeometry(.08 * s, .04 * s, 40, 8, 2, 5), m = C(col, { roughness: .5 }); for (let i = 0; i < n; i++){ const a = i / n * 6.283, o = new THREE.Mesh(geo, m); o.position.set(Math.cos(a) * r, y, Math.sin(a) * r); o.rotation.x = Math.PI / 2; o.scale.z = .7; cake.add(o); } };
  const y1 = 1.05;
  const t1 = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.85, 1.15, 72), C('#FFF1E4', { roughness: .62 })); t1.position.y = y1 + .575; cake.add(t1);
  const bnd = new THREE.Mesh(new THREE.CylinderGeometry(1.86, 1.86, .2, 72), C('#E8799E', { roughness: .35, metalness: .1 })); bnd.position.y = y1 + .32; cake.add(bnd);
  pearls(1.87, y1 + .07, 64, .07); ros(1.72, y1 + 1.17, 18, '#FFF6EC', 1);
  const y2 = y1 + 1.15;
  const t2 = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.32, 1.0, 72), C('#F4B9CC', { roughness: .58 })); t2.position.y = y2 + .5; cake.add(t2);
  pearls(1.34, y2 + .06, 50, .06);
  const goldM = C('#FFC968', { metalness: 1, roughness: .28 });
  for (let i = 0; i < 24; i++){ const a = Math.random() * 6.283, f = new THREE.Mesh(new THREE.CircleGeometry(.05 + Math.random() * .06, 5), goldM), hy = y2 + .15 + Math.random() * .7; f.position.set(Math.cos(a) * 1.325, hy, Math.sin(a) * 1.325); f.lookAt(Math.cos(a) * 3, hy, Math.sin(a) * 3); cake.add(f); }
  ros(1.2, y2 + 1.02, 14, '#FFF6EC', .9);
  const y3 = y2 + 1.0;
  const t3 = new THREE.Mesh(new THREE.CylinderGeometry(.88, .88, .82, 72), C('#FFF1E4', { roughness: .6 })); t3.position.y = y3 + .41; cake.add(t3);
  const choc = C('#3A1E14', { roughness: .18, metalness: .1 });
  const capm = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, .1, 72), choc); capm.position.y = y3 + .83; cake.add(capm);
  for (let i = 0; i < 18; i++){ const a = i / 18 * 6.283 + Math.random() * .1, len = .18 + Math.random() * .38; const dr = new THREE.Mesh(new THREE.SphereGeometry(.06, 10, 10), choc); dr.scale.set(1, len / .12, 1); dr.position.set(Math.cos(a) * .895, y3 + .8 - len * .5, Math.sin(a) * .895); cake.add(dr); const tip = new THREE.Mesh(new THREE.SphereGeometry(.068, 10, 10), choc); tip.position.set(Math.cos(a) * .9, y3 + .8 - len, Math.sin(a) * .9); cake.add(tip); }
  const berry = C('#C81E3A', { roughness: .28 }); [[.55, .2], [-.4, .5], [.1, -.6], [-.55, -.25]].forEach(([x, z]) => { const b = new THREE.Mesh(new THREE.SphereGeometry(.12, 16, 12), berry); b.scale.set(1, 1.2, 1); b.position.set(x * .9, y3 + .98, z * .9); cake.add(b); });
  const topY = y3 + .88;
  const flameTex = ctex(64, 128, g => { const gr = g.createRadialGradient(32, 92, 2, 32, 80, 60); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.18, 'rgba(255,240,190,1)'); gr.addColorStop(.42, 'rgba(255,170,60,.95)'); gr.addColorStop(.7, 'rgba(255,90,40,.35)'); gr.addColorStop(1, 'rgba(255,60,20,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(32, 4); g.bezierCurveTo(54, 50, 58, 84, 32, 120); g.bezierCurveTo(6, 84, 10, 50, 32, 4); g.fill(); g.fillStyle = 'rgba(120,170,255,.5)'; g.beginPath(); g.ellipse(32, 112, 7, 9, 0, 0, 6.283); g.fill(); });
  const glowTex = radialTex([[0, 'rgba(255,214,150,1)'], [.25, 'rgba(255,170,80,.45)'], [1, 'rgba(255,140,60,0)']], 128);
  const smokeTex = radialTex([[0, 'rgba(210,206,222,.32)'], [.5, 'rgba(210,206,222,.14)'], [1, 'rgba(210,206,222,0)']]);
  const stripe = (a, b) => { const t = ctex(64, 256, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); g.fillStyle = b; for (let y = -64; y < 320; y += 36){ g.beginPath(); g.moveTo(0, y); g.lineTo(64, y + 40); g.lineTo(64, y + 54); g.lineTo(0, y + 14); g.fill(); } }); t.encoding = THREE.sRGBEncoding; return t; };
  const candles = [];
  [['#FFD48A', '#FFF6EC'], ['#FF9AC8', '#FFF6EC'], ['#9CD8FF', '#FFF6EC'], ['#FFD48A', '#FF9AC8'], ['#C9B8FF', '#FFF6EC']].forEach((cc, i) => {
    const a = i / 5 * 6.283 + .6, g = new THREE.Group(); g.position.set(Math.cos(a) * .5, topY, Math.sin(a) * .5);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.055, .06, .78, 18), C('#ffffff', { map: stripe(cc[0], cc[1]), roughness: .4 })); body.position.y = .39; g.add(body);
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(.01, .012, .08, 6), C('#1A1410')); wick.position.y = .82; g.add(wick);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); fl.center.set(.5, .06); fl.position.y = .8; fl.scale.set(.16, .34, 1); g.add(fl);
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); gl.position.y = .95; gl.scale.setScalar(.9); g.add(gl);
    cake.add(g); candles.push({ fl, gl, lit: true, k: 1, ph: Math.random() * 6, lean: 0 });
  });
  const smokes = []; for (let i = 0; i < 70; i++){ const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0, depthWrite: false })); s.visible = false; scene.add(s); smokes.push({ s, life: 0, del: 0, v: new THREE.Vector3() }); }
  let smI = 0; const wp = new THREE.Vector3();
  function puff(c){ c.fl.getWorldPosition(wp); for (let k = 0; k < 10; k++){ const p = smokes[smI]; smI = (smI + 1) % smokes.length; p.s.visible = true; p.s.position.copy(wp); p.life = 1; p.del = k * .05; p.v.set((Math.random() - .5) * .25, .5 + Math.random() * .5, (Math.random() - .5) * .25); p.s.scale.setScalar(.15); } }
  function size(){ const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  size(); addEventListener('resize', size);
  let rotV = 0, down = false, lx = 0;
  stage.addEventListener('pointerdown', e => { down = true; lx = e.clientX; });
  addEventListener('pointermove', e => { if (!down) return; rotV = (e.clientX - lx) * .006; cake.rotation.y += rotV; lx = e.clientX; });
  addEventListener('pointerup', () => { down = false; }); addEventListener('pointercancel', () => { down = false; });
  let visible = false, raf = null, last = performance.now(), t = 0, wind = 0;
  function frame(now){
    const dt = Math.min((now - last) / 1000, .05); last = now; t += dt;
    if (!down){ rotV *= Math.pow(.95, dt * 60); cake.rotation.y += rotV * dt * 60 + dt * (reduce ? .05 : .22); }
    let lit = 0;
    candles.forEach((c, i) => {
      c.k += ((c.lit ? 1 : 0) - c.k) * Math.min(1, dt * (c.lit ? 4 : 16));
      const fl = 1 + Math.sin(t * 17 + c.ph) * .06 + Math.sin(t * 29 + c.ph * 2) * .04 + wind * Math.sin(t * 40 + i) * .25;
      c.fl.scale.set(.16 * c.k * (1 + wind * .3), .34 * c.k * fl * (1 - wind * .35), 1);
      c.lean += (wind * (.9 + Math.sin(t * 13 + i) * .3) - c.lean) * Math.min(1, dt * 10);
      c.fl.material.rotation = -c.lean + Math.sin(t * 6 + c.ph) * .05;
      c.fl.visible = c.gl.visible = c.k > .02; c.gl.material.opacity = c.k * (.75 + Math.sin(t * 20 + c.ph) * .1);
      if (c.lit) lit++;
    });
    warm.intensity = .2 + (lit / 5) * 2.2 * (1 + Math.sin(t * 18) * .04);
    smokes.forEach(p => { if (p.life <= 0) return; if (p.del > 0){ p.del -= dt; return; } p.life -= dt / 3.2; p.s.position.addScaledVector(p.v, dt); p.s.position.x += Math.sin(t * 2 + p.v.x * 40) * .004; p.s.scale.setScalar(.15 + (1 - p.life) * .9); p.s.material.opacity = Math.max(0, p.life * .4); if (p.life <= 0) p.s.visible = false; });
    renderer.render(scene, camera);
    raf = visible ? requestAnimationFrame(frame) : null;
  }
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !raf){ size(); last = performance.now(); raf = requestAnimationFrame(frame); } }).observe(canvas);
  renderer.render(scene, camera);
  return {
    setWind(w){ wind = w; },
    out(i){ const c = candles[i]; if (!c.lit) return false; c.lit = false; puff(c); return true; },
    relight(i){ candles[i].lit = true; },
    relightAll(){ candles.forEach(c => c.lit = true); },
    litCount(){ return candles.filter(c => c.lit).length; }
  };
}
