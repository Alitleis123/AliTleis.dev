"use client";

import { useState } from "react";
import { LuEye, LuEyeOff, LuX } from "react-icons/lu";
import { edit } from "./api";
import { clock, day, ms, plural, stamp, timecode, type Link, type Visitor } from "./model";
import { Chip, Copy, Fact, PanelHead } from "./ui";

/**
 * Everything known about one visitor, the way an inspector shows one clip.
 *
 * The name field is how Ali puts a name to someone the log could only call by
 * their network. It sticks to the visitor id, so every view and question that
 * browser sends afterwards carries it too.
 */
export default function Inspector({
  visitor: v,
  links,
  now,
  onClose,
  onChanged,
}: {
  visitor: Visitor;
  links: Record<string, Link>;
  now: number;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [name, setName] = useState(v.label?.name ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (next: { name?: string; hidden?: boolean }) => {
    if (!v.id) return;
    setBusy(true);
    setError(null);
    try {
      await edit({
        action: "label",
        id: v.id,
        name: next.name ?? v.label?.name ?? "",
        hidden: next.hidden ?? v.hidden,
      });
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const sessions = [...v.sessions].reverse();

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--st-panel)]">
      <PanelHead label="Inspector">
        <button type="button" onClick={onClose} aria-label="Close the inspector" className="cp-btn ml-auto h-6! px-1.5!">
          <LuX aria-hidden />
        </button>
      </PanelHead>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-[var(--st-line)] px-4 pb-4 pt-4">
          <h2 className="text-[22px] font-light leading-tight tracking-[-0.03em] text-[var(--st-text)]">{v.name}</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {v.you && <Chip tone="accent">This is you</Chip>}
            {v.link && <Chip tone="accent">Link · {links[v.link]?.name}</Chip>}
            {v.tags
              .filter((t) => !links[t])
              .map((t) => (
                <Chip key={t}>?ref={t}</Chip>
              ))}
            {v.hidden && <Chip>Hidden from stats</Chip>}
          </div>

          {v.id ? (
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                save({ name });
              }}
            >
              <input
                className="cp-input"
                placeholder="Name this visitor"
                aria-label="Name this visitor"
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button type="submit" className="cp-btn cp-btn-primary" disabled={busy || name === (v.label?.name ?? "")}>
                Save
              </button>
            </form>
          ) : (
            <p className="mt-3 text-[12px] text-[var(--st-faint)]">Logged before visitor ids, so it cannot be named.</p>
          )}
          {v.id && (
            <button
              type="button"
              disabled={busy}
              onClick={() => save({ hidden: !v.hidden })}
              className="cp-btn mt-2"
            >
              {v.hidden ? <LuEye aria-hidden /> : <LuEyeOff aria-hidden />}
              {v.hidden ? "Count in stats again" : "Hide from stats"}
            </button>
          )}
          {error && <p className="mt-2 text-[12px] text-[#ff8a80]">{error}</p>}
        </div>

        <div className="border-b border-[var(--st-line)] px-4 py-3">
          <Fact k="IP">
            {v.ip ? (
              <span className="inline-flex items-center gap-2">
                <span className="st-tc text-[12px] text-[var(--st-text)]">{v.ip}</span>
                <Copy text={v.ip} label="" />
              </span>
            ) : (
              "Not logged"
            )}
          </Fact>
          {v.ips.length > 1 && <Fact k="Also from">{v.ips.filter((ip) => ip !== v.ip).join(", ")}</Fact>}
          <Fact k="Network">{v.org ?? "Unknown"}</Fact>
          <Fact k="Place">{v.place ?? "Unknown"}</Fact>
          <Fact k="Device">{v.device ?? "Unknown"}</Fact>
          <Fact k="First seen">{stamp(v.first)}</Fact>
          <Fact k="Last seen">{stamp(v.last)}</Fact>
          <Fact k="Activity">
            {plural(v.views.length, "view")} · {plural(v.sessions.length, "visit")}
            {v.asks.length ? ` · ${plural(v.asks.length, "question")}` : ""}
          </Fact>
          {v.id && (
            <Fact k="Visitor id">
              <span className="st-tc text-[11px]">{v.id}</span>
            </Fact>
          )}
        </div>

        {v.asks.length > 0 && (
          <div className="border-b border-[var(--st-line)] px-4 py-3">
            <p className="st-label">Asked</p>
            <ul className="mt-2 flex flex-col gap-2">
              {[...v.asks].reverse().map((a) => (
                <li key={a.t + a.q}>
                  <details className="group">
                    <summary className="cursor-pointer list-none text-[13px] leading-snug text-[var(--st-text)]">
                      <span className="st-tc mr-2 text-[10px] text-[var(--st-faint)]">{clock(ms(a.t))}</span>
                      {a.q}
                    </summary>
                    <p className={`mt-1.5 whitespace-pre-wrap text-[12.5px] leading-relaxed ${a.a ? "text-[var(--st-dim)]" : "text-[#ff8a80]"}`}>
                      {a.a ?? a.error}
                    </p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* The path through the site, as an edit decision list: one event
            per page, numbered, with its time. */}
        <div className="px-4 py-3">
          <p className="st-label">Edit decision list</p>
          {sessions.map((s, i) => (
            <div key={s.start} className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-[12.5px] text-[var(--st-text)]">{day(s.start)}</span>
                <span className="st-tc text-[10px] text-[var(--st-faint)]">{timecode(s.end - s.start)}</span>
                <span className="ml-auto truncate text-[11px] text-[var(--st-faint)]">{s.source ?? ""}</span>
              </div>
              <ol className="mt-1.5 overflow-hidden rounded-[3px] border border-[var(--st-line)]">
                {s.views.map((view, j) => (
                  <li
                    key={view.t + j}
                    className="flex items-baseline gap-2.5 border-b border-[var(--st-line)] bg-[var(--st-stage)] px-2.5 py-1.5 last:border-b-0"
                  >
                    <span className="st-tc text-[10px] text-[var(--st-faint)]">
                      {String(sessions.length - i).padStart(2, "0")}.{String(j + 1).padStart(2, "0")}
                    </span>
                    <span className="st-tc min-w-0 flex-1 truncate text-[11.5px] text-[var(--st-text)]">{view.path}</span>
                    <span className="st-tc text-[10px] text-[var(--st-dim)]">{clock(ms(view.t))}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
          {!sessions.length && <p className="mt-2 text-[12px] text-[var(--st-faint)]">No page views, only questions.</p>}
          {sessions.length > 0 && (
            <p className="st-tc mt-3 text-[10px] text-[var(--st-faint)]">
              Last seen {Math.round((now - v.last) / 60000) < 1 ? "just now" : `${day(v.last)} ${clock(v.last)}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
