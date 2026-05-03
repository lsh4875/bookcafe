import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { reservationEmailHtml, welcomeEmailHtml } from "@/lib/email/templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, to, data } = body;

    let subject = "";
    let html = "";

    if (type === "reservation") {
      subject = "[일오책방] 예약이 접수되었습니다";
      html = reservationEmailHtml(data);
    } else if (type === "welcome") {
      subject = "[일오책방] 환영합니다!";
      html = welcomeEmailHtml(data);
    } else {
      return NextResponse.json({ error: "올바르지 않은 타입입니다." }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: "일오책방 <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Resend error]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[email API error]", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}