import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Privacy Policy',
  description: 'Privacy policy for Ciara J. Evans and The CJE Experience.',
  url: '/privacy',
  noIndex: true,
})

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

