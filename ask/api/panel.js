/**
 * The control panel's data, for a signed-in session only. GET returns the
 * whole log with Ali's notes on it, and POST changes those notes: a name for a
 * visitor, a named link to send someone, a device to forget.
 *
 * The page at alitleis.dev/controlpanel does all the counting. It loads the
 * whole log once, up to 3,000 entries a list, and then polls with ?visits=
 * and ?asks= set to the newest time it holds, for what came after.
 */
import { randomBytes } from "node:crypto";
import { ASKS, LABELS, LINKS, VISITS, hash, idOf, must, newer, recent } from "../lib/track.js";
import { forget, passkeys, preflight, reply, signedIn } from "../lib/owner.js";

export const OPTIONS = preflight;

const clip = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Six characters a recipient will not read anything into, unlike ?ref=jane. */
async function newCode() {
  for (;;) {
    const code = [...randomBytes(6)].map((b) => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join("");
    const [known] = await must([["HEXISTS", LINKS, code]]);
    if (!known) return code;
  }
}

export async function GET(request) {
  try {
    const device = await signedIn(request);
    if (!device) return reply(request, { error: "Signed out." }, 401);
    const q = new URL(request.url).searchParams;
    // Present but empty means the panel holds none yet, so everything is newer.
    const read = (list, key) => (q.has(key) ? newer(list, q.get(key)) : recent(list));
    const [visits, asks, labels, links, keys] = await Promise.all([
      read(VISITS, "visits"),
      read(ASKS, "asks"),
      hash(LABELS),
      hash(LINKS),
      passkeys(),
    ]);
    return reply(request, {
      visits,
      asks,
      labels,
      links,
      devices: Object.entries(keys).map(([id, k]) => ({ id, name: k.name, t: k.t, used: k.used })),
      device,
      // The id this browser's own views carry, so the panel can point out
      // which visitor is Ali.
      you: idOf(request),
    });
  } catch (err) {
    console.error("Panel read failed:", err.message);
    return reply(request, { error: "The database did not answer." }, 503);
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return reply(request, { error: "Send JSON." }, 400);
  }

  try {
    if (!(await signedIn(request))) return reply(request, { error: "Signed out." }, 401);

    switch (body?.action) {
      case "label": {
        const id = clip(body.id, 8);
        if (!/^[0-9a-f]{8}$/.test(id)) return reply(request, { error: "No such visitor." }, 400);
        const name = clip(body.name, 60);
        const hidden = body.hidden === true;
        await must([
          name || hidden
            ? ["HSET", LABELS, id, JSON.stringify({ name: name || null, hidden })]
            : ["HDEL", LABELS, id],
        ]);
        return reply(request, { ok: true });
      }

      case "link": {
        const name = clip(body.name, 60);
        if (!name) return reply(request, { error: "Give the link a name." }, 400);
        const code = await newCode();
        await must([
          ["HSET", LINKS, code, JSON.stringify({ name, note: clip(body.note, 200) || null, t: new Date().toISOString() })],
        ]);
        return reply(request, { code });
      }

      case "unlink":
        await must([["HDEL", LINKS, clip(body.code, 80)]]);
        return reply(request, { ok: true });

      case "forget":
        return (await forget(clip(body.id, 200)))
          ? reply(request, { ok: true })
          : reply(request, { error: "Keep at least one device, or the password opens setup again." }, 400);

      default:
        return reply(request, { error: "Unknown action." }, 400);
    }
  } catch (err) {
    console.error("Panel write failed:", err.message);
    return reply(request, { error: "The database did not answer. Try again." }, 503);
  }
}
