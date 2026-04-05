"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { useTheme } from "@/app/providers";

/* ─────────────────────────────────────────────────────────────────────────── */
/* DATA                                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */

const PAINS = [
  "Abres YouTube para poner música y terminas viendo 40 minutos de Shorts que no te importan.",
  "Llevas una semana prometiéndote que 'mañana te pones en serio'. Mañana nunca llega.",
  "Intentas estudiar con 8 pestañas abiertas. Tu cerebro está en todas partes menos en el libro.",
  "Terminas el día agotado, sin haber avanzado nada y sin saber exactamente en qué se te fue el tiempo.",
];

const VALUE_STACK = [
  { item: "Timer Pomodoro profesional + alarma real",         value: "€3/mes",  note: "vs Pomofocus Pro" },
  { item: "Filtro anti-distracciones YouTube en tiempo real", value: "€9/mes",  note: "vs Freedom App" },
  { item: "Música sin anuncios integrada en la app",          value: "€10/mes", note: "vs Spotify Premium" },
  { item: "Liga semanal — sala de 30 estudiantes reales",     value: "€0",      note: "exclusivo Studdia" },
  { item: "Playlists personalizadas por materia, ilimitadas", value: "€5/mes",  note: "vs Notion" },
  { item: "Timer ajustable 5–120 min para bloques pro",       value: "€4/mes",  note: "vs Focusmate" },
  { item: "Sincronización entre todos tus dispositivos",      value: "€2/mes",  note: "Google OAuth" },
];

const STEPS = [
  {
    n: "01",
    title: "Abre la app. Acceso inmediato con Google.",
    desc: "En menos de 10 segundos estás dentro. Sin tutorial. Sin formularios. Conectas Google y el panel ya está listo.",
    icon: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  },
  {
    n: "02",
    title: "Pon tu música. Sin anuncios.",
    desc: "Elige tu playlist de la materia o busca cualquier vídeo de YouTube. Recomendaciones, shorts y anuncios: bloqueados.",
    icon: "M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z",
  },
  {
    n: "03",
    title: "Pulsa Iniciar. Desaparece el mundo.",
    desc: "El panel lateral se pliega. El cronómetro cuenta atrás. La sesión se registra en la liga. Al final: alarma, racha +1, podio.",
    icon: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  },
];

const TESTIMONIALS = [
  {
    quote: "Solía perder 45 minutos por sesión abriendo YouTube para poner música. En la primera semana con Studdia completé 18 sesiones de foco. Subí de Novato a Aficionado en 4 días.",
    name: "Mia R.",
    role: "2.º Bachillerato · Biología",
    metric: "18 sesiones / semana",
    initials: "MR",
    color: "#D100D1",
    darkColor: "#8b5cf6",
  },
  {
    quote: "La liga me convirtió el estudio en un juego que no puedo perder. Esta semana soy #2 en mi sala de 30. No voy a dejar que me adelanten.",
    name: "Carlos D.",
    role: "4.º ESO · Física y Matemáticas",
    metric: "#2 en su liga",
    initials: "CD",
    color: "#b45309",
    darkColor: "#f59e0b",
  },
  {
    quote: "Tengo una playlist de lo-fi para cada asignatura. Cuando suena, mi cerebro sabe que toca trabajar. Es Pavlov pero funciona de verdad.",
    name: "Jade K.",
    role: "1.º Bachillerato · Química e Historia",
    metric: "5 playlists activas",
    initials: "JK",
    color: "#057857",
    darkColor: "#10b981",
  },
];

const FAQS = [
  {
    q: "¿Realmente bloquea los anuncios de YouTube?",
    a: "El reproductor integrado usa la API oficial de YouTube IFrame. No aparecen recomendaciones, el feed lateral, ni los shorts. Solo el vídeo que tú hayas elegido. No es un bloqueador de anuncios — es que la API simplemente no los carga en modo embedded.",
  },
  {
    q: "¿Qué pasa si no me concentro más después de usarlo?",
    a: "Entonces ninguna app del mundo puede ayudarte. Studdia elimina el 100 % de las distracciones visuales de YouTube, pone música sin interrupciones y un timer que no miente. Si con eso no trabajas más, el problema es más profundo.",
  },
  {
    q: "¿La liga semanal es real?",
    a: "Cada usuario está asignado a una sala de 30 personas reales. Cada lunes se calculan los rankings por sesiones completadas esa semana. Los top 5 suben de división. Los últimos bajan. El #1 gana Pro gratis.",
  },
  {
    q: "¿Cómo cancelo si no me gusta?",
    a: "Escríbenos. Sin preguntas, sin retención agresiva, sin '¿estás seguro?'. En serio. No somos ese tipo de empresa.",
  },
  {
    q: "¿Necesito crear una cuenta?",
    a: "No. Puedes usar el timer y el reproductor sin cuenta en segundos. Solo conectas Google si quieres sincronizar tus playlists entre dispositivos y entrar en la liga.",
  },
];

const PRO_FEATURES: { icon: "bolt" | "diamond" | "shield"; text: string }[] = [
  { icon: "bolt",    text: "Multiplicador XP x2 — Sube de liga el doble de rápido. Inalcanzable en la capa gratuita." },
  { icon: "bolt",    text: "Modo Hormozi Desbloqueado — Estética negra y magenta para enfoque extremo." },
  { icon: "shield",  text: "Protección de Racha — 1 escudo por semana si olvidas estudiar." },
  { icon: "bolt",    text: "Timer 100% Ajustable — De 1 a 180 minutos para trabajo profundo real." },
  { icon: "diamond", text: "Estatus de Leyenda — Nombre resaltado y badge neón en todos los rankings." },
  { icon: "bolt",    text: "Algoritmo de selección de contenido: Estudiarás con los mejores vídeos, no con los que YouTube quiere que veas." },
];

const FREE_FEATURES = [
  "Acceso a la Liga Estudiantil (Fase de Grupos)",
  "Timer Pomodoro 25/5 (Sin ajustes)",
  "5 Materias · 4 Playlists por materia",
];

const FREE_MISSING = [
  "Multiplicador XP x2",
  "Modo Oscuro Pro",
  "Timer ajustable (1–180 min)",
  "Protección de Racha",
  "Estatus de Leyenda",
];

/* ─────────────────────────────────────────────────────────────────────────── */
/* COMPONENT                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

export default function Landing() {
  const router = useRouter();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const spotsLeft = 13;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Theme design tokens ─────────────────────────────────────────────────── */
  const t = {
    pageBg:        dark ? "#050507"                       : "#F9FAFB",
    cardBg:        dark ? "rgba(255,255,255,0.025)"       : "#FFFFFF",
    cardBorder:    dark ? "rgba(255,255,255,0.07)"        : "rgba(0,0,0,0.08)",
    cardShadow:    dark ? "none"                          : "0 1px 4px rgba(0,0,0,0.07)",
    textPrimary:   dark ? "#FFFFFF"                       : "#1D1D1F",
    textSecondary: dark ? "#9ca3af"                       : "#6E6E73",
    textMuted:     dark ? "#6b7280"                       : "#9ca3af",
    accent:        dark ? "#8b5cf6"                       : "#D100D1",
    accentBg:      dark ? "rgba(139,92,246,0.06)"         : "rgba(209,0,209,0.05)",
    accentBorder:  dark ? "rgba(139,92,246,0.2)"          : "rgba(209,0,209,0.18)",
    accentText:    dark ? "#a78bfa"                       : "#D100D1",
    btnPrimary:    dark ? "linear-gradient(135deg,#8b5cf6,#6d28d9)" : "#D100D1",
    btnShadow:     dark ? "0 0 60px rgba(139,92,246,0.5), 0 4px 20px rgba(0,0,0,0.4)"
                        : "0 4px 20px rgba(209,0,209,0.35), 0 2px 8px rgba(0,0,0,0.08)",
    btnBorder:     dark ? "1px solid rgba(168,85,247,0.5)" : "none",
    stepBg:        dark ? "#08080b"                       : "#FFFFFF",
    stepDivider:   dark ? "rgba(255,255,255,0.07)"        : "rgba(0,0,0,0.06)",
    tableBg:       dark ? "#0a0a0d"                       : "#FFFFFF",
    tableItemHover:dark ? "rgba(255,255,255,0.02)"        : "rgba(0,0,0,0.02)",
    tableRowBorder:dark ? "rgba(255,255,255,0.04)"        : "rgba(0,0,0,0.05)",
    inputBg:       dark ? "rgba(0,0,0,0.4)"               : "rgba(0,0,0,0.04)",
    divider:       dark ? "rgba(255,255,255,0.05)"        : "rgba(0,0,0,0.07)",
    faqOpen:       dark ? "rgba(139,92,246,0.06)"         : "rgba(209,0,209,0.04)",
    faqBorder:     dark ? "rgba(139,92,246,0.2)"          : "rgba(209,0,209,0.2)",
    pricingProBg:  dark
      ? "radial-gradient(ellipse at top, rgba(139,92,246,0.14) 0%, rgba(8,8,11,0.97) 65%)"
      : "linear-gradient(160deg, rgba(209,0,209,0.06) 0%, #FFFFFF 40%)",
    pricingProBorder: dark ? "rgba(139,92,246,0.5)"       : "#D100D1",
    pricingProShadow: dark ? "0 0 60px rgba(139,92,246,0.22)" : "0 8px 48px rgba(209,0,209,0.18), 0 0 0 1px rgba(209,0,209,0.12)",
    ctaSectionBg:  dark
      ? "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.2) 0%, rgba(5,5,7,0.97) 65%)"
      : "linear-gradient(160deg, rgba(209,0,209,0.06) 0%, #FFFFFF 60%)",
    ctaSectionBorder: dark ? "rgba(139,92,246,0.25)"      : "rgba(209,0,209,0.18)",
    eyebrow:       dark ? "#a78bfa"                       : "#D100D1",
    starColor:     dark ? "#8b5cf6"                       : "#D100D1",
    mockupChrome:  dark ? "#0d0d10"                       : "#F5F5F7",
    mockupBg:      dark ? "#08080b"                       : "#FFFFFF",
    mockupInner:   dark ? "rgba(139,92,246,0.05)"         : "rgba(209,0,209,0.04)",
    mockupInnerBorder: dark ? "rgba(139,92,246,0.15)"     : "rgba(209,0,209,0.15)",
    mockupPlayer:  dark ? "rgba(255,255,255,0.02)"        : "rgba(0,0,0,0.02)",
    mockupPlayerBorder: dark ? "rgba(255,255,255,0.06)"   : "rgba(0,0,0,0.06)",
    statusGreen:   dark ? "#4ade80"                       : "#16a34a",
    proBadgeBg:    dark ? "linear-gradient(135deg,#8b5cf6,#6d28d9)" : "#D100D1",
    checkColor:    dark ? "#8b5cf6"                       : "#D100D1",
    freeCTA:       dark
      ? { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af" }
      : { background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.1)", color: "#6E6E73" },
    missedColor:   dark ? "#374151" : "#9ca3af",
  } as const;

  /* ── Particle canvas (dark only) ─────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!dark) { canvas.style.opacity = "0"; return; }
    canvas.style.opacity = "1";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.2,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.22 + 0.03,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.alpha})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [dark]);

  return (
    <div
      className="relative min-h-screen font-sans overflow-x-hidden transition-colors duration-300"
      style={{ background: t.pageBg, color: t.textPrimary }}
    >
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500" />

      {/* ── Ambient glow (dark only) ── */}
      {dark && (
        <div
          className="fixed top-14 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none z-0 opacity-25"
          style={{ background: "radial-gradient(ellipse at top, rgba(139,92,246,0.25) 0%, transparent 65%)" }}
        />
      )}

      {/* ── SCARCITY BANNER ─────────────────────────────────────────────────── */}
      <div
        className="relative z-30 w-full flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-4 py-2.5 text-[11px] font-black text-center"
        style={{
          background: dark
            ? "linear-gradient(90deg,#7c2d12,#b91c1c,#7c2d12)"
            : "linear-gradient(90deg,#9a1c1c,#dc2626,#9a1c1c)",
          backgroundSize: "200% 100%",
          animation: "pro-badge 4s linear infinite",
        }}
      >
        <span className="text-yellow-200">🔥 ÚLTIMAS PLAZAS:</span>
        <span className="text-white">Solo quedan {spotsLeft} de 100 plazas Pro al precio de lanzamiento.</span>
        <span className="hidden sm:inline" style={{ color: "rgba(255,255,255,0.7)" }}>— Cuando se llenen, sube el precio.</span>
        <a href="#pricing" className="text-yellow-200 underline hover:no-underline ml-1 font-black">
          Asegurar mi plaza →
        </a>
      </div>

      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-20 max-w-5xl mx-auto">
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-bold tracking-widest uppercase mb-8"
          style={{
            background: dark ? "rgba(239,68,68,0.08)" : "rgba(220,38,38,0.06)",
            borderColor: dark ? "rgba(239,68,68,0.25)" : "rgba(220,38,38,0.2)",
            color: dark ? "#fca5a5" : "#dc2626",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Estás perdiendo 3 horas al día mientras &quot;estudias&quot;
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-7xl font-black tracking-tight leading-[1.03] mb-6 max-w-4xl"
          style={{ color: t.textPrimary }}
        >
          Deja de{" "}
          <span className="line-through decoration-red-500 decoration-[5px]" style={{ color: t.textMuted }}>
            regalar
          </span>{" "}
          tus tardes
          <br className="hidden sm:block" /> a YouTube.{" "}
          <span style={{ color: t.accent }}>Gana la liga.</span>
        </h1>

        {/* Sub */}
        <p className="text-xl md:text-2xl leading-relaxed mb-4 max-w-3xl font-medium" style={{ color: t.textSecondary }}>
          Studdia bloquea recomendaciones y anuncios de YouTube en tiempo real, pone tu música sin
          interrupciones y te mete en una liga semanal contra{" "}
          <strong style={{ color: t.textPrimary }}>29 estudiantes reales</strong>.
        </p>
        <p className="text-base mb-12 max-w-xl" style={{ color: t.textMuted }}>
          Por <strong style={{ color: t.textPrimary }}>€2,50/mes</strong> — menos que un Red Bull — recuperas{" "}
          <strong style={{ color: t.textPrimary }}>10+ horas semanales</strong> que ahora mismo estás tirando a la basura.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <button
            onClick={() => router.push("/cockpit")}
            className="group relative px-10 py-5 rounded-2xl font-black text-base uppercase tracking-[0.1em] transition-all duration-200 active:scale-[0.97] text-white"
            style={{ background: t.btnPrimary, boxShadow: t.btnShadow, border: t.btnBorder }}
          >
            Obtener mi ventaja ahora — Gratis →
          </button>
          <a
            href="#pricing"
            className="px-8 py-5 rounded-2xl font-bold text-sm transition-all duration-200 border"
            style={{
              background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              borderColor: t.cardBorder,
              color: t.textSecondary,
            }}
          >
            Ver el precio →
          </a>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
          {[
            { value: "0",     label: "Anuncios en toda la app" },
            { value: "<10s",  label: "Para estar en sesión" },
            { value: "€2,50", label: "Pro al mes" },
            { value: "30",    label: "Rivales reales por sala" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center py-4 px-3 rounded-2xl"
              style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}
            >
              <span className="text-2xl md:text-3xl font-black" style={{ color: t.accent }}>
                {s.value}
              </span>
              <span className="text-[10px] mt-1 tracking-wide text-center leading-tight" style={{ color: t.textMuted }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          APP MOCKUP
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 flex justify-center px-6 pb-28">
        <div
          className="w-full max-w-4xl rounded-2xl overflow-hidden"
          style={{
            border: `1px solid ${t.cardBorder}`,
            boxShadow: dark
              ? "0 0 100px rgba(139,92,246,0.15), 0 20px 60px rgba(0,0,0,0.6)"
              : "0 20px 60px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {/* Browser chrome */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{ background: t.mockupChrome, borderColor: t.cardBorder }}
          >
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
            </div>
            <div
              className="flex-1 mx-4 h-6 rounded-md flex items-center px-3"
              style={{ background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)" }}
            >
              <span className="text-[11px]" style={{ color: t.textMuted }}>
                🔒 studdia.vercel.app/cockpit
              </span>
            </div>
            <span className="text-[10px] font-black hidden sm:block" style={{ color: t.statusGreen }}>
              ● EN SESIÓN
            </span>
          </div>
          {/* UI skeleton */}
          <div
            className="p-5 grid grid-cols-3 gap-4 min-h-[260px]"
            style={{ background: t.mockupBg }}
          >
            {/* Timer panel */}
            <div
              className="col-span-1 flex flex-col items-center justify-center gap-4 p-5 rounded-xl"
              style={{ background: t.mockupInner, border: `1px solid ${t.mockupInnerBorder}` }}
            >
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none"
                    stroke={dark ? "rgba(139,92,246,0.1)" : "rgba(209,0,209,0.1)"} strokeWidth="5" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke={t.accent} strokeWidth="5"
                    strokeDasharray="213.6" strokeDashoffset="53" strokeLinecap="round"
                    style={{ filter: dark ? "drop-shadow(0 0 6px rgba(139,92,246,0.8))" : "none" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-black text-lg tabular-nums" style={{ color: t.textPrimary }}>
                    19:42
                  </span>
                  <span className="text-[8px] uppercase tracking-wider font-bold" style={{ color: t.accentText }}>
                    Foco
                  </span>
                </div>
              </div>
              <div
                className="w-full h-7 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white"
                style={{
                  background: dark ? "rgba(139,92,246,0.25)" : "rgba(209,0,209,0.15)",
                  border: `1px solid ${t.mockupInnerBorder}`,
                  color: dark ? "white" : t.accent,
                }}
              >
                ■ Pausa
              </div>
            </div>
            {/* Player panel */}
            <div
              className="col-span-2 flex flex-col gap-3 p-4 rounded-xl"
              style={{ background: t.mockupPlayer, border: `1px solid ${t.mockupPlayerBorder}` }}
            >
              <div
                className="w-full h-28 rounded-lg flex items-center justify-center"
                style={{ background: dark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.04)" }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{
                      background: dark ? "rgba(139,92,246,0.3)" : "rgba(209,0,209,0.12)",
                      border: `1px solid ${t.mockupInnerBorder}`,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={t.accentText}>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="text-[9px]" style={{ color: t.textMuted }}>
                    Lo-fi Hip Hop Radio · sin anuncios
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {["Music 🎵", "Maths 📐", "+ Nueva"].map((tab, i) => (
                  <div
                    key={tab}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                    style={
                      i === 0
                        ? { background: t.accentBg, color: t.accentText, border: `1px solid ${t.accentBorder}` }
                        : { background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", color: t.textMuted, border: `1px solid ${t.cardBorder}` }
                    }
                  >
                    {tab}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[10px] mt-auto font-semibold" style={{ color: t.statusGreen }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: t.statusGreen }} />
                Anti-distracción activo · 0 anuncios · 0 recomendaciones
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PAIN
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 pb-28 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-3 text-red-500">
            El problema
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: t.textPrimary }}>
            ¿Te suena esto?
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {PAINS.map((pain, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-6 rounded-2xl"
              style={{
                background: dark ? "rgba(239,68,68,0.04)" : "#FFFFFF",
                border: dark ? "1px solid rgba(239,68,68,0.12)" : "1px solid rgba(0,0,0,0.06)",
                boxShadow: dark ? "none" : "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <span className="text-2xl shrink-0">😬</span>
              <p className="text-sm leading-relaxed font-medium" style={{ color: t.textSecondary }}>
                {pain}
              </p>
            </div>
          ))}
        </div>
        {/* Agitation stat */}
        {/* Liga agitation line */}
        <p className="text-center text-sm font-bold mb-6" style={{ color: t.accent }}>
          Mientras tú pierdes el tiempo en Reels, otros 29 estudiantes están subiendo en la Liga Studdia.
        </p>

        <div
          className="p-7 rounded-2xl text-center"
          style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}` }}
        >
          <p className="text-lg md:text-xl font-bold leading-relaxed" style={{ color: t.textPrimary }}>
            La media de un estudiante pierde{" "}
            <span style={{ color: t.accent }}>3 horas al día</span> en distracciones
            digitales mientras &quot;estudia&quot;.
          </p>
          <p className="text-base mt-3" style={{ color: t.textSecondary }}>
            Son <strong style={{ color: t.textPrimary }}>15 horas a la semana</strong> en días
            lectivos —{" "}
            <strong style={{ color: t.textPrimary }}>1.095 horas al año</strong> que nunca vuelven.
          </p>
          <p className="text-sm mt-2" style={{ color: t.textMuted }}>
            1.000 horas es la diferencia entre entrar en la carrera que quieres o quedarte fuera por tres décimas.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 px-6 pb-28 max-w-5xl mx-auto w-full">
        <div className="text-center mb-14">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-3" style={{ color: t.eyebrow }}>
            3 pasos. 10 segundos.
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: t.textPrimary }}>
            Así de simple.
          </h2>
          <p className="text-base mt-3 max-w-md mx-auto" style={{ color: t.textMuted }}>
            Sin pasos extra. Sin tutorial. Sin excusas.
          </p>
        </div>
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-px rounded-3xl overflow-hidden"
          style={{ background: t.stepDivider }}
        >
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="flex flex-col p-8 group transition-colors duration-300"
              style={{ background: t.stepBg, boxShadow: dark ? "none" : t.cardShadow }}
            >
              <span
                className="text-7xl font-black mb-6 leading-none select-none"
                style={{ color: dark ? "rgba(139,92,246,0.15)" : "rgba(209,0,209,0.08)" }}
              >
                {s.n}
              </span>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300"
                style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}` }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.accent}
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.icon} />
                </svg>
              </div>
              <h3 className="font-black text-lg mb-3" style={{ color: t.textPrimary }}>
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: t.textSecondary }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          VALUE STACK
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 pb-28 max-w-3xl mx-auto w-full">
        <div className="text-center mb-12">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-3" style={{ color: t.eyebrow }}>
            La oferta
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4" style={{ color: t.textPrimary }}>
            Lo que pagas vs.{" "}
            <span style={{ color: t.accent }}>lo que obtienes.</span>
          </h2>
          <p className="text-base max-w-md mx-auto" style={{ color: t.textSecondary }}>
            Studdia Pro reemplaza 4 suscripciones que necesitas pero probablemente no tienes.
          </p>
        </div>

        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: t.tableBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}
        >
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${t.tableRowBorder}` }}
          >
            <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: t.textMuted }}>
              Qué incluye
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: t.textMuted }}>
              Valor real
            </span>
          </div>
          {VALUE_STACK.map((v, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-4 transition-colors"
              style={{
                borderBottom: `1px solid ${t.tableRowBorder}`,
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.checkColor}
                  strokeWidth="2.5" className="shrink-0">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span className="text-sm font-medium truncate" style={{ color: t.textPrimary }}>
                  {v.item}
                </span>
                <span className="text-[10px] hidden sm:inline shrink-0" style={{ color: t.textMuted }}>
                  ({v.note})
                </span>
              </div>
              <span className="shrink-0 text-sm font-black ml-4" style={{ color: t.accent }}>
                {v.value}
              </span>
            </div>
          ))}
          <div className="px-6 py-7">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: t.textSecondary }}>Valor total estimado:</span>
              <span className="text-sm line-through font-black" style={{ color: t.textMuted }}>€33+/mes</span>
            </div>
            <div
              className="flex items-center justify-between mb-7 pb-7"
              style={{ borderBottom: `1px solid ${t.tableRowBorder}` }}
            >
              <span className="font-black text-xl" style={{ color: t.textPrimary }}>Tu precio hoy:</span>
              <div className="flex items-end gap-1.5">
                <span className="font-black text-5xl" style={{ color: t.accent }}>€2,50</span>
                <span className="text-sm mb-2" style={{ color: t.textMuted }}>/mes</span>
              </div>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.12em] transition-all active:scale-[0.98] text-white"
              style={{ background: t.btnPrimary, boxShadow: t.btnShadow }}
            >
              Asegurar mi plaza Pro — €2,50/mes →
            </button>
            <p className="text-center text-[11px] mt-3" style={{ color: t.textMuted }}>
              Sin permanencia · Sin tarjeta hasta que decidas · Cancela cuando quieras
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TESTIMONIALS
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 pb-28 max-w-5xl mx-auto w-full">
        <div className="text-center mb-14">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-3" style={{ color: t.eyebrow }}>
            Lo que dicen
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: t.textPrimary }}>
            Resultados reales.<br />Nada inventado.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((te) => {
            const col = dark ? te.darkColor : te.color;
            return (
              <div
                key={te.name}
                className="flex flex-col p-7 rounded-2xl"
                style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}
              >
                <div
                  className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-5"
                  style={{ background: `${col}15`, color: col, border: `1px solid ${col}30` }}
                >
                  ★ {te.metric}
                </div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={t.starColor}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: t.textSecondary }}>
                  &ldquo;{te.quote}&rdquo;
                </p>
                <div
                  className="flex items-center gap-3 pt-4"
                  style={{ borderTop: `1px solid ${t.cardBorder}` }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                    style={{ background: `${col}22`, color: col, border: `1px solid ${col}33` }}
                  >
                    {te.initials}
                  </div>
                  <div>
                    <span className="text-xs font-bold block" style={{ color: t.textPrimary }}>
                      {te.name}
                    </span>
                    <span className="text-[10px]" style={{ color: t.textMuted }}>{te.role}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PRICING
          ══════════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="relative z-10 px-6 pb-28 max-w-4xl mx-auto w-full">
        <div className="text-center mb-14">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-3" style={{ color: t.eyebrow }}>
            Precio sin trampa
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight" style={{ color: t.textPrimary }}>
            Menos de lo que gastas<br />en una tarde de estudio.
          </h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: t.textSecondary }}>
            Sin permanencia. Sin letra pequeña. Si no te gusta, cancelas en 30 segundos.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* FREE */}
          <div
            className="flex flex-col p-8 rounded-3xl"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}
          >
            <span
              className="text-[12px] font-black uppercase tracking-[0.2em] mb-4"
              style={{ color: t.textMuted }}
            >
              El Desafío — Siempre gratis
            </span>
            <div className="flex items-end gap-1.5 mb-7">
              <span className="text-6xl font-black" style={{ color: t.textPrimary }}>€0</span>
              <span className="text-sm mb-1.5" style={{ color: t.textMuted }}>para siempre</span>
            </div>
            <ul className="flex flex-col gap-3 mb-6 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: t.textSecondary }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.checkColor}
                    strokeWidth="2.5" className="shrink-0 mt-0.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            {/* Elite reward callout */}
            <div
              className="mb-7 rounded-2xl p-4"
              style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}` }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-2" style={{ color: t.accentText }}>
                🏆 Recompensa de Élite
              </p>
              <p className="text-[12px] leading-relaxed" style={{ color: t.textPrimary }}>
                Si ganas tu grupo y la Liga Élite (Top 5), consigues{" "}
                <strong>1 mes de Pro gratis</strong>. El 2.º puesto:{" "}
                <strong>7 días</strong>.
              </p>
            </div>
            <button
              onClick={() => router.push("/cockpit")}
              className="w-full py-3.5 rounded-2xl font-black text-sm transition-all uppercase tracking-[0.1em]"
              style={{ background: "transparent", border: `2px solid ${t.textPrimary}`, color: t.textPrimary }}
            >
              Aceptar el desafío gratis
            </button>
          </div>

          {/* PRO */}
          <div
            className="relative flex flex-col p-8 rounded-3xl"
            style={{
              background: t.pricingProBg,
              border: `1px solid ${t.pricingProBorder}`,
              boxShadow: t.pricingProShadow,
            }}
          >
            <div
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap text-white"
              style={{ background: t.proBadgeBg, boxShadow: dark ? "0 0 20px rgba(139,92,246,0.5)" : "0 4px 14px rgba(209,0,209,0.35)" }}
            >
              💎 SÉ UNA LEYENDA
            </div>
            <span
              className="text-[12px] font-black uppercase tracking-[0.2em] mb-4"
              style={{ color: t.accent }}
            >
              Pro — Ventaja Injusta
            </span>
            <div className="flex items-end gap-1.5 mb-7">
              <span className="text-6xl font-black" style={{ color: t.textPrimary }}>€2,50</span>
              <span className="text-sm mb-1.5" style={{ color: t.textMuted }}>/ mes · sin permanencia</span>
            </div>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {PRO_FEATURES.map((f) => (
                <li key={f.text} className="flex items-start gap-2.5 text-sm" style={{ color: t.textPrimary }}>
                  <svg
                    width="14" height="14" viewBox="0 0 24 24"
                    fill={t.checkColor} stroke="none"
                    className="shrink-0 mt-0.5"
                  >
                    {f.icon === "bolt" && <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />}
                    {f.icon === "diamond" && <polygon points="12,2 22,12 12,22 2,12" />}
                    {f.icon === "shield" && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />}
                  </svg>
                  {f.text}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push("/login")}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.1em] transition-all active:scale-[0.98] text-white"
              style={{ background: t.btnPrimary, boxShadow: t.btnShadow }}
            >
              Garantizar mi Estatus Pro →
            </button>
            <p className="text-center text-[10px] mt-3" style={{ color: t.textMuted }}>
              Sin permanencia · Cancela cuando quieras
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FAQ
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 pb-28 max-w-3xl mx-auto w-full">
        <div className="text-center mb-12">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-3" style={{ color: t.eyebrow }}>
            FAQ
          </p>
          <h2 className="text-4xl font-black tracking-tight" style={{ color: t.textPrimary }}>
            Preguntas directas.<br />Respuestas directas.
          </h2>
        </div>
        <div className="flex flex-col gap-2">
          {FAQS.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: openFaq === i ? t.faqOpen : t.cardBg,
                border: `1px solid ${openFaq === i ? t.faqBorder : t.cardBorder}`,
                boxShadow: openFaq === i ? "none" : t.cardShadow,
              }}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-bold" style={{ color: t.textPrimary }}>{f.q}</span>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" className="shrink-0 transition-transform duration-300"
                  style={{ color: t.accent, transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm leading-relaxed" style={{ color: t.textSecondary }}>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FINAL CTA
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pb-32">
        <div
          className="w-full max-w-3xl rounded-3xl p-12 md:p-16 relative overflow-hidden"
          style={{
            background: t.ctaSectionBg,
            border: `1px solid ${t.ctaSectionBorder}`,
            boxShadow: dark ? "0 0 80px rgba(139,92,246,0.12)" : "0 20px 60px rgba(0,0,0,0.06)",
          }}
        >
          {dark && (
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] pointer-events-none"
              style={{ background: "radial-gradient(ellipse at top, rgba(139,92,246,0.22) 0%, transparent 70%)" }}
            />
          )}
          <p className="relative text-[11px] font-black uppercase tracking-[0.25em] mb-6" style={{ color: t.eyebrow }}>
            Última pregunta
          </p>
          <h2 className="relative text-4xl md:text-5xl font-black tracking-tight mb-5 leading-tight" style={{ color: t.textPrimary }}>
            ¿Cuántas horas más<br />vas a regalar?
          </h2>
          <p className="relative text-base mb-2 max-w-md mx-auto leading-relaxed" style={{ color: t.textSecondary }}>
            Dentro de 10 segundos puedes estar en tu primera sesión de foco real.
          </p>
          <p className="relative text-sm mb-10 max-w-sm mx-auto" style={{ color: t.textMuted }}>
            Acceso inmediato. Sin tarjeta. Sin excusas.
          </p>
          <div className="relative flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push("/cockpit")}
              className="px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.12em] transition-all active:scale-[0.97] text-white"
              style={{ background: t.btnPrimary, boxShadow: t.btnShadow, border: t.btnBorder }}
            >
              Empezar ahora — es gratis →
            </button>
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-5 rounded-2xl font-bold text-sm transition-all border"
              style={{
                background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                borderColor: t.cardBorder,
                color: t.textSecondary,
              }}
            >
              Entrar con Google
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="relative z-10 px-6 md:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderTop: `1px solid ${t.divider}` }}
      >
        <div className="flex items-center gap-2 text-xs" style={{ color: t.textMuted }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill={t.accent} />
          </svg>
          <span className="font-bold" style={{ color: t.textSecondary }}>Studdia</span>
          <span>· Sin anuncios · Sin trampa · Hecho por un estudiante.</span>
        </div>
        <div className="flex items-center gap-5 text-[11px]" style={{ color: t.textMuted }}>
          <a
            href="https://github.com/jaden972972/Studdia"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition-opacity"
          >
            GitHub
          </a>
          <button onClick={() => router.push("/privacy")} className="hover:opacity-70 transition-opacity">
            Privacidad
          </button>
          <button onClick={() => router.push("/terms")} className="hover:opacity-70 transition-opacity">
            Términos
          </button>
          <button
            onClick={() => router.push("/cockpit")}
            className="font-bold hover:opacity-70 transition-opacity"
            style={{ color: t.textSecondary }}
          >
            App →
          </button>
        </div>
      </footer>
    </div>
  );
}

