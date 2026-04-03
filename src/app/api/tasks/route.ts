import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_tasks")
    .select("tasks")
    .eq("user_email", session.user.email)
    .single();

  // PGRST116 = row not found (first time user)
  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: data?.tasks ?? null });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let tasks: unknown;
  try {
    const body = await req.json();
    tasks = body?.tasks;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!Array.isArray(tasks)) {
    return NextResponse.json({ error: "tasks must be an array" }, { status: 400 });
  }

  const { error } = await supabase
    .from("user_tasks")
    .upsert(
      {
        user_email: session.user.email,
        tasks,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_email" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
