"use client";

import {
  createContext,
  useContext,
  useEffect,
  type RefObject,
} from "react";

/**
 * The director.
 *
 * Pressing play used to move a playhead across seven comps while every comp
 * sat in whatever state it happened to be in, so the reel showed the outside
 * of the portfolio and none of the inside. In presentation mode each comp
 * instead drives itself off `progress`, which is how far the playhead has
 * travelled through the clip it is currently inside, from 0 to 1.
 *
 * Everything scripted is a pure function of that number, and that is what
 * makes the awkward case fall out for free: drop the playhead into the middle
 * of a clip and hit play, and the comp composes itself to the state that
 * moment of the reel calls for rather than starting its choreography over.
 *
 * `presenting` stays true while paused. Pausing a slideshow should hold the
 * frame it is on, not tear the comp back down to its resting state. Only a
 * deliberate interaction hands control back.
 */
export type Presentation = {
  presenting: boolean;
  /** 0 to 1 through the active comp. Frozen while paused. */
  progress: number;
};

const PresentationContext = createContext<Presentation>({
  presenting: false,
  progress: 0,
});

export const PresentationProvider = PresentationContext.Provider;

export const usePresentation = () => useContext(PresentationContext);

/**
 * Maps comp progress onto an index, holding on the last item rather than
 * running off the end when progress reaches exactly 1.
 */
export function stepThrough(progress: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(count - 1, Math.floor(progress * count));
}

/**
 * Progress within the current item of a `stepThrough` cycle, 0 to 1.
 *
 * Lets a comp run a sub-script inside each of its own items: select the
 * project for the first third of its slot, open the notes, then walk them.
 */
export function stepProgress(progress: number, count: number): number {
  if (count <= 0) return 0;
  const scaled = progress * count;
  return Math.min(1, scaled - Math.floor(Math.min(scaled, count - 1)));
}

/**
 * Eases 0..1 into 0..1 with a hold at each end.
 *
 * A scroll that starts the instant a panel opens and ends exactly as it closes
 * reads as a machine. Holding still for the first and last fifth gives the
 * reader a moment to catch the top of the text and to finish the bottom.
 */
export function holdRamp(t: number, hold = 0.2): number {
  const span = 1 - hold * 2;
  if (span <= 0) return 0;
  return Math.min(1, Math.max(0, (t - hold) / span));
}

/**
 * Drives an element's scrollTop from a 0..1 value.
 *
 * Writing to the DOM rather than to state on purpose: a scripted scroll is an
 * output, and routing 60 frames a second of it through React would re-render
 * the whole comp for something the compositor can do on its own.
 */
export function useScriptedScroll(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  t: number,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const room = el.scrollHeight - el.clientHeight;
    if (room <= 0) return;
    el.scrollTop = room * Math.min(1, Math.max(0, t));
  }, [ref, active, t]);
}
