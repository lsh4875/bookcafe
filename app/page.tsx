// app/page.tsx
import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

const SURVEY_QUESTIONS = [
  "어떤 장르를 좋아하나요?",
  "북카페에서 가장 기대하는 건?",
  "팝업 북카페 참여 의향이 있나요?",
  "적정 이용 가격은 얼마인가요?",
  "어느 지역이면 방문하기 좋나요?",
];

function Hero() {
  return (
    <header className="bg-[#2c2a26] text-[#f0ebe3] px-6 py-16 text-center relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(255,255,255,0.15) 48px)",
        }}
      />
      <div className="relative z-10 max-w-xl mx-auto">
        <span className="inline-block text-[10px] tracking-[0.18em] uppercase text-[#c9b99a] border border-[#c9b99a]/30 bg-white/5 px-3 py-1 rounded-full mb-5">
          일오책방
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light tracking-widest leading-tight mb-4">
          혼자여도<br />괜찮은 시간
        </h1>
        <div className="w-10 h-px bg-[#c9b99a] opacity-50 mx-auto my-5" />
        <p className="text-sm text-[#a89b87] tracking-wide leading-8">
          조용히 책 읽고 쉬어가는<br />팝업 북카페
        </p>
      </div>
    </header>
  );
}

async function CurationSection() {
  const supabase = createAdminSupabaseClient();
  const { data: curations } = await supabase
    .from("curations")
    .select("id, title")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  return (
    <section className="px-5 py-10 max-w-2xl mx-auto">
      <p className="text-[10px] tracking-[0.18em] uppercase text-[#9a8c7a] mb-1">curation</p>
      <h2 className="text-xl font-serif font-light text-[#2c2a26] mb-6 leading-snug">
        오늘의 책 큐레이션
      </h2>
      <ul className="flex flex-col gap-2.5 mb-6">
        {(curations ?? []).map((item, i) => (
          <li key={item.id}>
            <Link
              href={`/curation/${item.id}`}
              className="flex items-center gap-4 bg-white border border-[#e0d9cf] rounded-xl px-5 py-4
                         hover:-translate-y-0.5 hover:shadow-md transition-all duration-150"
            >
              <span className="font-serif text-2xl font-light text-[#c9b99a] w-7 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-[#4a4540] leading-relaxed">{item.title}</span>
              <span className="ml-auto text-[#c9b99a] text-sm">→</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/curation"
        className="text-sm text-[#7a6e60] border-b border-[#c5b9aa] hover:text-[#2c2a26] transition-colors"
      >
        큐레이션 전체 보기 →
      </Link>
    </section>
  );
}

async function PopupSection() {
  const supabase = createAdminSupabaseClient();
  const { data: popup } = await supabase
    .from("popups")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!popup) return null;

  return (
    <section className="px-5 py-10 max-w-2xl mx-auto border-t border-[#e0d9cf]">
      <p className="text-[10px] tracking-[0.18em] uppercase text-[#9a8c7a] mb-1">popup</p>
      <h2 className="text-xl font-serif font-light text-[#2c2a26] mb-6 leading-snug">
        팝업 북카페 예약
      </h2>
      <div className="bg-[#2c2a26] text-[#f0ebe3] rounded-2xl p-6">
        <span className="inline-block text-[10px] tracking-wider bg-white/10 text-[#c9b99a] border border-[#c9b99a]/30 px-3 py-1 rounded-full mb-3">
          {popup.month}
        </span>
        <h3 className="font-serif text-lg font-normal leading-snug mb-5 text-[#f0ebe3]">
          {popup.title}
        </h3>
        <dl className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 text-sm">
          {[
            ["장소", popup.location],
            ["인원", popup.capacity],
            ["시간", popup.time],
            ["가격", popup.price],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="text-[11px] text-[#9a8c7a]">{label}</dt>
              <dd className="text-[#e8e0d4]">{value}</dd>
            </div>
          ))}
        </dl>
        <Link
          href="/reservation"
          className="block w-full bg-[#c9b99a] hover:bg-[#b8a688] text-[#2c2a26] text-sm font-medium
                     text-center py-3 rounded-lg tracking-wide transition-colors"
        >
          예약 신청하기
        </Link>
      </div>
    </section>
  );
}

function SurveySection() {
  return (
    <section className="px-5 py-10 max-w-2xl mx-auto border-t border-[#e0d9cf]">
      <p className="text-[10px] tracking-[0.18em] uppercase text-[#9a8c7a] mb-1">survey</p>
      <h2 className="text-xl font-serif font-light text-[#2c2a26] mb-6 leading-snug">
        취향 설문에 참여해주세요
      </h2>
      <div className="bg-white border border-[#e0d9cf] rounded-2xl p-6">
        <span className="inline-block text-[10px] tracking-wider bg-[#f5f0ea] text-[#9a8c7a] border border-[#e0d9cf] px-3 py-1 rounded-full mb-3">
          5분 설문 · 익명
        </span>
        <p className="text-sm text-[#6a5f52] leading-7 mb-4">
          북카페를 더 나은 공간으로 만들기 위해<br className="hidden sm:block" />
          여러분의 취향을 알고 싶어요.
        </p>
        <ul className="flex flex-col gap-1.5 mb-6">
          {SURVEY_QUESTIONS.map((q, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-[#9a8c7a] leading-relaxed">
              <span className="text-[#c9b99a] text-base leading-tight shrink-0">·</span>
              {q}
            </li>
          ))}
        </ul>
        <Link
          href="/survey"
          className="block w-full text-center text-sm py-3 rounded-lg border border-[#c5b9aa]
                     text-[#2c2a26] hover:bg-[#f5f0ea] transition-colors tracking-wide"
        >
          설문 참여하기
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="text-center py-8 text-xs text-[#b0a495] tracking-wide leading-8 border-t border-[#e0d9cf]">
      <p>일오책방</p>
      <p>@ilochekbang · 소식 받기</p>
    </footer>
  );
}

export default async function Home() {
  return (
    <main className="min-h-screen bg-[#f8f5f0]">
      <Hero />
      <CurationSection />
      <PopupSection />
      <SurveySection />
      <Footer />
    </main>
  );
}