import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'B.Y.O.B. — Build Your Own Business',
  description: 'Curated tools, funding, and systems for business owners and entrepreneurs. Save these, share them, and put them to work immediately.',
  url: '/business-resources',
  image: '/images/B.Y.O.B.png',
})

export default function BusinessResourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

