import { chatStatus, messageHtml, type ChatMessage } from '../../lib/templates';

/**
 * Renders a chat into a container, touching only what changed: it keeps the
 * common prefix, removes the rest and appends new bubbles. That way only new
 * bubbles play their entrance animation, and scrolling back up "un-types" the
 * conversation without re-animating the whole thread.
 */
export class ChatView {
  private keys: string[] = [];

  constructor(
    private readonly body: HTMLElement,
    private readonly status?: HTMLElement | null,
  ) {}

  set(messages: ChatMessage[]): void {
    let common = 0;
    while (common < this.keys.length && common < messages.length && this.keys[common] === messages[common].key) {
      common++;
    }
    while (this.body.children.length > common) this.body.lastElementChild?.remove();
    const fresh = messages.slice(common);
    if (fresh.length) this.body.insertAdjacentHTML('beforeend', fresh.map(messageHtml).join(''));
    this.keys = messages.map((m) => m.key);
    if (this.status) this.status.textContent = chatStatus(messages);
  }

  clear(): void {
    this.set([]);
  }
}
