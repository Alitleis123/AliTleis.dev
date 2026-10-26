"use client";

import { useMemo, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { ago, plural, type Visitor } from "../model";
import { Card, Chip, Empty } from "../ui";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "known", label: "Named" },
  { id: "asked", label: "Asked" },
  { id: "hidden", label: "Hidden" },
] as const;

/**
 * Every visitor in the range, newest first, searchable by anything the log
 * knows about them: name, network, place, address, device or link tag.
 */
export default function Visitors({
  people,
  hidden,
  now,
  selected,
  query,
  onQuery,
  onSelect,
}: {
  people: Visitor[];
  /** Visitors Ali hid, listed only under their own filter. */
  hidden: Visitor[];
  now: number;
  selected: string | null;
  query: string;
  onQuery: (q: string) => void;
  onSelect: (key: string) => void;
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const rows = useMemo(() => {
    const base =
      filter === "hidden" ? hidden
      : filter === "known" ? people.filter((v) => v.known)
      : filter === "asked" ? people.filter((v) => v.asks.length)
      : people;
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((v) =>
      [v.name, v.org, v.place, v.device, v.id, ...v.ips, ...v.tags].some((f) => f?.toLowerCase().includes(q)),
    );
  }, [people, hidden, filter, query]);

  return (
    <Card
      label="Visitors"
      right={<span className="st-tc text-[10px] text-[var(--st-faint)]">{plural(rows.length, "visitor")}</span>}
    >
      <div className="flex flex-col gap-2 border-b border-[var(--st-line)] p-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <LuSearch aria-hidden className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--st-faint)]" />
          <input
            className="cp-input pl-8!"
            type="search"
            placeholder="Search name, network, place, IP or link"
            aria-label="Search visitors"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
        </label>
        <div className="flex gap-1" role="group" aria-label="Filter visitors">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`cp-btn ${filter === f.id ? "border-[var(--st-sel-line)]! bg-[var(--st-sel)]! text-[var(--st-accent)]!" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length ? (
        <ul className="divide-y divide-[var(--st-line)]">
          {rows.map((v) => {
            const on = selected === v.key;
            return (
              <li key={v.key}>
                <button
                  type="button"
                  onClick={() => onSelect(v.key)}
                  className={`relative grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 px-3 py-2.5 text-left transition-colors sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] ${
                    on ? "bg-[var(--st-sel)]" : "hover:bg-[var(--st-hover)]"
                  }`}
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[2px]"
                    style={{ background: on ? "var(--st-accent)" : "transparent" }}
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className={`truncate text-[13.5px] ${v.known ? "text-[var(--st-text)]" : "text-[var(--st-dim)]"}`}>
                        {v.name}
                      </span>
                      {v.you && <Chip tone="accent">You</Chip>}
                      {v.link && <Chip tone="accent">Link</Chip>}
                      {v.asks.length > 0 && <Chip>{plural(v.asks.length, "question")}</Chip>}
                    </span>
                    <span className="block truncate text-[11.5px] text-[var(--st-faint)]">
                      {[v.known ? v.org : null, v.place, v.device].filter(Boolean).join(" · ") || "No details"}
                    </span>
                  </span>
                  <span className="st-tc col-start-1 row-start-2 truncate text-[11px] text-[var(--st-dim)] sm:col-start-2 sm:row-start-1">
                    {v.ip ?? "No address"}
                  </span>
                  <span className="col-start-2 row-span-2 row-start-1 text-right sm:col-start-3">
                    <span className="st-tc block text-[11px] text-[var(--st-text)]">{plural(v.views.length, "view")}</span>
                    <span className="st-tc block text-[10px] text-[var(--st-faint)]">{ago(v.last, now)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty>{query ? "Nobody matches that." : filter === "hidden" ? "Nobody is hidden." : "No visitors in this range."}</Empty>
      )}
    </Card>
  );
}
