import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

const supabase = createAdminSupabaseClient();

export async function GET() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, phone, gender, birth_date, is_onboarded, is_admin, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "id가 누락됐습니다." }, { status: 400 });
    }

    // auth.users에서 삭제 (profiles는 cascade로 자동 삭제)
    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin members DELETE error]", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}