"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { withBasePath } from "../data";

type AudioState = "off" | "on" | "blocked";

/** Remembers an explicit opt-out so the bed doesn't restart on every visit. */
const PREF_KEY = "ambient-audio";
const VOLUME = 0.45;

/**
 * Ambient audio bed — a 3-minute loop cut from a longer recording, with a
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

  /** Browsers gate audio behind a gesture — start on the first interaction. */
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
      // drop it first — two overlapping play() calls on one element race and
      // leave the UI reporting the wrong state.
      disarm();
      if (startingRef.current) return;
      startingRef.current = true;

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
    fade(0, 600, () => elRef.current?.pause());
    setState("off");
    localStorage.setItem(PREF_KEY, "off");
  }, [fade, disarm]);

  useEffect(() => {
    if (localStorage.getItem(PREF_KEY) === "off") return; // respect opt-out
    const el = elRef.current;
    if (!el) return;

    el.volume = 0;
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
