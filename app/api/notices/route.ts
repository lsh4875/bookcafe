import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const supabase = createAdminSupabaseClient();
  const all = req.nextUrl.searchParams.get("all");

  if (all) {
    const { data: notices } = await supabase
      .from("notices")
      .select("id, content, link, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    return NextResponse.json({ notices: notices ?? [] });
  }

  const { data: notice } = await supabase
    .from("notices")
    .select("id, content, link")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ notice: notice ?? null });
}