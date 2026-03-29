"use client";
import { useState, useEffect } from "react";

const MODES = {
  FOCUS: { label: "Focus", minutes: 25, color: "#8b5cf6" },
  SHORT: { label: "Break", minutes: 5, color: "#10b981" },
  LONG:  { label: "Long Break", minutes: 15, color: "#3b82f6" },
} as const;

type Mode = keyof typeof MODES;

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const [videoId, setVideoId] = useState("ZbQh1ZPG5pc");
  const [input, setInput] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<{ id: string; title: string }[]>([]);

  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  const [mode, setMode] = useState<Mode>("FOCUS");
  const [seconds, setSeconds] = useState(MODES.FOCUS.minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);

  const totalSeconds = MODES[mode].minutes * 60;
  const progress = 1 - seconds / totalSeconds;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const accent = MODES[mode].color;

  const changeMode = (newMode: Mode) => {
    setMode(newMode);
    setSeconds(MODES[newMode].minutes * 60);
    setIsActive(false);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds((s) => s - 1), 1000);
      document.title = `(${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}) Focusify`;
    } else if (seconds === 0) {
      setIsActive(false);
      if (mode === "FOCUS") setSessions((s) => s + 1);
      document.title = "Focusify";
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, mode]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  useEffect(() => {
    const saved = localStorage.getItem("focusify_final_v8");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("focusify_final_v8", JSON.stringify(favorites));
  }, [favorites]);

  const saveToLibrary = (id: string, title: string) => {
    if (!favorites.find((f) => f.id === id))
      setFavorites([...favorites, { id, title }]);
  };

  const searchYoutube = async (query: string) => {
    if (!query || !API_KEY) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`
      );
      const data = await res.json();
      setResults(data.items || []);
    } catch (e) {
      console.error("Search Error:", e);
    }
    setLoading(false);
  };

  return (
    <main className="h-screen w-screen bg-[#080808] text-white overflow-hidden flex font-sans">

      {/* ── SIDEBAR OVERLAY (mobile) ── */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden" />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-white/[0.06] bg-[#0c0c0e] p-6 gap-5
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 md:flex shrink-0`}>

        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight">Focusify</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-colors md:hidden">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Session counter */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">Today</p>
          <div className="flex items-end gap-1.5 mb-3">
            <span className="text-3xl font-black tabular-nums">{sessions}</span>
            <span className="text-gray-500 text-sm mb-1">sessions</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full transition-all duration-500"
                style={{ background: i < sessions % 8 ? accent : "#1f1f23" }} />
            ))}
          </div>
        </div>

        {/* Library */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-3 shrink-0">Library</p>
          <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
            {favorites.length === 0 ? (
              <p className="text-[11px] text-gray-700 italic text-center py-8">No saved tracks yet.</p>
            ) : (
              favorites.map((f, i) => (
                <div key={i} className="group flex items-center gap-2 p-2.5 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.05] transition-all">
                  <div className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                  <button onClick={() => { setVideoId(f.id); setSidebarOpen(false); }}
                    className="flex-1 text-left text-[11px] text-gray-400 group-hover:text-white truncate transition-colors font-medium">
                    {f.title}
                  </button>
                  <button onClick={() => setFavorites(favorites.filter((fav) => fav.id !== f.id))}
                    className="text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* About link */}
        <button onClick={() => { setShowAbout(true); setSidebarOpen(false); }}
          className="flex items-center gap-2 text-[11px] text-gray-600 hover:text-gray-300 transition-colors pt-4 border-t border-white/[0.06]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
          About Focusify v8
        </button>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 overflow-y-auto flex flex-col min-w-0">

        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] md:hidden shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
          <span className="font-bold text-sm tracking-tight">Focusify</span>
          <div className="w-9" />
        </div>

        {/* Content grid */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-5 md:p-8 lg:p-10">

          {/* ── LEFT PANEL ── */}
          <div className="flex flex-col gap-5 lg:w-80 xl:w-[340px] shrink-0">

            {/* Pomodoro card */}
            <div className="bg-[#0d0d0f] border border-white/[0.07] rounded-3xl p-7 flex flex-col items-center">

              {/* Mode tabs */}
              <div className="flex gap-1 p-1 bg-black/40 rounded-full border border-white/[0.06] mb-7 w-full">
                {(Object.keys(MODES) as Mode[]).map((m) => (
                  <button key={m} onClick={() => changeMode(m)}
                    className="flex-1 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-full transition-all duration-200"
                    style={mode === m ? { background: MODES[m].color, color: "white" } : { color: "#555" }}>
                    {MODES[m].label}
                  </button>
                ))}
              </div>

              {/* Circular ring */}
              <div className="relative flex items-center justify-center mb-7">
                <svg width="196" height="196" className="-rotate-90" style={{ filter: `drop-shadow(0 0 20px ${accent}40)` }}>
                  <circle cx="98" cy="98" r={radius} fill="none" stroke="#1a1a1e" strokeWidth="5" />
                  <circle cx="98" cy="98" r={radius} fill="none" stroke={accent} strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                    className="transition-all duration-1000" />
                </svg>
                <div className="absolute flex flex-col items-center select-none">
                  <span className="text-5xl font-mono font-black tabular-nums tracking-tighter">{formatTime(seconds)}</span>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mt-1">
                    {isActive ? "In session" : "Ready"}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-2.5 w-full">
                <button onClick={() => changeMode(mode)}
                  className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] transition-colors text-gray-500 hover:text-white">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                  </svg>
                </button>
                <button onClick={() => setIsActive(!isActive)}
                  className="flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
                  style={isActive
                    ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }
                    : { background: accent, color: "white" }}>
                  {isActive ? "Pause" : "Start"}
                </button>
              </div>
            </div>

            {/* Search card */}
            <div className="bg-[#0d0d0f] border border-white/[0.07] rounded-3xl p-5">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-3">Search Music</p>
              <div className="flex gap-2">
                <input type="text" placeholder="lofi, rain, ambient..."
                  className="flex-1 bg-black/40 border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-white/20 transition-colors"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchYoutube(input)} />
                <button onClick={() => searchYoutube(input)}
                  className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                  style={{ background: accent }}>
                  {loading ? "···" : "Go"}
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="flex-1 flex flex-col gap-5 min-w-0">

            {/* Search results */}
            {results.length > 0 && (
              <div className="bg-[#0d0d0f] border border-white/[0.07] rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Results</p>
                  <button onClick={() => setResults([])} className="text-[10px] text-gray-600 hover:text-white transition-colors">Clear</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {results.map((item) => (
                    <div key={item.id.videoId} className="group relative">
                      <div onClick={() => { setVideoId(item.id.videoId); setResults([]); }}
                        className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.06] cursor-pointer group-hover:border-white/20 transition-all">
                        <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="#000" className="ml-0.5"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-start gap-1">
                        <p className="flex-1 text-[10px] text-gray-400 leading-relaxed line-clamp-2">{item.snippet.title}</p>
                        <button onClick={() => saveToLibrary(item.id.videoId, item.snippet.title)}
                          title="Save to library"
                          className="shrink-0 mt-0.5 text-gray-600 hover:text-white transition-colors">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Player */}
            <div className="flex-1 bg-[#0d0d0f] border border-white/[0.07] rounded-3xl overflow-hidden min-h-56">
              <iframe key={videoId} className="w-full h-full min-h-56"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
                allow="autoplay; encrypted-media" allowFullScreen />
            </div>

          </div>
        </div>
      </div>

      {/* ── ABOUT MODAL ── */}
      {showAbout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
          <div className="bg-[#0d0d0f] border border-white/[0.08] p-8 rounded-3xl max-w-md w-full relative shadow-2xl">
            <button onClick={() => setShowAbout(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.05] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight">Focusify</h2>
                <p className="text-[10px] text-gray-500">Stable v8.0</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              A minimalist cockpit for deep work. Pomodoro technique meets YouTube ambient music. Built with Next.js and YouTube Data API.
            </p>
            <div className="mt-5 pt-5 border-t border-white/[0.06]">
              <p className="text-[11px] text-gray-600 italic">Discipline equals freedom.</p>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}