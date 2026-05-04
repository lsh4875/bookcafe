import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/auth",
  "/forgot-password",
  "/onboarding",
  "/survey",
  "/curation",
  "/reservation",
];

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ✅ API 요청은 로그인 여부와 관계없이 통과
  // /api/survey 같은 비로그인 설문 제출이 여기서 막히면 안 됨
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

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
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });

          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // ✅ 비로그인 + 비공개 경로 → 로그인 페이지
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ 로그인 상태 + 로그인 페이지 접근 → 홈으로
  if (user && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ✅ 관리자 페이지 권한 체크
  if (user && pathname.startsWith("/admin")) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ✅ 온보딩 미완료 유저 처리
  if (
    user &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/auth") &&
    !pathname.startsWith("/admin")
  ) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_onboarded")
      .eq("id", user.id)
      .single();

    if (profile && !profile.is_onboarded) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};