import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import { generateMetadata as genMeta } from "@/lib/metadata";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  ...genMeta({
    title: "Ciara J. Evans | The CJE Experience",
    description: "Where creativity, clarity, and connection meet. Purpose-driven storytelling, speaking, and strategic visibility.",
    url: "/",
    image: "/images/og-image.png", // OG image should be 1200x630 pixels
  }),
  keywords: ["purpose coach", "speaker", "host", "brand strategy", "content creation", "The CJE Experience", "Ciara J. Evans"],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  verification: {
    google: "572Yfb-jf0R8icJWgZnwYR7Ii9zCIEHhmqzHMIBJGQA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Ciara J. Evans",
    "url": "https://www.ciarajevans.com",
    "image": "https://www.ciarajevans.com/images/cje19.png",
    "jobTitle": "Speaker, Host, Purpose Coach",
    "description": "Where creativity, clarity, and connection meet. Purpose-driven storytelling, speaking, and strategic visibility.",
    "sameAs": [
      "https://instagram.com/ciaraj.media",
      "https://linkedin.com/in/ciarajevans"
    ],
    "knowsAbout": ["Public Speaking", "Coaching", "Brand Strategy", "Event Hosting", "Content Creation"]
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The CJE Experience",
    "url": "https://www.ciarajevans.com",
    "logo": "https://www.ciarajevans.com/images/cje-logo.png",
    "description": "Purpose-driven storytelling, speaking, and strategic visibility.",
    "founder": {
      "@type": "Person",
      "name": "Ciara J. Evans"
    }
  }

  return (
    <html lang="en" className="smooth-scroll">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

