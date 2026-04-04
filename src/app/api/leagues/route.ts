import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabase } from "@/lib/supabase";

export type LeagueTier = "novato" | "aficionado" | "elite";

export const LEAGUE_CONFIG: Record<LeagueTier, { label: string; emoji: string; color: string; promotions: number }> = {
  novato:     { label: "Novato",     emoji: "🌱", color: "#6b7280", promotions: 3 },
  aficionado: { label: "Aficionado", emoji: "⚡", color: "#f59e0b", promotions: 3 },
  elite:      { label: "Élite",      emoji: "👑", color: "#8b5cf6", promotions: 1 },
};

/** GET /api/leagues — leaderboard for a tier (?tier=novato|aficionado|elite&period=week|total) */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const currentEmail = session?.user?.email ?? null;
  const url = new URL(req.url);

  const tier = (url.searchParams.get("tier") ?? "novato") as LeagueTier;
  const period = url.searchParams.get("period") === "total" ? "total" : "week";
  const column = period === "total" ? "sessions_total" : "sessions_week";

  const { data, error } = await supabase
    .from("session_stats")
    .select("display_name, sessions_total, sessions_week, streak, user_email, league_tier")
    .eq("league_tier", tier)
    .order(column, { ascending: false })
    .gt(column, 0)
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    tier,
    leaderboard: (data ?? []).map((row) => ({
      display_name: row.display_name,
      sessions_total: row.sessions_total,
      sessions_week: row.sessions_week,
      streak: row.streak ?? 0,
      isMe: row.user_email === currentEmail,
    })),
  });
}

/** POST /api/leagues/advance — run at end of season (call from admin or cron) */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only allow server-side admin calls (check secret header)
  const authHeader = req.headers.get("x-admin-secret");
  if (authHeader !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results: string[] = [];

  // Process each tier: find top N and promote
  for (const [tier, config] of Object.entries(LEAGUE_CONFIG) as [LeagueTier, typeof LEAGUE_CONFIG[LeagueTier]][]) {
    const nextTier: LeagueTier | null =
      tier === "novato" ? "aficionado" : tier === "aficionado" ? "elite" : null;

    if (!nextTier) {
      // ── ELITE: #1 wins the prize ──
      const { data: eliteTop } = await supabase
        .from("session_stats")
        .select("user_email, display_name, sessions_week")
        .eq("league_tier", "elite")
        .order("sessions_week", { ascending: false })
        .gt("sessions_week", 0)
        .limit(1)
        .single();

      if (eliteTop) {
        // Is winner already Pro?
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan_type, pro_expires_at")
          .eq("user_email", eliteTop.user_email)
          .single();

        if (profile?.plan_type === "pro") {
          // Already Pro → grant Leyenda badge
          await supabase.from("profiles").upsert(
            { user_email: eliteTop.user_email, legend_badge: true },
            { onConflict: "user_email" }
          );
          results.push(`Elite winner ${eliteTop.display_name} already Pro → Leyenda badge granted`);
        } else {
          // Not Pro → activate 30 days Pro
          const expires = new Date();
          expires.setDate(expires.getDate() + 30);
          await supabase.from("profiles").upsert(
            {
              user_email: eliteTop.user_email,
              plan_type: "pro",
              pro_expires_at: expires.toISOString(),
            },
            { onConflict: "user_email" }
          );
          results.push(`Elite winner ${eliteTop.display_name} → 30 days Pro activated`);
        }
      }
      continue;
    }

    // Promote top N from this tier to nextTier
    const { data: topPlayers } = await supabase
      .from("session_stats")
      .select("user_email, display_name")
      .eq("league_tier", tier)
      .order("sessions_week", { ascending: false })
      .gt("sessions_week", 0)
      .limit(config.promotions);

    if (topPlayers && topPlayers.length > 0) {
      const emails = topPlayers.map((p) => p.user_email);
      await supabase
        .from("session_stats")
        .update({ league_tier: nextTier })
        .in("user_email", emails);

      results.push(`Promoted ${emails.length} from ${tier} → ${nextTier}: ${topPlayers.map((p) => p.display_name).join(", ")}`);
    }

    // Reset weekly sessions for all in this tier after advancement
    await supabase
      .from("session_stats")
      .update({ sessions_week: 0 })
      .eq("league_tier", tier);
  }

  return NextResponse.json({ ok: true, results });
}
