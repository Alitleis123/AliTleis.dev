"use client";

import { useMemo, useState } from "react";
import { ago, keyOf, ms, plural, type Ask, type Range, type Visitor } from "../model";
import { Card, Chip, Empty } from "../ui";

/**
 * What people asked the Ask panel, and how Gemini held up answering. A spent
 * free quota shows up as HTTP 429 in a miss, which is the number to watch.
 */
export default function Asks({
  asks,
  everyone,
  range,
  now,
  onSelect,
}: {
  asks: Ask[];
  everyone: Map<string, Visitor>;
  range: Range;
  now: number;
  onSelect: (key: string) => void;
}) {
  const [failedOnly, setFailedOnly] = useState(false);
  const inRange = useMemo(
    () => asks.filter((a) => ms(a.t) >= range.start && !everyone.get(keyOf(a))?.hidden),
    [asks, everyone, range],
  );
  const rows = failedOnly ? inRange.filter((a) => !a.a) : inRange;

  const answered = inRange.filter((a) => a.a).length;
  const times = inRange
    .filter((a) => a.a && a.ms != null)
    .map((a) => a.ms!)
    .sort((x, y) => x - y);
  const median = times.length ? times[Math.floor(times.length / 2)] : null;
  const quota = inRange.filter((a) => a.misses?.some((m) => m.includes("429"))).length;

  const tile = (label: string, value: string, note?: string, warn = false) => (
    <div className="min-w-0 rounded-[4px] border border-[var(--st-line)] bg-[var(--st-panel)] px-3.5 py-3">
      <span className="st-label">{label}</span>
      <span className={`st-metric-v mt-2 block ${warn ? "text-[#ff8a80]!" : ""}`}>{value}</span>
      {note && <span className="st-tc mt-1 block text-[10px] text-[var(--st-faint)]">{note}</span>}
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {tile("Questions", inRange.length.toLocaleString(), `in the ${range.label}`)}
        {tile(
          "Answered",
          inRange.length ? `${Math.round((answered / inRange.length) * 100)}%` : "None",
          `${answered} by Gemini`,
          inRange.length > 0 && answered < inRange.length,
        )}
        {tile("Median time", median == null ? "None" : `${(median / 1000).toFixed(1)}s`, "to answer")}
        {tile("Quota hits", String(quota), "HTTP 429 from a model", quota > 0)}
      </div>

      <Card
        label="Questions"
        right={
          <button
            type="button"
            aria-pressed={failedOnly}
            onClick={() => setFailedOnly(!failedOnly)}
            className={`cp-btn h-6! px-2! text-[11px]! ${failedOnly ? "border-[#ff5a4f]/40! text-[#ff8a80]!" : ""}`}
          >
            Failed only
          </button>
        }
      >
        {rows.length ? (
          <ul className="divide-y divide-[var(--st-line)]">
            {rows.map((a) => {
              const who = everyone.get(keyOf(a));
              return (
                <li key={a.t + a.q} className="px-3 py-3">
                  <details>
                    <summary className="cursor-pointer list-none">
                      <span className="flex items-baseline gap-3">
                        <span className="min-w-0 flex-1 text-[14px] leading-snug text-[var(--st-text)]">{a.q}</span>
                        <span className="st-tc shrink-0 text-[10px] text-[var(--st-faint)]">{ago(ms(a.t), now)}</span>
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {a.a ? <Chip>{a.model ?? "answered"}</Chip> : <Chip tone="red">{a.error ?? "failed"}</Chip>}
                        {a.ms != null && <Chip>{(a.ms / 1000).toFixed(1)}s</Chip>}
                        {(a.turn ?? 1) > 1 && <Chip>follow-up {a.turn}</Chip>}
                        {a.misses?.map((m) => (
                          <Chip key={m} tone="red">
                            missed {m}
                          </Chip>
                        ))}
                      </span>
                    </summary>
                    <p
                      className={`mt-2.5 whitespace-pre-wrap rounded-[3px] border border-[var(--st-line)] bg-[var(--st-stage)] px-3 py-2.5 text-[13px] leading-relaxed ${
                        a.a ? "text-[var(--st-dim)]" : "text-[#ff8a80]"
                      }`}
                    >
                      {a.a ?? a.error}
                    </p>
                  </details>
                  {who && (
                    <button
                      type="button"
                      onClick={() => onSelect(who.key)}
                      className="mt-2 text-[11.5px] text-[var(--st-faint)] underline-offset-4 transition-colors hover:text-[var(--st-accent)] hover:underline"
                    >
                      {who.name}
                      {who.place ? ` · ${who.place}` : ""}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty>{failedOnly ? "No failed questions in this range." : `No questions in the ${range.label}.`}</Empty>
        )}
      </Card>
      <p className="st-tc px-1 text-[10px] text-[var(--st-faint)]">{plural(asks.length, "question")} in the log</p>
    </div>
  );
}
