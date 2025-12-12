import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Partnerships',
  description: 'Partner with Ciara J. Evans for brand collaborations, speaking engagements, and strategic partnerships.',
  url: '/partnerships',
})

export default function PartnershipsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

