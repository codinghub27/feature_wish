/* All sound is synthesised with Web Audio: no audio files to download.
   Everything goes through one master gain + compressor so overlapping effects never clip. */
let actx = null, master = null, soundOn = true;
export const isSoundOn = () => soundOn;
export function setSound(on){ soundOn = on; if (!on) stopPad(); }

export function ac(){
  if (!soundOn) return null;
  try {
    if (!actx){
      actx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = actx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = .003; comp.release.value = .2;
      master = actx.createGain(); master.gain.value = .9; master.connect(comp); comp.connect(actx.destination);
    }
    if (actx.state === 'suspended') actx.resume();
  } catch(e){ return null; }
  return actx;
}
const out = () => master;

let nb = null;
function nbuf(c){ if (nb) return nb; const len = c.sampleRate, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; nb = b; return b; }
export function noise(dur, vol, type, freq, q, delay, freqEnd){
  const c = ac(); if (!c) return;
  const t = c.currentTime + (delay || 0), s = c.createBufferSource(); s.buffer = nbuf(c);
  const f = c.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.setValueAtTime(freq || 900, t); if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t + dur); f.Q.value = q || .7;
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(out()); s.start(t, Math.random() * .4); s.stop(t + dur + .05);
}
export function tone(type, f1, f2, dur, vol, delay){
  const c = ac(); if (!c) return;
  const t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain(); o.type = type;
  o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(f2, 20), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out()); o.start(t); o.stop(t + dur + .05);
}

export const sfx = {
  pop(){ popSound(0, 1); },
  boing(){ tone('sine', 180, 720, .16, .18); tone('sine', 720, 240, .2, .12, .11); },
  chime(){ [1046, 1318, 1568, 2093].forEach((f, i) => tone('sine', f, f, .9, .05, i * .07)); },
  tick(){ tone('triangle', 1400, 1000, .07, .06); },
  boom(){ tone('sine', 150, 40, .5, .18); noise(.4, .08, 'lowpass', 300); },
  warp(){ tone('sawtooth', 60, 1600, 2.8, .05); tone('sine', 40, 400, 2.8, .12); noise(2.8, .05, 'bandpass', 300, 1.2, 0, 4000); },
  whoosh(){ noise(.6, .12, 'bandpass', 500, .6, 0, 2400); },
  stamp(){ tone('sine', 120, 50, .15, .2); noise(.1, .25, 'lowpass', 600); },
  paper(){ noise(.35, .1, 'bandpass', 2600, .5); },
  puff(){ noise(.45, .16, 'bandpass', 700, .5); },
  bad(){ tone('square', 230, 110, .25, .07); },
  yay(){ [523, 659, 784, 1046].forEach((f, i) => tone('triangle', f, f, .22, .1, i * .09)); },
  unlock(){ tone('triangle', 400, 800, .2, .08); setTimeout(() => sfx.chime(), 200); },
  // gift box opening: shimmer rising into a bright burst
  burst(){ noise(.9, .14, 'highpass', 1200, .5, 0, 6000); tone('sine', 220, 880, .5, .1); [784, 988, 1175, 1568, 1976].forEach((f, i) => tone('sine', f, f, .7, .045, .25 + i * .05)); }
};

/* ---------- balloon pops: 7 different sounds ----------
   Each balloon colour has its own family of pops, a random one is picked inside the family,
   and the pitch follows the balloon size (big = lower). Every 10th pop plays a jackpot. */
const crack = (p, v) => { noise(.05, (v || .32), 'highpass', 2200 * p, .8); noise(.09, .12, 'bandpass', 1200 * p, 1.2); };
const POPS = {
  rubber(p){ crack(p); tone('sine', 150 * p, 45, .18, .22); tone('square', 900 * p, 70, .12, .05); },
  squeak(p){ tone('triangle', 650 * p, 1500 * p, .11, .07); setTimeout(() => crack(p * 1.1), 95); },
  bass(p){ tone('sine', 115 * p, 32, .38, .32); noise(.22, .3, 'lowpass', 420 * p); noise(.04, .15, 'highpass', 1800); },
  sparkle(p){ crack(p, .26); [1568, 2093, 2637, 3136].forEach((f, i) => tone('sine', f * p, f * p, .45, .04, .03 + i * .055)); },
  bloop(p){ tone('sine', 1250 * p, 260 * p, .13, .14); tone('sine', 620 * p, 150, .22, .1, .04); noise(.03, .12, 'highpass', 3000); },
  confetti(p){ crack(p, .28); for (let i = 0; i < 7; i++) noise(.02 + Math.random() * .02, .05 + Math.random() * .05, 'highpass', 3000 + Math.random() * 3000, .9, .04 + Math.random() * .28); },
  whistle(p){ tone('sine', 1900 * p, 320 * p, .5, .05); noise(.5, .07, 'bandpass', 3200 * p, 3, 0, 700); setTimeout(() => crack(p * .9, .2), 430); }
};
const FAMILY = [['rubber', 'bloop'], ['sparkle', 'rubber'], ['squeak', 'confetti'], ['bass', 'whistle']];
let popCount = 0;
export function popSound(colorIndex, scale){
  popCount++;
  const fam = FAMILY[(colorIndex || 0) % FAMILY.length];
  const p = (1.15 - ((scale || 1) - .75) * .5) * (.92 + Math.random() * .16);
  POPS[fam[Math.floor(Math.random() * fam.length)]](p);
  if (popCount % 10 === 0){ setTimeout(() => { POPS.sparkle(1.2); sfx.yay(); }, 180); }
  return popCount;
}

/* ---------- ambient pad + music box ---------- */
const PAD = [[261.63, 329.63, 392, 493.88], [220, 261.63, 329.63, 392], [174.61, 220, 261.63, 329.63], [196, 246.94, 293.66, 392]];
let padOn = false, padTimer = 0, padGain = null, padStep = 0;
function padChord(){
  const c = ac(); if (!c || !padOn) return;
  const t = c.currentTime, ch = PAD[padStep++ % PAD.length];
  ch.forEach(f => [[f, 'sine', .2], [f * 2.003, 'triangle', .04], [f / 2, 'sine', .11]].forEach(([fr, type, v]) => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = fr; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 2.2); g.gain.linearRampToValueAtTime(v * .8, t + 5); g.gain.exponentialRampToValueAtTime(0.0001, t + 8.5); o.connect(g); g.connect(padGain); o.start(t); o.stop(t + 8.6); }));
  for (let k = 0; k < 3; k++){ const f = ch[Math.floor(Math.random() * 4)] * 4, o = c.createOscillator(), g = c.createGain(), tt = t + 1 + Math.random() * 4; o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, tt); g.gain.linearRampToValueAtTime(.045, tt + .02); g.gain.exponentialRampToValueAtTime(0.0001, tt + 1.6); o.connect(g); g.connect(padGain); o.start(tt); o.stop(tt + 1.7); }
  padTimer = setTimeout(padChord, 6000);
}
export function startPad(){ const c = ac(); if (!c || padOn) return; padOn = true; padGain = c.createGain(); padGain.gain.setValueAtTime(0, c.currentTime); padGain.gain.linearRampToValueAtTime(.09, c.currentTime + 3); const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1900; padGain.connect(lp); lp.connect(out()); padChord(); }
export function stopPad(){ padOn = false; clearTimeout(padTimer); if (padGain && actx){ try { padGain.gain.setTargetAtTime(0, actx.currentTime, .3); } catch(e){} } }
export function duckPad(v){ if (padOn && padGain && actx) padGain.gain.setTargetAtTime(v, actx.currentTime, .5); }
// bring the music back only when no video with sound is still playing
export function restorePad(){ setTimeout(() => { if (!Array.from(document.querySelectorAll('video')).some(x => !x.paused && !x.ended && !x.muted)) duckPad(.09); }, 60); }
const NOTES = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
const SONG = [['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2], ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2], ['G4', .75], ['G4', .25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2], ['F5', .75], ['F5', .25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3]];
export function musicBox(){ const c = ac(); if (!c) return; let t = c.currentTime + .1; SONG.forEach(([n, d]) => { const f = NOTES[n] * 2; [[1, .08, 1.4], [3.01, .02, .5]].forEach(([m, v, dur]) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f * m; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(out()); o.start(t); o.stop(t + dur + .05); }); t += d * .42; }); }
