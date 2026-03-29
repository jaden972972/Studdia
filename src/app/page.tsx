"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const WORDS = ["Focus.", "Ship.", "Win."];

const FEATURES = [
  {
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
    title: "Pomodoro Timer",
    desc: "25‑minute focus blocks with auto‑reset and session tracking. Build deep‑work streaks.",
  },
  {
    icon: "M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z",
    title: "Custom Playlists",
    desc: "Build named playlists from YouTube. Loop, shuffle, save — your music, your rules.",
  },
  {
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z",
    title: "YouTube Music",
    desc: "Search millions of tracks directly inside the app. Embedded player, zero friction.",
  },
  {
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    title: "Zero Ads",
    desc: "No pre‑rolls, no banners, no distractions. Just your timer and your music.",
  },
  {
    icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    title: "Google Sign In",
    desc: "One‑click auth. Your playlists sync across devices through your account.",
  },
  {
    icon: "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z",
    title: "Minimalist UI",
    desc: "Dark, distraction‑free design engineered to keep you in the zone.",
  },
];

const STATS = [
  { value: "25 min", label: "Focus blocks" },
  { value: "0", label: "Ads served" },
  { value: "∞", label: "Free tracks" },
  { value: "100%", label: "Distraction-free" },
];

export default function Landing() {
  const router = useRouter();
  const [wordIdx, setWordIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % WORDS.length);
        setVisible(true);
      }, 350);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.35 + 0.05,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.alpha})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#060608] text-white font-sans overflow-x-hidden">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none z-0 opacity-40"
        style={{ background: "radial-gradient(ellipse at top, rgba(139,92,246,0.15) 0%, transparent 70%)" }}
      />

      {/* ── NAVBAR ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-16 py-5 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tight">Focusify</span>
          <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-400 border border-violet-500/25 tracking-widest uppercase">
            beta
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2"
          >
            Sign in
          </button>
          <button
            onClick={() => router.push("/cockpit")}
            className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", boxShadow: "0 0 24px rgba(139,92,246,0.3)" }}
          >
            Open App →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold tracking-wide mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Free · No ads · Open in seconds
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-4">
          Your cockpit for
          <br />
          <span style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6, #6d28d9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            deep work.
          </span>
        </h1>

        {/* Cycling word */}
        <div className="h-14 flex items-center justify-center mb-4">
          <span
            className="text-4xl md:text-5xl font-black tracking-tight transition-all duration-300"
            style={{
              color: "#8b5cf6",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0px)" : "translateY(10px)",
            }}
          >
            {WORDS[wordIdx]}
          </span>
        </div>

        <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
          Pomodoro timer + YouTube music + zero ads.
          <br />
          Built for students who need silence that slaps.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center mb-16">
          <button
            onClick={() => router.push("/cockpit")}
            className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all duration-200 active:scale-95"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", boxShadow: "0 0 40px rgba(139,92,246,0.35)" }}
          >
            Start Focusing — free
          </button>
          <a
            href="https://github.com/jaden972972/Focusify"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-2xl font-bold text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200 active:scale-95"
          >
            View on GitHub
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center py-5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
            >
              <span className="text-3xl font-black" style={{ color: "#8b5cf6" }}>{s.value}</span>
              <span className="text-gray-500 text-xs mt-1 tracking-wide">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── APP PREVIEW MOCKUP ── */}
      <section className="relative z-10 flex justify-center px-6 pb-24">
        <div className="w-full max-w-4xl rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl" style={{ boxShadow: "0 0 80px rgba(139,92,246,0.12)" }}>
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#111113] border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 mx-4 h-6 rounded-md bg-white/[0.04] flex items-center px-3">
              <span className="text-gray-600 text-xs">focusify-three.vercel.app/cockpit</span>
            </div>
          </div>
          {/* UI skeleton */}
          <div className="bg-[#0a0a0d] p-6 grid grid-cols-3 gap-4 min-h-[280px]">
            {/* Left panel - timer */}
            <div className="col-span-1 flex flex-col items-center justify-center gap-4 p-6 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6"/>
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeDasharray="213.6" strokeDashoffset="80" strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-black text-lg">18:24</span>
                  <span className="text-gray-600 text-[9px] uppercase tracking-wider">focus</span>
                </div>
              </div>
              <div className="w-full h-7 rounded-lg bg-violet-600/30 border border-violet-500/20" />
              <div className="w-3/4 h-2 rounded-full bg-white/[0.04]" />
            </div>
            {/* Center / right - player */}
            <div className="col-span-2 flex flex-col gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="w-full h-32 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="#8b5cf6"/>
                  </svg>
                </div>
              </div>
              <div className="flex gap-2">
                {[70, 50, 85].map((w, i) => (
                  <div key={i} className="h-2 rounded-full bg-white/[0.06]" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                {["Playlist 1", "Lo-fi", "+ New"].map((t) => (
                  <div key={t} className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-gray-600">{t}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="relative z-10 px-6 pb-24 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Everything you need. Nothing you don&apos;t.</h2>
          <p className="text-gray-500 text-base max-w-md mx-auto">Six features. Zero bloat. Built to keep you locked in.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl bg-white/[0.025] border border-white/[0.06] hover:border-violet-500/30 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(139,92,246,0.15)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.icon} />
                </svg>
              </div>
              <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pb-32">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Ready to{" "}
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              lock in?
            </span>
          </h2>
          <p className="text-gray-500 text-base mb-8">
            No sign‑up required. Open the app and start your first session in under 10 seconds.
          </p>
          <button
            onClick={() => router.push("/cockpit")}
            className="px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all duration-200 active:scale-95"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", boxShadow: "0 0 50px rgba(139,92,246,0.4)" }}
          >
            Start Focusing — free
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/[0.05] px-6 md:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-gray-600 text-xs">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="#6d28d9" strokeLinejoin="round"/>
          </svg>
          <span className="font-bold text-gray-500">Focusify</span>
          <span>· No ads · Study In Peace.</span>
        </div>
        <div className="flex items-center gap-5 text-[11px] text-gray-600">
          <a href="https://github.com/jaden972972/Focusify" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">GitHub</a>
          <button onClick={() => router.push("/cockpit")} className="hover:text-gray-400 transition-colors">App</button>
          <button onClick={() => router.push("/login")} className="hover:text-gray-400 transition-colors">Sign in</button>
        </div>
      </footer>
    </div>
  );
}

