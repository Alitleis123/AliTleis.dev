/**
 * Who may open the control panel at alitleis.dev/controlpanel: whoever holds
 * one of Ali's passkeys.
 *
 * Passkeys rather than a password, so there is nothing to guess or leak. The
 * panel asks the phone or laptop for Face ID, Touch ID or Windows Hello, the
 * device signs a one-time challenge with a key that never leaves it, and this
 * checks the signature against the public half stored when it enrolled. A
 * good signature buys a session token for the panel's API.
 *
 * The first device enrolls with ADMIN_PASSWORD, and only while no passkey is
 * stored, so the password stops opening anything the moment it is used. Later
 * devices enroll from a signed-in one with a pairing code. To start over after
 * losing every device, delete the passkeys hash in Upstash.
 *
 * node:crypto alone. Without attestation, enrolling needs only the public key
 * the browser has already parsed out of the authenticator's answer, so there
 * is no CBOR to decode and no library to trust.
 */
import { createHash, createPublicKey, randomBytes, timingSafeEqual, verify } from "node:crypto";
import { NS, hash, must } from "./track.js";

/**
 * The one page allowed to use this. A passkey is bound to its host, so one
 * made here works nowhere else, and a session token is only handed back to a
 * page on this origin. Local and preview runs name their own.
 */
export const ORIGIN =
  process.env.VERCEL_ENV === "production"
    ? "https://alitleis.dev"
    : process.env.PANEL_ORIGIN || "http://localhost:3000";
const RP_ID = new URL(ORIGIN).hostname;

const PASSKEYS = `${NS}passkeys`;
const PAIR = `${NS}pair`;
const PAIR_FAILS = `${NS}pair:fails`;

/** A day of reading the log, short enough that a lost phone does not stay signed in. */
const SESSION_SECONDS = 12 * 60 * 60;
const CHALLENGE_SECONDS = 5 * 60;
const PAIR_SECONDS = 10 * 60;

const sha = (data) => createHash("sha256").update(data).digest();
const b64 = (buf) => Buffer.from(buf).toString("base64url");
const unb64 = (s) => Buffer.from(typeof s === "string" ? s : "", "base64url");

/** Hashing both sides first gives timingSafeEqual the equal lengths it needs. */
const same = (a, b) => timingSafeEqual(sha(String(a)), sha(String(b)));

const sessionKey = (token) => `${NS}session:${sha(token).toString("hex")}`;

/** ES256 for Apple and Android, EdDSA and RS256 for Windows Hello and security keys. */
const ALGS = { "-7": "ec", "-8": "ed25519", "-257": "rsa" };

/** Every stored passkey, keyed by credential id. */
export const passkeys = () => hash(PASSKEYS);

/**
 * Writes that depend on what the hash holds, run inside Redis so a second
 * request cannot slip in between the check and the write. Each returns -1
 * when its condition fails.
 */
// Rewrites a passkey only if it still holds exactly what was read, so a
// sign-in cannot bring back a device forgotten while it was signing in.
const SWAP = `if redis.call("HGET", KEYS[1], ARGV[1]) == ARGV[2] then return redis.call("HSET", KEYS[1], ARGV[1], ARGV[3]) end return -1`;
// Stores the first passkey only while there is none.
const FIRST = `if redis.call("HLEN", KEYS[1]) == 0 then return redis.call("HSET", KEYS[1], ARGV[1], ARGV[2]) end return -1`;
// Forgets a passkey only while another is left.
const DROP = `if redis.call("HLEN", KEYS[1]) > 1 then return redis.call("HDEL", KEYS[1], ARGV[1]) end return -1`;

// ── Challenges ───────────────────────────────────────────────────────────────

/**
 * Random, single use and short lived, so a signature over one cannot be
 * replayed. `kind` keeps an enrollment challenge from being spent on a sign-in,
 * and marks one the password granted, which may only add the first passkey.
 */
async function challenge(kind) {
  const c = b64(randomBytes(32));
  await must([["SET", `${NS}challenge:${c}`, kind, "EX", CHALLENGE_SECONDS]]);
  return c;
}

/**
 * Checks what the browser says it signed: the right ceremony, on the panel's
 * own origin, over a challenge this issued. Returns the kind it was issued
 * for, or null. The challenge is spent whatever the outcome.
 */
async function client(json, type) {
  let data;
  try {
    data = JSON.parse(unb64(json).toString("utf8"));
  } catch {
    return null;
  }
  if (data?.type !== type || data.origin !== ORIGIN) return null;
  if (typeof data.challenge !== "string" || !/^[\w-]{43}$/.test(data.challenge)) return null;
  const [kind] = await must([["GETDEL", `${NS}challenge:${data.challenge}`]]);
  return kind ?? null;
}

/**
 * The authenticator's own record: for this host, and with someone present who
 * passed Face ID, Touch ID or the device PIN, not just a tap on a security key.
 */
function authenticator(data) {
  if (data.length < 37 || !data.subarray(0, 32).equals(sha(RP_ID))) return null;
  const flags = data[32];
  if ((flags & 0x05) !== 0x05) return null;
  return { flags, count: data.readUInt32BE(33) };
}

// ── Enrolling ────────────────────────────────────────────────────────────────

/**
 * Whether this request may add a passkey, as the kind of challenge to issue:
 * "enroll" from a signed-in device or with a pairing code one made, "first"
 * with the password while there are none at all, null otherwise.
 */
export async function mayEnroll(request, { password, code } = {}) {
  if (await signedIn(request)) return "enroll";
  if (code) return (await redeemPair(code)) ? "enroll" : null;
  if (typeof password !== "string" || !password || !process.env.ADMIN_PASSWORD) return null;
  const [count] = await must([["HLEN", PASSKEYS]]);
  return count === 0 && same(password, process.env.ADMIN_PASSWORD) ? "first" : null;
}

export async function enrollOptions(kind) {
  const keys = await passkeys();
  return {
    challenge: await challenge(kind),
    rp: { id: RP_ID, name: "Ali Tleis control panel" },
    user: { id: b64("ali"), name: "ali", displayName: "Ali Tleis" },
    pubKeyCredParams: Object.keys(ALGS).map((alg) => ({ type: "public-key", alg: Number(alg) })),
    authenticatorSelection: { residentKey: "required", userVerification: "required" },
    // A device that already holds one, like a Mac that synced the iPhone's
    // through iCloud Keychain, is told so instead of making a second.
    excludeCredentials: Object.keys(keys).map((id) => ({ type: "public-key", id })),
    attestation: "none",
    timeout: 120000,
  };
}

const TRANSPORTS = new Set(["ble", "hybrid", "internal", "nfc", "usb"]);

/** Stores a new passkey from the browser's answer and signs that device in. */
export async function enroll(cred, name) {
  const kind = await client(cred?.clientDataJSON, "webauthn.create");
  if (kind !== "enroll" && kind !== "first") return null;

  const data = unb64(cred.authenticatorData);
  const auth = authenticator(data);
  // Attested credential data: 16 bytes of AAGUID, a 2-byte length, the id.
  if (!auth || !(auth.flags & 0x40) || data.length < 55) return null;
  const id = unb64(cred.id);
  const len = data.readUInt16BE(53);
  if (!id.length || !data.subarray(55, 55 + len).equals(id)) return null;

  const type = ALGS[String(cred.alg)];
  let key;
  try {
    key = createPublicKey({ key: unb64(cred.publicKey), format: "der", type: "spki" });
  } catch {
    return null;
  }
  if (!type || key.asymmetricKeyType !== type) return null;
  if (type === "ec" && key.asymmetricKeyDetails?.namedCurve !== "prime256v1") return null;

  const transports = (Array.isArray(cred.transports) ? cred.transports : []).filter((t) =>
    TRANSPORTS.has(t),
  );
  const record = JSON.stringify({
    key: b64(key.export({ format: "der", type: "spki" })),
    alg: Number(cred.alg),
    name: typeof name === "string" && name.trim() ? name.trim().slice(0, 60) : "Device",
    transports,
    count: auth.count,
    t: new Date().toISOString(),
    used: new Date().toISOString(),
  });
  // Two challenges the password granted while the hash was empty must not
  // both add a device. The second one finds the first already there.
  const [stored] = await must([
    kind === "first" ? ["EVAL", FIRST, 1, PASSKEYS, b64(id), record] : ["HSET", PASSKEYS, b64(id), record],
  ]);
  if (!(stored >= 0)) return null;
  return startSession(b64(id));
}

// ── Signing in ───────────────────────────────────────────────────────────────

export async function signInOptions() {
  const keys = await passkeys();
  return {
    challenge: await challenge("sign-in"),
    rpId: RP_ID,
    allowCredentials: Object.entries(keys).map(([id, k]) => ({
      type: "public-key",
      id,
      ...(k.transports?.length ? { transports: k.transports } : {}),
    })),
    userVerification: "required",
    timeout: 120000,
  };
}

/** Checks a signature from a stored passkey, and starts a session if it holds. */
export async function signIn(cred) {
  if ((await client(cred?.clientDataJSON, "webauthn.get")) !== "sign-in") return null;
  const id = b64(unb64(cred.id));
  const [raw] = await must([["HGET", PASSKEYS, id]]);
  if (!raw) return null;
  const pk = JSON.parse(raw);

  const data = unb64(cred.authenticatorData);
  const auth = authenticator(data);
  if (!auth) return null;

  let good = false;
  try {
    good = verify(
      pk.alg === -8 ? null : "sha256",
      Buffer.concat([data, sha(unb64(cred.clientDataJSON))]),
      { key: unb64(pk.key), format: "der", type: "spki" },
      unb64(cred.signature),
    );
  } catch {
    good = false;
  }
  if (!good) return null;

  // A counter that did not go up means the key was copied off its device.
  // Passkeys that sync between devices report 0 every time, which passes,
  // but one that has counted before may not drop back to 0.
  if ((auth.count || pk.count) && auth.count <= (pk.count ?? 0)) return null;

  const [swapped] = await must([
    ["EVAL", SWAP, 1, PASSKEYS, id, raw, JSON.stringify({ ...pk, count: auth.count, used: new Date().toISOString() })],
  ]);
  if (!(swapped >= 0)) return null;
  return startSession(id);
}

// ── Sessions ─────────────────────────────────────────────────────────────────

/** Only the hash is stored, so reading the database does not sign anyone in. */
async function startSession(cred) {
  const token = b64(randomBytes(32));
  await must([
    ["SET", sessionKey(token), JSON.stringify({ cred, t: new Date().toISOString() }), "EX", SESSION_SECONDS],
  ]);
  return token;
}

const bearer = (request) =>
  /^Bearer ([\w-]{43})$/.exec(request.headers.get("authorization") ?? "")?.[1] ?? null;

/** The passkey this request's session came from, or null when signed out. */
export async function signedIn(request) {
  const token = bearer(request);
  if (!token) return null;
  const [raw] = await must([["GET", sessionKey(token)]]);
  if (!raw) return null;
  const { cred } = JSON.parse(raw);
  // Forgetting a device ends its sessions with it.
  const [known] = await must([["HEXISTS", PASSKEYS, cred]]);
  return known ? cred : null;
}

export async function endSession(request) {
  const token = bearer(request);
  if (token) await must([["DEL", sessionKey(token)]]);
}

/** Forgets a device, unless it is the last one, which would reopen the password. */
export async function forget(id) {
  const [removed] = await must([["EVAL", DROP, 1, PASSKEYS, String(id)]]);
  return removed === 1;
}

// ── Pairing ──────────────────────────────────────────────────────────────────

/** Crockford's base 32: no I, L, O or U to misread, and 32 so a byte maps evenly. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** What someone typing the code means by it, whatever case and separators. */
const normal = (code) =>
  String(code).toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1").replace(/[^0-9A-Z]/g, "");

/**
 * A code that lets one more device enroll, shown on a signed-in one. Eight
 * characters is 40 bits, and five wrong tries end it, so it cannot be guessed
 * in the ten minutes it lives.
 */
export async function startPair() {
  const code = [...randomBytes(8)].map((b) => ALPHABET[b % 32]).join("");
  await must([
    ["SET", PAIR, sha(code).toString("hex"), "EX", PAIR_SECONDS],
    ["DEL", PAIR_FAILS],
  ]);
  return { code: `${code.slice(0, 4)}-${code.slice(4)}`, expires: Date.now() + PAIR_SECONDS * 1000 };
}

async function redeemPair(code) {
  const [stored] = await must([["GET", PAIR]]);
  if (!stored) return false;
  if (same(sha(normal(code)).toString("hex"), stored)) {
    // Two devices racing with the same code: only the one that deletes it wins.
    const [deleted] = await must([["DEL", PAIR]]);
    return deleted === 1;
  }
  const [fails] = await must([
    ["INCR", PAIR_FAILS],
    ["EXPIRE", PAIR_FAILS, PAIR_SECONDS],
  ]);
  if (fails >= 5) await must([["DEL", PAIR]]);
  return false;
}

// ── Responses ────────────────────────────────────────────────────────────────

/**
 * Unlike the Ask function, these answer one origin only. A page elsewhere can
 * still send a request, but cannot read the log or a token out of the reply.
 */
export function reply(request, body, status = 200) {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store", Vary: "Origin" };
  if (request.headers.get("origin") === ORIGIN) headers["Access-Control-Allow-Origin"] = ORIGIN;
  return new Response(JSON.stringify(body), { status, headers });
}

export function preflight(request) {
  if (request.headers.get("origin") !== ORIGIN) return new Response(null, { status: 403 });
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });
}
