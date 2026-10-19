"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps Tab inside an open dialog, and gives focus back to whatever opened it
 * once it closes.
 *
 * Both overlays here cover the page, and without this Tab walked out of them
 * into the controls behind: from the Ask box straight to the nav, and from an
 * open gallery to the project card's More button underneath it.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const inside = () =>
      [...(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter(
        (el) => el.getClientRects().length > 0,
      );

    // Into the dialog, unless something in it already took focus.
    if (ref.current && !ref.current.contains(document.activeElement)) {
      inside()[0]?.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !ref.current) return;
      const items = inside();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const at = document.activeElement;
      const outside = !ref.current.contains(at);
      if (e.shiftKey && (at === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (at === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // Without scrolling, since closing the palette by picking a result has
      // just scrolled the page to it.
      opener?.focus({ preventScroll: true });
    };
  }, [ref, active]);
}
