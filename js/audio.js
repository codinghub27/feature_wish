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

/* ---------- balloon pops: 10 clearly different sounds ----------
   They play in a shuffled order (like a shuffled playlist), so two pops in a row never sound the same.
   Pitch follows the balloon size (big = lower). Every 10th pop adds a jackpot fanfare. */
// a tone with vibrato/tremolo, for squeaks, wobbles and whistles
function wobble(type, f1, f2, dur, vol, delay, rate, depth){
  const c = ac(); if (!c) return;
  const t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain(), l = c.createOscillator(), lg = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(f2, 20), t + dur);
  l.frequency.value = rate; lg.gain.value = depth; l.connect(lg); lg.connect(o.frequency);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + .02); g.gain.setValueAtTime(vol, t + dur * .7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out()); o.start(t); l.start(t); o.stop(t + dur + .05); l.stop(t + dur + .05);
}
const POPS = {
  // 1. classic rubber pop: sharp snap + body thump
  classic(p){ noise(.05, .38, 'highpass', 2200 * p, .8); tone('sine', 160 * p, 45, .18, .25); },
  // 2. cartoon boing: springy wobble, then a pop
  boing(p){ wobble('sine', 220 * p, 520 * p, .45, .2, 0, 14, 60 * p); noise(.04, .25, 'highpass', 2600, .8, .42); },
  // 3. squeaky rubber: high squeal sliding up, tiny pop
  squeak(p){ wobble('triangle', 900 * p, 2200 * p, .22, .09, 0, 32, 120); noise(.03, .2, 'highpass', 3500, .9, .2); },
  // 4. deep boom: heavy sub drop and rumble
  boom(p){ tone('sine', 95 * p, 28, .7, .4); noise(.5, .3, 'lowpass', 300 * p, .7); noise(.04, .12, 'highpass', 1500); },
  // 5. magic sparkle: soft puff + glittering bells
  sparkle(p){ noise(.06, .12, 'bandpass', 3000, 1); [1568, 1976, 2349, 2637, 3136].forEach((f, i) => tone('sine', f * p, f * p, .6, .05, .02 + i * .06)); },
  // 6. deflating whistle: the balloon flies away with a fluttering whistle
  whistle(p){ wobble('sine', 1600 * p, 380 * p, .9, .07, 0, 18, 70); noise(.9, .05, 'bandpass', 2500, 4, 0, 600); },
  // 7. water bloop: two rising bubbles
  bloop(p){ tone('sine', 280 * p, 1150 * p, .09, .22); tone('sine', 380 * p, 1500 * p, .08, .16, .09); },
  // 8. party popper: bang + crackling confetti
  popper(p){ noise(.12, .35, 'bandpass', 1400 * p, .6); tone('triangle', 600 * p, 1200 * p, .08, .06); for (let i = 0; i < 10; i++) noise(.015 + Math.random() * .02, .06 + Math.random() * .06, 'highpass', 3000 + Math.random() * 4000, .9, .06 + Math.random() * .35); },
  // 9. laser zap: futuristic pew from 2031
  laser(p){ tone('sawtooth', 2400 * p, 90, .28, .07); tone('square', 1800 * p, 60, .22, .04, .03); },
  // 10. kiss "mwah": soft smack and a sweet rising note
  kiss(p){ noise(.07, .3, 'lowpass', 900, 1.5); tone('sine', 520 * p, 880 * p, .25, .12, .05); }
};
const POP_NAMES = Object.keys(POPS);
let bag = [], lastPop = '', popCount = 0;
function nextPop(){
  if (!bag.length){ bag = POP_NAMES.slice().sort(() => Math.random() - .5); if (bag[bag.length - 1] === lastPop) bag.unshift(bag.pop()); }
  lastPop = bag.pop(); return lastPop;
}
export function popSound(colorIndex, scale){
  popCount++;
  const p = (1.15 - ((scale || 1) - .75) * .5) * (.94 + Math.random() * .12);
  POPS[nextPop()](p);
  if (popCount % 10 === 0) setTimeout(() => sfx.yay(), 250);
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
