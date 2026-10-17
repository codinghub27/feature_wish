/* Background: realistic spiral galaxy, paper planes, poppable balloons and hearts. */
import { $, SNAP, clamp, pick, reduce, small, toast, damp } from './core.js';
import { popSound } from './audio.js';
import { confetti, popText } from './fx.js';
import { cloudTex, gauss, hasGL, heartShape, makeRenderer, radialTex } from './gl.js';

/* ================= BACKGROUND: realistic galaxy + balloons + paper planes ================= */
export const STAR_VS = `uniform float uTime; uniform float uSize; uniform float uBright; attribute float aScale; varying vec3 vColor; varying float vTw;
  void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = max(uSize * aScale / -mv.z, 1.0); vColor = color * uBright; vTw = 0.78 + 0.22 * sin(uTime * (0.6 + aScale * 1.7) + position.x * 13.0 + position.z * 7.0); }`;
export const STAR_FS = `varying vec3 vColor; varying float vTw; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); a = a * a * a; gl_FragColor = vec4(vColor * vTw * a, a); }`;
export const DUST_FS = `varying vec3 vColor; varying float vTw; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.05, d); gl_FragColor = vec4(vColor, a * 0.42); }`;
export function initGalaxy(){
  const canvas = $('#bg3d');
  if (!hasGL){ canvas.hidden = true; document.body.classList.add('nogl'); return null; }
  const renderer = makeRenderer(canvas, { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!renderer){ canvas.hidden = true; document.body.classList.add('nogl'); return null; }
  let pr = Math.min(devicePixelRatio || 1, small() ? 1.5 : 1.75);
  renderer.setPixelRatio(pr); renderer.setClearColor(0x070616, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 2000);
  scene.add(new THREE.AmbientLight(0xffffff, .5));
  const sunL = new THREE.DirectionalLight(0xffffff, .7); sunL.position.set(4, 10, 6); scene.add(sunL);
  // balloons live in their own layer, drawn after the bloom so they stay crisp
  const nearScene = new THREE.Scene(), nearCam = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 100);
  nearScene.add(new THREE.AmbientLight(0xffffff, .42));
  const key = new THREE.DirectionalLight(0xffffff, .75); key.position.set(4, 6, 8); nearScene.add(key);
  const pinkL = new THREE.PointLight(0xFF6F91, .55, 40); pinkL.position.set(-6, -3, 2); nearScene.add(pinkL);
  const cyanL = new THREE.PointLight(0x6FE7DD, .35, 40); cyanL.position.set(7, 4, 2); nearScene.add(cyanL);
  const galaxy = new THREE.Group(); galaxy.rotation.z = .12; scene.add(galaxy);
  const uni = { uTime: { value: 0 }, uSize: { value: 70 * pr }, uBright: { value: .7 } };
  const dustUni = { uTime: uni.uTime, uSize: uni.uSize, uBright: { value: 1 } };
  const R = 13, N = reduce ? 40000 : (small() ? 65000 : 140000), nB = Math.floor(N * .2);
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), scl = new Float32Array(N);
  const cCore = new THREE.Color('#FFF1DA'), cBulge = new THREE.Color('#FFC27A'), cArm = new THREE.Color('#A9C2FF'), cOuter = new THREE.Color('#5C6CE6'), cHII = new THREE.Color('#FF5FA8'), c = new THREE.Color();
  const armA = r => Math.log(r) * 2.7;
  for (let i = 0; i < N; i++){
    let x, y, z;
    if (i < nB){ const r = Math.abs(gauss()) * 1.25, th = Math.random() * 6.283, ph = Math.acos(Math.random() * 2 - 1); x = Math.sin(ph) * Math.cos(th) * r * 1.25; y = Math.cos(ph) * r * .55; z = Math.sin(ph) * Math.sin(th) * r * 1.25; c.copy(cCore).lerp(cBulge, Math.min(r / 2.4, 1)).multiplyScalar(.7); scl[i] = .5 + Math.random() * 1.1; }
    else {
      const r = .9 + Math.pow(Math.random(), 1.25) * R, minor = i % 4 > 1, arm = (i % 2) * Math.PI + (minor ? Math.PI / 2 * .9 : 0), a = arm + armA(r), spread = (minor ? .75 : .5) * (.45 + r * .09);
      const rnd = s => Math.pow(Math.random(), 2.4) * (Math.random() < .5 ? 1 : -1) * s;
      x = Math.cos(a) * r + rnd(spread); y = rnd(.22 + (R - r) / R * .25); z = Math.sin(a) * r + rnd(spread);
      const t = r / R; if (t < .4) c.copy(cBulge).lerp(cArm, t / .4); else c.copy(cArm).lerp(cOuter, (t - .4) / .6);
      c.multiplyScalar(1.05 - t * .45 + (Math.random() - .5) * .2); scl[i] = .35 + Math.random() * .9;
      if (Math.random() < .035 && t > .2){ c.copy(cHII); scl[i] = 1.6 + Math.random() * 1.6; } else if (Math.random() < .02){ c.setRGB(1, 1, 1); scl[i] = 1.4 + Math.random(); }
    }
    pos[i*3] = x; pos[i*3+1] = y; pos[i*3+2] = z; col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); gg.setAttribute('color', new THREE.BufferAttribute(col, 3)); gg.setAttribute('aScale', new THREE.BufferAttribute(scl, 1));
  galaxy.add(new THREE.Points(gg, new THREE.ShaderMaterial({ uniforms: uni, vertexShader: STAR_VS, fragmentShader: STAR_FS, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  const DN = Math.floor(N * .14), dp = new Float32Array(DN * 3), dc = new Float32Array(DN * 3), ds = new Float32Array(DN);
  for (let i = 0; i < DN; i++){ const r = 1.6 + Math.pow(Math.random(), 1.1) * R * .85, a = (i % 2) * Math.PI + armA(r) - .28, sp = .28 * (.5 + r * .06); dp[i*3] = Math.cos(a) * r + gauss() * sp; dp[i*3+1] = gauss() * .06; dp[i*3+2] = Math.sin(a) * r + gauss() * sp; dc[i*3] = .05; dc[i*3+1] = .028; dc[i*3+2] = .03; ds[i] = 2.2 + Math.random() * 3; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3)); dg.setAttribute('color', new THREE.BufferAttribute(dc, 3)); dg.setAttribute('aScale', new THREE.BufferAttribute(ds, 1));
  const dust = new THREE.Points(dg, new THREE.ShaderMaterial({ uniforms: dustUni, vertexShader: STAR_VS, fragmentShader: DUST_FS, vertexColors: true, transparent: true, depthWrite: false })); dust.renderOrder = 2; galaxy.add(dust);
  const ct = cloudTex(), nebCols = [0xFF5FA8, 0x7C9CFF, 0xB07CFF, 0xFF8FB8, 0x6FB8FF];
  for (let i = 0; i < (small() ? 26 : 46); i++){ const r = 2.5 + Math.random() * 9.5, a = (i % 2) * Math.PI + armA(r) + (Math.random() - .5) * .35; const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: ct, color: pick(nebCols), transparent: true, opacity: .18 + Math.random() * .2, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.set(Math.cos(a) * r, (Math.random() - .5) * .3, Math.sin(a) * r); m.scale.setScalar(2 + Math.random() * 4.5); galaxy.add(m); }
  const coreTex = radialTex([[0, 'rgba(255,248,230,1)'], [.15, 'rgba(255,214,150,.7)'], [.45, 'rgba(255,170,90,.18)'], [1, 'rgba(255,150,80,0)']], 128);
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: coreTex, transparent: true, opacity: .6, blending: THREE.AdditiveBlending, depthWrite: false })); core.scale.setScalar(8); galaxy.add(core);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: coreTex, color: 0x8C7CFF, transparent: true, opacity: .12, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(34); galaxy.add(halo);
  const BN = small() ? 5000 : 9000, bp = new Float32Array(BN * 3), bc = new Float32Array(BN * 3), bs = new Float32Array(BN), tints = ['#BFD3FF', '#FFFFFF', '#FFE7C2', '#FFC59A'].map(h => new THREE.Color(h));
  for (let i = 0; i < BN; i++){ const u = Math.random() * 2 - 1, th = Math.random() * 6.283, Rr = 300 + Math.random() * 400, s = Math.sqrt(1 - u * u); bp[i*3] = Rr * s * Math.cos(th); bp[i*3+1] = Rr * u; bp[i*3+2] = Rr * s * Math.sin(th); const tc = pick(tints); bc[i*3] = tc.r; bc[i*3+1] = tc.g; bc[i*3+2] = tc.b; bs[i] = 3 + Math.pow(Math.random(), 6) * 22; }
  const bgG = new THREE.BufferGeometry(); bgG.setAttribute('position', new THREE.BufferAttribute(bp, 3)); bgG.setAttribute('color', new THREE.BufferAttribute(bc, 3)); bgG.setAttribute('aScale', new THREE.BufferAttribute(bs, 1));
  const far = new THREE.Points(bgG, new THREE.ShaderMaterial({ uniforms: dustUni, vertexShader: STAR_VS, fragmentShader: STAR_FS, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(far);

  // paper planes: letters flying through time
  const pv = new Float32Array([0,0,1, -.62,.05,-.6, 0,0,-.42,  0,0,1, 0,0,-.42, .62,.05,-.6,  0,0,1, 0,-.22,-.55, 0,0,-.42]);
  const pgeo = new THREE.BufferGeometry(); pgeo.setAttribute('position', new THREE.BufferAttribute(pv, 3)); pgeo.computeVertexNormals();
  const pmat = new THREE.MeshStandardMaterial({ color: 0xF2E8D3, roughness: .7, side: THREE.DoubleSide, flatShading: true });
  const planes = [];
  for (let i = 0; i < (reduce ? 2 : 6); i++){ const m = new THREE.Mesh(pgeo, pmat); m.scale.setScalar(small() ? .55 : .7); m.userData = { a: Math.random() * 6.283, R: 8 + Math.random() * 6, y: 1.5 + Math.random() * 3.5, sp: (.12 + Math.random() * .12) * (i % 2 ? 1 : -1), ph: Math.random() * 6 }; scene.add(m); planes.push(m); }

  // balloons + hearts in front of the camera
  const near = new THREE.Group(); nearScene.add(near);
  const halfW = z => Math.tan(THREE.MathUtils.degToRad(nearCam.fov / 2)) * Math.abs(z) * nearCam.aspect;
  const halfH = z => Math.tan(THREE.MathUtils.degToRad(nearCam.fov / 2)) * Math.abs(z);
  const balloons = [], bGeo = new THREE.SphereGeometry(.55, 32, 24), knotGeo = new THREE.ConeGeometry(.09, .15, 12), shineGeo = new THREE.SphereGeometry(.12, 12, 12), shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55 });
  const BCOL = [0xFF6F91, 0xF5C76B, 0x6FE7DD, 0x9D7BFF];
  function resetB(g, initial){ const z = -7 - Math.random() * 5; g.position.set((Math.random() * 2 - 1) * halfW(z) * .92, initial ? (Math.random() * 2 - 1) * halfH(z) : -halfH(z) - 1.5 - Math.random() * 2, z); g.scale.setScalar(small() ? .6 + Math.random() * .3 : .75 + Math.random() * .45); g.visible = true; }
  const NBAL = reduce ? 3 : (small() ? 5 : 8);
  for (let i = 0; i < NBAL + 8; i++){
    const color = BCOL[i % 4], mat = new THREE.MeshStandardMaterial({ color, roughness: .22, metalness: .05, emissive: color, emissiveIntensity: .06 });
    const g = new THREE.Group(), body = new THREE.Mesh(bGeo, mat); body.scale.set(1, 1.18, 1); g.add(body);
    const knot = new THREE.Mesh(knotGeo, mat); knot.position.y = -.69; knot.rotation.x = Math.PI; g.add(knot);
    const sh = new THREE.Mesh(shineGeo, shineMat); sh.position.set(-.2, .3, .44); sh.scale.set(1, 1.7, .5); g.add(sh);
    const pts = []; for (let k = 0; k < 9; k++) pts.push(new THREE.Vector3(0, -.76 - k * .22, 0));
    const str = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xB9B2DE, transparent: true, opacity: .6 })); g.add(str);
    g.userData = { ci: i % 4, body, str, speed: .5 + Math.random() * .7, phase: Math.random() * 6.28, extra: i >= NBAL };
    resetB(g, true); if (i >= NBAL) g.visible = false; near.add(g); balloons.push(g);
  }
  const hGeo = new THREE.ExtrudeGeometry(heartShape(), { depth: .22, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: .06, bevelThickness: .06 }); hGeo.center();
  const hearts = [];
  for (let i = 0; i < (reduce ? 1 : 3); i++){ const hc = i % 2 ? 0xF5C76B : 0xFF6F91, o = new THREE.Group(), m = new THREE.Mesh(hGeo, new THREE.MeshStandardMaterial({ color: hc, roughness: .3, metalness: .2, emissive: hc, emissiveIntensity: .06 })); m.rotation.z = Math.PI; o.add(m); const z = -8 - Math.random() * 4, side = i % 2 ? 1 : -1; o.position.set(side * halfW(z) * (.62 + Math.random() * .3), (Math.random() * 2 - 1) * halfH(z) * .7, z); o.scale.setScalar(small() ? .7 : 1 + Math.random() * .5); o.userData = { ph: Math.random() * 6, spin: .4 + Math.random() * .6, baseY: o.position.y }; near.add(o); hearts.push(o); }

  let composer = null, perfT = 0, perfN = 0;
  if (THREE.EffectComposer && THREE.UnrealBloomPass && THREE.RenderPass){ try { composer = new THREE.EffectComposer(renderer); composer.addPass(new THREE.RenderPass(scene, camera)); composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), small() ? .6 : .75, .5, .2)); } catch(e){ composer = null; } }
  function size(){ renderer.setSize(innerWidth, innerHeight, false); if (composer){ if (composer.setPixelRatio) composer.setPixelRatio(pr); composer.setSize(innerWidth, innerHeight); } camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); nearCam.aspect = camera.aspect; nearCam.updateProjectionMatrix(); }
  size(); addEventListener('resize', size);
  let px = 0, py = 0;
  addEventListener('pointermove', e => { px = e.clientX / innerWidth - .5; py = e.clientY / innerHeight - .5; }, { passive: true });
  const far0 = new THREE.Vector3(0, 140, 260), cam = far0.clone(), tgt = new THREE.Vector3(), nxt = new THREE.Vector3();
  let intro = 0, introOn = false, last = performance.now(), running = true, boost = 0, release = 0, t = 0;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  // hover: which balloon is under the mouse (checked every few frames, not on every mouse move)
  let hoverX = -1, hoverY = -1, hovered = null, hoverTick = 0;
  function pickBalloon(x, y){ ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, nearCam); const hit = ray.intersectObjects(balloons.filter(b => b.visible).map(b => b.userData.body), false)[0]; return hit ? hit.object.parent : null; }
  const POPW = ['POP!', 'Boom!', 'Oops!', 'Bye balloon!', 'Pow!', 'Splat!'];
  let pops = 0;
  function frame(now){
    const dt = Math.min((now - last) / 1000, .05); last = now; t += dt; uni.uTime.value = t;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight), p = clamp(scrollY / max, 0, 1);
    const th = .35 + p * 2.9, Rr = 28 - p * 9, y = 14 - p * 8.5;
    tgt.set(Math.sin(th) * Rr + px * 2.2, y - py * 1.6, Math.cos(th) * Rr);
    if (introOn && intro < 1) intro = Math.min(1, intro + dt / (reduce || SNAP ? .2 : 4.2));
    if (introOn){ const e = 1 - Math.pow(1 - intro, 3); if (intro < 1) cam.copy(far0).lerp(tgt, e); else cam.lerp(tgt, SNAP ? 1 : damp(.06, dt)); }
    camera.position.copy(cam); camera.lookAt(0, 0, 0);
    uni.uBright.value = clamp((cam.length() - 10) / 26, .42, .72);
    boost *= .985; galaxy.rotation.y += dt * (reduce ? .004 : .018 + boost); far.rotation.y += dt * .002;
    core.material.opacity = .55 + Math.sin(t * 1.3) * .05;
    for (const m of planes){ const u = m.userData; u.a += dt * u.sp; m.position.set(Math.cos(u.a) * u.R, u.y + Math.sin(t * .9 + u.ph) * .5, Math.sin(u.a) * u.R); const a2 = u.a + .05 * Math.sign(u.sp); nxt.set(Math.cos(a2) * u.R, u.y + Math.sin((t + .05) * .9 + u.ph) * .5, Math.sin(a2) * u.R); m.lookAt(nxt); m.rotateZ(Math.sin(t * 1.3 + u.ph) * .35 - .25 * Math.sign(u.sp)); }
    if (release > 0) release -= dt;
    const slow = reduce ? .3 : 1;
    if (++hoverTick){ const h = hoverX >= 0 ? pickBalloon(hoverX, hoverY) : null; if (h !== hovered){ hovered = h; document.documentElement.classList.toggle('pin-cursor', !!h); } }
    for (const g of balloons){
      const u = g.userData; if (!g.visible) continue;
      // the aimed-at balloon swells a little, like it knows what's coming
      u.hv = (u.hv || 0) + (((g === hovered) ? 1 : 0) - (u.hv || 0)) * Math.min(1, dt * 10); u.body.scale.set(1 + u.hv * .1, 1.18 + u.hv * .12, 1 + u.hv * .1);
      g.position.y += u.speed * dt * slow * (release > 0 ? 3.2 : 1);
      g.position.x += Math.sin(t * .6 + u.phase) * .004; g.rotation.z = Math.sin(t * .8 + u.phase) * .14; g.rotation.y += dt * .25;
      const sp = u.str.geometry.attributes.position; for (let k = 1; k < sp.count; k++) sp.setX(k, Math.sin(t * 2.2 + u.phase + k * .6) * .045 * k); sp.needsUpdate = true;
      if (g.position.y > halfH(g.position.z) + 2){ if (u.extra && release <= 0) g.visible = false; else resetB(g, false); }
    }
    for (const h of hearts){ const u = h.userData; h.rotation.y += dt * u.spin * slow; h.position.y = u.baseY + Math.sin(t * .9 + u.ph) * .5; }
    nearCam.position.set(px * .6, -py * .4, 0); nearCam.lookAt(px * .3, -py * .2, -10);
    if (composer) composer.render(); else renderer.render(scene, camera);
    // adaptive quality: if the device can't hold ~42fps after the intro, lower the render resolution a step
    if (intro >= 1){ perfT += dt; perfN++; if (perfN >= 120){ const avg = perfT / perfN; perfT = 0; perfN = 0; if (avg > 1 / 42 && pr > 1){ pr = Math.max(1, pr - .25); renderer.setPixelRatio(pr); size(); } } }
    renderer.autoClear = false; renderer.clearDepth(); renderer.render(nearScene, nearCam); renderer.autoClear = true;
    if (running) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { if (document.hidden) running = false; else if (!running){ running = true; last = performance.now(); requestAnimationFrame(frame); } });
  return {
    flyIn(){ introOn = true; intro = 0; boost = .5; },
    spin(){ boost = .7; },
    release(sec){ release = sec; balloons.forEach(g => { if (g.userData.extra){ resetB(g, false); g.visible = true; } }); },
    hoverAt(x, y){ if (x == null){ hoverX = hoverY = -1; if (hovered){ hovered = null; document.documentElement.classList.remove('pin-cursor'); } } else { hoverX = x; hoverY = y; } },
    tryPop(x, y){
      // if the pin cursor is showing, that balloon pops even if it drifted a hair since the last hover check
      const g = pickBalloon(x, y) || (hovered && hovered.visible ? hovered : null); if (!g) return false;
      hovered = null; document.documentElement.classList.remove('pin-cursor'); g.visible = false; popText(x, y, pick(POPW)); popSound(g.userData.ci, g.scale.x / (small() ? .75 : 1)); confetti(x, y, 26); pops++;
      if (pops === 3) toast('Three balloons down. Balloon destroyer unlocked.');
      if (pops === 8) toast('Okay stop, those were imported from 2031.');
      if (pops === 15) toast('Fine. Unlimited balloons. Happy birthday.');
      setTimeout(() => { if (!g.userData.extra) resetB(g, false); }, 1400); return true;
    },
    pause(v){ if (v) running = false; else if (!running){ running = true; last = performance.now(); requestAnimationFrame(frame); } }
  };
}
