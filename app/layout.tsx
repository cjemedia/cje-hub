import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ciara J Evans | The CJE Experience",
  description: "Where creativity, clarity, and connection meet. Purpose-driven storytelling, speaking, and strategic visibility.",
  keywords: ["purpose coach", "speaker", "host", "brand strategy", "content creation", "The CJE Experience", "Ciara J Evans"],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
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

