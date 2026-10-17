/* Exhibit G: the envelope and the letter from future her. */
import { $, S } from './core.js';
import { sfx } from './audio.js';
import { confetti } from './fx.js';

/* ================= letter ================= */
export const LETTER = () => [
  ['from-year', 'Written in 2031 · delivered ' + S.date + ', 2026'],
  ['greet', 'Dear 2026 me,'],
  ['', 'Happy birthday. I\'m writing this from an office with our name on the door.'],
  ['', 'I know exactly where you are right now. The table, the notes, the mock test that didn\'t go the way you wanted. I remember thinking it would never end.'],
  ['', 'It does end. Every page you read tonight is part of how I got here. Don\'t skip the revision, and please don\'t skip your meals either.'],
  ['', 'The slow days still count. The days you cried still count. Those ones most of all.'],
  ['', 'Keep going. I\'m waiting for you up here, and the view is soo beautiful as U.'],
  ['sign', 'Love, you from (2031) not by srav lol'],
  ['ps', 'P.S. He was right about you. He has been right about you since the very beginning. (He made me add this line. He also built this whole universe.) — ' + S.from]
];
$('#envelope').addEventListener('click', () => {
  const env = $('#envelope'); if (env.classList.contains('open')) return;
  env.classList.add('open'); sfx.paper(); $('#envLabel').textContent = 'Unfolding…';
  setTimeout(() => { env.classList.add('gone'); setTimeout(() => {
    env.hidden = true; $('#envLabel').hidden = true;
    const body = $('#letterBody'); body.innerHTML = '';
    LETTER().forEach(([c, t], i) => { const p = document.createElement('p'); if (c) p.className = c; p.textContent = t; p.style.setProperty('--i', i); body.appendChild(p); });
    $('#letterWrap').hidden = false; const l = $('#letterPaper'); l.classList.remove('unfold'); void l.offsetWidth; l.classList.add('unfold'); sfx.chime();
    const r = $('#letterWrap').getBoundingClientRect(); confetti(innerWidth / 2, Math.max(80, r.top), 80);
  }, 600); }, 1300);
});
