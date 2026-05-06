import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "일오책방 — 팝업 북카페";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#2c2a26",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* 배지 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(201,185,154,0.4)",
            borderRadius: "999px",
            padding: "6px 20px",
            marginBottom: "32px",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <span style={{ color: "#c9b99a", fontSize: "14px", letterSpacing: "0.2em" }}>
            일오책방
          </span>
        </div>

        {/* 메인 텍스트 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#f0ebe3",
            fontSize: "80px",
            fontWeight: 300,
            letterSpacing: "0.15em",
            lineHeight: 1.3,
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          <span>혼자여도</span>
          <span>괜찮은 시간</span>
        </div>

        {/* 구분선 */}
        <div
          style={{
            display: "flex",
            width: "60px",
            height: "1px",
            background: "#c9b99a",
            opacity: 0.5,
            marginBottom: "24px",
          }}
        />

        {/* 서브 텍스트 */}
        <div
          style={{
            display: "flex",
            color: "#a89b87",
            fontSize: "22px",
            letterSpacing: "0.1em",
          }}
        >
          조용히 책 읽고 쉬어가는 팝업 북카페
        </div>

        {/* URL */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "32px",
            color: "#6b6760",
            fontSize: "16px",
            letterSpacing: "0.05em",
          }}
        >
          bookcafe-taupe.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}