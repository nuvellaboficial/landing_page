import type { FrameContext, Section } from '../core/types';

/** A section counts as "current" while this line of the viewport is inside it. */
const PROBE = 0.4;

interface NavOptions {
  /** Pause/resume smooth scrolling while the full-screen menu is open. */
  onMenuToggle?: (open: boolean) => void;
}

/**
 * Compacts the header on scroll, marks the link of the section in view
 * (aria-current) and drives the accessible mobile menu.
 */
export const createNav = ({ onMenuToggle }: NavOptions = {}): Section => {
  const header = document.querySelector<HTMLElement>('[data-nav]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  const closeBtn = document.querySelector<HTMLButtonElement>('[data-menu-close]');
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-section-link]'));
  const sections = [...new Set(links.map((a) => a.hash))]
    .map((hash) => ({ hash, el: document.querySelector<HTMLElement>(hash) }))
    .filter((s): s is { hash: string; el: HTMLElement } => s.el !== null);
  let compact = false;
  let current: string | null = null;

  const markCurrent = (viewportH: number) => {
    const probe = viewportH * PROBE;
    const hit = sections.find(({ el }) => {
      const r = el.getBoundingClientRect();
      return r.top <= probe && r.bottom > probe;
    });
    const next = hit?.hash ?? null;
    if (next === current) return;
    current = next;
    links.forEach((a) => {
      if (a.hash === current) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };

  const setMenu = (open: boolean) => {
    if (!menu || !openBtn) return;
    menu.hidden = !open;
    openBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    onMenuToggle?.(open);
    (open ? closeBtn : openBtn)?.focus();
  };

  openBtn?.addEventListener('click', () => setMenu(true));
  closeBtn?.addEventListener('click', () => setMenu(false));
  menu?.querySelectorAll('[data-menu-link]').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu && !menu.hidden) setMenu(false);
  });

  return {
    update(ctx: FrameContext) {
      const next = ctx.scrollY > 30;
      if (next !== compact) {
        compact = next;
        header?.classList.toggle('is-compact', compact);
      }
      markCurrent(ctx.viewportH);
    },
  };
};
