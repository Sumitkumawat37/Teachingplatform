import { useMemo } from "react";

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  color: string;
}

export function FloatingParticles({ count = 20, className }: { count?: number; className?: string }) {
  const particles = useMemo<Particle[]>(() => {
    const colors = [
      "rgba(168,85,247,0.3)",
      "rgba(236,72,153,0.25)",
      "rgba(249,115,22,0.2)",
      "rgba(168,85,247,0.15)",
      "rgba(139,92,246,0.2)",
    ];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 8,
      color: colors[i % colors.length],
    }));
  }, [count]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className || ''}`} aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            animation: `particle-float-${(p.id % 3) + 1} ${p.duration}s ease-in-out ${p.delay}s infinite`,
            filter: p.size > 2 ? "blur(1px)" : "none",
          }}
        />
      ))}
      {/* Large ambient glow orbs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04]"
        style={{
          background: "radial-gradient(circle, #a855f7, transparent 70%)",
          top: "10%",
          right: "-10%",
          animation: "float 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.03]"
        style={{
          background: "radial-gradient(circle, #ec4899, transparent 70%)",
          bottom: "5%",
          left: "-8%",
          animation: "float-reverse 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full opacity-[0.03]"
        style={{
          background: "radial-gradient(circle, #f97316, transparent 70%)",
          top: "50%",
          left: "40%",
          animation: "float-slow 22s ease-in-out infinite",
        }}
      />
    </div>
  );
}
