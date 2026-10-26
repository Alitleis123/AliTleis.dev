/**
 * The log as the panel reads it.
 *
 * The API sends raw entries, newest first. Everything here is worked out in
 * the browser: which views belong to one visitor, where their sessions start
 * and stop, what to call them, and the counts for a range.
 */

export type Visit = {
  t: string;
  path: string;
  first?: boolean;
  ref?: string | null;
  src?: string | null;
  tag?: string | null;
  id?: string | null;
  ip?: string | null;
  org?: string | null;
  place?: string | null;
  device?: string | null;
};

export type Ask = {
  t: string;
  q: string;
  turn?: number;
  a?: string;
  error?: string;
  model?: string;
  misses?: string[];
  ms?: number;
  id?: string | null;
  ip?: string | null;
  org?: string | null;
  place?: string | null;
  device?: string | null;
};

export type Label = { name: string | null; hidden: boolean };
export type Link = { name: string; note: string | null; path?: string; t: string };
export type Device = { id: string; name: string; t: string; used: string | null };

export type PanelData = {
  visits: Visit[];
  asks: Ask[];
  labels: Record<string, Label>;
  links: Record<string, Link>;
  devices: Device[];
  device: string;
  you: string | null;
};

export type Session = {
  start: number;
  end: number;
  views: Visit[];
  /** Where it arrived from, or null when it did not start with a page load. */
  source: string | null;
};

export type Visitor = {
  key: string;
  id: string | null;
  /** What to call them: Ali's name for them, a link's name, or the network. */
  name: string;
  /** Named by Ali or by a link, rather than by their network. */
  known: boolean;
  /** The named link that identifies them, if one does. */
  link: string | null;
  tags: string[];
  label?: Label;
  hidden: boolean;
  you: boolean;
  ip: string | null;
  ips: string[];
  org: string | null;
  place: string | null;
  device: string | null;
  first: number;
  last: number;
  /** Oldest first. */
  views: Visit[];
  sessions: Session[];
  asks: Ask[];
};

/** A gap this long starts a new session, the usual analytics cut. */
const SESSION_GAP = 30 * 60 * 1000;

export const ms = (t: string) => Date.parse(t);

/** One browser on one network, or the address when an entry has no id. */
export const keyOf = (e: { id?: string | null; ip?: string | null }) =>
  e.id ?? (e.ip ? `ip:${e.ip}` : "unknown");

/** Where a session's first view says it came from, by link name when it was one. */
export function sourceOf(v: Visit, links: Record<string, Link>) {
  if (!v.first) return null;
  const src = v.src && (links[v.src] ? `Link · ${links[v.src].name}` : `?ref=${v.src}`);
  return [src, v.ref].filter(Boolean).join(" via ") || "direct";
}

export function visitors(data: PanelData): Map<string, Visitor> {
  const out = new Map<string, Visitor>();

  const get = (e: Visit | Ask) => {
    const key = keyOf(e);
    let v = out.get(key);
    if (!v) {
      const label = e.id ? data.labels[e.id] : undefined;
      v = {
        key,
        id: e.id ?? null,
        name: "",
        known: false,
        link: null,
        tags: [],
        label,
        hidden: Boolean(label?.hidden),
        you: Boolean(e.id && e.id === data.you),
        ip: null,
        ips: [],
        org: null,
        place: null,
        device: null,
        first: Infinity,
        last: -Infinity,
        views: [],
        sessions: [],
        asks: [],
      };
      out.set(key, v);
    }
    const t = ms(e.t);
    v.first = Math.min(v.first, t);
    // Newest wins for the details, since an address or a network can change.
    if (t >= v.last) {
      v.last = t;
      v.ip = e.ip ?? v.ip;
      v.org = e.org ?? v.org;
      v.place = e.place ?? v.place;
      v.device = e.device ?? v.device;
    }
    if (e.ip && !v.ips.includes(e.ip)) v.ips.push(e.ip);
    return v;
  };

  // Oldest first, by time rather than list order. A view is stamped when it
  // arrives but written after its network lookup, so a slow lookup can land
  // in the list behind a later view.
  const byTime = <T extends { t: string }>(list: T[]) => [...list].sort((a, b) => a.t.localeCompare(b.t));
  for (const visit of byTime(data.visits)) {
    const v = get(visit);
    v.views.push(visit);
    for (const tag of [visit.tag, visit.src]) {
      if (tag && !v.tags.includes(tag)) v.tags.push(tag);
    }
  }
  for (const ask of byTime(data.asks)) get(ask).asks.push(ask);

  // The named link a view carried: its own ?ref= first, then the one the
  // browser kept from an earlier arrival.
  const linkOf = (x: Visit) => [x.src, x.tag].find((code) => code && data.links[code]) ?? null;

  for (const v of out.values()) {
    for (const view of v.views) {
      const t = ms(view.t);
      const s = v.sessions.at(-1);
      if (s && t - s.end < SESSION_GAP) {
        s.end = t;
        s.views.push(view);
      } else {
        v.sessions.push({ start: t, end: t, views: [view], source: sourceOf(view, data.links) });
      }
    }
    // The newest view decides, so reopening an older link names them by it.
    v.link = v.views.map(linkOf).findLast(Boolean) ?? null;
    const named = v.label?.name || (v.link && data.links[v.link].name);
    v.known = Boolean(named);
    v.name = named || (v.you ? "You" : v.org) || (v.id ? `Visitor ${v.id.slice(0, 4)}` : "Unknown visitor");
  }
  return out;
}

// ── Ranges ──────────────────────────────────────────────────────────────────

export const RANGES = [
  { id: "24h", label: "24H", ms: 24 * 60 * 60 * 1000 },
  { id: "7d", label: "7D", ms: 7 * 24 * 60 * 60 * 1000 },
  { id: "30d", label: "30D", ms: 30 * 24 * 60 * 60 * 1000 },
  { id: "90d", label: "90D", ms: 90 * 24 * 60 * 60 * 1000 },
] as const;

export type RangeId = (typeof RANGES)[number]["id"];
export type Range = { start: number; end: number; ms: number; label: string };

export function rangeOf(id: RangeId, now: number): Range {
  const r = RANGES.find((x) => x.id === id) ?? RANGES[1];
  return { start: now - r.ms, end: now, ms: r.ms, label: r.label };
}

const inRange = (t: number, r: { start: number; end: number }) => t >= r.start && t <= r.end;

/** Visitors with anything in the range, most recent first, hidden ones left out. */
export function active(all: Map<string, Visitor>, r: Range) {
  return [...all.values()]
    .filter((v) => !v.hidden && (v.views.some((x) => inRange(ms(x.t), r)) || v.asks.some((a) => inRange(ms(a.t), r))))
    .sort((a, b) => b.last - a.last);
}

export type Totals = { views: number; visitors: number; sessions: number; questions: number };

export function totals(all: Map<string, Visitor>, r: { start: number; end: number }): Totals {
  const out = { views: 0, visitors: 0, sessions: 0, questions: 0 };
  for (const v of all.values()) {
    if (v.hidden) continue;
    const views = v.views.filter((x) => inRange(ms(x.t), r)).length;
    const asks = v.asks.filter((a) => inRange(ms(a.t), r)).length;
    out.views += views;
    out.questions += asks;
    out.sessions += v.sessions.filter((s) => inRange(s.start, r)).length;
    if (views || asks) out.visitors++;
  }
  return out;
}

/** Views per bucket across the range, for the traffic lane and the meters. */
export function buckets(all: Map<string, Visitor>, r: Range, count: number) {
  const out = new Array<number>(count).fill(0);
  const width = (r.end - r.start) / count;
  for (const v of all.values()) {
    if (v.hidden) continue;
    for (const x of v.views) {
      const t = ms(x.t);
      if (!inRange(t, r)) continue;
      out[Math.min(count - 1, Math.floor((t - r.start) / width))]++;
    }
  }
  return out;
}

/** A ranked count, for the networks, sources, pages and devices lists. */
export function rank<T>(items: T[], key: (item: T) => string | null | undefined, limit = 6) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

/** Who has viewed a page in the last five minutes, and where they are now. */
export function liveNow(all: Map<string, Visitor>, now: number) {
  return [...all.values()]
    .filter((v) => !v.hidden && !v.you && now - v.last < 5 * 60 * 1000 && v.views.length)
    .map((v) => ({ visitor: v, path: v.views.at(-1)!.path, t: ms(v.views.at(-1)!.t) }))
    .sort((a, b) => b.t - a.t);
}

// ── Formatting ──────────────────────────────────────────────────────────────

export function ago(t: number, now: number) {
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 45) return "now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 7 * 86400) return `${Math.round(s / 86400)}d ago`;
  return day(t);
}

export const day = (t: number) =>
  new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const clock = (t: number) =>
  new Date(t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export const stamp = (t: number) => `${day(t)}, ${clock(t)}`;

/** A length as an editor shows it, HH:MM:SS. */
export function timecode(length: number) {
  const s = Math.max(0, Math.round(length / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export const plural = (n: number, word: string) => `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;
