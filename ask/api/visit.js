/**
 * Page views, reported by the site with navigator.sendBeacon.
 *
 * A beacon posts as text/plain, which skips the CORS preflight and never
 * reads the response, so this answers 204 whatever happens.
 */
import { VISITS, isBot, record, visitor } from "../lib/track.js";

const done = () => new Response(null, { status: 204 });

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
    ref: from(body.ref),
    // ?ref= on a link Ali sent, so he can tell which one was opened.
    src: clip(body.src, 80),
    ...(await visitor(request)),
  });
  return done();
}
