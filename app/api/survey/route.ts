import { NextRequest, NextResponse } from "next/server";

const FORM_URL = `https://docs.google.com/forms/d/e/1FAIpQLSe5wKU7fjRJYGfRIvzncHiyra3kh0_FPU5B6tQ6m-Ews7bK7w/formResponse`;

export async function POST(req: NextRequest) {
  const body = await req.json();

  const formData = new FormData();
  
  // 장르 (복수선택 - 값을 각각 따로 추가)
  if (Array.isArray(body.genre)) {
    body.genre.forEach((g: string) => {
      formData.append("entry.1348817241", g);
    });
  }

  // 나머지 단일선택
  formData.append("entry.2076349614", body.expectation ?? "");
  formData.append("entry.697414584", body.intention ?? "");
  formData.append("entry.1731069672", body.price ?? "");
  formData.append("entry.1701641573", body.region ?? "");

  await fetch(FORM_URL, {
    method: "POST",
    body: formData,
  });

  return NextResponse.json({ success: true });
}