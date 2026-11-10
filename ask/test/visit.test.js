/**
 * Offline checks for the visit log. Upstash is replaced by an in-memory list
 * behind the same REST pipeline.
 *
 *   node --test ask/test
 */
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

process.env.KV_REST_API_URL = "https://kv.test";
process.env.KV_REST_API_TOKEN = "secret-token";
delete process.env.VERCEL_ENV;

let store;
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  if (!String(url).startsWith("https://kv.test/")) return realFetch(url, init);
  const out = JSON.parse(init.body).map(([cmd, key, ...args]) => {
    switch (cmd) {
      case "LPUSH": { const l = store.get(key) ?? []; l.unshift(args[0]); store.set(key, l); return { result: l.length }; }
      case "LTRIM": return { result: "OK" };
      default: throw new Error(`fake Redis has no ${cmd}`);
    }
  });
  return Response.json(out);
};

const visit = await import("../api/visit.js");

beforeEach(() => {
  store = new Map();
});

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
