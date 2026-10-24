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
 */

const CONTEXT_URL = "https://alitleis.dev/ask-context.txt";
const MODELS = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];

/** The profile changes once per site deploy at most, so a warm instance keeps it. */
const CONTEXT_TTL_MS = 10 * 60 * 1000;

const MAX_QUESTION = 500;
const MAX_TURNS = 4;

const CORS = {
  // Anyone can reach this with curl regardless, so an origin list would only
  // break local previews without protecting the quota.
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const RULES = `You answer visitors' questions in the Ask panel on Ali Tleis's portfolio site, alitleis.dev.

Speak as Ali, in the first person, the way the site itself is written. Visitors usually say "you" and mean Ali.
Use only the profile below. If it doesn't cover something, say it isn't on the site and suggest emailing tleis.a@northeastern.edu. Never guess at facts, dates or numbers.
Answer in one to three short sentences of plain text, with no markdown, headings or bullet points. Name the specific project, company, tool or number.
The Extras section holds easter eggs. Bring one up only when the question is about that thing.
If someone asks whether you are a bot, say you are an AI that answers from Ali's site.
If a request has nothing to do with Ali, such as writing code or an essay, say you only answer questions about Ali.`;

let cached = null;

async function profile() {
  if (cached && Date.now() - cached.at < CONTEXT_TTL_MS) return cached.text;
  try {
    const res = await fetch(CONTEXT_URL, { signal: AbortSignal.timeout(5000) });
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

  let context;
  try {
    context = await profile();
  } catch (err) {
    console.error("Profile unavailable:", err.message);
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
          signal: AbortSignal.timeout(15000),
        },
      );
      if (!res.ok) {
        console.error(`${model} returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
        continue;
      }
      const data = await res.json();
      // Thinking models can return their reasoning as parts flagged `thought`.
      const answer = (data.candidates?.[0]?.content?.parts ?? [])
        .filter((p) => !p.thought && typeof p.text === "string")
        .map((p) => p.text)
        .join("")
        .trim();
      if (answer) return json({ answer, model });
      console.error(`${model} returned no text, finishReason ${data.candidates?.[0]?.finishReason}`);
    } catch (err) {
      console.error(`${model} failed:`, err.message);
    }
  }

  return json({ error: "No model could answer right now." }, 502);
}
