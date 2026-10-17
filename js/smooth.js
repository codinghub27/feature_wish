/* Smoothness layer: Lenis inertial scrolling (mouse/trackpad only; touch stays native) driven by the
   GSAP ticker, plus GSAP reveals for each chapter. Everything degrades to plain CSS if the libraries
   fail to load or the viewer prefers reduced motion. */
import { $$, reduce, app } from './core.js';

const hasGsap = !!window.gsap;

export function initSmooth(){
  if (!hasGsap || reduce) return;
  document.documentElement.classList.add('has-gsap');
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis){
    try {
      const lenis = new Lenis({ lerp: .1, smoothWheel: true, wheelMultiplier: 1 });
      app.lenis = lenis; lenis.stop(); // the gate is showing; unlocked on arrival
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    } catch(e){ app.lenis = null; }
  }
  // gentle parallax on chapter headings
  if (window.ScrollTrigger) $$('main .band:not(.hero) .h2').forEach(h => {
    gsap.fromTo(h, { yPercent: 18 }, { yPercent: -18, ease: 'none', scrollTrigger: { trigger: h, start: 'top bottom', end: 'bottom top', scrub: .6 } });
  });
}

// Called when a chapter scrolls into view for the first time.
export function revealBand(band){
  if (!hasGsap || reduce) return;
  const items = Array.from(band.querySelectorAll('.reveal'));
  if (!items.length) return;
  gsap.fromTo(items, { autoAlpha: 0, y: 46, filter: 'blur(8px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.15, ease: 'expo.out', stagger: .09, clearProps: 'filter,transform' });
}

export function revealHero(){
  if (!hasGsap || reduce) return;
  const items = $$('#hero .reveal');
  gsap.fromTo(items, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: .12, delay: 1.6, clearProps: 'transform' });
  gsap.fromTo('#hero .scroll-hint', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, delay: 2.6 });
}
