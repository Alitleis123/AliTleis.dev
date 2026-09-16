/**
 * Holding a view transition open until the new route has committed.
 *
 * startViewTransition takes its "after" snapshot when the callback's promise
 * settles, and router.push resolves long before React has rendered the new
 * route, so the promise has to be held until the navigation actually lands.
 *
 * The resolver lives at module scope rather than in the component that starts
 * the transition. The view switch sits in the top bar of whichever route is
 * on screen, so navigating away unmounts it, and a resolver held in a ref
 * there died with the component every single time. The transition then waited
 * out its whole timeout, which is the one second pause it used to open with.
 *
 * Released by SiteShell, which the root layout keeps mounted across both
 * routes and which already knows the pathname.
 */

let release: (() => void) | null = null;
let timer = 0;

/** Longest the old frame is allowed to stay frozen if a route never commits. */
const GIVE_UP_MS = 900;

/** A promise that settles once the next route commits, or the wait expires. */
export function untilRouteCommits(): Promise<void> {
  return new Promise<void>((resolve) => {
    // A second navigation while one is pending abandons the first, otherwise
    // its timer would cut the new transition short.
    release?.();
    window.clearTimeout(timer);

    release = () => {
      window.clearTimeout(timer);
      release = null;
      resolve();
    };

    timer = window.setTimeout(() => {
      release = null;
      resolve();
    }, GIVE_UP_MS);
  });
}

/** Called when the route has changed, to let the transition snapshot. */
export function routeCommitted(): void {
  release?.();
}
