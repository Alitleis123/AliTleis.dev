/**
 * Page texture.
 *
 * Previously five stacked decorative systems — rotating rings, two drifting
 * orbs, ten floating particles, an ambient gradient and edge lights. None of
 * them said anything about the work, and together they kept a compositor layer
 * busy behind every scroll.
 *
 * Replaced by one idea: a measured grid with grain over it, lit slightly from
 * the top. Static, server-rendered, no JavaScript, no animation frames.
 */
import ParticleField from "./ParticleField";

export default function BackgroundRings() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Measured grid — the instrument cue. Two scales so it reads as
          precise up close and as texture at a glance. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(237,237,234,0.028) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(237,237,234,0.028) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(237,237,234,0.055) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(237,237,234,0.055) 1px, transparent 1px)",
          backgroundSize: "480px 480px",
        }}
      />

      {/* A single warm light source, top-left, so the page has a direction. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 50% at 18% 0%, rgba(var(--signal-rgb),0.055), transparent 62%)",
        }}
      />

      <ParticleField />

      <div className="noise-overlay" />

      {/* Falls off at the edges so the grid never fights the content. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 35%, transparent 45%, rgba(10,10,11,0.92) 100%)",
        }}
      />
    </div>
  );
}
