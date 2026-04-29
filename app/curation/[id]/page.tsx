import Link from "next/link";
import { notFound } from "next/navigation";
import { CURATIONS, getCurationById } from "../data";

// Static params for build-time generation
export function generateStaticParams() {
  return CURATIONS.map((c) => ({ id: c.id }));
}

const MOOD_STYLES: Record<
  string,
  {
    heroBg: string;
    heroText: string;
    tag: string;
    divider: string;
    badge: string;
  }
> = {
  soft: {
    heroBg: "bg-[#ede8e0]",
    heroText: "text-[#6b5e4e]",
    tag: "bg-[#e0d8cc] text-[#7a6a57]",
    divider: "bg-[#d5cdc3]",
    badge: "border-[#d5cdc3] text-[#9c8a75]",
  },
  warm: {
    heroBg: "bg-[#f2e6d8]",
    heroText: "text-[#8a6035]",
    tag: "bg-[#ead5b8] text-[#7a5028]",
    divider: "bg-[#e0c8a0]",
    badge: "border-[#e4c89a] text-[#b8895a]",
  },
  rain: {
    heroBg: "bg-[#dce4f0]",
    heroText: "text-[#4a6290]",
    tag: "bg-[#c8d8f0] text-[#3a5280]",
    divider: "bg-[#b8ccec]",
    badge: "border-[#c0d0ec] text-[#6a82aa]",
  },
};

export default async function CurationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const curation = getCurationById(id);
  if (!curation) notFound();

  const style = MOOD_STYLES[curation.mood];

  return (
    <main className="min-h-screen bg-[#f8f5f0]">
      {/* Hero */}
      <div className={`${style.heroBg} px-4 pt-14 pb-10 md:pt-20 md:pb-14`}>
        <div className="max-w-2xl mx-auto">
          {/* Back */}
          <Link
            href="/curation"
            className={`inline-flex items-center gap-1.5 text-xs ${style.heroText} opacity-70 hover:opacity-100 transition-opacity mb-6`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            큐레이션 목록
          </Link>

          {/* Emoji */}
          <p className="text-4xl mb-4">{curation.emoji}</p>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-[#2c2a26] leading-snug">
            {curation.title}
          </h1>
          <p className={`mt-2 text-sm ${style.heroText}`}>
            {curation.subtitle}
          </p>

          {/* Stats */}
          <div className="mt-5 flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full border font-medium ${style.badge}`}>
              총 {curation.books.length}권
            </span>
            <span className={`text-xs px-3 py-1 rounded-full border font-medium ${style.badge}`}>
              일오책방 선정
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className={`h-px w-full ${style.divider}`} />

      {/* Book List */}
      <div className="max-w-2xl mx-auto px-4 py-10 md:py-14 space-y-5">
        {curation.books.map((book, i) => (
          <div
            key={book.id}
            className="bg-white border border-[#e8e2d9] rounded-2xl p-5 md:p-6 shadow-sm
              hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex gap-4 items-start">
              {/* Index */}
              <div className="shrink-0 w-8 h-8 rounded-full bg-[#f0ece5] flex items-center justify-center">
                <span className="text-xs font-bold text-[#c9b99a]">{i + 1}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-base font-bold text-[#2c2a26] leading-snug">
                    {book.title}
                  </h2>
                  {book.tag && (
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${style.tag}`}>
                      {book.tag}
                    </span>
                  )}
                </div>

                {/* Author & Publisher */}
                <p className="mt-1 text-xs text-[#a09b94]">
                  {book.author} · {book.publisher} · {book.year}
                </p>

                {/* Description */}
                <p className="mt-2.5 text-sm text-[#6b6760] leading-relaxed">
                  {book.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="max-w-2xl mx-auto px-4 pb-14">
        <div className="bg-[#2c2a26] rounded-2xl p-6 md:p-8 text-center">
          <p className="text-sm text-[#c9b99a] mb-1 tracking-wide">
            책을 읽을 공간이 필요하신가요?
          </p>
          <p className="text-white font-bold text-lg mb-5">
            일오책방 팝업 북카페 예약하기
          </p>
          <Link
            href="/reservation"
            className="inline-block px-6 py-2.5 bg-[#c9b99a] text-[#2c2a26] rounded-xl
              text-sm font-medium hover:bg-[#b8a88a] transition-colors"
          >
            예약 신청하기
          </Link>
        </div>
      </div>
    </main>
  );
}