import { NICHES, type Niche } from '../../lib/data';
import { agendaHtml, agendaLayout, miniAgendaHtml, nicheScript, visibleMessages } from '../../lib/templates';
import { ChatView } from '../core/chat-view';
import { Timeline } from '../core/motion';

/** Moments of the ~8.8 s loop: [ms after loop start, chat lines visible]. */
const CHAT_STEPS: readonly (readonly [number, number])[] = [
  [500, 1],
  [1300, 2],
  [2300, 3],
  [3400, 4],
  [4100, 5],
  [4900, 6],
];
const STREAM_FLIGHT_MS = 1150;
const GLOW_MS = 1400;
const LOOP_MS = 8800;
export const INTRO_MS = 2600;

export interface HeroEvents {
  /** The bot confirmed: launch the particle stream toward the agenda. */
  onBooked(): void;
}

/**
 * Hero choreography: the intro sequence (headline, screens, copy) and the
 * booking loop that cycles through the four niches.
 */
export class HeroController {
  private readonly root = document.querySelector<HTMLElement>('[data-hero]')!;
  private readonly chat: ChatView;
  private readonly intro = new Timeline();
  private readonly loop = new Timeline();
  private nicheIndex = 0;
  /** performance.now() when the intro started; the particle scene keys off it. */
  introStart = 0;

  constructor(private readonly events: HeroEvents) {
    const phone = this.root.querySelector<HTMLElement>('[data-hero-phone]')!;
    this.chat = new ChatView(
      phone.querySelector<HTMLElement>('[data-chat="hero"]')!,
      phone.querySelector<HTMLElement>('[data-chat-status]'),
    );
  }

  /** Where the particle stream leaves from. */
  get chatBody(): HTMLElement {
    return this.root.querySelector<HTMLElement>('[data-chat="hero"]')!;
  }

  /** The appointment block the stream lands on (laptop on desktop, mini card on mobile). */
  get target(): HTMLElement | null {
    const all = this.root.querySelectorAll<HTMLElement>('.appt-landing');
    return Array.from(all).find((el) => el.offsetParent !== null) ?? null;
  }

  get element(): HTMLElement {
    return this.root;
  }

  start(): void {
    this.introStart = performance.now();
    this.renderNiche(NICHES[0]);
    const words = this.root.querySelectorAll('[data-hero-word]');
    this.intro
      .at(800, () => words[0]?.classList.add('is-revealed'))
      .at(950, () => words[1]?.classList.add('is-revealed'))
      .at(1100, () => words[2]?.classList.add('is-revealed'))
      .at(2000, () => this.root.classList.add('screens-on'))
      .at(2150, () => this.root.querySelector('[data-hero-intro]')?.classList.add('is-in'))
      .at(INTRO_MS, () => this.runLoop());
  }

  private runLoop(): void {
    const niche = NICHES[this.nicheIndex];
    const script = nicheScript(niche);
    for (const [ms, count] of CHAT_STEPS) {
      this.loop.at(ms, () => {
        this.chat.set(visibleMessages(script, count));
        if (count === script.length) this.book();
      });
    }
    this.loop.at(LOOP_MS, () => {
      this.loop.clear();
      this.nicheIndex = (this.nicheIndex + 1) % NICHES.length;
      this.renderNiche(NICHES[this.nicheIndex]);
      this.runLoop();
    });
  }

  private book(): void {
    this.events.onBooked();
    this.loop.at(STREAM_FLIGHT_MS, () => {
      this.setLanding('is-landed', true);
      this.setLanding('is-glowing', true);
      this.loop.at(GLOW_MS, () => this.setLanding('is-glowing', false));
    });
  }

  private setLanding(cls: string, on: boolean): void {
    this.root.querySelectorAll('.appt-landing').forEach((el) => el.classList.toggle(cls, on));
  }

  /** Swap agenda, mini card and chat header to a niche, with the new appointment hidden. */
  private renderNiche(n: Niche): void {
    const q = <T extends HTMLElement>(sel: string) => this.root.querySelector<T>(sel);
    const agenda = q('[data-hero-agenda]');
    if (agenda) agenda.innerHTML = agendaHtml(agendaLayout(n), { columnLines: true, targetClass: 'appt-landing' });
    const mini = q('[data-hero-mini]');
    if (mini) mini.innerHTML = miniAgendaHtml(n, 'appt-landing');
    const date = q('[data-hero-date]');
    if (date) date.textContent = n.date;
    const initials = q('[data-hero-phone] [data-chat-initials]');
    if (initials) initials.textContent = n.bizInitials;
    const biz = q('[data-hero-phone] [data-chat-biz]');
    if (biz) biz.textContent = n.biz;
    this.chat.clear();
  }
}
