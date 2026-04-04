import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabase } from "@/lib/supabase";

/**
 * DEBUG-ONLY route to toggle the current user's plan to 'pro'.
 * Protected by:
 *   1. NODE_ENV check — blocked in production unless DEBUG_SECRET is set.
 *   2. DEBUG_SECRET env var — required when NODE_ENV === 'production'.
 *   3. Must be authenticated.
 *
 * Usage (dev):  GET /api/debug/pro-on
 * Usage (prod): GET /api/debug/pro-on?secret=<DEBUG_SECRET>
 *
 * REMOVE THIS ROUTE before public launch.
 */
export async function GET(req: Request) {
  const isProd = process.env.NODE_ENV === "production";
  const debugSecret = process.env.DEBUG_SECRET;

  if (isProd) {
    const { searchParams } = new URL(req.url);
    const provided = searchParams.get("secret");
    if (!debugSecret || provided !== debugSecret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_email: session.user.email,
        plan_type: "pro",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_email" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: `${session.user.email} upgraded to Pro`,
    warning: "Remove this route before public launch.",
  });
}
