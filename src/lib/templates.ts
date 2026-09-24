/**
 * HTML builders shared by Astro components (build time, via `set:html`) and
 * client scripts (runtime re-renders). Keeping one source guarantees the
 * server-rendered markup and the animated markup never drift apart.
 */
import type { ChatLine, Niche } from './data';
import { escapeHtml as e, formatHour, initials } from './util';

/* ---------- Chat ---------- */

export type ChatKind = 'c' | 'b' | 'sys' | 'typing' | 'img';

export interface ChatMessage {
  key: string;
  kind: ChatKind;
  text: string;
  time: string;
}

/** Client, typing, bot, client, typing, bot. */
export const nicheScript = (n: Niche): ChatLine[] => [n.msgs[0], ['typing'], n.msgs[1], n.msgs[2], ['typing'], n.msgs[3]];

/**
 * First `count` lines of a script. A typing indicator only survives while it is
 * the last visible line: once the bot answers, it is replaced by the answer.
 */
export const visibleMessages = (script: readonly ChatLine[], count: number): ChatMessage[] =>
  script
    .slice(0, count)
    .map((line, i) => ({ line, i }))
    .filter(({ line, i }) => line[0] !== 'typing' || i === count - 1)
    .map(({ line, i }) => ({
      key: `${i}-${line[0]}`,
      kind: line[0],
      text: line.length > 1 ? (line[1] as string) : '',
      time: line.length > 2 ? (line[2] as string) : '',
    }));

export const messageHtml = (m: ChatMessage): string => {
  switch (m.kind) {
    case 'c':
      return `<div class="bubble bubble--client">${e(m.text)}<div class="bubble__meta">${e(m.time)} <span class="bubble__ticks">✓✓</span></div></div>`;
    case 'b':
      return `<div class="bubble bubble--bot">${e(m.text)}<div class="bubble__meta">${e(m.time)}</div></div>`;
    case 'sys':
      return `<div class="bubble bubble--system">${e(m.text)}</div>`;
    case 'img':
      return `<div class="bubble bubble--image"><div class="bubble__receipt">comprobante.jpg</div></div>`;
    case 'typing':
      return `<div class="bubble bubble--typing" aria-label="escribiendo"><span></span><span></span><span></span></div>`;
  }
};

export const messagesHtml = (list: ChatMessage[]): string => list.map(messageHtml).join('');

/** Chat header status: "escribiendo…" while the last line is a typing indicator. */
export const chatStatus = (list: ChatMessage[]): string =>
  list.length && list[list.length - 1].kind === 'typing' ? 'escribiendo…' : 'en línea';

/* ---------- Agenda (dashboard "Agenda por personal") ---------- */

interface AgendaBlock {
  left: number;
  top: number;
  width: number;
  height: number;
  name: string;
  service: string;
  time: string;
}

const AGENDA_HOURS = 8;

export interface AgendaLayout {
  date: string;
  hours: { label: string; top: number }[];
  columns: { name: string; initials: string; left: number }[];
  blocks: AgendaBlock[];
  target: AgendaBlock & { price: string };
  targetWorker: { name: string; initials: string };
}

/** Positions (in px of the 880×550 mock screen) for a niche's day view. */
export const agendaLayout = (n: Niche, rowH = 60, columnsWidth = 610): AgendaLayout => {
  const start = Math.floor(n.hour) - 2;
  const colW = columnsWidth / n.workers.length;
  const y = (h: number) => (h - start) * rowH + 8;
  return {
    date: n.date,
    // More rows than fit: the calendar clips them, so the grid always reaches the bottom of the screen.
    hours: Array.from({ length: AGENDA_HOURS }, (_, i) => ({ label: formatHour(start + i), top: i * rowH + 8 })),
    columns: n.workers.map((w, i) => ({ name: w, initials: initials(w), left: i * colW })),
    blocks: n.busy.map(([col, offset, dur, name, service]) => ({
      left: col * colW + 4,
      width: colW - 8,
      top: y(n.hour + offset) + 2,
      height: dur * rowH - 4,
      name,
      service,
      time: formatHour(n.hour + offset),
    })),
    target: {
      left: n.column * colW + 4,
      width: colW - 8,
      top: y(n.hour) + 2,
      height: Math.max(26, n.durationH * rowH - 4),
      name: n.client,
      service: n.service,
      time: formatHour(n.hour),
      price: n.price,
    },
    targetWorker: { name: n.workers[n.column], initials: initials(n.workers[n.column]) },
  };
};

interface AgendaOptions {
  /** Vertical separators between worker columns. */
  columnLines?: boolean;
  /** Show the start time inside each block. */
  showTimes?: boolean;
  /** Extra class for the highlighted (new) appointment. */
  targetClass?: string;
  /** Extra markup placed inside the appointments area (same coordinates as blocks). */
  areaExtra?: string;
}

const px = (n: number) => `${Math.round(n * 100) / 100}px`;
const pos = (b: { left: number; top: number; width: number; height: number }) =>
  `left:${px(b.left)};top:${px(b.top)};width:${px(b.width)};height:${px(b.height)}`;

export const agendaHtml = (a: AgendaLayout, opts: AgendaOptions = {}): string => {
  const head = a.columns
    .map((c) => `<div class="cal__col"><div class="avatar">${e(c.initials)}</div><div>${e(c.name)}</div></div>`)
    .join('');
  const hours = a.hours
    .map((h) => `<div class="cal__hour" style="top:${px(h.top)}"><span>${e(h.label)}</span></div>`)
    .join('');
  const lines = opts.columnLines
    ? a.columns.map((c) => `<div class="cal__vline" style="left:${px(c.left)}"></div>`).join('')
    : '';
  const blocks = a.blocks
    .map(
      (b) =>
        `<div class="cal__block" style="${pos(b)}"><div class="cal__name">${e(b.name)}</div><div class="muted">${e(b.service)}</div>${
          opts.showTimes ? `<div class="dim">${e(b.time)}</div>` : ''
        }</div>`,
    )
    .join('');
  const t = a.target;
  const target = `<div class="cal__block cal__block--new ${opts.targetClass ?? ''}" style="${pos(t)}"><div class="cal__name">${e(t.name)}</div><div>${e(t.service)} · ${e(t.price)}</div></div>`;
  return `<div class="cal"><div class="cal__head"><div class="cal__gutter"></div>${head}</div><div class="cal__body">${hours}<div class="cal__area">${lines}${blocks}${target}${opts.areaExtra ?? ''}</div></div></div>`;
};

/** Compact single-worker agenda card used on mobile instead of the laptop. */
export const miniAgendaHtml = (n: Niche, targetClass = ''): string => {
  const a = agendaLayout(n);
  const rows = [-1, 0, 1]
    .map((o, i) => `<div class="mini-agenda__row" style="top:${i * 40}px">${e(formatHour(n.hour + o))}</div>`)
    .join('');
  return `<div class="mini-agenda__head"><div class="avatar">${e(a.targetWorker.initials)}</div><div class="mini-agenda__worker">${e(a.targetWorker.name)}</div></div><div class="mini-agenda__grid">${rows}<div class="mini-agenda__appt ${targetClass}"><div class="cal__name">${e(n.client)}</div><div class="cal__name">${e(n.service)}</div></div></div>`;
};
