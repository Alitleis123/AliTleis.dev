/**
 * Builds the static semantic-search index.
 *
 * Embeddings are computed here, at build time, and committed as JSON, since the site
 * is a static export on GitHub Pages, so there is no server to embed against at
 * request time. The browser loads the same model lazily to encode the query.
 *
 * Vectors are quantised to int8 before serialisation. all-MiniLM-L6-v2 output is
 * L2-normalised and lands well inside [-1, 1], so a fixed 127x scale costs a
 * negligible amount of ranking accuracy and cuts the payload ~6x versus float32
 * JSON.
 *
 *   node --experimental-strip-types scripts/build-search-index.mjs
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { pipeline } from "@xenova/transformers";

const {
  timeline,
  featuredProjects,
  otherWork,
  offClockProfile,
  offClockFrames,
  offClockNote,
  stackGroups,
  coreStack,
  aboutClearance,
  aboutLanguages,
  aboutHobbies,
} = await import("../src/app/data.ts");

/** One searchable record. `text` is embedded, the rest is for rendering. */
const docs = [];
/**
 * Fields are joined with ". " and most of them already end in a period, which
 * left ".." mid-passage. That was invisible while only keywords were indexed,
 * and became visible the moment the palette started quoting the prose back.
 */
const tidy = (t) => t.replace(/\s*\.\s*\./g, ".").replace(/\s+/g, " ").trim();
const add = (d) => docs.push({ ...d, text: tidy(d.text) });

for (const e of timeline) {
  add({
    id: `timeline-${e.id}`,
    kind: e.track === "education" ? "Education" : "Experience",
    title: e.title,
    subtitle: e.subtitle ?? e.range,
    meta: e.range,
    href: "#timeline",
    text: [
      e.title, e.subtitle, e.meta, e.desc, e.note,
      // The dates, as a sentence. They were only ever in the `meta` and
      // `subtitle` columns, so "when does he graduate" retrieved the right
      // entry and then found nothing in the prose to answer with.
      `${e.title}, ${e.range}.`,
      ...(e.bullets ?? []),
      ...(e.tech ?? []),
      ...(e.metrics ?? []).map((m) => `${m.value} ${m.label}`),
      // Stat tiles as one sentence, not one each. They hold the graduation
      // date, the GPA and the program type, and the chunker groups sentences
      // in pairs, so four separate ones scattered them across chunks and a
      // question about the GPA retrieved the chunk holding the degree.
      (e.education?.stats ?? []).length
        ? e.education.stats.map((t) => `${t.label} ${t.value}`).join(", ") + "."
        : null,
      ...(e.education?.coursework ?? []),
    ].filter(Boolean).join(". "),
  });
}

for (const p of [...featuredProjects, ...otherWork]) {
  add({
    id: `project-${p.id}`,
    kind: "Project",
    title: p.title,
    subtitle: p.subtitle ?? p.desc.slice(0, 80),
    meta: p.range,
    href: "#projects",
    text: [p.title, p.subtitle, p.desc, ...(p.bullets ?? []), ...(p.tech ?? [])]
      .filter(Boolean).join(". "),
  });
}

for (const g of stackGroups) {
  add({
    id: `stack-${g.title.toLowerCase().replace(/\W+/g, "-")}`,
    kind: "Stack",
    title: g.title,
    subtitle: g.items.map((i) => i.name).join(" · "),
    meta: `${g.items.length} tools`,
    href: "#stack",
    text: `${g.title}. ${g.items.map((i) => i.name).join(", ")}`,
  });
}

add({
  id: "stack-core",
  kind: "Stack",
  title: "Core stack",
  subtitle: coreStack.map((i) => i.name).join(" · "),
  meta: `${coreStack.length} tools`,
  href: "#stack",
  text: `Core stack, primary tools. ${coreStack.map((i) => i.name).join(", ")}`,
});

add({
  id: "offclock",
  kind: "Off-clock",
  title: "Editing",
  subtitle: `${offClockProfile.handle} · 11.8K followers`,
  meta: "Off-clock",
  href: "#offclock",
  text: [
    offClockNote,
    "TikTok, anime, shows, movies, video editing, After Effects, motion graphics, compositing,",
    "3D space, camera moves, effects, sound design, easing, nulls, keyframes,",
    "11.8K followers, 1.2M likes, 2.8M views, audience, creator,",
    ...offClockFrames.map((f) => f.label),
  ].join(" "),
});

add({
  id: "profile",
  kind: "About",
  title: "Profile",
  subtitle: "Clearance · languages · location",
  meta: "About",
  href: "#about",
  text:
    `Security clearance: ${aboutClearance}. DoD investigation in progress, cleared work, ` +
    `classified and unclassified divisions. Spoken languages: ` +
    `${aboutLanguages.map((l) => `${l.name} (${l.level})`).join(", ")}. ` +
    `Based in Boston, Massachusetts. Northeastern University co-op. ` +
    `Off-clock: ${aboutHobbies.map((h) => h.name).join(", ")}.`,
});

add({
  id: "contact",
  kind: "Contact",
  title: "Get in touch",
  subtitle: "tleis.a@northeastern.edu · Boston, MA",
  meta: "Contact",
  href: "#contact",
  text: "Contact, email, hire, reach out, get in touch, availability, tleis.a@northeastern.edu, Boston MA, LinkedIn, GitHub.",
});

add({
  id: "resume",
  kind: "Résumé",
  title: "Résumé (PDF)",
  subtitle: "Download or open in a new tab",
  meta: "Document",
  href: "#resume",
  text: "Resume, CV, curriculum vitae, PDF, download resume.",
});

console.log(`corpus: ${docs.length} documents`);

const embed = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2",
  { quantized: true },
);

/**
 * One vector per chunk rather than per document, with the client taking the max
 * similarity across a document's chunks.
 *
 * Mean-pooling a whole entry averages eight bullets into mush: the MIT LL record
 * mentions a 70% latency cut, but spread across ~200 words that signal all but
 * vanishes and "how did you make something faster" retrieves nothing. Chunking
 * keeps each vector about one idea.
 */
const chunksOf = (d) => {
  const sentences = d.text.split(/(?<=\.)\s+/).filter((x) => x.trim().length > 12);
  const head = `${d.title}. ${d.subtitle ?? ""}. ${sentences[0] ?? ""}`;
  const rest = [];
  for (let i = 1; i < sentences.length; i += 2) {
    rest.push(sentences.slice(i, i + 2).join(" "));
  }
  // The head line splices title, subtitle and first sentence, any of which may
  // already end in a period, so it needs the same tidy as the document text.
  return [head, ...rest].slice(0, 8).map(tidy);
};

const vectors = [];
const owners = [];
// The chunk text is kept, not just its vector. The palette answers a question
// by quoting the passage that actually matched, so it needs the prose back. The
// keyword blob cannot serve here, it is deduplicated and unreadable.
const snippets = [];
for (let i = 0; i < docs.length; i++) {
  for (const chunk of chunksOf(docs[i])) {
    const out = await embed(chunk, { pooling: "mean", normalize: true });
    vectors.push(Array.from(out.data));
    owners.push(i);
    snippets.push(chunk.replace(/\s+/g, " ").trim());
  }
}
console.log(`chunks: ${vectors.length} vectors across ${docs.length} documents`);

const dim = vectors[0].length;
// int8 quantisation, see the header note.
const quantised = vectors.map((v) =>
  Array.from(v, (x) => Math.max(-127, Math.min(127, Math.round(x * 127)))),
);

/**
 * A deduplicated keyword blob per document. The palette scores this the instant
 * it opens, so results appear before the ~8 MB encoder has finished loading;
 * semantic ranking then replaces it. Same narrow-then-invoke shape as the
 * retrieval layer this site describes.
 */
const STOP = new Set(
  ("a an and are as at be by for from has have in into is it its of on or that the to with " +
   "this these those was were will would can could i my me across via using used use").split(" "),
);
const terms = (t) =>
  [...new Set(
    t.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").split(/\s+/)
      .filter((w) => w.length > 1 && !STOP.has(w)),
  )].join(" ");

const index = {
  model: "Xenova/all-MiniLM-L6-v2",
  dim,
  scale: 127,
  docs: docs.map(({ text, ...rest }) => ({ ...rest, terms: terms(text) })),
  vectors: quantised,
  owners,
  snippets,
};

const out = path.join(process.cwd(), "public/search-index.json");
writeFileSync(out, JSON.stringify(index));
console.log(`wrote ${out}, ${docs.length} docs, ${dim}d, ${(JSON.stringify(index).length / 1024).toFixed(1)} KB`);
