"use client";
import { useState, useEffect } from "react";

const STEPS = [
  {
    emoji: "⏱️",
    title: "Pomodoro",
    desc: "Inicia un bloque de enfoque de 25 min. Al terminar, el timer suena y suma una sesión a tu racha.",
    accent: "#8b5cf6",
  },
  {
    emoji: "🏆",
    title: "Ligas",
    desc: "Compite cada semana. Los 3 mejores de Novato y Aficionado suben de liga. El #1 de Élite gana un premio.",
    accent: "#f59e0b",
  },
  {
    emoji: "⚙️",
    title: "Ajustes",
    desc: "Activa el modo claro, silencia el sonido o personaliza tu tiempo de foco con Pro.",
    accent: "#10b981",
  },
];

const STORAGE_KEY = "studdia_onboarding_done";

interface OnboardingProps {
  /** Force-show even if already dismissed (for previewing) */
  force?: boolean;
  onDone?: () => void;
}

export default function Onboarding({ force = false, onDone }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (force || !localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, [force]);

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const dismiss = () => {
    setClosing(true);
    localStorage.setItem(STORAGE_KEY, "1");
    setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 250);
  };

  const next = () => {
    if (isLast) { dismiss(); return; }
    setStep((s) => s + 1);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(12px)",
        animation: closing ? "fadeOut 0.25s ease forwards" : "fadeIn 0.25s ease",
      }}
      onClick={dismiss}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-7 flex flex-col gap-5 relative"
        style={{
          background: "linear-gradient(145deg, #0f0f14 0%, #0a0a10 100%)",
          border: `1px solid ${current.accent}40`,
          boxShadow: `0 0 60px ${current.accent}20, 0 25px 50px rgba(0,0,0,0.7)`,
          animation: "slideUp 0.25s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step dots */}
        <div className="flex items-center gap-1.5 justify-center">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? "20px" : "6px",
                height: "6px",
                background: i === step ? current.accent : "rgba(255,255,255,0.12)",
              }}
            />
          ))}
        </div>

        {/* Emoji icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto"
          style={{ background: `${current.accent}18`, border: `1px solid ${current.accent}30` }}
        >
          {current.emoji}
        </div>

        {/* Content */}
        <div className="text-center flex flex-col gap-2">
          <h2
            className="text-xl font-black tracking-tight"
            style={{ color: current.accent }}
          >
            {current.title}
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">{current.desc}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={dismiss}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            Saltar
          </button>
          <button
            onClick={next}
            className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all"
            style={{ background: current.accent, color: "white", boxShadow: `0 4px 15px ${current.accent}50` }}
          >
            {isLast ? "¡Listo!" : "Siguiente →"}
          </button>
        </div>

        {/* Skip all */}
        <p className="text-center text-[10px] text-gray-700">
          Paso {step + 1} de {STEPS.length}
        </p>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeOut { from { opacity: 1 } to { opacity: 0 } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}
