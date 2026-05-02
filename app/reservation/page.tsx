"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const TIME_SLOTS = [
  "14:00 ~ 14:30",
  "14:30 ~ 15:00",
  "15:00 ~ 15:30",
  "15:30 ~ 16:00",
  "16:00 ~ 16:30",
  "16:30 ~ 17:00",
];

export default function ReservationPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    timeSlot: "",
    headcount: "1",
    note: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "이름을 입력해주세요.";
    if (!/^01[0-9]{8,9}$/.test(form.phone.replace(/-/g, "")))
      e.phone = "올바른 연락처를 입력해주세요.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "올바른 이메일을 입력해주세요.";
    if (!form.timeSlot) e.timeSlot = "시간대를 선택해주세요.";
    if (!form.agree) e.agree = "개인정보 수집에 동의해주세요.";
    return e;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setLoading(true);
    try {
      // 현재 로그인 유저 가져오기
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          submittedAt: new Date().toISOString(),
          popup: "4월의 조용한 독서 팝업",
          place: "부천 공유공간",
          userId: session?.user?.id || null,
        }),
      });
      if (res.ok) {
        router.push("/reservation/done");
      } else {
        alert("예약 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f5f0] px-4 py-14 md:py-20">
      <div className="max-w-xl mx-auto mb-10 text-center">
        <p className="text-xs tracking-[0.3em] text-[#c9b99a] uppercase mb-3 font-medium">
          Popup Reservation
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#2c2a26] leading-snug">
          4월의 조용한 독서 팝업
        </h1>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-[#6b6760]">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#c9b99a]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            부천 공유공간
          </span>
          <span className="hidden sm:block text-[#c9b99a]">·</span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#c9b99a]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            오후 2시 ~ 5시
          </span>
          <span className="hidden sm:block text-[#c9b99a]">·</span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#c9b99a]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            총 8석
          </span>
        </div>
        <div className="mt-6 w-12 h-px bg-[#c9b99a] mx-auto" />
      </div>

      <div className="max-w-xl mx-auto bg-white border border-[#e8e2d9] rounded-2xl shadow-sm p-7 md:p-10 space-y-6">

        <Field label="이름" required error={errors.name}>
          <input name="name" value={form.name} onChange={handleChange} placeholder="홍길동" className={inputCls(errors.name)} />
        </Field>

        <Field label="연락처" required error={errors.phone}>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="01012345678" inputMode="tel" className={inputCls(errors.phone)} />
        </Field>

        <Field label="이메일" required error={errors.email}>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="hello@email.com" className={inputCls(errors.email)} />
        </Field>

        <Field label="참여 시간대" required error={errors.timeSlot}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => { setForm((prev) => ({ ...prev, timeSlot: slot })); setErrors((prev) => ({ ...prev, timeSlot: "" })); }}
                className={`py-2.5 px-3 rounded-lg text-sm border transition-all duration-150 text-center ${form.timeSlot === slot ? "bg-[#2c2a26] text-[#f8f5f0] border-[#2c2a26] font-medium" : "bg-[#f8f5f0] text-[#5a5855] border-[#e0d9cf] hover:border-[#c9b99a]"}`}
              >
                {slot}
              </button>
            ))}
          </div>
        </Field>

        <Field label="참여 인원" required>
          <select name="headcount" value={form.headcount} onChange={handleChange} className={inputCls()}>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n}명</option>
            ))}
          </select>
        </Field>

        <Field label="전달 사항">
          <textarea name="note" value={form.note} onChange={handleChange} rows={3} placeholder="알레르기, 좌석 요청 등 자유롭게 적어주세요." className={`${inputCls()} resize-none`} />
        </Field>

        <div className="pt-1">
          <label className="flex items-start gap-3 cursor-pointer group">
            <span
              onClick={() => { setForm((prev) => ({ ...prev, agree: !prev.agree })); setErrors((prev) => ({ ...prev, agree: "" })); }}
              className={`mt-0.5 w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-colors ${form.agree ? "bg-[#2c2a26] border-[#2c2a26]" : "border-[#c9b99a] bg-white"}`}
            >
              {form.agree && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </span>
            <span className="text-sm text-[#6b6760] leading-relaxed">
              예약 확인을 위한 개인정보(이름, 연락처, 이메일) 수집에 동의합니다.
              <span className="text-[#c9b99a]"> *</span>
            </span>
          </label>
          {errors.agree && <p className="mt-1.5 ml-8 text-xs text-red-500">{errors.agree}</p>}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 bg-[#2c2a26] text-[#f8f5f0] rounded-xl font-medium tracking-wide hover:bg-[#3d3a34] active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? "예약 중..." : "예약 신청하기"}
        </button>
      </div>

      <p className="max-w-xl mx-auto mt-6 text-center text-xs text-[#a09b94]">
        예약 확정 안내는 이메일 또는 문자로 발송됩니다.
      </p>
    </main>
  );
}

function inputCls(error?: string) {
  return `w-full px-4 py-2.5 rounded-lg border text-sm text-[#2c2a26] bg-[#f8f5f0] placeholder:text-[#bdb8b0] outline-none transition-colors focus:border-[#c9b99a] focus:bg-white ${error ? "border-red-400" : "border-[#e0d9cf]"}`;
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode; }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#2c2a26]">
        {label}
        {required && <span className="ml-1 text-[#c9b99a]">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}