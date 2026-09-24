import { NICHES } from '../../lib/data';
import { nicheScript, visibleMessages } from '../../lib/templates';
import { ChatView } from '../core/chat-view';
import { onceVisible } from '../core/motion';

const SERVICES_OUT_MS = 230;
const MESSAGE_EVERY_MS = 600;

/**
 * "Para tu tipo de negocio": switching tabs rewrites the chat for that niche
 * and swaps its three services with a staggered entrance.
 */
export const initNiches = (still: boolean): void => {
  const root = document.querySelector<HTMLElement>('[data-niches]');
  const body = root?.querySelector<HTMLElement>('[data-chat="niches"]');
  const services = root?.querySelector<HTMLElement>('[data-niche-services]');
  if (!root || !body || !services) return;

  const q = (sel: string) => root.querySelector<HTMLElement>(sel);
  const tabs = Array.from(root.querySelectorAll<HTMLElement>('[data-niche-tab]'));
  const rows = Array.from(services.children) as HTMLElement[];
  const chat = new ChatView(body, q('[data-chat-status]'));
  let current = 0;
  let typing = 0;
  let swap = 0;

  const render = (i: number) => {
    const n = NICHES[i];
    tabs.forEach((t, k) => {
      t.classList.toggle('is-active', k === i);
      t.setAttribute('aria-selected', String(k === i));
    });
    const initials = q('[data-chat-initials]');
    const biz = q('[data-chat-biz]');
    if (initials) initials.textContent = n.bizInitials;
    if (biz) biz.textContent = n.biz;
    rows.forEach((row, k) => {
      const [name, duration, price] = n.services[k];
      row.querySelector('[data-svc-name]')!.textContent = name;
      row.querySelector('[data-svc-duration]')!.textContent = duration;
      row.querySelector('[data-svc-price]')!.textContent = price;
    });
  };

  const play = (i: number) => {
    current = i;
    clearInterval(typing);
    clearTimeout(swap);
    if (still) {
      render(i);
      chat.set(visibleMessages(nicheScript(NICHES[i]), 6));
      return;
    }
    services.classList.remove('is-in');
    swap = window.setTimeout(() => {
      render(i);
      services.classList.add('is-in');
      const script = nicheScript(NICHES[i]);
      let shown = 0;
      chat.clear();
      typing = window.setInterval(() => {
        chat.set(visibleMessages(script, ++shown));
        if (shown >= script.length) clearInterval(typing);
      }, MESSAGE_EVERY_MS);
    }, SERVICES_OUT_MS);
  };

  tabs.forEach((tab, i) => tab.addEventListener('click', () => i !== current && play(i)));

  if (!still) {
    chat.clear();
    services.classList.remove('is-in');
    onceVisible(root, () => play(0));
  }
};
