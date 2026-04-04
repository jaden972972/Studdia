"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabase } from "@/lib/supabase";
import { PLAN_LIMITS } from "@/lib/subscription";

export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: TaskPriority;
  createdAt: number;
}

export type AddTaskResult =
  | { ok: true; tasks: Task[] }
  | { error: "UNAUTHORIZED" | "LIMIT_REACHED" | "DB_ERROR" };

export async function addTask(task: Task): Promise<AddTaskResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "UNAUTHORIZED" };

  const email = session.user.email;

  // Fetch plan — default to 'free' if no row exists yet
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_type")
    .eq("user_email", email)
    .single();

  const planType = profile?.plan_type === "pro" ? "pro" : "free";

  // Fetch current tasks from DB (source of truth for limit check)
  const { data: row } = await supabase
    .from("user_tasks")
    .select("tasks")
    .eq("user_email", email)
    .single();

  const current: Task[] = Array.isArray(row?.tasks) ? (row.tasks as Task[]) : [];

  // Enforce hard server-side limit
  const maxTasks = PLAN_LIMITS[planType].maxTasks;
  if (maxTasks !== null && current.length >= maxTasks) {
    return { error: "LIMIT_REACHED" };
  }

  const updated = [task, ...current];

  const { error: upsertError } = await supabase
    .from("user_tasks")
    .upsert(
      { user_email: email, tasks: updated, updated_at: new Date().toISOString() },
      { onConflict: "user_email" }
    );

  if (upsertError) return { error: "DB_ERROR" };

  return { ok: true, tasks: updated };
}
