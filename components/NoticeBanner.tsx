"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Notice = {
  id: string;
  content: string;
  link: string | null;
};

export default function NoticeBanner() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/notices")
      .then((res) => res.json())
      .then((data) => {
        if (data.notice) setNotice(data.notice);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || !notice) return null;

  return (
    <div className="w-full bg-[#2c2a26] text-[#f0ebe3] px-4 py-2.5 flex items-center justify-center gap-3 text-xs tracking-wide">
      <span>📖</span>
      <span>{notice.content}</span>
      {notice.link && (
        <Link
          href={notice.link}
          className="underline text-[#c9b99a] hover:text-[#f0ebe3] transition-colors shrink-0"
        >
          자세히 보기 →
        </Link>
      )}
    </div>
  );
}