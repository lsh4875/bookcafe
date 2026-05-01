import type { Metadata } from "next";
import { Noto_Serif_KR, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const notoSerif = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-serif",
});

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "일오책방",
  description: "혼자여도 괜찮은 시간 — 조용히 책 읽고 쉬어가는 팝업 북카페",
  keywords: ["북카페", "팝업", "독서", "일오책방", "부천"],
  openGraph: {
    title: "일오책방",
    description: "혼자여도 괜찮은 시간 — 조용히 책 읽고 쉬어가는 팝업 북카페",
    url: "https://bookcafe-taupe.vercel.app",
    siteName: "일오책방",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "일오책방 — 팝업 북카페",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "일오책방",
    description: "혼자여도 괜찮은 시간 — 조용히 책 읽고 쉬어가는 팝업 북카페",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${notoSerif.variable} ${notoSans.variable}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
