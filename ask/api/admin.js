/**
 * Ali's view of the log: who opened the site, where they came from, and what
 * they asked the Ask panel with what it answered.
 *
 * Behind HTTP Basic auth, so a phone browser asks for the password itself and
 * can save it. Any username works. The password is the ADMIN_PASSWORD variable
 * on the Vercel project.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import { ASKS, VISITS, recent } from "../lib/track.js";

const DAY = 24 * 60 * 60 * 1000;

const digest = (s) => createHash("sha256").update(s).digest();

/** Hashing both sides first gives timingSafeEqual the equal lengths it needs. */
function signedIn(request) {
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return false;
  const pair = Buffer.from(header.slice(6), "base64").toString("utf8");
  const given = pair.slice(pair.indexOf(":") + 1);
  return timingSafeEqual(digest(given), digest(process.env.ADMIN_PASSWORD));
}

/** Everything in the log came from a visitor, so all of it is escaped. */
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const when = (t) =>
  new Date(t).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const within = (items, days) => items.filter((e) => Date.now() - Date.parse(e.t) < days * DAY);

/** Where a visit came from, which only its first page view knows. */
const source = (v) =>
  v.first ? [v.src && `?ref=${v.src}`, v.ref].filter(Boolean).join(" via ") || "direct" : null;

const meta = (parts) =>
  `<div class="meta">${parts.filter(Boolean).map(esc).join(" · ")}</div>`;

/** One row per network, newest first, with how much of the site it read. */
function who(visits) {
  const byOrg = new Map();
  for (const v of visits) {
    const key = v.org ?? "Unknown network";
    const row = byOrg.get(key) ?? { org: key, views: 0, ids: new Set(), last: v, from: new Set() };
    row.views++;
    if (v.id) row.ids.add(v.id);
    if (v.first) row.from.add(source(v));
    byOrg.set(key, row);
  }
  return [...byOrg.values()]
    .map(
      (r) => `<li><b>${esc(r.org)}</b>${meta([
        `${r.views} view${r.views === 1 ? "" : "s"}`,
        `${r.ids.size} visitor${r.ids.size === 1 ? "" : "s"}`,
        `last ${when(r.last.t)}`,
        r.last.place,
        r.from.size && `from ${[...r.from].join(", ")}`,
      ])}</li>`,
    )
    .join("");
}

function sources(visits) {
  const counts = new Map();
  for (const v of visits.filter((x) => x.first)) {
    counts.set(source(v), (counts.get(source(v)) ?? 0) + 1);
  }
  return [...counts]
    .sort((a, b) => b[1] - a[1])
    .map(([s, n]) => `<li><b>${esc(s)}</b>${meta([`${n} visit${n === 1 ? "" : "s"}`])}</li>`)
    .join("");
}

const visitRow = (v) =>
  `<li><b>${esc(v.path)}</b> <span class="t">${esc(when(v.t))}</span>${meta([
    v.org,
    v.place,
    source(v),
    v.device,
    v.id && `visitor ${v.id}`,
  ])}</li>`;

const askRow = (a) =>
  `<li><details><summary><span class="t">${esc(when(a.t))}</span> ${esc(a.q)}</summary>${
    a.a ? `<p>${esc(a.a)}</p>` : `<p class="err">${esc(a.error)}</p>`
  }${meta([
    a.model,
    a.ms != null && `${(a.ms / 1000).toFixed(1)}s`,
    a.turn > 1 && `follow-up ${a.turn}`,
    ...(a.misses ?? []).map((m) => `missed ${m}`),
    a.org,
    a.place,
    a.device,
    a.id && `visitor ${a.id}`,
  ])}</details></li>`;

function page(visits, asks) {
  const week = within(visits, 7);
  const weekAsks = within(asks, 7);
  const answered = weekAsks.filter((a) => a.a).length;
  const month = within(visits, 30);
  const stat = (n, label) => `<div class="stat"><b>${n}</b><span>${label}</span></div>`;
  const section = (title, items, empty) =>
    `<h2>${title}</h2>${items ? `<ul>${items}</ul>` : `<p class="empty">${empty}</p>`}`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Portfolio log</title>
<style>
  body { margin: 0 auto; max-width: 860px; padding: 24px 16px 64px; background: #0b0b0d; color: #e8e8ea; font: 15px/1.45 system-ui, sans-serif; }
  h1 { font-size: 20px; margin: 0 0 16px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .12em; color: #9a9aa2; margin: 32px 0 8px; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; }
  .stat { background: #16161a; border-radius: 10px; padding: 12px; }
  .stat b { display: block; font-size: 22px; }
  .stat span, .meta, .t, .empty { color: #8b8b94; font-size: 13px; }
  ul { list-style: none; margin: 0; padding: 0; }
  li { border-bottom: 1px solid #222228; padding: 10px 0; overflow-wrap: anywhere; }
  summary { cursor: pointer; }
  details p { margin: 8px 0 4px; white-space: pre-wrap; }
  .err { color: #ff8a80; }
</style></head><body>
<h1>Portfolio log</h1>
<div class="stats">
  ${stat(week.length, "views, 7 days")}
  ${stat(new Set(week.map((v) => v.id)).size, "visitors, 7 days")}
  ${stat(weekAsks.length, "questions, 7 days")}
  ${stat(weekAsks.length ? `${Math.round((answered / weekAsks.length) * 100)}%` : "none", "answered by Gemini, 7 days")}
</div>
${section("Who, last 30 days", who(month), "No visits yet.")}
${section("Where from, last 30 days", sources(month), "No visits yet.")}
${section("Questions", asks.slice(0, 200).map(askRow).join(""), "No questions yet.")}
${section("Visits", visits.slice(0, 200).map(visitRow).join(""), "No visits yet.")}
</body></html>`;
}

export async function GET(request) {
  if (!process.env.ADMIN_PASSWORD) {
    return new Response("Set ADMIN_PASSWORD on the Vercel project, then redeploy.", { status: 503 });
  }
  if (!signedIn(request)) {
    return new Response("Password needed.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Portfolio log", charset="UTF-8"' },
    });
  }
  const [visits, asks] = await Promise.all([recent(VISITS), recent(ASKS)]);
  return new Response(page(visits, asks), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
