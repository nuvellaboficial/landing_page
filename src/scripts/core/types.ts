/** Snapshot of the viewport shared with every section on each frame. */
export interface FrameContext {
  scrollY: number;
  width: number;
  viewportH: number;
  /** Below 820px the layout switches to the 4-column mobile grid. */
  mobile: boolean;
  /** Size of one page-grid cell in px. */
  cell: number;
  /** prefers-reduced-motion: everything renders in its final state. */
  still: boolean;
}

/**
 * Contract for a section controller. The coordinator (main.ts) owns the only
 * scroll/resize listeners and calls these hooks, batched in one animation frame.
 */
export interface Section {
  /** Scroll-linked updates. Must be cheap: read layout, write transforms. */
  update?(ctx: FrameContext): void;
  /** Breakpoint or size changes. */
  resize?(ctx: FrameContext): void;
}

export const MOBILE_BREAKPOINT = 820;
