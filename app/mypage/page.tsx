"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";

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
  status: string;
};

const STATUS_LABEL: Record<string, { label: string; style: string }> = {
  pending: { label: "예약대기", style: "text-[#c9b99a] border-[#e8e2d9]" },
  confirmed: { label: "예약확정", style: "text-green-600 border-green-200" },
  cancelled: { label: "취소됨", style: "text-[#b0aba4] border-[#e0d9cf] line-through" },
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
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [hasSurvey, setHasSurvey] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;

      const provider = session.user.app_metadata?.provider;
      if (provider && provider !== "email") {
        setIsOAuthUser(true);
      }

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
        .select("id, name, time_slot, headcount, popup, place, submitted_at, status")
        .eq("user_id", userId)
        .order("submitted_at", { ascending: false });

      setReservations(resData || []);

      // 설문 참여 여부 확인
      const { data: surveyData } = await supabase
        .from("surveys")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      setHasSurvey(!!surveyData);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
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
      toast.error("저장에 실패했습니다.");
    } else {
      setProfile((prev) => prev ? { ...prev, ...form } : prev);
      toast.success("저장됐습니다!");
      setEditing(false);
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("모든 항목을 입력해주세요.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("비밀번호는 6자 이상이어야 해요.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("비밀번호가 일치하지 않아요.");
      return;
    }

    setPasswordSaving(true);

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    });

    if (error) {
      toast.error("비밀번호 변경에 실패했습니다.");
    } else {
      toast.success("비밀번호가 변경됐습니다!");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    }
    setPasswordSaving(false);
  };

  const handleCancel = async (id: number) => {
    if (!confirm("예약을 취소하시겠습니까?")) return;
    setCancellingId(id);
    try {
      const res = await fetch("/api/reservation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "cancelled" }),
      });
      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) => r.id === id ? { ...r, status: "cancelled" } : r)
        );
        toast.success("예약이 취소됐습니다.");
      } else {
        toast.error("취소 처리 중 오류가 발생했습니다.");
      }
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm("정말 탈퇴하시겠습니까?\n탈퇴 시 모든 데이터가 삭제되며 복구가 불가능합니다.")) return;
    if (!confirm("마지막으로 한 번 더 확인합니다. 탈퇴하시겠습니까?")) return;

    setWithdrawing(true);
    try {
      const { error } = await supabase.rpc("delete_user");
      if (error) {
        toast.error("탈퇴 처리 중 오류가 발생했습니다.");
        setWithdrawing(false);
        return;
      }
      await supabase.auth.signOut();
      window.location.replace("/");
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
      setWithdrawing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.replace("/");
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

          <div className="space-y-1">
            <p className="text-xs text-[#8a8480]">이메일</p>
            <p className="text-sm text-[#2c2a26]">{profile?.email || "-"}</p>
          </div>

          {editing ? (
            <div className="space-y-4">
              {[
                { key: "name", label: "이름", placeholder: "홍길동" },
                { key: "nickname", label: "닉네임", placeholder: "책방지기" },
                { key: "phone", label: "연락처", placeholder: "01012345678" },
                { key: "address_road", label: "도로명 주소", placeholder: "도로명 주소" },
                { key: "address_detail", label: "상세 주소", placeholder: "상세 주소" },
                { key: "address_zip", label: "우편번호", placeholder: "우편번호" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs text-[#8a8480]">{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e0d9cf] bg-[#f8f5f0] text-sm text-[#2c2a26] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a] focus:bg-white transition-colors"
                  />
                </div>
              ))}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setEditing(false)}
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

              <div className="space-y-1">
                <p className="text-xs text-[#8a8480]">배송 주소</p>
                {profile?.address_road ? (
                  <div className="text-sm text-[#2c2a26] space-y-0.5">
                    <p>{profile.address_road}</p>
                    {profile.address_detail && <p>{profile.address_detail}</p>}
                    {profile.address_zip && <p>{profile.address_zip}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-[#2c2a26]">-</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 설문 참여 여부 */}
        <div className="bg-white border border-[#e8e2d9] rounded-2xl shadow-sm p-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-[#2c2a26] tracking-wide">취향 설문</h2>
              <p className="text-xs text-[#8a8480] mt-1">
                {hasSurvey ? "설문에 참여하셨습니다. 감사해요!" : "아직 설문에 참여하지 않으셨어요."}
              </p>
            </div>
            {hasSurvey ? (
              <span className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium">
                참여완료
              </span>
            ) : (
              <button
                onClick={() => router.push("/survey")}
                className="text-xs bg-[#2c2a26] text-[#f8f5f0] px-3 py-1.5 rounded-lg hover:bg-[#3d3a34] transition-colors"
              >
                설문 참여하기
              </button>
            )}
          </div>
        </div>

        {/* 비밀번호 변경 */}
        {!isOAuthUser && (
          <div className="bg-white border border-[#e8e2d9] rounded-2xl shadow-sm p-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-[#2c2a26] tracking-wide">비밀번호 변경</h2>
              {!showPasswordForm && (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="text-xs text-[#8a8480] hover:text-[#2c2a26] transition-colors border border-[#e0d9cf] px-3 py-1.5 rounded-lg"
                >
                  변경
                </button>
              )}
            </div>

            {showPasswordForm ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8a8480]">새 비밀번호</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    placeholder="6자 이상"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e0d9cf] bg-[#f8f5f0] text-sm text-[#2c2a26] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a] focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8a8480]">새 비밀번호 확인</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="비밀번호 재입력"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e0d9cf] bg-[#f8f5f0] text-sm text-[#2c2a26] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a] focus:bg-white transition-colors"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowPasswordForm(false); setPasswordForm({ newPassword: "", confirmPassword: "" }); }}
                    className="flex-1 py-2.5 border border-[#e0d9cf] rounded-xl text-xs text-[#8a8480] hover:text-[#2c2a26] transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={passwordSaving}
                    className="flex-1 py-2.5 bg-[#2c2a26] text-[#f8f5f0] rounded-xl text-xs hover:bg-[#3d3a34] transition-colors disabled:opacity-60"
                  >
                    {passwordSaving ? "변경 중..." : "변경"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#8a8480]">
                비밀번호를 주기적으로 변경하면 계정을 안전하게 보호할 수 있어요.
              </p>
            )}
          </div>
        )}

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
              {reservations.map((res) => {
                const statusInfo = STATUS_LABEL[res.status] ?? STATUS_LABEL.pending;
                const isCancelled = res.status === "cancelled";
                const isCancelling = cancellingId === res.id;

                return (
                  <div
                    key={res.id}
                    className={`border border-[#e8e2d9] rounded-xl p-4 space-y-2 transition-opacity ${isCancelled ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#2c2a26]">{res.popup}</p>
                      <span className={`text-xs border px-2 py-0.5 rounded-full ${statusInfo.style}`}>
                        {statusInfo.label}
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
                    {!isCancelled && (
                      <button
                        onClick={() => handleCancel(res.id)}
                        disabled={isCancelling}
                        className="mt-1 text-xs text-[#b0aba4] hover:text-red-400 transition-colors disabled:opacity-60"
                      >
                        {isCancelling ? "취소 중..." : "예약 취소"}
                      </button>
                    )}
                  </div>
                );
              })}
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

        {/* 회원탈퇴 */}
        <button
          onClick={handleWithdraw}
          disabled={withdrawing}
          className="w-full py-3 text-xs text-[#c0bbb4] hover:text-red-400 transition-colors disabled:opacity-60"
        >
          {withdrawing ? "탈퇴 처리 중..." : "회원탈퇴"}
        </button>

      </div>
    </main>
  );
}