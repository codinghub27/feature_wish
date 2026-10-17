/* The opening sequence: the gift from 2031 -> lid explodes -> wormhole -> year counter -> arrival. */
import { $, reduce, SNAP, app, lockScroll } from './core.js';
import { sfx, startPad, stopPad } from './audio.js';
import { confetti, fireworks } from './fx.js';
import { initPortal } from './portal.js';
import { revealHero } from './smooth.js';

const LOGS_GIFT = ['Package received from 2031…', 'Contents: fragile, magical, slightly impatient', 'Scanning… 100% love detected', 'Warning: box may contain a time machine'];
const LOGS_WARP = ['Engaging time drive. Hold on tight.', 'Fuel check: chai at 87%', 'Passenger manifest: 1 future officer', 'Warning: full syllabus detected in cargo hold', 'Approaching 2031…'];
const BUBBLES = ['Open me already!', 'I came all the way from 2031.', 'My legs hurt. I don\'t have legs.', 'Pretty please?', 'The suspense is killing me.'];
let logT = 0, bubT = 0;

function cycle(el, list, ms){ let i = 0; el.textContent = list[0]; return setInterval(() => { i = (i + 1) % list.length; el.textContent = list[i]; }, ms); }

function startGate(){
  clearInterval(logT); clearInterval(bubT); logT = cycle($('#log'), LOGS_GIFT, 2600);
  const b = $('#bubble'); let bi = 0;
  setTimeout(() => { if (app.started) return; b.textContent = BUBBLES[0]; b.classList.add('show'); }, 3200);
  bubT = setInterval(() => { if (app.started) return; bi = (bi + 1) % BUBBLES.length; b.classList.remove('show'); setTimeout(() => { b.textContent = BUBBLES[bi]; b.classList.add('show'); }, 250); }, 3800);
}

function openGift(){
  if (app.started) return; app.started = true;
  $('#bubble').classList.remove('show'); clearInterval(bubT); clearInterval(logT);
  $('#openBtn').disabled = true; sfx.burst(); $('#log').textContent = 'Unwrapping… something is pulling us in.';
  $('#gate').classList.add('opening');
  if (app.portal) app.portal.open(goWarp); else goWarp();
}

function goWarp(){
  const g = $('#gate'); g.classList.add('warp'); sfx.warp(); if (app.portal) app.portal.warp();
  logT = cycle($('#log'), LOGS_WARP, 1100);
  const yearEl = $('#year'); let y = 2026; yearEl.textContent = y;
  const step = reduce || SNAP ? 80 : 520;
  const timer = setInterval(() => { y++; yearEl.textContent = y; yearEl.classList.remove('tick'); void yearEl.offsetWidth; yearEl.classList.add('tick'); sfx.tick(); if (y >= 2031){ clearInterval(timer); setTimeout(arrive, reduce || SNAP ? 50 : 480); } }, step);
}

function arrive(){
  clearInterval(logT);
  const flash = $('#flash'); flash.classList.add('on'); sfx.chime();
  setTimeout(() => {
    const g = $('#gate'); g.classList.add('gone'); lockScroll(false); scrollTo(0, 0); if (app.lenis) app.lenis.scrollTo(0, { immediate: true });
    document.body.classList.add('started'); document.body.classList.remove('arrived'); void document.body.offsetWidth; document.body.classList.add('arrived');
    flash.classList.remove('on'); app.arrived = true;
    $('#hero').classList.add('in'); revealHero();
    if (app.galaxy){ app.galaxy.flyIn(); app.galaxy.release(3.5); }
    confetti(innerWidth / 2, innerHeight * .4, 140); fireworks(3); sfx.yay(); startPad();
    setTimeout(() => { g.hidden = true; if (app.portal){ app.portal.dispose(); app.portal = null; } }, 1100);
  }, 260);
}

export function initGate(){
  app.portal = initPortal();
  startGate();
  $('#openBtn').addEventListener('click', openGift);
  $('#portal').addEventListener('click', openGift);
  $('#replayBtn').addEventListener('click', () => {
    stopPad(); app.started = false; app.arrived = false;
    const old = $('#portal'), nc = old.cloneNode(false); old.replaceWith(nc); nc.addEventListener('click', openGift);
    const g = $('#gate'); g.hidden = false; g.classList.remove('gone', 'warp', 'opening'); $('#openBtn').disabled = false; $('#year').textContent = '2026';
    lockScroll(true); scrollTo(0, 0);
    app.portal = initPortal(); startGate();
  });
}
