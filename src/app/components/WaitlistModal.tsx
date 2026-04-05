"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/app/providers";

// ─── Replace with your real email ──────────────────────────────────────────
const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/jaden972121@gmail.com";
// ───────────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

type Status = "idle" | "loading" | "success" | "error";

export default function WaitlistModal({ open, onClose }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [email, setEmail]   = useState("");
  const [error, setError]   = useState("");
  const [status, setStatus] = useState<Status>("idle");

  // ── theme tokens ──────────────────────────────────────────────────────────
  const accent       = isDark ? "#8b5cf6" : "#D100D1";
  const accentBorder = isDark ? "rgba(139,92,246,0.35)" : "rgba(209,0,209,0.25)";
  const panelBg      = isDark ? "rgba(10,8,20,0.96)" : "#FFFFFF";
  const panelBorder  = isDark ? "rgba(139,92,246,0.35)" : "#D100D1";
  const panelShadow  = isDark
    ? "0 0 0 1px rgba(139,92,246,0.15),0 0 60px rgba(139,92,246,0.2),0 24px 64px rgba(0,0,0,0.7)"
    : "0 8px 48px rgba(209,0,209,0.18),0 0 0 1px rgba(209,0,209,0.12),0 24px 64px rgba(0,0,0,0.1)";
  const textPrimary   = isDark ? "#FFFFFF" : "#1D1D1F";
  const textSecondary = isDark ? "#9ca3af" : "#6E6E73";
  const textMuted     = isDark ? "#6b7280" : "#9ca3af";
  const inputBg       = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const inputBorder   = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";

  // Magenta neón CTA (always magenta, regardless of theme)
  const ctaBg     = "#D100D1";
  const ctaShadow = "0 0 18px rgba(209,0,209,0.5),0 4px 14px rgba(209,0,209,0.35)";

  // ── keyboard close ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // ── reset on reopen ───────────────────────────────────────────────────────
  useEffect(() => {
    if (open) { setEmail(""); setError(""); setStatus("idle"); }
  }, [open]);

  // ── submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Introduce un email válido.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: trimmed,
          subject: "Nueva reserva de plaza Pro — Studdia",
          message: `Plaza Pro reservada por: ${trimmed}`,
          _template: "table",
        }),
      });
      if (!res.ok) throw new Error("network");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="wl-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md"
          />

          {/* Panel */}
          <motion.div
            key="wl-panel"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-5 pointer-events-none"
          >
            <div
              className="relative pointer-events-auto w-full max-w-md rounded-3xl p-8 flex flex-col gap-6 border"
              style={{
                background: panelBg,
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                borderColor: panelBorder,
                boxShadow: panelShadow,
              }}
            >
              {/* Close */}
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
                style={{ color: textMuted }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {status === "success" ? (
                /* ── Success state ── */
                <div className="flex flex-col gap-5 py-2">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ background: "rgba(209,0,209,0.12)", border: "1px solid rgba(209,0,209,0.3)" }}
                    >
                      🏆
                    </div>
                    <h2 className="text-xl font-black" style={{ color: textPrimary }}>
                      ¡Plaza reservada con éxito!
                    </h2>
                    <p className="text-sm font-bold" style={{ color: "#D100D1" }}>
                      Has entrado en el grupo de los primeros 20 fundadores.
                    </p>
                  </div>

                  <div
                    className="rounded-2xl p-5 flex flex-col gap-4"
                    style={{ background: inputBg, border: `1px solid ${accentBorder}` }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#D100D1" }}>
                      ¿Qué pasa ahora?
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
                      Estamos procesando las solicitudes manualmente para asegurar que la{" "}
                      <strong style={{ color: textPrimary }}>Liga Élite</strong> sea competitiva desde el primer segundo.
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
                      En los próximos días recibirás un correo personal con tu{" "}
                      <strong style={{ color: textPrimary }}>enlace de pago único (2,50€)</strong> y tus credenciales de acceso PRO.
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
                      Mientras tanto, puedes seguir usando la versión gratuita para empezar a acumular horas.{" "}
                      <strong style={{ color: textPrimary }}>¡Nos vemos en el ranking!</strong>
                    </p>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all active:scale-[0.97]"
                    style={{ background: ctaBg, boxShadow: ctaShadow }}
                  >
                    Entendido — ¡A estudiar! →
                  </button>
                </div>
              ) : (
                /* ── Form state ── */
                <>
                  {/* Badge */}
                  <div
                    className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style={{ background: `rgba(209,0,209,0.1)`, color: "#D100D1", border: "1px solid rgba(209,0,209,0.25)" }}
                  >
                    🕐 Oferta de Lanzamiento · Solo 20 plazas
                  </div>

                  {/* Title */}
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-black leading-tight" style={{ color: textPrimary }}>
                      ¡Has llegado a tiempo para la Oferta de Lanzamiento!
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
                      Las primeras <strong style={{ color: textPrimary }}>20 plazas</strong> tienen un{" "}
                      <strong style={{ color: "#D100D1" }}>50% de descuento vitalicio</strong>. Introduce tu email para reservar la tuya.
                      Te enviamos el enlace de pago privado en 24h.
                    </p>
                  </div>

                  {/* Price reminder */}
                  <div
                    className="flex items-center justify-between px-4 py-3 rounded-2xl"
                    style={{ background: inputBg, border: `1px solid ${accentBorder}` }}
                  >
                    <span className="text-xs font-bold" style={{ color: textSecondary }}>Tu precio bloqueado para siempre</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-sm line-through font-bold" style={{ color: textMuted }}>5€</span>
                      <span className="text-2xl font-black ml-2" style={{ color: "#D100D1" }}>2,50€</span>
                      <span className="text-xs" style={{ color: textMuted }}>/mes</span>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
                    <div className="flex flex-col gap-1.5">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        placeholder="tu@email.com"
                        autoFocus
                        className="w-full px-4 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all placeholder-gray-500"
                        style={{
                          background: inputBg,
                          border: `1px solid ${error ? "#ef4444" : inputBorder}`,
                          color: textPrimary,
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = accent; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = error ? "#ef4444" : inputBorder; }}
                      />
                      {error && (
                        <span className="text-[11px] text-red-400 px-1">{error}</span>
                      )}
                      {status === "error" && (
                        <span className="text-[11px] text-red-400 px-1">
                          Error al enviar. Inténtalo de nuevo o escríbenos directamente.
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.12em] text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: ctaBg, boxShadow: ctaShadow }}
                    >
                      {status === "loading" ? "Enviando…" : "RESERVAR MI PRECIO DE 2,50€ →"}
                    </button>
                  </form>

                  <p className="text-center text-[10px]" style={{ color: textMuted }}>
                    Sin spam · Solo recibirás el enlace de pago · Cancela cuando quieras
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
