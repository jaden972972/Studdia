"use client";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import PomodoroEngine from "./PomodoroEngine";
import AmbienceMixer from "./AmbienceMixer";
import TaskManager from "./TaskManager";
import PlaylistPanel from "./PlaylistPanel";

type Tab = "timer" | "tasks" | "ambience" | "playlists";

export default function Dashboard() {
  const { data: session } = useSession();
  const [mobileTab, setMobileTab] = useState<Tab>("timer");
  const [totalSessions, setTotalSessions] = useState(0);
  const [videoId, setVideoId] = useState<string | null>(null);

  const NAV: { id: Tab; label: string; glyph: string }[] = [
    { id: "timer",     label: "Focus",     glyph: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5-5H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" },
    { id: "tasks",     label: "Tasks",     glyph: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" },
    { id: "ambience",  label: "Sound",     glyph: "M3 18v-6a9 9 0 0118 0v6M3 18a3 3 0 006 0v-1H3v1zM21 18a3 3 0 01-6 0v-1h6v1z" },
    { id: "playlists", label: "Lists",     glyph: "M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col">

      {/* ── TOPBAR ── */}
      <header className="shrink-0 flex items-center justify-between px-5 md:px-8 py-4 border-b border-white/[0.06] bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <span className="font-black text-sm tracking-tight leading-none block">Studdia</span>
            <span className="text-[9px] text-gray-600 leading-none">Deep Work Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-[10px] text-gray-600">
            <span className="text-violet-400 font-bold">{totalSessions}</span> sessions today
          </span>
          {session?.user?.image && (
            <img src={session.user.image} alt="" className="w-7 h-7 rounded-full border border-white/10" />
          )}
          {session?.user && (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-700 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 border-r border-white/[0.06] bg-black/20 backdrop-blur-md overflow-y-auto">
          <div className="p-6 flex flex-col gap-6">
            <AmbienceMixer />
            <div className="h-px bg-white/[0.05]" />
            <PlaylistPanel onPlay={setVideoId} />
          </div>
        </aside>

        {/* ── MAIN BENTO GRID ── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

          {/* Desktop: always show both cards */}
          <div className="hidden lg:grid grid-cols-2 gap-4 h-full max-h-[calc(100vh-80px)]">

            {/* Pomodoro card */}
            <div className="flex flex-col p-6 rounded-3xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-6">Focus Timer</p>
              <PomodoroEngine onSessionComplete={() => setTotalSessions((s) => s + 1)} />
            </div>

            {/* Tasks card */}
            <div className="flex flex-col p-6 rounded-3xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md overflow-hidden">
              <TaskManager />
            </div>
          </div>

          {/* Mobile: single panel based on active tab */}
          <div className="lg:hidden">
            <div className="p-5 rounded-3xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md min-h-[420px] flex flex-col">
              {mobileTab === "timer"     && <PomodoroEngine onSessionComplete={() => setTotalSessions((s) => s + 1)} />}
              {mobileTab === "tasks"     && <TaskManager />}
              {mobileTab === "ambience"  && <AmbienceMixer />}
              {mobileTab === "playlists" && <PlaylistPanel onPlay={setVideoId} />}
            </div>
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="lg:hidden shrink-0 flex border-t border-white/[0.06] bg-black/40 backdrop-blur-sm">
        {NAV.map((n) => {
          const active = mobileTab === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setMobileTab(n.id)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors"
              style={{ color: active ? "#8b5cf6" : "#444" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={n.glyph} />
              </svg>
              <span className="text-[9px] font-semibold uppercase tracking-widest">{n.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
