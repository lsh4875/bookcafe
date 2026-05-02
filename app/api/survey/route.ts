import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { genre, expectation, intention, price, region, submittedAt, userId } = body;

    if (!genre || !intention) {
      return NextResponse.json({ error: "필수 항목이 누락됐습니다." }, { status: 400 });
    }

    const { error } = await supabase.from("surveys").insert([{
      genre,
      expectation: expectation || "",
      intention,
      price: price || "",
      region: region || "",
      submitted_at: submittedAt,
      user_id: userId || null,
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