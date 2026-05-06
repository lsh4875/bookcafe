import Link from "next/link";

export default function SurveyDonePage() {
  return (
    <main className="min-h-screen bg-[#f8f5f0] flex flex-col items-center justify-center px-5">
      <div className="max-w-sm w-full text-center">

        {/* 아이콘 */}
        <div className="w-16 h-16 rounded-full bg-[#2c2a26] flex items-center justify-center mx-auto mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#c9b99a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="text-[10px] tracking-[0.18em] uppercase text-[#9a8c7a] mb-2">
          thank you
        </p>
        <h1 className="font-serif text-2xl font-light text-[#2c2a26] mb-3 leading-snug">
          응답해주셔서<br />감사해요
        </h1>

        <div className="w-10 h-px bg-[#c9b99a] mx-auto mb-6" />

        <p className="text-sm text-[#9a8c7a] leading-7 mb-8">
          소중한 답변이 일오책방을<br />만드는 데 큰 도움이 됩니다.
        </p>

        {/* 안내 카드 */}
        <div className="bg-white border border-[#e8e2d9] rounded-2xl p-6 mb-8 text-left space-y-3">
          {[
            "설문 결과는 북카페 운영에 반영됩니다.",
            "팝업 일정은 인스타그램 @ilochekbang에서 확인하세요.",
            "예약은 예약 페이지에서 신청할 수 있어요.",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-[#c9b99a] text-base leading-tight shrink-0 mt-0.5">·</span>
              <p className="text-xs text-[#6b6760] leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* 버튼 */}
        <div className="flex flex-col gap-3">
          <Link
            href="/reservation"
            className="w-full py-3 rounded-xl bg-[#2c2a26] text-sm text-[#f8f5f0] hover:bg-[#3d3a34] transition-colors text-center"
          >
            팝업 예약하러 가기
          </Link>
          <Link
            href="/"
            className="w-full py-3 rounded-xl border border-[#e0d9cf] text-sm text-[#6b6760] hover:bg-[#f0ece5] transition-colors text-center"
          >
            홈으로 돌아가기
          </Link>
        </div>

      </div>
    </main>
  );
}