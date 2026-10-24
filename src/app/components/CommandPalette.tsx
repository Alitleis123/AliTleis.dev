"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { withBasePath } from "../data";
import { scrollBehavior } from "../lib/animations";
import { useFocusTrap } from "../lib/useFocusTrap";

type Doc = {
  id: string;
  kind: string;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  terms: string;
};

type Index = {
  model: string;
  dim: number;
  scale: number;
  docs: Doc[];
  vectors: number[][];
  /** vectors[i] belongs to docs[owners[i]], several chunks per document. */
  owners: number[];
  /** snippets[i] is the prose that vectors[i] was built from. */
  snippets: string[];
};

type Mode = "lexical" | "loading" | "semantic";

type Hit = { doc: Doc; score: number; snippet: string };

/**
 * What the panel shows above the passages.
 *
 * `from` is the hit a quoted span came from, or null when the writer composed
 * the answer from the whole site instead.
 */
type Answer = { text: string; from: number | null };

/**
 * The writer, a Vercel function that answers from the whole site with Gemini.
 * Source and setup are in ask/. The override exists for local previews.
 */
const ASK_API =
  process.env.NEXT_PUBLIC_ASK_API || "https://alitleis-ask.vercel.app/api/ask";

/** The function rejects longer questions, so the input stops there too. */
const MAX_QUESTION = 500;

/**
 * Asks the writer, with earlier answers so a follow-up like "what did you build
 * there?" has something to point at.
 *
 * Returns null instead of throwing. Any failure, whether a timeout, a 502 or
 * a spent quota, means the reader answers instead.
 */
async function write(
  question: string,
  history: { q: string; a: string }[],
): Promise<string | null> {
  try {
    const res = await fetch(ASK_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, history }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) return null;
    const { answer } = await res.json();
    return typeof answer === "string" && answer.trim() ? answer.trim() : null;
  } catch {
    return null;
  }
}

/** One question and what came back for it. */
type Turn = {
  id: number;
  q: string;
  hits: Hit[];
  semantic: boolean;
  /** undefined while the reader is still working, null when it declined. */
  answer?: Answer | null;
};

/** Any component can open the palette without prop drilling. */
export const OPEN_EVENT = "open-command-palette";

const CDN = "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

/**
 * The reader.
 *
 * Retrieval finds the right paragraph but never answers the question, which
 * is why quoting passages felt like a search box wearing a chat interface.
 * This reads the retrieved text and pulls out the span that answers what was
 * actually asked.
 *
 * Extractive rather than generative, on purpose. A general instruct model
 * small enough to ship to a browser is roughly 250MB and still writes badly;
 * this is 63MB, purpose-trained on exactly this task, and measured against
 * this site's own copy it returned "Java" at 0.998, "70%" at 0.882 and
 * "August 2028" at 0.862. It cannot compose prose, so it quotes the site
 * instead of paraphrasing it, which also means it cannot invent a claim.
 *
 * Loaded on the first question rather than when the panel opens, so 63MB is
 * only spent by someone who actually asks something.
 *
 * It is the fallback now. The writer answers first, and the reader only loads
 * when the writer cannot be reached.
 */
const READER = "Xenova/distilbert-base-cased-distilled-squad";

/**
 * The reader's span as the passage spells it.
 *
 * The model returns its answer decoded from tokens rather than cut from the
 * text, which puts spaces where the tokenizer split, so "12.5K" came back as
 * "12. 5K". Matching it against the passage with whitespace optional recovers
 * the original.
 */
function inContext(answer: string, passage: string): string {
  if (!answer || passage.includes(answer)) return answer;
  const pattern = answer
    .replace(/\s+/g, "")
    .split("")
    .map(escapeRe)
    .join("\\s*");
  return new RegExp(pattern, "i").exec(passage)?.[0] ?? answer;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * The project a question names, if any, as the hits that belong to it.
 *
 * Projects only, and whole names only. Matching any title as a substring let
 * the Stack group "Languages" claim "What languages do you speak?" from the
 * profile that actually answers it. Where two names match, the longer one is
 * the more specific, so it wins.
 */
function namedProject(q: string, hits: Hit[]): Hit[] {
  const named = hits.filter(
    (h) =>
      h.doc.kind === "Project" &&
      new RegExp(`(^|\\W)${escapeRe(h.doc.title)}(\\W|$)`, "i").test(q),
  );
  const longest = Math.max(0, ...named.map((h) => h.doc.title.length));
  return named.filter((h) => h.doc.title.length === longest);
}

/** Below this the span is noise, so the passages answer instead. */
const ANSWER_FLOOR = 0.22;

/** Each part of a turn rises in rather than appearing all at once. */
const askItem = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const SUGGESTED = [
  "What have you built with retrieval?",
  "Do you have a security clearance?",
  "What have you shipped in Python?",
  "Why did you write a Resolve plugin?",
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<Index | null>(null);
  const [mode, setMode] = useState<Mode>("lexical");
  const [turns, setTurns] = useState<Turn[]>([]);
  /** Resolves once the reader is downloaded, and is reused after that. */
  const readerRef = useRef<
    ((q: string, ctx: string) => Promise<{ answer: string; score: number }>) | null
  >(null);
  const readerLoadRef = useRef<Promise<void> | null>(null);
  /** Turn ids, so a slow read updates the turn it belongs to. */
  const turnIdRef = useRef(0);
  const [thinking, setThinking] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);
  const threadRef = useRef<HTMLDivElement>(null);
  const typedRef = useRef<Set<number>>(new Set());
  const encoderRef = useRef<((t: string) => Promise<Float32Array>) | null>(null);
  const encoderLoadRef = useRef<Promise<void> | null>(null);

  // ── open / close ──────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  // The index is fetched on first open, never on page load, because the palette
  // costs nothing to a visitor who never presses the key.
  useEffect(() => {
    if (!open || index) return;
    fetch(withBasePath("/search-index.json"))
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => {});
  }, [open, index]);


  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Follow the newest turn.
  const stickToBottom = useCallback((smooth = true) => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    stickToBottom();
  }, [turns, thinking, stickToBottom]);

  // ── retrieval ─────────────────────────────────────────────────
  /**
   * Query words that carry no signal. Without this, "do you have cleared
   * experience" scored "do" against twelve documents, because a bare substring
   * test matches it inside "documentation" and "DoD".
   */
  const STOP = useMemo(
    () =>
      new Set(
        ("a an and are as at be been being by can could did do does for from had has have i if in into is it its me my " +
          "of on or should that the their them there they this to was were what when where which who whose why will " +
          "with would you your about any been more most" ).split(" "),
      ),
    [],
  );

  /** Words only, no punctuation. "experience?" matched nothing at all before. */
  const words = useCallback(
    (text: string) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s-]/g, " ")
        .split(/\s+/)
        .filter(Boolean),
    [],
  );

  /**
   * Per-document word sets plus a document frequency per word, built once per
   * index rather than per keystroke.
   *
   * Two things this fixes. Matching whole words instead of substrings, and
   * weighting a word by how rare it is, so "cleared" appearing in one document
   * outranks "do" appearing in twelve instead of tying with it.
   */
  const lex = useMemo(() => {
    if (!index) return null;
    const sets = index.docs.map(
      (d) => new Set(words(`${d.title} ${d.subtitle} ${d.kind} ${d.terms}`)),
    );
    const titles = index.docs.map((d) => new Set(words(d.title)));
    const df = new Map<string, number>();
    for (const set of sets) {
      for (const w of set) df.set(w, (df.get(w) ?? 0) + 1);
    }
    return { sets, titles, df, n: index.docs.length };
  }, [index, words]);

  const rank = useCallback(
    (q: string, queryVec: Float32Array | null): Hit[] => {
      if (!index || !lex) return [];
      const tokens = words(q).filter((w) => w.length > 1 && !STOP.has(w));

      const lexical = (i: number) => {
        if (!tokens.length) return 0;
        let score = 0;
        let total = 0;
        for (const tk of tokens) {
          // A word nobody uses is worth more than one everybody uses.
          const weight = Math.log(1 + lex.n / ((lex.df.get(tk) ?? 0) + 1));
          total += weight * 2;
          if (lex.titles[i].has(tk)) score += weight * 2;
          else if (lex.sets[i].has(tk)) score += weight;
        }
        return total ? score / total : 0;
      };

      // Max-pool each document's chunk similarities. A record is as relevant as
      // its single best-matching passage, not the average of all of them. The
      // winning chunk is kept, since that passage is what gets quoted back.
      const best = new Array(index.docs.length).fill(0);
      const bestChunk = new Array(index.docs.length).fill(-1);
      if (queryVec) {
        for (let i = 0; i < index.vectors.length; i++) {
          const v = index.vectors[i];
          let dot = 0;
          for (let k = 0; k < v.length; k++) dot += queryVec[k] * (v[k] / index.scale);
          const o = index.owners[i];
          if (dot > best[o]) {
            best[o] = dot;
            bestChunk[o] = i;
          }
        }
      }

      return index.docs
        .map((d, i) => {
          const lexScore = lexical(i);
          // Lexical alone is brittle for natural-language questions, semantic
          // alone loses exact tokens like "Solr" or "cleared". Blending keeps
          // both, and a strong rare-word hit is allowed to carry a result on
          // its own.
          const score = queryVec ? best[i] * 0.62 + lexScore * 0.38 : lexScore;
          const chunk = bestChunk[i];
          // Without the encoder there is no winning chunk, so fall back to the
          // document's first, which chunksOf builds as its heading line.
          const fallback = index.owners.findIndex((o) => o === i);
          return {
            doc: d,
            score,
            snippet: index.snippets[chunk >= 0 ? chunk : fallback] ?? "",
          };
        })
        .filter((r) => r.score > (queryVec ? 0.1 : 0.01))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
    },
    [index, lex, words, STOP],
  );

  /**
   * Downloads the encoder once, on the first question.
   *
   * It used to start the moment the panel opened, so somebody who opened it
   * to look around paid for 23MB of model and 10MB of WASM they never used.
   * Only a question needs it, and the first one waits for it rather than
   * falling back to keyword ranking, so the first answer is as good as the
   * rest.
   */
  const loadEncoder = useCallback(async () => {
    if (encoderRef.current) return;
    if (!encoderLoadRef.current) {
      setMode("loading");
      encoderLoadRef.current = (async () => {
        try {
          const t = await import(/* webpackIgnore: true */ CDN);
          t.env.allowLocalModels = false;
          const pipe = await t.pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2",
            { quantized: true },
          );
          encoderRef.current = async (text: string) => {
            const out = await pipe(text, { pooling: "mean", normalize: true });
            return out.data as Float32Array;
          };
          setMode("semantic");
        } catch {
          // Offline or CDN blocked, so keyword ranking stays in charge.
          setMode("lexical");
        }
      })();
    }
    await encoderLoadRef.current;
  }, []);

  /** Downloads the reader once, and hands back the same function after. */
  const loadReader = useCallback(async () => {
    if (readerRef.current) return;
    if (!readerLoadRef.current) {
      readerLoadRef.current = (async () => {
        const t = await import(/* webpackIgnore: true */ CDN);
        t.env.allowLocalModels = false;
        const pipe = await t.pipeline("question-answering", READER, {
          quantized: true,
        });
        readerRef.current = async (q: string, ctx: string) => {
          const r = await pipe(q, ctx);
          return { answer: r.answer as string, score: r.score as number };
        };
      })();
    }
    await readerLoadRef.current;
  }, []);

  const ask = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      if (!q || thinking) return;
      setQuery("");
      setThinking(true);
      // Started before the encoder loads, so the two downloads overlap. Only
      // written answers go back as history, since a quoted span on its own
      // reads as a non sequitur.
      const written = write(
        q,
        turns.flatMap((t) =>
          t.answer && t.answer.from === null ? [{ q: t.q, a: t.answer.text }] : [],
        ),
      );
      let vec: Float32Array | null = null;
      try {
        await loadEncoder();
        vec = (await encoderRef.current?.(q)) ?? null;
      } catch {
        vec = null;
      }
      const hits = rank(q, vec);

      // The passages land straight away, while the writer is still working.
      const id = ++turnIdRef.current;
      setTurns((t) => [...t, { id, q, hits, semantic: !!vec }]);
      setThinking(false);
      inputRef.current?.focus();

      const settle = (answer: Answer | null) =>
        setTurns((t) => t.map((x) => (x.id === id ? { ...x, answer } : x)));

      const text = await written;
      if (text) {
        settle({ text, from: null });
        return;
      }

      if (!hits.length) {
        settle(null);
        return;
      }

      try {
        await loadReader();
        const read = readerRef.current;
        if (!read) throw new Error("reader unavailable");

        /*
         * Read every retrieved passage, then weight each span by how well its
         * passage matched the question.
         *
         * Ranking on the reader's raw score alone is wrong: that confidence
         * is calibrated inside one context, so it does not compare across
         * two. Asked how much faster the query response was, an unrelated
         * passage answered "thirty minutes" more confidently than the Lincoln
         * Laboratory passage answered "70%", and won, with the correct figure
         * quoted on screen directly underneath it.
         *
         * Weights are relative to the top hit, so the best passage keeps its
         * confidence intact and the rest are discounted in proportion. A
         * lower-ranked passage can still win, but only by being much more
         * certain rather than slightly.
         */
        /*
         * A question that names a project is about that project, so only its
         * passages are read. Otherwise "How many users does EternalMonitor
         * have?" was answered with the follower count from the editing
         * section, which happened to be the most confident number on offer.
         */
        const named = namedProject(q, hits);
        const pool = named.length ? named : hits;
        const topScore = pool[0].score || 1;
        let best: { text: string; score: number; from: number; weighted: number } | null =
          null;
        for (const h of pool) {
          const i = hits.indexOf(h);
          const r = await read(q, h.snippet);
          const text = r.answer ? inContext(r.answer.trim(), h.snippet) : "";
          if (!text) continue;
          const weighted = r.score * (h.score / topScore);
          if (!best || weighted > best.weighted) {
            best = { text, score: r.score, from: i, weighted };
          }
        }
        settle(
          best && best.score >= ANSWER_FLOOR ? { text: best.text, from: best.from } : null,
        );
      } catch {
        // Blocked CDN, no WASM, or a refused download. The passages are
        // already on screen, so this degrades to what it did before.
        settle(null);
      }
    },
    [rank, thinking, turns, loadEncoder, loadReader],
  );

  const go = useCallback((d: Doc) => {
    setOpen(false);
    const el = document.querySelector(d.href);
    if (el) el.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    else window.location.hash = d.href;
  }, []);

  const statusLabel =
    mode === "semantic"
      ? "Semantic · MiniLM-L6"
      : mode === "loading"
        ? "Keyword · loading encoder"
        : "Keyword";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh]"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Ask about this site"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="ai-ring relative isolate w-full max-w-[620px] rounded-[1.12rem] shadow-[0_40px_120px_rgba(0,0,0,0.75)]"
          >
            <div className="flex flex-col overflow-hidden rounded-2xl bg-[#0c0c0f]">
            {/* Header */}
            <div className="flex shrink-0 items-baseline justify-between gap-4 border-b border-[var(--border-hairline)] px-5 py-3">
              <div className="flex items-baseline gap-3">
                <span className="text-[13.5px] font-medium tracking-tight text-white">
                  Ask
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-faint)]">
                  {turns.length > 0
                    ? `${String(turns.length).padStart(2, "0")} asked`
                    : "retrieval over this page"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)] transition-colors duration-200 hover:text-white"
              >
                Esc
              </button>
            </div>

            {/* Thread */}
            <div
              ref={threadRef}
              className="ask-thread min-h-0 overflow-y-auto px-5 py-4"
              style={{ maxHeight: "54vh" }}
            >
              {turns.length === 0 && !thinking ? (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } },
                  }}
                  className="flex flex-col"
                >
                  <motion.p
                    variants={askItem}
                    className="max-w-[52ch] text-[13px] leading-[1.7] text-[var(--text-muted)]"
                  >
                    Ask in plain language. Gemini answers from what this site
                    says, and the closest passage on the page is quoted
                    underneath.
                  </motion.p>

                  <motion.span
                    variants={askItem}
                    className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-faint)]"
                  >
                    Try
                  </motion.span>

                  <div className="mt-1">
                    {SUGGESTED.map((q, i) => (
                      <motion.button
                        key={q}
                        variants={askItem}
                        type="button"
                        onClick={() => ask(q)}
                        className="group/s flex w-full items-center gap-4 border-b border-[var(--border-hairline)] py-2.5 text-left last:border-b-0"
                      >
                        <span className="tabular-figures font-mono text-[10px] tracking-[0.16em] text-[var(--text-faint)] transition-colors duration-200 group-hover/s:text-[var(--accent-electric)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 text-[13px] tracking-tight text-[var(--text-muted)] transition-colors duration-200 group-hover/s:text-white">
                          {q}
                        </span>
                        <span
                          aria-hidden
                          className="text-[11px] text-[var(--text-faint)] opacity-0 transition-[opacity,transform] duration-200 group-hover/s:translate-x-0.5 group-hover/s:opacity-100"
                        >
                          &rarr;
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : null}

              <div className="flex flex-col gap-7">
                {turns.map((t, ti) => (
                  <motion.div
                    key={t.id}
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
                    }}
                    className="flex flex-col gap-3.5"
                  >
                    {/* Question */}
                    <motion.div variants={askItem} className="flex justify-end">
                      <span className="max-w-[80%] rounded-2xl rounded-br-md bg-[var(--surface-2)] px-3.5 py-2 text-[13px] leading-[1.6] tracking-tight text-white">
                        {t.q}
                      </span>
                    </motion.div>

                    {/* The answer, above the passages, because it is what was
                        asked for and the passage is the evidence. A written
                        answer can stand without a passage, since it reads
                        the whole site, extras included. */}
                    {t.answer === undefined ? (
                      <motion.p
                        variants={askItem}
                        className="flex items-center gap-2 text-[12px] text-[var(--text-faint)]"
                      >
                        <span className="ask-reading" aria-hidden />
                        Reading the site
                      </motion.p>
                    ) : t.answer ? (
                      <motion.div variants={askItem}>
                        <p className="whitespace-pre-line text-[15px] leading-[1.6] tracking-tight text-white">
                          {t.answer.text}
                        </p>
                        {t.answer.from !== null ? (
                          <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
                            Quoted from {t.hits[t.answer.from].doc.title}
                          </span>
                        ) : null}
                      </motion.div>
                    ) : t.hits.length === 0 ? (
                      <motion.p variants={askItem} className="text-[13px] leading-[1.7] text-[var(--text-muted)]">
                        Nothing on the page matches that. Try naming a tool, a
                        company, or the kind of work.
                      </motion.p>
                    ) : null}

                    {t.hits.length > 0 ? (
                      <>
                        {/* The passage that matched, quoted rather than written. */}
                        <motion.div
                          variants={askItem}
                          className="border-l-2 border-[rgba(var(--signal-rgb),0.45)] pl-4"
                        >
                          <div className="flex flex-wrap items-baseline gap-x-2.5">
                            <span className="text-[14px] font-medium tracking-tight text-white">
                              {t.hits[0].doc.title}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-dim)]">
                              {t.hits[0].doc.kind}
                            </span>
                          </div>
                          <p className="mt-1.5 text-[13px] leading-[1.75] text-[var(--text-muted)]">
                            <Typed
                              text={t.hits[0].snippet}
                              instant={typedRef.current.has(ti)}
                              onGrow={() => stickToBottom(false)}
                              onDone={() => typedRef.current.add(ti)}
                            />
                          </p>
                          <button
                            type="button"
                            onClick={() => go(t.hits[0].doc)}
                            className="group/g mt-2.5 inline-flex items-center gap-1.5 text-[12px] tracking-tight text-[var(--accent-electric)] transition-opacity duration-200 hover:opacity-80"
                          >
                            Go to {t.hits[0].doc.kind.toLowerCase()}
                            <span aria-hidden className="transition-transform duration-200 group-hover/g:translate-x-0.5">
                              &rarr;
                            </span>
                          </button>
                        </motion.div>

                        {t.hits.length > 1 ? (
                          <motion.div variants={askItem} className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-faint)]">
                              Also
                            </span>
                            {t.hits.slice(1).map((h) => (
                              <button
                                key={h.doc.id}
                                type="button"
                                onClick={() => go(h.doc)}
                                className="rounded-full border border-[var(--border-hairline)] px-2.5 py-1 text-[11.5px] tracking-tight text-[var(--text-muted)] transition-colors duration-200 hover:border-[var(--border-soft)] hover:text-white"
                              >
                                {h.doc.title}
                              </button>
                            ))}
                          </motion.div>
                        ) : null}
                      </>
                    ) : null}
                  </motion.div>
                ))}

                {thinking ? (
                  <div className="flex items-center gap-2 text-[12px] text-[var(--text-dim)]">
                    <span className="flex items-end gap-[3px]">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className={`vu-bar vu-bar-${i + 1} block w-[2px] rounded-full bg-[var(--accent-electric)]`}
                        />
                      ))}
                    </span>
                    Searching the page
                  </div>
                ) : null}
              </div>
            </div>

            {/* Composer */}
            <div className="ask-composer shrink-0 border-t border-[var(--border-hairline)] px-5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(query);
                }}
                className="flex items-center gap-3 py-3.5"
              >
                <span
                  aria-hidden
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-faint)]"
                >
                  Ask
                </span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="anything about Ali"
                  aria-label="Ask a question"
                  maxLength={MAX_QUESTION}
                  className="min-w-0 flex-1 bg-transparent text-[14px] tracking-tight text-white caret-[var(--accent-electric)] placeholder:text-[var(--text-faint)]"
                />
                <button
                  type="submit"
                  disabled={!query.trim() || thinking}
                  aria-label="Ask"
                  className="shrink-0 font-mono text-[11px] tracking-[0.16em] text-[var(--text-faint)] transition-colors duration-200 enabled:hover:text-[var(--accent-electric)] disabled:opacity-40"
                >
                  &crarr;
                </button>
              </form>
            </div>

            {/* Status */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--border-hairline)] px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
              <span
                className={
                  mode === "semantic" ? "text-[var(--text-dim)]" : undefined
                }
              >
                {statusLabel}
              </span>
              <span>Answers by Gemini</span>
            </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * Reveals the retrieved passage a character at a time.
 *
 * Driven off requestAnimationFrame elapsed time rather than a per-character
 * interval, so the pace holds on a slow frame instead of stretching out. The
 * text is quoted from the page either way, the reveal is presentation only.
 */
function Typed({
  text,
  instant,
  onGrow,
  onDone,
}: {
  text: string;
  instant: boolean;
  onGrow: () => void;
  onDone: () => void;
}) {
  const [n, setN] = useState(instant ? text.length : 0);

  useEffect(() => {
    if (instant) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setN(text.length);
      onDone();
      return;
    }

    const MS_PER_CHAR = 7;
    let raf = 0;
    let start: number | null = null;
    let lastScroll = 0;

    const tick = (now: number) => {
      if (start === null) start = now;
      const chars = Math.floor((now - start) / MS_PER_CHAR);
      if (chars >= text.length) {
        setN(text.length);
        onDone();
        onGrow();
        return;
      }
      setN(chars);
      // The block grows as it fills, so keep the tail visible without asking
      // the scroller to recompute on every single frame.
      if (now - lastScroll > 120) {
        lastScroll = now;
        onGrow();
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // Runs once per mounted answer. onGrow and onDone are deliberately not
    // dependencies: the parent rebuilds them every render, and reacting to that
    // would restart the reveal from the first character on each keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, instant]);

  return (
    <>
      {text.slice(0, n)}
      {n < text.length ? <span aria-hidden className="ask-caret" /> : null}
    </>
  );
}
