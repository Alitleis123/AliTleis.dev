/**
 * The log behind /api/admin: every question asked in the Ask panel with what
 * came back, and every page view the site reports to /api/visit.
 *
 * Kept in Upstash Redis on the free plan, as two capped lists of JSON, newest
 * first. Logging never fails a request. Without the database variables, or
 * with Upstash down, the entry is dropped and the caller carries on.
 */
import { createHash } from "node:crypto";

const DB_URL = process.env.KV_REST_API_URL;
const DB_TOKEN = process.env.KV_REST_API_TOKEN;

/** Local and preview runs log beside production rather than into it. */
const NS = process.env.VERCEL_ENV === "production" ? "" : "dev:";
export const ASKS = `${NS}asks`;
export const VISITS = `${NS}visits`;

/** Roughly a year of a portfolio's traffic, and well under the free 256MB. */
const KEEP = 3000;

async function redis(commands) {
  if (!DB_URL || !DB_TOKEN) return null;
  const res = await fetch(`${DB_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${DB_TOKEN}` },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) throw new Error(`Upstash returned ${res.status}`);
  return (await res.json()).map((r) => r.result);
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

export async function recent(list) {
  const [items] = (await redis([["LRANGE", list, 0, KEEP - 1]])) ?? [[]];
  return items.flatMap((item) => {
    try {
      return [JSON.parse(item)];
    } catch {
      return [];
    }
  });
}

/** Crawlers and headless checks, which would otherwise read as visitors. */
export const isBot = (ua) =>
  !ua || /bot|crawl|spider|slurp|headless|lighthouse|preview|curl|python/i.test(ua);

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
    if (res.ok) found = await res.json();
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
 * What the log keeps about whoever sent the request. Never the address itself:
 * the id is a salted hash of address and browser, enough to tell a return
 * visit from a new one. The salt is the database token, which is secret, so
 * the id cannot be reversed by hashing every IPv4 address.
 */
export async function visitor(request) {
  const h = request.headers;
  // Vercel sets x-forwarded-for itself, so a client cannot pick its own.
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || "";
  const ua = h.get("user-agent") || "";
  const net = ip ? await lookup(ip) : null;
  const city = h.get("x-vercel-ip-city");
  const place = [
    city ? decodeURIComponent(city) : net?.city,
    h.get("x-vercel-ip-country-region") ?? net?.region,
    h.get("x-vercel-ip-country") ?? net?.country,
  ].filter(Boolean);
  return {
    id: ip
      ? createHash("sha256").update(`${DB_TOKEN}|${ip}|${ua}`).digest("hex").slice(0, 8)
      : null,
    org: net?.company || null,
    place: place.length ? place.join(", ") : null,
    device: device(ua),
  };
}
