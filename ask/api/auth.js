/**
 * Sign-in for the control panel at alitleis.dev/controlpanel. See lib/owner.js
 * for how passkeys, pairing codes and sessions fit together.
 *
 * One POST endpoint with an `action`, so the site talks to a single URL and
 * the Hobby plan's function count stays low.
 */
import { address, limiter } from "../lib/track.js";
import {
  endSession,
  enroll,
  enrollOptions,
  mayEnroll,
  passkeys,
  preflight,
  reply,
  signIn,
  signInOptions,
  signedIn,
  startPair,
} from "../lib/owner.js";

/**
 * Per address, per warm instance. Unlocking takes two requests and a page
 * load one more, so this leaves room for a lot of honest retries while
 * keeping the password and pairing doors from being hammered.
 */
const throttled = limiter(40, 10 * 60 * 1000);

export const OPTIONS = preflight;

export async function POST(request) {
  if (throttled(address(request) || "unknown")) {
    return reply(request, { error: "Too many tries. Wait ten minutes." }, 429);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return reply(request, { error: "Send JSON." }, 400);
  }

  try {
    switch (body?.action) {
      case "status":
        return reply(request, {
          enrolled: Object.keys(await passkeys()).length > 0,
          signedIn: Boolean(await signedIn(request)),
        });

      case "enroll-options": {
        const kind = await mayEnroll(request, body);
        if (!kind) {
          return reply(request, { error: body.code ? "That code did not work." : "Wrong password." }, 403);
        }
        return reply(request, await enrollOptions(kind));
      }

      case "enroll": {
        const token = await enroll(body.credential, body.name);
        return token
          ? reply(request, { token })
          : reply(request, { error: "That passkey could not be checked. Try again." }, 400);
      }

      case "sign-in-options":
        return reply(request, await signInOptions());

      case "sign-in": {
        const token = await signIn(body.credential);
        return token
          ? reply(request, { token })
          : reply(request, { error: "That passkey is not one of yours." }, 401);
      }

      case "pair":
        if (!(await signedIn(request))) return reply(request, { error: "Signed out." }, 401);
        return reply(request, await startPair());

      case "lock":
        await endSession(request);
        return reply(request, { ok: true });

      default:
        return reply(request, { error: "Unknown action." }, 400);
    }
  } catch (err) {
    console.error("Auth failed:", err.message);
    return reply(request, { error: "The database did not answer. Try again." }, 503);
  }
}
