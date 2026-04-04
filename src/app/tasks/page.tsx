"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { addTask as addTaskAction } from "@/app/actions/tasks";
import { useSubscription } from "@/hooks/useSubscription";
import { PLAN_LIMITS } from "@/lib/subscription";
import ProModal from "@/app/components/ProModal";
import PremiumPlant from "@/app/components/PremiumPlant";

type Priority = "high" | "medium" | "low";
type Filter = "all" | "active" | "done";

interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  createdAt: number;
}

const PRIORITY_META: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  high:   { label: "High",   color: "#f87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.25)" },
  medium: { label: "Medium", color: "#fbbf24", bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.25)" },
  low:    { label: "Low",    color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.2)" },
};

const ACCENT = "#8b5cf6";

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("studdia_tasks_v1");
    if (!raw) return [];
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem("studdia_tasks_v1", JSON.stringify(tasks));
}

export default function TasksPage() {
  const { data: session } = useSession();
  const { isPro, limits, loading: subLoading } = useSubscription();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [showDone, setShowDone] = useState(true);
  const [showProModal, setShowProModal] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);
  const sessionRef = useRef(session);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { sessionRef.current = session; }, [session]);

  // Load: Supabase if logged in, localStorage otherwise
  useEffect(() => {
    if (session === undefined) return;
    initialized.current = false;

    const load = async () => {
      let loaded = false;

      if (session?.user) {
        try {
          const res = await fetch("/api/tasks");
          const data = await res.json();
          if (Array.isArray(data.tasks)) {
            setTasks(data.tasks);
            loaded = true;
          }
        } catch (e) {
          console.error("Error loading tasks from Supabase:", e);
        }
      }

      if (!loaded) {
        setTasks(loadTasks());
      }

      setTimeout(() => { initialized.current = true; }, 0);
    };

    load();
  }, [session]);

  // Save toggle/delete changes: localStorage always + Supabase debounced when logged in
  useEffect(() => {
    if (!initialized.current) return;
    saveTasks(tasks);
    if (sessionRef.current?.user) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        fetch("/api/tasks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks }),
        }).catch(e => console.error("Error saving tasks:", e));
      }, 1500);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [tasks]);

  const add = async () => {
    const text = input.trim();
    if (!text || addingTask) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text,
      done: false,
      priority,
      createdAt: Date.now(),
    };

    if (session?.user) {
      // Server Action path: limit enforced server-side
      setAddingTask(true);
      const result = await addTaskAction(newTask);
      setAddingTask(false);
      if ("error" in result) {
        if (result.error === "LIMIT_REACHED") setShowProModal(true);
        return;
      }
      // Server returned updated array → sync local state + localStorage
      setTasks(result.tasks);
      saveTasks(result.tasks);
    } else {
      // Guest path: enforce limit locally
      const localLimit = PLAN_LIMITS.free.maxTasks!;
      if (tasks.length >= localLimit) {
        setShowProModal(true);
        return;
      }
      setTasks((prev) => [newTask, ...prev]);
    }

    setInput("");
    inputRef.current?.focus();
  };

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const clearDone = () =>
    setTasks((prev) => prev.filter((t) => !t.done));

  // Stats
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const active = total - done;
  const highPending = tasks.filter((t) => !t.done && t.priority === "high").length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  const maxTasks = limits.maxTasks;
  const atLimit = !isPro && maxTasks !== null && tasks.length >= maxTasks;

  // Filtered list
  const visible = tasks.filter((t) => {
    const matchFilter =
      filter === "all" ? true : filter === "active" ? !t.done : t.done;
    const matchSearch = t.text.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const activeTasks = visible.filter((t) => !t.done);
  const doneTasks   = visible.filter((t) => t.done);

  return (
    <main className="min-h-screen bg-[#080808] text-white font-sans flex flex-col">
      <ProModal open={showProModal} onClose={() => setShowProModal(false)} />
      {/* ── HEADER ── */}
      <header className="shrink-0 flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/[0.05] bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <span className="font-black text-sm tracking-tight">Studdia</span>
            <span className="text-gray-600 text-xs ml-2">/ Tasks</span>
          </div>
        </div>
        <Link
          href="/cockpit"
          className="flex items-center gap-1.5 text-[11px] text-gray-600 hover:text-gray-300 transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to cockpit
        </Link>
        <div className="flex items-center gap-1.5 text-[10px]" style={{ color: session?.user ? "#10b981" : "#4b5563" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {session?.user
              ? <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/>
              : <path d="M4 4h16v16H4zM8 4V2M16 4V2"/>}
          </svg>
          {session?.user ? "Synced to cloud" : "Saved locally"}
        </div>
      </header>

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col gap-6">

        {/* ── PAGE TITLE ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Task Dashboard</h1>
            <p className="text-gray-600 text-sm mt-0.5">Stay disciplined. One task at a time.</p>
          </div>
          <div className="flex items-center gap-2">
            {isPro && !subLoading && (
              <>
                <PremiumPlant />
                <span
                  className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border"
                  style={{ color: "#a78bfa", background: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.3)" }}
                >
                  Pro
                </span>
              </>
            )}
            {!isPro && !subLoading && (
              <button
                onClick={() => setShowProModal(true)}
                className="text-[10px] font-bold text-gray-600 hover:text-violet-400 transition-colors px-2.5 py-1 rounded-lg border border-white/[0.06] hover:border-violet-500/30"
              >
                Upgrade →
              </button>
            )}
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total",    value: total,       color: ACCENT },
            { label: "Active",   value: active,      color: "#e879f9" },
            { label: "Done",     value: done,        color: "#10b981" },
            { label: "Urgent",   value: highPending, color: "#f87171" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center py-3.5 px-2 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            >
              <span className="text-xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</span>
              <span className="text-[10px] text-gray-600 mt-0.5 tracking-wide">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── PROGRESS BAR ── */}
        {total > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">Progress</span>
              <span className="text-[10px] font-black tabular-nums" style={{ color: progress === 100 ? "#10b981" : ACCENT }}>
                {progress}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: progress === 100
                    ? "#10b981"
                    : `linear-gradient(90deg, #8b5cf6, #a78bfa)`,
                }}
              />
            </div>
          </div>
        )}

        {/* ── ADD TASK FORM ── */}
        <div className="flex flex-col gap-2 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          {/* Limit bar for free users */}
          {!isPro && maxTasks !== null && (
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-600">
                {tasks.length} / {maxTasks} tasks
                {atLimit && (
                  <span className="ml-2 text-red-400 font-bold">· Limit reached</span>
                )}
              </span>
              {atLimit && (
                <button
                  onClick={() => setShowProModal(true)}
                  className="text-[10px] font-black text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Get Pro →
                </button>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={atLimit ? "Upgrade to Pro for unlimited tasks..." : "New task..."}
              disabled={atLimit}
              className="flex-1 bg-black/40 border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none focus:border-violet-500/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <button
              onClick={atLimit ? () => setShowProModal(true) : add}
              disabled={(!atLimit && !input.trim()) || addingTask}
              className="px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-30 shrink-0"
              style={{ background: atLimit ? "rgba(139,92,246,0.3)" : ACCENT }}
            >
              {addingTask ? "···" : atLimit ? "🔒" : "Add"}
            </button>
          </div>
          {/* Priority selector */}
          <div className="flex gap-1.5">
            {(["high", "medium", "low"] as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                disabled={atLimit}
                className="flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border disabled:opacity-30"
                style={
                  priority === p
                    ? { background: PRIORITY_META[p].bg, color: PRIORITY_META[p].color, borderColor: PRIORITY_META[p].border }
                    : { color: "#444", borderColor: "rgba(255,255,255,0.05)", background: "transparent" }
                }
              >
                {PRIORITY_META[p].label}
              </button>
            ))}
          </div>
        </div>

        {/* ── FILTERS + SEARCH ── */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          {/* Status tabs */}
          <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/[0.06]">
            {(["all", "active", "done"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                style={
                  filter === f
                    ? { background: ACCENT, color: "white" }
                    : { color: "#555" }
                }
              >
                {f}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="bg-black/40 border border-white/[0.07] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-gray-600 outline-none focus:border-violet-500/30 transition-colors w-44"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── TASK LIST ── */}
        <div className="flex flex-col gap-1.5">
          {/* Active tasks */}
          {activeTasks.length === 0 && filter !== "done" && (
            <div className="text-center py-10">
              <p className="text-gray-700 text-sm">
                {search ? "No tasks match your search." : "No active tasks. Add one above."}
              </p>
            </div>
          )}
          {activeTasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={toggle} onRemove={remove} />
          ))}

          {/* Done section */}
          {doneTasks.length > 0 && filter !== "active" && (
            <>
              <div className="flex items-center justify-between mt-4 mb-1">
                <button
                  onClick={() => setShowDone((v) => !v)}
                  className="flex items-center gap-1.5 text-[10px] text-gray-600 hover:text-gray-400 transition-colors font-semibold uppercase tracking-widest"
                >
                  <svg
                    width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transform: showDone ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                  Completed ({doneTasks.length})
                </button>
                <button
                  onClick={clearDone}
                  className="text-[10px] text-gray-700 hover:text-red-400 transition-colors"
                >
                  Clear all
                </button>
              </div>
              {showDone && doneTasks.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={toggle} onRemove={remove} />
              ))}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function TaskRow({
  task,
  onToggle,
  onRemove,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const p = PRIORITY_META[task.priority];
  return (
    <div
      className="group flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200"
      style={{
        background: task.done ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.03)",
        borderColor: task.done ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)",
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className="w-5 h-5 rounded-md shrink-0 flex items-center justify-center border-2 transition-all duration-200"
        style={
          task.done
            ? { background: "#10b981", borderColor: "#10b981" }
            : { background: "transparent", borderColor: "#3f3f46" }
        }
      >
        {task.done && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </button>

      {/* Text */}
      <span
        className="flex-1 text-sm leading-relaxed transition-colors duration-200"
        style={{
          color: task.done ? "#3f3f46" : "#d4d4d8",
          textDecoration: task.done ? "line-through" : "none",
        }}
      >
        {task.text}
      </span>

      {/* Priority badge */}
      {!task.done && (
        <span
          className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border"
          style={{ color: p.color, background: p.bg, borderColor: p.border }}
        >
          {p.label}
        </span>
      )}

      {/* Delete */}
      <button
        onClick={() => onRemove(task.id)}
        className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-all shrink-0 p-1"
        title="Delete"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
