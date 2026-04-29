import Link from "next/link";

export default function SurveyDonePage() {
  return (
    <main className="min-h-screen bg-[#f8f5f0] flex flex-col items-center justify-center px-5">
      <div className="max-w-sm w-full text-center">

        <div className="w-12 h-12 rounded-full bg-[#2c2a26] flex items-center justify-center mx-auto mb-6">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10l4 4 8-8" stroke="#f0ebe3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <p className="text-[10px] tracking-[0.18em] uppercase text-[#9a8c7a] mb-2">
          thank you
        </p>
        <h1 className="font-serif text-2xl font-light text-[#2c2a26] mb-3 leading-snug">
          응답해주셔서<br />감사해요
        </h1>
        <p className="text-sm text-[#9a8c7a] leading-7 mb-10">
          소중한 답변이 일오책방을<br />만드는 데 큰 도움이 됩니다.
        </p>

        <Link
          href="/"
          className="inline-block bg-[#2c2a26] text-[#f0ebe3] px-8 py-3 rounded-xl
                     text-sm tracking-wide hover:bg-[#4a4540] transition-colors"
        >
          홈으로 돌아가기
        </Link>

      </div>
    </main>
  );
}