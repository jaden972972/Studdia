"use client";
import { useState, useRef } from "react";

interface Task {
  id: string;
  text: string;
  done: boolean;
}

// TODO: replace mock state with Supabase sync to a `tasks` table
const INITIAL: Task[] = [
  { id: "1", text: "Review lecture notes", done: false },
  { id: "2", text: "Complete problem set", done: false },
];

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const add = () => {
    const text = input.trim();
    if (!text) return;
    setTasks((t) => [...t, { id: Date.now().toString(), text, done: false }]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggle = (id: string) =>
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));

  const remove = (id: string) =>
    setTasks((t) => t.filter((x) => x.id !== id));

  const remaining = tasks.filter((t) => !t.done).length;
  const allDone = tasks.length > 0 && remaining === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Tasks</p>
        <span
          className="text-[10px] font-bold tabular-nums"
          style={{ color: allDone ? "#10b981" : "#8b5cf6" }}
        >
          {allDone ? "All done" : `${remaining} left`}
        </span>
      </div>

      {/* Add input */}
      <div className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="Add a task..."
          className="flex-1 bg-black/40 border border-white/[0.07] rounded-xl px-3 py-2 text-xs text-white placeholder:text-gray-600 outline-none focus:border-violet-500/40 transition-colors"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button
          onClick={add}
          className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-all active:scale-95 hover:brightness-110"
          style={{ background: "#8b5cf6" }}
          title="Add task"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto min-h-0">
        {tasks.length === 0 ? (
          <p className="text-[11px] text-gray-700 italic text-center py-6">
            Nothing here. Add something to stay focused.
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200"
              style={{
                background: task.done ? "rgba(139,92,246,0.04)" : "rgba(255,255,255,0.02)",
                borderColor: task.done ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.05)",
              }}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggle(task.id)}
                className="w-4 h-4 rounded shrink-0 flex items-center justify-center border transition-all duration-200"
                style={
                  task.done
                    ? { background: "#8b5cf6", borderColor: "#8b5cf6" }
                    : { background: "transparent", borderColor: "#3f3f46" }
                }
              >
                {task.done && (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>

              {/* Text */}
              <span
                className="flex-1 text-xs leading-relaxed transition-all duration-200"
                style={{
                  color: task.done ? "#4b4b55" : "#d4d4d8",
                  textDecoration: task.done ? "line-through" : "none",
                }}
              >
                {task.text}
              </span>

              {/* Delete */}
              <button
                onClick={() => remove(task.id)}
                className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-all shrink-0 p-0.5"
                title="Delete"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
