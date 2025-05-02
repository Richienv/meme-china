import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// You can use Noto Sans SC from Google Fonts directly
const notoSansSC = Geist({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  // In a real application, you would include Chinese character subsets
  // but for simplicity, we're using what's available in the Geist font
});

export const metadata: Metadata = {
  title: "Chinese Memory Cards",
  description: "Create and review personalized Chinese language memory cards with images",
  keywords: ["Chinese", "Mandarin", "Language Learning", "Flashcards", "Memory Cards"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansSC.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
