"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type Mode = "login" | "signup" | "verify";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  const showMessage = (msg: string, type: "error" | "success" = "error") => {
    setMessage(msg);
    setMessageType(type);
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleKakaoLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleSignup = async () => {
    if (!email || !password || !passwordConfirm) {
      showMessage("모든 항목을 입력해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      showMessage("비밀번호가 일치하지 않아요.");
      return;
    }
    if (password.length < 6) {
      showMessage("비밀번호는 6자 이상이어야 해요.");
      return;
    }
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      showMessage(error.message);
    } else {
      showMessage("인증 코드를 이메일로 발송했어요!", "success");
      setMode("verify");
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!otp) {
      showMessage("인증 코드를 입력해주세요.");
      return;
    }
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });
    if (error) {
      showMessage("인증 코드가 올바르지 않아요.");
    } else {
      showMessage("회원가입이 완료됐어요! 로그인해주세요.", "success");
      setMode("login");
      setPassword("");
      setPasswordConfirm("");
      setOtp("");
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showMessage("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showMessage("이메일 또는 비밀번호가 올바르지 않아요.");
    } else {
      window.location.href = "/";
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#f8f5f0] flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] text-[#c9b99a] uppercase mb-3 font-medium">
            일오책방
          </p>
          <h1 className="text-2xl font-bold text-[#2c2a26] mb-2">
            {mode === "login" ? "로그인" : mode === "signup" ? "회원가입" : "이메일 인증"}
          </h1>
          <p className="text-sm text-[#8a8480]">
            {mode === "login"
              ? "다시 만나서 반가워요"
              : mode === "signup"
              ? "일오책방에 오신 걸 환영해요"
              : `${email}로 발송된 인증 코드를 입력해주세요`}
          </p>
        </div>

        <div className="bg-white border border-[#e8e2d9] rounded-2xl shadow-sm p-7 space-y-4">
          {mode === "verify" ? (
            <>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="인증 코드 8자리"
                maxLength={8}
                className="w-full px-4 py-2.5 rounded-lg border border-[#e0d9cf] text-sm text-[#2c2a26]
                  bg-[#f8f5f0] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a]
                  focus:bg-white transition-colors text-center tracking-[0.3em] text-lg"
              />
              {message && (
                <p className={`text-xs text-center ${messageType === "success" ? "text-green-600" : "text-red-500"}`}>
                  {message}
                </p>
              )}
              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full py-3 bg-[#2c2a26] text-[#f8f5f0] rounded-xl text-sm font-medium
                  hover:bg-[#3d3a34] transition-colors disabled:opacity-60"
              >
                {loading ? "확인 중..." : "인증 완료"}
              </button>
              <p className="text-center text-xs text-[#8a8480]">
                코드를 받지 못했나요?{" "}
                <button
                  onClick={() => { setMode("signup"); setMessage(""); }}
                  className="text-[#c9b99a] font-medium hover:underline"
                >
                  다시 시도
                </button>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={handleKakaoLogin}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl px-6 py-3
                  text-sm font-medium transition-all duration-150 hover:brightness-95 active:brightness-90"
                style={{ backgroundColor: "#FEE500", color: "#000000" }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 1.5C4.85786 1.5 1.5 4.18629 1.5 7.5C1.5 9.62803 2.80474 11.4958 4.79289 12.5625L4.07107 15.3107C4.00992 15.5429 4.26992 15.7247 4.46447 15.5858L7.82843 13.3857C8.21569 13.4278 8.60502 13.5 9 13.5C13.1421 13.5 16.5 10.8137 16.5 7.5C16.5 4.18629 13.1421 1.5 9 1.5Z"
                    fill="#3C1E1E"
                  />
                </svg>
                카카오 로그인
              </button>

              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2.5 bg-white border border-[#e0d9cf]
                  rounded-xl px-6 py-3 text-sm font-medium text-[#2c2a26]
                  hover:bg-[#f5f0ea] transition-all duration-150"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google 로그인
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#e8e2d9]" />
                <span className="text-xs text-[#b0aba4]">또는</span>
                <div className="flex-1 h-px bg-[#e8e2d9]" />
              </div>

              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e0d9cf] text-sm text-[#2c2a26]
                    bg-[#f8f5f0] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a]
                    focus:bg-white transition-colors"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e0d9cf] text-sm text-[#2c2a26]
                    bg-[#f8f5f0] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a]
                    focus:bg-white transition-colors"
                />
                {mode === "signup" && (
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="비밀번호 확인"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e0d9cf] text-sm text-[#2c2a26]
                      bg-[#f8f5f0] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a]
                      focus:bg-white transition-colors"
                  />
                )}
              </div>

              {message && (
                <p className={`text-xs text-center ${messageType === "success" ? "text-green-600" : "text-red-500"}`}>
                  {message}
                </p>
              )}

              <button
                onClick={mode === "login" ? handleLogin : handleSignup}
                disabled={loading}
                className="w-full py-3 bg-[#2c2a26] text-[#f8f5f0] rounded-xl text-sm font-medium
                  hover:bg-[#3d3a34] transition-colors disabled:opacity-60"
              >
                {loading ? "처리 중..." : mode === "login" ? "이메일로 로그인" : "이메일로 회원가입"}
              </button>

              {/* 비밀번호 찾기 - 로그인 모드일 때만 표시 */}
              {mode === "login" && (
                <p className="text-center">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#8a8480] hover:text-[#2c2a26] transition-colors"
                  >
                    비밀번호를 잊으셨나요?
                  </Link>
                </p>
              )}

              <p className="text-center text-xs text-[#8a8480]">
                {mode === "login" ? "아직 계정이 없으신가요?" : "이미 계정이 있으신가요?"}
                {" "}
                <button
                  onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}
                  className="text-[#c9b99a] font-medium hover:underline"
                >
                  {mode === "login" ? "회원가입" : "로그인"}
                </button>
              </p>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[#b0aba4]">
          로그인 시 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </p>
      </div>
    </main>
  );
}