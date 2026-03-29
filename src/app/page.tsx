"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const WORDS = ["Focus.", "Study.", "Win."];

export default function Landing() {
  const router = useRouter();
  const [wordIdx, setWordIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cycling headline words
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIdx(i => (i + 1) % WORDS.length);
        setVisible(true);
      }, 400);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Particle canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.alpha})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <main className="relative h-screen w-screen bg-[#060608] text-white overflow-hidden flex flex-col items-center justify-center font-sans">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Glow blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)" }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">

        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-2xl"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Brand */}
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">Focusify</h1>
          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30 tracking-widest uppercase">v9</span>
        </div>

        {/* Cycling word */}
        <div className="h-10 flex items-center mb-6">
          <span className="text-3xl md:text-4xl font-black tracking-tight transition-all duration-300"
            style={{
              color: "#8b5cf6",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
            }}>
            {WORDS[wordIdx]}
          </span>
        </div>

        <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-10 max-w-md">
          A minimalist cockpit for deep work.<br />
          Pomodoro timer, custom playlists, zero ads.
        </p>

        {/* CTA */}
        <button onClick={() => router.push("/cockpit")}
          className="group relative px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 active:scale-95"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", boxShadow: "0 0 40px rgba(139,92,246,0.3)" }}>
          <span className="relative z-10">Start Focusing</span>
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(135deg, #9d6ff7, #7c3aed)" }} />
        </button>

        {/* Features */}
        <div className="mt-14 flex flex-wrap gap-4 justify-center">
          {[
            { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label: "No ads. Ever." },
            { icon: "M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z", label: "Custom Playlists" },
            { icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z", label: "YouTube Music" },
            { icon: "M22 12h-4l-3 9L9 3l-3 9H2", label: "Pomodoro Timer" },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-gray-500 text-[11px] font-semibold tracking-wide">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-500" style={{ color: "#8b5cf6" }}>
                <path d={f.icon}/>
              </svg>
              {f.label}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-[10px] text-gray-700 tracking-widest uppercase">No ads · Study In Peace.</p>
    </main>
  );
}

