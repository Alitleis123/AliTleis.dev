"use client";

import { useMemo, useState } from "react";
import { LuPlus, LuShare, LuTrash2 } from "react-icons/lu";
import { edit } from "../api";
import { ago, day, ms, plural, type Link, type Visitor } from "../model";
import { Card, Copy, Empty } from "../ui";

const PAGES = [
  { path: "/", label: "Chooser" },
  { path: "/galaxy/", label: "Reading view" },
  { path: "/studio/", label: "Editing suite" },
];

/**
 * Named links, which is how the log learns a name. Make one per person the
 * site goes to, and whoever opens it is called that from then on, on every
 * later visit from that browser too, link or not.
 */
export default function Links({
  links,
  everyone,
  now,
  onSelect,
  onChanged,
}: {
  links: Record<string, Link>;
  everyone: Map<string, Visitor>;
  now: number;
  onSelect: (key: string) => void;
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [page, setPage] = useState("/");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);

  const url = (code: string, path = "/") => `${window.location.origin}${path}?ref=${code}`;

  /** Who opened each link, from every view that carried its code. */
  const opened = useMemo(() => {
    const out = new Map<string, { people: Visitor[]; arrivals: number; last: number }>();
    for (const code of Object.keys(links)) out.set(code, { people: [], arrivals: 0, last: 0 });
    for (const v of everyone.values()) {
      for (const code of v.tags) {
        const o = out.get(code);
        if (!o) continue;
        o.people.push(v);
        for (const x of v.views) {
          if (x.src === code) o.arrivals++;
          if (x.tag === code || x.src === code) o.last = Math.max(o.last, ms(x.t));
        }
      }
    }
    return out;
  }, [links, everyone]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const { code } = await edit<{ code: string }>({ action: "link", name, note });
      setFresh(url(code, page));
      setName("");
      setNote("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not make the link.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (code: string, label: string) => {
    if (!confirm(`Delete the link for ${label}? Visits already logged keep their code, but lose the name.`)) return;
    try {
      await edit({ action: "unlink", code });
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the link.");
    }
  };

  const list = Object.entries(links).sort((a, b) => ms(b[1].t) - ms(a[1].t));

  return (
    <div className="flex flex-col gap-3">
      <Card label="New link">
        <form onSubmit={create} className="flex flex-col gap-2.5 p-3">
          <div className="grid gap-2.5 sm:grid-cols-[1fr_1fr_auto]">
            <input
              className="cp-input"
              placeholder="Who it is for, like Jane at Google"
              aria-label="Who the link is for"
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="cp-input"
              placeholder="Note, optional"
              aria-label="Note"
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <select className="cp-input" aria-label="Page the link opens" value={page} onChange={(e) => setPage(e.target.value)}>
              {PAGES.map((p) => (
                <option key={p.path} value={p.path}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="cp-btn cp-btn-primary" disabled={busy || !name.trim()}>
              <LuPlus aria-hidden /> Make link
            </button>
            <p className="text-[12px] text-[var(--st-faint)]">
              The link carries a random code, so the person it goes to sees nothing with their name in it.
            </p>
          </div>
          {fresh && (
            <div className="mt-1 flex flex-col gap-2 rounded-[3px] border border-[var(--st-sel-line)] bg-[var(--st-sel)] p-3 sm:flex-row sm:items-center">
              <span className="st-tc min-w-0 flex-1 select-all truncate text-[12px] text-[var(--st-text)]">{fresh}</span>
              <div className="flex gap-2">
                <Copy text={fresh} />
                {typeof navigator !== "undefined" && "share" in navigator && (
                  <button type="button" className="cp-btn" onClick={() => navigator.share({ url: fresh }).catch(() => {})}>
                    <LuShare aria-hidden /> Share
                  </button>
                )}
              </div>
            </div>
          )}
          {error && <p className="text-[12px] text-[#ff8a80]">{error}</p>}
        </form>
      </Card>

      <Card label="Links" right={<span className="st-tc text-[10px] text-[var(--st-faint)]">{list.length}</span>}>
        {list.length ? (
          <ul className="divide-y divide-[var(--st-line)]">
            {list.map(([code, link]) => {
              const o = opened.get(code)!;
              return (
                <li key={code} className="flex flex-col gap-2 px-3 py-3">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] text-[var(--st-text)]">{link.name}</p>
                      {link.note && <p className="mt-0.5 text-[12px] text-[var(--st-faint)]">{link.note}</p>}
                      <p className="st-tc mt-1 select-all truncate text-[11px] text-[var(--st-dim)]">{url(code)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`st-tc text-[12px] ${o.people.length ? "text-[var(--st-accent)]" : "text-[var(--st-faint)]"}`}>
                        {o.people.length ? plural(o.arrivals || 1, "open") : "Not opened"}
                      </p>
                      <p className="st-tc text-[10px] text-[var(--st-faint)]">
                        {o.last ? ago(o.last, now) : `made ${day(ms(link.t))}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Copy text={url(code)} />
                    <button type="button" className="cp-btn" onClick={() => remove(code, link.name)} aria-label={`Delete the link for ${link.name}`}>
                      <LuTrash2 aria-hidden /> Delete
                    </button>
                    {o.people.map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => onSelect(v.key)}
                        className="text-[11.5px] text-[var(--st-faint)] underline-offset-4 transition-colors hover:text-[var(--st-accent)] hover:underline"
                      >
                        {[v.org, v.place, v.device].filter(Boolean).join(" · ") || v.name}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty>No links yet. Make one for the next person you send the site to.</Empty>
        )}
      </Card>
    </div>
  );
}
