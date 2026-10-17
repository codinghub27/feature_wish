/* Full-screen viewer for the newspaper photo and the archive memories. */
import { $, lockScroll } from './core.js';
import { sfx, duckPad, restorePad } from './audio.js';

/* ================= full-screen viewer ================= */
export const viewer = $('#viewer'), vwMedia = $('#vwMedia'), vwCap = $('#vwCap');
export let vwOpen = false, vwLastFocus = null, vwHideT = 0;
export function openViewer(o){
  clearTimeout(vwHideT); vwLastFocus = document.activeElement; vwMedia.innerHTML = '';
  let el;
  if (o.type === 'video'){
    el = document.createElement('video'); el.controls = true; el.playsInline = true; el.setAttribute('playsinline', ''); el.preload = 'auto'; el.src = o.src;
    el.addEventListener('play', () => duckPad(.012)); el.addEventListener('pause', restorePad);
    const p = el.play(); if (p && p.catch) p.catch(() => {});
  } else { el = new Image(); el.decoding = 'async'; el.alt = o.alt || o.caption || ''; el.src = o.src; }
  vwMedia.appendChild(el);
  vwCap.textContent = o.caption || ''; vwCap.hidden = !o.caption; viewer.classList.toggle('has-cap', !!o.caption);
  viewer.setAttribute('aria-label', o.caption || o.alt || 'Photo');
  viewer.hidden = false; lockScroll(true); void viewer.offsetWidth; viewer.classList.add('show');
  vwOpen = true; sfx.whoosh(); setTimeout(() => $('#vwClose').focus({ preventScroll: true }), 60);
}
export function closeViewer(){
  if (!vwOpen) return; vwOpen = false; viewer.classList.remove('show');
  const v = vwMedia.querySelector('video'); if (v) v.pause();
  lockScroll(false);
  vwHideT = setTimeout(() => { viewer.hidden = true; vwMedia.innerHTML = ''; }, 360);
  if (vwLastFocus && vwLastFocus.focus) vwLastFocus.focus({ preventScroll: true });
}
$('#vwClose').addEventListener('click', closeViewer);
viewer.addEventListener('click', e => { if (e.target === viewer || e.target === vwMedia) closeViewer(); });

/* ================= newspaper ================= */
$('#newsZoom').addEventListener('click', () => { const im = $('#newsImg'); sfx.paper(); openViewer({ type: 'image', src: im.currentSrc || im.src, alt: im.alt }); });
