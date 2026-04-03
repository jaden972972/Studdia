"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const MODES = {
  FOCUS: { label: "Focus", minutes: 25, color: "#8b5cf6" },
  SHORT: { label: "Break", minutes: 5, color: "#10b981" },
  LONG:  { label: "Long Break", minutes: 15, color: "#3b82f6" },
} as const;

type Mode = keyof typeof MODES;
type Track = { id: string; title: string };
type Playlist = { id: string; name: string; tracks: Track[] };

const SUBJECT_PLAYLISTS: Playlist[] = [
  { id: "subj-music", name: "Music", tracks: [
    { id: "jfKfPfyJRdk", title: "Lofi Hip Hop Radio – Beats to Relax/Study" },
    { id: "Jya0o8Ignas", title: "Study  – Songs" },
    { id: "4xDzrJKXOOY", title: "Synthwave Radio – Beats to Study/Work" },
  ]},
  { id: "subj-english", name: "English", tracks: [
    { id: "AaRhgWg2R4o", title: "English for Beginners – Basic Vocabulary" },
    { id: "dAz3UmAKvDU", title: "Learn English Grammar: Present Simple" },
    { id: "ffpjmXnEbKE", title: " How To Remember English Tenses – Full Lesson" },
  ]},
  { id: "subj-maths", name: "Maths", tracks: [
    { id: "lGfsp2CWjok", title: "Introduction to Functions – Maths" },
    { id: "LGqBQrUYua4", title: "Long Division – Maths Antics" },
    { id: "MpdcRU-zFmw", title: "2nd grade equations – Maths " },
  ]},
  { id: "subj-geo-history", name: "Geography & History", tracks: [
    { id: "QRTdVWDY_Qk", title: "What is Geography? – Crooked Contours" },
    { id: "flvYNFLp0iQ", title: "Economic Geography – Basics" },
    { id: "w6go2zSGCXo", title: "Ancient Technologies – World History" },
  ]},
  { id: "subj-spanish", name: "Spanish", tracks: [
    { id: "aUl9JlBoKpc", title: "El Lazarillo de Tormes – Resumen" },
    { id: "kkUAwRWTqrI", title: "Oraciones subordinadas – Gramática" },
    { id: "PbFiv140R_4", title: "La Celestina – Resumen explicativo" },
  ]},
  { id: "subj-biology", name: "Biology & Geology", tracks: [
    { id: "QnQe0xW_JY4", title: "Evolution & Natural Selection – CrashCourse" },
    { id: "8IlzKri08kk", title: "Introduction to Cells – Biology" },
    { id: "pHgEhgSV14I", title: "Geology  – Geology" },
  ]},
  { id: "subj-physics", name: "Physics & Chemistry", tracks: [
    { id: "kKKM8Y-u7ds", title: "Newton's Laws of Motion – Physics" },
    { id: "wXRHz5ZEIK0", title: "The Periodic Table Explained" },
    { id: "5iTOphGnCtg", title: "Introduction to Chemistry – Science" },
  ]},
  { id: "subj-tech", name: "Technology & Digitalization", tracks: [
    { id: "AkYDsiRVqno", title: "How Does the Internet Work?" },
    { id: "kqtD5dpn9C8", title: "Introduction to Python – Python Basics" },
    { id: "OAx_6-wdslM", title: "What is Artificial Intelligence?" },
  ]},
  { id: "subj-concentracion", name: "Study Mode", tracks: [
    { id: "PqxC0YT2BeU", title: "ALPHA WAVES – 6 Hours Study Music" },
  ]},
];
const DEFAULT_PLAYLISTS: Playlist[] = [...SUBJECT_PLAYLISTS];

export default function Home() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showResetPlaylists, setShowResetPlaylists] = useState(false);

  const [videoId, setVideoId] = useState("ZbQh1ZPG5pc");
  const [input, setInput] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Playlist state ──
  const [playlists, setPlaylists] = useState<Playlist[]>(DEFAULT_PLAYLISTS);
  const [activePlaylistId, setActivePlaylistId] = useState<string>("subj-music");
  const [currentTrackIdx, setCurrentTrackIdx] = useState(-1);
  const [expandedId, setExpandedId] = useState<string | null>("subj-music");
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [saveMenuFor, setSaveMenuFor] = useState<string | null>(null);
  const [loopPlaylist, setLoopPlaylist] = useState(false);
  const [showPlayer, setShowPlayer] = useState(true);

  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  const playerRef = useRef<any>(null);
  const loopRef = useRef(false);
  const activeTracksRef = useRef<Track[]>([]);
  const trackIdxRef = useRef(-1);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);
  const sessionRef = useRef(session);
  useEffect(() => { sessionRef.current = session; }, [session]);

  // Derive active tracks from current active playlist
  const activeTracks = playlists.find(p => p.id === activePlaylistId)?.tracks ?? [];

  useEffect(() => { loopRef.current = loopPlaylist; }, [loopPlaylist]);
  useEffect(() => { activeTracksRef.current = activeTracks; }, [activeTracks]);
  useEffect(() => { trackIdxRef.current = currentTrackIdx; }, [currentTrackIdx]);

  const [mode, setMode] = useState<Mode>("FOCUS");
  const [seconds, setSeconds] = useState(MODES.FOCUS.minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);

  const totalSeconds = MODES[mode].minutes * 60;
  const progress = 1 - seconds / totalSeconds;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const accent = MODES[mode].color;

  // ── YT IFrame API ──
  const initPlayer = () => {
    if (!document.getElementById("yt-player")) return;
    playerRef.current = new (window as any).YT.Player("yt-player", {
      videoId,
      playerVars: { autoplay: 1, modestbranding: 1, rel: 0 },
      events: {
        onStateChange: (e: any) => {
          if (e.data === 0 && loopRef.current) {
            const tracks = activeTracksRef.current;
            if (tracks.length === 0) return;
            const nextIdx = (trackIdxRef.current + 1) % tracks.length;
            trackIdxRef.current = nextIdx;
            setCurrentTrackIdx(nextIdx);
            setVideoId(tracks[nextIdx].id);
          }
        },
      },
    });
  };

  useEffect(() => {
    if ((window as any).YT?.Player) {
      initPlayer();
    } else {
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }
    return () => { playerRef.current?.destroy?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load new video in existing player instead of remounting iframe
  useEffect(() => {
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  const playRandom = () => {
    if (activeTracks.length === 0) return;
    const idx = Math.floor(Math.random() * activeTracks.length);
    setCurrentTrackIdx(idx);
    setVideoId(activeTracks[idx].id);
    setSidebarOpen(false);
  };

  // ── Playlist helpers ──
  const createPlaylist = () => {
    const name = newPlaylistName.trim();
    if (!name) return;
    const pl: Playlist = { id: Date.now().toString(), name, tracks: [] };
    setPlaylists(prev => [...prev, pl]);
    setExpandedId(pl.id);
    setNewPlaylistName("");
    setShowNewPlaylist(false);
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(prev => {
      const next = prev.filter(p => p.id !== id);
      if (activePlaylistId === id && next.length > 0) {
        setActivePlaylistId(next[0].id);
        setCurrentTrackIdx(-1);
      }
      return next;
    });
  };

  const addToPlaylist = (playlistId: string, track: Track) => {
    setPlaylists(prev => prev.map(p =>
      p.id === playlistId && !p.tracks.find(t => t.id === track.id)
        ? { ...p, tracks: [...p.tracks, track] }
        : p
    ));
    setSaveMenuFor(null);
  };

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(p =>
      p.id === playlistId ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) } : p
    ));
    if (activePlaylistId === playlistId) setCurrentTrackIdx(-1);
  };

  const playFromPlaylist = (playlistId: string, trackIdx: number) => {
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl || !pl.tracks[trackIdx]) return;
    setActivePlaylistId(playlistId);
    setCurrentTrackIdx(trackIdx);
    setVideoId(pl.tracks[trackIdx].id);
    setSidebarOpen(false);
  };

  const changeMode = (newMode: Mode) => {
    setMode(newMode);
    setSeconds(MODES[newMode].minutes * 60);
    setIsActive(false);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds((s) => s - 1), 1000);
      document.title = `(${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}) Studdia`;
    } else if (seconds === 0) {
      setIsActive(false);
      if (mode === "FOCUS") setSessions((s) => s + 1);
      document.title = "Studdia";
      // Play a soft two-tone chime via Web Audio API
      try {
        const ctx = new AudioContext();
        const play = (freq: number, start: number, dur: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
          gain.gain.setValueAtTime(0, ctx.currentTime + start);
          gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
          osc.start(ctx.currentTime + start);
          osc.stop(ctx.currentTime + start + dur);
        };
        play(880, 0, 0.6);
        play(660, 0.35, 0.8);
      } catch (_) {}
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, mode]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Load playlists: Supabase if logged in, localStorage otherwise
  useEffect(() => {
    if (session === undefined) return;
    initializedRef.current = false;

    const load = async () => {
      let loaded = false;

      if (session?.user) {
        try {
          const res = await fetch("/api/playlists");
          const data = await res.json();
          if (data.playlists) {
            const saved: Playlist[] = data.playlists;
            const existingIds = new Set(saved.map((p: Playlist) => p.id));
            const missing = DEFAULT_PLAYLISTS.filter(p => !existingIds.has(p.id));
            const merged = saved.map((p: Playlist) => {
              const def = DEFAULT_PLAYLISTS.find(d => d.id === p.id);
              return p.tracks.length === 0 && def && def.tracks.length > 0 ? { ...p, tracks: def.tracks } : p;
            });
            setPlaylists([...merged, ...missing]);
            loaded = true;
          }
        } catch (e) {
          console.error("Error loading playlists from Supabase:", e);
        }
      }

      if (!loaded) {
        const local = localStorage.getItem("studdia_playlists_v1");
        if (local) {
          try {
            const parsed: Playlist[] = JSON.parse(local);
            const existingIds = new Set(parsed.map((p: Playlist) => p.id));
            const missing = DEFAULT_PLAYLISTS.filter(p => !existingIds.has(p.id));
            const merged = parsed.map((p: Playlist) => {
              const def = DEFAULT_PLAYLISTS.find(d => d.id === p.id);
              return p.tracks.length === 0 && def && def.tracks.length > 0 ? { ...p, tracks: def.tracks } : p;
            });
            setPlaylists([...merged, ...missing]);
          } catch {
            localStorage.removeItem("studdia_playlists_v1");
          }
        }
      }

      setTimeout(() => { initializedRef.current = true; }, 0);
    };

    load();
  }, [session]);

  // Save playlists: always localStorage + Supabase (debounced) when logged in
  useEffect(() => {
    if (!initializedRef.current) return;
    localStorage.setItem("studdia_playlists_v1", JSON.stringify(playlists));
    if (sessionRef.current?.user) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        fetch("/api/playlists", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playlists }),
        }).catch(e => console.error("Error saving playlists:", e));
      }, 1500);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [playlists]);

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
      <aside className={`fixed inset-y-0 left-0 z-50 w-[22rem] flex flex-col border-r border-white/[0.06] bg-[#0c0c0e] p-6 gap-5
        transition-[transform,opacity] duration-500 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 md:flex shrink-0
        ${isActive ? "opacity-20 hover:opacity-100" : "opacity-100"}`}>

        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Logo: eye + lightning bolt */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-500" style={{ background: accent }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight leading-none">Studdia</span>
              <span className="text-[9px] text-gray-500 tracking-wide leading-none mt-0.5">No ads &nbsp;·&nbsp; Study In Peace.</span>
            </div>
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

        {/* Playlists */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Playlists</p>
            <div className="flex items-center gap-1">
              <button onClick={playRandom} title="Play random from active playlist"
                className="p-1.5 rounded-lg transition-colors text-gray-600 hover:text-white hover:bg-white/[0.05] disabled:opacity-30"
                disabled={activeTracks.length === 0}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
                </svg>
              </button>
              <button onClick={() => setLoopPlaylist(v => !v)} title="Loop playlist"
                className="p-1.5 rounded-lg transition-all"
                style={loopPlaylist ? { background: `${accent}22`, color: accent } : { color: "#444" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/>
                  <path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                </svg>
              </button>
              <button onClick={() => setShowNewPlaylist(v => !v)} title="New playlist"
                className="p-1.5 rounded-lg transition-colors text-gray-600 hover:text-white hover:bg-white/[0.05]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </button>
            </div>
          </div>

          {/* New playlist input */}
          {showNewPlaylist && (
            <div className="flex gap-1.5 mb-3 shrink-0">
              <input autoFocus type="text" placeholder="Playlist name..."
                className="flex-1 bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-[11px] text-white placeholder:text-gray-600 outline-none focus:border-white/20 transition-colors"
                value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createPlaylist()} />
              <button onClick={createPlaylist}
                className="px-3 py-2 rounded-xl text-[10px] font-black transition-all active:scale-95"
                style={{ background: accent }}>OK</button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
            {playlists.map(pl => {
              const isActive = pl.id === activePlaylistId;
              const isExpanded = expandedId === pl.id;
              return (
                <div key={pl.id}>
                  {/* Playlist header row */}
                  <div className="flex items-center gap-2 group cursor-pointer px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : pl.id)}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ color: isActive ? accent : "#555", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                    <span className="flex-1 text-sm font-bold truncate" style={{ color: "white" }}>
                      {pl.name}
                    </span>
                    <span className="text-[9px] text-gray-600">{pl.tracks.length}</span>
                    <button onClick={e => { e.stopPropagation(); deletePlaylist(pl.id); }}
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all shrink-0 p-1 -mr-1 touch-manipulation">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                  </div>

                  {/* Tracks list */}
                  {isExpanded && (
                    <div className="ml-4 space-y-0.5">
                      {pl.tracks.length === 0 ? (
                        <p className="text-[10px] text-gray-700 italic px-2 py-2">Empty. Add tracks from search.</p>
                      ) : (
                        pl.tracks.map((t, i) => {
                          const isPlaying = isActive && i === currentTrackIdx;
                          return (
                            <div key={t.id} className="group/track flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors"
                              style={isPlaying ? { background: `${accent}10` } : {}}>
                              <button onClick={() => playFromPlaylist(pl.id, i)}
                                className="flex-1 text-left text-[11px] truncate font-medium transition-colors"
                                style={{ color: isPlaying ? "white" : "#777" }}>
                                {isPlaying ? (
                                  <span className="inline-flex items-end gap-[2px] mr-1">
                                    {[1,2,3].map(b => (
                                      <span key={b} className="inline-block w-[2px] rounded-full animate-bounce"
                                        style={{ height: `${5 + b * 1.5}px`, background: accent, animationDelay: `${b * 0.15}s` }} />
                                    ))}
                                  </span>
                                ) : null}
                                {t.title}
                              </button>
                              <button onClick={() => removeFromPlaylist(pl.id, t.id)}
                                className="opacity-100 md:opacity-0 md:group-hover/track:opacity-100 text-gray-600 hover:text-red-400 transition-all shrink-0 p-1 -mr-1 touch-manipulation">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer links */}
        <div className="flex flex-col gap-2 pt-4 border-t border-white/[0.06]">
          {/* User info + sign out */}
          {session?.user && (
            <div className="flex items-center gap-2 mb-1">
              {session.user.image && (
                <img src={session.user.image} alt="" className="w-6 h-6 rounded-full shrink-0" />
              )}
              <span className="text-[10px] text-gray-500 truncate flex-1">{session.user.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Sign out"
                className="text-gray-700 hover:text-red-400 transition-colors shrink-0"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button onClick={() => { setShowAbout(true); setSidebarOpen(false); }}
              className="flex items-center gap-2 text-[11px] text-gray-600 hover:text-gray-300 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
              About v9
            </button>
            <Link href="/" className="flex items-center gap-1.5 text-[11px] text-gray-600 hover:text-gray-300 transition-colors">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Home
            </Link>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
            <Link href="/tasks"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold text-gray-400 hover:text-violet-400 hover:bg-violet-400/5 border border-white/[0.07] hover:border-violet-400/20 transition-all">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              Tasks
            </Link>
            <button onClick={() => setShowResetPlaylists(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] text-gray-600 hover:text-yellow-400 hover:bg-yellow-400/5 border border-white/[0.05] hover:border-yellow-400/20 transition-all">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" /></svg>
              Reset playlists
            </button>
            {session?.user && (
              <button onClick={() => setShowDeleteAccount(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] text-gray-600 hover:text-red-400 hover:bg-red-400/5 border border-white/[0.05] hover:border-red-400/20 transition-all">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                Delete account
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 overflow-y-auto flex flex-col min-w-0">

        {/* ── TOPBAR ── */}
        <header className="shrink-0 flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/[0.05]">
          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] transition-colors md:hidden">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>

          {/* Brand — always visible */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-500" style={{ background: accent }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight leading-none">Studdia</span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md transition-colors duration-500 hidden sm:inline leading-none"
                  style={{ background: `${accent}22`, color: accent }}>
                  {MODES[mode].label}
                </span>
              </div>
              <span className="text-[9px] text-gray-600 tracking-wide leading-none mt-0.5 hidden sm:block">No ads &nbsp;·&nbsp; Study In Peace.</span>
            </div>
          </div>

          {/* Right side — session pill + user avatar */}
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full transition-colors duration-300" style={{ background: isActive ? accent : "#333" }} />
              <span>{isActive ? "In session" : "Ready"}</span>
              <span className="font-bold text-white ml-1">{sessions} <span className="font-normal text-gray-600">sessions</span></span>
            </div>
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name ?? "User"}
                title={session.user.name ?? ""}
                className="w-7 h-7 rounded-full border border-white/10 shrink-0"
              />
            )}
          </div>
        </header>

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
                <input type="text" placeholder="Search videos..."
                  className="flex-1 bg-black/40 border border-white/[0.07] rounded-xl px-3 py-2 text-xs md:text-sm text-white placeholder:text-gray-600 outline-none focus:border-white/20 transition-colors"
                  style={{ fontSize: '16px' }}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchYoutube(input)} />
                <button onClick={() => searchYoutube(input)}
                  className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shrink-0"
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
                  {results.map((item) => {
                    const vid = item.id.videoId;
                    const title = item.snippet.title;
                    return (
                      <div key={vid} className="group relative">
                        <div onClick={() => { setVideoId(vid); setResults([]); }}
                          className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.06] cursor-pointer group-hover:border-white/20 transition-all">
                          <img src={item.snippet.thumbnails.medium.url} alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="#000" className="ml-0.5"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                          </div>
                        </div>
                        <div className="mt-1.5 flex items-start gap-1 relative">
                          <p className="flex-1 text-[10px] text-gray-400 leading-relaxed line-clamp-2">{title}</p>
                          {/* Save to playlist button + dropdown */}
                          <div className="relative shrink-0">
                            <button
                              onClick={() => setSaveMenuFor(saveMenuFor === vid ? null : vid)}
                              title="Guardar en lista"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border mt-0.5"
                              style={saveMenuFor === vid
                                ? { background: `${accent}22`, color: accent, borderColor: `${accent}50` }
                                : { color: "#888", background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" />
                              </svg>
                              Save
                            </button>
                            {saveMenuFor === vid && (
                              <div className="absolute right-0 bottom-full mb-1 z-50 bg-[#111] border border-white/[0.1] rounded-xl shadow-2xl py-1 w-52 max-h-48 overflow-y-auto">
                                {playlists.map(pl => (
                                  <button key={pl.id} onClick={() => addToPlaylist(pl.id, { id: vid, title })}
                                    className="w-full text-left px-3 py-2.5 text-[11px] text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors truncate">
                                    {pl.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Player */}
            <div className="bg-[#0d0d0f] border border-white/[0.07] rounded-3xl overflow-hidden relative"
              style={{ flex: showPlayer ? "1" : "0 0 auto" }}>
              {/* Header bar with toggle */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05]">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Player</p>
                <button
                  onClick={() => setShowPlayer(v => !v)}
                  title={showPlayer ? "Hide video" : "Show video"}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold text-gray-500 hover:text-white hover:bg-white/[0.05] transition-all">
                  {showPlayer ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"/></svg>
                      Hide
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      Show
                    </>
                  )}
                </button>
              </div>
              <div className="relative w-full" style={{ display: showPlayer ? "block" : "none", aspectRatio: "16/9" }}>
                <div id="yt-player" className="absolute inset-0 w-full h-full" />
                {/* Loop & shuffle quick controls overlay */}
                {activeTracks.length > 0 && (
                  <div className="absolute bottom-3 right-3 flex gap-1.5 z-10">
                    <button onClick={playRandom} title="Play random from active playlist"
                      className="p-2 rounded-xl bg-black/60 backdrop-blur-sm border border-white/[0.08] text-gray-400 hover:text-white transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
                      </svg>
                    </button>
                    <button onClick={() => setLoopPlaylist(v => !v)} title="Loop playlist"
                      className="p-2 rounded-xl backdrop-blur-sm border transition-all"
                      style={loopPlaylist
                        ? { background: `${accent}30`, borderColor: `${accent}60`, color: accent }
                        : { background: "rgba(0,0,0,0.6)", borderColor: "rgba(255,255,255,0.08)", color: "#666" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/>
                        <path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── RESET PLAYLISTS MODAL ── */}
      {showResetPlaylists && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
          <div className="bg-[#0d0d0f] border border-white/[0.08] p-7 rounded-3xl max-w-sm w-full shadow-2xl">
            <h2 className="text-base font-black mb-2">Reset playlists?</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              All your saved videos will be deleted and the default playlists will be restored. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowResetPlaylists(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-all">
                Cancel
              </button>
              <button onClick={() => {
                localStorage.removeItem("studdia_playlists_v1");
                setPlaylists(DEFAULT_PLAYLISTS);
                setActivePlaylistId(DEFAULT_PLAYLISTS[0].id);
                setCurrentTrackIdx(-1);
                setShowResetPlaylists(false);
              }}
                className="flex-1 py-2.5 rounded-xl text-sm font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE ACCOUNT MODAL ── */}
      {showDeleteAccount && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
          <div className="bg-[#0d0d0f] border border-white/[0.08] p-7 rounded-3xl max-w-sm w-full shadow-2xl">
            <h2 className="text-base font-black mb-2 text-red-400">Delete account?</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              You will be signed out and all your local data (playlists and videos) will be deleted. To delete your Google account visit myaccount.google.com.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteAccount(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-all">
                Cancel
              </button>
              <button onClick={() => {
                localStorage.removeItem("studdia_playlists_v1");
                signOut({ callbackUrl: "/" });
              }}
                className="flex-1 py-2.5 rounded-xl text-sm font-black bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all">
                Delete & sign out
              </button>
            </div>
          </div>
        </div>
      )}

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
                <h2 className="text-base font-black tracking-tight">Studdia</h2>
                <p className="text-[10px] text-gray-500">Stable v9.0</p>
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