import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f8f5f0] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-6">

        {/* 숫자 */}
        <div className="font-serif text-[120px] font-light text-[#e0d9cf] leading-none">
          404
        </div>

        <div className="space-y-3">
          <p className="text-xs tracking-[0.3em] text-[#c9b99a] uppercase font-medium">
            Page Not Found
          </p>
          <h1 className="text-xl font-bold text-[#2c2a26]">
            페이지를 찾을 수 없어요
          </h1>
          <p className="text-sm text-[#8a8480] leading-relaxed">
            주소가 잘못됐거나 삭제된 페이지예요.<br />
            아래 버튼으로 돌아가세요.
          </p>
        </div>

        <div className="w-10 h-px bg-[#c9b99a] mx-auto" />

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-3 rounded-xl bg-[#2c2a26] text-sm text-[#f8f5f0] hover:bg-[#3d3a34] transition-colors text-center"
          >
            홈으로 돌아가기
          </Link>
          <Link
            href="/reservation"
            className="w-full py-3 rounded-xl border border-[#e0d9cf] text-sm text-[#6b6760] hover:bg-[#f0ece5] transition-colors text-center"
          >
            팝업 예약하러 가기
          </Link>
        </div>

      </div>
    </main>
  );
}