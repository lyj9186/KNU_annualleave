import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "연차 관리",
  description: "사내 연차 신청·승인·관리 시스템",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
