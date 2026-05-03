import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

const supabase = createAdminSupabaseClient();

// 전체 예약 목록
export async function GET() {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// 예약 상태 변경
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();

    const validStatuses = ["pending", "confirmed", "cancelled"];
    if (!id || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "올바르지 않은 요청입니다." }, { status: 400 });
    }

    const { error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin reservations PATCH error]", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}