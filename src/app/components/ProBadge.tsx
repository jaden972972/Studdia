"use client";

/**
 * ProBadge
 *
 * Renders the user's display name with a neon crown badge when isPro=true.
 *
 * CLIPBOARD TRICK:
 *   A <span> with font-size:0 and opacity:0 is inserted BEFORE the visible
 *   name text.  It contains " [PRO] " — visually invisible on screen, but
 *   browsers include zero-size text nodes when building the clipboard payload,
 *   so copy-pasting the name elsewhere reproduces "[PRO] Alice".
 *   The select-none class on the visual badge prevents double "[PRO][PRO]".
 */

interface ProBadgeProps {
  name: string;
  isPro: boolean;
  legendBadge?: boolean;
  /** extra classes applied to the outer wrapper */
  className?: string;
}

export default function ProBadge({ name, isPro, legendBadge, className = "" }: ProBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* ── Invisible clipboard prefix ────────────────────────────────── */}
      {isPro && (
        <span
          aria-hidden="true"
          style={{
            fontSize: 0,
            opacity: 0,
            userSelect: "all",
            position: "absolute",
            pointerEvents: "none",
          }}
        >
          {legendBadge ? "[LEYENDA] " : "[PRO] "}
        </span>
      )}

      {/* ── Visible name ─────────────────────────────────────────────── */}
      <span>{name}</span>

      {/* ── PRO crown badge ──────────────────────────────────────────── */}
      {isPro && (
        <span
          className="select-none shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest leading-none"
          style={
            legendBadge
              ? {
                  background: "rgba(251,191,36,0.12)",
                  border: "1px solid rgba(251,191,36,0.45)",
                  color: "#fbbf24",
                  textShadow:
                    "0 0 6px rgba(251,191,36,0.9), 0 0 14px rgba(251,191,36,0.5)",
                }
              : {
                  background: "rgba(139,92,246,0.12)",
                  border: "1px solid rgba(139,92,246,0.45)",
                  color: "#a78bfa",
                  textShadow:
                    "0 0 6px rgba(139,92,246,0.9), 0 0 14px rgba(139,92,246,0.5)",
                }
          }
        >
          {legendBadge ? "👑 LEYENDA" : "✦ PRO"}
        </span>
      )}
    </span>
  );
}
