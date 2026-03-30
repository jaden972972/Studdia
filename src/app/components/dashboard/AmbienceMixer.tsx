"use client";
import { useRef, useState, useEffect } from "react";

interface SoundLayer {
  id: string;
  label: string;
  glyph: string;
  color: string;
  // Replace these URLs with your own CDN-hosted looping ambient sounds
  src: string;
}

const SOUNDS: SoundLayer[] = [
  {
    id: "rain",
    label: "Rain",
    glyph: "M20 17.58A5 5 0 0018 8h-1.26A8 8 0 104 16.25M8 16h.01M8 20h.01M12 18h.01M12 22h.01M16 16h.01M16 20h.01",
    color: "#3b82f6",
    src: "https://cdn.freesound.org/previews/346/346170_5121236-lq.mp3",
  },
  {
    id: "forest",
    label: "Forest",
    glyph: "M17 21v-2a4 4 0 00-8 0v2M12 11a4 4 0 100-8 4 4 0 000 8zM7 7H4a2 2 0 00-2 2v4a2 2 0 002 2h1M17 7h3a2 2 0 012 2v4a2 2 0 01-2 2h-1",
    color: "#10b981",
    src: "https://cdn.freesound.org/previews/612/612840_6142149-lq.mp3",
  },
  {
    id: "cafe",
    label: "Lo-Fi Cafe",
    glyph: "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3",
    color: "#f59e0b",
    src: "https://cdn.freesound.org/previews/462/462068_4766646-lq.mp3",
  },
];

export default function AmbienceMixer() {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [volumes, setVolumes] = useState<Record<string, number>>({ rain: 0.5, forest: 0.5, cafe: 0.5 });

  useEffect(() => {
    SOUNDS.forEach((s) => {
      const audio = new Audio(s.src);
      audio.loop = true;
      audio.volume = 0.5;
      audioRefs.current[s.id] = audio;
    });
    return () => {
      Object.values(audioRefs.current).forEach((a) => { a.pause(); a.src = ""; });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id: string) => {
    const audio = audioRefs.current[id];
    if (!audio) return;
    if (active[id]) {
      audio.pause();
      setActive((v) => ({ ...v, [id]: false }));
    } else {
      audio.play().catch(() => {});
      setActive((v) => ({ ...v, [id]: true }));
    }
  };

  const setVol = (id: string, vol: number) => {
    const audio = audioRefs.current[id];
    if (audio) audio.volume = vol;
    setVolumes((v) => ({ ...v, [id]: vol }));
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Ambience Mixer</p>
      {SOUNDS.map((s) => {
        const on = !!active[s.id];
        return (
          <div key={s.id} className="flex items-center gap-3">
            {/* Toggle button */}
            <button
              onClick={() => toggle(s.id)}
              className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border transition-all duration-200"
              style={
                on
                  ? { background: `${s.color}20`, borderColor: `${s.color}50`, color: s.color, boxShadow: `0 0 12px ${s.color}30` }
                  : { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", color: "#444" }
              }
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={s.glyph} />
              </svg>
            </button>

            {/* Label + slider */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold" style={{ color: on ? "white" : "#555" }}>
                  {s.label}
                </span>
                {on && (
                  <div className="flex items-end gap-[2px]">
                    {[1, 2, 3].map((b) => (
                      <span
                        key={b}
                        className="inline-block w-[2px] rounded-full animate-bounce"
                        style={{ height: `${4 + b * 2}px`, background: s.color, animationDelay: `${b * 0.12}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volumes[s.id] ?? 0.5}
                onChange={(e) => setVol(s.id, parseFloat(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: s.color, opacity: on ? 1 : 0.25 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
