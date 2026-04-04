"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface ProModalProps {
  open: boolean;
  onClose: () => void;
}

const FEATURES = [
  { icon: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11", label: "Unlimited tasks" },
  { icon: "M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z", label: "Unlimited custom playlists" },
  { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label: "Premium focus plants" },
  { icon: "M13 2L4 14h7l-1 8 9-12h-7l1-8z", label: "Zero limits. Pure focus." },
];

export default function ProModal({ open, onClose }: ProModalProps) {
  const router = useRouter();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-5 pointer-events-none"
          >
            <div
              className="relative pointer-events-auto w-full max-w-sm rounded-3xl p-8 flex flex-col gap-6 border"
              style={{
                background: "rgba(10, 8, 20, 0.85)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                borderColor: "rgba(139, 92, 246, 0.35)",
                boxShadow:
                  "0 0 0 1px rgba(139,92,246,0.15), 0 0 60px rgba(139,92,246,0.2), 0 24px 64px rgba(0,0,0,0.7)",
              }}
            >
              {/* Glow orb */}
              <div
                className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)" }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Badge */}
              <div className="flex justify-center">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                  style={{
                    background: "rgba(139,92,246,0.12)",
                    borderColor: "rgba(139,92,246,0.4)",
                    color: "#a78bfa",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  Studdia Pro
                </span>
              </div>

              {/* Headline */}
              <div className="text-center">
                <h2 className="text-xl font-black tracking-tight leading-tight text-white mb-2">
                  Unlock the Ultimate
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(135deg, #c4b5fd, #8b5cf6, #6d28d9)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Study Cockpit.
                  </span>
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Get unlimited tasks, premium focus plants,
                  <br />
                  and zero limits.
                </p>
              </div>

              {/* Features list */}
              <ul className="flex flex-col gap-2.5">
                {FEATURES.map((f) => (
                  <li key={f.label} className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center"
                      style={{ background: "rgba(139,92,246,0.15)" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={f.icon} />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-300 font-medium">{f.label}</span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { onClose(); router.push("/login"); }}
                className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] text-white relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #6d28d9, #4c1d95)",
                  boxShadow: "0 0 32px rgba(139,92,246,0.4), 0 4px 16px rgba(0,0,0,0.4)",
                }}
              >
                {/* Shimmer overlay */}
                <motion.span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)",
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                />
                Get Studdia Pro →
              </motion.button>

              <p className="text-center text-[10px] text-gray-700">
                Coming soon · Stripe integration in progress
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
