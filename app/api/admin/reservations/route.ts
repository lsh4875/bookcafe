import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { Resend } from "resend";
import { reservationConfirmedEmailHtml } from "@/lib/email/templates";

const supabase = createAdminSupabaseClient();
const resend = new Resend(process.env.RESEND_API_KEY);

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

    // 확정 시 이메일 발송
    if (status === "confirmed") {
      const { data: reservation } = await supabase
        .from("reservations")
        .select("*")
        .eq("id", id)
        .single();

      if (reservation) {
        try {
          await resend.emails.send({
            from: "일오책방 <hello@ilobookcafe.com>",
            to: reservation.email,
            subject: "[일오책방] 예약이 확정되었습니다 🎉",
            html: reservationConfirmedEmailHtml({
              name: reservation.name,
              popup: reservation.popup,
              place: reservation.place,
              timeSlot: reservation.time_slot,
              headcount: reservation.headcount,
            }),
          });
        } catch (emailError) {
          console.error("[확정 이메일 발송 오류]", emailError);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin reservations PATCH error]", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "id가 누락됐습니다." }, { status: 400 });
    }

    const { error } = await supabase
      .from("reservations")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin reservations DELETE error]", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}