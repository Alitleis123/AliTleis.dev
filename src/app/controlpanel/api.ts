/**
 * The panel's side of ask/api/auth.js and ask/api/panel.js.
 *
 * The functions live on another origin, so the session goes in an
 * Authorization header rather than a cookie, which Safari would refuse as a
 * third-party one. It is kept in localStorage and dies on the server after
 * twelve hours, or at once on Lock.
 */
import { askEndpoint } from "../lib/askApi";
import type { PanelData } from "./model";

const TOKEN = "cp-session";

/**
 * This tab's session, ahead of storage. When storage reads but will not save,
 * a stale token left in it must not win over the one just issued.
 */
let memory: string | null = null;

export const token = {
  get: () => {
    if (memory) return memory;
    try {
      return localStorage.getItem(TOKEN);
    } catch {
      return null;
    }
  },
  set: (value: string) => {
    memory = value;
    try {
      localStorage.setItem(TOKEN, value);
      // Ali's own browsing stops counting once he has signed in here.
      localStorage.setItem("notrack", "1");
    } catch {
      // Storage is blocked, so the copy in memory is the session.
    }
  },
  clear: () => {
    memory = null;
    try {
      localStorage.removeItem(TOKEN);
    } catch {}
  },
};

export class SignedOut extends Error {}

async function call<T>(name: string, init: RequestInit = {}, t = token.get()): Promise<T> {
  const res = await fetch(askEndpoint(name), {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    },
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 401 && name.startsWith("panel")) throw new SignedOut();
  if (!res.ok) throw new Error(body.error || `The panel's API answered ${res.status}.`);
  return body as T;
}

const auth = <T>(action: string, extra: object = {}) =>
  call<T>("auth", { method: "POST", body: JSON.stringify({ action, ...extra }) });

export const status = () => auth<{ enrolled: boolean; signedIn: boolean }>("status");
/** Drops the token here first, so nothing still running can use it, then ends it on the server. */
export function lock() {
  const t = token.get();
  token.clear();
  return call("auth", { method: "POST", body: JSON.stringify({ action: "lock" }) }, t);
}
export const pair = () => auth<{ code: string; expires: number }>("pair");

/** The whole log, or with `since` only what came after those times. */
export const load = (since?: { visits: string; asks: string }) =>
  call<PanelData>(since ? `panel?${new URLSearchParams(since)}` : "panel");
export const edit = <T = { ok: true }>(body: object) =>
  call<T>("panel", { method: "POST", body: JSON.stringify(body) });

// ── Passkeys ────────────────────────────────────────────────────────────────

const b64 = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const bytes = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

type Descriptor = { type: "public-key"; id: string; transports?: AuthenticatorTransport[] };
const descriptors = (list: Descriptor[] = []) => list.map((d) => ({ ...d, id: bytes(d.id) }));

/** Passkeys need a secure page and a browser from the last few years. */
export const passkeysWork = () =>
  typeof window !== "undefined" && window.isSecureContext && "PublicKeyCredential" in window;

/** What the browser's refusal means, in words. */
export function why(err: unknown) {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError") return "Cancelled, or the passkey prompt timed out.";
    if (err.name === "InvalidStateError") return "This device already has a passkey for the panel. Use Unlock.";
    if (err.name === "SecurityError") return "Passkeys are not allowed on this address.";
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}

/** A name for the passkey list, like "iPhone · Safari". */
export function deviceName() {
  const ua = navigator.userAgent;
  const os = /iPhone/.test(ua) ? "iPhone"
    : /iPad/.test(ua) ? "iPad"
    : /Android/.test(ua) ? "Android"
    : /Mac OS X/.test(ua) ? "Mac"
    : /Windows/.test(ua) ? "Windows"
    : "Device";
  const browser = /Edg\//.test(ua) ? "Edge"
    : /Firefox\/|FxiOS/.test(ua) ? "Firefox"
    : /Chrome\/|CriOS/.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari"
    : "";
  return browser ? `${os} · ${browser}` : os;
}

/** Unlocks with a passkey this panel already knows. */
export async function unlock() {
  const o = await auth<{
    challenge: string;
    rpId: string;
    allowCredentials: Descriptor[];
    userVerification: UserVerificationRequirement;
    timeout: number;
  }>("sign-in-options");
  const cred = (await navigator.credentials.get({
    publicKey: { ...o, challenge: bytes(o.challenge), allowCredentials: descriptors(o.allowCredentials) },
  })) as PublicKeyCredential | null;
  if (!cred) throw new Error("No passkey was chosen.");
  const r = cred.response as AuthenticatorAssertionResponse;
  const { token: t } = await auth<{ token: string }>("sign-in", {
    credential: {
      id: b64(cred.rawId),
      clientDataJSON: b64(r.clientDataJSON),
      authenticatorData: b64(r.authenticatorData),
      signature: b64(r.signature),
    },
  });
  token.set(t);
}

/**
 * Makes a passkey on this device and stores it. `grant` is what lets it in:
 * the password for the very first device, a pairing code for a new one, or
 * nothing when a signed-in device adds its own.
 */
export async function enroll(grant: { password?: string; code?: string } = {}) {
  const o = await auth<
    Omit<PublicKeyCredentialCreationOptions, "challenge" | "user" | "excludeCredentials"> & {
      challenge: string;
      user: { id: string; name: string; displayName: string };
      excludeCredentials: Descriptor[];
    }
  >("enroll-options", grant);
  const cred = (await navigator.credentials.create({
    publicKey: {
      ...o,
      challenge: bytes(o.challenge),
      user: { ...o.user, id: bytes(o.user.id) },
      excludeCredentials: descriptors(o.excludeCredentials),
    },
  })) as PublicKeyCredential | null;
  if (!cred) throw new Error("No passkey was made.");
  const r = cred.response as AuthenticatorAttestationResponse;
  const publicKey = r.getPublicKey?.();
  if (!publicKey) throw new Error("This browser cannot hand over the passkey's public key. Try Safari or Chrome.");
  const { token: t } = await auth<{ token: string }>("enroll", {
    name: deviceName(),
    credential: {
      id: b64(cred.rawId),
      clientDataJSON: b64(r.clientDataJSON),
      authenticatorData: b64(r.getAuthenticatorData()),
      publicKey: b64(publicKey),
      alg: r.getPublicKeyAlgorithm(),
      transports: r.getTransports?.() ?? [],
    },
  });
  token.set(t);
}
