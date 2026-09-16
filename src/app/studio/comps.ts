import { withBasePath } from "../data";

/**
 * The reel.
 *
 * Each section of the portfolio is a composition on one timeline. Durations are
 * hand set rather than derived from content height, because the timeline is
 * navigation and a clip's width is how a visitor judges what is worth opening.
 * Deriving it from pixel height would make Contact, which is three lines, look
 * as substantial as Projects.
 *
 * They are also what the guided run has to work with. Projects and Experience
 * each step through four items and open the notes on every one, so at the
 * original 13 and 11 seconds a slide got barely three seconds and the reel
 * flicked past the detail rather than showing it. The reel is 75 seconds now,
 * which is long for an autoplay and correct for a slideshow.
 */
export type Comp = {
  id: string;
  /** Shown in the project panel and on the clip. */
  name: string;
  /** The kind of panel, shown in the viewer header. */
  kind: string;
  /** Seconds. Also the clip's width on the timeline. */
  duration: number;
  /** Anchor in the written document, for the link out. */
  href: string;
  /** Filmstrip art for this clip on the timeline. */
  thumb: string;
};

export const FPS = 24;

export const COMPS: Comp[] = [
  { id: "intro", name: "Intro", kind: "Title", duration: 6, href: "/#about", thumb: withBasePath("/studio/strip-intro.webp") },
  { id: "projects", name: "Projects", kind: "Sequence", duration: 22, href: "/#projects", thumb: withBasePath("/studio/strip-projects.webp") },
  { id: "timeline", name: "Experience", kind: "Sequence", duration: 20, href: "/#timeline", thumb: withBasePath("/studio/strip-experience.webp") },
  { id: "stack", name: "Stack", kind: "Grid", duration: 7, href: "/#stack", thumb: withBasePath("/studio/strip-stack.webp") },
  { id: "offclock", name: "Off-clock", kind: "Sequence", duration: 9, href: "/#offclock", thumb: withBasePath("/studio/strip-offclock.webp") },
  { id: "resume", name: "Resume", kind: "Document", duration: 5, href: "/#resume", thumb: withBasePath("/studio/strip-resume.webp") },
  { id: "contact", name: "Contact", kind: "End card", duration: 6, href: "/#contact", thumb: withBasePath("/studio/strip-contact.webp") },
];

/** Start time of each comp, and the total, computed once. */
export const STARTS = COMPS.reduce<number[]>((acc, c, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + COMPS[i - 1].duration);
  return acc;
}, []);

export const TOTAL = COMPS.reduce((n, c) => n + c.duration, 0);

/** Which comp the playhead sits inside. Clamped, so the end stays on the last. */
export const compAt = (t: number) => {
  for (let i = COMPS.length - 1; i >= 0; i--) {
    if (t >= STARTS[i]) return i;
  }
  return 0;
};

/**
 * SMPTE style timecode, hours to frames. Editors read this, and it is the
 * cheapest possible signal that the person who built the page knows the format.
 */
export const timecode = (t: number) => {
  const clamped = Math.max(0, t);
  const frames = Math.floor((clamped * FPS) % FPS);
  const secs = Math.floor(clamped) % 60;
  const mins = Math.floor(clamped / 60) % 60;
  const hrs = Math.floor(clamped / 3600);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
};

/** Seconds as a clip length, for the project panel. */
export const clipLength = (d: number) => `${String(d).padStart(2, "0")}:00`;
