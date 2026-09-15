"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { withBasePath } from "../data";

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

/** One question and what came back for it. */
type Turn = { q: string; hits: Hit[]; semantic: boolean };

/** Any component can open the palette without prop drilling. */
export const OPEN_EVENT = "open-command-palette";

const CDN = "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

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
  "Do you have cleared experience?",
  "What have you shipped in Python?",
  "Why did you write a Resolve plugin?",
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<Index | null>(null);
  const [mode, setMode] = useState<Mode>("lexical");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [thinking, setThinking] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const typedRef = useRef<Set<number>>(new Set());
  const encoderRef = useRef<((t: string) => Promise<Float32Array>) | null>(null);
  const loadingRef = useRef(false);

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

  // Index and encoder are fetched on first open, never on page load, because the
  // palette costs nothing to a visitor who never presses the key.
  useEffect(() => {
    if (!open || index) return;
    fetch(withBasePath("/search-index.json"))
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => {});
  }, [open, index]);

  useEffect(() => {
    if (!open || encoderRef.current || loadingRef.current) return;
    loadingRef.current = true;
    setMode("loading");
    (async () => {
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
  }, [open]);

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
  const rank = useCallback(
    (q: string, queryVec: Float32Array | null): Hit[] => {
      if (!index) return [];
      const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);

      const lexical = (d: Doc) => {
        const hay = `${d.title} ${d.subtitle} ${d.kind} ${d.terms}`.toLowerCase();
        let s = 0;
        for (const tk of tokens) {
          if (d.title.toLowerCase().includes(tk)) s += 3;
          else if (hay.includes(tk)) s += 1;
          else if (hay.split(" ").some((w) => w.startsWith(tk))) s += 0.5;
        }
        return s / (tokens.length * 3);
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
          const lex = lexical(d);
          // Lexical alone is brittle for natural-language questions, semantic
          // alone loses exact tokens like "Solr". Blending keeps both.
          const score = queryVec ? best[i] * 0.75 + lex * 0.25 : lex;
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
    [index],
  );

  const ask = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      if (!q || thinking) return;
      setQuery("");
      setThinking(true);
      let vec: Float32Array | null = null;
      try {
        vec = (await encoderRef.current?.(q)) ?? null;
      } catch {
        vec = null;
      }
      setTurns((t) => [...t, { q, hits: rank(q, vec), semantic: !!vec }]);
      setThinking(false);
      inputRef.current?.focus();
    },
    [rank, thinking],
  );

  const go = useCallback((d: Doc) => {
    setOpen(false);
    const el = document.querySelector(d.href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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
                    Answers are passages quoted from this page, with the section
                    each one came from.
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
                    key={ti}
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

                    {t.hits.length === 0 ? (
                      <motion.p variants={askItem} className="text-[13px] leading-[1.7] text-[var(--text-muted)]">
                        Nothing on the page matches that. Try naming a tool, a
                        company, or the kind of work.
                      </motion.p>
                    ) : (
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
                    )}
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
                  placeholder="anything on this page"
                  aria-label="Ask a question"
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
              <span>Retrieved, not generated</span>
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
