"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?type=recovery`,
    });

    if (error) {
      setError("이메일 전송에 실패했습니다. 구글/카카오 소셜 로그인 계정은 비밀번호 찾기를 이용할 수 없어요.");
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="font-serif text-xl tracking-[0.2em] text-[#2c2a26] hover:text-[#c9b99a] transition-colors"
          >
            일오책방
          </Link>
          <p className="mt-3 text-xs text-[#8a8480] tracking-wide">
            비밀번호 찾기
          </p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl border border-[#e0d9cf] p-8 text-center">
            <div className="w-12 h-12 bg-[#f0ebe3] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#c9b99a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-sm font-medium text-[#2c2a26] tracking-wide mb-2">
              메일을 보냈습니다
            </h2>
            <p className="text-xs text-[#8a8480] leading-relaxed mb-1">
              <span className="text-[#2c2a26] font-medium">{email}</span>으로
            </p>
            <p className="text-xs text-[#8a8480] leading-relaxed mb-6">
              비밀번호 재설정 링크를 발송했습니다.
              <br />
              메일함을 확인해주세요.
            </p>
            <p className="text-xs text-[#a09890] mb-5">
              메일이 오지 않는다면 스팸함을 확인하거나
              <br />
              아래 버튼으로 다시 시도해주세요.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="w-full py-2.5 border border-[#e0d9cf] rounded-xl text-xs text-[#8a8480] hover:text-[#2c2a26] hover:border-[#c9b99a] transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e0d9cf] p-8">
            <p className="text-xs text-[#8a8480] leading-relaxed mb-6 text-center">
              가입하신 이메일 주소를 입력하시면
              <br />
              비밀번호 재설정 링크를 보내드립니다.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#8a8480] tracking-wide">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#e0d9cf] bg-[#faf9f7] text-sm text-[#2c2a26] placeholder:text-[#c5bfb8] focus:outline-none focus:border-[#c9b99a] transition-colors"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 text-center leading-relaxed">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 bg-[#2c2a26] text-[#f8f5f0] rounded-xl text-xs tracking-wide hover:bg-[#3d3a34] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
              >
                {loading ? "전송 중..." : "재설정 링크 받기"}
              </button>
            </form>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 mt-6">
          <Link href="/login" className="text-xs text-[#8a8480] hover:text-[#2c2a26] transition-colors">
            로그인으로 돌아가기
          </Link>
          <span className="text-[#e0d9cf]">·</span>
          <Link href="/login" className="text-xs text-[#8a8480] hover:text-[#2c2a26] transition-colors">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}