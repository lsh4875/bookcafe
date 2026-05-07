import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export default async function NoticeBanner() {
  const supabase = createAdminSupabaseClient();
  const { data: notice } = await supabase
    .from("notices")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!notice) return null;

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