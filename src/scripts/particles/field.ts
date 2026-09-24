import { clamp, easeInOut, seededRandom } from '../../lib/util';
import type { FrameContext, Section } from '../core/types';

/**
 * A page-wide particle field that lives behind the content and guides the eye.
 *
 * Elements marked with `data-focus="<group>"` are focus targets. Every frame
 * the field measures how centred each visible target is in the viewport; the
 * most centred ones become the focus and outline particles gather around
 * their edges. Between sections nothing is centred, so particles scatter
 * across the screen and then regroup around the next focus.
 */

interface Particle {
  /** Slot along the combined outline of the focused targets (0..1). */
  u: number;
  /** Own distance outside the edge (px): the silhouette is suggested, not drawn. */
  spread: number;
  /** Ambient particles never join an outline: they are the background. */
  ambient: boolean;
  depth: number;
  orange: boolean;
  phase: number;
  speed: number;
  /** Scatter position as a fraction of the viewport. */
  fx: number;
  fy: number;
  /** Intro cloud offset (gaussian) around the first focus. */
  cx: number;
  cy: number;
  /** Rendered position (springs toward its target) and cursor push. */
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
}

interface StreamDot {
  delay: number;
  jx: number;
  jy: number;
  depth: number;
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface FieldOptions {
  /** Per-group weight multipliers (e.g. fade the hero devices out as they scroll away). */
  weights?: Record<string, () => number>;
  /** performance.now() of the hero intro; particles appear and condense from it. */
  introStart: number;
}

const PARTICLES_DESKTOP = 950;
const PARTICLES_MOBILE = 260;
const AMBIENT_SHARE = 0.22; // particles that never join an outline (pure background)
const OUTLINE_PAD = 10; // px outside the target: particles surround, never cover
const FOCUS_RANGE = 0.45; // fraction of the viewport over which focus fades
const FOLLOW = 0.05; // spring toward the target per frame (lower = calmer arrival)
const MAX_PULL = 0.9; // never snap fully onto the outline
const SPREAD_NEAR = 16; // typical distance from the edge (px)
const SPREAD_HALO = 70; // extra distance for the loose halo particles (px)
const HALO_SHARE = 0.3; // fraction of outline particles that form the halo
const REPEL_RADIUS = 130;
const STREAM_MS = 1100;

export class ParticleField implements Section {
  private readonly ctx2d: CanvasRenderingContext2D;
  /** Focus targets; the markup is static, so they are collected once. */
  private readonly targets = Array.from(document.querySelectorAll<HTMLElement>('[data-focus]'));
  private particles: Particle[] = [];
  private stream: StreamDot[] = [];
  private streamStart = 0;
  private streamEnds: (() => [DOMRect, DOMRect] | null) | null = null;
  private mobile: boolean | null = null;
  private mx = -999;
  private my = -999;
  private placed = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly options: FieldOptions,
  ) {
    this.ctx2d = canvas.getContext('2d')!;
    window.addEventListener(
      'pointermove',
      (e) => {
        this.mx = e.clientX;
        this.my = e.clientY;
      },
      { passive: true },
    );
    requestAnimationFrame(this.frame);
  }

  resize(ctx: FrameContext): void {
    if (ctx.mobile !== this.mobile) {
      this.mobile = ctx.mobile;
      this.particles = this.createParticles(ctx.mobile ? PARTICLES_MOBILE : PARTICLES_DESKTOP);
      this.placed = false;
    }
  }

  /** Arc of glowing dots between two elements (the hero booking). */
  spawnStream(ends: () => [DOMRect, DOMRect] | null): void {
    const n = this.mobile ? 40 : 90;
    this.stream = Array.from({ length: n }, () => ({
      delay: Math.random() * 0.4,
      jx: (Math.random() - 0.5) * 90,
      jy: (Math.random() - 0.5) * 90,
      depth: 0.5 + Math.random() * 0.8,
    }));
    this.streamEnds = ends;
    this.streamStart = performance.now();
  }

  private createParticles(count: number): Particle[] {
    const rand = seededRandom(3);
    const gauss = () => {
      let u = 0;
      let v = 0;
      while (!u) u = rand();
      while (!v) v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    return Array.from({ length: count }, (_, i) => ({
      u: (i + rand() * 0.8) / count,
      spread: Math.abs(gauss()) * SPREAD_NEAR + (rand() < HALO_SHARE ? rand() * SPREAD_HALO : 0),
      ambient: rand() < AMBIENT_SHARE,
      depth: 0.3 + rand() * 0.7,
      orange: rand() < 0.3,
      phase: rand() * 6.28,
      speed: 0.4 + rand() * 0.9,
      fx: rand(),
      fy: rand(),
      cx: gauss() * 0.42,
      cy: gauss() * 0.42,
      x: 0,
      y: 0,
      ox: 0,
      oy: 0,
      vx: 0,
      vy: 0,
    }));
  }

  /** The most centred visible targets, padded, with an overall focus strength. */
  private measureFocus(vh: number): { boxes: Box[]; strength: number } {
    const mid = vh / 2;
    const found: { box: Box; s: number }[] = [];
    this.targets.forEach((el) => {
      if (el.offsetParent === null) return; // display:none (e.g. the desktop laptop on mobile)
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.bottom < -100 || r.top > vh + 100) return;
      const nearest = clamp(mid, r.top, r.bottom);
      const weight = this.options.weights?.[el.dataset.focus ?? '']?.() ?? 1;
      const s = (1 - clamp(Math.abs(nearest - mid) / (vh * FOCUS_RANGE))) * weight;
      if (s > 0.05) {
        found.push({
          box: {
            left: r.left - OUTLINE_PAD,
            top: r.top - OUTLINE_PAD,
            width: r.width + OUTLINE_PAD * 2,
            height: r.height + OUTLINE_PAD * 2,
          },
          s,
        });
      }
    });
    const strength = Math.max(0, ...found.map((f) => f.s));
    const boxes = found.filter((f) => f.s >= strength * 0.6).map((f) => f.box);
    return { boxes, strength };
  }

  /**
   * Point at fraction u of the combined perimeter of several boxes, pushed
   * `offset` px outward along that edge's normal.
   */
  private outlinePoint(boxes: Box[], total: number, u: number, offset: number): [number, number] {
    let d = u * total;
    for (const b of boxes) {
      const p = 2 * (b.width + b.height);
      if (d > p) {
        d -= p;
        continue;
      }
      if (d < b.width) return [b.left + d, b.top - offset];
      d -= b.width;
      if (d < b.height) return [b.left + b.width + offset, b.top + d];
      d -= b.height;
      if (d < b.width) return [b.left + b.width - d, b.top + b.height + offset];
      d -= b.width;
      return [b.left - offset, b.top + b.height - d];
    }
    return [0, 0];
  }

  private frame = (now: number): void => {
    requestAnimationFrame(this.frame);
    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const c = this.canvas;
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    }
    const x = this.ctx2d;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, W, H);

    const t = now - this.options.introStart;
    const appear = clamp((t - 400) / 600);
    const condensed = easeInOut(clamp((t - 1100) / 900));
    const { boxes, strength } = this.measureFocus(H);
    const pull = easeInOut(strength) * condensed * MAX_PULL;
    const total = boxes.reduce((sum, b) => sum + 2 * (b.width + b.height), 0);

    // Before the intro finishes, the scatter state is a cloud around the first focus.
    const first = boxes[0];
    const cloudX = first ? first.left + first.width / 2 : W / 2;
    const cloudY = first ? first.top + first.height / 2 : H / 2;
    const span = first ? Math.max(first.width, 300) * 1.6 : W / 2;

    const seconds = now / 1000;
    for (const p of this.particles) {
      const dx = Math.sin(seconds * p.speed + p.phase) * 7 * p.depth;
      const dy = Math.cos(seconds * p.speed * 0.8 + p.phase) * 6 * p.depth;
      let tx = W * p.fx + (cloudX + p.cx * span - W * p.fx) * (1 - condensed);
      let ty = H * p.fy + (cloudY + p.cy * span * 0.6 - H * p.fy) * (1 - condensed);
      if (!p.ambient && total > 0) {
        // The distance to the edge breathes slowly, so the silhouette never looks drawn.
        const breathe = 1 + 0.35 * Math.sin(seconds * 0.45 + p.phase);
        const [qx, qy] = this.outlinePoint(boxes, total, p.u, p.spread * breathe);
        tx += (qx - tx) * pull;
        ty += (qy - ty) * pull;
      }
      if (!this.placed) {
        p.x = tx;
        p.y = ty;
      }
      p.x += (tx - p.x) * FOLLOW;
      p.y += (ty - p.y) * FOLLOW;
      const drift = p.ambient ? 2.4 : 1.8 + (1 - pull) * 0.8;
      const X = p.x + dx * drift;
      const Y = p.y + dy * drift;
      if (!this.mobile) this.repel(p, X, Y);

      // Halo particles (far from the edge) fade out: dense near the silhouette, soft beyond.
      const outlineAlpha = (0.25 + 0.5 * p.depth) * (1 - Math.min(0.6, p.spread / 140));
      const ambientAlpha = 0.1 + 0.3 * p.depth;
      x.globalAlpha = appear * (p.ambient ? ambientAlpha : ambientAlpha + (outlineAlpha - ambientAlpha) * pull);
      x.fillStyle = p.orange ? '#ff9933' : '#ebebeb';
      x.beginPath();
      x.arc(X + p.ox, Y + p.oy, 0.5 + 1.3 * p.depth, 0, 6.283);
      x.fill();
    }
    this.placed = true;
    this.drawStream(now);
    x.globalAlpha = 1;
  };

  /** The cursor pushes nearby particles away; a spring brings them back. */
  private repel(p: Particle, X: number, Y: number): void {
    const dx = X + p.ox - this.mx;
    const dy = Y + p.oy - this.my;
    const d = Math.hypot(dx, dy);
    if (d < REPEL_RADIUS && d > 0.1) {
      const f = ((REPEL_RADIUS - d) / REPEL_RADIUS) * 1.6;
      p.vx += (dx / d) * f;
      p.vy += (dy / d) * f;
    }
    p.vx = (p.vx - p.ox * 0.05) * 0.86;
    p.vy = (p.vy - p.oy * 0.05) * 0.86;
    p.ox += p.vx;
    p.oy += p.vy;
  }

  private drawStream(now: number): void {
    if (!this.stream.length || !this.streamEnds) return;
    const ends = this.streamEnds();
    if (!ends) return;
    const [from, to] = ends;
    const fx = from.left + from.width * 0.3;
    const fy = from.bottom - 40;
    const tx = to.left + to.width / 2;
    const ty = to.top + to.height / 2;
    const g = (now - this.streamStart) / STREAM_MS;
    const x = this.ctx2d;
    x.fillStyle = '#ff9933';
    let alive = false;
    for (const s of this.stream) {
      const q = clamp(g * 1.4 - s.delay);
      if (q < 1) alive = true;
      if (q <= 0 || q >= 1) continue;
      const k = easeInOut(q);
      const mx = (fx + tx) / 2 + s.jx;
      const my = Math.min(fy, ty) - 150 + s.jy;
      const X = (1 - k) * (1 - k) * fx + 2 * (1 - k) * k * mx + k * k * tx;
      const Y = (1 - k) * (1 - k) * fy + 2 * (1 - k) * k * my + k * k * ty;
      x.globalAlpha = 0.16;
      x.beginPath();
      x.arc(X, Y, 5 * s.depth, 0, 6.283);
      x.fill();
      x.globalAlpha = 0.95;
      x.beginPath();
      x.arc(X, Y, 1.5 * s.depth + 0.4, 0, 6.283);
      x.fill();
    }
    if (!alive) this.stream = [];
  }
}
