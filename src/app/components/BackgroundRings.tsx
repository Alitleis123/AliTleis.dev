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

      <div className="orb-left absolute -left-40 top-32 h-[520px] w-[520px] rounded-full bg-sky-500/[0.04] blur-[100px]" />
      <div className="orb-right absolute right-[-180px] top-1/3 h-[560px] w-[560px] rounded-full bg-indigo-500/[0.05] blur-[120px]" />

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
