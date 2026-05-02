"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("비밀번호 변경에 실패했습니다. 링크가 만료되었을 수 있습니다.");
    } else {
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
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
            새 비밀번호 설정
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e0d9cf] p-8">
          {done ? (
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-[#f0ebe3] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#c9b99a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-sm font-medium text-[#2c2a26] tracking-wide mb-2">
                변경 완료
              </h2>
              <p className="text-xs text-[#8a8480] leading-relaxed">
                비밀번호가 성공적으로 변경되었습니다.
                <br />
                잠시 후 로그인 페이지로 이동합니다.
              </p>
            </div>
          ) : !ready ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-2 border-[#e0d9cf] border-t-[#c9b99a] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs text-[#8a8480]">링크를 확인하는 중입니다...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#8a8480] tracking-wide">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8자 이상 입력"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#e0d9cf] bg-[#faf9f7] text-sm text-[#2c2a26] placeholder:text-[#c5bfb8] focus:outline-none focus:border-[#c9b99a] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#8a8480] tracking-wide">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#e0d9cf] bg-[#faf9f7] text-sm text-[#2c2a26] placeholder:text-[#c5bfb8] focus:outline-none focus:border-[#c9b99a] transition-colors"
                />
              </div>

              {confirm && (
                <p className={`text-xs ${password === confirm ? "text-green-500" : "text-red-400"}`}>
                  {password === confirm ? "✓ 비밀번호가 일치합니다" : "비밀번호가 일치하지 않습니다"}
                </p>
              )}

              {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="w-full py-3 bg-[#2c2a26] text-[#f8f5f0] rounded-xl text-xs tracking-wide hover:bg-[#3d3a34] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
              >
                {loading ? "변경 중..." : "비밀번호 변경"}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/login" className="text-xs text-[#8a8480] hover:text-[#2c2a26] transition-colors">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
