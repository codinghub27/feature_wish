/* Entry point: boots every chapter in page order. Each chapter lives in its own module. */
import { $, $$, pick, app, toast, applySettings, lockScroll } from './core.js';
import { sfx, setSound, isSoundOn, startPad } from './audio.js';
import { confetti, shootingStar, centerOf } from './fx.js';
import { initGalaxy } from './galaxy.js';
import { initSmooth, revealBand } from './smooth.js';
import { initGate } from './gate.js';
import { runLove } from './lab.js';
import './viewer.js';
import './videos.js';
import './capsules.js';
import './letter.js';
import './wish.js';
import './sheets.js';

lockScroll(true);
initSmooth();
lockScroll(true);
app.galaxy = initGalaxy();
initGate();

$('#soundBtn').addEventListener('click', () => {
  const on = !isSoundOn(); setSound(on);
  $('#soundBtn').setAttribute('aria-pressed', String(on)); $('#soundLabel').textContent = on ? 'Sound on' : 'Sound off';
  if (on && app.arrived && $('#cinema').hidden) startPad();
});
setInterval(() => { if (app.arrived && Math.random() < .55) shootingStar(); }, 4200);

/* ================= reveal + year chip ================= */
const bands = $$('main .band');
const seen = {};
const revealIO = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting && app.arrived){ en.target.classList.add('in'); onIn(en.target); } }), { threshold: .15 });
bands.forEach(b => revealIO.observe(b));
const yearIO = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ const y = en.target.dataset.year; const c = $('#chipYear'); if (c.textContent !== y){ c.textContent = y; if (app.arrived && y === '2026') toast('Returning to 2026. Hold on.'); } } }), { rootMargin: '-48% 0px -48% 0px' });
bands.forEach(b => yearIO.observe(b));
function onIn(band){
  const id = band.id;
  if (seen[id]) return; seen[id] = 1;
  if (id !== 'hero') revealBand(band);
  if (id === 'news'){ const p = $('#paper'); p.classList.remove('spin'); void p.offsetWidth; p.classList.add('spin'); sfx.whoosh(); setTimeout(() => sfx.stamp(), 1500); }
  if (id === 'lab') runLove();
}

/* ================= balloon popping ================= */
const NO_POP = 'button, a, input, label, video, .panel, .paper, .orbit-stage, .strip, .cap, .plate-stage, .envelope, .letter, .cake-stage, .vault, .sheet, .chip, .journey, .glass, #viewer, #cinema';
// mouse/trackpad only: show the push-pin cursor while it is over a balloon (see css/motion.css)
document.addEventListener('pointermove', e => {
  if (!app.galaxy) return;
  if (e.pointerType !== 'mouse' || !app.arrived || e.target.closest(NO_POP)) app.galaxy.hoverAt(null); else app.galaxy.hoverAt(e.clientX, e.clientY);
}, { passive: true });
document.documentElement.addEventListener('pointerleave', () => { if (app.galaxy) app.galaxy.hoverAt(null); });
document.addEventListener('pointerdown', e => {
  if (!app.galaxy || !app.arrived) return;
  if (e.target.closest(NO_POP)) return;
  app.galaxy.tryPop(e.clientX, e.clientY);
});

/* ================= hero ================= */
const NAMELINES = ['Yes, you. The birthday girl.', 'Certified cutest officer in 2031.', 'Main character energy detected.', 'The district already loves you.'];
$('#nameBtn').addEventListener('click', e => { const b = e.currentTarget; b.classList.remove('jelly'); void b.offsetWidth; b.classList.add('jelly'); const [x, y] = centerOf(b); confetti(x, y, 80); sfx.boing(); toast(pick(NAMELINES)); setTimeout(() => b.classList.remove('jelly'), 750); });

applySettings();
