/* 2D overlay effects: fireworks, confetti, shooting stars, pop words. */
import { $, pick, reduce, tok } from './core.js';
import { sfx } from './audio.js';

/* ================= 2D fx ================= */
export const fx = $('#fx'), fc = fx.getContext('2d');
export const FXC = ['--gold', '--rose', '--violet', '--cyan', '--star'].map(tok);
export let sparks = [], confs = [], streaks = [], fxRaf = null;
export function sizeFx(){ const d = Math.min(devicePixelRatio || 1, 2); fx.width = innerWidth * d; fx.height = innerHeight * d; fc.setTransform(d, 0, 0, d, 0, 0); }
sizeFx(); addEventListener('resize', sizeFx);
export function kick(){ if (!fxRaf) fxRaf = requestAnimationFrame(fxLoop); }
export function explode(x, y, col){ const c = col || pick(FXC), n = reduce ? 30 : 100; for (let i = 0; i < n; i++){ const a = Math.random() * 6.283, s = 1 + Math.random() * 5; sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, c, d: .007 + Math.random() * .01 }); } sfx.boom(); kick(); }
export function fireworks(n){ for (let i = 0; i < n; i++) setTimeout(() => explode(innerWidth * (.15 + Math.random() * .7), innerHeight * (.12 + Math.random() * .35)), i * 420); }
export function confetti(x, y, n){ n = reduce ? Math.round(n / 3) : n; for (let i = 0; i < n; i++) confs.push({ x, y, vx: (Math.random() - .5) * 12, vy: -Math.random() * 11 - 3, rot: Math.random() * 6, vr: (Math.random() - .5) * .4, spin: Math.random() * 6, vs: .08 + Math.random() * .2, c: pick(FXC), w: 6 + Math.random() * 5, h: 10 + Math.random() * 6, life: 1 }); kick(); }
export function shootingStar(){ if (reduce || document.hidden) return; const x = Math.random() * innerWidth * .8 + innerWidth * .1, y = Math.random() * innerHeight * .4, dir = Math.random() < .5 ? 1 : -1; streaks.push({ x, y, vx: 13 * dir, vy: 5 + Math.random() * 4, life: 1 }); kick(); }
export function fxLoop(){
  fc.clearRect(0, 0, innerWidth, innerHeight); fc.globalCompositeOperation = 'lighter';
  streaks = streaks.filter(s => s.life > 0);
  for (const s of streaks){ s.x += s.vx; s.y += s.vy; s.life -= .025; const g = fc.createLinearGradient(s.x, s.y, s.x - s.vx * 9, s.y - s.vy * 9); g.addColorStop(0, 'rgba(255,243,224,' + s.life + ')'); g.addColorStop(1, 'rgba(255,243,224,0)'); fc.strokeStyle = g; fc.lineWidth = 2; fc.beginPath(); fc.moveTo(s.x, s.y); fc.lineTo(s.x - s.vx * 9, s.y - s.vy * 9); fc.stroke(); }
  sparks = sparks.filter(p => p.life > 0);
  for (const p of sparks){ p.vx *= .98; p.vy = p.vy * .98 + .05; p.x += p.vx; p.y += p.vy; p.life -= p.d; fc.globalAlpha = Math.max(0, p.life); fc.fillStyle = p.c; fc.beginPath(); fc.arc(p.x, p.y, 2.3 * p.life + .6, 0, 6.283); fc.fill(); }
  fc.globalCompositeOperation = 'source-over';
  confs = confs.filter(p => p.life > 0 && p.y < innerHeight + 40);
  for (const p of confs){ p.vx *= .99; p.vy = Math.min(p.vy + .22, 5.5); p.x += p.vx + Math.sin(p.spin) * .6; p.y += p.vy; p.rot += p.vr; p.spin += p.vs; p.life -= .004; fc.save(); fc.translate(p.x, p.y); fc.rotate(p.rot); fc.scale(Math.cos(p.spin), 1); fc.globalAlpha = Math.min(1, p.life * 2); fc.fillStyle = p.c; fc.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); fc.restore(); }
  fc.globalAlpha = 1;
  if (sparks.length || confs.length || streaks.length) fxRaf = requestAnimationFrame(fxLoop); else { fxRaf = null; fc.clearRect(0, 0, innerWidth, innerHeight); }
}
export function popText(x, y, w){ const el = document.createElement('div'); el.className = 'poptxt'; el.textContent = w; el.style.left = x + 'px'; el.style.top = y + 'px'; document.body.appendChild(el); setTimeout(() => el.remove(), 1150); }
export const centerOf = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
