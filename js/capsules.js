/* Exhibit E: flip-open time capsules. */
import { $ } from './core.js';
import { sfx } from './audio.js';
import { confetti } from './fx.js';

/* ================= capsules ================= */
export const CAPS = [
  { t: 'Open when you feel exhausted', tone: '--cyan', msg: 'Close the books. Drink water. Sleep a full night. Rest is part of the syllabus, and future you is very well rested.' },
  { t: 'Open when a mock test goes badly', tone: '--rose', msg: 'One score is one page, not the whole story. Find the mistakes, fix them, and go again. I have seen your comeback. It is legendary.' },
  { t: 'Open when you doubt yourself', tone: '--gold', msg: 'Read the newspaper above again. That headline is not a guess. It is a plan, and you are already halfway through it.' }
];
CAPS.forEach((c, i) => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'cap reveal'; b.style.setProperty('--tone', 'var(' + c.tone + ')'); b.setAttribute('aria-label', c.t);
  b.innerHTML = '<span class="cap-in"><span class="cap-face cap-front"><span class="num">Capsule 0' + (i + 1) + ' · sealed 2031</span><span class="cap-title"></span><span class="seal-line"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>Tap to open</span></span><span class="cap-face cap-back"><p></p><p class="sig">– you, 2031</p></span></span>';
  b.querySelector('.cap-title').textContent = c.t; b.querySelector('.cap-back p').textContent = c.msg;
  b.addEventListener('click', () => { b.classList.toggle('open'); sfx.chime(); if (b.classList.contains('open')){ const r = b.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + 30, 30); } });
  $('#caps').appendChild(b);
});
