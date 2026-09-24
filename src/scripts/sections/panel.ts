import { CASH, PANEL_ITEMS, PANEL_MOBILE_TITLES } from '../../lib/data';
import { formatCop } from '../../lib/util';
import { onceVisible, pinProgress, Timeline, tween } from '../core/motion';
import type { FrameContext, Section } from '../core/types';

const HOME = 0;
const CASH_SCREEN = 2;
const DEPOSIT = 3;

interface PanelOptions {
  /** Smooth scroll used when a desktop item is clicked (Lenis if present). */
  scrollTo(y: number): void;
}

/**
 * "Tu panel": on desktop the scroll picks one of five screens (the section
 * is pinned for five stretches); on mobile a snap carousel does. Each screen
 * has its own live detail: cash counting up, a new deposit, an approval.
 */
export const createPanel = ({ scrollTo }: PanelOptions): Section | null => {
  const root = document.querySelector<HTMLElement>('[data-panel]');
  if (!root) return null;

  const all = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T & HTMLElement>(sel));
  const items = all('[data-panel-item]');
  const cards = all('[data-panel-card]');
  const screens = all('.screen');
  const mobileScreens = all('[data-mscreen]');
  const navItems = all('[data-nav-item]');
  const mobileTitle = root.querySelector<HTMLElement>('[data-mobile-title]');
  const carousel = root.querySelector<HTMLElement>('[data-panel-carousel]');
  const details = new Timeline();
  let cancelTween: (() => void) | null = null;
  let active = -1;
  let ctx: FrameContext | null = null;

  const setText = (sel: string, value: number) => all(sel).forEach((el) => (el.textContent = formatCop(value)));
  const setIncome = (v: number) => {
    setText('[data-cash-income]', v);
    setText('[data-cash-net]', v - CASH.expenses);
  };

  /** Replays the live detail of a screen. */
  const playDetail = (i: number) => {
    details.clear();
    cancelTween?.();
    if (i === HOME) {
      cancelTween = tween(0, CASH.todayNet, 1300, (v) => setText('[data-cash-today]', v));
    } else if (i === CASH_SCREEN) {
      all('[data-cash-new]').forEach((el) => el.classList.remove('is-in'));
      setIncome(CASH.incomeBefore);
      details.at(1100, () => {
        all('[data-cash-new]').forEach((el) => el.classList.add('is-in'));
        cancelTween = tween(CASH.incomeBefore, CASH.incomeAfter, 900, setIncome);
      });
    } else if (i === DEPOSIT) {
      all('[data-deposit]').forEach((el) => el.classList.remove('is-approved'));
      details.at(1500, () => all('[data-deposit]').forEach((el) => el.classList.add('is-approved')));
    }
  };

  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    items.forEach((el, k) => {
      el.classList.toggle('is-active', k === i);
      el.setAttribute('aria-selected', String(k === i));
    });
    cards.forEach((el, k) => el.classList.toggle('is-active', k === i));
    screens.forEach((el, k) => {
      el.classList.toggle('is-active', k === i);
      el.classList.toggle('is-past', k < i);
    });
    mobileScreens.forEach((el, k) => (el.hidden = k !== i));
    navItems.forEach((el) => el.classList.toggle('is-active', el.dataset.navItem === PANEL_ITEMS[i][2]));
    if (mobileTitle) mobileTitle.textContent = PANEL_MOBILE_TITLES[i];
    if (ctx && !ctx.still) playDetail(i);
  };

  items.forEach((el, i) =>
    el.addEventListener('click', () => {
      if (!ctx || ctx.still) return setActive(i);
      // Jump to the middle of that item's scroll stretch; the scroll picks the screen.
      const top = root.getBoundingClientRect().top + window.scrollY;
      scrollTo(top + ((i + 0.5) / PANEL_ITEMS.length) * (root.offsetHeight - ctx.viewportH));
    }),
  );
  cards.forEach((el, i) => el.addEventListener('click', () => setActive(i)));
  carousel?.addEventListener(
    'scroll',
    () => {
      const first = cards[0];
      if (!first) return;
      const i = Math.round(carousel.scrollLeft / (first.offsetWidth + 12));
      setActive(Math.max(0, Math.min(PANEL_ITEMS.length - 1, i)));
    },
    { passive: true },
  );

  // Start the first screen's detail when the section is first seen, not at page load.
  onceVisible(root, () => {
    if (!ctx?.still && active <= 0) playDetail(HOME);
  }, 0.1);
  setActive(0);

  return {
    update(c: FrameContext) {
      ctx = c;
      if (c.still || c.mobile) return;
      setActive(Math.min(PANEL_ITEMS.length - 1, Math.floor(pinProgress(root, c.viewportH) * PANEL_ITEMS.length)));
    },
  };
};
