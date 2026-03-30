"use client";
import { useRouter } from "next/navigation";

const CYCLE = [
  {
    label: "Deep Focus",
    duration: "25 min",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.25)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    desc: "Lock in. No distractions.",
  },
  {
    label: "Short Break",
    duration: "5 min",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.2)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    desc: "Breathe. Reset.",
  },
  {
    label: "Deep Focus",
    duration: "25 min",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.25)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    desc: "Go again. Deeper.",
  },
  {
    label: "Long Break",
    duration: "15 min",
    color: "#10b981",
    glow: "rgba(16,185,129,0.2)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    desc: "You earned it. Recharge.",
  },
];

const BENEFITS = [
  { stat: "2.5x", label: "More tasks completed", sub: "vs unstructured study" },
  { stat: "90%", label: "Less mental fatigue", sub: "after 4 focused sessions" },
  { stat: "25 min", label: "The sweet spot", sub: "for peak cognitive output" },
];

export default function PomodoroSection() {
  const router = useRouter();

  return (
    <section className="relative z-10 w-full py-24 px-6 md:px-16 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(139,92,246,0.06) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 flex justify-center mb-12">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 text-xs font-semibold tracking-widest uppercase">
          <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="5" /></svg>
          The Science Behind Studdia
        </span>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col gap-6">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
            Your brain was not built{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}
            >
              to marathon.
            </span>
            <br />
            It was built to sprint.
          </h2>

          <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-lg">
            The <span className="text-white font-semibold">Pomodoro Technique</span> is the most
            battle-tested framework for deep work. Studdia wraps it in a distraction-free
            environment with adaptive music that keeps your mind in the zone, session after session.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-2">
            {BENEFITS.map((b) => (
              <div key={b.stat} className="flex flex-col gap-1 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                <span className="text-2xl font-black text-white">{b.stat}</span>
                <span className="text-[11px] font-semibold text-violet-300 leading-tight">{b.label}</span>
                <span className="text-[10px] text-gray-600 leading-tight">{b.sub}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push("/cockpit")}
            className="mt-2 w-fit flex items-center gap-3 px-7 py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-200 active:scale-95 hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              boxShadow: "0 0 24px rgba(139,92,246,0.35)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            Start Focus Session
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          <p className="text-[11px] text-gray-600">Free forever - No account required - Zero ads</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">One Pomodoro Cycle</span>
            <span className="text-xs text-gray-600">~80 min total</span>
          </div>

          {CYCLE.map((step, i) => (
            <div key={i} className="relative flex items-center gap-4 group">
              {i < CYCLE.length - 1 && (
                <div
                  className="absolute left-[22px] top-[52px] w-px h-3 opacity-30"
                  style={{ backgroundColor: step.color }}
                />
              )}
              <div
                className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{
                  background: `${step.color}18`,
                  border: `1px solid ${step.color}40`,
                  color: step.color,
                  boxShadow: `0 0 16px ${step.glow}`,
                }}
              >
                {step.icon}
              </div>
              <div
                className="flex-1 flex items-center justify-between px-5 py-3.5 rounded-2xl border transition-all duration-200 group-hover:border-white/10"
                style={{ background: `${step.color}08`, borderColor: `${step.color}20` }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-white">{step.label}</span>
                  <span className="text-xs text-gray-500">{step.desc}</span>
                </div>
                <span className="text-sm font-black tabular-nums" style={{ color: step.color }}>
                  {step.duration}
                </span>
              </div>
            </div>
          ))}

          <div className="mt-4 p-4 rounded-2xl border border-white/[0.05] bg-white/[0.02]">
            <div className="flex justify-between text-[10px] text-gray-600 mb-2 font-medium">
              <span>Session progress</span>
              <span>80 min cycle</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 flex overflow-hidden gap-0.5">
              <div className="h-full rounded-full" style={{ width: "35.7%", background: "#8b5cf6" }} />
              <div className="h-full rounded-full" style={{ width: "7.1%", background: "#06b6d4" }} />
              <div className="h-full rounded-full" style={{ width: "35.7%", background: "#8b5cf6" }} />
              <div className="h-full rounded-full flex-1" style={{ background: "#10b981" }} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-700 mt-1.5">
              <span style={{ color: "#8b5cf6" }}>Focus</span>
              <span style={{ color: "#06b6d4" }}>Rest</span>
              <span style={{ color: "#8b5cf6" }}>Focus</span>
              <span style={{ color: "#10b981" }}>Recharge</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-600 text-center mt-1">
            Repeat 2-4 cycles for a complete deep work session.{" "}
            <span className="text-violet-400">Studdia tracks every one.</span>
          </p>
        </div>
      </div>
    </section>
  );
}