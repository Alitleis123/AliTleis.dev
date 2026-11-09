/**
 * The control panel's poll script, run in a real Redis. panel.test.js stands
 * in for Upstash with a JavaScript copy of the script's filter, so a broken
 * script still passed there.
 *
 * Skipped unless TEST_REDIS_REST_URL and TEST_REDIS_REST_TOKEN name an
 * Upstash-style REST endpoint it may write a scratch list to. The pull request
 * workflow points them at serverless-redis-http in front of a throwaway Redis.
 *
 *   node --test ask/test
 */
import assert from "node:assert/strict";
import { test } from "node:test";

const REST_URL = process.env.TEST_REDIS_REST_URL;
const REST_TOKEN = process.env.TEST_REDIS_REST_TOKEN;

test("the poll script filters a real Redis list by time", { skip: !REST_URL || !REST_TOKEN }, async () => {
  process.env.KV_REST_API_URL = REST_URL;
  process.env.KV_REST_API_TOKEN = REST_TOKEN;
  const { newer, redis } = await import("../lib/track.js");

  const list = `dev:test:newer:${process.pid}`;
  const at = (s) => ({ t: `2026-10-01T00:00:${String(s).padStart(2, "0")}.000Z`, q: `Question ${s}` });
  // Newest written first. A late answer sits ahead of newer entries, beside
  // entries the script has to skip, and the last entry is past the 3000 cap.
  const items = [
    at(30),
    at(5),
    "invalid JSON",
    { q: "No time" },
    { t: 20, q: "A number for a time" },
    at(20),
    ...Array(2994).fill(at(1)),
    at(59),
  ].map((e) => (typeof e === "string" ? e : JSON.stringify(e)));
  assert.equal(items.length, 3001);

  try {
    await redis([["DEL", list], ["RPUSH", list, ...items]]);
    assert.deepEqual(await newer(list, at(10).t), [at(30), at(20)]);
    assert.equal((await newer(list, "")).length, 2997);
  } finally {
    await redis([["DEL", list]]);
  }
});
