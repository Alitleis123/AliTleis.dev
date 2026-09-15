"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { withBasePath } from "../data";

type AudioState = "off" | "on" | "blocked";

/** Remembers an explicit opt-out so the bed doesn't restart on every visit. */
const PREF_KEY = "ambient-audio";
const VOLUME = 0.45;

/**
 * Ambient audio bed, a 3-minute loop cut from a longer recording, with a
 * crossfaded seam so the wrap-around isn't audible. Fades rather than cuts
 * on both ends, since an abrupt start is the thing that makes site audio
 * feel like an accident.
 */
export default function AmbientAudio() {
  const [state, setState] = useState<AudioState>("off");

  const elRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const disarmRef = useRef<(() => void) | null>(null);
  const startingRef = useRef(false);
  // What the listener last asked for. The fade-out pauses on a timer rather
  // than from the fade's completion callback, so this is what tells that timer
  // whether the request still stands.
  const desiredRef = useRef<"on" | "off">("off");
  // Breaks the play <-> armGesture dependency cycle.
  const playRef = useRef<((remember?: boolean) => void) | null>(null);

  const fade = useCallback((to: number, ms: number, onDone?: () => void) => {
    const el = elRef.current;
    if (!el) return;
    if (fadeRef.current) clearInterval(fadeRef.current);

    const step = 40;
    const from = el.volume;
    const delta = (to - from) / (ms / step);

    fadeRef.current = setInterval(() => {
      const next = el.volume + delta;
      const done = delta > 0 ? next >= to : next <= to;
      el.volume = Math.min(1, Math.max(0, done ? to : next));
      if (done) {
        if (fadeRef.current) clearInterval(fadeRef.current);
        fadeRef.current = null;
        onDone?.();
      }
    }, step);
  }, []);

  /** Drops the armed gesture listeners, if any. */
  const disarm = useCallback(() => {
    disarmRef.current?.();
    disarmRef.current = null;
  }, []);

  /** Browsers gate audio behind a gesture, start on the first interaction. */
  const armGesture = useCallback(() => {
    setState("blocked");
    if (disarmRef.current) return; // already listening
    const evts = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    const go = () => {
      disarm();
      playRef.current?.(false);
    };
    evts.forEach((e) => window.addEventListener(e, go, { passive: true }));
    disarmRef.current = () =>
      evts.forEach((e) => window.removeEventListener(e, go));
  }, [disarm]);

  const play = useCallback(
    (remember = true) => {
      const el = elRef.current;
      if (!el) return;
      // A click on the button also fires the armed pointerdown listener, so
      // drop it first, because two overlapping play() calls on one element race and
      // leave the UI reporting the wrong state.
      disarm();
      if (startingRef.current) return;
      startingRef.current = true;
      desiredRef.current = "on";

      el.volume = 0;
      el.play()
        .then(() => {
          startingRef.current = false;
          fade(VOLUME, 3000);
          setState("on");
          if (remember) localStorage.setItem(PREF_KEY, "on");
        })
        .catch(() => {
          // Re-arm rather than latching into a dead "blocked" state.
          startingRef.current = false;
          armGesture();
        });
    },
    [fade, disarm, armGesture],
  );

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  const pause = useCallback(() => {
    disarm();
    // Never leave this latched: a play() whose promise never settles would
    // otherwise make every later press a no-op.
    startingRef.current = false;
    desiredRef.current = "off";
    fade(0, 600);
    // Pausing from the fade's completion callback loses the pause entirely if
    // anything supersedes that fade, because starting a new one clears the
    // interval before it finishes. The timer survives that; the intent check
    // means a press of play in the meantime still wins.
    window.setTimeout(() => {
      if (desiredRef.current === "off") elRef.current?.pause();
    }, 650);
    setState("off");
    localStorage.setItem(PREF_KEY, "off");
  }, [fade, disarm]);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (localStorage.getItem(PREF_KEY) === "off") {
      // Defensive: a hot reload can hand us an element that is already
      // playing, and the opt-out has to win over whatever state it is in.
      el.pause();
      return;
    }

    el.volume = 0;
    desiredRef.current = "on";
    el.play()
      .then(() => {
        fade(VOLUME, 4000);
        setState("on");
      })
      .catch(armGesture);
  }, [fade, armGesture]);

  useEffect(
    () => () => {
      if (fadeRef.current) clearInterval(fadeRef.current);
      disarmRef.current?.();
      // A detached element keeps playing. Without this, React's development
      // double-mount leaves the first one audible and unreachable, so the
      // button pauses the second element while the first plays on.
      const el = elRef.current;
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
      startingRef.current = false;
      desiredRef.current = "off";
    },
    [],
  );

  return (
    <>
      <audio
        ref={elRef}
        src={withBasePath("/audio/ambient.m4a")}
        loop
        preload="auto"
        // The element is the source of truth, not our own bookkeeping. Without
        // this the label and the sound could disagree, and then the button
        // does the opposite of what it says: it reads "off" while audio plays,
        // so pressing it calls play() and the sound never stops.
        onPlay={() => setState("on")}
        onPause={() => setState("off")}
      />
      <button
        type="button"
        onClick={() => (state === "on" ? pause() : play())}
        aria-pressed={state === "on"}
        aria-label={
          state === "on" ? "Pause ambient audio" : "Play ambient audio"
        }
        className={`fixed bottom-6 left-6 z-50 inline-flex h-10 items-center gap-2.5 rounded-full border bg-black/60 px-3.5 text-[12px] font-medium tracking-tight backdrop-blur-md transition-colors duration-300 ${
          state === "on"
            ? "border-[rgba(var(--signal-rgb),0.32)] text-white/85"
            : state === "blocked"
              ? "border-[rgba(var(--signal-rgb),0.32)] text-[var(--accent-electric)]"
              : "border-white/15 text-white/60 hover:bg-white/10 hover:text-white"
        }`}
      >
        <span aria-hidden className="flex h-3 items-end gap-[2px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`block w-[2px] rounded-full ${
                state === "on"
                  ? `vu-bar vu-bar-${i + 1} bg-[var(--accent-electric)]`
                  : "h-[3px] bg-current opacity-60"
              }`}
            />
          ))}
        </span>
        {state === "blocked" ? "Enable audio" : "Audio"}
      </button>
    </>
  );
}
