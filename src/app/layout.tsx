import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
