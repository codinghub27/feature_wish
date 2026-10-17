/* The gate: the gift box from 2031 and the time wormhole. */
import { $, S, pick, reduce, small } from './core.js';
import { ctex, dotTex, hasGL, makeRenderer } from './gl.js';

/* ================= GATE: gift box + wormhole ================= */
export function initPortal(){
  if (!hasGL) return null;
  const canvas = $('#portal'), renderer = makeRenderer(canvas, { alpha: false }); if (!renderer) return null;
  renderer.setClearColor(0x070616, 1);
  // gift scene
  const gs = new THREE.Scene(), gcam = new THREE.PerspectiveCamera(40, 1, .1, 200);
  gs.add(new THREE.AmbientLight(0xB8A8FF, .45));
  const k1 = new THREE.DirectionalLight(0xffffff, .9); k1.position.set(3, 6, 5); gs.add(k1);
  const glow = new THREE.PointLight(0xF5C76B, .6, 20); glow.position.set(0, 1.5, 3); gs.add(glow);
  const rim = new THREE.PointLight(0x9D7BFF, 1.4, 20); rim.position.set(-4, 2, -3); gs.add(rim);
  const cyanL = new THREE.PointLight(0x6FE7DD, 1.1, 14); cyanL.position.set(4, -1, 3); gs.add(cyanL);
  const SN = 1600, sp = new Float32Array(SN * 3); for (let i = 0; i < SN; i++){ sp[i*3] = (Math.random() - .5) * 80; sp[i*3+1] = (Math.random() - .5) * 60; sp[i*3+2] = -10 - Math.random() * 50; }
  const sgeo = new THREE.BufferGeometry(); sgeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const dot = dotTex(); gs.add(new THREE.Points(sgeo, new THREE.PointsMaterial({ map: dot, size: .25, color: 0xFFF3E0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));

  /* ---- the chrono-crate: a gift box engineered in 2031 ---- */
  // holographic side panel: hex grid, circuit traces and a glowing 2031 sigil (also used as the glow map)
  const panelTex = ctex(256, 256, (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, '#2B1E63'); bg.addColorStop(.55, '#1A1340'); bg.addColorStop(1, '#3A1747'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(157,123,255,.28)'; g.lineWidth = 1;
    for (let y = 0; y < h + 20; y += 22) for (let x = 0; x < w + 26; x += 26){ const ox = (y / 22) % 2 ? 13 : 0; g.beginPath(); for (let k = 0; k < 6; k++){ const an = k / 6 * 6.283 + Math.PI / 6; g.lineTo(x + ox + Math.cos(an) * 12, y + Math.sin(an) * 12); } g.closePath(); g.stroke(); }
    g.strokeStyle = 'rgba(111,231,221,.9)'; g.lineWidth = 2.2; g.lineCap = 'round';
    [[18, 40, 80, 40, 100, 62], [238, 70, 180, 70, 160, 92], [24, 214, 70, 214, 92, 190], [232, 200, 190, 200, 170, 222], [128, 14, 128, 46]].forEach(pts => { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let k = 2; k < pts.length; k += 2) g.lineTo(pts[k], pts[k + 1]); g.stroke(); g.fillStyle = '#FF6F91'; g.beginPath(); g.arc(pts[pts.length - 2], pts[pts.length - 1], 3.5, 0, 6.283); g.fill(); });
    g.strokeStyle = 'rgba(245,199,107,.95)'; g.lineWidth = 3; g.beginPath(); g.arc(128, 128, 46, 0, 6.283); g.stroke();
    g.strokeStyle = 'rgba(245,199,107,.45)'; g.lineWidth = 1.5; g.beginPath(); g.arc(128, 128, 56, 0, 6.283); g.stroke();
    g.fillStyle = '#F5C76B'; g.font = "700 34px 'JetBrains Mono', monospace"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('2031', 128, 130);
    g.strokeStyle = 'rgba(255,111,145,.9)'; g.lineWidth = 4; g.strokeRect(4, 4, w - 8, h - 8);
  });
  const boxM = new THREE.MeshStandardMaterial({ map: panelTex, emissive: 0xffffff, emissiveMap: panelTex, emissiveIntensity: .55, metalness: .55, roughness: .32 });
  const lidTopM = new THREE.MeshStandardMaterial({ color: 0x241A55, metalness: .7, roughness: .28, emissive: 0x3A1E7A, emissiveIntensity: .35 });
  const ribM = new THREE.MeshStandardMaterial({ color: 0xF5C76B, roughness: .2, metalness: .6, emissive: 0xF5C76B, emissiveIntensity: .55 });
  const edgeM = c => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false });
  const neon = (geo, c) => new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeM(c));
  const gift = new THREE.Group(); gs.add(gift); const base = new THREE.Group(); gift.add(base);
  base.add(new THREE.Mesh(new THREE.BoxGeometry(2, 1.6, 2), boxM)); base.add(neon(new THREE.BoxGeometry(2.02, 1.62, 2.02), 0x6FE7DD));
  base.add(new THREE.Mesh(new THREE.BoxGeometry(2.05, 1.61, .2), ribM)); base.add(new THREE.Mesh(new THREE.BoxGeometry(.2, 1.61, 2.05), ribM));
  const lid = new THREE.Group(); lid.position.y = .98; gift.add(lid);
  lid.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, .38, 2.2), [boxM, boxM, lidTopM, lidTopM, boxM, boxM])); lid.add(neon(new THREE.BoxGeometry(2.22, .4, 2.22), 0xFF6F91));
  lid.add(new THREE.Mesh(new THREE.BoxGeometry(2.25, .39, .2), ribM)); lid.add(new THREE.Mesh(new THREE.BoxGeometry(.2, .39, 2.25), ribM));
  const loopGeo = new THREE.TorusGeometry(.36, .07, 14, 48);
  const l1 = new THREE.Mesh(loopGeo, ribM); l1.position.set(-.34, .5, 0); l1.rotation.set(0, .4, .55); lid.add(l1);
  const l2 = new THREE.Mesh(loopGeo, ribM); l2.position.set(.34, .5, 0); l2.rotation.set(0, -.4, -.55); lid.add(l2);
  // floating energy crystal above the bow
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(.24, 0), new THREE.MeshStandardMaterial({ color: 0xFF8FB0, emissive: 0xFF6F91, emissiveIntensity: .9, metalness: .3, roughness: .1, flatShading: true }));
  crystal.position.y = .95; crystal.scale.set(1, 1.5, 1); lid.add(crystal);
  const crystalGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0xFF6F91, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false })); crystalGlow.scale.setScalar(1.3); crystal.add(crystalGlow);
  const tagTex = ctex(256, 128, (g, w, h) => { g.fillStyle = 'rgba(9,7,26,.92)'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6FE7DD'; g.lineWidth = 3; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#6FE7DD'; g.fillRect(5, 5, 10, h - 10); g.textAlign = 'center'; g.fillStyle = '#FFF3E0'; g.font = "700 30px 'Caveat', cursive"; g.fillText('To: ' + S.name, w / 2 + 6, 56); g.font = "700 18px 'JetBrains Mono', monospace"; g.fillStyle = '#FF6F91'; g.fillText('FROM: 2031', w / 2 + 6, 96); });
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(.84, .42), new THREE.MeshBasicMaterial({ map: tagTex, transparent: true, side: THREE.DoubleSide })); tag.position.set(.52, .18, 1.04); tag.rotation.z = -.12; base.add(tag);
  // two orbiting rings
  const ringM = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .75, blending: THREE.AdditiveBlending, depthWrite: false });
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.1, .018, 8, 140), ringM(0x6FE7DD)); ringA.rotation.x = Math.PI / 2.3; gs.add(ringA);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.4, .014, 8, 140), ringM(0xFF6F91)); ringB.rotation.set(Math.PI / 1.8, .5, 0); gs.add(ringB);
  // hexagonal launch pad instead of a plain shadow
  const pad = new THREE.Group(); pad.position.y = -1.05; gs.add(pad);
  pad.add(new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.9, .14, 6), new THREE.MeshStandardMaterial({ color: 0x120E2E, metalness: .8, roughness: .35 })));
  const padRing = new THREE.Mesh(new THREE.RingGeometry(1.55, 1.68, 6), new THREE.MeshBasicMaterial({ color: 0x9D7BFF, transparent: true, opacity: .9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })); padRing.rotation.x = -Math.PI / 2; padRing.position.y = .075; pad.add(padRing);
  const padGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0x9D7BFF, transparent: true, opacity: .45, blending: THREE.AdditiveBlending, depthWrite: false })); padGlow.scale.set(5, 1.4, 1); padGlow.position.y = .1; pad.add(padGlow);
  // rising sparkles around the crate (they become the burst when it opens)
  const PN2 = small() ? 70 : 120, sparks = [];
  for (let i = 0; i < PN2; i++){ const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: [0xF5C76B, 0x6FE7DD, 0xFF6F91, 0xC08BFF][i % 4], transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.scale.setScalar(.09 + Math.random() * .08); gs.add(m); sparks.push({ m, a: Math.random() * 6.283, r: 1.5 + Math.random() * 1.2, y: Math.random() * 3 - 1, sp: .25 + Math.random() * .5, v: new THREE.Vector3(), burst: false }); }
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.8, .75, 6, 40, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFE6A8, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); beam.position.y = 3.8; gift.add(beam);
  // tunnel scene
  const ts = new THREE.Scene(); ts.fog = new THREE.FogExp2(0x070616, .05);
  const tcam = new THREE.PerspectiveCamera(70, 1, .05, 200);
  const pts = []; for (let i = 0; i < 10; i++){ const a = i / 10 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * 40 + Math.sin(a * 3) * 7, Math.sin(a * 2) * 8, Math.sin(a) * 40)); }
  const curve = new THREE.CatmullRomCurve3(pts, true);
  const ttex = ctex(512, 256, (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, 512, 256); const cols = ['#F5C76B', '#FF6F91', '#9D7BFF', '#6FE7DD', '#FFF3E0', '#9D7BFF']; for (let k = 0; k < 190; k++){ g.globalAlpha = .25 + Math.random() * .75; g.fillStyle = pick(cols); const y = Math.random() * 256, len = 40 + Math.random() * 280, x = Math.random() * 512, h = .8 + Math.random() * 2.6; g.fillRect(x, y, len, h); if (x + len > 512) g.fillRect(x - 512, y, len, h); } });
  ttex.wrapS = ttex.wrapT = THREE.RepeatWrapping; ttex.repeat.set(26, 3);
  ts.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 700, 2.4, 40, true), new THREE.MeshBasicMaterial({ map: ttex, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
  ts.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 260, 2.55, 14, true), new THREE.MeshBasicMaterial({ color: 0x6B4FD8, wireframe: true, transparent: true, opacity: .13 })));
  const PN = small() ? 900 : 1800, pp = new Float32Array(PN * 3), v = new THREE.Vector3();
  for (let i = 0; i < PN; i++){ curve.getPointAt(Math.random(), v); pp[i*3] = v.x + (Math.random() - .5) * 3.8; pp[i*3+1] = v.y + (Math.random() - .5) * 3.8; pp[i*3+2] = v.z + (Math.random() - .5) * 3.8; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  ts.add(new THREE.Points(pg, new THREE.PointsMaterial({ map: dot, size: .09, color: 0xFFF3E0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
  function size(){ const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight; renderer.setSize(w, h, false); [gcam, tcam].forEach(c => { c.aspect = w / h; c.updateProjectionMatrix(); }); gcam.position.set(0, 2.2, w < 640 ? 11.5 : 9); gcam.lookAt(0, .4, 0); }
  size(); addEventListener('resize', size);
  let mode = 'gift', ot = 0, done = null, raf = 0, last = performance.now(), time = 0, tt = 0, wt = 0;
  const lidV = new THREE.Vector3(), cp = new THREE.Vector3(), lp = new THREE.Vector3();
  function frame(now){
    const dt = Math.min((now - last) / 1000, .05); last = now; time += dt;
    if (mode === 'gift' || mode === 'opening'){
      if (mode === 'gift'){ gift.rotation.y += dt * .6; gift.position.y = Math.sin(time * 1.6) * .12; const cyc = time % 3.2, shake = (!reduce && cyc > 2.4) ? Math.sin(cyc * 60) * .1 * Math.sin((cyc - 2.4) / .8 * Math.PI) : 0; gift.rotation.z = shake; lid.position.y = .98 + Math.abs(shake) * 1.6; }
      else { ot += dt; lidV.y -= 11 * dt; lid.position.addScaledVector(lidV, dt); lid.rotation.x += dt * 5; lid.rotation.z += dt * 3; beam.material.opacity = Math.min(.65, ot * 1.3); glow.intensity = .6 + ot * 6; const s = 1 + Math.sin(Math.min(ot * 9, Math.PI)) * .14; base.scale.set(s, 1 / s, s); gift.rotation.y += dt * 2; gcam.position.lerp(new THREE.Vector3(0, 1.4, 2.2), dt * (ot > .6 ? 1.6 : .2)); gcam.lookAt(0, 1.5, 0); if (ot > 1.4 && done){ const d = done; done = null; d(); } }
      crystal.rotation.y += dt * 2.2; crystal.position.y = .95 + Math.sin(time * 2.4) * .06;
      boxM.emissiveIntensity = .45 + Math.sin(time * 2.2) * .15; padRing.material.opacity = .6 + Math.sin(time * 3) * .3;
      ringA.rotation.z += dt * .7; ringB.rotation.z -= dt * .5;
      if (mode === 'opening'){ const k = Math.min(ot / 1.2, 1); ringA.scale.setScalar(1 + k * 2.4); ringB.scale.setScalar(1 + k * 3); ringA.material.opacity = ringB.material.opacity = .75 * (1 - k); }
      for (const p of sparks){
        if (p.burst){ p.m.position.addScaledVector(p.v, dt); p.v.multiplyScalar(Math.pow(.9, dt * 60)); p.v.y -= dt * 1.5; p.m.material.opacity = Math.max(0, p.m.material.opacity - dt * .8); continue; }
        p.a += dt * p.sp * .6; p.y += dt * p.sp; if (p.y > 2.6) p.y = -1;
        p.m.position.set(Math.cos(p.a) * p.r, p.y, Math.sin(p.a) * p.r); p.m.material.opacity = Math.sin((p.y + 1) / 3.6 * Math.PI) * .9;
      }
      renderer.render(gs, gcam);
    } else {
      let speed = .006; if (mode === 'warp'){ wt += dt; const k = Math.min(wt / 2.8, 1); speed = .006 + k * k * .1; tcam.fov = 70 + k * 50; tcam.updateProjectionMatrix(); }
      tt = (tt + speed * dt) % 1; curve.getPointAt(tt, cp); curve.getPointAt((tt + .004) % 1, lp);
      tcam.position.copy(cp); tcam.lookAt(lp); tcam.rotateZ(Math.sin(time * .35) * .25 + wt * wt * .6);
      ttex.offset.x -= dt * (1 + wt * 4);
      renderer.render(ts, tcam);
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return {
    open(cb){ mode = 'opening'; ot = 0; gift.rotation.z = 0; lidV.set(1.4, 8, 2.6); done = cb; sparks.forEach(p => { p.burst = true; p.m.position.set((Math.random() - .5) * .6, 1.1, (Math.random() - .5) * .6); p.v.set((Math.random() - .5) * 9, 3 + Math.random() * 7, (Math.random() - .5) * 9); p.m.material.opacity = 1; }); },
    warp(){ mode = 'warp'; wt = 0; },
    redraw(){ tagTex.userData.redraw(); },
    dispose(){ cancelAnimationFrame(raf); removeEventListener('resize', size); renderer.dispose(); try { renderer.forceContextLoss(); } catch(e){} }
  };
}
