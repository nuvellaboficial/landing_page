/**
 * Composition root. Builds every section controller and owns the only
 * scroll and resize listeners: updates are batched into one animation frame
 * and fanned out to the sections with a shared FrameContext.
 */
import Lenis from 'lenis';
import { clamp } from '../lib/util';
import { applyDeviceScales, readContext } from './core/viewport';
import type { FrameContext, Section } from './core/types';
import { ParticleField } from './particles/field';
import { initBot } from './sections/bot';
import { initFacts } from './sections/facts';
import { initFinal } from './sections/final';
import { HeroController } from './sections/hero';
import { HeroTilt } from './sections/hero-tilt';
import { createHowItWorks } from './sections/how';
import { createNav } from './sections/nav';
import { initNiches } from './sections/niches';
import { createPanel } from './sections/panel';
import { createProblem } from './sections/problem';
import { createStart } from './sections/start';

// The inline head script adds html.motion unless the visitor prefers reduced
// motion or saves data. Without it, the page renders in its final state.
const still = !document.documentElement.classList.contains('motion');

const lenis = still ? null : new Lenis({ autoRaf: true, anchors: true });
const scrollTo = (y: number) => (lenis ? lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: 'smooth' }));

const sections: Section[] = [];
const add = (s: Section | null) => s && sections.push(s);

add(createNav({ onMenuToggle: (open) => (open ? lenis?.stop() : lenis?.start()) }));

if (!still) {
  let field: ParticleField | null = null;
  const hero = new HeroController({
    // The bot confirmed: a stream of particles flies from the chat to the new appointment.
    onBooked: () =>
      field?.spawnStream(() => {
        const to = hero.target;
        return to ? [hero.chatBody.getBoundingClientRect(), to.getBoundingClientRect()] : null;
      }),
  });
  const rig = document.querySelector<HTMLElement>('[data-hero-rig]');
  const tilt = rig ? new HeroTilt(hero.element, rig) : null;
  add(tilt);
  hero.start();

  const canvas = document.querySelector<HTMLCanvasElement>('[data-particles]');
  if (canvas) {
    field = new ParticleField(canvas, {
      introStart: hero.introStart,
      // Hero devices stop being the focus as they rise and fade on scroll.
      weights: { hero: () => 1 - clamp(((tilt?.exitProgress ?? 0) - 0.05) * 2) },
    });
    add(field);
  }
  initBot();
  initFacts();
  initFinal();
}

add(createProblem());
add(createHowItWorks());
add(createPanel({ scrollTo }));
add(createStart());
initNiches(still);

/* ---------- Frame scheduling ---------- */

let ctx: FrameContext = readContext(still);
let queued = false;

const frame = () => {
  queued = false;
  ctx = { ...ctx, scrollY: window.scrollY };
  for (const s of sections) s.update?.(ctx);
};
const requestFrame = () => {
  if (!queued) {
    queued = true;
    requestAnimationFrame(frame);
  }
};
const resize = () => {
  ctx = readContext(still);
  applyDeviceScales(ctx);
  for (const s of sections) s.resize?.(ctx);
  requestFrame();
};

window.addEventListener('scroll', requestFrame, { passive: true });
window.addEventListener('resize', resize, { passive: true });
resize();
