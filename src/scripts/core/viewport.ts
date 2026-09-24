import { clamp } from '../../lib/util';
import { MOBILE_BREAKPOINT, type FrameContext } from './types';

export const readContext = (still: boolean): FrameContext => {
  const width = window.innerWidth;
  const mobile = width < MOBILE_BREAKPOINT;
  return {
    scrollY: window.scrollY,
    width,
    viewportH: window.innerHeight,
    mobile,
    cell: width / (mobile ? 4 : 12),
    still,
  };
};

/**
 * Device sizes depend on both viewport width and height, which CSS alone
 * cannot express (no length division), so they are published as custom properties.
 */
export const applyDeviceScales = ({ width: w, viewportH: vh, mobile, cell }: FrameContext): void => {
  const lap3 = Math.max(360, Math.min(560, cell * 8 - 302));
  const lap5 = Math.max(520, Math.min(920, cell * 8 - 24));
  const vars: Record<string, string> = {
    '--dev-scale': String(clamp(Math.min(w / 1440, (vh - 40) / 900), 0.6, 1.2)),
    '--k2': String(mobile ? Math.min((w - 32) / 280, (vh - 330) / 570, 1.2) : Math.min(1.05, (vh - 140) / 570)),
    // Mobile: title + steps take ~390px of the pinned stage; the phone gets the rest.
    '--k3': String(mobile ? clamp((vh - 390) / 570, 0.42, 0.62) : Math.min(0.82, (vh - 280) / 570)),
    '--lap3-w': `${lap3}px`,
    '--lap3-scale': String((lap3 - 18) / 880),
    '--lap5-w': `${lap5}px`,
    '--lap5-scale': String((lap5 - 20) / 880),
  };
  const root = document.documentElement.style;
  for (const [k, v] of Object.entries(vars)) root.setProperty(k, v);
};
