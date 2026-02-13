import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DCF Valuation Dashboard",
  description: "DCF法（FCFFベース）による理論株価算出ツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
