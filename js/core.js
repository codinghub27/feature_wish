/* Shared helpers, settings and app-wide state used by every other module. */
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const SNAP = location.hash === '#snap';
export const $ = s => document.querySelector(s);
export const $$ = s => Array.from(document.querySelectorAll(s));
const css = getComputedStyle(document.documentElement);
export const tok = n => css.getPropertyValue(n).trim();
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const small = () => innerWidth < 760;
// Frame-rate independent smoothing: same feel at 60Hz and 120Hz.
export const damp = (k, dt) => 1 - Math.pow(1 - k, dt * 60);

/* Mutable state shared between modules (3D scenes, journey progress, smooth scroller). */
export const app = { galaxy: null, portal: null, memAPI: null, started: false, arrived: false, lenis: null };

/* ================= settings ================= */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
/* Text inside [data-name], [data-from] and [data-date] is filled from these settings at load, so edit the
   defaults here (not the HTML) to change them. The newspaper and the age report use fixed text on purpose.
   The storage key was bumped to v2 so values saved by older versions of this page are ignored. */
const STORE = 'mission-2031-v2';
export const defaults = { name: 'IAS Anusha', date: new Date().getDate() + ' ' + MONTHS[new Date().getMonth()], from: 'Sravan' };
export let S = Object.assign({}, defaults);
try { localStorage.removeItem('mission-2031'); const s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (s) S = Object.assign({}, defaults, s); } catch(e){}
export const onSettings = [];
export function saveSettings(next){
  S = Object.assign({}, defaults, next);
  try { localStorage.setItem(STORE, JSON.stringify(S)); } catch(err){}
  applySettings();
}
export function applySettings(){
  $$('[data-name]').forEach(el => el.textContent = S.name || defaults.name);
  // hero name: a leading "IAS" is shown as small capitals above the script name, which keeps both readable
  $$('[data-name-split]').forEach(el => { const n = (S.name || defaults.name).trim(), m = n.match(/^(IAS)\s+(.+)$/i); el.querySelector('.ias').textContent = m ? m[1].toUpperCase() : ''; el.querySelector('.nm').textContent = m ? m[2] : n; });
  $$('[data-from]').forEach(el => el.textContent = S.from || defaults.from);
  $$('[data-date]').forEach(el => el.textContent = S.date || defaults.date);
  onSettings.forEach(fn => { try { fn(); } catch(e){} });
}

/* ================= toast ================= */
let toastT;
export function toast(msg){ const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200); }

/* Lock / unlock page scrolling (also pauses the smooth scroller). */
export function lockScroll(on){
  document.body.classList.toggle('locked', on);
  if (app.lenis) on ? app.lenis.stop() : app.lenis.start();
}
export function scrollToEl(el, opts){
  if (app.lenis) app.lenis.scrollTo(el, Object.assign({ duration: 1.4 }, opts || {}));
  else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}
