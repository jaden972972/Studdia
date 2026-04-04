import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabase } from "@/lib/supabase";

/** Monday of the current UTC week as YYYY-MM-DD */
function getWeekStart(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff)
  );
  return monday.toISOString().split("T")[0];
}

/** POST — record a completed ≥25-min focus session */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekStart = getWeekStart();
  const displayName =
    session.user.name ?? session.user.email.split("@")[0];

  const { data: existing } = await supabase
    .from("session_stats")
    .select("sessions_total, sessions_week, week_start")
    .eq("user_email", session.user.email)
    .single();

  const isSameWeek = existing?.week_start === weekStart;
  const newTotal = (existing?.sessions_total ?? 0) + 1;
  const newWeek = isSameWeek ? (existing?.sessions_week ?? 0) + 1 : 1;

  const { error } = await supabase.from("session_stats").upsert(
    {
      user_email: session.user.email,
      display_name: displayName,
      sessions_total: newTotal,
      sessions_week: newWeek,
      week_start: weekStart,
      last_session_at: new Date().toISOString(),
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
  });
}

/** GET — leaderboard top 20. ?period=week|total */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const currentEmail = session?.user?.email ?? null;

  const period =
    new URL(req.url).searchParams.get("period") === "total" ? "total" : "week";
  const column =
    period === "total" ? "sessions_total" : "sessions_week";

  const { data, error } = await supabase
    .from("session_stats")
    .select("display_name, sessions_total, sessions_week, user_email")
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
      isMe: row.user_email === currentEmail,
    })),
  });
}
