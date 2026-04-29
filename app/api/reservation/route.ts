import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// ─── Google Sheets 연동 설정 ──────────────────────────────────────────────────
// 필요 환경변수 (.env.local):
//   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
//   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
//   GOOGLE_SHEET_ID=your_spreadsheet_id

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEET_NAME = "예약"; // 시트 탭 이름

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  });
  return auth.getClient();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      timeSlot,
      headcount,
      note,
      popup,
      place,
      submittedAt,
    } = body;

    // ── 유효성 검사 ──────────────────────────────────────────────────────────
    if (!name || !phone || !email || !timeSlot) {
      return NextResponse.json(
        { error: "필수 항목이 누락됐습니다." },
        { status: 400 }
      );
    }

    // ── Google Sheets 기록 ───────────────────────────────────────────────────
    const auth = await getAuthClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    const sheetId = process.env.GOOGLE_SHEET_ID;

    // 헤더 행이 없을 경우 자동 생성 (첫 실행 시)
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A1:I1`,
    });

    const hasHeader =
      sheetData.data.values && sheetData.data.values.length > 0;

    if (!hasHeader) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              "제출일시",
              "팝업명",
              "장소",
              "이름",
              "연락처",
              "이메일",
              "시간대",
              "인원",
              "전달사항",
            ],
          ],
        },
      });
    }

    // 데이터 행 추가
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A:I`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            new Date(submittedAt).toLocaleString("ko-KR", {
              timeZone: "Asia/Seoul",
            }),
            popup,
            place,
            name,
            phone,
            email,
            timeSlot,
            headcount,
            note || "",
          ],
        ],
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[reservation API error]", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
