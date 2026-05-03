"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    birth_date: "",
    gender: "",
    terms_agreed: false,
    privacy_agreed: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "이름을 입력해주세요.";
    if (!/^01[0-9]{8,9}$/.test(form.phone.replace(/-/g, "")))
      e.phone = "올바른 휴대폰 번호를 입력해주세요.";
    if (!form.birth_date) e.birth_date = "생년월일을 입력해주세요.";
    if (!form.gender) e.gender = "성별을 선택해주세요.";
    if (!form.terms_agreed) e.terms_agreed = "서비스 이용약관에 동의해주세요.";
    if (!form.privacy_agreed) e.privacy_agreed = "개인정보 처리방침에 동의해주세요.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }

    const { error } = await supabase
      .from("profiles")
      .update({
        name: form.name,
        phone: form.phone,
        birth_date: form.birth_date,
        gender: form.gender,
        terms_agreed: true,
        is_onboarded: true,
      })
      .eq("id", session.user.id);

    if (error) {
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } else {
      window.location.href = "/";  // router.push 대신 hard redirect
    }
    setLoading(false);
  };

  const inputCls = (err?: string) =>
    `w-full px-4 py-2.5 rounded-lg border text-sm text-[#2c2a26] bg-[#f8f5f0] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a] focus:bg-white transition-colors ${err ? "border-red-400" : "border-[#e0d9cf]"}`;

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        {/* 헤더 */}
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] text-[#c9b99a] uppercase mb-3">일오책방</p>
          <h1 className="text-2xl font-bold text-[#2c2a26] mb-2">환영해요!</h1>
          <p className="text-sm text-[#8a8480]">서비스 이용을 위해 정보를 입력해주세요.</p>
        </div>

        <div className="bg-white border border-[#e8e2d9] rounded-2xl shadow-sm p-7 space-y-5">

          {/* 이름 */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#8a8480]">이름 <span className="text-[#c9b99a]">*</span></label>
            <input
              value={form.name}
              onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: "" })); }}
              placeholder="홍길동"
              className={inputCls(errors.name)}
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>

          {/* 휴대폰 번호 */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#8a8480]">휴대폰 번호 <span className="text-[#c9b99a]">*</span></label>
            <input
              value={form.phone}
              onChange={(e) => { setForm((p) => ({ ...p, phone: e.target.value })); setErrors((p) => ({ ...p, phone: "" })); }}
              placeholder="01012345678"
              inputMode="tel"
              className={inputCls(errors.phone)}
            />
            {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
          </div>

          {/* 생년월일 */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#8a8480]">생년월일 <span className="text-[#c9b99a]">*</span></label>
            <input
              type="date"
              value={form.birth_date}
              onChange={(e) => { setForm((p) => ({ ...p, birth_date: e.target.value })); setErrors((p) => ({ ...p, birth_date: "" })); }}
              className={inputCls(errors.birth_date)}
            />
            {errors.birth_date && <p className="text-xs text-red-400">{errors.birth_date}</p>}
          </div>

          {/* 성별 */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#8a8480]">성별 <span className="text-[#c9b99a]">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {["남성", "여성", "선택안함"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => { setForm((p) => ({ ...p, gender: g })); setErrors((p) => ({ ...p, gender: "" })); }}
                  className={`py-2.5 rounded-lg text-sm border transition-all ${
                    form.gender === g
                      ? "bg-[#2c2a26] text-[#f8f5f0] border-[#2c2a26]"
                      : "bg-[#f8f5f0] text-[#5a5855] border-[#e0d9cf] hover:border-[#c9b99a]"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            {errors.gender && <p className="text-xs text-red-400">{errors.gender}</p>}
          </div>

          {/* 약관 동의 */}
          <div className="space-y-3 pt-1">
            <p className="text-xs text-[#8a8480] font-medium">약관 동의</p>

            {[
              { key: "terms_agreed", label: "서비스 이용약관 동의", error: errors.terms_agreed },
              { key: "privacy_agreed", label: "개인정보 처리방침 동의", error: errors.privacy_agreed },
            ].map(({ key, label, error }) => (
              <div key={key}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <span
                    onClick={() => {
                      setForm((p) => ({ ...p, [key]: !p[key as keyof typeof p] }));
                      setErrors((p) => ({ ...p, [key]: "" }));
                    }}
                    className={`w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                      form[key as keyof typeof form]
                        ? "bg-[#2c2a26] border-[#2c2a26]"
                        : "border-[#c9b99a] bg-white"
                    }`}
                  >
                    {form[key as keyof typeof form] && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </span>
                  <span className="text-sm text-[#6b6760]">
                    {label} <span className="text-[#c9b99a]">*</span>
                  </span>
                </label>
                {error && <p className="text-xs text-red-400 mt-1 ml-8">{error}</p>}
              </div>
            ))}
          </div>

          {/* 제출 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-[#2c2a26] text-[#f8f5f0] rounded-xl text-sm font-medium hover:bg-[#3d3a34] transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? "저장 중..." : "시작하기"}
          </button>
        </div>
      </div>
    </div>
  );
}