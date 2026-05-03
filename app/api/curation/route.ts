import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

const supabase = createAdminSupabaseClient();

// 전체 큐레이션 목록 조회 (books 포함)
export async function GET() {
  const { data, error } = await supabase
    .from("curations")
    .select(`
      *,
      books (*)
    `)
    .eq("is_active", true)
    .order("order_index", { ascending: true })
    .order("order_index", { ascending: true, referencedTable: "books" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// 큐레이션 추가
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, subtitle, emoji, mood, books } = body;

  // 큐레이션 insert
  const { data: curation, error: curationError } = await supabase
    .from("curations")
    .insert([{ title, subtitle, emoji, mood }])
    .select()
    .single();

  if (curationError) {
    return NextResponse.json({ error: curationError.message }, { status: 500 });
  }

  // books insert
  if (books && books.length > 0) {
    const booksWithCurationId = books.map((book: object, i: number) => ({
      ...book,
      curation_id: curation.id,
      order_index: i + 1,
    }));

    const { error: booksError } = await supabase
      .from("books")
      .insert(booksWithCurationId);

    if (booksError) {
      return NextResponse.json({ error: booksError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, data: curation });
}

// 큐레이션 수정
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;

  const { error } = await supabase
    .from("curations")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// 큐레이션 삭제 (비활성화)
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  const { error } = await supabase
    .from("curations")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}