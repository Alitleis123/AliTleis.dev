"use client";

import { useCallback, useEffect, useState } from "react";
import { LuScanFace } from "react-icons/lu";

/** Media Pool, Ali's fleet app, which answers only on his own tailnet. */
const MEDIA_POOL = "https://light-vm.tailde9e5d.ts.net:8088/";

/** Whether this browser reaches Media Pool, which answers /api/door only to Ali's own devices. */
async function reachable() {
  try {
    const res = await fetch(`${MEDIA_POOL}api/door`, { cache: "no-store", signal: AbortSignal.timeout(4000) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * The way into Media Pool from this site: the viewer an editor shows for
 * footage it cannot find, with the file's title bar across the top.
 *
 * Media Pool runs on Ali's own network and answers nothing outside it, so this
 * page holds none of it. It asks whether this browser can reach Media Pool
 * and, if it can, goes there, to a passkey page that looks the same as this
 * one. Anyone else stays on the lock. A browser that reaches it is one of
 * Ali's, so its visits stop counting on the site too.
 */
export default function Door() {
  const [phase, setPhase] = useState<"checking" | "opening" | "locked">("checking");
  const [tried, setTried] = useState(false);

  const knock = useCallback(
    () =>
      reachable().then((ok) => {
        if (!ok) return setPhase("locked");
        setPhase("opening");
        try {
          localStorage.setItem("notrack", "1");
        } catch {
          // Storage is blocked, so this browser's visits keep counting.
        }
        window.location.replace(MEDIA_POOL);
      }),
    [],
  );

  useEffect(() => {
    void knock();
  }, [knock]);

  return (
    <div className="st-root st-hatch flex min-h-[100dvh] flex-col bg-[var(--st-stage)] text-[var(--st-text)]">
      <header className="flex shrink-0 items-center gap-2.5 border-b border-[var(--st-line)] bg-[var(--st-chrome)] px-3 py-2.5">
        <span className="cp-rec" />
        <span className="st-tc text-[var(--st-faint)]">mediapool.aep</span>
        <span className="st-tc ml-auto text-[var(--st-faint)]">00:00:00:00</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-[380px]">
          <p className="st-eyebrow">Media offline</p>
          <h1 className="mt-3 text-[40px] font-semibold leading-[1.05] tracking-[-0.035em]">Locked</h1>
          <button
            type="button"
            disabled={phase !== "locked"}
            onClick={() => {
              setPhase("checking");
              setTried(true);
              void knock();
            }}
            className="cp-btn cp-btn-primary mt-6 h-11! w-full text-[14px]!"
          >
            <LuScanFace aria-hidden className="text-[18px]" />
            {phase === "locked" ? "Unlock with passkey" : phase === "opening" ? "Opening…" : "Connecting…"}
          </button>
          {phase === "locked" && tried && (
            <p role="alert" className="mt-3 text-[12.5px] text-cp-red-text">
              This device can&apos;t reach Media Pool.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
