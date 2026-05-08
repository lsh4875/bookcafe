"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Notice = {
  id: string;
  content: string;
  link: string | null;
  created_at: string;
};

export default function NoticePage() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notices?all=true")
      .then((res) => res.json())
      .then((data) => {
        setNotices(data.notices ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e0d9cf] border-t-[#c9b99a] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f5f0] px-5 py-10">
      <div className="max-w-xl mx-auto">
        <p className="text-[10px] tracking-[0.18em] uppercase text-[#9a8c7a] mb-1">notice</p>
        <h1 className="font-serif text-2xl font-light text-[#2c2a26] mb-8 leading-snug">공지사항</h1>

        {notices.length === 0 ? (
          <div className="bg-white border border-[#e8e2d9] rounded-2xl p-10 text-center">
            <p className="text-sm text-[#8a8480]">등록된 공지가 없습니다.</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 text-xs text-[#c9b99a] hover:text-[#2c2a26] transition-colors"
            >
              홈으로 돌아가기 →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notices.map((notice, i) => (
              <div key={notice.id} className="bg-white border border-[#e8e2d9] rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="font-serif text-lg font-light text-[#c9b99a] shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm text-[#2c2a26] leading-relaxed">{notice.content}</p>
                </div>
                {notice.link && (
                  <a href={notice.link} className="block text-xs text-[#c9b99a] hover:text-[#2c2a26] transition-colors ml-8 mb-2">
                    자세히 보기 →
                  </a>
                )}
                <p className="text-xs text-[#b0aba4] ml-8">
                  {new Date(notice.created_at).toLocaleDateString("ko-KR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}