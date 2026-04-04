import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabase } from "@/lib/supabase";

export type LeagueTier = "novato" | "aficionado" | "elite";

// ─── Season advancement rules ────────────────────────────────────────────────
//  Novato:     top 5 → Aficionado,  no demotions
//  Aficionado: top 5 → Élite,       bottom 5 → Novato
//  Élite:      no promotions,        bottom 7 → Aficionado
// Every room is capped at 30 users. Weekly points reset after advancement.
// ─────────────────────────────────────────────────────────────────────────────

const ROOM_SIZE = 30;

type RoomRow = {
  user_email: string;
  display_name: string;
  sessions_week: number;
  league_room: string | null;
};

/** Fisher-Yates shuffle (in-place) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Assign random rooms of ROOM_SIZE for a tier. Returns bulk-upsert rows. */
function assignRooms(
  users: { user_email: string }[],
  tier: LeagueTier,
  seasonId: string
): { user_email: string; league_room: string }[] {
  const shuffled = shuffle([...users]);
  return shuffled.map((u, idx) => ({
    user_email: u.user_email,
    league_room: `${tier}-${seasonId}-${Math.floor(idx / ROOM_SIZE)}`,
  }));
}

// ─── GET /api/leagues ─────────────────────────────────────────────────────────
// ?tier=novato|aficionado|elite   &period=week|total
// Returns the leaderboard scoped to the caller's current room (or full tier if ?global=1)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const currentEmail = session?.user?.email ?? null;
  const url = new URL(req.url);

  const tier = (url.searchParams.get("tier") ?? "novato") as LeagueTier;
  const period = url.searchParams.get("period") === "total" ? "total" : "week";
  const global = url.searchParams.get("global") === "1";
  const column = period === "total" ? "sessions_total" : "sessions_week";

  let query = supabase
    .from("session_stats")
    .select("display_name, sessions_total, sessions_week, streak, user_email, league_tier, league_room")
    .eq("league_tier", tier)
    .order(column, { ascending: false })
    .limit(30);

  // If the user is authenticated and not requesting global, scope to their room
  if (currentEmail && !global) {
    const { data: me } = await supabase
      .from("session_stats")
      .select("league_room")
      .eq("user_email", currentEmail)
      .single();

    if (me?.league_room) {
      query = query.eq("league_room", me.league_room);
    }
  }

  const { data, error } = await query;
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

// ─── POST /api/leagues ────────────────────────────────────────────────────────
// Two actions:
//   action=reshuffle  — assign new rooms for the week (call every Monday)
//   action=advance    — end-of-season promotions/demotions + points reset
// Both require x-admin-secret header.
export async function POST(req: Request) {
  const adminSecret = req.headers.get("x-admin-secret");
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const action: string = body.action ?? "advance";

  if (action === "reshuffle") {
    return handleReshuffle();
  }
  return handleAdvance();
}

// ─── RESHUFFLE: assign fresh random rooms of 30 ───────────────────────────────
async function handleReshuffle() {
  const seasonId = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const results: string[] = [];

  for (const tier of ["novato", "aficionado", "elite"] as LeagueTier[]) {
    const { data: users } = await supabase
      .from("session_stats")
      .select("user_email")
      .eq("league_tier", tier);

    if (!users || users.length === 0) continue;

    const roomAssignments = assignRooms(users, tier, seasonId);

    // Bulk-update in batches of 500
    for (let i = 0; i < roomAssignments.length; i += 500) {
      const batch = roomAssignments.slice(i, i + 500);
      await supabase.from("session_stats").upsert(
        batch.map((r) => ({ user_email: r.user_email, league_room: r.league_room })),
        { onConflict: "user_email" }
      );
    }

    const roomCount = Math.ceil(users.length / ROOM_SIZE);
    results.push(`${tier}: ${users.length} users → ${roomCount} rooms of ~${ROOM_SIZE}`);
  }

  return NextResponse.json({ ok: true, action: "reshuffle", results });
}

// ─── ADVANCE: season-end promotions, demotions, and points reset ──────────────
async function handleAdvance() {
  const results: string[] = [];

  // ── 1. NOVATO: top 5 per room → Aficionado, no demotions ──────────────────
  {
    const { data: rooms } = await supabase
      .from("session_stats")
      .select("league_room")
      .eq("league_tier", "novato")
      .not("league_room", "is", null);

    const uniqueRooms = [...new Set((rooms ?? []).map((r) => r.league_room))];
    const promoted: string[] = [];

    for (const room of uniqueRooms) {
      const { data: players } = await supabase
        .from("session_stats")
        .select("user_email, display_name, sessions_week")
        .eq("league_tier", "novato")
        .eq("league_room", room)
        .order("sessions_week", { ascending: false })
        .gt("sessions_week", 0)
        .limit(5);

      if (players && players.length > 0) {
        promoted.push(...players.map((p) => p.user_email));
      }
    }

    if (promoted.length > 0) {
      await supabase
        .from("session_stats")
        .update({ league_tier: "aficionado" })
        .in("user_email", promoted);
      results.push(`novato → aficionado: ${promoted.length} promoted`);
    }
  }

  // ── 2. AFICIONADO: top 5 → Élite, bottom 5 → Novato (per room) ────────────
  {
    const { data: rooms } = await supabase
      .from("session_stats")
      .select("league_room")
      .eq("league_tier", "aficionado")
      .not("league_room", "is", null);

    const uniqueRooms = [...new Set((rooms ?? []).map((r) => r.league_room))];
    const toElite: string[] = [];
    const toNovato: string[] = [];

    for (const room of uniqueRooms) {
      const { data: players } = await supabase
        .from("session_stats")
        .select("user_email, display_name, sessions_week")
        .eq("league_tier", "aficionado")
        .eq("league_room", room)
        .order("sessions_week", { ascending: false });

      if (!players || players.length === 0) continue;

      // Top 5 (but only those who actually scored)
      const scorers = players.filter((p) => p.sessions_week > 0);
      toElite.push(...scorers.slice(0, 5).map((p) => p.user_email));

      // Bottom 5 of the full room (demote regardless of score)
      toNovato.push(...players.slice(-5).map((p) => p.user_email));
    }

    // Remove overlap: if someone is in both lists (tiny room), promotion wins
    const toNovatoFiltered = toNovato.filter((e) => !toElite.includes(e));

    if (toElite.length > 0) {
      await supabase
        .from("session_stats")
        .update({ league_tier: "elite" })
        .in("user_email", toElite);
      results.push(`aficionado → elite: ${toElite.length} promoted`);
    }
    if (toNovatoFiltered.length > 0) {
      await supabase
        .from("session_stats")
        .update({ league_tier: "novato" })
        .in("user_email", toNovatoFiltered);
      results.push(`aficionado → novato: ${toNovatoFiltered.length} demoted`);
    }
  }

  // ── 3. ÉLITE: bottom 7 → Aficionado, top 1 wins prize (per room) ──────────
  {
    const { data: rooms } = await supabase
      .from("session_stats")
      .select("league_room")
      .eq("league_tier", "elite")
      .not("league_room", "is", null);

    const uniqueRooms = [...new Set((rooms ?? []).map((r) => r.league_room))];
    const toAficionado: string[] = [];
    const winners: string[] = [];

    for (const room of uniqueRooms) {
      const { data: players } = await supabase
        .from("session_stats")
        .select("user_email, display_name, sessions_week")
        .eq("league_tier", "elite")
        .eq("league_room", room)
        .order("sessions_week", { ascending: false });

      if (!players || players.length === 0) continue;

      // #1 wins the prize (only if they actually completed sessions)
      if (players[0].sessions_week > 0) winners.push(players[0].user_email);

      // Bottom 7 demoted
      toAficionado.push(...players.slice(-7).map((p) => p.user_email));
    }

    // Winner protection: if #1 is also in bottom 7 (tiny room), keep them in elite
    const toAficionadoFiltered = toAficionado.filter((e) => !winners.includes(e));

    if (toAficionadoFiltered.length > 0) {
      await supabase
        .from("session_stats")
        .update({ league_tier: "aficionado" })
        .in("user_email", toAficionadoFiltered);
      results.push(`elite → aficionado: ${toAficionadoFiltered.length} demoted`);
    }

    // Award prizes to room winners
    for (const winnerEmail of winners) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan_type")
        .eq("user_email", winnerEmail)
        .single();

      if (profile?.plan_type === "pro") {
        await supabase
          .from("profiles")
          .upsert({ user_email: winnerEmail, legend_badge: true }, { onConflict: "user_email" });
        results.push(`elite winner ${winnerEmail}: already Pro → Leyenda badge`);
      } else {
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);
        await supabase.from("profiles").upsert(
          { user_email: winnerEmail, plan_type: "pro", pro_expires_at: expires.toISOString() },
          { onConflict: "user_email" }
        );
        results.push(`elite winner ${winnerEmail}: 30 days Pro granted`);
      }
    }
  }

  // ── 4. Reset sessions_week to 0 for all tiers ─────────────────────────────
  await supabase.from("session_stats").update({ sessions_week: 0 }).gte("sessions_week", 0);
  results.push("sessions_week reset to 0 for all users");

  return NextResponse.json({ ok: true, action: "advance", results });
}
