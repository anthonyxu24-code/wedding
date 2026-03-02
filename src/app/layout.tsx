import type { Metadata } from "next";
import { Noto_Serif_JP, Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cindy & Anthony · April 10, 2026",
  description:
    "We sincerely invite you and your family to join us at Four Seasons Hotel Kyoto.",
  openGraph: {
    title: "Cindy & Anthony · Wedding",
    description:
      "We sincerely invite you and your family to join us at Four Seasons Hotel Kyoto. April 10, 2026.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${notoSerif.variable} ${notoSans.variable}`}>
      <body className="antialiased min-h-screen font-sans">{children}</body>
    </html>
  );
}
