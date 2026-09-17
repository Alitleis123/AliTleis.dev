"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { COMPS, STARTS, TOTAL, compAt } from "./comps";
import Timeline from "./Timeline";
import Viewer from "./Viewer";
import { ProjectPanel, TopBar } from "./Panels";
import { PresentationProvider } from "./presentation";
import ReelAudio, { useReelAudioPref } from "./ReelAudio";
import { isSwitchArrival } from "../lib/switchArrival";

import TitleCard from "./comps/TitleCard";
import Bin from "./comps/Bin";
import Tracks from "./comps/Tracks";
import Swatches from "./comps/Swatches";
import Reel from "./comps/Reel";
import { DocPanel, EndCard } from "./comps/Output";

/**
 * Purpose built comps rather than the document's sections.
 *
 * The first attempt hosted the classic sections unchanged, which put a
 * centred 1152px page inside a panel and read as the same site in a grey
 * frame. Every word here comes from the same data, the presentation is what
 * changed: a slate, a source bin, layer rows, a preset list, a source monitor,
 * a render queue and an end card.
 */
const RENDER: Record<string, React.ComponentType> = {
  intro: TitleCard,
  projects: Bin,
  timeline: Tracks,
  stack: Swatches,
  offclock: Reel,
  resume: DocPanel,
  contact: EndCard,
};

/**
 * Subscribed rather than read in an effect.
 *
 * Setting state from an effect to answer a media query means the reel starts,
 * then stops a frame later, which is exactly the motion the preference asked
 * to avoid. This way the first render already knows.
 */
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const useReducedMotion = () =>
  useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

export default function Studio() {
  const reduced = useReducedMotion();
  const { muted, toggle: toggleMuted } = useReelAudioPref();

  /**
   * Boot the chrome on a cold open, skip it on a toggle.
   *
   * Read once on mount rather than every render, and read during render
   * rather than in an effect, so the very first paint already carries the
   * right class. Setting it from an effect would boot for one frame and then
   * stop, which is the flicker the boot exists to avoid.
   */
  const [boots] = useState(() => !isSwitchArrival("/studio"));

  /**
   * Hides the mute control when there is no bed to mute.
   *
   * The reel's audio file is dropped in separately, so the transport must not
   * offer a button that does nothing when it is absent.
   */
  const [hasAudio, setHasAudio] = useState(true);
  const dropAudio = useCallback(() => setHasAudio(false), []);
  const [time, setTime] = useState(0);
  /**
   * Paused on arrival, deliberately.
   *
   * Autoplaying the reel meant the first thing a visitor did was read a
   * paragraph that slid out from under them four seconds later. The transport
   * is right there, and someone who wants the tour will press it.
   */
  const [playing, setPlaying] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [touched, setTouched] = useState(false);
  /**
   * Whether the guided run is in charge of the comps.
   *
   * Separate from `playing` so that pausing holds the composed frame instead
   * of collapsing every panel back to its resting state. Only a deliberate
   * interaction clears it.
   */
  const [presenting, setPresenting] = useState(false);

  /**
   * Which comp is on screen and which one is dissolving off it.
   *
   * Only these two are painted. Every other comp stays display:none, which
   * keeps it in the HTML for a crawler while keeping its images out of the
   * network, because a lazy image inside a hidden subtree never intersects
   * anything and so never loads.
   *
   * Set during render rather than from an effect. React re-runs the component
   * immediately and the browser never paints the intermediate state, so the
   * outgoing layer starts its fade from the frame it was already showing.
   */
  const [layers, setLayers] = useState<{ cur: string; out: string | null }>({
    cur: COMPS[compAt(0)].id,
    out: null,
  });

  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = compAt(time);
  const activeId = COMPS[active].id;
  const progress = Math.min(
    1,
    Math.max(0, (time - STARTS[active]) / COMPS[active].duration),
  );

  if (layers.cur !== activeId) {
    setLayers({ cur: activeId, out: layers.cur });
  }

  /**
   * Hands the comps back to the visitor.
   *
   * For interaction *inside* a comp, which means picking a different project
   * or opening a set of notes by hand. That is someone saying they want to
   * read rather than be shown, so the script stops.
   */
  const takeOver = useCallback(() => {
    setTouched(true);
    setPlaying(false);
    setPresenting(false);
  }, []);

  /**
   * Stops playback but keeps the script composing the frame.
   *
   * For the transport: scrubbing, stepping between comps, jumping to either
   * end. Scrubbing used to call takeOver, so dragging the playhead switched
   * the guided run off rather than scrubbing it, and every comp snapped back
   * to its resting state mid-drag. Since everything scripted is a pure
   * function of the playhead, holding `presenting` here is what makes the
   * timeline a real scrub: the comps recompose to whatever that moment of the
   * reel calls for, scripted scroll positions included.
   */
  const scrubTo = useCallback(() => {
    setTouched(true);
    setPlaying(false);
    setPresenting(true);
  }, []);

  /** Play starts the guided run; pause holds it. */
  const togglePlay = useCallback(() => {
    setTouched(true);
    setPlaying((p) => {
      if (!p) setPresenting(true);
      return !p;
    });
  }, []);

  const seek = useCallback((t: number) => {
    setTime(Math.min(TOTAL - 0.001, Math.max(0, t)));
  }, []);

  const step = useCallback(
    (dir: -1 | 1) => {
      scrubTo();
      setTime((t) => {
        const next = Math.min(COMPS.length - 1, Math.max(0, compAt(t) + dir));
        return STARTS[next] + 0.01;
      });
    },
    [scrubTo],
  );

  // Playback. Elapsed time rather than a fixed increment, so the reel runs at
  // the same speed regardless of frame rate.
  useEffect(() => {
    if (!playing || reduced) return;
    lastRef.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setTime((t) => {
        const next = t + dt;
        if (next >= TOTAL) {
          setPlaying(false);
          return TOTAL - 0.001;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, reduced]);

  // Shortcuts. Space, and J K L for shuttle, which is the set every editor has
  // in their hands already.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA"].includes(e.target.tagName);
      if (typing) return;

      const k = e.key.toLowerCase();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (k === "l") {
        e.preventDefault();
        setTouched(true);
        setPresenting(true);
        setPlaying(true);
      } else if (k === "k") {
        e.preventDefault();
        takeOver();
      } else if (k === "j") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "Home") {
        scrubTo();
        seek(0);
      } else if (e.key === "End") {
        scrubTo();
        seek(TOTAL);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, seek, takeOver, scrubTo, togglePlay]);

  // A fresh comp starts at its top, the way opening one in an editor does.
  // Each layer scrolls itself, so this reaches for the one coming in.
  useEffect(() => {
    const layer = scrollRef.current?.querySelector(`[data-comp="${activeId}"]`);
    if (layer instanceof HTMLElement) layer.scrollTop = 0;
  }, [activeId]);

  /**
   * Deep link, so a single comp can be shared.
   *
   * Read after mount rather than during the first render. Seeding state from
   * the query string would have the server render comp one and the client
   * render comp four, which is a hydration mismatch. One frame on the Intro
   * costs nothing and keeps the markup identical on both sides.
   */
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("c");
    if (!want) return;
    const i = COMPS.findIndex((c) => c.id === want);
    if (i < 0) return;
    // react-hooks/set-state-in-effect fires here, and the rule is right about
    // the general case. The exception is that the URL cannot be read while
    // rendering on the server, and seeding this from the query string during
    // the first client render instead would make the server send comp one
    // while the client sends comp four, which is a hydration mismatch. One
    // extra render on mount, only when a deep link is present, is the cheaper
    // of the two.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTouched(true);
    setPlaying(false);
    setTime(STARTS[i] + 0.01);
  }, []);

  return (
    <div
      className={`st-root ${
        boots ? "st-boots" : "enter-page"
      } flex h-[100dvh] flex-col overflow-hidden bg-[var(--st-chrome)]`}
    >
      <TopBar
        time={time}
        playing={playing && !reduced}
        muted={muted}
        showMute={hasAudio}
        entering={!boots}
        onPlayToggle={togglePlay}
        onStep={step}
        onMuteToggle={toggleMuted}
      />

      {/* The A1 track. Follows the playhead rather than free-running, so a
          position in the reel is a position in the song. */}
      <ReelAudio
        time={time}
        playing={playing && !reduced}
        muted={muted}
        onUnavailable={dropAudio}
      />

      <div className="flex min-h-0 flex-1">
        <ProjectPanel
          time={time}
          onSeek={(t) => {
            scrubTo();
            seek(t);
          }}
        />

        {/* A press inside the frame is someone choosing to read rather than
            be shown, so it stops the script. Capture phase, so `presenting`
            is already false by the time the comp's own click handler sets its
            manual selection: a comp reads `presenting ? auto : manual`, so
            without this a click during the guided run set manual state that
            nothing was looking at, and appeared to do nothing. */}
        <div
          className="st-boot-stage flex min-w-0 flex-1 flex-col"
          onPointerDownCapture={takeOver}
        >
          <Viewer
            time={time}
            scrubbing={scrubbing}
            zoom={100}
            scrollRef={scrollRef}
          >
            <PresentationProvider value={{ presenting, progress }}>
              {/*
              Every comp is mounted, and only the active one is shown.
              Rendering just the active component kept six of the seven
              sections out of the exported HTML, which on a statically hosted
              site means the roles, the projects and the metrics were absent
              from the page a crawler sees. `display: none` still keeps them in
              the document, and `inert` keeps the hidden ones out of the tab
              order.
            */}
              {COMPS.map((c) => {
                const Comp = RENDER[c.id];
                if (!Comp) return null;
                const on = c.id === layers.cur;
                const leaving = c.id === layers.out;
                return (
                  <section
                    key={c.id}
                    id={c.id}
                    data-comp={c.id}
                    aria-label={c.name}
                    className={`st-layer ${
                      on
                        ? "st-layer-in"
                        : leaving
                          ? "st-layer-out"
                          : "st-layer-off"
                    }`}
                    inert={!on}
                  >
                    <div className="st-comp">
                      <Comp />
                    </div>
                  </section>
                );
              })}
            </PresentationProvider>
          </Viewer>
        </div>
      </div>

      <div className="st-boot-timeline shrink-0">
        <Timeline
          time={time}
          playing={playing && !reduced}
          scrubbing={scrubbing}
          hint={!touched}
          onSeek={seek}
          onScrubStart={() => {
            scrubTo();
            setScrubbing(true);
          }}
          onScrubEnd={() => setScrubbing(false)}
        />
      </div>
    </div>
  );
}
