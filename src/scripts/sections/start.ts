import { clamp } from '../../lib/util';
import type { FrameContext, Section } from '../core/types';

/** "Cómo empezamos": the orange line draws with the scroll and lights each step on arrival. */
export const createStart = (): Section | null => {
  const root = document.querySelector<HTMLElement>('[data-start]');
  const fill = root?.querySelector<HTMLElement>('[data-start-fill]');
  if (!root || !fill) return null;
  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-start-step]'));
  // Step i lights up once the line reaches its node (0, the middle, the end).
  const thresholds = steps.map((_, i) => (i === 0 ? 0.02 : i / (steps.length - 1) - 0.02));
  let last = -1;

  return {
    update(ctx: FrameContext) {
      if (ctx.still) return;
      const r = root.getBoundingClientRect();
      const p = Math.round(clamp((ctx.viewportH * 0.75 - r.top) / (r.height * 0.75)) * 100) / 100;
      if (p === last) return;
      last = p;
      fill.style.transform = ctx.mobile ? `scaleY(${p})` : `scaleX(${p})`;
      steps.forEach((s, i) => s.classList.toggle('is-on', p >= thresholds[i]));
    },
  };
};
