"use client";

import { useMemo } from "react";
import Timeline from "../Timeline";
import {
  ago,
  buckets,
  day,
  liveNow,
  ms,
  plural,
  rank,
  sourceOf,
  stamp,
  totals,
  type Link,
  type Range,
  type Totals,
  type Visitor,
} from "../model";
import { Card, Empty, Levels } from "../ui";

/**
 * The first comp: who is on the site now, the range's numbers against the
 * range before it, the views over the range, and where they came from.
 */
export default function Overview({
  everyone,
  people,
  links,
  range,
  now,
  selected,
  onSelect,
  onFind,
}: {
  everyone: Map<string, Visitor>;
  links: Record<string, Link>;
  people: Visitor[];
  range: Range;
  now: number;
  selected: string | null;
  onSelect: (key: string) => void;
  /** Opens Visitors searching for this, as a network row does. */
  onFind: (query: string) => void;
}) {
  const live = useMemo(() => liveNow(everyone, now), [everyone, now]);
  const cur = useMemo(() => totals(everyone, range), [everyone, range]);
  const prev = useMemo(
    () => totals(everyone, { start: range.start - range.ms, end: range.start }),
    [everyone, range],
  );
  const bars = useMemo(() => buckets(everyone, range, range.bars), [everyone, range]);

  const views = useMemo(
    () => people.flatMap((v) => v.views.filter((x) => ms(x.t) >= range.start).map((x) => ({ x, v }))),
    [people, range],
  );
  const networks = rank(views, ({ v }) => v.org ?? "Unknown network");
  const sources = rank(views, ({ x }) => sourceOf(x, links));
  // /galaxy and /galaxy/ are one page, logged both ways over time.
  const pages = rank(views, ({ x }) => x.path.replace(/\/?$/, "/"));
  const devices = rank(people, (v) => v.device);

  const meter = (key: keyof Totals, label: string) => (
    <div className="min-w-0 rounded-[4px] border border-[var(--st-line)] bg-[var(--st-panel)] px-3 pb-3 pt-3 sm:px-3.5">
      <span className="st-label">{label}</span>
      <span className="st-metric-v mt-2 block">{cur[key].toLocaleString()}</span>
      <span className="mt-1.5 block text-[12px] leading-snug text-[var(--st-faint)]">
        {prev[key].toLocaleString()} the {range.before}
      </span>
    </div>
  );

  const peak = Math.max(1, ...bars);
  // A day's range is told by the hour, the longer ones by the day.
  const when = (t: number) => (range.id === "24h" ? stamp(t) : day(t));

  return (
    <div className="flex flex-col gap-3">
      <Card
        label="On the site now"
        right={<span className="st-tc text-[10px] text-[var(--st-faint)]">last 5 minutes</span>}
      >
        {live.length ? (
          <ul className="divide-y divide-[var(--st-line)]">
            {live.map(({ visitor: v, path, t }) => (
              <li key={v.key}>
                <button
                  type="button"
                  onClick={() => onSelect(v.key)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[var(--st-hover)]"
                >
                  <span className="cp-rec cp-rec-on" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] text-[var(--st-text)]">{v.name}</span>
                    <span className="block truncate text-[11.5px] text-[var(--st-faint)]">
                      {[v.place, v.device].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="st-tc truncate text-[11px] text-[var(--st-accent)]">{path}</span>
                  <span className="st-tc text-[10px] text-[var(--st-faint)]">{ago(t, now)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Nobody is on the site right now.</Empty>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {meter("visitors", "Visitors")}
        {meter("views", "Page views")}
        {meter("questions", "Questions")}
      </div>

      {/* The range's views, one bar per hour, day or five days. */}
      <Card
        label="Page views"
        right={<span className="st-tc text-[10px] text-[var(--st-faint)]">{range.per}</span>}
      >
        <div className="flex h-[64px] items-end gap-[3px] px-3 pt-3">
          {bars.map((n, i) => (
            <span
              key={i}
              title={`${plural(n, "view")}, ${stamp(range.start + (i * range.ms) / range.bars)} to ${stamp(range.start + ((i + 1) * range.ms) / range.bars)}`}
              className="flex-1 rounded-[1px]"
              style={{
                height: n ? `${Math.max(10, (n / peak) * 100)}%` : "2px",
                background: n ? "var(--st-accent)" : "var(--st-line-strong)",
                opacity: n ? 0.45 + 0.55 * (n / peak) : 1,
              }}
            />
          ))}
        </div>
        <div className="st-tc flex justify-between px-3 pb-2.5 pt-1.5 text-[10px] text-[var(--st-faint)]">
          <span>{when(range.start)}</span>
          <span>now</span>
        </div>
      </Card>

      {/* The docked timeline is md and up. On a phone it lives here. */}
      <div className="overflow-hidden rounded-[4px] border border-[var(--st-line)] md:hidden">
        <Timeline
          people={people}
          range={range}
          selected={selected}
          onSelect={onSelect}
          tracks={5}
        />
        {people.length > 5 && (
          <p className="st-tc border-t border-[var(--st-line)] px-3 py-1.5 text-[var(--st-faint)]">
            Latest 5 of {people.length} visitors
          </p>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card label="Networks">
          <Levels
            rows={networks}
            unit="view"
            empty="No views in this range."
            onPick={(org) => onFind(org === "Unknown network" ? "" : org)}
          />
        </Card>
        <Card label="Sources">
          <Levels rows={sources} unit="visit" empty="No arrivals in this range." />
        </Card>
        <Card label="Pages">
          <Levels rows={pages} unit="view" empty="No views in this range." />
        </Card>
        <Card label="Devices">
          <Levels rows={devices} unit="visitor" empty="No visitors in this range." />
        </Card>
      </div>
    </div>
  );
}
