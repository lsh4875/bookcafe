import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

const supabase = createAdminSupabaseClient();

export async function GET() {
  const { data, error } = await supabase
    .from("popups")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}