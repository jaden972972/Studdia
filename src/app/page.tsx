"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [videoId, setVideoId] = useState("V2Wl4i8VvjI"); // Jocko Willink Discipline Video
  const [input, setInput] = useState(""); 
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<{id: string, title: string}[]>([]);
  
  // REEMPLAZA ESTO CON TU API KEY REAL
  const API_KEY = "AIzaSyCtV90pZuRZva5XyGkBYle_bd8t_bwLqzk"; 

  // --- 1. POMODORO LOGIC ---
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"WORK" | "SHORT" | "LONG">("WORK");

  const changeMode = (newMode: "WORK" | "SHORT" | "LONG", minutes: number) => {
    setMode(newMode);
    setSeconds(minutes * 60);
    setIsActive(false);
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds((s) => s - 1), 1000);
      document.title = `(${Math.floor(seconds/60)}:${(seconds%60).toString().padStart(2, '0')}) Focusify`;
    } else if (seconds === 0) {
      setIsActive(false);
      alert("Session completed! Stay disciplined.");
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const seg = s % 60;
    return `${min}:${seg.toString().padStart(2, '0')}`;
  };

  // --- 2. PERSISTENCE (Local Storage) ---
  useEffect(() => {
    const saved = localStorage.getItem("focusify_pro_v7");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("focusify_pro_v7", JSON.stringify(favorites));
  }, [favorites]);

  const saveToLibrary = (id: string, title: string) => {
    if (!favorites.find(f => f.id === id)) {
      setFavorites([...favorites, { id, title }]);
    }
  };

  // --- 3. YOUTUBE SEARCH ---
  const searchYoutube = async (query: string) => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${query}&type=video&key=${API_KEY}`);
      const data = await res.json();
      setResults(data.items || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <main className="flex h-screen bg-[#030303] text-white font-sans overflow-hidden">
      
      {/* ☰ MOBILE HAMBURGER BUTTON (Hidden on Desktop) */}
      <button 
        onClick={() => setMenuOpen(true)}
        className="fixed top-6 left-6 z-50 p-4 bg-white/5 border border-white/10 rounded-2xl md:hidden backdrop-blur-md"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
      </button>

      {/* 📱 SIDEBAR / DESKTOP PANEL */}
      <div className={`fixed inset-y-0 left-0 z-[60] w-72 bg-[#0a0a0a] border-r border-white/10 p-8 transform transition-transform duration-500 
        ${menuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:relative md:translate-x-0 md:flex md:flex-col shrink-0`}>
        
        <button onClick={() => setMenuOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white md:hidden">✕</button>
        
        <h3 className="text-[10px] font-black text-red-600 tracking-[0.2em] mb-10 uppercase italic">Focusify System</h3>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
          <div>
            <p className="text-[10px] text-gray-500 font-bold mb-4 uppercase tracking-widest">Library</p>
            <div className="flex flex-col gap-2">
              {favorites.length === 0 && <p className="text-[10px] text-gray-700 italic">No tracks saved.</p>}
              {favorites.map((f, i) => (
                <div key={i} className="flex gap-2 group">
                  <button onClick={() => { setVideoId(f.id); setMenuOpen(false); }} className="flex-1 text-left text-[11px] py-3 px-4 rounded-xl bg-white/5 border border-white/5 hover:border-red-600 truncate transition-all">
                    🎵 {f.title}
                  </button>
                  <button onClick={() => setFavorites(favorites.filter(fav => fav.id !== f.id))} className="text-gray-600 hover:text-red-500 px-1">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button onClick={() => { setShowAbout(true); setMenuOpen(false); }} className="mt-8 text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest pt-4 border-t border-white/5">📄 Project Specs</button>
      </div>

      {/* 🌑 MOBILE OVERLAY */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden" />}

      {/* 📄 ABOUT MODAL */}
      {showAbout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#111] border border-white/10 p-10 rounded-[3rem] max-w-xl relative">
            <button onClick={() => setShowAbout(false)} className="absolute top-6 right-8 text-gray-500 hover:text-white">Close</button>
            <h2 className="text-3xl font-black mb-4 tracking-tighter text-white">FOCUSIFY<span className="text-red-600">.</span></h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
              A minimalist **Deep Work** cockpit. Built to bridge the gap between procrastination and flow. It merges the **Pomodoro technique** with a dedicated **YouTube Search Engine** to keep you in the zone.
            </p>
            <div className="flex gap-3">
              <span className="text-[9px] font-bold bg-red-600/10 text-red-500 px-3 py-1 rounded-full border border-red-600/20">NEXT.JS 14</span>
              <span className="text-[9px] font-bold bg-blue-600/10 text-blue-500 px-3 py-1 rounded-full border border-blue-600/20">YOUTUBE API v3</span>
            </div>
          </div>
        </div>
      )}

      {/* 🏗️ MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#050505] to-[#030303] flex flex-col items-center p-6 md:p-12 custom-scrollbar">
        
        {/* TIMER PANEL */}
        <div className="mb-10 bg-white/[0.02] border border-white/10 backdrop-blur-3xl p-8 rounded-[3rem] flex flex-col items-center w-full max-w-sm shadow-[0_30px_100px_-20px_rgba(0,0,0,1)]">
          <div className="flex gap-2 mb-6 bg-black/50 p-1 rounded-full border border-white/5">
            <button onClick={() => changeMode("WORK", 25)} className={`text-[9px] px-5 py-2 rounded-full font-black transition-all ${mode === "WORK" ? "bg-red-600 text-white" : "text-gray-500 hover:text-white"}`}>FOCUS</button>
            <button onClick={() => changeMode("SHORT", 5)} className={`text-[9px] px-5 py-2 rounded-full font-black transition-all ${mode === "SHORT" ? "bg-green-600 text-white" : "text-gray-500 hover:text-white"}`}>SHORT</button>
            <button onClick={() => changeMode("LONG", 15)} className={`text-[9px] px-5 py-2 rounded-full font-black transition-all ${mode === "LONG" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-white"}`}>LONG</button>
          </div>
          <h2 className="text-7xl font-mono font-black mb-6 tabular-nums tracking-tighter text-white">{formatTime(seconds)}</h2>
          <button onClick={() => setIsActive(!isActive)} className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 ${isActive ? "bg-white/10 text-white border border-white/20" : "bg-white text-black shadow-xl hover:bg-gray-200"}`}>
            {isActive ? "PAUSE SESSION" : "START FOCUSING"}
          </button>
        </div>

        {/* SEARCH ENGINE */}
        <div className="w-full max-w-3xl mb-10">
          <div className="flex gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 focus-within:border-red-600/50 transition-all mb-4 group">
            <input 
              type="text" placeholder="Search focus music, rain, lofi..." 
              className="bg-transparent flex-1 px-4 py-2 outline-none text-sm text-white placeholder:text-gray-600"
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchYoutube(input)}
            />
            <button onClick={() => searchYoutube(input)} className="bg-red-600 hover:bg-red-500 px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              {loading ? "..." : "SEARCH"}
            </button>
          </div>

          {results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-black/40 p-6 rounded-[2.5rem] border border-white/10 animate-in fade-in slide-in-from-top-4">
              {results.map((item) => (
                <div key={item.id.videoId} className="group relative flex flex-col gap-2">
                  <div onClick={() => { setVideoId(item.id.videoId); setResults([]); }} className="aspect-video overflow-hidden rounded-xl border border-white/10 cursor-pointer group-hover:border-red-600 transition-all">
                    <img src={item.snippet.thumbnails.medium.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <button 
                    onClick={() => saveToLibrary(item.id.videoId, item.snippet.title)}
                    className="absolute top-2 right-2 bg-black/90 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 scale-90"
                  >
                    💾
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PLAYER */}
        <div className="w-full max-w-5xl aspect-video rounded-[3rem] overflow-hidden border border-white/5 shadow-[0_40px_100px_-30px_rgba(0,0,0,1)] bg-black mb-12 shrink-0">
          <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`} allow="autoplay; encrypted-media" allowFullScreen></iframe>
        </div>

      </div>
    </main>
  );
}