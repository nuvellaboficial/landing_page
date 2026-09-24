import { NOTIFICATIONS } from '../../lib/data';
import { clamp, escapeHtml as e, seededRandom } from '../../lib/util';
import { pinProgress } from '../core/motion';
import type { FrameContext, Section } from '../core/types';

const PILE_END = 0.78; // progress at which every notification has arrived
const ORDER_AT = 0.84; // progress at which the pile tidies itself up
const STEP = 0.005; // progress quantization, avoids re-rendering every pixel

const el = (html: string): HTMLElement => {
  const t = document.createElement('template');
  t.innerHTML = html;
  return t.content.firstElementChild as HTMLElement;
};

/**
 * "El problema": notifications pile up faster and faster with the scroll,
 * spill out of the phone, then tidy up into an answered list.
 * Elements are created once and reordered, so CSS transitions survive updates.
 */
export const createProblem = (): Section | null => {
  const root = document.querySelector<HTMLElement>('[data-problem]');
  const list = root?.querySelector<HTMLElement>('[data-notifs]');
  if (!root || !list) return null;

  const rand = seededRandom(7);
  const spill = NOTIFICATIONS.map(() => ({ x: (rand() - 0.5) * 300, y: rand() * 50, r: (rand() - 0.5) * 26 }));
  const cards = NOTIFICATIONS.map(([name, text, time]) =>
    el(
      `<div class="notif"><div class="notif__icon"></div><div class="notif__body"><div class="notif__top"><span>${e(name)}</span><span class="notif__time">${e(time)}</span></div><div class="notif__text">${e(text)}</div></div></div>`,
    ),
  );
  const answered = (Array.from(list.children) as HTMLElement[]).reverse();
  let last = -1;
  let ordered: boolean | null = null;
  let shown = 0; // cards currently in the list, newest first

  const render = (p: number) => {
    const nowOrdered = p >= ORDER_AT;
    if (nowOrdered !== ordered) {
      ordered = nowOrdered;
      list.classList.toggle('is-ordered', ordered);
      list.replaceChildren(...(ordered ? answered : []));
      shown = 0;
    }
    if (ordered) return;

    // Only add/remove the difference so existing cards keep their transitions.
    const visible = Math.round(NOTIFICATIONS.length * Math.pow(clamp(p / PILE_END), 1.7));
    while (shown < visible) list.prepend(cards[shown++]);
    while (shown > visible) cards[--shown].remove();

    for (let j = 0; j < shown; j++) {
      const i = shown - 1 - j;
      const f = clamp((j - 5) / 4); // the oldest ones overflow the screen
      cards[i].style.transform = `translate(${spill[i].x * f}px,${spill[i].y * f}px) rotate(${spill[i].r * f}deg)`;
    }
  };

  return {
    update(ctx: FrameContext) {
      const p = ctx.still ? 1 : Math.round(pinProgress(root, ctx.viewportH) / STEP) * STEP;
      if (p !== last) {
        last = p;
        render(p);
      }
    },
  };
};
