"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: string;
}

export default function BackgroundGlow() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const pts: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${3 + Math.random() * 5}s`,
      size: `${2 + Math.random() * 4}px`,
    }));
    setParticles(pts);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 底色渐变 */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-xuan via-xuan-card to-xuan" />

      {/* 顶部金色渐变 */}
      <div className="fixed inset-x-0 top-0 z-0 h-32 bg-gradient-to-b from-gold/10 to-transparent" />

      {/* 中心光晕 */}
      <div
        className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(201,160,92,0.06) 0%, transparent 70%)",
        }}
      />

      {/* 浮动光点 */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gold/40 animate-glow-rise"
          style={{
            left: p.left,
            bottom: "-10px",
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}
