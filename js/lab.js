/* Exhibit B: love meter, the runaway No button, the age report. */
import { $, reduce, toast } from './core.js';
import { sfx } from './audio.js';
import { confetti, centerOf } from './fx.js';

/* ================= funny lab ================= */
export let loveRunning = false;
export function runLove(){
  if (loveRunning) return; loveRunning = true;
  const bar = $('#loveBar'), txt = $('#loveText'); bar.classList.remove('overflow'); bar.style.width = '0%';
  const t0 = performance.now(), dur = reduce ? 300 : 2400;
  (function step(now){ const p = Math.min((now - t0) / dur, 1), v = Math.floor(99 * (1 - Math.pow(1 - p, 3))); bar.style.width = v + '%'; txt.textContent = v + '%'; if (p < 1) return requestAnimationFrame(step); txt.textContent = '99%… hmm, it\'s stuck'; setTimeout(() => { bar.classList.add('overflow'); txt.innerHTML = 'ERROR: value too large.<span class="love-res">Result: <span class="inf" role="img" aria-label="infinity">∞</span></span>'; sfx.boing(); sfx.chime(); loveRunning = false; }, 1400); })(t0);
}
$('#loveBtn').addEventListener('click', runLove);
export const zone = $('#runZone'), noBtn = $('#noBtn'), noMsg = $('#noMsg');
export const NOLINES = ['Nice try.', 'Nope. Not happening.', 'The button disagrees.', 'Wrong answer detected.', 'You are very determined. Good sign for Mains.', 'Okay, the button gives up.'];
export let dodges = 0;
export function dodge(e){
  if (dodges >= 6) return; if (e) e.preventDefault(); dodges++;
  const zr = zone.getBoundingClientRect(), br = noBtn.getBoundingClientRect(), maxX = Math.max(16, zr.width - br.width - 16), maxY = Math.max(140, zr.height - br.height - 16), cx = br.left - zr.left, cy = br.top - zr.top;
  let x, y, tries = 0; do { x = 16 + Math.random() * (maxX - 16); y = 130 + Math.random() * (maxY - 130); tries++; } while (tries < 20 && Math.abs(x - cx) < 70 && Math.abs(y - cy) < 40);
  noBtn.classList.add('loose'); noBtn.style.left = x + 'px'; noBtn.style.top = y + 'px'; noBtn.style.transform = 'rotate(' + (Math.random() * 36 - 18) + 'deg)';
  noMsg.textContent = NOLINES[dodges - 1]; sfx.boing();
  if (dodges >= 6){ noBtn.textContent = 'Fine, yes'; noBtn.classList.add('surrender'); noBtn.style.transform = 'none'; }
}
export function yes(btn){ const [x, y] = centerOf(btn); confetti(x, y, 120); sfx.yay(); toast('Correct answer. +100 marks.'); noMsg.textContent = 'Knew it. So did the whole of 2031.'; }
noBtn.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') dodge(); });
noBtn.addEventListener('pointerdown', e => { if (dodges < 6) dodge(e); });
noBtn.addEventListener('click', e => { if (dodges < 6){ e.preventDefault(); dodge(); } else yes(noBtn); });
$('#yesBtn').addEventListener('click', e => yes(e.currentTarget));
