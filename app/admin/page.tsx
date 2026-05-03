"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Reservation = {
  id: number;
  name: string;
  phone: string;
  email: string;
  time_slot: string;
  headcount: string;
  note: string;
  popup: string;
  place: string;
  submitted_at: string;
  status: string;
};

type Member = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  gender: string | null;
  birth_date: string | null;
  is_onboarded: boolean;
  is_admin: boolean;
  created_at: string;
};

type Survey = {
  id: number;
  genre: string;
  expectation: string;
  intention: string;
  price: string;
  region: string;
  submitted_at: string;
  user_id: string | null;
};

type Book = {
  id?: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  description: string;
  tag?: string;
  order_index?: number;
};

type Curation = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  mood: string;
  order_index: number;
  is_active: boolean;
  books: Book[];
};

const STATUS_LABEL: Record<string, { label: string; style: string }> = {
  pending: { label: "대기", style: "bg-[#f5f0ea] text-[#9a8c7a]" },
  confirmed: { label: "확정", style: "bg-green-50 text-green-700" },
  cancelled: { label: "취소", style: "bg-red-50 text-red-400" },
};

const MOOD_OPTIONS = ["soft", "warm", "rain"];

const EMPTY_BOOK: Book = {
  title: "", author: "", publisher: "", year: new Date().getFullYear(), description: "", tag: "",
};

const EMPTY_CURATION: Omit<Curation, "id" | "is_active"> = {
  title: "", subtitle: "", emoji: "", mood: "soft", order_index: 0, books: [{ ...EMPTY_BOOK }],
};

type Tab = "reservations" | "members" | "surveys" | "curations";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("reservations");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [curations, setCurations] = useState<Curation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [showCurationForm, setShowCurationForm] = useState(false);
  const [editingCuration, setEditingCuration] = useState<Curation | null>(null);
  const [curationForm, setCurationForm] = useState<Omit<Curation, "id" | "is_active">>(EMPTY_CURATION);
  const [savingCuration, setSavingCuration] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();

      if (!profile?.is_admin) { router.push("/"); return; }
      fetchAll();
    };
    checkAdmin();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [resRes, memRes, surRes, curRes] = await Promise.all([
      fetch("/api/admin/reservations"),
      fetch("/api/admin/members"),
      fetch("/api/admin/surveys"),
      fetch("/api/admin/curations"),
    ]);
    const [resData, memData, surData, curData] = await Promise.all([
      resRes.json(), memRes.json(), surRes.json(), curRes.json(),
    ]);
    setReservations(resData.data ?? []);
    setMembers(memData.data ?? []);
    setSurveys(surData.data ?? []);
    setCurations(curData.data ?? []);
    setLoading(false);
  };

  const handleStatusChange = async (id: number, status: string) => {
    setUpdatingId(id);
    const res = await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    }
    setUpdatingId(null);
  };

  const handleCurationEdit = (curation: Curation) => {
    setEditingCuration(curation);
    setCurationForm({
      title: curation.title,
      subtitle: curation.subtitle,
      emoji: curation.emoji,
      mood: curation.mood,
      order_index: curation.order_index,
      books: curation.books.length > 0 ? curation.books : [{ ...EMPTY_BOOK }],
    });
    setShowCurationForm(true);
  };

  const handleCurationNew = () => {
    setEditingCuration(null);
    setCurationForm(EMPTY_CURATION);
    setShowCurationForm(true);
  };

  const handleCurationSave = async () => {
    setSavingCuration(true);
    const method = editingCuration ? "PATCH" : "POST";
    const body = editingCuration
      ? { id: editingCuration.id, ...curationForm }
      : curationForm;

    const res = await fetch("/api/admin/curations", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      await fetchAll();
      setShowCurationForm(false);
      setEditingCuration(null);
    } else {
      alert("저장에 실패했습니다.");
    }
    setSavingCuration(false);
  };

  const handleCurationDelete = async (id: string) => {
    const confirmed = confirm("이 큐레이션을 어떻게 처리할까요?\n\n확인 = 완전 삭제\n취소 = 비활성화만");

    const res = await fetch("/api/admin/curations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, permanent: confirmed }),
    });

    if (res.ok) {
      await fetchAll();
    } else {
      alert("처리에 실패했습니다.");
    }
  };

  const handleCurationRestore = async (id: string) => {
    const res = await fetch("/api/admin/curations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: true }),
    });
    if (res.ok) await fetchAll();
  };

  const updateBook = (index: number, field: keyof Book, value: string | number) => {
    setCurationForm((prev) => {
      const books = [...prev.books];
      books[index] = { ...books[index], [field]: value };
      return { ...prev, books };
    });
  };

  const addBook = () => {
    setCurationForm((prev) => ({ ...prev, books: [...prev.books, { ...EMPTY_BOOK }] }));
  };

  const removeBook = (index: number) => {
    setCurationForm((prev) => ({
      ...prev,
      books: prev.books.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e0d9cf] border-t-[#c9b99a] rounded-full animate-spin" />
      </div>
    );
  }

  const surveyStats = {
    genre: surveys.reduce((acc, s) => { acc[s.genre] = (acc[s.genre] || 0) + 1; return acc; }, {} as Record<string, number>),
    intention: surveys.reduce((acc, s) => { acc[s.intention] = (acc[s.intention] || 0) + 1; return acc; }, {} as Record<string, number>),
    price: surveys.reduce((acc, s) => { acc[s.price] = (acc[s.price] || 0) + 1; return acc; }, {} as Record<string, number>),
    region: surveys.reduce((acc, s) => { acc[s.region] = (acc[s.region] || 0) + 1; return acc; }, {} as Record<string, number>),
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "reservations", label: `예약 관리 (${reservations.length})` },
    { key: "members", label: `회원 관리 (${members.length})` },
    { key: "surveys", label: `설문 결과 (${surveys.length})` },
    { key: "curations", label: `큐레이션 관리 (${curations.length})` },
  ];

  const inputCls = "w-full px-3 py-2 rounded-lg border border-[#e0d9cf] bg-[#f8f5f0] text-sm text-[#2c2a26] placeholder:text-[#bdb8b0] outline-none focus:border-[#c9b99a] focus:bg-white transition-colors";

  return (
    <main className="min-h-screen bg-[#f8f5f0] px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs tracking-[0.3em] text-[#c9b99a] uppercase mb-1">Admin</p>
            <h1 className="text-2xl font-bold text-[#2c2a26]">관리자 페이지</h1>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-xs text-[#8a8480] hover:text-[#2c2a26] border border-[#e0d9cf] px-3 py-1.5 rounded-lg transition-colors"
          >
            홈으로
          </button>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === key
                  ? "bg-[#2c2a26] text-[#f8f5f0]"
                  : "bg-white border border-[#e0d9cf] text-[#8a8480] hover:text-[#2c2a26]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 예약 관리 */}
        {tab === "reservations" && (
          <div className="space-y-3">
            {reservations.length === 0 ? (
              <div className="bg-white border border-[#e8e2d9] rounded-2xl p-10 text-center">
                <p className="text-sm text-[#8a8480]">예약 내역이 없습니다.</p>
              </div>
            ) : reservations.map((res) => {
              const statusInfo = STATUS_LABEL[res.status] ?? STATUS_LABEL.pending;
              return (
                <div key={res.id} className="bg-white border border-[#e8e2d9] rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#2c2a26]">{res.name}</p>
                      <p className="text-xs text-[#8a8480] mt-0.5">{res.email} · {res.phone}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusInfo.style}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-[#8a8480]">
                    <p>📅 {res.popup}</p>
                    <p>📍 {res.place}</p>
                    <p>🕐 {res.time_slot}</p>
                    <p>👥 {res.headcount}명</p>
                    {res.note && <p className="col-span-2">📝 {res.note}</p>}
                  </div>
                  <p className="text-xs text-[#b0aba4]">
                    신청일 {new Date(res.submitted_at).toLocaleDateString("ko-KR")}
                  </p>
                  <div className="flex gap-2 pt-1">
                    {[
                      { status: "pending", label: "대기" },
                      { status: "confirmed", label: "확정" },
                      { status: "cancelled", label: "취소" },
                    ].map(({ status, label }) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(res.id, status)}
                        disabled={res.status === status || updatingId === res.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${
                          res.status === status
                            ? "bg-[#2c2a26] text-[#f8f5f0]"
                            : "border border-[#e0d9cf] text-[#8a8480] hover:text-[#2c2a26] hover:border-[#2c2a26]"
                        }`}
                      >
                        {updatingId === res.id ? "..." : label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 회원 관리 */}
        {tab === "members" && (
          <div className="space-y-3">
            {members.length === 0 ? (
              <div className="bg-white border border-[#e8e2d9] rounded-2xl p-10 text-center">
                <p className="text-sm text-[#8a8480]">회원이 없습니다.</p>
              </div>
            ) : members.map((member) => (
              <div key={member.id} className="bg-white border border-[#e8e2d9] rounded-2xl p-5 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#2c2a26]">
                      {member.name || "이름 없음"}
                      {member.is_admin && (
                        <span className="ml-2 text-xs bg-[#2c2a26] text-[#f8f5f0] px-2 py-0.5 rounded-full">관리자</span>
                      )}
                    </p>
                    <p className="text-xs text-[#8a8480] mt-0.5">{member.email}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                    member.is_onboarded ? "bg-green-50 text-green-700" : "bg-[#f5f0ea] text-[#9a8c7a]"
                  }`}>
                    {member.is_onboarded ? "가입완료" : "온보딩미완료"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#8a8480]">
                  {member.phone && <p>📱 {member.phone}</p>}
                  {member.gender && <p>👤 {member.gender}</p>}
                  {member.birth_date && <p>🎂 {member.birth_date}</p>}
                  {member.created_at && <p>📅 가입 {new Date(member.created_at).toLocaleDateString("ko-KR")}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 설문 결과 */}
        {tab === "surveys" && (
          <div className="space-y-5">
            {surveys.length === 0 ? (
              <div className="bg-white border border-[#e8e2d9] rounded-2xl p-10 text-center">
                <p className="text-sm text-[#8a8480]">설문 응답이 없습니다.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "선호 장르", data: surveyStats.genre },
                    { title: "참여 의향", data: surveyStats.intention },
                    { title: "적정 가격", data: surveyStats.price },
                    { title: "선호 지역", data: surveyStats.region },
                  ].map(({ title, data }) => (
                    <div key={title} className="bg-white border border-[#e8e2d9] rounded-2xl p-5 space-y-3">
                      <h3 className="text-sm font-medium text-[#2c2a26]">{title}</h3>
                      <div className="space-y-2">
                        {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([key, count]) => (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-[#6b6760]">{key}</span>
                              <span className="text-xs text-[#8a8480]">{count}명</span>
                            </div>
                            <div className="h-1.5 bg-[#f0ece5] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#c9b99a] rounded-full"
                                style={{ width: `${(count / surveys.length) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-[#2c2a26]">개별 응답 ({surveys.length}건)</h3>
                  {surveys.map((survey) => (
                    <div key={survey.id} className="bg-white border border-[#e8e2d9] rounded-2xl p-5">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-[#8a8480]">
                        <p>📚 장르: {survey.genre}</p>
                        <p>✅ 참여의향: {survey.intention}</p>
                        {survey.price && <p>💰 가격: {survey.price}</p>}
                        {survey.region && <p>📍 지역: {survey.region}</p>}
                        {survey.expectation && <p className="col-span-2">💬 기대: {survey.expectation}</p>}
                      </div>
                      <p className="text-xs text-[#b0aba4] mt-2">
                        {new Date(survey.submitted_at).toLocaleDateString("ko-KR")}
                        {survey.user_id ? " · 회원" : " · 비회원"}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* 큐레이션 관리 */}
        {tab === "curations" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={handleCurationNew}
                className="px-4 py-2 bg-[#2c2a26] text-[#f8f5f0] rounded-xl text-sm font-medium hover:bg-[#3d3a34] transition-colors"
              >
                + 새 큐레이션
              </button>
            </div>

            {/* 큐레이션 폼 */}
            {showCurationForm && (
              <div className="bg-white border border-[#e8e2d9] rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-medium text-[#2c2a26]">
                  {editingCuration ? "큐레이션 수정" : "새 큐레이션 추가"}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs text-[#8a8480]">제목</label>
                    <input
                      value={curationForm.title}
                      onChange={(e) => setCurationForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="큐레이션 제목"
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs text-[#8a8480]">부제목</label>
                    <input
                      value={curationForm.subtitle}
                      onChange={(e) => setCurationForm((p) => ({ ...p, subtitle: e.target.value }))}
                      placeholder="부제목"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#8a8480]">이모지</label>
                    <input
                      value={curationForm.emoji}
                      onChange={(e) => setCurationForm((p) => ({ ...p, emoji: e.target.value }))}
                      placeholder="🌙"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#8a8480]">분위기</label>
                    <select
                      value={curationForm.mood}
                      onChange={(e) => setCurationForm((p) => ({ ...p, mood: e.target.value }))}
                      className={inputCls}
                    >
                      {MOOD_OPTIONS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#8a8480]">순서</label>
                    <input
                      type="number"
                      value={curationForm.order_index}
                      onChange={(e) => setCurationForm((p) => ({ ...p, order_index: Number(e.target.value) }))}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* 책 목록 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#8a8480]">책 목록</label>
                    <button
                      onClick={addBook}
                      className="text-xs text-[#c9b99a] hover:text-[#2c2a26] transition-colors"
                    >
                      + 책 추가
                    </button>
                  </div>

                  {curationForm.books.map((book, i) => (
                    <div key={i} className="border border-[#e8e2d9] rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#c9b99a]">{i + 1}번째 책</span>
                        {curationForm.books.length > 1 && (
                          <button
                            onClick={() => removeBook(i)}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs text-[#8a8480]">제목</label>
                          <input value={book.title} onChange={(e) => updateBook(i, "title", e.target.value)} placeholder="책 제목" className={inputCls} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-[#8a8480]">저자</label>
                          <input value={book.author} onChange={(e) => updateBook(i, "author", e.target.value)} placeholder="저자" className={inputCls} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-[#8a8480]">출판사</label>
                          <input value={book.publisher} onChange={(e) => updateBook(i, "publisher", e.target.value)} placeholder="출판사" className={inputCls} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-[#8a8480]">출판연도</label>
                          <input type="number" value={book.year} onChange={(e) => updateBook(i, "year", Number(e.target.value))} placeholder="2024" className={inputCls} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-[#8a8480]">태그</label>
                          <input value={book.tag || ""} onChange={(e) => updateBook(i, "tag", e.target.value)} placeholder="태그 (선택)" className={inputCls} />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs text-[#8a8480]">설명</label>
                          <textarea value={book.description} onChange={(e) => updateBook(i, "description", e.target.value)} placeholder="책 설명" rows={2} className={`${inputCls} resize-none`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => { setShowCurationForm(false); setEditingCuration(null); }}
                    className="flex-1 py-2.5 border border-[#e0d9cf] rounded-xl text-sm text-[#8a8480] hover:text-[#2c2a26] transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleCurationSave}
                    disabled={savingCuration}
                    className="flex-1 py-2.5 bg-[#2c2a26] text-[#f8f5f0] rounded-xl text-sm hover:bg-[#3d3a34] transition-colors disabled:opacity-60"
                  >
                    {savingCuration ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>
            )}

            {/* 큐레이션 목록 */}
            {curations.length === 0 ? (
              <div className="bg-white border border-[#e8e2d9] rounded-2xl p-10 text-center">
                <p className="text-sm text-[#8a8480]">큐레이션이 없습니다.</p>
              </div>
            ) : curations.map((curation) => (
              <div
                key={curation.id}
                className={`bg-white border border-[#e8e2d9] rounded-2xl p-5 space-y-3 ${!curation.is_active ? "opacity-50" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#2c2a26]">
                      {curation.emoji} {curation.title}
                    </p>
                    <p className="text-xs text-[#8a8480] mt-0.5">{curation.subtitle}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                    curation.is_active ? "bg-green-50 text-green-700" : "bg-[#f5f0ea] text-[#9a8c7a]"
                  }`}>
                    {curation.is_active ? "활성" : "비활성"}
                  </span>
                </div>

                <p className="text-xs text-[#8a8480]">
                  분위기: {curation.mood} · 순서: {curation.order_index} · 책 {curation.books?.length ?? 0}권
                </p>

                <div className="flex gap-2">
  <button
    onClick={() => handleCurationEdit(curation)}
    className="px-3 py-1.5 border border-[#e0d9cf] rounded-lg text-xs text-[#8a8480] hover:text-[#2c2a26] hover:border-[#2c2a26] transition-colors"
  >
    수정
  </button>
  {curation.is_active ? (
    <button
      onClick={async () => {
        if (!confirm("비활성화하시겠습니까?")) return;
        const res = await fetch("/api/admin/curations", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: curation.id, permanent: false }),
        });
        if (res.ok) await fetchAll();
      }}
      className="px-3 py-1.5 border border-[#e0d9cf] rounded-lg text-xs text-[#8a8480] hover:text-[#2c2a26] hover:border-[#2c2a26] transition-colors"
    >
      비활성화
    </button>
  ) : (
    <button
      onClick={() => handleCurationRestore(curation.id)}
      className="px-3 py-1.5 border border-green-200 rounded-lg text-xs text-green-600 hover:text-green-800 transition-colors"
    >
      활성화
    </button>
  )}
  <button
    onClick={async () => {
      if (!confirm("삭제하시겠습니까? 복구가 불가능합니다.")) return;
      const res = await fetch("/api/admin/curations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: curation.id, permanent: true }),
      });
      if (res.ok) await fetchAll();
    }}
    className="px-3 py-1.5 border border-red-200 rounded-lg text-xs text-red-400 hover:text-red-600 transition-colors"
  >
    삭제
  </button>
</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}