import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ planType: "free" });
  }

  const { data } = await supabase
    .from("profiles")
    .select("plan_type")
    .eq("user_email", session.user.email)
    .single();

  return NextResponse.json({ planType: data?.plan_type ?? "free" });
}
