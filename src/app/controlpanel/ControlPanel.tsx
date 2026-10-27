"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { IconType } from "react-icons";
import {
  LuChevronDown,
  LuLayoutDashboard,
  LuLink,
  LuLock,
  LuMessageSquare,
  LuRefreshCw,
  LuShieldCheck,
  LuUsers,
} from "react-icons/lu";
import BackToChooser from "../components/BackToChooser";
import { useFocusTrap } from "../lib/useFocusTrap";
import { SignedOut, load, lock, status, token } from "./api";
import Inspector from "./Inspector";
import Lock from "./Lock";
import {
  RANGES,
  active,
  clock,
  day,
  keyOf,
  liveNow,
  ms,
  plural,
  rangeOf,
  visitors,
  type PanelData,
  type RangeId,
  type Visitor,
} from "./model";
import Timeline from "./Timeline";
import { PanelHead } from "./ui";
import Asks from "./comps/Asks";
import Devices from "./comps/Devices";
import Links from "./comps/Links";
import Overview from "./comps/Overview";
import Visitors from "./comps/Visitors";

type CompId = "overview" | "visitors" | "asks" | "links" | "devices";
const COMPS: { id: CompId; name: string; icon: IconType }[] = [
  { id: "overview", name: "Overview", icon: LuLayoutDashboard },
  { id: "visitors", name: "Visitors", icon: LuUsers },
  { id: "asks", name: "Ask log", icon: LuMessageSquare },
  { id: "links", name: "Links", icon: LuLink },
  { id: "devices", name: "Devices", icon: LuShieldCheck },
];

/** Layers the docked timeline shows, so it stays a strip under the viewer. */
const TRACKS = 4;

/** Often enough to watch someone move through the site, rare enough for the free tier. */
const POLL_MS = 20_000;

/**
 * A poll asks for entries newer than the newest held, less a minute. Ask
 * entries are written when the answer is done but stamped when the question
 * came in, so a slow answer can land in the list behind a quicker, later one.
 * The overlap catches it, and the merge drops what is already there.
 */
const OVERLAP_MS = 60_000;
const back = (t?: string) => (t ? new Date(Date.parse(t) - OVERLAP_MS).toISOString() : "");
const KEEP = 3000;

function merge(prev: PanelData, next: PanelData): PanelData {
  // A poll reads in pages, and an entry logged between two pages shows up on
  // both, so the fresh entries are checked against each other as well.
  const join = <T extends { t: string }>(fresh: T[], held: T[]) => {
    const seen = new Set<string>();
    return [...fresh, ...held]
      .filter((e) => {
        const key = JSON.stringify(e);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.t.localeCompare(a.t))
      .slice(0, KEEP);
  };
  return { ...next, visits: join(next.visits, prev.visits), asks: join(next.asks, prev.asks) };
}

/** The inspector docks at lg and is a sheet below it, so only one is mounted. */
const subscribeWide = (cb: () => void) => {
  const mq = window.matchMedia("(min-width: 1024px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useWide = () =>
  useSyncExternalStore(subscribeWide, () => window.matchMedia("(min-width: 1024px)").matches, () => false);

/**
 * Ali's control panel: the visit and Ask logs, laid out as the editing suite
 * lays out the portfolio. A bin of comps on the left, the comp in the viewer,
 * the inspector on the right, and the sessions on a timeline underneath.
 */
export default function ControlPanel() {
  const [phase, setPhase] = useState<"checking" | "locked" | "open">("checking");
  const [enrolled, setEnrolled] = useState(true);
  const [data, setData] = useState<PanelData | null>(null);
  const [now, setNow] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [comp, setComp] = useState<CompId>("overview");
  const [rangeId, setRangeId] = useState<RangeId>("7d");
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  // Folded or open, kept per browser like a panel in the suite.
  const [timeline, setTimeline] = useState(() => {
    try {
      return localStorage.getItem("cp-timeline") !== "closed";
    } catch {
      return true;
    }
  });
  const wide = useWide();
  const sheetRef = useRef<HTMLDivElement>(null);
  // What the last poll left, for the next one to build on.
  const held = useRef<PanelData | null>(null);
  // Bumped on Lock, so a poll that was already in flight cannot reopen the
  // panel when its answer lands afterwards.
  const generation = useRef(0);

  const refresh = useCallback(async () => {
    const mine = generation.current;
    setSyncing(true);
    try {
      const prev = held.current;
      const fresh = await load(prev ? { visits: back(prev.visits[0]?.t), asks: back(prev.asks[0]?.t) } : undefined);
      if (mine !== generation.current) return;
      const d = prev ? merge(prev, fresh) : fresh;
      held.current = d;
      setData(d);
      setNow(Date.now());
      setError(null);
      // Data came back, so a passkey exists, and locking leads to Unlock
      // rather than to first-time setup.
      setEnrolled(true);
      setPhase("open");
    } catch (err) {
      if (mine !== generation.current) return;
      if (err instanceof SignedOut) {
        token.clear();
        held.current = null;
        setData(null);
        setPhase("locked");
      } else {
        setError(err instanceof Error ? err.message : "Could not sync.");
      }
    } finally {
      setSyncing(false);
    }
  }, []);

  // Asks first whether this browser is signed in and whether any passkey
  // exists, which decides between Unlock and first-time setup.
  useEffect(() => {
    let gone = false;
    status()
      .then((s) => {
        if (gone) return;
        setEnrolled(s.enrolled);
        if (s.signedIn) refresh();
        else {
          token.clear();
          setPhase("locked");
        }
      })
      .catch((err) => {
        if (gone) return;
        setError(err instanceof Error ? err.message : "The panel's API did not answer.");
        setPhase("locked");
      });
    return () => {
      gone = true;
    };
  }, [refresh]);

  useEffect(() => {
    if (phase !== "open") return;
    const tick = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const timer = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [phase, refresh]);

  // The log leaves the screen first, then the server ends the session.
  const signOut = useCallback(async () => {
    generation.current++;
    held.current = null;
    setData(null);
    setSelected(null);
    setPhase("locked");
    await lock().catch(() => {});
  }, []);

  // 1 to 5 open the comps, R syncs, Escape closes the inspector.
  useEffect(() => {
    if (phase !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable]")) return;
      const n = Number(e.key);
      if (n >= 1 && n <= COMPS.length) setComp(COMPS[n - 1].id);
      else if (e.key === "r") refresh();
      else if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, refresh]);

  const everyone = useMemo(() => (data ? visitors(data) : new Map<string, Visitor>()), [data]);
  const range = useMemo(() => rangeOf(rangeId, now), [rangeId, now]);
  const people = useMemo(() => active(everyone, range), [everyone, range]);
  const hidden = useMemo(
    () => [...everyone.values()].filter((v) => v.hidden).sort((a, b) => b.last - a.last),
    [everyone],
  );
  const live = useMemo(() => liveNow(everyone, now).length, [everyone, now]);
  const sel = selected ? everyone.get(selected) : undefined;

  useFocusTrap(sheetRef, Boolean(sel) && !wide);

  if (phase === "checking") {
    return (
      <div className="st-root st-hatch flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-[var(--st-stage)] px-6 text-center">
        {error ? (
          <>
            <span role="alert" className="st-tc whitespace-normal! text-[#ff8a80]">
              {error}
            </span>
            <button type="button" className="cp-btn" onClick={refresh}>
              <LuRefreshCw aria-hidden /> Try again
            </button>
          </>
        ) : (
          <span className="st-tc text-[var(--st-faint)]">Connecting…</span>
        )}
      </div>
    );
  }

  if (phase === "locked" || !data) {
    return (
      <>
        <Lock enrolled={enrolled} onOpen={refresh} />
        {error && (
          <p role="alert" className="st-tc fixed inset-x-0 bottom-4 text-center text-[11px] text-[#ff8a80]">
            {error}
          </p>
        )}
      </>
    );
  }

  const select = (key: string) => setSelected((cur) => (cur === key && wide ? null : key));
  const counts: Record<CompId, string> = {
    overview: plural(people.reduce((n, v) => n + v.views.filter((x) => ms(x.t) >= range.start).length, 0), "view"),
    visitors: plural(people.length, "visitor"),
    asks: plural(
      data.asks.filter((a) => ms(a.t) >= range.start && !everyone.get(keyOf(a))?.hidden).length,
      "question",
    ),
    links: plural(Object.keys(data.links).length, "link"),
    devices: plural(data.devices.length, "passkey"),
  };
  const current = COMPS.find((c) => c.id === comp)!;

  const inspector = sel && (
    <Inspector
      key={sel.key}
      visitor={sel}
      links={data.links}
      now={now}
      onClose={() => setSelected(null)}
      onChanged={refresh}
    />
  );

  return (
    <div className="st-root cp-root flex h-[100dvh] flex-col overflow-hidden bg-[var(--st-chrome)] text-[var(--st-text)]">
      {/* The top bar: who is on the site, the file, the range and the session. */}
      <header className="flex shrink-0 items-center gap-2.5 border-b border-[var(--st-line)] px-3 py-2">
        <BackToChooser />
        <span className={`cp-rec ${live ? "cp-rec-on" : ""}`} aria-hidden />
        <span className="st-tc text-[11px] text-[var(--st-dim)]">{live ? `${live} on the site` : "Nobody on the site"}</span>
        <span className="st-tc hidden text-[var(--st-faint)] sm:block">controlpanel.aep</span>

        <div className="ml-auto flex items-center gap-2">
          <div role="group" aria-label="Range" className="hidden overflow-hidden rounded-[3px] border border-[var(--st-line-strong)] sm:flex">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                aria-pressed={rangeId === r.id}
                onClick={() => setRangeId(r.id)}
                className={`st-tc h-[26px] px-2.5 text-[10.5px] transition-colors ${
                  rangeId === r.id
                    ? "bg-[var(--st-sel)] text-[var(--st-accent)]"
                    : "text-[var(--st-dim)] hover:bg-[var(--st-hover)]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <select
            aria-label="Range"
            className="cp-input st-tc h-[34px]! w-auto! pr-6! sm:hidden"
            value={rangeId}
            onChange={(e) => setRangeId(e.target.value as RangeId)}
          >
            {RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={refresh}
            className="cp-btn px-2!"
            aria-label={`Refresh, updated ${clock(now)}`}
            title={`Refresh (R), updated ${clock(now)}`}
          >
            <LuRefreshCw aria-hidden className={syncing ? "animate-spin" : ""} />
          </button>
          <button type="button" onClick={signOut} className="cp-btn px-2!" aria-label="Lock the panel" title="Lock">
            <LuLock aria-hidden />
          </button>
        </div>
      </header>

      {error && (
        <p role="alert" className="st-tc shrink-0 border-b border-[#ff5a4f]/30 bg-[#ff5a4f]/10 px-3 py-1.5 text-[11px] text-[#ff8a80]">
          Could not sync: {error}
        </p>
      )}

      {/* The bin collapses to tabs on a phone. */}
      <nav aria-label="Comps" className="flex shrink-0 gap-1 overflow-x-auto border-b border-[var(--st-line)] px-2 py-1.5 md:hidden">
        {COMPS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-current={comp === c.id ? "page" : undefined}
            onClick={() => setComp(c.id)}
            className={`cp-btn shrink-0 ${comp === c.id ? "border-[var(--st-sel-line)]! bg-[var(--st-sel)]! text-[var(--st-accent)]!" : ""}`}
          >
            <c.icon aria-hidden />
            {c.name}
          </button>
        ))}
      </nav>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[196px] shrink-0 flex-col border-r border-[var(--st-line)] bg-[var(--st-panel)] md:flex lg:w-[216px]">
          <PanelHead label="Project" />
          <nav aria-label="Comps" className="min-h-0 flex-1 overflow-y-auto">
            {COMPS.map((c, i) => {
              const on = c.id === comp;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-current={on ? "page" : undefined}
                  onClick={() => setComp(c.id)}
                  title={`${c.name} (${i + 1})`}
                  className={`relative flex w-full items-center gap-2.5 border-b border-[var(--st-line)] px-3 py-2.5 text-left transition-colors ${
                    on ? "bg-[var(--st-sel)]" : "hover:bg-[var(--st-hover)]"
                  }`}
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[2px]"
                    style={{ background: on ? "var(--st-accent)" : "transparent" }}
                  />
                  <span
                    aria-hidden
                    className={`st-hatch flex h-[26px] w-[44px] shrink-0 items-center justify-center rounded-[2px] border ${
                      on
                        ? "border-[var(--st-sel-line)] text-[var(--st-accent)]"
                        : "border-[var(--st-line-strong)] text-[var(--st-faint)]"
                    }`}
                  >
                    <c.icon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[12.5px] ${on ? "text-[var(--st-text)]" : "text-[var(--st-dim)]"}`}>
                      {c.name}
                    </span>
                    <span className="st-tc block text-[10px] text-[var(--st-faint)]">{counts[c.id]}</span>
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="shrink-0 border-t border-[var(--st-line)] bg-[var(--st-panel-hi)] px-3 py-2.5">
            {/* The footage the project is cut from: this site's visits. */}
            {[
              ["File", "controlpanel.aep"],
              ["Media", "alitleis.dev"],
              ["Range", `${day(range.start)} – ${day(range.end)}`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-2 py-[3px]">
                <span className="st-label shrink-0">{k}</span>
                <span className="st-tc ml-auto text-[var(--st-text)]">{v}</span>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="hidden md:block">
            <PanelHead label={current.name} />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--st-stage)] p-3 sm:p-4">
            <div key={comp} className="st-reveal mx-auto max-w-[1100px]">
              {comp === "overview" && (
                <Overview
                  everyone={everyone}
                  people={people}
                  links={data.links}
                  range={range}
                  now={now}
                  selected={selected}
                  onSelect={select}
                  onFind={(q) => {
                    setQuery(q);
                    setComp("visitors");
                  }}
                />
              )}
              {comp === "visitors" && (
                <Visitors
                  people={people}
                  hidden={hidden}
                  now={now}
                  selected={selected}
                  query={query}
                  onQuery={setQuery}
                  onSelect={select}
                />
              )}
              {comp === "asks" && (
                <Asks asks={data.asks} everyone={everyone} range={range} now={now} onSelect={select} />
              )}
              {comp === "links" && (
                <Links links={data.links} everyone={everyone} now={now} onSelect={select} onChanged={refresh} />
              )}
              {comp === "devices" && (
                <Devices devices={data.devices} current={data.device} now={now} onLock={signOut} onChanged={refresh} />
              )}
            </div>
          </div>
        </main>

        {wide && sel && (
          <aside className="flex w-[340px] shrink-0 flex-col border-l border-[var(--st-line)]">{inspector}</aside>
        )}
      </div>

      <div className="hidden shrink-0 flex-col border-t border-[var(--st-line)] md:flex">
        <PanelHead label="Timeline">
          <span className="ml-auto flex items-center gap-3 text-[12px] text-[var(--st-faint)]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rotate-45 rounded-[1px] bg-[var(--st-accent)]" /> one visit
            </span>
            {people.length > TRACKS && (
              <span>
                Latest {TRACKS} of {people.length} visitors
              </span>
            )}
            <button
              type="button"
              aria-expanded={timeline}
              onClick={() => {
                setTimeline(!timeline);
                try {
                  localStorage.setItem("cp-timeline", timeline ? "closed" : "open");
                } catch {
                  // Storage is blocked, so the choice lasts until the page reloads.
                }
              }}
              className="cp-btn h-6! px-2!"
            >
              {timeline ? "Hide" : "Show"}
              <LuChevronDown aria-hidden className={timeline ? "rotate-180" : ""} />
            </button>
          </span>
        </PanelHead>
        {timeline && (
          // Capped for a short window, where four rows would be most of it.
          <div className="max-h-[32vh] overflow-y-auto">
            <Timeline people={people} range={range} selected={selected} onSelect={select} tracks={TRACKS} />
          </div>
        )}
      </div>

      {!wide && sel && (
        <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end">
          <button
            type="button"
            aria-label="Close the inspector"
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelected(null)}
          />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Inspector, ${sel.name}`}
            className="relative flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[10px] border-t border-[var(--st-line-strong)] shadow-[0_-20px_60px_rgba(0,0,0,0.6)] md:max-h-none md:w-[380px] md:rounded-none md:border-l md:border-t-0"
          >
            {inspector}
          </div>
        </div>
      )}
    </div>
  );
}
