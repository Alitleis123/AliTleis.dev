"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AUDIO_SRC } from "./comps";

/**
 * The sequence's audio, locked to the playhead.
 *
 * This is the A1 track rather than a bed playing underneath one. The file is
 * cut to exactly the length of the sequence, so a position in the reel is a
 * position in the song: scrub to ten seconds and you hear the tenth second,
 * the same as dragging a playhead across an audio clip in any editor. Earlier
 * versions let the track free-run, which meant the music you heard at a given
 * frame depended on how long the tab had been open.
 *
 * Sync is corrected rather than driven. Both clocks advance in real time, so
 * writing currentTime every frame would fight the element's own playback and
 * stutter it. Instead the element is left alone while it stays within
 * DRIFT_MAX of the playhead, which in practice it does.
 *
 * A browser still will not start sound without a gesture, so the first press
 * of play opens it. Arming scroll listeners to get around that is what made
 * the reading view's ambient bed play at people who never asked.
 */

/** Set when someone mutes, so their choice survives a reload. */
const PREF_KEY = "reel-audio-muted";
const VOLUME = 0.4;
const FADE_MS = 700;
/** Seconds of slip tolerated before the element is nudged back. */
const DRIFT_MAX = 0.28;

export function useReelAudioPref() {
  const [muted, setMuted] = useState(false);

  // Read the saved choice after mount. Reading it during render would have
  // the server send unmuted and the client send muted, which is a hydration
  // mismatch, and nothing is playing on the first frame anyway.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMuted(localStorage.getItem(PREF_KEY) === "1");
  }, []);

  const toggle = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem(PREF_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  return { muted, toggle };
}

export default function ReelAudio({
  time,
  playing,
  muted,
  onUnavailable,
}: {
  /** Playhead position in seconds. The audio follows it. */
  time: number;
  playing: boolean;
  muted: boolean;
  /** Called if the file is missing, so the transport can drop its control. */
  onUnavailable: () => void;
}) {
  const elRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Set if the file is missing, so a dropped asset fails quietly. */
  const [broken, setBroken] = useState(false);

  const fade = useCallback((to: number, ms: number) => {
    const el = elRef.current;
    if (!el) return;
    if (fadeRef.current) clearInterval(fadeRef.current);
    const step = 40;
    const delta = (to - el.volume) / (ms / step);
    fadeRef.current = setInterval(() => {
      const next = el.volume + delta;
      const done = delta > 0 ? next >= to : next <= to;
      el.volume = Math.min(1, Math.max(0, done ? to : next));
      if (done) {
        if (fadeRef.current) clearInterval(fadeRef.current);
        fadeRef.current = null;
      }
    }, step);
  }, []);

  const wanted = playing && !muted && !broken;

  // Position. Runs on every playhead change, including while scrubbing, so a
  // drag through the clip moves the audio with it.
  useEffect(() => {
    const el = elRef.current;
    if (!el || broken) return;
    if (Math.abs(el.currentTime - time) > DRIFT_MAX) {
      // Seeking past the end throws in some browsers, and the last frame of
      // the reel sits a hair under the duration.
      el.currentTime = Math.min(time, Math.max(0, (el.duration || time) - 0.05));
    }
  }, [time, broken]);

  // Transport.
  useEffect(() => {
    const el = elRef.current;
    if (!el || broken) return;

    if (wanted) {
      el.volume = 0;
      el.play()
        .then(() => fade(VOLUME, FADE_MS))
        // Stay silent, but stay available. A rejection here is transient by
        // nature, and the common one is the autoplay policy declining a start
        // that did not inherit user activation. Marking the deck broken for
        // that would retire the mute control for the rest of the session over
        // something the next press would have fixed. Only the element's own
        // error event, which is what a missing or undecodable file raises,
        // means there is nothing to play.
        .catch(() => {});
      return;
    }

    // Pause on a timer rather than from the fade's completion callback: a new
    // fade clears the interval before it finishes and the pause would be lost
    // with it.
    fade(0, 320);
    const t = window.setTimeout(() => {
      if (!(playing && !muted)) el.pause();
    }, 360);
    return () => window.clearTimeout(t);
  }, [wanted, playing, muted, broken, fade]);

  useEffect(
    () => () => {
      if (fadeRef.current) clearInterval(fadeRef.current);
      // A detached element keeps playing, and React's development double
      // mount would otherwise leave the first one audible and unreachable.
      const el = elRef.current;
      if (el) {
        el.pause();
        el.src = "";
      }
    },
    [],
  );

  return (
    <audio
      ref={elRef}
      src={AUDIO_SRC}
      // Cut to the length of the sequence, so there is nothing to loop to.
      //
      // Metadata rather than auto: seeking needs the duration and the seek
      // table, which is a few KB, and the browser range-fetches the rest when
      // playback starts. Auto pulled the whole 1.2MB on every load of this
      // route, including for the visitors who never press play.
      preload="metadata"
      onError={() => {
        setBroken(true);
        onUnavailable();
      }}
    />
  );
}
