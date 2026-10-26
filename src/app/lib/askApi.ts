/**
 * The Vercel functions in ask/: the Ask panel's writer, the visit log and the
 * control panel's API. The override exists for local previews, and may be a
 * path, so callers resolve it against the page.
 */
export const ASK_API =
  process.env.NEXT_PUBLIC_ASK_API || "https://alitleis-ask.vercel.app/api/ask";

/** Another function beside the writer, like "visit" or "panel". */
export const askEndpoint = (name: string) =>
  new URL(name, new URL(ASK_API, window.location.href)).href;
