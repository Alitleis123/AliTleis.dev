"use client";

import Link from "next/link";
import { useState } from "react";
import { LuArrowLeft, LuKeyRound, LuScanFace } from "react-icons/lu";
import { enroll, passkeysWork, unlock, why } from "./api";

/**
 * What anyone but Ali sees: the frame an editor shows for footage it cannot
 * find. Nothing from the log is on this page or in its bundle. The data only
 * leaves the API for a session a passkey started.
 *
 * Three ways through. Unlock is the everyday one. Pairing is how a new device
 * gets its own passkey. The password form shows only before any passkey
 * exists, for the very first device.
 */
export default function Lock({
  enrolled,
  onOpen,
}: {
  enrolled: boolean;
  onOpen: () => void;
}) {
  const [mode, setMode] = useState<"unlock" | "pair" | "setup">(enrolled ? "unlock" : "setup");
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const works = passkeysWork();

  const run = async (job: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await job();
      onOpen();
    } catch (err) {
      setError(why(err));
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) return;
    run(() => enroll(mode === "pair" ? { code: secret } : { password: secret }));
  };

  return (
    <div className="st-root st-hatch relative flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--st-stage)] px-5 py-10 text-[var(--st-text)]">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 text-[12px] text-[var(--st-faint)] transition-colors hover:text-[var(--st-text)]"
      >
        <LuArrowLeft aria-hidden /> alitleis.dev
      </Link>

      <div className="w-full max-w-[380px] overflow-hidden rounded-[6px] border border-[var(--st-line-strong)] bg-[var(--st-panel)] shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2 border-b border-[var(--st-line)] bg-[var(--st-panel-hi)] px-3 py-2">
          <span className="cp-rec" />
          <span className="st-tc text-[var(--st-faint)]">controlpanel.aep</span>
          <span className="st-tc ml-auto text-[var(--st-faint)]">00:00:00:00</span>
        </div>

        <div className="px-6 pb-6 pt-7">
          <p className="st-eyebrow">Media offline</p>
          <h1 className="mt-3 text-[26px] font-light leading-[1.1] tracking-[-0.03em]">
            {mode === "setup" ? "Set up the first device" : mode === "pair" ? "Pair this device" : "Locked"}
          </h1>
          <p className="st-body mt-3 text-[13.5px]! leading-[1.6]! text-[var(--st-dim)]">
            {mode === "setup"
              ? "Enter the admin password once. This device then makes a passkey, and the password stops working for good."
              : mode === "pair"
                ? "On a signed-in device, open Devices and tap Pair a device. Type the code it shows here."
                : "Only Ali's devices open this panel."}
          </p>

          {!works ? (
            <p className="mt-5 rounded-[3px] border border-[#ff5a4f]/35 bg-[#ff5a4f]/10 px-3 py-2.5 text-[12.5px] text-[#ff8a80]">
              Passkeys need an https page in a current browser, and this one has neither.
            </p>
          ) : mode === "unlock" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(unlock)}
              className="cp-btn cp-btn-primary mt-6 h-11! w-full text-[14px]!"
            >
              <LuScanFace aria-hidden className="text-[18px]" />
              {busy ? "Waiting for the passkey…" : "Unlock with passkey"}
            </button>
          ) : (
            <form onSubmit={submit} className="mt-6 flex flex-col gap-2.5">
              <label className="st-label" htmlFor="cp-secret">
                {mode === "pair" ? "Pairing code" : "Admin password"}
              </label>
              <input
                id="cp-secret"
                className="cp-input st-tc tracking-[0.08em]!"
                type={mode === "pair" ? "text" : "password"}
                autoComplete={mode === "pair" ? "one-time-code" : "current-password"}
                autoCapitalize="characters"
                placeholder={mode === "pair" ? "XXXX-XXXX" : ""}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
              <button type="submit" disabled={busy || !secret.trim()} className="cp-btn cp-btn-primary mt-1 h-11! w-full text-[14px]!">
                <LuKeyRound aria-hidden className="text-[16px]" />
                {busy ? "Waiting for the passkey…" : "Make a passkey"}
              </button>
            </form>
          )}

          {error && (
            <p role="alert" className="mt-3 text-[12.5px] text-[#ff8a80]">
              {error}
            </p>
          )}

          {enrolled && works && (
            <button
              type="button"
              onClick={() => {
                setMode(mode === "pair" ? "unlock" : "pair");
                setSecret("");
                setError(null);
              }}
              className="mt-5 text-[12.5px] text-[var(--st-faint)] underline-offset-4 transition-colors hover:text-[var(--st-text)] hover:underline"
            >
              {mode === "pair" ? "Unlock with a passkey instead" : "New device? Pair it with a code"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
