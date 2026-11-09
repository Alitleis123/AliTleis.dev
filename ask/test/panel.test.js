/**
 * Offline checks for the control panel's sign-in and data endpoints.
 *
 * Upstash is replaced by an in-memory Redis behind the same REST pipeline, and
 * the authenticator by real P-256 and Ed25519 keys, so every signature here is
 * checked by the same node:crypto calls production makes.
 *
 *   node --test ask/test
 */
import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, randomBytes, sign } from "node:crypto";
import { beforeEach, test } from "node:test";

const ORIGIN = "https://panel.test";
process.env.PANEL_ORIGIN = ORIGIN;
process.env.ADMIN_PASSWORD = "hunter2";
process.env.KV_REST_API_URL = "https://kv.test";
process.env.KV_REST_API_TOKEN = "secret-token";
delete process.env.VERCEL_ENV;

// ── A Redis that holds strings and hashes, which is all the panel uses ──────

let store;
/** Runs just before an EVAL, to land a write in the gap a race would open. */
let beforeEval = null;
/** When set, every EVAL answers with an error, the way a pipeline reports one. */
let evalFails = false;
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  if (!String(url).startsWith("https://kv.test/")) return realFetch(url, init);
  const out = JSON.parse(init.body).map(([cmd, key, ...args]) => {
    const h = () => (store.has(key) ? store.get(key) : store.set(key, new Map()).get(key));
    switch (cmd) {
      case "SET": store.set(key, String(args[0])); return { result: "OK" };
      case "GET": return { result: store.get(key) ?? null };
      case "GETDEL": { const v = store.get(key) ?? null; store.delete(key); return { result: v }; }
      case "DEL": return { result: store.delete(key) ? 1 : 0 };
      case "INCR": { const n = Number(store.get(key) ?? 0) + 1; store.set(key, String(n)); return { result: n }; }
      case "EXPIRE": return { result: 1 };
      case "HSET": h().set(args[0], args[1]); return { result: 1 };
      case "HGET": return { result: h().get(args[0]) ?? null };
      case "EVAL": {
        if (evalFails) return { error: "ERR script failed" };
        if (key.includes("LRANGE")) {
          const [, list, since, keep] = args;
          return { result: (store.get(list) ?? []).slice(0, keep).filter((item) => {
            try {
              return JSON.parse(item)?.t > since;
            } catch {
              return false;
            }
          }) };
        }
        // The four scripts in lib/owner.js, told apart by what they check.
        if (key.includes('"GET"')) {
          const [, hashKey, pairKey, field, value, code] = args;
          if (store.get(pairKey) !== code) return { result: -1 };
          (store.get(hashKey) ?? store.set(hashKey, new Map()).get(hashKey)).set(field, value);
          store.delete(pairKey);
          return { result: 1 };
        }
        const [, hashKey, field, a, b] = [key, args[1], args[2], args[3], args[4]];
        beforeEval?.();
        const m = store.get(hashKey) ?? store.set(hashKey, new Map()).get(hashKey);
        if (cmd === "EVAL" && key.includes("== ARGV[2]")) {
          if (m.get(field) !== a) return { result: -1 };
          m.set(field, b);
          return { result: 0 };
        }
        if (key.includes("== 0")) {
          if (m.size !== 0) return { result: -1 };
          m.set(field, a);
          return { result: 1 };
        }
        if (key.includes("> 1")) {
          if (!m.has(field)) return { result: 0 };
          if (m.size <= 1) return { result: -1 };
          return { result: m.delete(field) ? 1 : 0 };
        }
        throw new Error("fake Redis does not know this script");
      }
      case "HDEL": return { result: h().delete(args[0]) ? 1 : 0 };
      case "HEXISTS": return { result: h().has(args[0]) ? 1 : 0 };
      case "HLEN": return { result: h().size };
      case "HGETALL": return { result: [...h()].flat() };
      case "LPUSH": { const l = store.get(key) ?? []; l.unshift(args[0]); store.set(key, l); return { result: l.length }; }
      case "LTRIM": return { result: "OK" };
      case "LRANGE": return { result: (store.get(key) ?? []).slice(args[0], args[1] + 1) };
      default: throw new Error(`fake Redis has no ${cmd}`);
    }
  });
  return Response.json(out);
};

const auth = await import("../api/auth.js");
const panel = await import("../api/panel.js");
const visit = await import("../api/visit.js");

beforeEach(() => {
  store = new Map();
  beforeEval = null;
  evalFails = false;
});

// ── A browser on the panel's page ───────────────────────────────────────────

const b64 = (buf) => Buffer.from(buf).toString("base64url");
const sha = (d) => createHash("sha256").update(d).digest();

let ip = 0;
function req(method, path, { body, token, origin = ORIGIN } = {}) {
  ip++;
  const headers = {
    "content-type": "application/json",
    "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) Safari/604.1",
    "x-forwarded-for": `10.0.${ip >> 8}.${ip & 255}`,
    origin,
  };
  if (token) headers.authorization = `Bearer ${token}`;
  return new Request(`https://api.test${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function call(handler, path, opts) {
  const res = await handler(req(opts?.method ?? "POST", path, opts));
  return { status: res.status, headers: res.headers, body: await res.json() };
}

const authCall = (body, opts = {}) => call(auth.POST, "/api/auth", { ...opts, body });

/** An authenticator: a key pair, an id, and a counter, like Face ID holds. */
function device(kind = "ec") {
  const { publicKey, privateKey } =
    kind === "ec"
      ? generateKeyPairSync("ec", { namedCurve: "P-256" })
      : generateKeyPairSync("ed25519");
  return {
    id: randomBytes(16),
    alg: kind === "ec" ? -7 : -8,
    publicKey,
    privateKey,
    count: 0,
    rpId: new URL(ORIGIN).hostname,
  };
}

function clientData(type, challenge, origin = ORIGIN) {
  return Buffer.from(JSON.stringify({ type, challenge, origin, crossOrigin: false }));
}

function authData(d, { flags = 0x05, attested = false } = {}) {
  const head = Buffer.alloc(37);
  sha(d.rpId).copy(head, 0);
  head[32] = flags | (attested ? 0x40 : 0);
  head.writeUInt32BE(d.count, 33);
  if (!attested) return head;
  const len = Buffer.alloc(2);
  len.writeUInt16BE(d.id.length);
  // The COSE key would follow here. The server reads the SPKI the browser
  // parsed instead, so a placeholder stands in for it.
  return Buffer.concat([head, Buffer.alloc(16), len, d.id, Buffer.from([0xa0])]);
}

function created(d, options, overrides = {}) {
  return {
    id: b64(d.id),
    clientDataJSON: b64(clientData("webauthn.create", options.challenge, overrides.origin)),
    authenticatorData: b64(authData(d, { attested: true, flags: overrides.flags })),
    publicKey: b64(d.publicKey.export({ format: "der", type: "spki" })),
    alg: d.alg,
    transports: ["internal", "hybrid", "bogus"],
  };
}

function asserted(d, options, overrides = {}) {
  const cd = clientData("webauthn.get", options.challenge, overrides.origin);
  const ad = authData(d, { flags: overrides.flags });
  const signed = Buffer.concat([ad, sha(cd)]);
  const sig = sign(d.alg === -8 ? null : "sha256", signed, overrides.key ?? d.privateKey);
  return {
    id: b64(d.id),
    clientDataJSON: b64(cd),
    authenticatorData: b64(ad),
    signature: b64(sig),
  };
}

async function enrollFirst(d = device()) {
  const opts = await authCall({ action: "enroll-options", password: "hunter2" });
  assert.equal(opts.status, 200);
  const done = await authCall({ action: "enroll", credential: created(d, opts.body), name: "iPhone · Safari" });
  assert.equal(done.status, 200, JSON.stringify(done.body));
  return { d, token: done.body.token };
}

const panelPost = (body, token) => call(panel.POST, "/api/panel", { body, token });

async function signInWith(d, overrides) {
  const opts = await authCall({ action: "sign-in-options" });
  return authCall({ action: "sign-in", credential: asserted(d, opts.body, overrides) });
}

// ── Enrolling ───────────────────────────────────────────────────────────────

test("the first device enrolls with the password and comes back signed in", async () => {
  const before = await authCall({ action: "status" });
  assert.deepEqual(before.body, { enrolled: false, signedIn: false });

  const { token } = await enrollFirst();
  const after = await authCall({ action: "status" }, { token });
  assert.deepEqual(after.body, { enrolled: true, signedIn: true });

  const stored = JSON.parse([...store.get("dev:passkeys").values()][0]);
  assert.deepEqual(stored.transports, ["internal", "hybrid"]);
  assert.equal(stored.name, "iPhone · Safari");
});

test("a wrong password gets no challenge", async () => {
  const res = await authCall({ action: "enroll-options", password: "hunter3" });
  assert.equal(res.status, 403);
  assert.equal(res.body.challenge, undefined);
});

test("the password stops working once a passkey exists", async () => {
  await enrollFirst();
  const res = await authCall({ action: "enroll-options", password: "hunter2" });
  assert.equal(res.status, 403);
});

test("an enrollment from another origin, or without Face ID, is refused", async () => {
  for (const overrides of [{ origin: "https://evil.test" }, { flags: 0x01 }]) {
    const d = device();
    const opts = await authCall({ action: "enroll-options", password: "hunter2" });
    const res = await authCall({ action: "enroll", credential: created(d, opts.body, overrides) });
    assert.equal(res.status, 400);
  }
  assert.equal(store.get("dev:passkeys")?.size ?? 0, 0);
});

test("an enrollment challenge works once", async () => {
  const d = device();
  const opts = await authCall({ action: "enroll-options", password: "hunter2" });
  const cred = created(d, opts.body);
  assert.equal((await authCall({ action: "enroll", credential: cred })).status, 200);
  assert.equal((await authCall({ action: "enroll", credential: cred })).status, 400);
});

test("two password challenges cannot both add a device", async () => {
  const first = await authCall({ action: "enroll-options", password: "hunter2" });
  const second = await authCall({ action: "enroll-options", password: "hunter2" });
  const a = device();
  const b = device();
  assert.equal((await authCall({ action: "enroll", credential: created(a, first.body) })).status, 200);
  assert.equal((await authCall({ action: "enroll", credential: created(b, second.body) })).status, 400);
  assert.equal(store.get("dev:passkeys").size, 1);
});

test("a pairing code enrolls one more device, once", async () => {
  const { token } = await enrollFirst();
  const pair = await authCall({ action: "pair" }, { token });
  assert.match(pair.body.code, /^[0-9A-Z]{4}-[0-9A-Z]{4}$/);

  const typed = pair.body.code.toLowerCase().replace("-", " ");
  const opts = await authCall({ action: "enroll-options", code: typed });
  assert.equal(opts.status, 200);
  const laptop = device("ed25519");
  const done = await authCall({ action: "enroll", credential: created(laptop, opts.body), name: "Windows · Edge" });
  assert.equal(done.status, 200);

  const again = await authCall({ action: "enroll-options", code: pair.body.code });
  assert.equal(again.status, 403);

  // The Ed25519 device signs in too.
  assert.equal((await signInWith(laptop)).status, 200);
});

test("a cancelled passkey prompt leaves the pairing code, which still enrolls one device", async () => {
  const { token } = await enrollFirst();
  const pair = await authCall({ action: "pair" }, { token });
  // Face ID cancelled after the options went out, then tried twice more.
  assert.equal((await authCall({ action: "enroll-options", code: pair.body.code })).status, 200);
  const a = await authCall({ action: "enroll-options", code: pair.body.code });
  const b = await authCall({ action: "enroll-options", code: pair.body.code });
  assert.equal(b.status, 200);

  assert.equal((await authCall({ action: "enroll", credential: created(device(), a.body) })).status, 200);
  assert.equal((await authCall({ action: "enroll", credential: created(device(), b.body) })).status, 400);
  assert.equal(store.get("dev:passkeys").size, 2);
});

test("a prompt started with an old pairing code cannot spend a newer one", async () => {
  const { token } = await enrollFirst();
  const first = await authCall({ action: "pair" }, { token });
  const stale = await authCall({ action: "enroll-options", code: first.body.code });
  const second = await authCall({ action: "pair" }, { token });

  assert.equal((await authCall({ action: "enroll", credential: created(device(), stale.body) })).status, 400);
  const fresh = await authCall({ action: "enroll-options", code: second.body.code });
  assert.equal((await authCall({ action: "enroll", credential: created(device(), fresh.body) })).status, 200);
});

test("five wrong pairing codes end the real one", async () => {
  const { token } = await enrollFirst();
  const pair = await authCall({ action: "pair" }, { token });
  for (let i = 0; i < 5; i++) {
    assert.equal((await authCall({ action: "enroll-options", code: "0000-0000" })).status, 403);
  }
  assert.equal((await authCall({ action: "enroll-options", code: pair.body.code })).status, 403);
});

test("a pairing code needs a signed-in device to make it", async () => {
  await enrollFirst();
  assert.equal((await authCall({ action: "pair" })).status, 401);
});

// ── Signing in ──────────────────────────────────────────────────────────────

test("a stored passkey signs in, and a stranger's key does not", async () => {
  const { d } = await enrollFirst();
  const ok = await signInWith(d);
  assert.equal(ok.status, 200);
  assert.match(ok.body.token, /^[\w-]{43}$/);

  const stranger = device();
  stranger.id = d.id;
  const bad = await signInWith(d, { key: stranger.privateKey });
  assert.equal(bad.status, 401);
});

test("a sign-in from another origin or without user verification is refused", async () => {
  const { d } = await enrollFirst();
  assert.equal((await signInWith(d, { origin: "https://evil.test" })).status, 401);
  assert.equal((await signInWith(d, { flags: 0x01 })).status, 401);
});

test("a sign-in refused for its origin still spends the challenge", async () => {
  const { d } = await enrollFirst();
  const opts = await authCall({ action: "sign-in-options" });
  const elsewhere = asserted(d, opts.body, { origin: "https://evil.test" });
  assert.equal((await authCall({ action: "sign-in", credential: elsewhere })).status, 401);
  assert.equal((await authCall({ action: "sign-in", credential: asserted(d, opts.body) })).status, 401);
});

test("a replayed sign-in is refused", async () => {
  const { d } = await enrollFirst();
  const opts = await authCall({ action: "sign-in-options" });
  const cred = asserted(d, opts.body);
  assert.equal((await authCall({ action: "sign-in", credential: cred })).status, 200);
  assert.equal((await authCall({ action: "sign-in", credential: cred })).status, 401);
});

test("a counter that goes backwards is refused", async () => {
  const { d } = await enrollFirst();
  d.count = 5;
  assert.equal((await signInWith(d)).status, 200);
  d.count = 3;
  assert.equal((await signInWith(d)).status, 401);
});

test("a counter that drops back to zero is refused", async () => {
  const { d } = await enrollFirst();
  d.count = 5;
  assert.equal((await signInWith(d)).status, 200);
  d.count = 0;
  assert.equal((await signInWith(d)).status, 401);
});

test("a device forgotten while it signs in stays forgotten", async () => {
  const { d, token } = await enrollFirst();
  const pair = await authCall({ action: "pair" }, { token });
  const opts = await authCall({ action: "enroll-options", code: pair.body.code });
  const other = device();
  await authCall({ action: "enroll", credential: created(other, opts.body) });

  // The forget lands after sign-in has read the passkey, before it writes.
  beforeEval = () => {
    beforeEval = null;
    store.get("dev:passkeys").delete(b64(d.id));
  };
  assert.equal((await signInWith(d)).status, 401);
  assert.equal(store.get("dev:passkeys").has(b64(d.id)), false);
});

test("forgetting two devices at once leaves one", async () => {
  const { d, token } = await enrollFirst();
  const pair = await authCall({ action: "pair" }, { token });
  const opts = await authCall({ action: "enroll-options", code: pair.body.code });
  const other = device();
  await authCall({ action: "enroll", credential: created(other, opts.body) });

  const results = await Promise.all([
    panelPost({ action: "forget", id: b64(d.id) }, token),
    panelPost({ action: "forget", id: b64(other.id) }, token),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 400]);
  assert.equal(store.get("dev:passkeys").size, 1);
});

test("a device with a long credential id can be forgotten, and forgetting it twice is fine", async () => {
  const { token } = await enrollFirst();
  const pair = await authCall({ action: "pair" }, { token });
  const opts = await authCall({ action: "enroll-options", code: pair.body.code });
  const key = Object.assign(device(), { id: randomBytes(1023) });
  assert.equal((await authCall({ action: "enroll", credential: created(key, opts.body) })).status, 200);

  const id = b64(key.id);
  assert.equal((await panelPost({ action: "forget", id }, token)).status, 200);
  assert.equal(store.get("dev:passkeys").has(id), false);
  assert.equal((await panelPost({ action: "forget", id }, token)).status, 200);
});

test("a failed Redis command ends the sign-in instead of passing", async () => {
  const { d } = await enrollFirst();
  evalFails = true;
  const res = await signInWith(d);
  assert.equal(res.status, 503);
  assert.equal(res.body.token, undefined);
});

test("locking ends the session", async () => {
  const { token } = await enrollFirst();
  assert.equal((await call(panel.GET, "/api/panel", { method: "GET", token })).status, 200);
  await authCall({ action: "lock" }, { token });
  assert.equal((await call(panel.GET, "/api/panel", { method: "GET", token })).status, 401);
});

// ── The panel ───────────────────────────────────────────────────────────────

test("the panel answers only a signed-in session", async () => {
  assert.equal((await call(panel.GET, "/api/panel", { method: "GET" })).status, 401);
  assert.equal((await call(panel.GET, "/api/panel", { method: "GET", token: "x".repeat(43) })).status, 401);
  assert.equal((await panelPost({ action: "link", name: "Jane" })).status, 401);
});

test("labels and links round trip through the panel", async () => {
  const { token } = await enrollFirst();
  assert.equal((await panelPost({ action: "label", id: "abcd1234", name: "Jane", hidden: false }, token)).status, 200);
  assert.equal((await panelPost({ action: "label", id: "../etc", name: "x" }, token)).status, 400);
  const link = await panelPost({ action: "link", name: "Jane at Google", note: "Sent after the career fair", path: "/studio/" }, token);
  assert.match(link.body.code, /^[a-z2-9]{6}$/);
  const odd = await panelPost({ action: "link", name: "Odd", path: "https://evil.test/" }, token);

  const data = await call(panel.GET, "/api/panel", { method: "GET", token });
  assert.deepEqual(data.body.labels.abcd1234, { name: "Jane", hidden: false });
  assert.equal(data.body.links[link.body.code].name, "Jane at Google");
  assert.equal(data.body.links[link.body.code].path, "/studio/");
  assert.equal(data.body.links[odd.body.code].path, "/", "only the site's own pages");
  assert.equal(data.body.devices.length, 1);
  assert.equal(data.body.devices[0].key, undefined, "public keys stay server side");
  assert.match(data.body.you, /^[0-9a-f]{8}$/);

  // An empty name with nothing hidden removes the label.
  await panelPost({ action: "label", id: "abcd1234", name: "" }, token);
  assert.equal((await call(panel.GET, "/api/panel", { method: "GET", token })).body.labels.abcd1234, undefined);
});

test("the last device cannot be forgotten, and a forgotten one is signed out", async () => {
  const { d, token } = await enrollFirst();
  const id = b64(d.id);
  assert.equal((await panelPost({ action: "forget", id }, token)).status, 400);

  const pair = await authCall({ action: "pair" }, { token });
  const opts = await authCall({ action: "enroll-options", code: pair.body.code });
  const second = device();
  const done = await authCall({ action: "enroll", credential: created(second, opts.body) });

  assert.equal((await panelPost({ action: "forget", id }, done.body.token)).status, 200);
  assert.equal((await call(panel.GET, "/api/panel", { method: "GET", token })).status, 401);
});

test("CORS answers the panel's origin and nobody else's", async () => {
  const pre = await auth.OPTIONS(req("OPTIONS", "/api/auth"));
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get("access-control-allow-origin"), ORIGIN);
  assert.match(pre.headers.get("access-control-allow-headers"), /Authorization/);

  const other = await panel.OPTIONS(req("OPTIONS", "/api/panel", { origin: "https://evil.test" }));
  assert.equal(other.status, 403);

  const res = await authCall({ action: "status" }, { origin: "https://evil.test" });
  assert.equal(res.headers.get("access-control-allow-origin"), null);
});

test("a poll with a time gets only what came after it, across pages", async () => {
  const { token } = await enrollFirst();
  // 250 views a second apart, oldest pushed first, so the list is newest first.
  const t0 = Date.parse("2026-10-01T00:00:00.000Z");
  store.set("dev:visits", []);
  for (let i = 0; i < 250; i++) {
    store.get("dev:visits").unshift(JSON.stringify({ t: new Date(t0 + i * 1000).toISOString(), path: `/${i}` }));
  }
  const all = await call(panel.GET, "/api/panel", { method: "GET", token });
  assert.equal(all.body.visits.length, 250);

  const since = new Date(t0 + 99 * 1000).toISOString();
  const res = await call(panel.GET, `/api/panel?visits=${encodeURIComponent(since)}&asks=`, { method: "GET", token });
  assert.equal(res.body.visits.length, 150);
  assert.equal(res.body.visits.at(-1).path, "/100");
  assert.deepEqual(res.body.asks, []);
});

test("a delayed entry does not hide newer entries in the same poll page", async () => {
  const { token } = await enrollFirst();
  const t0 = Date.parse("2026-10-01T00:00:00.000Z");
  const entry = (i) => JSON.stringify({ t: new Date(t0 + i * 1000).toISOString(), q: `Question ${i}` });
  // Answers finish out of order. Older questions can be pushed ahead of
  // newer ones, including at the start of the next Redis page.
  const entries = Array.from({ length: 250 }, (_, i) => entry(250 - i));
  entries.unshift(entry(0));
  entries.splice(100, 0, entry(0));
  store.set("dev:asks", entries);

  const since = new Date(t0 + 99 * 1000).toISOString();
  const res = await call(panel.GET, `/api/panel?asks=${encodeURIComponent(since)}`, { method: "GET", token });
  assert.equal(res.status, 200);
  assert.equal(res.body.asks.length, 151);
  assert.equal(res.body.asks.at(-1).q, "Question 100");
});

test("a poll finds newer entries behind a full page of delayed answers", async () => {
  const { token } = await enrollFirst();
  const old = JSON.stringify({ t: "2026-10-01T00:00:00.000Z", q: "Delayed answer" });
  const fresh = { t: "2026-10-01T00:00:20.000Z", q: "New question" };
  store.set("dev:asks", [...Array(100).fill(old), "invalid JSON", JSON.stringify(fresh)]);
  const res = await call(panel.GET, "/api/panel?asks=2026-10-01T00%3A00%3A10.000Z", { method: "GET", token });
  assert.deepEqual(res.body.asks, [fresh]);
});

// ── Visits ──────────────────────────────────────────────────────────────────

test("a visit keeps the address and the link tag", async () => {
  globalThis.fetch = ((inner) => async (url, init) =>
    String(url).startsWith("https://api.ipapi.is/")
      ? Response.json({ company: { name: "Google LLC" }, location: { city: "Boston" } })
      : inner(url, init))(globalThis.fetch);

  const res = await visit.POST(
    new Request("https://api.test/api/visit", {
      method: "POST",
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) Safari/605.1.15",
        "x-forwarded-for": "203.0.113.9",
      },
      body: JSON.stringify({ path: "/galaxy/", first: false, tag: "k3x9qp" }),
    }),
  );
  assert.equal(res.status, 204);
  const [entry] = store.get("dev:visits").map((v) => JSON.parse(v));
  assert.equal(entry.ip, "203.0.113.9");
  assert.equal(entry.tag, "k3x9qp");
  assert.equal(entry.org, "Google LLC");
  assert.match(entry.id, /^[0-9a-f]{8}$/);
});

test("a visit cuts a long referring host to what DNS allows", async () => {
  const res = await visit.POST(
    new Request("https://api.test/api/visit", {
      method: "POST",
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) Safari/605.1.15",
        "x-forwarded-for": "203.0.113.10",
      },
      body: JSON.stringify({ path: "/", first: true, ref: `https://${"a".repeat(100_000)}.com/` }),
    }),
  );
  assert.equal(res.status, 204);
  const [entry] = store.get("dev:visits").map((v) => JSON.parse(v));
  assert.equal(entry.ref.length, 253);
});
