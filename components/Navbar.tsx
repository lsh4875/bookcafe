"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navLinks = [
    { href: "/", label: "홈" },
    { href: "/curation", label: "큐레이션" },
    { href: "/reservation", label: "예약" },
    { href: "/survey", label: "설문" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f8f5f0]/90 backdrop-blur-md border-b border-[#e0d9cf]">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          {/* 로고 */}
          <Link
            href="/"
            className="font-serif text-base tracking-[0.2em] text-[#2c2a26] hover:text-[#c9b99a] transition-colors"
          >
            일오책방
          </Link>

          {/* 데스크탑 메뉴 */}
          <div className="hidden sm:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs tracking-wide transition-colors ${
                  pathname === link.href
                    ? "text-[#2c2a26] font-medium"
                    : "text-[#8a8480] hover:text-[#2c2a26]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* 우측 버튼 */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/mypage"
                  className={`text-xs tracking-wide transition-colors ${
                    pathname === "/mypage"
                      ? "text-[#2c2a26] font-medium"
                      : "text-[#8a8480] hover:text-[#2c2a26]"
                  }`}
                >
                  마이페이지
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs text-[#8a8480] hover:text-[#2c2a26] transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-xs bg-[#2c2a26] text-[#f8f5f0] px-4 py-2 rounded-lg hover:bg-[#3d3a34] transition-colors tracking-wide"
              >
                로그인
              </Link>
            )}
          </div>

          {/* 모바일 햄버거 */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden flex flex-col gap-1.5 p-1"
            aria-label="메뉴"
          >
            <span className={`block w-5 h-px bg-[#2c2a26] transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-px bg-[#2c2a26] transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-px bg-[#2c2a26] transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {menuOpen && (
          <div className="sm:hidden bg-[#f8f5f0] border-t border-[#e0d9cf] px-5 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm tracking-wide transition-colors ${
                  pathname === link.href
                    ? "text-[#2c2a26] font-medium"
                    : "text-[#8a8480]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-[#e0d9cf]" />
            {user ? (
              <>
                <Link
                  href="/mypage"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-[#8a8480]"
                >
                  마이페이지
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="text-sm text-left text-[#8a8480]"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-[#2c2a26] font-medium"
              >
                로그인
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* 네비게이션 높이만큼 여백 */}
      <div className="h-14" />
    </>
  );
}
