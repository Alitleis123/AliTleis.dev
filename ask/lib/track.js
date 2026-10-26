/**
 * The log behind the control panel at alitleis.dev/controlpanel: every
 * question asked in the Ask panel with what came back, and every page view the
 * site reports to /api/visit.
 *
 * Kept in Upstash Redis on the free plan, as two capped lists of JSON, newest
 * first. Logging never fails a request. Without the database variables, or
 * with Upstash down, the entry is dropped and the caller carries on.
 */
import { createHash } from "node:crypto";

const DB_URL = process.env.KV_REST_API_URL;
const DB_TOKEN = process.env.KV_REST_API_TOKEN;

/** Local and preview runs log beside production rather than into it. */
export const NS = process.env.VERCEL_ENV === "production" ? "" : "dev:";
export const ASKS = `${NS}asks`;
export const VISITS = `${NS}visits`;
/** The panel's own notes: names Ali gave visitors, and the links he sent out. */
export const LABELS = `${NS}labels`;
export const LINKS = `${NS}links`;

/** Roughly a year of a portfolio's traffic, and well under the free 256MB. */
const KEEP = 3000;

export async function redis(commands) {
  if (!DB_URL || !DB_TOKEN) return null;
  const res = await fetch(`${DB_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${DB_TOKEN}` },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) throw new Error(`Upstash returned ${res.status}`);
  // A pipeline answers 200 even when one of its commands failed, with that
  // command's error in place of its result. Passed on as undefined, a failed
  // conditional write in lib/owner.js would read as one that went through.
  const out = await res.json();
  const failed = out.find((r) => r.error);
  if (failed) throw new Error(`Upstash command failed: ${failed.error}`);
  return out.map((r) => r.result);
}

export async function record(list, entry) {
  try {
    await redis([
      ["LPUSH", list, JSON.stringify(entry)],
      ["LTRIM", list, 0, KEEP - 1],
    ]);
  } catch (err) {
    console.error("Could not log:", err.message);
  }
}

/**
 * Lets a log write finish after the response has gone out. This is Vercel's
 * waitUntil, read from the global that @vercel/functions reads, without that
 * package's 25 dependencies. Where the global is missing or fails, as outside
 * Vercel, the write is awaited instead, so an entry is never dropped for it.
 *
 * Never throws. ask.js calls it inside the model loop's try, where an error
 * would read as a failed model and ask the next one again.
 */
export async function later(promise) {
  try {
    const waitUntil = globalThis[Symbol.for("@vercel/request-context")]?.get?.()?.waitUntil;
    if (waitUntil) return void waitUntil(promise);
  } catch (err) {
    console.error("waitUntil failed:", err.message);
  }
  await promise;
}

/**
 * For the panel and its sign-in, where a missing database is an error to show
 * rather than an entry to drop.
 */
export async function must(commands) {
  const out = await redis(commands);
  if (!out) throw new Error("KV_REST_API_URL and KV_REST_API_TOKEN are not set.");
  return out;
}

/** A Redis hash of JSON values, as an object. Upstash sends HGETALL flat. */
export async function hash(key) {
  const [flat] = await must([["HGETALL", key]]);
  const out = {};
  for (let i = 0; i + 1 < (flat?.length ?? 0); i += 2) {
    try {
      out[flat[i]] = JSON.parse(flat[i + 1]);
    } catch {
      // A hand-edited entry that is not JSON is skipped, not fatal.
    }
  }
  return out;
}

const parsed = (items) =>
  items.flatMap((item) => {
    try {
      return [JSON.parse(item)];
    } catch {
      return [];
    }
  });

export async function recent(list) {
  const [items] = (await redis([["LRANGE", list, 0, KEEP - 1]])) ?? [[]];
  return parsed(items);
}

/**
 * Entries logged after `since`, read from the head of the list a page at a
 * time. The panel polls with this, so a poll moves a few new entries out of
 * Upstash rather than the whole log, which on the free plan's 10GB a month
 * would run out after a few days of leaving the panel open.
 */
export async function newer(list, since) {
  const out = [];
  for (let start = 0; start < KEEP; start += 100) {
    const [items] = await must([["LRANGE", list, start, start + 99]]);
    for (const entry of parsed(items)) {
      if (entry.t <= since) return out;
      out.push(entry);
    }
    if (items.length < 100) break;
  }
  return out;
}

/** Crawlers and headless checks, which would otherwise read as visitors. */
export const isBot = (ua) =>
  !ua || /bot|crawl|spider|slurp|headless|lighthouse|preview|curl|python/i.test(ua);

/** Vercel sets x-forwarded-for itself, so a client cannot pick its own. */
export const address = (request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "";

/**
 * Per address, per warm instance, the same kind of limit the Ask function
 * keeps. Requests spread across instances or addresses get past it, but one
 * script on one machine can no longer push real visits out of the capped list
 * or spend the day's lookups.
 */
export function limiter(limit, windowMs) {
  const seen = new Map();
  return (key) => {
    const now = Date.now();
    if (seen.size > 5000) seen.clear();
    const entry = seen.get(key);
    if (!entry || now - entry.start > windowMs) {
      seen.set(key, { start: now, count: 1 });
      return false;
    }
    return ++entry.count > limit;
  };
}

/**
 * Text fields only, from either response shape. The keyless tier answers flat,
 * the documented one nests them under company and location.
 */
const text = (v) => (typeof v === "string" && v ? v.slice(0, 120) : null);

/**
 * Who an address belongs to. Vercel's headers already carry the city, but not
 * the network, which is what says a visit came from a company or a school
 * rather than a home connection. api.ipapi.is answers that without a key, up to
 * 1,000 lookups a day, so a warm instance keeps what it has already looked up.
 */
const networks = new Map();

async function lookup(ip) {
  if (networks.has(ip)) return networks.get(ip);
  let found = null;
  try {
    const res = await fetch(`https://api.ipapi.is/?q=${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const d = await res.json();
      found = {
        company: text(d.company) ?? text(d.company?.name),
        city: text(d.city) ?? text(d.location?.city),
        region: text(d.region) ?? text(d.location?.state),
        country: text(d.country) ?? text(d.location?.country),
      };
    }
  } catch (err) {
    console.error("Network lookup failed:", err.message);
  }
  if (networks.size > 5000) networks.clear();
  networks.set(ip, found);
  return found;
}

function device(ua) {
  if (!ua) return null;
  const os = /iPhone/.test(ua) ? "iPhone"
    : /iPad/.test(ua) ? "iPad"
    : /Android/.test(ua) ? "Android"
    : /CrOS/.test(ua) ? "ChromeOS"
    : /Mac OS X/.test(ua) ? "Mac"
    : /Windows/.test(ua) ? "Windows"
    : /Linux/.test(ua) ? "Linux"
    : "Other";
  // LinkedIn's in-app browser says where the click came from, which a referrer
  // from inside the app usually does not.
  const browser = /LinkedInApp/.test(ua) ? "LinkedIn app"
    : /Edg\//.test(ua) ? "Edge"
    : /OPR\//.test(ua) ? "Opera"
    : /Firefox\/|FxiOS/.test(ua) ? "Firefox"
    : /Chrome\/|CriOS/.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari"
    : "Other";
  return `${os} · ${browser}`;
}

/**
 * A salted hash of address and browser, the same for every view one browser
 * sends from one network. The salt is the database token, which is secret, so
 * nobody outside can work out which id is theirs.
 */
export function idOf(request) {
  const ip = address(request);
  if (!ip) return null;
  const ua = request.headers.get("user-agent") || "";
  return createHash("sha256").update(`${DB_TOKEN}|${ip}|${ua}`).digest("hex").slice(0, 8);
}

/**
 * What the log keeps about whoever sent the request: the address, the network
 * and place it belongs to, the device, and the id that ties one browser's
 * views together.
 */
export async function visitor(request) {
  const h = request.headers;
  const ip = address(request);
  const ua = h.get("user-agent") || "";
  const net = ip ? await lookup(ip) : null;
  const city = h.get("x-vercel-ip-city");
  const place = [
    city ? decodeURIComponent(city) : net?.city,
    h.get("x-vercel-ip-country-region") ?? net?.region,
    h.get("x-vercel-ip-country") ?? net?.country,
  ].filter(Boolean);
  return {
    id: idOf(request),
    ip: ip || null,
    org: net?.company ?? null,
    place: place.length ? place.join(", ") : null,
    device: device(ua),
  };
}
