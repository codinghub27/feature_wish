/* Exhibit C hookup (orbit + name chips) and Exhibit D film-strip videos. */
import { $$, app } from './core.js';
import { duckPad, restorePad } from './audio.js';
import { MEM, initOrbit } from './orbit.js';
import { openViewer } from './viewer.js';

/* ================= memory planet ================= */
// Opening a memory shows only that photo or video, with its name underneath.
export function openMem(i){ const m = MEM[i]; openViewer({ type: m.type, src: m.src, caption: m.name }); }
app.memAPI = initOrbit(openMem);

/* ================= videos (Exhibit D) ================= */
$$('.vframe').forEach(fr => {
  const v = fr.querySelector('video'), btn = fr.querySelector('.vplay');
  btn.addEventListener('click', () => { $$('.vframe video').forEach(o => { if (o !== v) o.pause(); }); const p = v.play(); if (p && p.catch) p.catch(() => {}); });
  v.addEventListener('play', () => { fr.classList.add('playing'); duckPad(.012); $$('.vframe video').forEach(o => { if (o !== v) o.pause(); }); });
  v.addEventListener('pause', () => { fr.classList.remove('playing'); restorePad(); });
  v.addEventListener('ended', () => { fr.classList.remove('playing'); restorePad(); });
});
