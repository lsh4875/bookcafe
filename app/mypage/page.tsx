"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Profile = {
  id: string;
  email: string;
  name: string | null;
  nickname: string | null;
  phone: string | null;
  address_road: string | null;
  address_detail: string | null;
  address_zip: string | null;
};

type Reservation = {
  id: number;
  name: string;
  time_slot: string;
  headcount: string;
  popup: string;
  place: string;
  submitted_at: string;
};

export default function MyPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    nickname: "",
    phone: "",
    address_road: "",
    address_detail: "",
    address_zip: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const userId = session.user.id;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileData) {
        setProfile(profileData);
        setForm({
          name: profileData.name || "",
          nickname: profileData.nickname || "",
          phone: profileData.phone || "",
          address_road: profileData.address_road || "",
          address_detail: profileData.address_detail || "",
          address_zip: profileData.address_zip || "",
        });
      }

      const { data: resData } = await supabase
        .from("reservations")
        .select("id, name, time_slot, headcount, popup, place, submitted_at")
        .eq("user_id", userId)
        .order("submitted_at", { ascending: false });

      setReservations(resData || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    const { error } = await supabase
      .from("profiles")
      .update({
        name: form.name,
        nickname: form.nickname,
        phone: form.phone,
        address_road: form.address_road,
        address_detail: form.address_detail,
        address_zip: form.address_zip,
      })
      .eq("id", profile!.id);

    if (error) {
      setSaveMsg("저장에 실패했습니다.");
    } else {
      setProfile((prev) => prev ? { ...prev, ...form } : prev);
      setSaveMsg("저장됐습니다!");
      setEditing(false);
      setTimeout(() => setSaveMsg(""), 2000);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e0d9cf] border-t-[#c9b99a] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f5f0] px-4 py-10">
      <div className="max-w-xl mx-auto space-y-6">

        {/* 헤더 */}
        <div className="text-center mb-2">
          <p className="text-xs tracking-[0.3em] text-[#c9b99a] uppercase mb-2">My Page</p>
          <h1 className="text-2xl font-bold text-[#2c2a26]">마이페이지</h1>
        </div>

        {/* 프로필 카드 */}
        <div className="bg-white border border-[#e8e2d9] rounded-2xl shadow-sm p-7 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#2c2a26] tracking-wide">프로필 정보</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-[#8a8480] hover:text-[#2c2a26] transition-colors border border-[#e0d9cf] px-3 py-1.5 rounded-lg"
              >
                수정
              </button>
            )}
          </div>

          {/* 이메일 (수정 불가) */}
          <div className="space-y-1">
            <p className="text-xs text-[#8a8480]">이메일</p>
            <p className="text-sm text-[#2c2a26]">{profile?.email || "-"}</p>
          </div>

          {editing ? (
            <div className="space-y-4">
              {/* 이름 */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#8a8480]">이름</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="홍길동"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e0d9cf] bg-[#f8f5f0] text-sm text-[#2c2a26] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a] focus:bg-white transition-colors"
                />
              </div>

              {/* 닉네임 */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#8a8480]">닉네임</label>
                <input
                  value={form.nickname}
                  onChange={(e) => setForm((prev) => ({ ...prev, nickname: e.target.value }))}
                  placeholder="책방지기"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e0d9cf] bg-[#f8f5f0] text-sm text-[#2c2a26] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a] focus:bg-white transition-colors"
                />
              </div>

              {/* 연락처 */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#8a8480]">연락처</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="01012345678"
                  inputMode="tel"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e0d9cf] bg-[#f8f5f0] text-sm text-[#2c2a26] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a] focus:bg-white transition-colors"
                />
              </div>

              {/* 주소 */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#8a8480]">배송 주소</label>
                <input
                  value={form.address_zip}
                  onChange={(e) => setForm((prev) => ({ ...prev, address_zip: e.target.value }))}
                  placeholder="우편번호"
                  inputMode="numeric"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e0d9cf] bg-[#f8f5f0] text-sm text-[#2c2a26] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a] focus:bg-white transition-colors"
                />
                <input
                  value={form.address_road}
                  onChange={(e) => setForm((prev) => ({ ...prev, address_road: e.target.value }))}
                  placeholder="도로명 주소"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e0d9cf] bg-[#f8f5f0] text-sm text-[#2c2a26] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a] focus:bg-white transition-colors"
                />
                <input
                  value={form.address_detail}
                  onChange={(e) => setForm((prev) => ({ ...prev, address_detail: e.target.value }))}
                  placeholder="상세 주소"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e0d9cf] bg-[#f8f5f0] text-sm text-[#2c2a26] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a] focus:bg-white transition-colors"
                />
              </div>

              {saveMsg && (
                <p className="text-xs text-center text-green-600">{saveMsg}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setEditing(false); setSaveMsg(""); }}
                  className="flex-1 py-2.5 border border-[#e0d9cf] rounded-xl text-xs text-[#8a8480] hover:text-[#2c2a26] transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#2c2a26] text-[#f8f5f0] rounded-xl text-xs hover:bg-[#3d3a34] transition-colors disabled:opacity-60"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "이름", value: profile?.name },
                { label: "닉네임", value: profile?.nickname },
                { label: "연락처", value: profile?.phone },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-1">
                  <p className="text-xs text-[#8a8480]">{label}</p>
                  <p className="text-sm text-[#2c2a26]">{value || "-"}</p>
                </div>
              ))}

              {/* 주소 표시 */}
              <div className="space-y-1">
                <p className="text-xs text-[#8a8480]">배송 주소</p>
                {profile?.address_road ? (
                  <div className="text-sm text-[#2c2a26] space-y-0.5">
                    <p>{profile.address_zip && `(${profile.address_zip})`} {profile.address_road}</p>
                    {profile.address_detail && <p>{profile.address_detail}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-[#2c2a26]">-</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 예약 내역 */}
        <div className="bg-white border border-[#e8e2d9] rounded-2xl shadow-sm p-7 space-y-4">
          <h2 className="text-sm font-medium text-[#2c2a26] tracking-wide">내 예약 내역</h2>

          {reservations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#8a8480]">예약 내역이 없습니다.</p>
              <button
                onClick={() => router.push("/reservation")}
                className="mt-3 text-xs text-[#c9b99a] hover:text-[#2c2a26] transition-colors"
              >
                예약하러 가기 →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map((res) => (
                <div key={res.id} className="border border-[#e8e2d9] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#2c2a26]">{res.popup}</p>
                    <span className="text-xs text-[#c9b99a] border border-[#e8e2d9] px-2 py-0.5 rounded-full">
                      예약완료
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#8a8480]">📍 {res.place}</p>
                    <p className="text-xs text-[#8a8480]">🕐 {res.time_slot}</p>
                    <p className="text-xs text-[#8a8480]">👥 {res.headcount}명</p>
                  </div>
                  {res.submitted_at && (
                    <p className="text-xs text-[#b0aba4]">
                      신청일 {new Date(res.submitted_at).toLocaleDateString("ko-KR")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="w-full py-3 border border-[#e0d9cf] rounded-xl text-sm text-[#8a8480] hover:text-red-400 hover:border-red-300 transition-colors"
        >
          로그아웃
        </button>

      </div>
    </main>
  );
}