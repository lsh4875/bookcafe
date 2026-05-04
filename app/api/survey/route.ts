import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      genre, expectation, intention, price, region,
      submittedAt, userId,
      submitterName, submitterPhone, submitterEmail,
    } = body;

    if (!intention) {
      return NextResponse.json({ error: "필수 항목이 누락됐습니다." }, { status: 400 });
    }

    // 로그인 유저 중복 체크
    if (userId) {
      const { data: existing } = await supabase
        .from("surveys")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existing) {
        return NextResponse.json({ error: "이미 설문에 참여하셨습니다.", code: "DUPLICATE_USER" }, { status: 409 });
      }
    }

    // 비로그인 유저 중복 체크 (이메일 또는 전화번호 — 로그인 유저 데이터 포함)
    if (!userId && (submitterEmail || submitterPhone)) {
      const orConditions = [];
      if (submitterEmail) orConditions.push(`submitter_email.eq.${submitterEmail}`);
      if (submitterPhone) orConditions.push(`submitter_phone.eq.${submitterPhone}`);

      const { data: existing } = await supabase
        .from("surveys")
        .select("id")
        .or(orConditions.join(","))
        .single();

      if (existing) {
        return NextResponse.json({ error: "이미 동일한 이메일 또는 전화번호로 설문에 참여하셨습니다.", code: "DUPLICATE_CONTACT" }, { status: 409 });
      }
    }

    // 로그인 유저도 이메일 저장
    const emailToSave = submitterEmail || null;
    const phoneToSave = submitterPhone || null;
    const nameToSave = submitterName || null;

    const { error } = await supabase.from("surveys").insert([{
      genre: JSON.stringify(genre),
      expectation: expectation || "",
      intention,
      price: price || "",
      region: region || "",
      submitted_at: submittedAt,
      user_id: userId || null,
      submitter_name: nameToSave,
      submitter_phone: phoneToSave,
      submitter_email: emailToSave,
    }]);

    if (error) {
      console.error("[Supabase error]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[survey API error]", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId가 누락됐습니다." }, { status: 400 });
    }

    const { error } = await supabase
      .from("surveys")
      .delete()
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[survey DELETE error]", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}