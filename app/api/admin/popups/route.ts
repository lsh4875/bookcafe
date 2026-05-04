import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

const supabase = createAdminSupabaseClient();

export async function GET() {
  const { data, error } = await supabase
    .from("popups")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "id가 누락됐습니다." }, { status: 400 });
    }

    const { error } = await supabase
      .from("popups")
      .update(updates)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin popups PATCH error]", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { month, title, location, capacity, time, price } = body;

    // 기존 활성 팝업 비활성화
    await supabase
      .from("popups")
      .update({ is_active: false })
      .eq("is_active", true);

    const { error } = await supabase
      .from("popups")
      .insert([{ month, title, location, capacity, time, price, is_active: true }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin popups POST error]", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}