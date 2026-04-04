import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabase } from "@/lib/supabase";

/** Monday of the current UTC week as YYYY-MM-DD */
function getWeekStart(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff)
  );
  return monday.toISOString().split("T")[0];
}

/** Today as YYYY-MM-DD (local midnight) */
function todayLocal(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString().split("T")[0];
}

/** Returns new streak value based on last session date */
function calcStreak(lastDate: string | null | undefined, currentStreak: number): number {
  if (!lastDate) return 1;
  const last = new Date(lastDate);
  last.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - last.getTime()) / 86_400_000);
  if (diffDays === 0) return currentStreak;       // same day, no change
  if (diffDays === 1) return currentStreak + 1;   // consecutive day
  return 1;                                        // streak broken
}

/** POST — record a completed ≥25-min focus session */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekStart = getWeekStart();
  const today = todayLocal();
  const displayName = session.user.name ?? session.user.email.split("@")[0];

  const { data: existing } = await supabase
    .from("session_stats")
    .select("sessions_total, sessions_week, week_start, streak, last_session_date")
    .eq("user_email", session.user.email)
    .single();

  const isSameWeek = existing?.week_start === weekStart;
  const newTotal = (existing?.sessions_total ?? 0) + 1;
  const newWeek = isSameWeek ? (existing?.sessions_week ?? 0) + 1 : 1;
  const newStreak = calcStreak(existing?.last_session_date, existing?.streak ?? 0);

  const { error } = await supabase.from("session_stats").upsert(
    {
      user_email: session.user.email,
      display_name: displayName,
      sessions_total: newTotal,
      sessions_week: newWeek,
      week_start: weekStart,
      last_session_at: new Date().toISOString(),
      streak: newStreak,
      last_session_date: today,
      // Only set league_tier for new rows (existing rows keep their current tier)
      ...(existing ? {} : { league_tier: "novato" }),
    },
    { onConflict: "user_email" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    sessions_total: newTotal,
    sessions_week: newWeek,
    streak: newStreak,
  });
}

/** GET — leaderboard top 20 (?period=week|total) or personal streak (?me=1) */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const currentEmail = session?.user?.email ?? null;
  const url = new URL(req.url);

  // Personal stats endpoint
  if (url.searchParams.get("me") === "1" && currentEmail) {
    const { data } = await supabase
      .from("session_stats")
      .select("streak, last_session_date")
      .eq("user_email", currentEmail)
      .single();
    return NextResponse.json({ streak: data?.streak ?? 0, last_session_date: data?.last_session_date ?? null });
  }

  const period = url.searchParams.get("period") === "total" ? "total" : "week";
  const column = period === "total" ? "sessions_total" : "sessions_week";

  const { data, error } = await supabase
    .from("session_stats")
    .select("display_name, sessions_total, sessions_week, streak, user_email")
    .order(column, { ascending: false })
    .gt(column, 0)
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    leaderboard: (data ?? []).map((row) => ({
      display_name: row.display_name,
      sessions_total: row.sessions_total,
      sessions_week: row.sessions_week,
      streak: row.streak ?? 0,
      isMe: row.user_email === currentEmail,
    })),
  });
}
