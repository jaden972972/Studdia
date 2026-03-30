"use client";
import { useEffect, useState } from "react";

interface Track { id: string; title: string }
interface Playlist { id: string; name: string; tracks: Track[] }

interface Props {
  onPlay?: (videoId: string) => void;
}

export default function PlaylistPanel({ onPlay }: Props) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/playlists")
      .then((r) => r.json())
      .then((data) => { if (data.playlists) setPlaylists(data.playlists); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Playlists</p>

      {playlists.length === 0 ? (
        <p className="text-[11px] text-gray-700 italic py-2">
          No playlists found. Add tracks in the cockpit.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {playlists.map((pl) => {
            const isOpen = expanded === pl.id;
            return (
              <div key={pl.id}>
                {/* Header row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : pl.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors text-left"
                >
                  <svg
                    width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-600 transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                  <span className="flex-1 text-xs font-semibold text-gray-300 truncate">{pl.name}</span>
                  <span className="text-[9px] text-gray-600 shrink-0">{pl.tracks.length}</span>
                </button>

                {/* Tracks */}
                {isOpen && (
                  <div className="ml-5 flex flex-col gap-0.5 pb-1">
                    {pl.tracks.length === 0 ? (
                      <p className="text-[10px] text-gray-700 italic px-3 py-1.5">Empty playlist.</p>
                    ) : (
                      pl.tracks.map((t, i) => (
                        <button
                          key={t.id}
                          onClick={() => onPlay?.(t.id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors text-left group"
                        >
                          <svg
                            width="9" height="9" viewBox="0 0 24 24" fill="currentColor"
                            className="shrink-0 text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors truncate">
                            {i + 1}. {t.title}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
