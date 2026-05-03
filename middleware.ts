import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // 비로그인 상태에서 보호된 경로 접근 시 로그인으로
  if (
    !session &&
    !req.nextUrl.pathname.startsWith("/login") &&
    !req.nextUrl.pathname.startsWith("/auth") &&
    !req.nextUrl.pathname.startsWith("/forgot-password") &&
    !req.nextUrl.pathname.startsWith("/onboarding") &&
    !req.nextUrl.pathname.startsWith("/survey") &&
    req.nextUrl.pathname !== "/"
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 로그인 상태에서 로그인 페이지 접근 시 홈으로
  if (session && req.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 로그인 상태인데 온보딩 미완료 시 온보딩으로
  if (
    session &&
    !req.nextUrl.pathname.startsWith("/onboarding") &&
    !req.nextUrl.pathname.startsWith("/auth") &&
    !req.nextUrl.pathname.startsWith("/login")
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_onboarded")
      .eq("id", session.user.id)
      .single();

    if (!profile?.is_onboarded) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};