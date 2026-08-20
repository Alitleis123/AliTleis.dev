const particles = [
  { size: 3, left: "12%", top: "18%", duration: 16, delay: 0 },
  { size: 2, left: "22%", top: "62%", duration: 14, delay: 1.2 },
  { size: 4, left: "35%", top: "30%", duration: 18, delay: 0.6 },
  { size: 3, left: "48%", top: "72%", duration: 20, delay: 0.4 },
  { size: 2, left: "58%", top: "22%", duration: 15, delay: 1.6 },
  { size: 4, left: "66%", top: "48%", duration: 19, delay: 0.9 },
  { size: 3, left: "75%", top: "15%", duration: 17, delay: 0.3 },
  { size: 2, left: "82%", top: "58%", duration: 16, delay: 1.1 },
  { size: 3, left: "88%", top: "35%", duration: 18, delay: 0.7 },
  { size: 2, left: "28%", top: "85%", duration: 21, delay: 0.2 },
];

export default function BackgroundRings() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="ambient-pulse absolute inset-0 opacity-40">
        <div className="ambient-gradient" />
      </div>

      <div className="noise-overlay" />

      {/* Ambient glows. These use radial gradients rather than `blur-[100px]` on
          a solid circle: an animated large-radius blur filter has to be
          re-rasterized every frame, which pinned the whole page at ~20fps while
          scrolling. A gradient rasterizes once and renders identically here. */}
      <div
        className="orb-left absolute -left-[260px] top-7 h-[720px] w-[720px]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(14,165,233,0.055), rgba(14,165,233,0.02) 40%, transparent 68%)",
        }}
      />
      <div
        className="orb-right absolute right-[-300px] top-[calc(33.333%-120px)] h-[800px] w-[800px]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(99,102,241,0.065), rgba(99,102,241,0.022) 40%, transparent 68%)",
        }}
      />

      {particles.map((particle, index) => (
        <span
          key={`particle-${index}`}
          className="particle-float absolute rounded-full bg-white/40 blur-[1px]"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      <svg
        className="absolute left-1/2 top-1/2 h-[1200px] w-[1200px] -translate-x-1/2 -translate-y-1/2 opacity-25"
        viewBox="0 0 1000 1000"
        fill="none"
      >
        <circle className="ring-1" cx="500" cy="500" r="280" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
        <circle className="ring-2" cx="500" cy="500" r="360" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <circle className="ring-3" cx="500" cy="500" r="440" stroke="rgba(255,255,255,0.025)" strokeWidth="0.8" />
      </svg>
    </div>
  );
}
