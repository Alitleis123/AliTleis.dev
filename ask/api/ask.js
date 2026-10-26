/**
 * The Ask panel's backend, deployed to Vercel on its own.
 *
 * The site is a static export on GitHub Pages, so it has nowhere to keep an
 * API key. This function holds the Gemini key, reads the profile the site
 * publishes at /ask-context.txt, and answers one question at a time.
 *
 * Free-tier Gemini, so no card on file. Each model has its own daily quota,
 * which is why there are two: when the first is out or busy, the second
 * answers. If both fail, the panel falls back to its in-browser reader, so a
 * dead backend costs answer quality rather than the whole feature.
 *
 * Every question that reaches a model is logged with its outcome for
 * the control panel, through lib/track.js.
 */

import { ASKS, later, record, visitor } from "../lib/track.js";

const CONTEXT_URL = "https://alitleis.dev/ask-context.txt";
const MODELS = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];

/** The profile changes once per site deploy at most, so a warm instance keeps it. */
const CONTEXT_TTL_MS = 10 * 60 * 1000;

/**
 * 4s for the profile plus 8s for each model is 20s at worst, inside the
 * panel's 25s. Longer, and the panel would give up on an answer the backup
 * model was about to return.
 */
const PROFILE_TIMEOUT_MS = 4000;
const MODEL_TIMEOUT_MS = 8000;

const MAX_QUESTION = 500;
const MAX_TURNS = 4;

/**
 * Per IP, per warm instance. The free quota is shared by every visitor, and
 * one script looping on this endpoint would otherwise spend it for the day.
 * It cannot stop requests spread across instances or addresses, but those
 * only cost the day's quota, after which the panel falls back to its reader.
 */
const LIMIT = 20;
const LIMIT_WINDOW_MS = 10 * 60 * 1000;
const seen = new Map();

function throttled(ip) {
  const now = Date.now();
  if (seen.size > 5000) seen.clear();
  const entry = seen.get(ip);
  if (!entry || now - entry.start > LIMIT_WINDOW_MS) {
    seen.set(ip, { start: now, count: 1 });
    return false;
  }
  return ++entry.count > LIMIT;
}

const CORS = {
  // Anyone can reach this with curl regardless, so an origin list would only
  // break local previews without protecting the quota.
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const RULES = `You chat with visitors in the Ask panel on Ali Tleis's portfolio site, alitleis.dev. Be a friendly, natural chatbot, and speak as Ali in the first person, the way the site itself is written. Visitors usually say "you" and mean Ali.

Facts about Ali, meaning what he has done, dates, numbers, skills, plans and personal details, come only from the profile below. Never guess or fill in one that isn't there. If the profile doesn't have it, say so and suggest emailing tleis.a@northeastern.edu.
Keep the profile's qualifiers. An expected date has not happened yet. The clearance status is a DoD investigation in progress. Say exactly that, without calling it granted and without adding that it isn't.
Everything else, answer from general knowledge the way any chatbot would: follow-ups like "what does that mean", what a company, school, tool or term is, and how something mentioned on the site works. Tie it back to Ali when it fits.
Keep answers conversational and short, usually one to three sentences and up to five when explaining something. Plain text only, with no markdown, headings or bullet points. Be specific about projects, companies, tools and numbers.
The Extras section holds easter eggs. Bring one up only when the question is about that thing.
If someone asks whether you are a bot, say you are an AI that answers from Ali's site.
For big jobs unrelated to Ali, like writing code, essays or homework, say in one friendly sentence that you're here to talk about Ali.`;

let cached = null;

async function profile() {
  if (cached && Date.now() - cached.at < CONTEXT_TTL_MS) return cached.text;
  try {
    const res = await fetch(CONTEXT_URL, {
      signal: AbortSignal.timeout(PROFILE_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`profile fetch returned ${res.status}`);
    cached = { text: await res.text(), at: Date.now() };
  } catch (err) {
    // A stale profile still answers. Only a cold instance with no copy fails.
    if (!cached) throw err;
    console.error("Using the cached profile:", err.message);
  }
  return cached.text;
}

const json = (body, status = 200) =>
  Response.json(body, { status, headers: CORS });

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return json({ error: "GEMINI_API_KEY is not set." }, 503);

  // Vercel sets x-forwarded-for itself, so a client cannot pick its own.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (throttled(ip)) return json({ error: "Too many questions. Try again later." }, 429);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Send JSON." }, 400);
  }

  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question || question.length > MAX_QUESTION) {
    return json({ error: `Ask a question under ${MAX_QUESTION} characters.` }, 400);
  }

  // Earlier turns, so "what did you build there?" knows where "there" is.
  const history = (Array.isArray(body.history) ? body.history : [])
    .filter((t) => typeof t?.q === "string" && typeof t?.a === "string")
    .slice(-MAX_TURNS)
    .flatMap((t) => [
      { role: "user", parts: [{ text: t.q.slice(0, MAX_QUESTION) }] },
      { role: "model", parts: [{ text: t.a.slice(0, 2000) }] },
    ]);

  // The network lookup runs while the model writes, and the log is written
  // after the answer goes out, so logging adds nothing to the wait. `misses`
  // keeps why each model before the answering one failed, which is how a spent
  // quota shows up in the log.
  const started = Date.now();
  const who = visitor(request).catch(() => ({}));
  const misses = [];
  const log = async (outcome) =>
    record(ASKS, {
      t: new Date(started).toISOString(),
      q: question,
      turn: history.length / 2 + 1,
      ...outcome,
      misses: misses.length ? misses : undefined,
      ms: Date.now() - started,
      ...(await who),
    });

  let context;
  try {
    context = await profile();
  } catch (err) {
    console.error("Profile unavailable:", err.message);
    await later(log({ error: "Profile unavailable" }));
    return json({ error: "The profile could not be loaded." }, 503);
  }

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });

  const payload = JSON.stringify({
    systemInstruction: {
      parts: [{ text: `${RULES}\n\nToday is ${today}.\n\n${context}` }],
    },
    contents: [...history, { role: "user", parts: [{ text: question }] }],
    generationConfig: { maxOutputTokens: 1024 },
  });

  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: payload,
          signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
        },
      );
      if (!res.ok) {
        console.error(`${model} returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
        misses.push(`${model}: HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const candidate = data.candidates?.[0];
      // Thinking models can return their reasoning as parts flagged `thought`.
      const answer = (candidate?.content?.parts ?? [])
        .filter((p) => !p.thought && typeof p.text === "string")
        .map((p) => p.text)
        .join("")
        .trim();
      // Only a natural stop. A MAX_TOKENS cut leaves text that ends mid
      // sentence, which would read as an answer and then go back as history.
      if (answer && candidate.finishReason === "STOP") {
        await later(log({ a: answer, model }));
        return json({ answer, model });
      }
      console.error(`${model} gave no usable answer, finishReason ${candidate?.finishReason}`);
      misses.push(`${model}: ${candidate?.finishReason ?? "no candidate"}`);
    } catch (err) {
      console.error(`${model} failed:`, err.message);
      misses.push(`${model}: ${err.message}`);
    }
  }

  await later(log({ error: "No model could answer" }));
  return json({ error: "No model could answer right now." }, 502);
}
