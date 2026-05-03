import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

const MOOD_STYLES: Record<string, { bg: string; border: string; accent: string; label: string }> = {
  soft: {
    bg: "bg-[#f0ece6]",
    border: "border-[#ddd5c8]",
    accent: "text-[#9c8a75]",
    label: "bg-[#e8e0d5] text-[#7a6a57]",
  },
  warm: {
    bg: "bg-[#f5ede3]",
    border: "border-[#e4d0b8]",
    accent: "text-[#b8895a]",
    label: "bg-[#eedfc8] text-[#8a6035]",
  },
  rain: {
    bg: "bg-[#eaeef5]",
    border: "border-[#c8d4e8]",
    accent: "text-[#6a82aa]",
    label: "bg-[#d8e2f0] text-[#4a6290]",
  },
};

async function getCurations() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("curations")
    .select(`*, books(*)`)
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (error) return [];
  return data;
}

export default async function CurationPage() {
  const curations = await getCurations();

  return (
    <main className="min-h-screen bg-[#f8f5f0] px-4 py-14 md:py-20">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-12">
        <p className="text-xs tracking-[0.3em] text-[#c9b99a] uppercase mb-3 font-medium">
          Book Curation
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#2c2a26] leading-snug">
          일오책방의 큐레이션
        </h1>
        <p className="mt-3 text-sm text-[#8a8480] leading-relaxed">
          지금 이 순간, 당신에게 꼭 맞는 책을 골라봤어요.
        </p>
        <div className="mt-6 w-12 h-px bg-[#c9b99a] mx-auto" />
      </div>

      {/* Curation Cards */}
      <div className="max-w-2xl mx-auto space-y-5">
        {curations.map((curation, i) => {
          const style = MOOD_STYLES[curation.mood] ?? MOOD_STYLES.soft;
          return (
            <Link
              key={curation.id}
              href={`/curation/${curation.id}`}
              className={`
                group block rounded-2xl border ${style.bg} ${style.border}
                p-6 md:p-8 transition-all duration-200
                hover:shadow-md hover:-translate-y-0.5
              `}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className={`text-xs font-medium tracking-widest mb-2 ${style.accent}`}>
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="text-lg md:text-xl font-bold text-[#2c2a26] leading-snug group-hover:text-[#3d3a34] transition-colors">
                    {curation.emoji} {curation.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-[#6b6760]">
                    {curation.subtitle}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${style.label}`}>
                      책 {curation.books?.length ?? 0}권
                    </span>
                  </div>
                </div>
                <div className={`shrink-0 mt-1 transition-transform duration-200 group-hover:translate-x-1 ${style.accent}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="max-w-2xl mx-auto mt-10 text-center text-xs text-[#b0aba4]">
        큐레이션은 일오책방이 직접 읽고 선정한 책들입니다.
      </p>
    </main>
  );
}
