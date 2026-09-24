/** Small, dependency-free animation helpers. */
import { clamp, easeOut } from '../../lib/util';

/** Pinned-section progress: 0 when its top reaches the viewport top, 1 when its bottom reaches the viewport bottom. */
export const pinProgress = (el: HTMLElement, viewportH: number): number => {
  const r = el.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - viewportH));
};

/** Animates a number with ease-out. Returns a cancel function. */
export const tween = (
  from: number,
  to: number,
  durationMs: number,
  onUpdate: (value: number) => void,
): (() => void) => {
  const t0 = performance.now();
  let raf = 0;
  const frame = (now: number) => {
    const t = clamp((now - t0) / durationMs);
    onUpdate(from + (to - from) * easeOut(t));
    if (t < 1) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
};

/** A group of timeouts that can be cleared together (intro sequences, loops). */
export class Timeline {
  private ids: number[] = [];

  at(ms: number, fn: () => void): this {
    this.ids.push(window.setTimeout(fn, ms));
    return this;
  }

  clear(): void {
    this.ids.forEach(clearTimeout);
    this.ids = [];
  }
}

/**
 * Calls `onEnter` every time the element becomes at least `threshold` visible
 * and `onLeave` when it leaves the viewport entirely.
 */
export const watchVisibility = (
  el: Element,
  onEnter: () => void,
  onLeave?: () => void,
  threshold = 0.25,
): void => {
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= threshold) onEnter();
      else if (!entry.isIntersecting) onLeave?.();
    },
    { threshold: [0, threshold] },
  );
  io.observe(el);
};

/** Runs `fn` once, the first time the element is `threshold` visible. */
export const onceVisible = (el: Element, fn: () => void, threshold = 0.25): void => {
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
        io.disconnect();
        fn();
      }
    },
    { threshold: [0, threshold] },
  );
  io.observe(el);
};
