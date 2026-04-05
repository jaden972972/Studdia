"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import LogoStuddia from "@/app/components/LogoStuddia";
import { useTheme } from "@/app/providers";

interface NavbarProps {
  onTimer?: () => void;
  onLeague?: () => void;
  onVideo?: () => void;
}

const NAV_ITEMS = [
  { label: "Timer",      key: "timer"  },
  { label: "Ligas",      key: "league" },
  { label: "Modo Video", key: "video"  },
] as const;

export default function Navbar({ onTimer, onLeague, onVideo }: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handlers: Record<string, (() => void) | undefined> = {
    timer:  onTimer,
    league: onLeague,
    video:  onVideo,
  };

  const navItemClass = isDark
    ? "px-4 py-2 rounded-xl text-[13px] font-semibold text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
    : "px-4 py-2 rounded-xl text-[13px] font-semibold text-gray-500 hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-all duration-200";

  return (
    <nav
      style={{
        background: isDark ? "#000000" : "#FFFFFF",
        borderBottom: isDark
          ? "1px solid rgba(255,0,255,0.10)"
          : "1px solid rgba(0,0,0,0.08)",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
        opacity:   mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(-10px)",
        transition: "opacity 0.45s ease, transform 0.45s ease, background 0.3s ease, border-color 0.3s ease",
      }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-14"
    >
      {/* Logo + wordmark */}
      <Link
        href="/"
        className="flex items-center gap-3 shrink-0 group"
        aria-label="Studdia — inicio"
      >
        <LogoStuddia size={50} glowIntensity={isDark ? "soft" : "soft"} />
        <span
          className="text-lg font-black tracking-tight hidden sm:inline group-hover:opacity-80 transition-opacity"
          style={{ color: isDark ? "#ffffff" : "#1D1D1F" }}
        >
          Studdia
        </span>
      </Link>

      {/* Nav shortcuts + theme toggle */}
      <div className="flex items-center gap-0.5">
        {NAV_ITEMS.map(({ label, key }) => {
          const handler = handlers[key];
          return handler ? (
            <button key={key} onClick={handler} className={navItemClass}>
              {label}
            </button>
          ) : (
            <Link key={key} href="/cockpit" className={navItemClass}>
              {label}
            </Link>
          );
        })}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Modo claro" : "Modo oscuro"}
          className="ml-2 w-8 h-8 flex items-center justify-center rounded-xl border transition-all duration-200"
          style={
            isDark
              ? { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "#9ca3af" }
              : { background: "rgba(0,0,0,0.04)", borderColor: "rgba(0,0,0,0.08)", color: "#6E6E73" }
          }
        >
          {isDark
            ? /* sun */
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            : /* moon */
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
          }
        </button>
      </div>
    </nav>
  );
}
