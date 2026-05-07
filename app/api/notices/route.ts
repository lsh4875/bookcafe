import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createAdminSupabaseClient();
  const { data: notice } = await supabase
    .from("notices")
    .select("id, content, link")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({ notice: notice ?? null });
}