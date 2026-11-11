"use client";

import { useEffect, useRef, useState } from "react";

/** Media Pool, Ali's fleet app, which answers only on his own tailnet. */
const MEDIA_POOL = "https://light-vm.tailde9e5d.ts.net:8088/";

/** Whether this browser reaches Media Pool, which answers /api/door only to Ali's own devices. */
async function reachable(signal: AbortSignal) {
  try {
    const res = await fetch(`${MEDIA_POOL}api/door`, {
      cache: "no-store",
      signal: AbortSignal.any([signal, AbortSignal.timeout(4000)]),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * The way into Media Pool from this site: the viewer an editor shows for
 * footage it cannot find, with the file's title bar across the top.
 *
 * Media Pool's own sign-in is the only entrance, with the passkey, setup and
 * "New device?" pairing. This page only finds out whether this browser can
 * reach Media Pool and, if it can, goes there without a lock of its own. Anyone
 * else stays on the lock. A browser that reaches it is one of Ali's, so its
 * visits stop counting on the site too.
 */
export default function Door() {
  const [phase, setPhase] = useState<"checking" | "opening" | "locked">("checking");
  const [attempt, setAttempt] = useState(0);
  const retry = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Leaving the page, or trying again, drops this check, so a late answer can't redirect.
    const check = new AbortController();
    void reachable(check.signal).then((ok) => {
      if (check.signal.aborted) return;
      if (!ok) return setPhase("locked");
      setPhase("opening");
      try {
        localStorage.setItem("notrack", "1");
      } catch {
        // Storage is blocked, so this browser's visits keep counting.
      }
      window.location.replace(MEDIA_POOL);
    });
    return () => check.abort();
  }, [attempt]);

  const locked = phase === "locked";

  // A retry that fails again puts focus back on Try again, which went away while it checked.
  useEffect(() => {
    if (locked && attempt > 0) retry.current?.focus();
  }, [locked, attempt]);

  return (
    <div className="st-root st-hatch flex min-h-[100dvh] flex-col bg-[var(--st-stage)] text-[var(--st-text)]">
      <header className="flex shrink-0 items-center gap-2.5 border-b border-[var(--st-line)] bg-[var(--st-chrome)] px-3 py-2.5">
        <span className="cp-rec" />
        <span className="st-tc text-[var(--st-faint)]">mediapool.aep</span>
        <span className="st-tc ml-auto text-[var(--st-faint)]">00:00:00:00</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-[380px]">
          <p className="st-eyebrow">{locked ? "Media offline" : "Media Pool"}</p>
          {locked ? (
            <>
              <h1 className="mt-3 text-[40px] font-semibold leading-[1.05] tracking-[-0.035em]">Locked</h1>
              <p role="alert" className="st-body mt-3 text-[13.5px]! leading-[1.6]! text-[var(--st-dim)]">
                This page couldn&apos;t reach Media Pool.
              </p>
              <div className="mt-5 flex gap-4 text-[12.5px] text-[var(--st-faint)]">
                <button
                  ref={retry}
                  type="button"
                  onClick={() => {
                    setPhase("checking");
                    setAttempt((n) => n + 1);
                  }}
                  className="underline-offset-4 transition-colors hover:text-[var(--st-text)] hover:underline"
                >
                  Try again
                </button>
                {/* A browser can block this page's check of a private address, but not a visit. */}
                <a href={MEDIA_POOL} className="underline-offset-4 transition-colors hover:text-[var(--st-text)] hover:underline">
                  Open it directly
                </a>
              </div>
            </>
          ) : (
            <p className="st-tc mt-3 text-[var(--st-faint)]" aria-live="polite">
              Opening Media Pool…
            </p>
          )}
          <noscript>
            <p className="mt-3 text-[12.5px] text-[var(--st-faint)]">
              Opening Media Pool needs JavaScript, or <a href={MEDIA_POOL} className="underline">open it directly</a>.
            </p>
          </noscript>
        </div>
      </main>
    </div>
  );
}
