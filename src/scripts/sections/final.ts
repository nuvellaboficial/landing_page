import { onceVisible } from '../core/motion';

/** Final CTA: the headline returns (mirror of the hero) and the dots form an appointment. */
export const initFinal = (): void => {
  const root = document.querySelector<HTMLElement>('[data-final]');
  if (!root) return;
  onceVisible(root, () => {
    root.classList.add('is-in');
    root.querySelectorAll('[data-final-word]').forEach((w) => w.classList.add('is-revealed'));
  });
};
