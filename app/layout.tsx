import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ciara J Evans | CJE Media & Experiences",
  description: "Where creativity, clarity, and connection meet. Marketing agency and event experiences for purpose-driven brands.",
  keywords: ["marketing agency", "event planning", "brand strategy", "content creation", "CJE Media", "CJE Experiences"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="smooth-scroll">
      <body>{children}</body>
    </html>
  );
}

