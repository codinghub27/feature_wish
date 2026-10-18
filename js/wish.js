/* Cake: hold to blow, the wish sequence, the secret vault and the cinema. */
import { $, reduce, toast, app, lockScroll, scrollToEl } from './core.js';
import { sfx, ac, noise, duckPad, musicBox, startPad, stopPad, isSoundOn } from './audio.js';
import { confetti, explode, fireworks } from './fx.js';
import { initCake } from './cake.js';

/* The secret video: a 720p web copy of photos/secret video/Directed By Sravan 🎬 🥸.mp4 (the 136 MB original is not deployed).
   SECRET_TITLE is shown under the video while it plays. */
const SECRET_VIDEO = 'photos/secret%20video/secret-film-wide.mp4';
const SECRET_TITLE = 'Directed By Sravan 🎬 🥸';

/* ================= cake: hold to blow ================= */
export const cake = initCake();
if (!cake){ $('#cakeCanvas').hidden = true; $('#cakeFallback').hidden = false; }
export const blowBtn = $('#blowBtn'), blowMsg = $('#blowMsg');
export let blowing = false, power = 0, blowStage = 0, blowRaf = 0, blowLast = 0, wished = false, huffT = 0, fakeLit = 5;
export const TH = [.22, .38, .54, .7, .86];
export const litCount = () => cake ? cake.litCount() : fakeLit;
export function blowLoop(now){
  const dt = Math.min((now - blowLast) / 1000, 2); blowLast = now;
  power = blowing ? Math.min(1, power + dt / 1.7) : Math.max(0, power - dt * .9);
  blowBtn.style.setProperty('--p', power.toFixed(3)); if (cake) cake.setWind(power);
  if (blowing){ huffT -= dt; if (huffT <= 0){ huffT = .35; noise(.4, .04 + power * .07, 'bandpass', 500 + power * 600, .5); } TH.forEach((th, i) => { if (power >= th){ if (cake){ if (cake.out(i)) sfx.puff(); } else if (fakeLit > 4 - i){ fakeLit = 4 - i; sfx.puff(); } } }); }
  if (litCount() === 0 && blowStage < 2) allOut();
  if (blowing || power > 0) blowRaf = requestAnimationFrame(blowLoop); else { blowRaf = 0; if (cake) cake.setWind(0); }
}
export function blowStart(){ if (blowBtn.disabled || wished) return; blowing = true; blowBtn.classList.add('active'); ac(); if (!blowRaf){ blowLast = performance.now(); blowRaf = requestAnimationFrame(blowLoop); } if (blowStage === 0) blowMsg.textContent = 'Keep blowing…'; }
export function blowEnd(){ if (!blowing) return; blowing = false; blowBtn.classList.remove('active'); const n = litCount(); if (n > 0 && !wished && blowStage < 2) blowMsg.textContent = n === 5 ? 'Hold it longer. Big breath, officer.' : 'Almost! ' + n + ' still burning. Hold again.'; }
blowBtn.addEventListener('pointerdown', e => { e.preventDefault(); try { blowBtn.setPointerCapture(e.pointerId); } catch(err){} blowStart(); });
blowBtn.addEventListener('pointerup', blowEnd); blowBtn.addEventListener('pointercancel', blowEnd); blowBtn.addEventListener('lostpointercapture', blowEnd);
blowBtn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat){ e.preventDefault(); blowStart(); } });
blowBtn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') blowEnd(); });
blowBtn.addEventListener('contextmenu', e => e.preventDefault());
export function allOut(){
  blowing = false; blowBtn.classList.remove('active');
  if (blowStage === 0){
    blowStage = 1; blowBtn.disabled = true; blowMsg.textContent = 'Wish made…';
    setTimeout(() => { if (cake) cake.relight(2); else fakeLit = 1; sfx.tick(); blowMsg.textContent = 'Wait. One candle is being as stubborn as you. Blow again!'; power = 0; blowBtn.disabled = false; $('#blowLabel').textContent = 'Blow harder'; }, 1500);
  } else if (blowStage === 1){
    blowStage = 2; wished = true; blowBtn.disabled = true; blowMsg.textContent = 'Wish sent. Next stop: 2031.'; $('#blowLabel').textContent = 'Wish made';
    setTimeout(wishSequence, 700);
  }
}
export function wishSequence(){
  duckPad(.02); musicBox(); sfx.chime();
  if (app.galaxy){ app.galaxy.release(9); app.galaxy.spin(); }
  const L = $('#hbLayer'); L.classList.remove('on'); void L.offsetWidth; L.classList.add('on');
  confetti(innerWidth / 2, innerHeight * .35, 160); setTimeout(() => confetti(innerWidth * .25, innerHeight * .3, 90), 900); setTimeout(() => confetti(innerWidth * .75, innerHeight * .3, 90), 1500);
  for (let i = 0; i < 6; i++) setTimeout(() => explode(innerWidth * (.15 + Math.random() * .7), innerHeight * (.12 + Math.random() * .3)), 1200 + i * 650);
  setTimeout(() => { L.classList.remove('on'); unlockVault(); toast('Something just unlocked below.'); }, reduce ? 1500 : 7800);
  setTimeout(() => duckPad(.09), 12000);
}

/* ================= vault + cinema ================= */
export let videoURL = SECRET_VIDEO, vaultOpen = false;
if (SECRET_VIDEO) $('#pick').hidden = true;
$('#secretFile').addEventListener('change', e => { const f = e.target.files && e.target.files[0]; if (!f) return; videoURL = URL.createObjectURL(f); toast('Preview video loaded. Blow the candles to unlock it.'); });
export function unlockVault(){ if (vaultOpen) return; vaultOpen = true; if (videoURL){ vid.preload = 'auto'; vid.src = videoURL; } // start buffering early so it plays right after the countdown
  $('#vault').classList.add('open'); sfx.unlock(); $('#vaultTitle').textContent = 'Unlocked'; $('#vaultText').textContent = 'Your wish opened it. Find a quiet spot, turn the sound up, and press play.'; $('#playSecret').textContent = 'Play the secret video'; }
$('#playSecret').addEventListener('click', () => { if (!vaultOpen){ const v = $('#vault'); v.classList.remove('shake'); void v.offsetWidth; v.classList.add('shake'); sfx.bad(); toast('Nice try. Blow out your candles first.'); return; } openCinema(); });
export const cinema = $('#cinema'), leader = $('#leader'), lc = leader.getContext('2d'), vid = $('#secretVideo');
export let leaderRaf = 0;
export function openCinema(){
  stopPad(); if (app.galaxy) app.galaxy.pause(true); cinema.hidden = false; lockScroll(true);
  // true full screen (needs this tap); phones that support it also turn to landscape for the wide film
  try { const fs = cinema.requestFullscreen || cinema.webkitRequestFullscreen; if (fs && !document.fullscreenElement){ const r = fs.call(cinema); if (r && r.then) r.then(() => { try { const o = screen.orientation; if (o && o.lock) o.lock('landscape').catch(() => {}); } catch(e){} }).catch(() => {}); } } catch(e){}
  $('#toast').classList.remove('show'); // no notifications on top of the film
  $('#cineEnd').hidden = true; $('#cineMissing').hidden = true; $('#cinePlay').hidden = true; vid.classList.remove('show'); cinema.classList.remove('playing');
  // iPhones only allow a video with sound to start from a tap, so start it muted inside this tap and pause it;
  // the same element may then play with sound after the countdown.
  if (videoURL){ if (vid.getAttribute('src') !== videoURL) vid.src = videoURL; vid.muted = true; const pr = vid.play(); if (pr && pr.then) pr.then(() => { vid.pause(); vid.currentTime = 0; vid.muted = false; }).catch(() => { vid.muted = false; }); else { vid.pause(); vid.muted = false; } }
  requestAnimationFrame(() => cinema.classList.add('rolling'));
  const d = Math.min(devicePixelRatio || 1, 2); leader.width = innerWidth * d; leader.height = innerHeight * d; lc.setTransform(d, 0, 0, d, 0, 0); leader.hidden = false;
  const t0 = performance.now(), total = reduce ? 600 : 3600; let lastN = 0; cancelAnimationFrame(leaderRaf);
  (function draw(now){
    const el = now - t0, w = innerWidth, h = innerHeight, cx = w / 2, cy = h / 2, r = Math.min(w, h) * .3, n = 3 - Math.floor(el / (total / 3)), frac = (el % (total / 3)) / (total / 3);
    lc.fillStyle = '#16120E'; lc.fillRect(0, 0, w, h);
    for (let i = 0; i < 80; i++){ lc.fillStyle = 'rgba(255,240,210,' + Math.random() * .06 + ')'; lc.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); }
    lc.fillStyle = 'rgba(210,190,160,.18)'; lc.beginPath(); lc.moveTo(cx, cy); lc.arc(cx, cy, r * 1.25, -Math.PI / 2, -Math.PI / 2 + frac * 6.283); lc.closePath(); lc.fill();
    lc.strokeStyle = 'rgba(230,215,190,.7)'; lc.lineWidth = 2; lc.beginPath(); lc.arc(cx, cy, r, 0, 6.283); lc.stroke(); lc.beginPath(); lc.arc(cx, cy, r * .82, 0, 6.283); lc.stroke(); lc.beginPath(); lc.moveTo(0, cy); lc.lineTo(w, cy); lc.moveTo(cx, 0); lc.lineTo(cx, h); lc.stroke();
    if (n >= 1){ lc.fillStyle = 'rgba(240,228,205,.92)'; lc.font = '700 ' + Math.round(r * 1.05) + "px 'JetBrains Mono', monospace"; lc.textAlign = 'center'; lc.textBaseline = 'middle'; lc.fillText(String(n), cx, cy + r * .04); if (n !== lastN){ lastN = n; sfx.tick(); } }
    if (el < total) leaderRaf = requestAnimationFrame(draw); else startVideo();
  })(t0);
}
export function startVideo(){
  leader.hidden = true; if (!videoURL){ $('#cineMissing').hidden = false; return; }
  if (vid.getAttribute('src') !== videoURL) vid.src = videoURL;
  vid.muted = false; vid.classList.add('show'); vid.currentTime = 0;
  const p = vid.play(); if (p && p.catch) p.catch(() => { $('#cinePlay').hidden = false; }); // browser blocked it: show a big play button
}
$('#cineCap').textContent = SECRET_TITLE;
$('#cinePlay').addEventListener('click', () => { $('#cinePlay').hidden = true; vid.muted = false; const p = vid.play(); if (p && p.catch) p.catch(() => { $('#cinePlay').hidden = false; }); });
vid.addEventListener('playing', () => { if (!vid.muted) cinema.classList.add('playing'); });
vid.addEventListener('pause', () => cinema.classList.remove('playing'));
vid.addEventListener('ended', () => { cinema.classList.remove('playing'); $('#cineEnd').hidden = false; confetti(innerWidth / 2, innerHeight * .3, 160); fireworks(3); });
export function closeCinema(){ cancelAnimationFrame(leaderRaf); vid.pause();
  try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch(e){}
  try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {}); else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen(); } catch(e){}
  cinema.classList.remove('rolling'); cinema.hidden = true; lockScroll(false); if (app.galaxy) app.galaxy.pause(false); if (isSoundOn()) startPad(); scrollToEl($('#final')); }
$('#cineClose').addEventListener('click', closeCinema); $('#cineDone').addEventListener('click', closeCinema); $('#cineMissClose').addEventListener('click', closeCinema);
$('#cineAgain').addEventListener('click', () => { $('#cineEnd').hidden = true; vid.currentTime = 0; vid.play(); });
