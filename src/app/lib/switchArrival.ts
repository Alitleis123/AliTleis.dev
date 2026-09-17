/**
 * Whether a route is being entered through the view switch.
 *
 * Two things depend on it. The suite skips its boot sequence, which is right
 * for a cold open and wrong for a toggle, where replaying half a second of
 * chrome assembling itself makes a move between two views of one site feel
 * slow. And the parts of each bar that differ animate in, so the swap reads as
 * content changing rather than the page blinking.
 *
 * The reader is a pure predicate rather than a take-once call. Consuming on
 * read looks tidier and is wrong here: both readers run during render, React
 * runs render twice in development, and the second call returned false and
 * won. Recording the destination and comparing against it is idempotent, so
 * it survives being asked twice.
 *
 * A module value rather than a query parameter or sessionStorage, because it
 * only has to survive one navigation inside one tab, and it should not leave a
 * mark on the URL that a reload or a shared link would carry.
 */

let pending: string | null = null;

/** Called by the switch, with the route it is sending the visitor to. */
export function markSwitchNavigation(href: string): void {
  pending = href;
}

/** Safe to call during render, and safe to call more than once. */
export function isSwitchArrival(pathname: string | null | undefined): boolean {
  if (!pending || !pathname) return false;
  return pathname.startsWith(pending);
}

/**
 * Cleared once the arrival has been rendered, so a later reload or a link
 * from somewhere else does not inherit it. Call from an effect, never from
 * render.
 */
export function clearSwitchArrival(): void {
  pending = null;
}
