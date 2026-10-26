/**
 * Page views, reported by the site with navigator.sendBeacon.
 *
 * A beacon posts as text/plain, which skips the CORS preflight and never
 * reads the response, so this answers 204 whatever happens.
 */
import { VISITS, address, isBot, limiter, record, visitor } from "../lib/track.js";

const done = () => new Response(null, { status: 204 });

/** A reader moving through the site sends a few views, not dozens. */
const throttled = limiter(30, 10 * 60 * 1000);

const clip = (v, max) => (typeof v === "string" && v ? v.slice(0, max) : null);

/** The referring site's host, or null for a direct visit or one from this site. */
function from(referrer) {
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host === "alitleis.dev" ? null : host;
  } catch {
    return null;
  }
}

export async function POST(request) {
  if (isBot(request.headers.get("user-agent"))) return done();
  if (throttled(address(request) || "unknown")) return done();

  let body;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return done();
  }
  const path = clip(body?.path, 200);
  if (!path?.startsWith("/")) return done();

  await record(VISITS, {
    t: new Date().toISOString(),
    path,
    // The page a visit arrived on. Only that view knows where it came from.
    first: body.first === true,
    ref: from(body.ref),
    // ?ref= on a link Ali sent, so he can tell which one was opened.
    src: clip(body.src, 80),
    // The last ?ref= this browser arrived with, sent on every view after it,
    // so someone who opened a named link is still named when they come back
    // without it.
    tag: clip(body.tag, 80),
    ...(await visitor(request)),
  });
  return done();
}
