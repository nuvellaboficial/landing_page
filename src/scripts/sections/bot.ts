import { BENTO } from '../../lib/data';
import { visibleMessages } from '../../lib/templates';
import { ChatView } from '../core/chat-view';
import { watchVisibility } from '../core/motion';

const MESSAGE_EVERY_MS = 900;

/**
 * "Lo que el bot resuelve solo": each bento cell enters from its own side and
 * replays its mini conversation while visible; it freezes when it leaves.
 */
export const initBot = (): void => {
  document.querySelectorAll<HTMLElement>('[data-bento]').forEach((card) => {
    const i = Number(card.dataset.bento);
    const script = BENTO[i].script;
    const chat = new ChatView(card.querySelector<HTMLElement>('[data-chat]')!);
    let shown = 0;
    let timer = 0;

    chat.clear();

    const stop = () => {
      clearInterval(timer);
      timer = 0;
    };
    const play = () => {
      card.classList.add('is-in');
      if (timer || shown >= script.length) return;
      timer = window.setInterval(() => {
        chat.set(visibleMessages(script, ++shown));
        if (shown >= script.length) stop();
      }, MESSAGE_EVERY_MS);
    };

    watchVisibility(card, play, stop);
  });
};
