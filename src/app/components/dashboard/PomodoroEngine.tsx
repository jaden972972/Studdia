"use client";
import { useState, useEffect, useCallback } from "react";

const MODES = {
  FOCUS: { label: "Enfoque",        minutes: 25, color: "#8b5cf6" },
  SHORT: { label: "Descanso Corto", minutes: 5,  color: "#10b981" },
  LONG:  { label: "Descanso Largo", minutes: 15, color: "#3b82f6" },
} as const;

type Mode = keyof typeof MODES;

interface Props {
  onSessionComplete?: () => void;
  onFocusToggle?: (active: boolean) => void;
}

export default function PomodoroEngine({ onSessionComplete, onFocusToggle }: Props) {
  const [mode, setMode] = useState<Mode>("FOCUS");
  const [seconds, setSeconds] = useState(MODES.FOCUS.minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);

  const total = MODES[mode].minutes * 60;
  const progress = 1 - seconds / total;
  const radius = 72;
  const circ = 2 * Math.PI * radius;
  const accent = MODES[mode].color;

  const notify = useCallback((msg: string) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(msg, { body: "Studdia", icon: "/favicon.ico" });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    let id: ReturnType<typeof setInterval>;
    if (isActive && seconds > 0) {
      id = setInterval(() => setSeconds((s) => s - 1), 1000);
      document.title = `(${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}) Studdia`;
    } else if (seconds === 0) {
      setIsActive(false);
      document.title = "Studdia";
      if (mode === "FOCUS") {
        setSessions((s) => s + 1);
        onSessionComplete?.();
        notify("Focus session complete! Time for a break.");
      } else {
        notify("Break over. Back to work!");
      }
      try {
        const ctx = new AudioContext();
        const chime = (freq: number, t: number, dur: number) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.connect(g); g.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + t);
          g.gain.setValueAtTime(0, ctx.currentTime + t);
          g.gain.linearRampToValueAtTime(0.3, ctx.currentTime + t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + dur);
          osc.start(ctx.currentTime + t);
          osc.stop(ctx.currentTime + t + dur);
        };
        chime(880, 0, 0.6);
        chime(660, 0.35, 0.8);
      } catch (_) {}
    }
    return () => clearInterval(id);
  }, [isActive, seconds, mode, onSessionComplete, notify]);

  useEffect(() => {
    onFocusToggle?.(isActive);
  }, [isActive, onFocusToggle]);

  const changeMode = (m: Mode) => { setMode(m); setSeconds(MODES[m].minutes * 60); setIsActive(false); };
  const reset = () => { setSeconds(MODES[mode].minutes * 60); setIsActive(false); };
  const pad = (n: number) => n.toString().padStart(2, "0");
  const fmt = (s: number) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

  return (
    <div className="flex flex-col items-center w-full gap-6">
      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-black/40 rounded-full border border-white/[0.06] w-full">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => changeMode(m)}
            className="flex-1 text-[9px] font-black uppercase tracking-widest px-2 py-2 rounded-full transition-all duration-200"
            style={mode === m ? { background: MODES[m].color, color: "white" } : { color: "#555" }}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Ring */}
      <div className="relative flex items-center justify-center">
        <svg
          width="184"
          height="184"
          className="-rotate-90"
          style={{ filter: `drop-shadow(0 0 18px ${accent}50)` }}
        >
          <circle cx="92" cy="92" r={radius} fill="none" stroke="#1c1c22" strokeWidth="6" />
          <circle
            cx="92" cy="92" r={radius}
            fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - progress)}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute flex flex-col items-center select-none">
          <span className="text-[42px] font-mono font-black tabular-nums tracking-tighter leading-none">
            {fmt(seconds)}
          </span>
          <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-2">
            {isActive ? "En Sesión" : "Listo"}
          </span>
          <span className="text-[10px] font-bold mt-1" style={{ color: accent }}>
            {sessions} {sessions === 1 ? "sesión" : "sesiones"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 w-full">
        <button
          onClick={reset}
          title="Reset"
          className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] transition-all text-gray-500 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
          </svg>
        </button>
        <button
          onClick={() => setIsActive((v) => !v)}
          className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-200 active:scale-[0.97]${!isActive ? " btn-pulse" : ""}`}
          style={
            isActive
              ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }
              : { background: accent, color: "white" }
          }
        >
          {isActive ? "Pausar" : "Iniciar"}
        </button>
      </div>
    </div>
  );
}
