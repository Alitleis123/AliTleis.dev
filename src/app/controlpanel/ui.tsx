"use client";

import { useState } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";

/** A panel's title strip, the same as every panel in the suite. */
export function PanelHead({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-[37px] shrink-0 items-center gap-2 border-b border-[var(--st-line)] bg-[var(--st-panel-hi)] px-3 py-2">
      <span className="st-label">{label}</span>
      {children}
    </div>
  );
}

/** A boxed section inside a comp. */
export function Card({
  label,
  right,
  children,
  className = "",
}: {
  label: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-[4px] border border-[var(--st-line)] bg-[var(--st-panel)] ${className}`}
    >
      <PanelHead label={label}>{right && <div className="ml-auto flex items-center gap-2">{right}</div>}</PanelHead>
      {children}
    </section>
  );
}

export function Meter({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;
  return (
    <div className="cp-meter" aria-hidden>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

/** A ranked list with a level meter per row. */
export function Levels({
  rows,
  empty,
  unit,
  onPick,
}: {
  rows: [string, number][];
  empty: string;
  /** Singular, like "view". */
  unit: string;
  onPick?: (row: string) => void;
}) {
  if (!rows.length) return <Empty>{empty}</Empty>;
  const max = rows[0][1];
  return (
    <ul className="divide-y divide-[var(--st-line)]">
      {rows.map(([name, n]) => {
        const body = (
          <>
            <span className="flex items-baseline gap-3">
              <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--st-text)]">{name}</span>
              <span className="st-tc text-[11px] text-[var(--st-dim)]">
                {n.toLocaleString()} <span className="text-[var(--st-faint)]">{n === 1 ? unit : `${unit}s`}</span>
              </span>
            </span>
            <Meter value={n} max={max} />
          </>
        );
        return (
          <li key={name}>
            {onPick ? (
              <button
                type="button"
                onClick={() => onPick(name)}
                className="flex w-full flex-col gap-1.5 px-3 py-2.5 text-left transition-colors hover:bg-[var(--st-hover)]"
              >
                {body}
              </button>
            ) : (
              <div className="flex flex-col gap-1.5 px-3 py-2.5">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-3 py-6 text-center text-[12.5px] text-[var(--st-faint)]">{children}</p>;
}

/** A key and value row, like the project info at the foot of the suite's bin. */
export function Fact({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 py-[5px]">
      <span className="st-label w-[86px] shrink-0">{k}</span>
      <span className="min-w-0 flex-1 break-words text-right text-[12.5px] text-[var(--st-dim)]">{children}</span>
    </div>
  );
}

export function Copy({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="cp-btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          // Clipboard refused, as an insecure preview page does. The text is
          // on screen to select by hand.
        }
      }}
    >
      {done ? <LuCheck aria-hidden /> : <LuCopy aria-hidden />}
      {done ? "Copied" : label}
    </button>
  );
}

/** A small tag beside a name. */
export function Chip({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "accent" | "red" }) {
  const colors =
    tone === "accent"
      ? "border-[var(--st-sel-line)] bg-[var(--st-sel)] text-[var(--st-accent)]"
      : tone === "red"
        ? "border-[#ff5a4f]/40 bg-[#ff5a4f]/10 text-[#ff8a80]"
        : "border-[var(--st-line-strong)] text-[var(--st-dim)]";
  return (
    <span className={`st-tc inline-flex items-center rounded-[3px] border px-1.5 py-px text-[10px] ${colors}`}>
      {children}
    </span>
  );
}
