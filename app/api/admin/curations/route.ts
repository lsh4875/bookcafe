import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

const supabase = createAdminSupabaseClient();

export async function GET() {
  const { data, error } = await supabase
    .from("curations")
    .select(`*, books(*)`)
    .order("order_index", { ascending: true })
    .order("order_index", { ascending: true, referencedTable: "books" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, subtitle, emoji, mood, order_index, books } = body;

  const { data: curation, error: curationError } = await supabase
    .from("curations")
    .insert([{ title, subtitle, emoji, mood, order_index: order_index ?? 0 }])
    .select()
    .single();

  if (curationError) {
    console.error("[curation insert error]", curationError);
    return NextResponse.json({ error: curationError.message }, { status: 500 });
  }

  if (books && books.length > 0) {
    const booksWithId = books.map((book: object, i: number) => ({
      ...book,
      curation_id: curation.id,
      order_index: i + 1,
    }));

    const { error: booksError } = await supabase
      .from("books")
      .insert(booksWithId);

    if (booksError) {
      console.error("[books insert error]", booksError);
      return NextResponse.json({ error: booksError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, data: curation });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, books, ...updates } = body;

  const { error } = await supabase
    .from("curations")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("[curation update error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (books) {
    await supabase.from("books").delete().eq("curation_id", id);

    if (books.length > 0) {
      const booksWithId = books.map((book: object, i: number) => ({
        ...book,
        curation_id: id,
        order_index: i + 1,
      }));

      const { error: booksError } = await supabase
        .from("books")
        .insert(booksWithId);

      if (booksError) {
        console.error("[books update error]", booksError);
        return NextResponse.json({ error: booksError.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

// 비활성화
export async function DELETE(req: NextRequest) {
  const { id, permanent } = await req.json();

  if (permanent) {
    // 완전 삭제 (books는 cascade로 자동 삭제)
    const { error } = await supabase
      .from("curations")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    // 비활성화
    const { error } = await supabase
      .from("curations")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}