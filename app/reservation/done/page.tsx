import Link from "next/link";

export default function ReservationDonePage() {
  return (
    <main className="min-h-screen bg-[#f8f5f0] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">

        {/* Icon */}
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-[#2c2a26] flex items-center justify-center shadow-md">
          <svg
            className="w-7 h-7 text-[#c9b99a]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>

        {/* Title */}
        <p className="text-xs tracking-[0.3em] text-[#c9b99a] uppercase mb-3 font-medium">
          Reservation Complete
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#2c2a26] leading-snug">
          예약이 접수됐어요
        </h1>

        <div className="mt-4 w-10 h-px bg-[#c9b99a] mx-auto" />

        {/* Message */}
        <p className="mt-6 text-sm text-[#6b6760] leading-relaxed">
          <span className="font-medium text-[#2c2a26]">4월의 조용한 독서 팝업</span> 예약을
          신청해주셔서 감사해요.
          <br />
          확정 안내는 이메일 또는 문자로 발송됩니다.
        </p>

        {/* Info Box */}
        <div className="mt-8 bg-white border border-[#e8e2d9] rounded-xl px-6 py-5 text-sm text-left space-y-3 shadow-sm">
          <InfoRow label="팝업명" value="4월의 조용한 독서 팝업" />
          <InfoRow label="장소" value="부천 공유공간" />
          <InfoRow label="운영 시간" value="오후 2시 ~ 5시" />
          <InfoRow label="문의" value="일오책방 인스타그램 DM" />
        </div>

        {/* Reminder */}
        <div className="mt-6 bg-[#f0ece5] rounded-xl px-5 py-4 text-xs text-[#857f77] leading-relaxed text-left">
          📌 예약 확정 전까지 자리가 보장되지 않을 수 있습니다. 확정 메시지를 꼭 확인해주세요.
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 py-3 rounded-xl border border-[#c9b99a] text-sm text-[#5a5855]
              hover:bg-[#f0ece5] transition-colors text-center"
          >
            홈으로
          </Link>
          <Link
            href="/reservation"
            className="flex-1 py-3 rounded-xl bg-[#2c2a26] text-sm text-[#f8f5f0]
              hover:bg-[#3d3a34] transition-colors text-center"
          >
            다른 예약 신청
          </Link>
        </div>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[#a09b94]">{label}</span>
      <span className="font-medium text-[#2c2a26]">{value}</span>
    </div>
  );
}
