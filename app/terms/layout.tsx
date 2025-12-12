import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Terms of Service',
  description: 'Terms of service for Ciara J. Evans and The CJE Experience.',
  url: '/terms',
  noIndex: true,
})

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

