/* Small WebGL (three.js) helpers shared by the 3D scenes. */

/* ================= WebGL helpers ================= */
export const hasGL = !!window.THREE && (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch(e){ return false; } })();
export function makeRenderer(canvas, opts){ try { const r = new THREE.WebGLRenderer(Object.assign({ canvas, antialias: true, alpha: true }, opts || {})); r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); return r; } catch(e){ return null; } }
export function ctex(w, h, draw){ const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.userData = t.userData || {}; t.userData.redraw = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); draw(g, w, h); t.needsUpdate = true; }; return t; }
export const radialTex = (stops, size) => ctex(size || 64, size || 64, (g, w) => { const h = w / 2, gr = g.createRadialGradient(h, h, 0, h, h, h); stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
export const dotTex = () => radialTex([[0, 'rgba(255,255,255,1)'], [.25, 'rgba(255,255,255,.75)'], [1, 'rgba(255,255,255,0)']]);
export function cloudTex(){ return ctex(128, 128, g => { for (let i = 0; i < 26; i++){ const x = 64 + (Math.random() - .5) * 60, y = 64 + (Math.random() - .5) * 60, r = 18 + Math.random() * 34, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); } }); }
export function gauss(){ let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283 * v); }
export function heartShape(){ const s = new THREE.Shape(); s.moveTo(.25, .25); s.bezierCurveTo(.25, .25, .2, 0, 0, 0); s.bezierCurveTo(-.3, 0, -.3, .35, -.3, .35); s.bezierCurveTo(-.3, .55, -.1, .77, .25, .95); s.bezierCurveTo(.6, .77, .8, .55, .8, .35); s.bezierCurveTo(.8, .35, .8, 0, .5, 0); s.bezierCurveTo(.35, 0, .25, .25, .25, .25); return s; }
