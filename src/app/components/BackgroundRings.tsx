import SpaceField from "./SpaceField";

/**
 * Page backdrop: orbital canvas, one warm light source, grain, and an edge
 * falloff so nothing competes with the reading column.
 *
 * The measured graph-paper grid that lived here is gone — it read as an
 * instrument panel, which fought the orbits rather than supporting them.
 * The grain moved into the canvas too: as a repeating 120px CSS tile it read
 * as a lattice, which is a grid by another name.
 */
export default function BackgroundRings() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* A single light source, top-left, so the page has a direction. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 50% at 18% 0%, rgba(var(--signal-rgb),0.05), transparent 62%)",
        }}
      />

      <SpaceField />

      {/* Falls off at the edges so the orbits never crowd the content. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 35%, transparent 42%, rgba(10,10,11,0.90) 100%)",
        }}
      />
    </div>
  );
}
