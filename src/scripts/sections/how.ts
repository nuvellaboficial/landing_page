import { HOW_SCRIPT, HOW_THRESHOLDS } from '../../lib/data';
import { visibleMessages } from '../../lib/templates';
import { clamp, easeInOut } from '../../lib/util';
import { ChatView } from '../core/chat-view';
import { pinProgress } from '../core/motion';
import type { FrameContext, Section } from '../core/types';

const STEP_2_AT = 0.2;
const STEP_3_AT = 0.62;
const FLIGHT = [0.66, 0.86] as const; // token flight window (progress)
const STEP = 0.005;

/**
 * "Cómo funciona": the chat types itself with the scroll (and un-types when
 * scrolling back), the active step lights up, and a token flies from the
 * phone to the agenda where the appointment lands.
 */
export const createHowItWorks = (): Section | null => {
  const root = document.querySelector<HTMLElement>('[data-how]');
  const body = root?.querySelector<HTMLElement>('[data-chat="how"]');
  const token = root?.querySelector<HTMLElement>('[data-how-token]');
  if (!root || !body || !token) return null;

  const chat = new ChatView(body, root.querySelector<HTMLElement>('[data-chat-status]'));
  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'));
  const targets = Array.from(root.querySelectorAll<HTMLElement>('.appt-landing'));
  let last = -1;

  const visibleTarget = () => targets.find((t) => t.offsetParent !== null);

  const flyToken = (p: number) => {
    const t = clamp((p - FLIGHT[0]) / (FLIGHT[1] - FLIGHT[0]));
    const target = visibleTarget();
    if (t <= 0 || t >= 1 || !target) {
      token.style.opacity = '0';
      return;
    }
    const from = body.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const fx = from.left + from.width * 0.3;
    const fy = from.bottom - 50;
    const tx = to.left + to.width / 2;
    const ty = to.top + to.height / 2;
    const k = easeInOut(t);
    const arc = Math.sin(Math.PI * k) * 120;
    token.style.opacity = '1';
    token.style.transform = `translate(${fx + (tx - fx) * k}px,${fy + (ty - fy) * k - arc}px) translate(-50%,-50%) scale(${1 - 0.3 * k})`;
  };

  return {
    update(ctx: FrameContext) {
      if (ctx.still) return; // server-rendered final state
      const p = Math.round(pinProgress(root, ctx.viewportH) / STEP) * STEP;
      if (p !== last) {
        last = p;
        const count = HOW_THRESHOLDS.filter((t) => p >= t).length;
        chat.set(visibleMessages(HOW_SCRIPT, count));
        const active = p < STEP_2_AT ? 0 : p < STEP_3_AT ? 1 : 2;
        steps.forEach((s, i) => s.classList.toggle('is-active', i === active));
        const landed = p >= FLIGHT[1];
        targets.forEach((t) => t.classList.toggle('is-landed', landed));
      }
      flyToken(p); // positions depend on layout, so recompute every frame while pinned
    },
  };
};
