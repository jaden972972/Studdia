"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useSubscription } from "@/hooks/useSubscription";

// ── Theme ─────────────────────────────────────────────────────────────────────
interface ThemeContextValue { theme: "dark" | "light"; toggleTheme: () => void; }
const ThemeContext = createContext<ThemeContextValue>({ theme: "dark", toggleTheme: () => {} });
export function useTheme() { return useContext(ThemeContext); }

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    // Read from the attribute already set by the blocking script
    const attr = document.documentElement.getAttribute("data-theme") as "dark" | "light" | null;
    return attr ?? (localStorage.getItem("studdia_theme") as "dark" | "light") ?? "dark";
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("studdia_theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export const TIMER_MODES = {
  FOCUS: { label: "Enfoque", minutes: 25, color: "#8b5cf6" },
  SHORT: { label: "Descanso", minutes: 5,  color: "#10b981" },
  LONG:  { label: "Descanso largo", minutes: 15, color: "#3b82f6" },
} as const;

export type TimerMode = keyof typeof TIMER_MODES;

interface TimerContextValue {
  mode: TimerMode;
  seconds: number;
  isActive: boolean;
  sessions: number;
  customFocusMin: number;
  effectiveFocusMin: number;
  muted: boolean;
  changeMode: (m: TimerMode) => void;
  setIsActive: (v: boolean) => void;
  adjustFocus: (delta: number) => void;
  formatTime: (s: number) => string;
  toggleMuted: () => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function useTimer(): TimerContextValue {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used inside Providers");
  return ctx;
}

function TimerProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { isPro } = useSubscription();
  const sessionRef = useRef(session);
  useEffect(() => { sessionRef.current = session; }, [session]);

  const [mode, setMode] = useState<TimerMode>("FOCUS");
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [customFocusMin, setCustomFocusMin] = useState<number>(() => {
    if (typeof window === "undefined") return 25;
    const saved = localStorage.getItem("studdia_focus_min");
    return saved ? Math.max(5, Math.min(120, Number(saved))) : 25;
  });
  const [muted, setMuted] = useState<boolean>(() =>
    typeof window !== "undefined" ? localStorage.getItem("studdia_muted") === "1" : false
  );
  const toggleMuted = () => setMuted((m) => {
    const next = !m;
    localStorage.setItem("studdia_muted", next ? "1" : "0");
    return next;
  });

  const effectiveFocusMin = isPro ? customFocusMin : 25;
  const effectiveFocusMinRef = useRef(effectiveFocusMin);
  useEffect(() => { effectiveFocusMinRef.current = effectiveFocusMin; }, [effectiveFocusMin]);

  const [seconds, setSeconds] = useState(TIMER_MODES.FOCUS.minutes * 60);

  const changeMode = (newMode: TimerMode) => {
    setMode(newMode);
    setSeconds(newMode === "FOCUS" ? effectiveFocusMinRef.current * 60 : TIMER_MODES[newMode].minutes * 60);
    setIsActive(false);
  };

  const adjustFocus = (delta: number) => {
    if (isActive) return;
    const next = Math.min(120, Math.max(5, customFocusMin + delta));
    setCustomFocusMin(next);
    if (mode === "FOCUS") setSeconds(next * 60);
    localStorage.setItem("studdia_focus_min", String(next));
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds((s) => s - 1), 1000);
      document.title = `(${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}) Studdia`;
    } else if (seconds === 0) {
      setIsActive(false);
      if (mode === "FOCUS") {
        setSessions((s) => s + 1);
        if (effectiveFocusMinRef.current >= 25 && sessionRef.current?.user?.email) {
          fetch("/api/sessions", { method: "POST" }).catch(() => {});
        }
      }
      document.title = "Studdia";
      if (!muted) {
        try {
          const audioCtx = new AudioContext();
        const play = (freq: number, start: number, dur: number) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
          gain.gain.setValueAtTime(0, audioCtx.currentTime + start);
          gain.gain.linearRampToValueAtTime(0.35, audioCtx.currentTime + start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + dur);
          osc.start(audioCtx.currentTime + start);
          osc.stop(audioCtx.currentTime + start + dur);
        };
        play(880, 0, 0.6);
        play(660, 0.35, 0.8);
      } catch (_) {}
      }
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, mode, muted]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <TimerContext.Provider value={{
      mode, seconds, isActive, sessions, customFocusMin, effectiveFocusMin,
      muted, changeMode, setIsActive, adjustFocus, formatTime, toggleMuted,
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <TimerProviderInner>{children}</TimerProviderInner>
      </ThemeProvider>
    </SessionProvider>
  );
}
