import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Resend } from "resend";
import { welcomeEmailHtml } from "@/lib/email/templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[callback error]", error.message);
    return NextResponse.redirect(`${origin}/login`);
  }

  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/auth/reset-password`);
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_onboarded, name")
    .eq("id", user.id)
    .single();

  // 신규 가입 시 환영 이메일 발송
  if (!profile?.is_onboarded) {
    try {
      const { data, error: emailError } = await resend.emails.send({
        from: "일오책방 <hello@ilobookcafe.com>",
        to: user.email!,
        subject: "[일오책방] 환영합니다!",
        html: welcomeEmailHtml({ name: profile?.name || "회원" }),
      });
      console.log("[welcome email sent]", data);
      if (emailError) console.error("[welcome email error]", emailError);
    } catch (emailError) {
      console.error("[welcome email send error]", emailError);
    }
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  return NextResponse.redirect(`${origin}/`);
}