import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CJE Content Days. Book Yours | CJE Media',
  description:
    '1-2 hour shoot. 2 edited reels. All raw footage. 48-hour turnaround. One flat price: $200. Limited spots. Book your Content Day today.',
  openGraph: {
    title: 'CJE Content Days. Book Yours',
    description:
      '1-2 hour shoot · 2 edited reels · all raw footage · 48-hour turnaround · $200',
    type: 'website',
    url: 'https://www.ciarajevans.com/content-days',
    siteName: 'CJE Media',
    images: [
      {
        // Drop a 1200x630 image at /public/images/cje-content-days-og.png to
        // override this. Until then it falls back to the site default.
        url: '/images/cje-content-days-og.png',
        width: 1200,
        height: 630,
        alt: 'CJE Content Days. $200. 1-2 hour shoot, 2 edited reels, all raw footage, 48-hour turnaround',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CJE Content Days. Book Yours',
    description:
      '1-2 hour shoot · 2 edited reels · all raw footage · 48-hour turnaround · $200',
    images: ['/images/cje-content-days-og.png'],
  },
  robots: {
    // Not indexed: this is a shared-link funnel, not a discoverable page.
    index: false,
    follow: false,
  },
}

export default function ContentDaysLayout({ children }: { children: React.ReactNode }) {
  return children
}
