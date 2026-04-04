/**
 * BACKLOG — Features removed from MVP cockpit for simplicity.
 * Code is preserved here for re-integration in a future sprint.
 * None of this is imported or bundled in the main application.
 *
 * Contents:
 *   1. Onboarding component usage          → reinstall with <Onboarding />
 *   2. Tasks side drawer                   → reinstall after Task page ships
 *   3. About modal                         → reinstall when SEO/content is ready
 *   4. Delete account modal                → reinstall with proper GDPR flow
 *   5. Reset playlists modal               → reinstall in Settings page
 *   6. Topbar "Tareas" button              → reinstall when tasks tab is live
 *   7. Sidebar mobile: Tareas + bottom buttons → reinstall with settings drawer
 */

// ─── 1. ONBOARDING ────────────────────────────────────────────────────────────
// Import: import Onboarding from "@/app/components/Onboarding";
// State:  const [showOnboarding, setShowOnboarding] = useState(false);
// JSX — place at top of <main>, before any modals:
/*
  <Onboarding />
*/

// ─── 2. TASKS SIDE DRAWER ─────────────────────────────────────────────────────
// Required state + imports:
/*
  import Link from "next/link"; // already used for "Inicio"

  const [showTasksPopup, setShowTasksPopup] = useState(false);
  const [popupTasks, setPopupTasks] = useState<
    { id: string; text: string; done: boolean; priority: "high" | "medium" | "low" }[]
  >([]);

  const openTasksPopup = () => {
    try {
      const raw = localStorage.getItem("studdia_tasks_v1");
      const all = raw ? JSON.parse(raw) : [];
      const ordered = [
        ...(["high", "medium", "low"] as const).flatMap((p) =>
          all.filter((t: any) => !t.done && t.priority === p)
        ),
        ...all.filter((t: any) => t.done),
      ];
      setPopupTasks(ordered);
    } catch {
      setPopupTasks([]);
    }
    setShowTasksPopup(true);
  };

  const togglePopupTask = (id: string) => {
    setPopupTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    try {
      const raw = localStorage.getItem("studdia_tasks_v1");
      const all = raw ? JSON.parse(raw) : [];
      localStorage.setItem(
        "studdia_tasks_v1",
        JSON.stringify(all.map((t: any) => (t.id === id ? { ...t, done: !t.done } : t)))
      );
    } catch {}
  };
*/

// JSX — place after <Onboarding />, before ambient orbs:
/*
  {showTasksPopup && (
    <div
      className="fixed inset-0 z-[60] flex justify-end"
      onClick={() => setShowTasksPopup(false)}
    >
      <div
        className="h-full w-full max-w-[300px] border-l bg-[#0d0d0f] p-5 flex flex-col gap-3 overflow-y-auto"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.7)",
          animation: "slideInRight 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">
            Tareas pendientes
          </span>
          <button
            onClick={() => setShowTasksPopup(false)}
            className="text-gray-600 hover:text-white transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex flex-col gap-1.5 [scrollbar-width:none]">
          {popupTasks.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
              <p className="text-xs text-gray-600">
                Aún no tienes tareas.
                <br />
                Créalas en la página de Tareas.
              </p>
              <Link
                href="/tasks"
                onClick={() => setShowTasksPopup(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold text-violet-400 border border-violet-400/30 hover:bg-violet-400/10 transition-all"
              >
                Ir a Tareas →
              </Link>
            </div>
          )}
          {popupTasks.map((t) => {
            const colors: Record<string, string> = {
              high: "#f87171",
              medium: "#fbbf24",
              low: "#6b7280",
            };
            const labels: Record<string, string> = {
              high: "Alta",
              medium: "Media",
              low: "Baja",
            };
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                style={{
                  background: t.done ? "transparent" : "rgba(255,255,255,0.03)",
                  opacity: t.done ? 0.45 : 1,
                }}
              >
                <button
                  onClick={() => togglePopupTask(t.id)}
                  className="w-4 h-4 rounded shrink-0 flex items-center justify-center border-2 transition-all"
                  style={
                    t.done
                      ? { background: "#10b981", borderColor: "#10b981" }
                      : { background: "transparent", borderColor: colors[t.priority] }
                  }
                >
                  {t.done && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
                <span
                  className="flex-1 text-sm truncate"
                  style={{
                    color: t.done ? "#3f3f46" : "#d4d4d8",
                    textDecoration: t.done ? "line-through" : "none",
                  }}
                >
                  {t.text}
                </span>
                {!t.done && (
                  <span
                    className="text-[9px] font-black uppercase shrink-0"
                    style={{ color: colors[t.priority] }}
                  >
                    {labels[t.priority]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )}
*/

// ─── 3. ABOUT MODAL ───────────────────────────────────────────────────────────
// State: const [showAbout, setShowAbout] = useState(false);
// Trigger button (sidebar footer):
/*
  <button
    onClick={() => { setShowAbout(true); setSidebarOpen(false); }}
    className="flex items-center gap-2 text-[11px] text-gray-600 hover:text-gray-300 transition-colors"
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
    </svg>
    Acerca v9
  </button>
*/
// Modal JSX (after League modal):
/*
  {showAbout && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
      <div className="bg-[#0d0d0f] border border-white/[0.08] p-8 rounded-3xl max-w-md w-full relative shadow-2xl">
        <button
          onClick={() => setShowAbout(false)}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: accent }}
          >
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
          Un cockpit minimalista para trabajo profundo. Técnica Pomodoro con música ambiente de
          YouTube. Construido con Next.js y YouTube Data API.
        </p>
        <div className="mt-5 pt-5 border-t border-white/[0.06]">
          <p className="text-[11px] text-gray-600 italic">Discipline equals freedom.</p>
        </div>
      </div>
    </div>
  )}
*/

// ─── 4. DELETE ACCOUNT MODAL ──────────────────────────────────────────────────
// State: const [showDeleteAccount, setShowDeleteAccount] = useState(false);
// Trigger button (sidebar footer bottom buttons block):
/*
  {session?.user && (
    <button
      onClick={() => setShowDeleteAccount(true)}
      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] text-gray-600 hover:text-red-400 hover:bg-red-400/5 border border-white/[0.05] hover:border-red-400/20 transition-all"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
      </svg>
      Eliminar cuenta
    </button>
  )}
*/
// Modal JSX:
/*
  {showDeleteAccount && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
      <div className="bg-[#0d0d0f] border border-white/[0.08] p-7 rounded-3xl max-w-sm w-full shadow-2xl">
        <h2 className="text-base font-black mb-2 text-red-400">¿Eliminar cuenta?</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Cerrarás sesión y se eliminarán todos tus datos locales (listas y videos). Para eliminar
          tu cuenta de Google, visita myaccount.google.com.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDeleteAccount(false)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("studdia_playlists_v1");
              signOut({ callbackUrl: "/" });
            }}
            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
          >
            Eliminar y cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )}
*/

// ─── 5. RESET PLAYLISTS MODAL ─────────────────────────────────────────────────
// State: const [showResetPlaylists, setShowResetPlaylists] = useState(false);
// Trigger button (sidebar footer bottom buttons block):
/*
  <button
    onClick={() => setShowResetPlaylists(true)}
    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] text-gray-600 hover:text-yellow-400 hover:bg-yellow-400/5 border border-white/[0.05] hover:border-yellow-400/20 transition-all"
  >
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 4v6h6M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
    </svg>
    Reiniciar listas
  </button>
*/
// Modal JSX:
/*
  {showResetPlaylists && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
      <div className="bg-[#0d0d0f] border border-white/[0.08] p-7 rounded-3xl max-w-sm w-full shadow-2xl">
        <h2 className="text-base font-black mb-2">¿Reiniciar listas?</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Se eliminarán todos tus videos guardados y se restaurarán las listas por defecto. Esta
          acción no se puede deshacer.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowResetPlaylists(false)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("studdia_playlists_v1");
              setPlaylists(DEFAULT_PLAYLISTS);
              setActivePlaylistId(DEFAULT_PLAYLISTS[0].id);
              setCurrentTrackIdx(-1);
              setShowResetPlaylists(false);
            }}
            className="flex-1 py-2.5 rounded-xl text-sm font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all"
          >
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  )}
*/

// ─── 6. TOPBAR "TAREAS" BUTTON ────────────────────────────────────────────────
// Placed in the right-side actions of the topbar header:
/*
  <button
    onClick={openTasksPopup}
    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-400 hover:text-violet-400 hover:bg-violet-400/5 border border-white/[0.07] hover:border-violet-400/20 transition-all"
    title="Ver tareas"
  >
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
    Tareas
  </button>
*/

// ─── 7. SIDEBAR MOBILE QUICK-LINKS BLOCK ──────────────────────────────────────
// The block with Tareas + Liga mobile buttons (inside sidebar footer, md:hidden):
/*
  <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04] md:hidden">
    <Link
      href="/tasks"
      onClick={() => setSidebarOpen(false)}
      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] text-gray-400 hover:text-violet-400 hover:bg-violet-400/5 border border-white/[0.05] hover:border-violet-400/20 transition-all"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
      Tareas
    </Link>
    <button
      onClick={() => {
        setSidebarOpen(false);
        setTimeout(() => {
          setShowLeague(true);
          fetchLeague(leaguePeriod);
        }, 10);
      }}
      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] text-gray-400 hover:text-amber-400 hover:bg-amber-400/5 border border-white/[0.05] hover:border-amber-400/20 transition-all"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9H4a2 2 0 00-2 2v1a2 2 0 002 2h2M18 9h2a2 2 0 012 2v1a2 2 0 01-2 2h-2" />
        <path d="M6 9v8a6 6 0 0012 0V9M6 9H18M8 9V5h8v4" />
      </svg>
      Liga
    </button>
  </div>
*/
