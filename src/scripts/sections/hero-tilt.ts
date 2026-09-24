import { clamp } from '../../lib/util';
import type { FrameContext, Section } from '../core/types';

/**
 * Hero devices lean toward the cursor (desktop) or with the scroll (mobile)
 * with a soft spring, and rise and fade as the hero scrolls away.
 * The spring runs in its own loop only while the hero is on screen.
 */
export class HeroTilt implements Section {
  private rx = 0;
  private ry = 0;
  private mx = -999;
  private my = -999;
  private exit = 0;
  private scrollY = 0;
  private mobile = false;
  private visible = true;
  private running = false;

  constructor(
    private readonly hero: HTMLElement,
    private readonly rig: HTMLElement,
  ) {
    window.addEventListener(
      'pointermove',
      (e) => {
        this.mx = e.clientX;
        this.my = e.clientY;
      },
      { passive: true },
    );
    new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.run();
    }).observe(hero);
  }

  /** 0 at the top of the page, 1 once the hero has mostly scrolled away. */
  get exitProgress(): number {
    return this.exit;
  }

  update(ctx: FrameContext): void {
    this.scrollY = ctx.scrollY;
    this.mobile = ctx.mobile;
    this.exit = clamp(ctx.scrollY / (this.hero.offsetHeight * 0.8));
  }

  private run(): void {
    if (this.visible && !this.running) {
      this.running = true;
      requestAnimationFrame(this.frame);
    }
  }

  private frame = (): void => {
    if (!this.visible) {
      this.running = false;
      return;
    }
    requestAnimationFrame(this.frame);
    let tx = 0;
    let ty = 0;
    if (this.mobile) {
      tx = clamp(this.scrollY * 0.03, 0, 9);
      ty = -3;
    } else if (this.mx > -900) {
      ty = clamp((this.mx / window.innerWidth - 0.5) * 16, -8, 8);
      tx = clamp(-(this.my / window.innerHeight - 0.5) * 12, -8, 8);
    }
    this.rx += (tx - this.rx) * 0.07;
    this.ry += (ty - this.ry) * 0.07;
    this.rig.style.transform = `translateY(${-this.exit * 160}px) rotateX(${this.rx}deg) rotateY(${this.ry}deg)`;
    this.rig.style.opacity = String(1 - clamp((this.exit - 0.08) * 1.5));
  };
}
