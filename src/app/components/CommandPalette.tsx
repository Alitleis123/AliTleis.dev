"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  /** vectors[i] belongs to docs[owners[i]] — several chunks per document. */
  owners: number[];
};

type Mode = "lexical" | "loading" | "semantic";

/** Any component can open the palette without prop drilling. */
export const OPEN_EVENT = "open-command-palette";

const CDN = "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<Index | null>(null);
  const [mode, setMode] = useState<Mode>("lexical");
  const [queryVec, setQueryVec] = useState<Float32Array | null>(null);
  const [active, setActive] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
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

  // Index and encoder are fetched on first open, never on page load — the
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
        // Offline or CDN blocked — keyword ranking stays in charge.
        setMode("lexical");
      }
    })();
  }, [open]);

  // Encode the query once the model is ready. Debounced so typing doesn't
  // queue a forward pass per keystroke.
  useEffect(() => {
    if (mode !== "semantic" || !query.trim()) {
      setQueryVec(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      const v = await encoderRef.current?.(query);
      if (!cancelled && v) setQueryVec(v);
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, mode]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
    else {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ── ranking ───────────────────────────────────────────────────
  const results = useMemo(() => {
    if (!index) return [];
    const q = query.trim().toLowerCase();
    if (!q) return index.docs.slice(0, 7).map((d) => ({ doc: d, score: 0 }));

    const tokens = q.split(/\s+/).filter(Boolean);

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

    // Max-pool each document's chunk similarities: a record is as relevant as
    // its single best-matching passage, not the average of all of them.
    const best = new Array(index.docs.length).fill(0);
    if (queryVec) {
      for (let i = 0; i < index.vectors.length; i++) {
        const v = index.vectors[i];
        let dot = 0;
        for (let k = 0; k < v.length; k++) dot += queryVec[k] * (v[k] / index.scale);
        const o = index.owners[i];
        if (dot > best[o]) best[o] = dot;
      }
    }

    const scored = index.docs.map((d, i) => {
      const lex = lexical(d);
      // Lexical alone is brittle for natural-language questions; semantic alone
      // loses exact tokens like "Solr". Blending keeps both.
      const score = queryVec ? best[i] * 0.75 + lex * 0.25 : lex;
      return { doc: d, score };
    });

    return scored
      .filter((r) => r.score > (queryVec ? 0.1 : 0.01))
      .sort((a, b) => b.score - a.score)
      .slice(0, 7);
  }, [index, query, queryVec]);

  useEffect(() => setActive(0), [query]);

  const go = useCallback((d: Doc) => {
    setOpen(false);
    const el = document.querySelector(d.href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.location.hash = d.href;
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active].doc);
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-i="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

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
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Search this site"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[38rem] overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[rgba(16,16,18,0.97)] shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center gap-3 border-b border-[var(--border-hairline)] px-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--text-faint)]">
                Ask
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="What have you built with retrieval?"
                aria-label="Search query"
                className="w-full bg-transparent py-4 text-[14px] text-white outline-none placeholder:text-[var(--text-faint)]"
              />
              <kbd className="hidden shrink-0 rounded border border-[var(--border-hairline)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-dim)] sm:block">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[46vh] overflow-y-auto p-2">
              {results.length ? (
                results.map((r, i) => (
                  <button
                    key={r.doc.id}
                    data-i={i}
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r.doc)}
                    className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-150 ${
                      i === active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="mt-[3px] w-[74px] shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
                      {r.doc.kind}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] tracking-tight text-white">
                        {r.doc.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-[var(--text-muted)]">
                        {r.doc.subtitle}
                      </span>
                    </span>
                    {query.trim() ? (
                      <span className="tabular-figures mt-[3px] shrink-0 font-mono text-[10px] text-[var(--text-faint)]">
                        {r.score.toFixed(2)}
                      </span>
                    ) : null}
                  </button>
                ))
              ) : (
                <div className="px-3 py-8 text-center text-[13px] text-[var(--text-dim)]">
                  {index ? "No matches." : "Loading index…"}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[var(--border-hairline)] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={`block h-1.5 w-1.5 rounded-full ${
                    mode === "loading" ? "current-dot" : ""
                  }`}
                  style={{
                    background:
                      mode === "semantic"
                        ? "var(--accent-electric)"
                        : "rgba(148,163,184,0.5)",
                  }}
                />
                {statusLabel}
              </span>
              <span className="hidden sm:block">↑↓ navigate · ↵ open</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
