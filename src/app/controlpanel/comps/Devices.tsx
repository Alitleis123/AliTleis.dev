"use client";

import { useEffect, useState } from "react";
import { LuFingerprint, LuLock, LuSmartphone, LuTrash2 } from "react-icons/lu";
import { edit, enroll, pair, why } from "../api";
import { ago, stamp, type Device } from "../model";
import { Card, Chip } from "../ui";

/**
 * The passkeys that open this panel, and the controls for this browser.
 *
 * A Mac on the same Apple ID as the iPhone already has the iPhone's passkey
 * through iCloud Keychain and needs nothing here. Anything else pairs with a
 * code from a device that is signed in.
 */
export default function Devices({
  devices,
  current,
  now,
  onLock,
  onChanged,
}: {
  devices: Device[];
  current: string;
  now: number;
  onLock: () => void;
  onChanged: () => void;
}) {
  const [code, setCode] = useState<{ code: string; expires: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [counted, setCounted] = useState<boolean | null>(null);

  // Read after mount, since the server render has no storage to read.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCounted(!localStorage.getItem("notrack"));
    } catch {
      setCounted(null);
    }
  }, []);

  // Its own second hand, so the countdown runs without re-counting the log.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!code) return;
    const update = () => setTick(Date.now());
    const timer = setInterval(update, 1000);
    const first = setTimeout(update, 0);
    return () => {
      clearInterval(timer);
      clearTimeout(first);
    };
  }, [code]);
  const left = code && tick ? Math.max(0, Math.round((code.expires - tick) / 1000)) : code ? 600 : 0;

  const act = async (job: () => Promise<unknown>) => {
    setError(null);
    try {
      await job();
      onChanged();
    } catch (err) {
      setError(why(err));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Card label="This browser">
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="text-[14px] text-[var(--st-text)]">
              {devices.find((d) => d.id === current)?.name ?? "Signed in"}
            </p>
            <p className="mt-0.5 text-[12px] text-[var(--st-faint)]">
              Signed in for up to 12 hours.{" "}
              {counted === false
                ? "Your visits from this browser are not counted."
                : counted
                  ? "Your visits from this browser are counted."
                  : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {counted !== null && (
              <button
                type="button"
                className="cp-btn"
                onClick={() => {
                  if (counted) localStorage.setItem("notrack", "1");
                  else localStorage.removeItem("notrack");
                  setCounted(!counted);
                }}
              >
                {counted ? "Stop counting me" : "Count me again"}
              </button>
            )}
            <button type="button" className="cp-btn" onClick={() => act(() => enroll())}>
              <LuFingerprint aria-hidden /> Add this browser&apos;s passkey
            </button>
            <button type="button" className="cp-btn cp-btn-primary" onClick={onLock}>
              <LuLock aria-hidden /> Lock
            </button>
          </div>
        </div>
      </Card>

      <Card label="Pair a device">
        <div className="flex flex-col gap-3 p-3">
          {code && left > 0 ? (
            <div className="flex flex-col items-start gap-2 rounded-[3px] border border-[var(--st-sel-line)] bg-[var(--st-sel)] p-4">
              <span className="st-label">Pairing code</span>
              <span className="st-tc select-all text-[30px]! tracking-[0.12em] text-[var(--st-accent)]">{code.code}</span>
              <span className="st-tc text-[11px] text-[var(--st-dim)]">
                Works once, for {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")} more
              </span>
              <p className="text-[12.5px] leading-relaxed text-[var(--st-dim)]">
                On the new device, open alitleis.dev/controlpanel, tap New device, and type this code. It then makes its
                own passkey.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <p className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-[var(--st-dim)]">
                For a computer that cannot use this phone&apos;s passkey. You get a code that works once, for ten
                minutes.
              </p>
              <button type="button" className="cp-btn cp-btn-primary" onClick={() => act(async () => setCode(await pair()))}>
                <LuSmartphone aria-hidden /> Pair a device
              </button>
            </div>
          )}
        </div>
      </Card>

      <Card label="Passkeys" right={<span className="st-tc text-[10px] text-[var(--st-faint)]">{devices.length}</span>}>
        <ul className="divide-y divide-[var(--st-line)]">
          {devices.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-3 py-3">
              <LuFingerprint aria-hidden className="shrink-0 text-[18px] text-[var(--st-faint)]" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[13.5px] text-[var(--st-text)]">
                  <span className="truncate">{d.name}</span>
                  {d.id === current && <Chip tone="accent">Signed in</Chip>}
                </p>
                <p className="st-tc text-[10.5px] text-[var(--st-faint)]">
                  Added {stamp(Date.parse(d.t))}
                  {d.used ? ` · used ${ago(Date.parse(d.used), now)}` : ""}
                </p>
              </div>
              <button
                type="button"
                className="cp-btn"
                disabled={devices.length <= 1}
                title={devices.length <= 1 ? "The last passkey stays, or setup would open to the password again." : undefined}
                aria-label={`Forget ${d.name}`}
                onClick={() => {
                  if (!confirm(`Forget ${d.name}? It is signed out and can no longer unlock the panel.`)) return;
                  act(() => edit({ action: "forget", id: d.id }));
                }}
              >
                <LuTrash2 aria-hidden /> Forget
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {error && (
        <p role="alert" className="px-1 text-[12.5px] text-[#ff8a80]">
          {error}
        </p>
      )}
    </div>
  );
}
