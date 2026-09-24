import { onceVisible, tween } from '../core/motion';

const COUNT_MS = 1300;

/** "Lo que pasa cuando el bot contesta": dots gather, numbers count up, once. */
export const initFacts = (): void => {
  const root = document.querySelector<HTMLElement>('[data-facts]');
  if (!root) return;
  const counters = Array.from(root.querySelectorAll<HTMLElement>('[data-count]')).map((el) => ({
    el,
    to: Number(el.dataset.count),
    min: Number(el.dataset.countMin ?? 0),
  }));
  const paint = (k: number) =>
    counters.forEach(({ el, to, min }) => (el.textContent = String(Math.max(min, Math.round(to * k)))));

  paint(0);
  onceVisible(root, () => {
    root.classList.add('is-in');
    tween(0, 1, COUNT_MS, paint);
  });
};
