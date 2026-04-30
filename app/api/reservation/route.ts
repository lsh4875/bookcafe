import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, timeSlot, headcount, note, popup, place, submittedAt } = body;

    if (!name || !phone || !email || !timeSlot) {
      return NextResponse.json({ error: "필수 항목이 누락됐습니다." }, { status: 400 });
    }

    const { error } = await supabase.from("reservations").insert([{
      name,
      phone,
      email,
      time_slot: timeSlot,
      headcount: String(headcount),
      note: note || "",
      popup,
      place,
      submitted_at: submittedAt,
    }]);

    if (error) {
      console.error("[Supabase error]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[reservation API error]", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}