"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";

const GENRES = ["소설", "에세이", "시/詩", "인문학", "만화/그래픽노블", "기타"];

const EXPECTATIONS = [
  "조용한 독서 공간",
  "책 추천/큐레이션",
  "혼자만의 시간",
  "음료와 함께하는 휴식",
  "새로운 사람과의 만남",
  "기타",
];

const INTENTIONS = [
  "꼭 가고 싶다",
  "관심 있다",
  "잘 모르겠다",
  "참여하기 어려울 것 같다",
];

const PRICES = [
  "5,000원 이하",
  "5,000 ~ 8,000원",
  "8,000 ~ 12,000원",
  "12,000원 이상",
];

export default function SurveyPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    genre: [] as string[],
    expectation: "",
    intention: "",
    price: "",
    region: "",
  });

  const [guestInfo, setGuestInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setIsLoggedIn(true);
          setUserId(session.user.id);

          const { data: existing } = await supabase
            .from("surveys")
            .select("id")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (existing) {
            setAlreadySubmitted(true);
          }
        }
      } catch (error) {
        console.error("초기화 오류:", error);
      } finally {
        setCheckingDuplicate(false);
      }
    };

    init();
  }, []);

  const toggleGenre = (value: string) => {
    setForm((prev) => ({
      ...prev,
      genre: prev.genre.includes(value)
        ? prev.genre.filter((g) => g !== value)
        : [...prev.genre, value],
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!isLoggedIn) {
      if (!guestInfo.name.trim()) {
        e.name = "이름을 입력해주세요.";
      }

      const phone = guestInfo.phone.replace(/-/g, "").trim();

      if (!/^01[0-9]{8,9}$/.test(phone)) {
        e.phone = "올바른 전화번호를 입력해주세요.";
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email.trim())) {
        e.email = "올바른 이메일을 입력해주세요.";
      }
    }

    if (!form.expectation) e.expectation = "항목을 선택해주세요.";
    if (!form.intention) e.intention = "항목을 선택해주세요.";
    if (!form.price) e.price = "항목을 선택해주세요.";
    if (!form.region.trim()) e.region = "지역을 입력해주세요.";

    return e;
  };

  const safeParseJson = async (res: Response) => {
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error("JSON이 아닌 응답:", text);
      throw new Error("서버가 JSON이 아닌 응답을 반환했습니다.");
    }
  };

  const handleResubmit = async () => {
    if (!userId) {
      toast.error("로그인 정보가 없습니다.");
      return;
    }

    const ok = confirm("기존 설문 응답을 삭제하고 다시 참여하시겠습니까?");
    if (!ok) return;

    try {
      const res = await fetch("/api/survey", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await safeParseJson(res);

      if (!res.ok) {
        toast.error(data.message || "오류가 발생했습니다. 다시 시도해주세요.");
        return;
      }

      setAlreadySubmitted(false);
    } catch (error) {
      console.error("다시 설문하기 오류:", error);
      toast.error("네트워크 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async () => {
    const e = validate();

    if (Object.keys(e).length > 0) {
      setErrors(e);
      toast.error("입력 항목을 확인해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        genre: form.genre,
        expectation: form.expectation,
        intention: form.intention,
        price: form.price,
        region: form.region.trim(),
        submittedAt: new Date().toISOString(),
        userId,
        submitterName: !isLoggedIn ? guestInfo.name.trim() : null,
        submitterPhone: !isLoggedIn
          ? guestInfo.phone.replace(/-/g, "").trim()
          : null,
        submitterEmail: !isLoggedIn ? guestInfo.email.trim() : null,
      };

      const res = await fetch("/api/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await safeParseJson(res);

      if (!res.ok) {
        if (data.code === "DUPLICATE_CONTACT") {
          toast.error("이미 동일한 이메일 또는 전화번호로 설문에 참여하셨습니다.");
        } else if (data.code === "DUPLICATE_USER") {
          setAlreadySubmitted(true);
        } else {
          toast.error(data.message || "오류가 발생했습니다. 다시 시도해주세요.");
        }

        setSubmitting(false);
        return;
      }

      router.push("/survey/done");
    } catch (error) {
      console.error("fetch error:", error);
      toast.error("네트워크 오류가 발생했습니다.");
      setSubmitting(false);
    }
  };

  if (checkingDuplicate) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e0d9cf] border-t-[#c9b99a] rounded-full animate-spin" />
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <main className="min-h-screen bg-[#f8f5f0] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white border border-[#e8e2d9] rounded-2xl shadow-sm p-8 text-center space-y-4">
          <p className="text-2xl">📋</p>

          <h2 className="text-lg font-bold text-[#2c2a26]">
            이미 설문에 참여하셨습니다
          </h2>

          <p className="text-sm text-[#8a8480] leading-relaxed">
            소중한 의견 감사해요!
            <br />
            응답을 변경하고 싶으시면 다시 참여하실 수 있어요.
          </p>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleResubmit}
              className="w-full py-2.5 border border-[#e0d9cf] rounded-xl text-sm text-[#8a8480] hover:text-[#2c2a26] transition-colors"
            >
              다시 설문하기
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full py-2.5 bg-[#2c2a26] text-[#f8f5f0] rounded-xl text-sm hover:bg-[#3d3a34] transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f5f0] px-5 py-10">
      <div className="max-w-xl mx-auto">
        <p className="text-[10px] tracking-[0.18em] uppercase text-[#9a8c7a] mb-1">
          survey
        </p>

        <h1 className="font-serif text-2xl font-light text-[#2c2a26] mb-2 leading-snug">
          취향 설문
        </h1>

        <p className="text-sm text-[#9a8c7a] mb-8 leading-7">
          5분이면 충분해요. 익명으로 진행됩니다.
        </p>

        {!isLoggedIn && (
          <div className="bg-white border border-[#e0d9cf] rounded-2xl p-5 mb-8 space-y-4">
            <div>
              <p className="text-sm font-medium text-[#2c2a26]">참여자 정보</p>
              <p className="text-xs text-[#8a8480] mt-1">
                중복 참여 방지를 위해 정보를 입력해주세요.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#8a8480]">
                이름 <span className="text-[#c9b99a]">*</span>
              </label>
              <input
                value={guestInfo.name}
                onChange={(e) => {
                  setGuestInfo((p) => ({ ...p, name: e.target.value }));
                  setErrors((p) => ({ ...p, name: "" }));
                }}
                placeholder="홍길동"
                className="w-full px-4 py-2.5 rounded-lg border border-[#e0d9cf] bg-[#f8f5f0] text-sm text-[#2c2a26] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a] focus:bg-white transition-colors"
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#8a8480]">
                전화번호 <span className="text-[#c9b99a]">*</span>
              </label>
              <input
                value={guestInfo.phone}
                onChange={(e) => {
                  setGuestInfo((p) => ({ ...p, phone: e.target.value }));
                  setErrors((p) => ({ ...p, phone: "" }));
                }}
                placeholder="01012345678"
                inputMode="tel"
                className="w-full px-4 py-2.5 rounded-lg border border-[#e0d9cf] bg-[#f8f5f0] text-sm text-[#2c2a26] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a] focus:bg-white transition-colors"
              />
              {errors.phone && (
                <p className="text-xs text-red-400">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#8a8480]">
                이메일 <span className="text-[#c9b99a]">*</span>
              </label>
              <input
                type="email"
                value={guestInfo.email}
                onChange={(e) => {
                  setGuestInfo((p) => ({ ...p, email: e.target.value }));
                  setErrors((p) => ({ ...p, email: "" }));
                }}
                placeholder="hello@email.com"
                className="w-full px-4 py-2.5 rounded-lg border border-[#e0d9cf] bg-[#f8f5f0] text-sm text-[#2c2a26] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a] focus:bg-white transition-colors"
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email}</p>
              )}
            </div>
          </div>
        )}

        {/* 1. 장르 */}
        <div className="mb-8">
          <p className="text-sm font-medium text-[#2c2a26] mb-3">
            1. 어떤 장르를 좋아하나요?{" "}
            <span className="text-[#9a8c7a] font-normal ml-1">(복수선택)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                className={`px-4 py-2 rounded-full text-sm border transition-all ${
                  form.genre.includes(g)
                    ? "bg-[#2c2a26] text-[#f0ebe3] border-[#2c2a26]"
                    : "bg-white text-[#4a4540] border-[#e0d9cf] hover:border-[#2c2a26]"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 2. 기대 */}
        <div className="mb-8">
          <p className="text-sm font-medium text-[#2c2a26] mb-3">
            2. 북카페에서 가장 기대하는 건?
          </p>
          {errors.expectation && (
            <p className="text-xs text-red-400 mb-2">{errors.expectation}</p>
          )}
          <div className="flex flex-col gap-2">
            {EXPECTATIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, expectation: item }));
                  setErrors((p) => ({ ...p, expectation: "" }));
                }}
                className={`px-4 py-3 rounded-xl text-sm text-left border transition-all ${
                  form.expectation === item
                    ? "bg-[#2c2a26] text-[#f0ebe3] border-[#2c2a26]"
                    : "bg-white text-[#4a4540] border-[#e0d9cf] hover:border-[#2c2a26]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 3. 참여 의향 */}
        <div className="mb-8">
          <p className="text-sm font-medium text-[#2c2a26] mb-3">
            3. 팝업 북카페 참여 의향이 있나요?
          </p>
          {errors.intention && (
            <p className="text-xs text-red-400 mb-2">{errors.intention}</p>
          )}
          <div className="flex flex-col gap-2">
            {INTENTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, intention: item }));
                  setErrors((p) => ({ ...p, intention: "" }));
                }}
                className={`px-4 py-3 rounded-xl text-sm text-left border transition-all ${
                  form.intention === item
                    ? "bg-[#2c2a26] text-[#f0ebe3] border-[#2c2a26]"
                    : "bg-white text-[#4a4540] border-[#e0d9cf] hover:border-[#2c2a26]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 4. 가격 */}
        <div className="mb-8">
          <p className="text-sm font-medium text-[#2c2a26] mb-3">
            4. 적정 이용 가격은?
          </p>
          {errors.price && (
            <p className="text-xs text-red-400 mb-2">{errors.price}</p>
          )}
          <div className="flex flex-col gap-2">
            {PRICES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, price: item }));
                  setErrors((p) => ({ ...p, price: "" }));
                }}
                className={`px-4 py-3 rounded-xl text-sm text-left border transition-all ${
                  form.price === item
                    ? "bg-[#2c2a26] text-[#f0ebe3] border-[#2c2a26]"
                    : "bg-white text-[#4a4540] border-[#e0d9cf] hover:border-[#2c2a26]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 5. 지역 */}
        <div className="mb-10">
          <p className="text-sm font-medium text-[#2c2a26] mb-3">
            5. 어느 지역이면 방문하기 좋나요?
          </p>
          <input
            type="text"
            placeholder="예: 부천, 홍대, 건대 등"
            value={form.region}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, region: e.target.value }));
              setErrors((p) => ({ ...p, region: "" }));
            }}
            className="w-full bg-white border border-[#e0d9cf] rounded-xl px-4 py-3 text-sm text-[#2c2a26] placeholder-[#c5b9aa] focus:outline-none focus:border-[#2c2a26]"
          />
          {errors.region && (
            <p className="text-xs text-red-400 mt-1">{errors.region}</p>
          )}
        </div>

        <button
          type="button"
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