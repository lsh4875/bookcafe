"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const GENRES = ["소설", "에세이", "시/詩", "인문학", "만화/그래픽노블", "기타"];
const EXPECTATIONS = ["조용한 독서 공간", "책 추천/큐레이션", "혼자만의 시간", "음료와 함께하는 휴식", "새로운 사람과의 만남", "기타"];
const INTENTIONS = ["꼭 가고 싶다", "관심 있다", "잘 모르겠다", "참여하기 어려울 것 같다"];
const PRICES = ["5,000원 이하", "5,000 ~ 8,000원", "8,000 ~ 12,000원", "12,000원 이상"];

export default function SurveyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    genre: [] as string[],
    expectation: "",
    intention: "",
    price: "",
    region: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const toggleGenre = (value: string) => {
    setForm((prev) => ({
      ...prev,
      genre: prev.genre.includes(value)
        ? prev.genre.filter((g) => g !== value)
        : [...prev.genre, value],
    }));
  };

  const handleSubmit = async () => {
    if (!form.expectation || !form.intention || !form.price || !form.region) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    setSubmitting(true);

    // 현재 로그인 유저 가져오기
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    await fetch("/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        submittedAt: new Date().toISOString(),
        userId: session?.user?.id || null,
      }),
    });
    router.push("/survey/done");
  };

  return (
    <main className="min-h-screen bg-[#f8f5f0] px-5 py-10">
      <div className="max-w-xl mx-auto">
        <p className="text-[10px] tracking-[0.18em] uppercase text-[#9a8c7a] mb-1">survey</p>
        <h1 className="font-serif text-2xl font-light text-[#2c2a26] mb-2 leading-snug">취향 설문</h1>
        <p className="text-sm text-[#9a8c7a] mb-8 leading-7">5분이면 충분해요. 익명으로 진행됩니다.</p>

        <div className="mb-8">
          <p className="text-sm font-medium text-[#2c2a26] mb-3">1. 어떤 장르를 좋아하나요? <span className="text-[#9a8c7a] font-normal ml-1">(복수선택)</span></p>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button key={g} onClick={() => toggleGenre(g)} className={`px-4 py-2 rounded-full text-sm border transition-all ${form.genre.includes(g) ? "bg-[#2c2a26] text-[#f0ebe3] border-[#2c2a26]" : "bg-white text-[#4a4540] border-[#e0d9cf] hover:border-[#2c2a26]"}`}>{g}</button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-medium text-[#2c2a26] mb-3">2. 북카페에서 가장 기대하는 건?</p>
          <div className="flex flex-col gap-2">
            {EXPECTATIONS.map((e) => (
              <button key={e} onClick={() => setForm((prev) => ({ ...prev, expectation: e }))} className={`px-4 py-3 rounded-xl text-sm text-left border transition-all ${form.expectation === e ? "bg-[#2c2a26] text-[#f0ebe3] border-[#2c2a26]" : "bg-white text-[#4a4540] border-[#e0d9cf] hover:border-[#2c2a26]"}`}>{e}</button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-medium text-[#2c2a26] mb-3">3. 팝업 북카페 참여 의향이 있나요?</p>
          <div className="flex flex-col gap-2">
            {INTENTIONS.map((i) => (
              <button key={i} onClick={() => setForm((prev) => ({ ...prev, intention: i }))} className={`px-4 py-3 rounded-xl text-sm text-left border transition-all ${form.intention === i ? "bg-[#2c2a26] text-[#f0ebe3] border-[#2c2a26]" : "bg-white text-[#4a4540] border-[#e0d9cf] hover:border-[#2c2a26]"}`}>{i}</button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-medium text-[#2c2a26] mb-3">4. 적정 이용 가격은?</p>
          <div className="flex flex-col gap-2">
            {PRICES.map((p) => (
              <button key={p} onClick={() => setForm((prev) => ({ ...prev, price: p }))} className={`px-4 py-3 rounded-xl text-sm text-left border transition-all ${form.price === p ? "bg-[#2c2a26] text-[#f0ebe3] border-[#2c2a26]" : "bg-white text-[#4a4540] border-[#e0d9cf] hover:border-[#2c2a26]"}`}>{p}</button>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <p className="text-sm font-medium text-[#2c2a26] mb-3">5. 어느 지역이면 방문하기 좋나요?</p>
          <input
            type="text"
            placeholder="예: 부천, 홍대, 건대 등"
            value={form.region}
            onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))}
            className="w-full bg-white border border-[#e0d9cf] rounded-xl px-4 py-3 text-sm text-[#2c2a26] placeholder-[#c5b9aa] focus:outline-none focus:border-[#2c2a26]"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#2c2a26] text-[#f0ebe3] py-4 rounded-xl text-sm tracking-wide hover:bg-[#4a4540] transition-colors disabled:opacity-50"
        >
          {submitting ? "제출 중..." : "설문 제출하기"}
        </button>
      </div>
    </main>
  );
}