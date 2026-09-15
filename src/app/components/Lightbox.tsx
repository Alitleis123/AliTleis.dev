"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaXmark } from "react-icons/fa6";

/** One open gallery: the images, which one is showing, and whose gallery it is. */
export type LightboxState = {
  images: { src: string; alt: string }[];
  index: number;
  title: string;
} | null;

export default function Lightbox({
  state,
  onClose,
  onIndexChange,
}: {
  state: LightboxState;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const open = !!state;
  const total = state?.images.length ?? 0;

  const prev = useCallback(() => {
    if (!state) return;
    onIndexChange((state.index - 1 + total) % total);
  }, [state, total, onIndexChange]);

  const next = useCallback(() => {
    if (!state) return;
    onIndexChange((state.index + 1) % total);
  }, [state, total, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, prev, next]);

  return (
    <AnimatePresence>
      {open && state ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Top bar */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.22em] text-white/85">
              <span>{state.title.toUpperCase()}</span>
              <span className="text-white/40">·</span>
              <span>
                {String(state.index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/85 transition-[border-color,background-color,color] duration-200 hover:border-white/35 hover:bg-white/[0.10] hover:text-white"
            >
              <FaXmark className="text-[14px]" />
            </button>
          </div>

          {/* Prev */}
          {total > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/85 transition-[border-color,background-color,color] duration-200 hover:border-white/35 hover:bg-white/[0.10] hover:text-white sm:left-6"
            >
              <FaChevronLeft className="text-[14px]" />
            </button>
          ) : null}

          {/* Image */}
          <motion.div
            key={state.images[state.index].src}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[72vh] max-w-[78vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={state.images[state.index].src}
              alt={state.images[state.index].alt}
              decoding="async"
              className="max-h-[72vh] max-w-[78vw] rounded-2xl border border-white/10 object-contain shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
            />
            <div className="mt-3 max-w-[60ch] text-center text-[12px] tracking-tight text-white/70">
              {state.images[state.index].alt}
            </div>
          </motion.div>

          {/* Next */}
          {total > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next image"
              className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/85 transition-[border-color,background-color,color] duration-200 hover:border-white/35 hover:bg-white/[0.10] hover:text-white sm:right-6"
            >
              <FaChevronRight className="text-[14px]" />
            </button>
          ) : null}

          {/* Thumbnail strip */}
          {total > 1 ? (
            <div className="absolute inset-x-0 bottom-5 flex justify-center">
              <div
                className="flex max-w-[92vw] gap-2 overflow-x-auto rounded-full border border-white/10 bg-black/55 px-2 py-2 backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                {state.images.map((img, i) => (
                  <button
                    key={img.src}
                    type="button"
                    onClick={() => onIndexChange(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-md border transition-all duration-200 ${
                      i === state.index
                        ? "border-white/70 ring-1 ring-white/40"
                        : "border-white/10 opacity-55 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
