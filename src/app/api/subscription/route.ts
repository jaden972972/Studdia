import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ planType: "free", leagueTier: "novato", legendBadge: false });
  }

  const { data } = await supabase
    .from("profiles")
    .select("plan_type, legend_badge")
    .eq("user_email", session.user.email)
    .single();

  const { data: stats } = await supabase
    .from("session_stats")
    .select("league_tier")
    .eq("user_email", session.user.email)
    .single();

  return NextResponse.json({
    planType: data?.plan_type ?? "free",
    leagueTier: stats?.league_tier ?? "novato",
    legendBadge: data?.legend_badge ?? false,
  });
}
